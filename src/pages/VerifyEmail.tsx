import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
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
  const password = searchParams.get("password") || "";

  const navigate = useNavigate();

  const buildOtpPayload = (code: string) => ({
    email,
    code,
    used: false,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const { data: otpRecords, error: otpError } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(10);

      if (otpError || !otpRecords) {
        console.error("OTP lookup error:", otpError);
        toast.error("Could not verify the code. Please try again.");
        setLoading(false);
        return;
      }

      const otpRecord = otpRecords.find((record) => String(record.code) === otp);
      const isExpired =
        otpRecord?.expires_at != null &&
        new Date(otpRecord.expires_at).getTime() < Date.now();
      const isUsed = otpRecord?.used === true;

      if (!otpRecord || isUsed || isExpired) {
        toast.error("Invalid or expired code. Please try again.");
        setLoading(false);
        return;
      }

      await supabase
        .from("otp_codes")
        .update({ used: true })
        .eq("id", otpRecord.id);

      const { data: completeRegistrationData, error: completeRegistrationError } = await supabase.functions.invoke(
        "complete-registration",
        {
          body: {
            email,
            password,
            firstName,
            lastName,
            username,
          },
        },
      );

      if (completeRegistrationError) {
        console.error("Complete registration error:", completeRegistrationError);
        const functionMessage =
          completeRegistrationData &&
          typeof completeRegistrationData === "object" &&
          "error" in completeRegistrationData
            ? String(completeRegistrationData.error)
            : completeRegistrationError.message;
        toast.error(functionMessage || "We could not finish creating your account. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Email verified successfully.");
      navigate("/login?verified=true");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);

    try {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

      const { error: insertError } = await supabase
        .from("otp_codes")
        .insert(buildOtpPayload(newOtp));

      if (insertError) {
        console.error("Resend OTP save error:", insertError);
        toast.error("Failed to create a new code. Please try again.");
        return;
      }

      const { error } = await supabase.functions.invoke("send-otp-email", {
        body: {
          email,
          otp: newOtp,
          name: firstName,
          subject: "Your new ASIKA verification code",
        },
      });

      if (!error) {
        toast.success("A new code has been sent to your email.");
      } else {
        console.error("Resend OTP error:", error);
        toast.error("Failed to resend. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-brand">ASIKA</Link>
          <h2 className="auth-left-title">Check your<br />inbox.</h2>
          <p className="auth-left-sub">
            We sent a 6-digit verification code to your email. Enter it below to activate your account.
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
              A 6-digit code was sent to{" "}
              <strong style={{ color: "#111" }}>{email}</strong>
            </p>
          </div>

          <form className="auth-form" onSubmit={handleVerify}>
            <div className="auth-field">
              <label className="auth-label">Verification Code</label>
              <input
                className="auth-input auth-otp-input"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <p className="auth-field-hint">Check your spam folder if you don't see it</p>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="auth-btn-spinner" /> Verifying...
                </span>
              ) : "Verify Email"}
            </button>
          </form>

          <div className="auth-divider">
            <span />
            <p>or</p>
            <span />
          </div>

          <p className="auth-switch">
            Didn't receive a code?{" "}
            <button
              className="auth-resend-btn"
              type="button"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          </p>

          <p className="auth-switch" style={{ marginTop: "12px" }}>
            Wrong email?{" "}
            <Link to="/Register">Go back</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
