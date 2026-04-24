import uuid
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database.connection import Base

class Product(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    name = Column(String, nullable=False, unique=True)
    sku = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    stockQuantity = Column(Integer, nullable=False)