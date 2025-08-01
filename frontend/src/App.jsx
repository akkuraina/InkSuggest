import { useState } from "react"
import TattooResults from "./components/TattooResults"
import "./App.css"

function App() {
  const [input, setInput] = useState("")
  const [tattoos, setTattoos] = useState([])
  const [llmIdea, setLlmIdea] = useState("")
  const [llmLoading, setLlmLoading] = useState(false)
  const [llmError, setLlmError] = useState("")
  const [recommendError, setRecommendError] = useState("")
  const [generatedImage, setGeneratedImage] = useState("")
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState("")

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRecommendError("");
    try {
      const res = await fetch(`${API_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input }),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
      }
      const data = await res.json();
      setTattoos(data);
    } catch (err) {
      setRecommendError("Could not fetch recommendations. Please try again later.");
      setTattoos([]);
    }
  };

  const handleLlmIdea = async () => {
    setLlmLoading(true)
    setLlmError("")
    setLlmIdea("")
    try {
      const res = await fetch(`${API_URL}/llm_idea`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input }),
      })
      const data = await res.json()
      if (data.idea) {
        setLlmIdea(data.idea)
      } else {
        setLlmError(data.error || "Unknown error")
      }
    } catch (err) {
      setLlmError("Error contacting LLM endpoint")
    } finally {
      setLlmLoading(false)
    }
  }

  const handleGenerateImage = async () => {
    setImageLoading(true)
    setImageError("")
    setGeneratedImage("")
    try {
      const res = await fetch(`${API_URL}/generate_image_local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input }),
      })
      const data = await res.json()
      if (data.image) {
        setGeneratedImage(data.image)
      } else {
        setImageError(data.error || "Failed to generate image")
      }
    } catch (err) {
      setImageError("Error generating image")
    } finally {
      setImageLoading(false)
    }
  }

  return (
    <div className="app-container">
      <h1 className="heading">InkSuggest</h1>
      <p className="tagline">Your vibe, your ink — AI-powered tattoo inspiration</p>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your mood, personality, or idea..."
        />
        <button type="submit">Generate Recommendations</button>
      </form>

      {recommendError && (
        <div className="recommend-error" style={{color: 'red', marginTop: 10}}>{recommendError}</div>
      )}

      <div className="ai-section" style={{marginTop: 20}}>
        <div className="llm-idea-section">
          <button onClick={handleLlmIdea} disabled={llmLoading || !input} style={{marginRight: 10}}>
            {llmLoading ? "Generating Tattoo Idea..." : "Generate Tattoo Idea (LLM)"}
          </button>
          {llmIdea && (
            <div className="llm-idea-result" style={{marginTop: 10, background: '#f6f6f6', padding: 10, borderRadius: 6}}>
              <strong>LLM Tattoo Idea:</strong>
              <div>{llmIdea}</div>
            </div>
          )}
          {llmError && (
            <div className="llm-idea-error" style={{color: 'red', marginTop: 10}}>{llmError}</div>
          )}
        </div>

        <div className="image-generation-section" style={{marginTop: 15}}>
          <button onClick={handleGenerateImage} disabled={imageLoading || !input}>
            {imageLoading ? "Generating Image..." : "Generate Tattoo Image"}
          </button>
          {generatedImage && (
            <div className="generated-image" style={{marginTop: 10, textAlign: 'center'}}>
              <strong>Generated Tattoo Design:</strong>
              <div style={{marginTop: 10}}>
                <img 
                  src={generatedImage} 
                  alt="Generated tattoo design" 
                  style={{maxWidth: '100%', maxHeight: '400px', border: '1px solid #ddd', borderRadius: '8px'}}
                />
              </div>
            </div>
          )}
          {imageError && (
            <div className="image-error" style={{color: 'red', marginTop: 10}}>{imageError}</div>
          )}
        </div>
      </div>

      {tattoos.length > 0 && <TattooResults tattoos={tattoos} />}
    </div>
  )
}

export default App
