import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "./Auth.css";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";
  const firstName = searchParams.get("firstName") || "";
  const lastName = searchParams.get("lastName") || "";
  const username = searchParams.get("username") || "";
  const tokenHash = searchParams.get("token_hash") || "";

  const navigate = useNavigate();

  const buildVerifyEmailUrl = () => {
    const params = new URLSearchParams({
      email,
      firstName,
      lastName,
      username,
    });

    return `${window.location.origin}/verify-email?${params.toString()}`;
  };

  const createProfile = async (user: { id: string; email?: string | null }) => {
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      username,
      first_name: firstName,
      last_name: lastName,
      role: "USER",
    });

    if (error) {
      console.error("Profile upsert error:", error);
    }
  };

  useEffect(() => {
    const completeEmailLinkVerification = async () => {
      if (!tokenHash) {
        return;
      }

      setLoading(true);

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "email",
        });

        if (error) {
          alert(error.message);
          return;
        }

        if (data.user) {
          await createProfile(data.user);
        }

        await supabase.auth.signOut();
        navigate("/login?verified=true", { replace: true });
      } catch (err) {
        console.error(err);
        alert("Something went wrong while verifying your email.");
      } finally {
        setLoading(false);
      }
    };

    void completeEmailLinkVerification();
  }, [navigate, tokenHash]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      alert("Please enter the 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (data.user) {
        await createProfile(data.user);
      }

      await supabase.auth.signOut();
      navigate("/login?verified=true");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: buildVerifyEmailUrl(),
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("A new verification email has been sent.");
    }

    setResending(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-brand">
            ASIKA
          </Link>
          <h2 className="auth-left-title">
            Check your
            <br />
            inbox.
          </h2>
          <p className="auth-left-sub">
            Use the 6-digit code in the email, or just click the confirmation
            link to activate your account.
          </p>
          <div className="auth-left-dots">
            <span className="auth-dot" />
            <span className="auth-dot" />
            <span className="auth-dot auth-dot-active" />
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h1 className="auth-title">Verify your email</h1>
            <p className="auth-subtitle">
              Check <strong style={{ color: "#111" }}>{email}</strong> for a
              verification email from Supabase.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleVerify}>
            <div className="auth-field">
              <label className="auth-label">Verification Code</label>
              <input
                className="auth-input auth-otp-input"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <p className="auth-field-hint">
                If you do not see a code, Supabase may have sent a confirmation
                link instead. Check spam too.
              </p>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="auth-btn-spinner" /> Verifying...
                </span>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span />
            <p>or</p>
            <span />
          </div>

          <p className="auth-switch">
            Need another email?{" "}
            <button
              className="auth-resend-btn"
              type="button"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend verification"}
            </button>
          </p>

          <p className="auth-switch" style={{ marginTop: "12px" }}>
            Wrong email? <Link to="/register">Go back</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
