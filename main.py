from fastapi import FastAPI
from app.database.connection import engine, Base
from app.models import warehouse
from app.routes import warehouses

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(warehouses.router)

@app.get("/")
def root():
    return {"message": "Hello, World!"}