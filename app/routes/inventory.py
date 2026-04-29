from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.product import Product
from app.schemas.inventory import StockIncrease, StockDecrease, StockTransfer

router = APIRouter(prefix="/api/warehouses/{warehouseId}/inventory", tags=["Inventory"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_inventory(warehouseId: int, db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.warehouse_id == warehouseId).all()
    result = []

    for p in products:
        result.append({
            "productId": p.id,
            "sku": p.sku,
            "stockQuantity": p.stockQuantity
        })

    return result

@router.get("/{productId}")
def get_product_inventory(warehouseId: int, productId: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.warehouse_id == warehouseId, Product.id == productId).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "productId": product.id,
        "sku": product.sku,
        "stockQuantity": product.stockQuantity
    }

@router.post("/{productId}/increase")
def increase_stock(warehouseId: int, productId: str, data: StockIncrease, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.warehouse_id == warehouseId, Product.id == productId).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if data.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero")

    product.stockQuantity += data.quantity
    db.commit()
    db.refresh(product)

    return {
        "message": "Stock increased successfully",
        "newStockQuantity": product.stockQuantity
    }

@router.post("/{productId}/decrease")
def decrease_stock(warehouseId: int, productId: str, data: StockDecrease, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.warehouse_id == warehouseId, Product.id == productId).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stockQuantity < data.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    if data.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero")

    product.stockQuantity -= data.quantity
    db.commit()
    db.refresh(product)

    return {
        "message": "Stock decreased successfully",
        "newStockQuantity": product.stockQuantity
    }

@router.post("/{productId}/transfer")
def transfer_stock(warehouseId: int, productId: str, data: StockTransfer, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.warehouse_id == warehouseId, Product.id == productId).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stockQuantity < data.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    target_w_id = int(data.targetWarehouseId.replace("W", ""))

    if target_w_id == warehouseId:
        raise HTTPException(status_code=400, detail="Source and target warehouses must be different")

    target_product = db.query(Product).filter(Product.warehouse_id == target_w_id, Product.sku == product.sku).first()

    if not target_product:
        target_product = Product(
            warehouse_id = target_w_id,
            name = product.name,
            sku = product.sku,
            description = product.description,
            price = product.price,
            category = product.category,
            stockQuantity = data.quantity
        )
        db.add(target_product)
    else:
        target_product.stockQuantity += data.quantity
    
    product.stockQuantity -= data.quantity
    db.commit()
    db.refresh(product)
    db.refresh(target_product)

    return {
        "message": "Stock transferred successfully",
        "newStockQuantitySource": product.stockQuantity,
        "newStockQuantityTarget": target_product.stockQuantity
    }
