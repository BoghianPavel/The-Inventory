from fastapi import FastAPI
from app.database.connection import engine, Base
from app.models import supplier, warehouse, product
from app.routes import suppliers, warehouses, products

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(warehouses.router)
app.include_router(suppliers.router)
app.include_router(products.router)

@app.get("/")
def root():
    return {"message": "Hello, World!"}