import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiBaseUrl } from "../../utils/getApiBaseUrl";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const [allJobs, setAllJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [deptError, setDeptError] = useState("");

  useEffect(() => {
    loadJobs();
    loadDepartments();
  }, []);

  const loadJobs = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/jobs/public-latest-jobs`);

      if (!res.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await res.json();
      setAllJobs(Array.isArray(data) ? data : []);
      setExpanded(false);
      setError("");
    } catch (err) {
      console.error("Error loading jobs:", err);
      setError("Unable to load current openings. Please try again shortly.");
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/jobs/department-counts`);

      if (!res.ok) {
        throw new Error("Failed to fetch departments");
      }

      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
      setDeptError("");
    } catch (err) {
      console.error("Error loading departments:", err);
      setDeptError("Unable to load department information at this time.");
    }
  };

  const toggleJobs = () => {
    setExpanded((prev) => !prev);
  };

  const searchJobs = async () => {
    if (!skill.trim() && !location.trim()) {
      loadJobs();
      return;
    }

    try {
      const res = await fetch(
        `${getApiBaseUrl()}/jobs/search?skill=${encodeURIComponent(
          skill
        )}&location=${encodeURIComponent(location)}`
      );

      if (!res.ok) {
        throw new Error("Failed to search jobs");
      }

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setAllJobs([]);
        setExpanded(true);
        setError("No matching openings found. Refine your search and try again.");
        return;
      }

      setAllJobs(data);
      setExpanded(true);
      setError("");
    } catch (err) {
      console.error("Search error:", err);
      setError("Something went wrong. Please try again later.");
    }
  };

  const handleViewJobs = (department) => {
    const targetUrl = `/user/jobs?department=${encodeURIComponent(department)}`;
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.setItem("redirectAfterLogin", targetUrl);
      navigate("/login");
      return;
    }

    navigate(targetUrl);
  };

  const jobsToShow = expanded ? allJobs : allJobs.slice(0, 3);

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-navbar">
          <div className="home-logo">
            <img src="/images/logo.png" alt="Gradious Logo" />
            <span>Gradious Careers Portal</span>
          </div>

          <nav className="home-nav">
            <Link to="/" className="home-nav-link active">
              Home
            </Link>
            <Link to="/login" className="home-nav-link">
              Sign In
            </Link>
            <Link to="/register" className="home-nav-link home-btn-register">
              Create Account
            </Link>
          </nav>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-container home-hero-content">
          <div className="home-hero-badge">Gradious Internal Careers</div>

          <h1>Advance Your Career with Gradious</h1>
          <p>
            Access internal opportunities, manage applications in one place, and
            pursue roles that align with your skills and professional goals.
          </p>

          <div className="home-hero-stats">
            <div className="home-hero-stat-card">
              <h3>50+</h3>
              <p>Active Openings</p>
            </div>

            <div className="home-hero-stat-card">
              <h3>{departments.length}+</h3>
              <p>Teams Recruiting</p>
            </div>

            <div className="home-hero-stat-card">
              <h3>100%</h3>
              <p>Digital Applications</p>
            </div>
          </div>

          <div className="home-job-search">
            <input
              type="text"
              placeholder="Role, skill, or keyword"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            />
            <input
              type="text"
              placeholder="City or preferred location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button onClick={searchJobs}>Search Openings</button>
          </div>
        </div>
      </section>

      <section className="home-jobs-section">
        <div className="home-container">
          <div className="home-section-title">
            <div className="home-section-title-left">
              <h2>Current Openings</h2>
              <p className="home-section-subtitle">
                Recently published roles across the organization.
              </p>
            </div>

            {allJobs.length > 0 && (
              <button
                type="button"
                className="home-jobs-toggle"
                onClick={toggleJobs}
              >
                {expanded ? "Show Fewer" : "View All Roles"}
              </button>
            )}
          </div>

          <div className="home-job-grid">
            {error ? (
              <p className="home-message-box">{error}</p>
            ) : (
              jobsToShow.map((job) => (
                <div className="home-job-card" key={job.id}>
                  <h3>{job.job_title}</h3>
                  <p>
                    <strong>Department:</strong> {job.department}
                  </p>
                  <p>
                    <strong>Location:</strong> {job.location}
                  </p>
                  <p>
                    <strong>Experience:</strong> {job.experience}
                  </p>

                  <Link to={`/job-details?id=${job.id}`} className="home-btn-view">
                    View Role Details
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="home-departments">
        <div className="home-container">
          <h2>Teams Currently Recruiting</h2>
          <p className="home-departments-subtitle">
            Browse open roles by department and find positions suited to your
            expertise.
          </p>

          <div className="home-dept-grid">
            {deptError ? (
              <p className="home-message-box">{deptError}</p>
            ) : departments.length === 0 ? (
              <p className="home-message-box">Department listings are currently unavailable.</p>
            ) : (
              departments.map((dept, index) => (
                <div className="home-dept-card" key={index}>
                  <div className="home-dept-icon" aria-hidden="true">
                    {dept.department.slice(0, 2).toUpperCase()}
                  </div>
                  <h3>{dept.department}</h3>
                  <p>
                    {dept.totalJobs}{" "}
                    {dept.totalJobs === 1 ? "Active Role" : "Active Roles"}
                  </p>
                  <button
                    className="home-dept-btn"
                    onClick={() => handleViewJobs(dept.department)}
                  >
                    Browse Openings
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-top">
          <div className="home-footer-left">
            <h3>Gradious Careers</h3>
            <p>
              The official platform for internal talent mobility and career
              development at Gradious.
            </p>
          </div>

          <div className="home-footer-right">
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>
        </div>

        <div className="home-footer-bottom">
          <p>© 2026 Gradious Careers Portal. All Rights Reserved.</p>

          <div className="home-footer-social">
            <a
              href="https://www.linkedin.com/company/gradious"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-linkedin"></i>
            </a>

            <a
              href="https://github.com/gradious"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-github"></i>
            </a>

            <a
              href="https://twitter.com/gradious"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-x-twitter"></i>
            </a>

            <a
              href="https://www.instagram.com/gradious"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;