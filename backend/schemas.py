from pydantic import BaseModel

class TattooBase(BaseModel):
    name: str
    description: str

class TattooCreate(TattooBase):
    pass

class Tattoo(TattooBase):
    id: int
    image: str
    class Config:
        from_attributes = True
