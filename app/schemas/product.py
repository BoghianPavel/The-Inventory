from pydantic import BaseModel, Field
from typing import Optional

class ProductBase(BaseModel):
    name: str = Field(..., min_length=3, description="Numele produsului")
    sku: str = Field(..., min_length=3, description="Codul SKU al produsului")
    description: str = Field(..., description="Descrierea produsului")
    price: float = Field(..., gt=0, description="Prețul produsului")
    category: str = Field(..., description="Categoria produsului")
    stockQuantity: int = Field(..., ge=0, description="Cantitatea de produse în stoc")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, description="Numele produsului")
    sku: Optional[str] = Field(None, min_length=3, description="Codul SKU al produsului")
    description: Optional[str] = Field(None, description="Descrierea produsului")
    price: Optional[float] = Field(None, gt=0, description="Prețul produsului")
    category: Optional[str] = Field(None, description="Categoria produsului")
    stockQuantity: Optional[int] = Field(None, ge=0, description="Cantitatea de produse în stoc")
