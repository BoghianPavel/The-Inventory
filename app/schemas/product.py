from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: str
    sku: str
    description: str
    price: float
    category: str
    stockQuantity: int
    
class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stockQuantity: Optional[int] = None

class ProductResponse(ProductBase):
    id: str
