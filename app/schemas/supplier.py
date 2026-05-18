from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class SupplierBase(BaseModel):
    name: str = Field(..., min_length=3, description="Numele furnizorului")
    contact_email: EmailStr = Field(..., description="Emailul de contact al furnizorului")

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, description="Numele furnizorului")
    contact_email: Optional[EmailStr] = Field(None, description="Emailul de contact al furnizorului")
