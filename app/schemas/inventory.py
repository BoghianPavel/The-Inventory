from pydantic import BaseModel, Field

class StockIncrease(BaseModel):
    quantity: int = Field(..., gt=0, description="Cantitatea de produse adăugată în stoc")
    supplierId: str = Field(..., description="ID-ul furnizorului de la care provine stocul")

class StockDecrease(BaseModel):
    quantity: int = Field(..., gt=0, description="Cantitatea de produse scoasă din stoc")
    reason: str = Field(..., description="Motivul pentru care stocul a fost scăzut")

class StockTransfer(BaseModel):
    quantity: int = Field(..., gt=0, description="Cantitatea de produse transferată")
    targetWarehouseId: str = Field(..., description="ID-ul depozitului țintă")
    reason: str = Field(..., description="Motivul pentru care stocul a fost transferat")
