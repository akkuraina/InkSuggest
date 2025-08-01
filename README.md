# InkSuggest

AI-powered Tattoo Recommendation Platform

## Backend Setup (FastAPI)

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Set up Ollama (for LLM features):**
   - Download and install Ollama from [ollama.com](https://ollama.com/)
   - Start the Llama 3 model:
     ```bash
     ollama run llama3
     ```
   - Keep Ollama running in the background
3. **Run the backend:**
   ```bash
   uvicorn backend.app:app --reload
   ```

## Frontend Setup (React + Vite)

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Set backend API URL:**
   - Create a `.env` file in `frontend/` and set `VITE_API_URL` (see `.env.example`).
3. **Run the frontend:**
   ```bash
   npm run dev
   ```

## Environment Variables

- `VITE_API_URL`: Backend API URL (required for frontend)

## Deployment

- Use Docker or your preferred deployment method.
- Restrict CORS and never commit secrets.
- For production, consider using a cloud-based LLM service.

## Testing

- Add tests for backend and frontend (see TODOs).
