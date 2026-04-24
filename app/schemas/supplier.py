from pydantic import BaseModel
from typing import Optional

class SupplierBase(BaseModel):
    name: str
    contact_email: str

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_email: Optional[str] = None

class SupplierResponse(SupplierBase):
    id: int