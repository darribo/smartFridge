import difflib
import os
import re
from pathlib import Path

from openai import OpenAI
from dotenv import load_dotenv

from dtos import (
    RecipeDto,
    ProductDto,
    Difficulty,
    CuisineType,
    DietType,
    MealType,
    SeasonType,
    IngredientUnit,
)

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

client = OpenAI(
    base_url=os.getenv("LLM_BASE_URL", "https://irlab.org/inference-olorin"),
    api_key=os.getenv("OPENAI_API_KEY")
)

LOCALE_INSTRUCTIONS = {
    "es": "Responde siempre en español.",
    "en": "Always respond in English.",
    "gl": "Responde sempre en galego.",
}

def _find_product_by_name(name: str, products: list[ProductDto]) -> ProductDto | None:
    name_lower = name.lower()
    for p in products:
        if p.name.lower() == name_lower:
            return p
    for p in products:
        if name_lower in p.name.lower() or p.name.lower() in name_lower:
            return p
    names = [p.name.lower() for p in products]
    matches = difflib.get_close_matches(name_lower, names, n=1, cutoff=0.6)
    if matches:
        for p in products:
            if p.name.lower() == matches[0]:
                return p
    return None


def _post_process(recipe: RecipeDto, products: list[ProductDto]) -> RecipeDto:
    product_map = {p.id: p for p in products}

    for ing in recipe.ingredients:
        product = product_map.get(ing.productId)

        # Fix wrong productId: if ID doesn't exist or name doesn't match, find by name
        if not product:
            product = _find_product_by_name(ing.name, products)
            if product:
                print(f"[post-process] ID inválido para '{ing.name}' → asignado ID {product.id} ({product.name})")
                ing.productId = product.id
            else:
                print(f"[post-process] No se encontró producto para '{ing.name}' (ID={ing.productId})")
        elif product.name.lower() not in ing.name.lower() and ing.name.lower() not in product.name.lower():
            better = _find_product_by_name(ing.name, products)
            if better:
                print(f"[post-process] ID incorrecto para '{ing.name}': era {ing.productId} ({product.name}) → corregido a {better.id} ({better.name})")
                ing.productId = better.id
                product = better
            else:
                print(f"[post-process] No se pudo corregir '{ing.name}' (ID={ing.productId} → {product.name})")

        if not product:
            continue

        # Force unit to match exactly the product's storage unit
        if product.unit:
            ing.unit = IngredientUnit(product.unit)

        # Cap quantity to available stock
        if product.availableQuantity is not None and ing.quantityValue > product.availableQuantity:
            ing.quantityValue = product.availableQuantity

    # Ensure numbered steps are separated by newlines
    recipe.instructions = re.sub(r'\s+(\d+\.)\s+', r'\n\1 ', recipe.instructions).strip()
    recipe.description = re.sub(r'\s+(\d+\.)\s+', r'\n\1 ', recipe.description).strip()

    # Fix vegetarian/vegan flags based on actual ingredients
    linked = [product_map.get(ing.productId) for ing in recipe.ingredients]
    linked = [p for p in linked if p is not None]
    if linked:
        recipe.vegetarian = all(p.isVegetarian for p in linked)
        recipe.vegan = all(p.isVegan for p in linked)

    return recipe


def generate_recipe(
    products: list[ProductDto],
    difficulty: Difficulty | None = None,
    cuisine_type: CuisineType | None = None,
    diet_type: DietType | None = None,
    meal_type: MealType | None = None,
    season_type: SeasonType | None = None,
    servings: int | None = None,
    is_vegetarian: bool | None = None,
    is_vegan: bool | None = None,
    exclude_titles: list[str] | None = None,
    locale: str = "es",
):
    available_products = products

    if is_vegan:
        available_products = [p for p in available_products if p.isVegan]
    elif is_vegetarian:
        available_products = [p for p in available_products if p.isVegetarian]

    def product_info(p: ProductDto) -> str:
        parts = []
        if p.unit:
            parts.append(f"unit={p.unit}")
            if p.availableQuantity is not None:
                parts.append(f"stock={p.availableQuantity:g}{p.unit}")
        if p.isVegan:
            parts.append("vegano")
        elif p.isVegetarian:
            parts.append("vegetariano")
        return f" [{', '.join(parts)}]" if parts else ""

    products_text = "\n".join(
        [f"- ID: {p.id}, Nombre: {p.name}{product_info(p)}" for p in available_products]
    )

    must_include_products = [p for p in available_products if p.mustInclude]
    must_include_msg = ""
    if must_include_products:
        names = ", ".join(p.name for p in must_include_products)
        must_include_msg = (
            f"\nPRODUCTOS OBLIGATORIOS: incluye SIEMPRE: {names}. "
            "Complementa con otros productos de la lista si tienen sentido culinario."
        )

    dietary_msg = ""
    if is_vegan:
        dietary_msg = "\nRESTRICCIÓN: receta VEGANA. Los productos ya han sido filtrados."
    elif is_vegetarian:
        dietary_msg = "\nRESTRICCIÓN: receta VEGETARIANA. Los productos ya han sido filtrados."

    exclude_msg = ""
    if exclude_titles:
        titles_list = "\n".join(f"- {t}" for t in exclude_titles)
        exclude_msg = (
            f"\nRECETAS A EVITAR: NO generes ninguna de estas recetas ni variantes obvias:\n{titles_list}"
        )

    specifications = []
    if difficulty:
        specifications.append(f"Dificultad: {difficulty}")
    if cuisine_type:
        specifications.append(f"Tipo de cocina: {cuisine_type}")
    if diet_type:
        specifications.append(f"Tipo de dieta: {diet_type}")
    if meal_type:
        specifications.append(f"Tipo de comida: {meal_type}")
    if season_type:
        specifications.append(f"Temporada: {season_type}")
    if servings:
        specifications.append(f"Raciones: {servings} personas")

    specs_text = "\n".join(specifications) if specifications else "Sin especificaciones particulares"

    servings_msg = ""
    if servings:
        servings_msg = (
            f"\nCANTIDADES: calcula cada ingrediente para {servings} personas "
            f"usando cantidades de libro de recetas (no el stock disponible)."
        )

    try:
        completion = client.beta.chat.completions.parse(
            temperature=0,
            model=os.getenv("LLM_MODEL", "llama3.2:3b"),
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Eres un generador inteligente de recetas. Debes crear recetas lógicas y coherentes a partir de los productos disponibles. Esto no significa que tengas que usar todos, sino que debes seleccionar los más adecuados para crear una receta realista y atractiva.\n\n"
                        "REGLAS:\n"
                        "1. SOLO puedes usar productos de la lista. Cada ingrediente DEBE tener el productId exacto de la lista. "
                        "Prohibido inventar ingredientes aunque sean básicos. Cuando expliques en la descripción cómo se prepara el plato, "
                        "asegúrate de que los ingredientes utilizados estén en la lista. No puedes usar ninguno que no esté porque el usuario no los podrá usar.\n"
                        "2. Elige ingredientes que combinen bien y tengan sentido culinario juntos. No mezcles ingredientes que no tengan sentido juntos. Es crítico que la receta resultante sea realista y apetecible, no una mezcla aleatoria de ingredientes disponibles. Que tenga sentido\n"
                        "3. La unidad de cada ingrediente DEBE ser exactamente el valor 'unit' del producto en la lista. "
                        "Si el producto tiene unit=KG, usa KG y expresa la cantidad en KG (ej: 0.8). "
                        "Si tiene unit=G, usa G (ej: 200). Si tiene unit=ML, usa ML. Si tiene unit=L, usa L. "
                        "NUNCA uses una unidad distinta a la del producto.\n"
                        "4 El título es solo el nombre del plato. Las instrucciones son pasos numerados con salto de línea, "
                        "sin IDs ni listas de ingredientes dentro.\n\n"
                        f"{LOCALE_INSTRUCTIONS.get(locale, LOCALE_INSTRUCTIONS['es'])}"
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"Genera una receta lógica y coherente con estos productos.\n"
                        f"ESPECIFICACIONES:\n{specs_text}"
                        f"{servings_msg}"
                        f"{dietary_msg}"
                        f"{exclude_msg}"
                        f"{must_include_msg}\n\n"
                        f"PRODUCTOS DISPONIBLES:\n{products_text}"
                    )
                }
            ],
            response_format=RecipeDto,
        )

        parsed_message = completion.choices[0].message

        if parsed_message.parsed:
            return _post_process(parsed_message.parsed, available_products)
        elif parsed_message.refusal:
            raise Exception(f"El modelo rechazó generar la receta: {parsed_message.refusal}")
        else:
            raise Exception("No se pudo parsear la respuesta del modelo")

    except Exception as e:
        print(f"Error generando receta: {e}")
        raise