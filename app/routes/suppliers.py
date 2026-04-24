from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse

router = APIRouter(prefix = "/api/suppliers", tags = ["Suppliers"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    
@router.post("/")
def create_supplier(data: SupplierCreate, db: Session = Depends(get_db)):
    supplier = Supplier(
        name = data.name,
        contact_email = data.contact_email
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return {
        "message": "Supplier created successfully",
        "id": f"S{supplier.id}"
    }

@router.get("/")
def get_suppliers(db: Session = Depends(get_db)):
    supplier = db.query(Supplier).all()
    result = []

    for s in supplier:
        result.append({
            "id": f"S{s.id}",
            "name": s.name,
            "contact_email": s.contact_email
        })
    return result

@router.get("/{supplierId}")
def get_supplier(supplierId: int, db: Session = Depends(get_db)):
    supplier = db.query(Supplier).filter(Supplier.id == supplierId).first()

    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    return {
        "id": f"S{supplier.id}",
        "name": supplier.name,
        "contact_email": supplier.contact_email
    }

@router.patch("/{supplierId}")
def patch_supplier(supplierId: int, data: SupplierUpdate, db: Session = Depends(get_db)):
    supplier = db.query(Supplier).filter(Supplier.id == supplierId).first()

    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    if data.name is not None:
        supplier.name = data.name
    if data.contact_email is not None:
        supplier.contact_email = data.contact_email

    db.commit()
    db.refresh(supplier)

    return {
        "message": "Supplier updated successfully"
    }

@router.put("/{supplierId}")
def put_supplier(supplierId: int, data: SupplierUpdate, db: Session = Depends(get_db)):
    supplier = db.query(Supplier).filter(Supplier.id == supplierId).first()

    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    supplier.name = data.name
    supplier.contact_email = data.contact_email

    db.commit()
    db.refresh(supplier)

    return {
        "message": "Supplier updated successfully"
    }

@router.delete("/{supplierId}")
def delete_supplier(supplierId: int, db: Session = Depends(get_db)):
    supplier = db.query(Supplier).filter(Supplier.id == supplierId).first()

    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    db.delete(supplier)
    db.commit()

    return {
        "message": "Supplier deleted successfully"
    }