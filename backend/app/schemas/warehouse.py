from pydantic import BaseModel, Field
from typing import Optional

class WarehouseBase(BaseModel):
    name: str = Field(..., min_length=3, description="Numele depozitului")
    location: str = Field(..., description="Locația depozitului")

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, description="Numele depozitului")
    location: Optional[str] = Field(None, description="Locația depozitului")