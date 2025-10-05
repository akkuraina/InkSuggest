# InkSuggest

AI-powered tattoo inspiration and recommendation app.

This project provides:

- Recommendations based on your description using semantic similarity
- A creative tattoo idea via a local LLM (Ollama)
- A simple local placeholder image generator for demo purposes

---

## Architecture Overview

### Frontend (React + Vite)

- `frontend/src/App.jsx`: Main UI. Sends requests to the backend to:
  - POST `/recommend` with `{ user_input }` to get similar tattoos
  - POST `/llm_idea` with `{ user_input }` to get a concise idea from the LLM
  - POST `/generate_image_local` with `{ user_input }` to get a base64 demo image
- `frontend/src/components/TattooResults.jsx`: Renders recommendation cards and loads images from the backend uploads mount.
- Uses `VITE_API_URL` (default `http://127.0.0.1:8000`) to reach the backend.

### Backend (FastAPI)

- `backend/app.py`:
  - Initializes database tables
  - CORS allows `http://localhost:5173` (Vite dev server)
  - Serves uploaded images at `/uploads`
  - Configures OpenAI-compatible client pointed at Ollama (`http://localhost:11434/v1`, model `llama3`)
  - Endpoints:
    - `POST /tattoos/` (multipart): save an uploaded image and create a tattoo record
    - `POST /recommend`: return top-k similar tattoos by description
    - `POST /llm_idea`: generate a concise tattoo idea using the local LLM
    - `POST /generate_image`: placeholder notes for integrating real image APIs
    - `POST /generate_image_local`: generate a local demo PNG and return as base64
- `backend/recommender.py`: Sentence-Transformer (`all-MiniLM-L6-v2`) + cosine similarity for recommendations.
- `backend/crud.py`, `backend/schemas.py`, `backend/models.py`: persistence and response schemas.
- `backend/database.py`: SQLite engine/session setup.

### Database (SQLite)

- File: `backend/tattoos.db`
- Table `tattoos`: `id`, `name`, `description`, `image` (filename/path)
- Reads all tattoos for recommendation; writes via `POST /tattoos/`

---

## Data Flow

1. Recommendation

   - Frontend → `POST /recommend` with `{ user_input }`
   - Backend loads all tattoos, computes embedding similarity, returns top matches
   - Image paths are normalized to `/uploads/...`, which the frontend resolves via `VITE_API_URL`

2. LLM Idea

   - Frontend → `POST /llm_idea`
   - Backend prompts local Ollama (`llama3`) and returns a concise idea string

3. Image Generation (Demo)

   - Frontend → `POST /generate_image_local`
   - Backend returns a base64 PNG placeholder rendered from the input text

4. Uploading New Tattoos
   - Client → `POST /tattoos/` (multipart with `name`, `description`, `file`)
   - Backend stores the file in `backend/uploads` and inserts the DB row

---

## API Endpoints

```http
POST /tattoos/
Content-Type: multipart/form-data
Fields: name (str), description (str), file (image)
Response: Tattoo { id, name, description, image }

POST /recommend
Body: { "user_input": string }
Response: Array<{ name, description, image }>

POST /llm_idea
Body: { "user_input": string }
Response: { idea: string }

POST /generate_image
Body: { "user_input": string }
Response: placeholder message (integration notes for real APIs)

POST /generate_image_local
Body: { "user_input": string }
Response: { image: "data:image/png;base64,..." }
```

---

## Prerequisites

- Python 3.12+
- Node 18+
- Ollama running locally with the `llama3` model pulled

---

## Backend Setup (FastAPI)

1. Install dependencies (use the project root requirements):
   ```bash
   pip install -r requirements.txt
   ```
2. Start Ollama and ensure the `llama3` model is available:
   ```bash
   ollama run llama3
   ```
   Keep Ollama running in the background.
3. Run the backend from the project root:
   ```bash
   uvicorn backend.app:app --reload
   ```

Notes

- Uploaded images are saved under `backend/uploads` and served at `/uploads`.
- The recommender will download `all-MiniLM-L6-v2` on first run (can take time).

---

## Frontend Setup (React + Vite)

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Configure backend API URL (optional if using default):
   - Create `frontend/.env` with:
     ```
     VITE_API_URL=http://127.0.0.1:8000
     ```
3. Run the dev server:
   ```bash
   npm run dev
   ```

---

## Environment Variables

- `VITE_API_URL`: Backend base URL used by the frontend (defaults to `http://127.0.0.1:8000`).

---

## Production Considerations

- Restrict CORS to your deployed frontend origin.
- Do not expose local Ollama in public environments; consider a managed LLM if needed.
- Serve static uploads behind proper file serving/CDN.
- Add auth/rate limits if exposing write endpoints (`/tattoos/`).

---

## Troubleshooting

- LLM idea errors: ensure Ollama is running on `http://localhost:11434` and `llama3` is available.
- Recommendation latency on first run: model download/initialization can be slow; subsequent runs are faster.
- Images not showing: verify responses contain `/uploads/...` and frontend constructs `API_URL + image`.
- CORS issues: backend allows `http://localhost:5173`; update for your environment.

---

## Project Structure

```
backend/
  app.py            # FastAPI app + endpoints
  recommender.py    # Embedding model + similarity
  models.py         # SQLAlchemy models
  schemas.py        # Pydantic schemas
  crud.py           # DB access helpers
  database.py       # SQLite engine/session
  uploads/          # Uploaded images served at /uploads
  data/             # Sample images and CSV
frontend/
  src/App.jsx       # Main UI
  src/components/   # UI components
  ...
```

---

## License

MIT (add a LICENSE file if applicable).
