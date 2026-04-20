"""
DTOs para la generación de recetas con LLM.
Define estructuras de datos para recetas e ingredientes con validación.
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


# =====================
# PRODUCT DTO (input only, not sent as response_format)
# =====================

class ProductDto(BaseModel):
    id: int
    name: str
    isVegetarian: bool = True
    isVegan: bool = True
    mustInclude: bool = False
    availableQuantity: Optional[float] = None
    unit: Optional[str] = None


# =====================
# ENUMS (used as input parameters only)
# =====================

class Difficulty(str, Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class CuisineType(str, Enum):
    SPANISH = "SPANISH"
    ITALIAN = "ITALIAN"
    FRENCH = "FRENCH"
    MEXICAN = "MEXICAN"
    ASIAN = "ASIAN"
    JAPANESE = "JAPANESE"
    CHINESE = "CHINESE"
    MEDITERRANEAN = "MEDITERRANEAN"
    AMERICAN = "AMERICAN"
    OTHER = "OTHER"


class DietType(str, Enum):
    STANDARD = "STANDARD"
    VEGETARIAN = "VEGETARIAN"
    VEGAN = "VEGAN"
    GLUTEN_FREE = "GLUTEN_FREE"
    DAIRY_FREE = "DAIRY_FREE"
    KETO = "KETO"
    PALEO = "PALEO"
    OTHER = "OTHER"


class MealType(str, Enum):
    BREAKFAST = "BREAKFAST"
    LUNCH = "LUNCH"
    DINNER = "DINNER"
    SNACK = "SNACK"
    DESSERT = "DESSERT"


class SeasonType(str, Enum):
    SPRING = "SPRING"
    SUMMER = "SUMMER"
    AUTUMN = "AUTUMN"
    WINTER = "WINTER"
    ALL_YEAR = "ALL_YEAR"


# =====================
# RESPONSE DTOs (simplified for LLM grammar generation)
# =====================

class IngredientUnit(str, Enum):
    G = "G"
    KG = "KG"
    ML = "ML"
    L = "L"
    UNIT = "UNIT"


class RecipeIngredientDto(BaseModel):
    name: str = Field(description="Nombre del ingrediente")
    quantityValue: float = Field(description="Cantidad para la receta completa según el número de raciones. Ejemplos por ración: carne/pescado 150-200G, verduras base 60-100G, pasta/arroz secos 80-100G, aceite 10-15ML, huevos 1-2 UNIT. Multiplica por las raciones.")
    unit: IngredientUnit = Field(description="Usa la misma unidad que tiene el producto en la lista (G, KG, ML, L). Usa UNIT solo si el producto no tiene unidad definida.")
    notes: Optional[str] = Field(default=None, description="Preparación especial del ingrediente, por ejemplo 'picado fino' o 'en rodajas'")
    productId: int = Field(description="ID exacto del producto de la lista")


class RecipeDto(BaseModel):
    title: str = Field(description="Nombre culinario del plato, como se llamaría en un recetario. Ejemplos: 'Paella valenciana', 'Tortilla de patatas', 'Risotto de setas'. No usar títulos genéricos como 'Receta vegetariana' o 'Plato saludable'.")
    description: str = Field(description="Descripción breve y apetecible del plato. Hablar del sabor, textura o presentación. No repetir el título ni listar ingredientes. PROHIBIDO mencionar ingredientes que no estén en la lista de ingredientes de la receta.")
    servings: int = Field(description="Número de raciones")
    preparationMinutes: int = Field(description="Tiempo de preparación en minutos")
    cookingMinutes: int = Field(description="Tiempo de cocción en minutos")
    difficulty: Difficulty = Field(description="Nivel de dificultad real del plato. EASY=técnicas básicas y pocos pasos. MEDIUM=varias elaboraciones. HARD=técnicas avanzadas o timing preciso.")
    cuisineType: CuisineType = Field(description="Tradición culinaria del plato. Solo asigna un valor específico si el plato pertenece CLARAMENTE a esa cultura (paella→SPANISH, pizza→ITALIAN, tacos→MEXICAN). Si es genérico o ambiguo, usa OTHER.")
    dietType: DietType = Field(description="Tipo de dieta que cumple la receta.")
    mealType: MealType = Field(description="Momento del día adecuado para este plato. BREAKFAST=desayuno ligero (tostadas, batidos, huevos). LUNCH=comida principal contundente (pasta, arroz, carnes, legumbres, potajes, tortilla de patatas, paella). DINNER=cena ligera (sopas, ensaladas, verduras, pescado a la plancha). SNACK=tentempié. DESSERT=postre. Un plato caliente y contundente SIEMPRE es LUNCH o DINNER, nunca BREAKFAST.")
    seasonType: SeasonType = Field(description="Temporada recomendada. Solo asigna una temporada específica si el plato está claramente asociado a ella (gazpacho→SUMMER, cocido→WINTER). Si no es evidente, usa ALL_YEAR.")
    vegetarian: bool = Field(description="Si es vegetariana")
    vegan: bool = Field(description="Si es vegana")
    instructions: str = Field(description="Pasos numerados para cocinar la receta, separados por saltos de línea. Ejemplo: '1. Pela y corta las patatas.\n2. Calienta aceite en una sartén.\n3. ...'. Cada paso en su propia línea. Sin listas de ingredientes. Sin IDs.")
    ingredients: list[RecipeIngredientDto] = Field(description="Lista de ingredientes")