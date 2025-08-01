from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import shutil
import os
import openai
import os as _os
import requests
import base64
from PIL import Image, ImageDraw, ImageFont
import io

from database import SessionLocal, engine
from models import Base
from schemas import TattooCreate, Tattoo
from crud import create_tattoo, get_tattoos
from recommender import recommend

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS settings: allow all for development, restrict for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images from /uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Initialize Ollama client
openai_client = openai.OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",  # Dummy key for Ollama
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/tattoos/", response_model=Tattoo)
async def upload_tattoo(
    name: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    uploads_dir = "uploads"
    os.makedirs(uploads_dir, exist_ok=True)
    file_location = os.path.join(uploads_dir, file.filename)
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    try:
        return create_tattoo(db, TattooCreate(name=name, description=description), file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/recommend")
def get_recommendations(payload: dict, db: Session = Depends(get_db)):
    user_input = payload.get("user_input", "")
    try:
        tattoos = get_tattoos(db)
        tattoo_data = [Tattoo.from_orm(t).__dict__ for t in tattoos]
        results = recommend(user_input, tattoo_data)
        # Prepend /uploads/ to image paths for frontend
        for r in results:
            if not r["image"].startswith("/uploads/"):
                r["image"] = f"/uploads/{r['image']}"
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

@app.post("/llm_idea")
def generate_tattoo_idea(payload: dict):
    user_input = payload.get("user_input", "")
    if not user_input:
        raise HTTPException(status_code=400, detail="user_input is required")
    prompt = (
        "You are a creative tattoo designer. Given the following description of a person, "
        "generate a unique, meaningful tattoo idea for them. Keep it concise and creative.\n"
        f"Description: {user_input}\nTattoo Idea:"
    )
    try:
        response = openai_client.chat.completions.create(
            model="llama3",  # Use llama3 model for Ollama
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.8,
        )
        idea = response.choices[0].message.content.strip()
        return {"idea": idea}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")

@app.post("/generate_image")
def generate_tattoo_image(payload: dict):
    user_input = payload.get("user_input", "")
    if not user_input:
        raise HTTPException(status_code=400, detail="user_input is required")
    
    # Create a more detailed prompt for image generation
    image_prompt = f"tattoo design, {user_input}, black and white, detailed line art, minimalist, clean design"
    
    try:
        # Option 1: Use Stable Diffusion API (you'll need an API key)
        # This is a placeholder - you'll need to sign up for a service like Stability AI
        # api_key = "your-stability-ai-api-key"
        # response = requests.post(
        #     "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        #     headers={"Authorization": f"Bearer {api_key}"},
        #     json={
        #         "text_prompts": [{"text": image_prompt}],
        #         "cfg_scale": 7,
        #         "height": 1024,
        #         "width": 1024,
        #         "samples": 1,
        #         "steps": 30,
        #     }
        # )
        # if response.status_code == 200:
        #     data = response.json()
        #     image_data = data["artifacts"][0]["base64"]
        #     return {"image": f"data:image/png;base64,{image_data}"}
        
        # Option 2: For now, return a placeholder response
        # In a real implementation, you would use an actual image generation service
        return {
            "message": "Image generation requires an external service like Stability AI, DALL-E, or local Stable Diffusion. Please implement the image generation logic with your preferred service.",
            "prompt": image_prompt
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation error: {str(e)}")

@app.post("/generate_image_local")
def generate_tattoo_image_local(payload: dict):
    """
    Alternative endpoint that uses a local image generation approach
    This creates a simple placeholder image for demonstration
    """
    user_input = payload.get("user_input", "")
    if not user_input:
        raise HTTPException(status_code=400, detail="user_input is required")
    
    try:
        # Create a 512x512 image with a simple design
        img = Image.new('RGB', (512, 512), color='white')
        draw = ImageDraw.Draw(img)
        
        # Draw a simple border
        draw.rectangle([(50, 50), (462, 462)], outline='black', width=3)
        
        # Add some text
        try:
            # Try to use a default font
            font = ImageFont.load_default()
        except:
            font = None
        
        # Split text into lines
        words = user_input.split()
        lines = []
        current_line = ""
        for word in words:
            if len(current_line + " " + word) < 30:
                current_line += " " + word if current_line else word
            else:
                if current_line:
                    lines.append(current_line)
                current_line = word
        if current_line:
            lines.append(current_line)
        
        # Draw text
        y_position = 200
        for line in lines[:3]:  # Limit to 3 lines
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
            x_position = (512 - text_width) // 2
            draw.text((x_position, y_position), line, fill='black', font=font)
            y_position += 30
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return {"image": f"data:image/png;base64,{img_str}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Local image generation error: {str(e)}")
