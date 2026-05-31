import { useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { getSafeUserPostLoginPath } from "../../utils/postLoginRedirect";
import { GoogleMarkIcon } from "./GoogleMarkIcon";
import { AUTH_API_BASE } from "./useGoogleAuthClientId";
import "./Login.css";

function Login({ googleClientId = "", googleConfigLoading = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const googleEnabled = Boolean(googleClientId) && !googleConfigLoading;

  const persistSession = useCallback((data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    if (data.user?.name) {
      localStorage.setItem("name", data.user.name);
    } else {
      localStorage.removeItem("name");
    }
  }, []);

  const redirectAfterAuth = useCallback(
    (role) => {
      setTimeout(() => {
        if (role === "admin") {
          localStorage.removeItem("redirectAfterLogin");
          navigate("/admin/dashboard");
        } else if (role === "recruiter") {
          localStorage.removeItem("redirectAfterLogin");
          navigate("/recruiter/dashboard");
        } else {
          const params = new URLSearchParams(location.search);
          const rawReturnTo = params.get("returnTo");
          let fromQuery = null;
          if (rawReturnTo) {
            try {
              fromQuery = decodeURIComponent(rawReturnTo);
            } catch {
              fromQuery = null;
            }
          }
          const fromStorage = localStorage.getItem("redirectAfterLogin");
          localStorage.removeItem("redirectAfterLogin");
          const candidate = fromQuery || fromStorage;
          const safe = getSafeUserPostLoginPath(candidate);
          navigate(safe || "/user/dashboard");
        }
      }, 1000);
    },
    [navigate, location.search]
  );

  const handleGoogleCredential = async (credential) => {
    if (!credential) {
      toast.error("Google sign-in did not return a credential");
      return;
    }
    try {
      const response = await fetch(`${AUTH_API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await response.json();
      if (!response.ok) {
        const msg = data.message || "Google sign-in failed";
        setMessage(msg);
        setMessageType("error");
        toast.error(msg);
        return;
      }
      persistSession(data);
      setMessage(
        data.created
          ? "Account created successfully. Redirecting..."
          : "Signed in successfully. Redirecting..."
      );
      setMessageType("success");
      toast.success(
        data.created
          ? "Signed up with Google — you're in!"
          : "Signed in with Google"
      );
      redirectAfterAuth(data.role);
    } catch (error) {
      console.error("Google login error:", error);
      setMessage("Unable to connect to the server. Please try again.");
      setMessageType("error");
      toast.error("Unable to connect to the server. Please try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!identifier.trim() || !password.trim()) {
      setMessage("Please complete all required fields.");
      setMessageType("error");
      toast.warning("Please complete all required fields.");
      return;
    }

    try {
      const response = await fetch(`${AUTH_API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        const msg = data.message || "Sign in failed";
        setMessage(msg);
        setMessageType("error");
        toast.error(msg);
        return;
      }

      persistSession(data);
      setMessage("Signed in successfully. Redirecting...");
      setMessageType("success");
      toast.success("Signed in successfully!");
      redirectAfterAuth(data.role);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to the server. Please try again.");
      setMessageType("error");
      toast.error("Unable to connect to the server. Please try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <header className="login-header">
        <div className="login-navbar">
          <div className="login-logo">
            <img src="/images/logo.png" alt="Gradious Logo" />
            <span>Gradious Careers Portal</span>
          </div>
          <nav className="login-nav">
            <Link to="/">Home</Link>
            <Link to="/login" className="login-active">
              Sign In
            </Link>
            <Link to="/register" className="login-btn-register">
              Create Account
            </Link>
          </nav>
        </div>
      </header>

      <div className="login-main">
        <aside className="login-hero-panel">
          <div className="login-hero-inner">
            <div className="login-hero-badge">Gradious Internal Careers</div>
            <h1>Sign In to Your Account</h1>
            <p>
              Access your dashboard, track applications, and explore internal
              opportunities across the organization.
            </p>

            <div className="login-hero-features">
              <div className="login-hero-feature">
                <div className="login-hero-feature-icon">
                  <i className="fas fa-briefcase" aria-hidden="true"></i>
                </div>
                <div className="login-hero-feature-text">
                  <h4>Browse Open Roles</h4>
                  <p>View and apply to current openings by department.</p>
                </div>
              </div>

              <div className="login-hero-feature">
                <div className="login-hero-feature-icon">
                  <i className="fas fa-file-alt" aria-hidden="true"></i>
                </div>
                <div className="login-hero-feature-text">
                  <h4>Track Applications</h4>
                  <p>Monitor the status of your submitted applications.</p>
                </div>
              </div>

              <div className="login-hero-feature">
                <div className="login-hero-feature-icon">
                  <i className="fas fa-user-shield" aria-hidden="true"></i>
                </div>
                <div className="login-hero-feature-text">
                  <h4>Secure Access</h4>
                  <p>Your credentials are protected with encrypted authentication.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="login-page">
          <div className="login-container">
            <div className="login-card">
              <h2>Sign In</h2>
              <p className="login-subtitle">
                Enter your credentials to access the careers portal.
              </p>

              <form onSubmit={handleLogin}>
                <div className="login-form-group">
                  <label htmlFor="login-identifier">Email or Phone</label>
                  <input
                    id="login-identifier"
                    type="text"
                    placeholder="Enter your email or phone number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>

                <div className="login-form-group">
                  <label htmlFor="login-password">Password</label>
                  <div className="login-password-box">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      className="login-toggle-password"
                      role="button"
                      tabIndex={0}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setShowPassword(!showPassword);
                        }
                      }}
                    >
                      <i
                        className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                        aria-hidden="true"
                      ></i>
                    </span>
                  </div>
                  <div className="login-forgot-link">
                    <Link to="/forgot-password">Forgot password?</Link>
                  </div>
                </div>

                {message && (
                  <p className={`login-message ${messageType}`}>{message}</p>
                )}

                <button type="submit" className="login-btn">
                  Sign In
                </button>

                <p className="login-footer">
                  Don&apos;t have an account?{" "}
                  <Link to="/register">Create an account</Link>
                </p>
              </form>

              <div className="login-google-section">
                <div className="login-or-divider">
                  <span>or</span>
                </div>

                <div className="login-google-pill-wrap">
                  {googleConfigLoading ? (
                    <div
                      className="login-google-pill-skeleton"
                      aria-busy="true"
                      aria-label="Loading Google sign-in"
                    />
                  ) : googleEnabled ? (
                    <div className="login-google-pill-native">
                      <GoogleLogin
                        text="signin_with"
                        theme="outline"
                        size="large"
                        shape="pill"
                        width="320"
                        onSuccess={(credentialResponse) => {
                          if (credentialResponse.credential) {
                            void handleGoogleCredential(
                              credentialResponse.credential
                            );
                          }
                        }}
                        onError={() => {
                          toast.error(
                            "Google sign-in was interrupted. Check GOOGLE_CLIENT_ID and Authorized JavaScript origins in Google Cloud Console."
                          );
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="login-google-pill-fallback"
                      aria-label="Sign in with Google"
                      onClick={() =>
                        toast.info(
                          "Google sign-in is not configured. Add GOOGLE_CLIENT_ID to the server .env (Web client ID), restart the API, and refresh this page."
                        )
                      }
                    >
                      <GoogleMarkIcon />
                      <span>Sign in with Google</span>
                    </button>
                  )}
                </div>

                <p className="login-google-footnote">
                  New candidates may register with a verified Gmail account.
                  Recruiters and administrators should sign in with email and
                  password above.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
