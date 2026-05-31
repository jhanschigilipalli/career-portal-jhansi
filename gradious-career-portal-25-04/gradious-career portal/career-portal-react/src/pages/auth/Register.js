import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Register.css";
import { getApiBaseUrl } from "../../utils/getApiBaseUrl";

const API_BASE_URL = getApiBaseUrl();

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    qualification: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    const p = formData.password;
    const c = formData.confirmPassword;
    if (!c.trim()) {
      setConfirmPasswordError("");
      return;
    }
    if (p !== c) {
      setConfirmPasswordError("Passwords do not match. Re-enter to match your password.");
    } else {
      setConfirmPasswordError("");
    }
  }, [formData.password, formData.confirmPassword]);

  const showFormMessage = (text, type, existingUser = false) => {
    setMessage(text);
    setMessageType(type);
    setIsExistingUser(existingUser);
  };

  const clearFormMessage = () => {
    setMessage("");
    setMessageType("");
    setIsExistingUser(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const {
      firstName,
      lastName,
      email,
      phone,
      city,
      qualification,
      password,
      confirmPassword,
      terms,
    } = formData;

    if (!firstName.trim()) return "Please enter first name.";
    if (!lastName.trim()) return "Please enter last name.";
    if (!email.trim()) return "Please enter email address.";
    if (!phone.trim()) return "Please enter phone number.";
    if (!city.trim()) return "Please enter your city.";
    if (city.trim().length < 2) {
      return "City must be at least 2 characters.";
    }
    if (!qualification.trim()) {
      return "Please select your qualification from the list.";
    }
    if (!password.trim()) return "Please enter password.";
    if (!confirmPassword.trim()) return "Please enter confirm password.";

    const namePattern = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
    if (!namePattern.test(firstName.trim())) {
      return "First name should contain only letters and spaces.";
    }

    if (!namePattern.test(lastName.trim())) {
      return "Last name should contain only letters and spaces.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    const phonePattern = /^[6-9][0-9]{9}$/;
    if (!phonePattern.test(phone.trim())) {
      return "Please enter a valid 10-digit phone number starting with 6 to 9.";
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordPattern.test(password.trim())) {
      return "Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    if (!terms) {
      return "Please accept Terms & Conditions.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearFormMessage();

    const error = validateForm();
    if (error) {
      showFormMessage(error, "error");
      return;
    }

    if (confirmPasswordError) {
      showFormMessage(confirmPasswordError, "error");
      return;
    }

    const payload = {
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      qualification: formData.qualification.trim(),
      password: formData.password.trim(),
    };

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = { message: "Invalid server response from backend." };
      }

      if (!res.ok) {
        const backendMessage = (data.message || "").toLowerCase();

        if (
          backendMessage.includes("email already registered") ||
          backendMessage.includes("already exists") ||
          backendMessage.includes("user already exists")
        ) {
          showFormMessage(
            "Email already registered. Please sign in.",
            "success",
            true
          );
          toast.info("Email already registered. Please sign in.");
        } else {
          const errMsg = data.message || "Registration failed.";
          showFormMessage(errMsg, "error");
          toast.error(errMsg);
        }
        return;
      }

      const okMsg =
        data.message || "Account created successfully. Redirecting to sign in...";
      showFormMessage(okMsg, "success");
      toast.success(okMsg);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        city: "",
        qualification: "",
        password: "",
        confirmPassword: "",
        terms: false,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      showFormMessage("Unable to connect to the server. Please try again.", "error");
      toast.error("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="register-page-wrapper">
      <header className="register-header">
        <div className="register-navbar">
          <div className="register-logo-section">
            <img src="/images/logo.png" alt="Gradious Logo" />
            <h2>Gradious Careers Portal</h2>
          </div>

          <nav className="register-nav">
            <Link to="/" className="register-nav-link">
              Home
            </Link>
            <Link to="/login" className="register-nav-link">
              Sign In
            </Link>
            <Link to="/register" className="register-nav-link active">
              Create Account
            </Link>
          </nav>
        </div>
      </header>

      <div className="register-main">
        <aside className="register-hero-panel">
          <div className="register-hero-inner">
            <div className="register-hero-badge">Gradious Internal Careers</div>
            <h1>Create Your Account</h1>
            <p>
              Register to browse internal openings, submit applications, and
              manage your career journey within the organization.
            </p>

            <div className="register-hero-features">
              <div className="register-hero-feature">
                <div className="register-hero-feature-icon">
                  <i className="fas fa-briefcase" aria-hidden="true"></i>
                </div>
                <div className="register-hero-feature-text">
                  <h4>Apply to Open Roles</h4>
                  <p>Submit applications to current internal positions.</p>
                </div>
              </div>

              <div className="register-hero-feature">
                <div className="register-hero-feature-icon">
                  <i className="fas fa-chart-line" aria-hidden="true"></i>
                </div>
                <div className="register-hero-feature-text">
                  <h4>Track Application Status</h4>
                  <p>Monitor progress on roles you have applied for.</p>
                </div>
              </div>

              <div className="register-hero-feature">
                <div className="register-hero-feature-icon">
                  <i className="fas fa-users" aria-hidden="true"></i>
                </div>
                <div className="register-hero-feature-text">
                  <h4>Connect with Recruiters</h4>
                  <p>Engage directly with hiring teams across departments.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="register-page">
          <div className="register-container">
            <div className="register-card">
              <h2>Create Account</h2>
              <p className="register-card-subtitle">
                Complete the form below to register for the careers portal.
              </p>

              <p className="register-required-text">
                <span>*</span> Required fields
              </p>

              <form onSubmit={handleSubmit} className="register-form">
                <div className="register-form-row">
                  <div className="register-form-group">
                    <label htmlFor="register-first-name">First Name *</label>
                    <input
                      id="register-first-name"
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="register-form-group">
                    <label htmlFor="register-last-name">Last Name *</label>
                    <input
                      id="register-last-name"
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="register-form-group">
                  <label htmlFor="register-email">Email Address *</label>
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="register-form-group">
                  <label htmlFor="register-phone">Phone Number *</label>
                  <input
                    id="register-phone"
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="register-form-group">
                  <label htmlFor="register-city">City *</label>
                  <input
                    id="register-city"
                    type="text"
                    name="city"
                    placeholder="Your city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    minLength={2}
                    autoComplete="address-level2"
                  />
                </div>

                <div className="register-form-group">
                  <label htmlFor="register-qualification">Qualification *</label>
                  <select
                    id="register-qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select qualification</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="B.E">B.E</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="BCA">BCA</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MCA">MCA</option>
                    <option value="MBA">MBA</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="register-form-group">
                  <label htmlFor="register-password">Password *</label>
                  <div className="register-password-field">
                    <input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => togglePassword("password")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          togglePassword("password");
                        }
                      }}
                    >
                      <i
                        className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                        aria-hidden="true"
                      ></i>
                    </span>
                  </div>
                  <small className="register-password-help">
                    Minimum 8 characters with 1 uppercase, 1 number, and 1 special
                    character.
                  </small>
                </div>

                <div className="register-form-group">
                  <label htmlFor="register-confirm-password">Confirm Password *</label>
                  <div className="register-password-field">
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      aria-invalid={confirmPasswordError ? "true" : "false"}
                      aria-describedby={
                        confirmPasswordError
                          ? "register-confirm-password-error"
                          : undefined
                      }
                      className={confirmPasswordError ? "register-input-error" : ""}
                    />
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => togglePassword("confirm")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          togglePassword("confirm");
                        }
                      }}
                    >
                      <i
                        className={
                          showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"
                        }
                        aria-hidden="true"
                      ></i>
                    </span>
                  </div>
                  {confirmPasswordError ? (
                    <p
                      id="register-confirm-password-error"
                      className="register-inline-error"
                      role="alert"
                    >
                      {confirmPasswordError}
                    </p>
                  ) : null}
                </div>

                <div className="register-checkbox-group">
                  <input
                    type="checkbox"
                    id="register-terms"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                  />
                  <label htmlFor="register-terms">
                    I agree to the{" "}
                    <span
                      className="register-link-text"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowModal(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setShowModal(true);
                        }
                      }}
                    >
                      Terms & Conditions
                    </span>{" "}
                    <span className="register-star">*</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="register-submit-btn"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>

                {message && (
                  <div className={`register-form-message ${messageType}`}>
                    {isExistingUser ? (
                      <>
                        Email already registered.{" "}
                        <Link to="/login" className="register-message-login-link">
                          Sign in instead
                        </Link>
                      </>
                    ) : (
                      message
                    )}
                  </div>
                )}

                <p className="register-login-text">
                  Already have an account? <Link to="/login">Sign in</Link>
                </p>
              </form>

              {showModal && (
                <div className="register-modal-overlay">
                  <div className="register-modal">
                    <div className="register-modal-header">
                      <h3>Terms & Conditions</h3>
                      <span
                        className="register-close"
                        role="button"
                        tabIndex={0}
                        aria-label="Close"
                        onClick={() => setShowModal(false)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setShowModal(false);
                          }
                        }}
                      >
                        <i className="fas fa-times" aria-hidden="true"></i>
                      </span>
                    </div>

                    <div className="register-modal-body">
                      <p>
                        By creating an account on the Gradious Careers Portal, you
                        agree to the following terms and conditions.
                      </p>

                      <ul>
                        <li>Provide accurate and up-to-date personal information</li>
                        <li>Maintain the confidentiality of your account credentials</li>
                        <li>Use the platform solely for legitimate career purposes</li>
                        <li>Accept that features and policies may be updated</li>
                        <li>Understand that misuse may result in account suspension</li>
                      </ul>

                      <p>By continuing, you acknowledge and accept these terms.</p>
                    </div>

                    <div className="register-modal-footer">
                      <button type="button" onClick={() => setShowModal(false)}>
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;
