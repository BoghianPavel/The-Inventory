from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.warehouse import Warehouse
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseResponse

router = APIRouter(prefix = "/api/warehouses", tags = ["Warehouses"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_warehouse(data: WarehouseCreate, db: Session = Depends(get_db)):
    warehouse = Warehouse(
        name = data.name,
        location = data.location
    )

    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)

    return {
        "message": "Warehouse created successfully",
        "id": f"W{warehouse.id}"
    }

@router.get("/")
def get_warehouses(db: Session = Depends(get_db)):
    warehouses = db.query(Warehouse).all()
    
    result = []
    for w in warehouses:
        result.append({
            "id": f"W{w.id}",
            "name": w.name,
            "location": w.location
        })
    
    return result

@router.get("/{warehouseId}")
def get_warehouse(warehouseId: int, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouseId).first()

    if not warehouse:
        raise HTTPException(status_code = 404, detail = "Warehouse not found")
    
    return {
        "id": f"W{warehouseId}",
        "name": warehouse.name,
        "location": warehouse.location
    }

@router.patch("/{warehouseId}")
def update_warehouse(warehouseId: int, data: WarehouseUpdate, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouseId).first()

    if not warehouse:
        raise HTTPException(status_code = 404, detail = "Warehouse not found")

    if data.name is not None: warehouse.name = data.name
    if data.location is not None: warehouse.location = data.location

    db.commit()
    db.refresh(warehouse)

    return {
        "message": "Warehouse updated successfully"
    }

@router.put("/{warehouseId}")
def put_warehouse(warehouseId: int, data: WarehouseUpdate, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouseId).first()

    if not warehouse:
        raise HTTPException(status_code = 404, detail = "Warehouse not found")
    
    warehouse.name = data.name
    warehouse.location = data.location
    
    db.commit()
    db.refresh(warehouse)
    
    return {
        "message": "Warehouse updated successfully"
    }

@router.delete("/{warehouseId}")
def delete_warehouse(warehouseId: int, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouseId).first()

    if not warehouse:
        raise HTTPException(status_code = 404, detail = "Warehouse not found")
    
    db.delete(warehouse)
    db.commit()

    return {
        "message": "Warehouse deleted successfully"
    }   
