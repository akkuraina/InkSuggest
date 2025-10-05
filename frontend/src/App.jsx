import { useState } from "react"
import Login from "./components/Login"
import Signup from "./components/Signup"
import "./App.css"

function App() {
  const [input, setInput] = useState("")
  const [llmIdea, setLlmIdea] = useState("")
  const [llmLoading, setLlmLoading] = useState(false)
  const [llmError, setLlmError] = useState("")
  const [generatedImage, setGeneratedImage] = useState("")
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState("")
  const [route, setRoute] = useState("home") // 'home' | 'login' | 'signup'

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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
      // First try: get a real image from recommendations
      const recRes = await fetch(`${API_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input }),
      })
      if (recRes.ok) {
        const recData = await recRes.json()
        if (Array.isArray(recData) && recData.length > 0 && recData[0].image) {
          // Show the first recommended tattoo image served from /uploads
          setGeneratedImage(`${API_URL}${recData[0].image}`)
          return
        }
      }

      // Fallback: local placeholder image if no recommendations available
      const fallbackRes = await fetch(`${API_URL}/generate_image_local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input }),
      })
      const fallbackData = await fallbackRes.json()
      if (fallbackData.image) {
        setGeneratedImage(fallbackData.image)
      } else {
        setImageError(fallbackData.error || "Failed to generate image")
      }
    } catch (err) {
      setImageError("Error generating image")
    } finally {
      setImageLoading(false)
    }
  }

  return (
    <>
      <header className="navbar">
        <div className="nav-inner">
          <div className="nav-left">
            <div className="brand">InkSuggest</div>
            <a href="#home" onClick={(e)=>{e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'})}}>Home</a>
          </div>
          <div className="nav-center">
            <div className="nav-search">
              <input
                type="text"
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                placeholder="Search..."
              />
              <button className="icon-btn" aria-label="Search" onClick={() => document.getElementById('main-input')?.focus()}>🔍</button>
            </div>
          </div>
          <div className="nav-right">
            <a href="#design" onClick={(e)=>{e.preventDefault(); document.getElementById('design-section')?.scrollIntoView({behavior:'smooth'})}}>My Tattoos</a>
            <a href="#account" onClick={(e)=>{e.preventDefault(); setRoute('login'); window.scrollTo({top:0, behavior:'smooth'})}}>My Account</a>
          </div>
        </div>
      </header>
      <div className="app-container">
      {route === 'home' && (
      <h1 className="heading">InkSuggest</h1>
      )}
      {route === 'home' && <p className="tagline">Your vibe, your ink — AI-powered tattoo inspiration</p>}

      {route === 'home' && (<div className="input-form" id="home">
        <input
          id="main-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your mood, personality, or idea..."
        />
      </div>)}

      {route === 'home' && (<div className="ai-section" style={{marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center'}}>
        <div className="llm-idea-section">
          <button onClick={handleLlmIdea} disabled={llmLoading || !input} style={{marginRight: 10}}>
            {llmLoading ? "Generating Tattoo Idea..." : "Generate Tattoo Idea"}
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

        <div className="image-generation-section">
          <button onClick={handleGenerateImage} disabled={imageLoading || !input}>
            {imageLoading ? "Generating Image..." : "Generate Tattoo Design"}
          </button>
          {generatedImage && (
            <div id="design-section" className="generated-image" style={{marginTop: 10, textAlign: 'center'}}>
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
      </div>)}

      {route === 'home' && generatedImage && (
        <div className="placement-section">
          <h2 className="placement-title">Tattoo Placement Options</h2>
          <div className="placement-grid">
            {[
              { key: 'behind_ear', label: 'Behind the Ear', shape: 'shape-circle' },
              { key: 'neck', label: 'Neck', shape: 'shape-oval' },
              { key: 'hand', label: 'Hand', shape: 'shape-circle' },
              { key: 'forearm', label: 'Forearm (Band)', shape: 'shape-band' },
              { key: 'upper_arm', label: 'Upper Arm', shape: 'shape-panel' },
              { key: 'back', label: 'Back', shape: 'shape-panelLarge' },
              { key: 'calf', label: 'Calf', shape: 'shape-panelTall' },
              { key: 'ankle', label: 'Ankle (Band)', shape: 'shape-bandSmall' },
            ].map((p) => (
              <div key={p.key} className="placement-card">
                <div className="placement-mock">
                  <img className={p.shape} src={generatedImage} alt={p.label} />
                </div>
                <div className="placement-label">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations removed */}
      {route === 'login' && (
        <Login onBack={() => setRoute('home')} onSwitchToSignup={() => setRoute('signup')} />
      )}
      {route === 'signup' && (
        <Signup onBack={() => setRoute('home')} onSwitchToLogin={() => setRoute('login')} />
      )}
      </div>
    </>
  )
}

export default App
