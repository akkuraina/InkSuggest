import { useEffect, useState } from "react"

function Signup({ onBack, onSwitchToLogin }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    if (!name || !email || !password) {
      setError("Please fill all fields")
      return
    }
    alert("Signed up (demo)")
  }

  useEffect(() => {
    // Initialize Google Identity button if client ID is provided
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !window.google || !window.google.accounts || !window.google.accounts.id) return
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        // In a real app, send response.credential (JWT) to backend for verification
        alert("Google sign-in successful (demo):\n" + response.credential.substring(0, 20) + "...")
      },
    })
    const btn = document.getElementById('gsi-btn')
    if (btn) {
      window.google.accounts.id.renderButton(btn, { theme: 'filled_blue', size: 'large', shape: 'pill', text: 'signup_with' })
    }
  }, [])

  return (
    <div className="auth-container">
      <h2>Create your account</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="auth-error">{error}</div>}
        <button type="submit">Sign up</button>
      </form>
      <div className="auth-divider">or</div>
      <div id="gsi-btn" style={{display: 'flex', justifyContent: 'center'}}></div>
      <div className="auth-actions">
        <button className="link-btn" onClick={onSwitchToLogin}>Already have an account?</button>
        <button className="link-btn" onClick={onBack}>Back</button>
      </div>
    </div>
  )
}

export default Signup


