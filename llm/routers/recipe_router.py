from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from dtos import CuisineType, Difficulty, DietType, MealType, ProductDto, RecipeDto, SeasonType
from recipe_generator import generate_recipe

router = APIRouter(prefix="/generate-recipe", tags=["recipes"])


class GenerateRecipeRequest(BaseModel):
    products: list[ProductDto]
    difficulty: Optional[Difficulty] = None
    cuisine_type: Optional[CuisineType] = None
    diet_type: Optional[DietType] = None
    meal_type: Optional[MealType] = None
    season_type: Optional[SeasonType] = None
    servings: Optional[int] = None
    is_vegetarian: Optional[bool] = None
    is_vegan: Optional[bool] = None
    exclude_titles: Optional[list[str]] = None
    locale: str = "es"


@router.post("", response_model=RecipeDto)
def generate_recipe_endpoint(request: GenerateRecipeRequest) -> RecipeDto:
    try:
        return generate_recipe(
            products=request.products,
            difficulty=request.difficulty,
            cuisine_type=request.cuisine_type,
            diet_type=request.diet_type,
            meal_type=request.meal_type,
            season_type=request.season_type,
            servings=request.servings,
            is_vegetarian=request.is_vegetarian,
            is_vegan=request.is_vegan,
            exclude_titles=request.exclude_titles,
            locale=request.locale,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
