from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/api/warehouses/{warehouseId}/products", tags=["Products"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_product(warehouseId: int, data: ProductCreate, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(warehouseId == Warehouse.id).first()

    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    product = Product(
        name = data.name,
        sku = data.sku,
        description = data.description,
        price = data.price,
        category = data.category,
        stockQuantity = data.stockQuantity,
        warehouse_id = warehouseId
    ) 

    db.add(product)
    db.commit()
    db.refresh(product)

    return {
        "id": product.id,
        "message": "Product created successfully"
    }

@router.get("/")
def get_products(warehouseId: int, db: Session = Depends(get_db)):
    products = db.query(Product).filter(warehouseId == Product.warehouse_id).all()
    result = []

    for p in products:
        result.append({
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "price": p.price,
            "stockQuantity": p.stockQuantity
        })
    
    return result

@router.get("/{productId}")
def get_product(warehouseId: int, productId: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(warehouseId == Product.warehouse_id, Product.id == productId).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product

@router.patch("/{productId}")
def patch_product(warehouseId: int, productId: str, data: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(warehouseId == Product.warehouse_id, productId == Product.id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if data.stockQuantity is not None:
        raise HTTPException(status_code=400, detail="Bad request")

    if data.name == product.name and data.sku == product.sku and data.description == product.description and data.price == product.price and data.category == product.category:
        raise HTTPException(status_code=400, detail="Warning! No change detected")

    if data.name is not None: product.name = data.name
    if data.sku is not None: product.sku = data.sku
    if data.description is not None: product.description = data.description
    if data.price is not None: product.price = data.price
    if data.category is not None: product.category = data.category

    db.commit()
    db.refresh(product)

    return {
        "message": "Product updated successfully"
    }

@router.put("/{productId}")
def put_product(warehouseId: int, productId: str, data: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(warehouseId == Product.warehouse_id, productId == Product.id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if data.stockQuantity is not None:
        raise HTTPException(status_code=400, detail="Bad request")
    
    if data.name == product.name and data.sku == product.sku and data.description == product.description and data.price == product.price and data.category == product.category:
        raise HTTPException(status_code=400, detail="Warning! No change detected")
    
    product.name = data.name
    product.sku = data.sku
    product.description = data.description
    product.price = data.price
    product.category = data.category

    db.commit()
    db.refresh(product)

    return {
        "message": "Product updated successfully"
    }

@router.delete("/{productId}")
def delete_product(warehouseId: int, productId: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(warehouseId == Product.warehouse_id, productId == Product.id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }