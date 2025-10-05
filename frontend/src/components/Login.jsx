import { useState } from "react"

function Login({ onBack, onSwitchToSignup }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    // Placeholder login handler
    if (!email || !password) {
      setError("Please enter email and password")
      return
    }
    alert("Logged in (demo)")
  }

  return (
    <div className="auth-container">
      <h2>Log in</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
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
        <button type="submit">Log in</button>
      </form>
      <div className="auth-actions">
        <button className="link-btn" onClick={onSwitchToSignup}>Create an account</button>
        <button className="link-btn" onClick={onBack}>Back</button>
      </div>
    </div>
  )
}

export default Login


