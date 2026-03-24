import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import "./Auth.css";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justVerified = searchParams.get("verified") === "true";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      alert("Fill all fields");
      return;
    }
    setLoading(true);
    try {
      let emailToUse = identifier;

      if (!identifier.includes("@")) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", identifier)
          .single();
        if (error || !profile) {
          alert("Username not found");
          setLoading(false);
          return;
        }
        emailToUse = profile.email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          alert("Please verify your email first. Check your inbox for the confirmation code.");
        } else {
          alert(error.message);
        }
        setLoading(false);
        return;
      }

      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* LEFT PANEL */}
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-brand">ASIKA</Link>
          <h2 className="auth-left-title">Dressed to<br />be remembered.</h2>
          <p className="auth-left-sub">
            Timeless silhouettes crafted with intention — from effortless day dresses to statement evening wear.
          </p>
          <div className="auth-left-dots">
            <span className="auth-dot auth-dot-active" />
            <span className="auth-dot" />
            <span className="auth-dot" />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {/* SUCCESS BANNER — shows after email verification */}
          {justVerified && (
            <div className="auth-success-banner">
              ✓ Email verified successfully! You can now sign in.
            </div>
          )}

          <div className="auth-form-header">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your account to continue</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label className="auth-label">Email or Username</label>
              <input
                className="auth-input"
                placeholder="your@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="auth-btn-spinner" /> Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <div className="auth-divider">
            <span />
            <p>or</p>
            <span />
          </div>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/Register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
