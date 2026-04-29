from pydantic import BaseModel

class StockIncrease(BaseModel):
    quantity: int
    supplierId: str

class StockDecrease(BaseModel):
    quantity: int
    reason: str

class StockTransfer(BaseModel):
    quantity: int
    targetWarehouseId: str
    reason: str
