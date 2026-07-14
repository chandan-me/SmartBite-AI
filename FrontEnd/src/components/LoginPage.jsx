import { useState, useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "./CSS/Login.css"
import { GlobalStateContext } from '../context/GlobalStateContext'
import {loginUser,signupUser } from "../services/authService";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useContext(GlobalStateContext)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError("");

    try {

        let firebaseUser;

        if (isLogin) {

            firebaseUser =
                await loginUser(
                    email,
                    password
                );

        } else {

            firebaseUser =
                await signupUser(
                    name,
                    email,
                    password
                );

        }

        login({

            uid: firebaseUser.uid,

            name:
                firebaseUser.displayName,

            email:
                firebaseUser.email,

        });

        navigate(from);

    }

    catch (err) {

        setError(err.message);

    }

    finally {

        setLoading(false);

    }

};

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-card">
        <div className="login-card__logo">
          <div className="icon">🍽️</div>
          SmartBite <span>AI</span>
        </div>

        <h2>{isLogin ? "Welcome Back!" : "Create Account"}</h2>
        <p className="subtitle">{isLogin ? "Sign in to your SmartBite AI account" : "Join SmartBite AI today"}</p>

        {error && <div className="login-error">⚠️ {error}</div>}

        {!isLogin && (
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
          </div>
        )}

        <div className="form-group">
          <label>Email Address</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? '⏳ Please wait...' : (isLogin ? '→ Sign In' : '→ Create Account')}
        </button>

        <div className="login-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError("") }}>
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LoginPage
