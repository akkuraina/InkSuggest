from sqlalchemy import Column, Integer, String
from database import Base

class Tattoo(Base):
    __tablename__ = "tattoos"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    image = Column(String)  # Path to image file
