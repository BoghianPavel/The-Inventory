from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.warehouse import Warehouse
from app.schemas.warehouse import WarehouseCreate

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

@router.get("/{warehouse_id}")
def get_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()

    if not warehouse:
        return {"message": "Warehouse not found"}
    
    return {
        "id": f"W{warehouse_id}",
        "name": warehouse.name,
        "location": warehouse.location
    }