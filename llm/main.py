import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

from routers import recipe_router

# Cargar variables de entorno desde .env
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

app = FastAPI(title="SmartFridge LLM Service")

app.include_router(recipe_router.router)
