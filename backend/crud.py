from sqlalchemy.orm import Session
from models import Tattoo
from schemas import TattooCreate
from dotenv import load_dotenv
load_dotenv()

def get_tattoos(db: Session):
    return db.query(Tattoo).all()

def create_tattoo(db: Session, tattoo: TattooCreate, image_filename: str):
    db_tattoo = Tattoo(**tattoo.dict(), image=image_filename)
    db.add(db_tattoo)
    db.commit()
    db.refresh(db_tattoo)
    return db_tattoo
