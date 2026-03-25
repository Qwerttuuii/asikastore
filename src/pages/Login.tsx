import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./Auth.css";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justVerified = searchParams.get("verified") === "true";
  const resetSent = searchParams.get("reset") === "sent";

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

  const handleForgotPassword = async () => {
    if (!identifier) {
      alert("Enter your email address first.");
      return;
    }

    if (!identifier.includes("@")) {
      alert("Use your email address to reset your password.");
      return;
    }

    setResettingPassword(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(identifier, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        alert(error.message);
        setResettingPassword(false);
        return;
      }

      alert("Password reset email sent. Check your inbox.");
      navigate("/login?reset=sent", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-brand">ASIKA</Link>
          <h2 className="auth-left-title">Dressed to<br />be remembered.</h2>
          <p className="auth-left-sub">
            Timeless silhouettes crafted with intention from effortless day dresses to statement evening wear.
          </p>
          <div className="auth-left-dots">
            <span className="auth-dot auth-dot-active" />
            <span className="auth-dot" />
            <span className="auth-dot" />
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          {justVerified && (
            <div className="auth-success-banner">
              Email verified successfully. You can now sign in.
            </div>
          )}

          {resetSent && (
            <div className="auth-success-banner">
              Password reset email sent. Open the link in your inbox to choose a new password.
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
              <div className="auth-password-wrap">
                <input
                  className="auth-input auth-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="auth-inline-action">
              <button
                type="button"
                className="auth-text-btn"
                onClick={handleForgotPassword}
                disabled={resettingPassword}
              >
                {resettingPassword ? "Sending reset link..." : "Forgot password?"}
              </button>
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
