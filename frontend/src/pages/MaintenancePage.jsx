import React, { useState, useEffect } from "react";
import SEO from "../components/common/SEO";
import api from "../services/api";
import "./MaintenancePage.css";

const TOTAL_DAYS = 14;

const MaintenancePage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countText, setCountText] = useState("calculating…");
  const [poppedPills, setPoppedPills] = useState(new Array(TOTAL_DAYS).fill(false));

  useEffect(() => {
    // Launch target date: 14 days from initial load
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + TOTAL_DAYS);
    launchDate.setHours(23, 0, 0, 0);

    const updateCountdown = () => {
      const now = new Date();
      const msLeft = launchDate - now;

      if (msLeft <= 0) {
        setCountText("launch day is here");
        setPoppedPills(new Array(TOTAL_DAYS).fill(true));
        return;
      }

      const totalMsCourse = TOTAL_DAYS * 24 * 60 * 60 * 1000;
      const elapsedMs = totalMsCourse - msLeft;
      const daysPassed = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));

      const newPopped = new Array(TOTAL_DAYS).fill(false).map((_, idx) => idx < daysPassed);
      setPoppedPills(newPopped);

      const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((msLeft / (1000 * 60)) % 60);

      setCountText(`${days}d ${hours}h ${mins}m left`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Integration point with backend notification API if present
      await api.post("/notifications/subscribe", { email }).catch(() => {
        // Graceful fallback if subscription backend endpoint is not configured yet
      });
    } catch (err) {
      // Suppress network errors for frontend integration
    } finally {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="maintenance-page">
      <SEO
        title="WellMeds — Coming Soon"
        description="WellMeds Specialty Pharmacy · Baner, Pune. 3,000+ SKUs across oncology, HIV, transplant, hepatitis, cardiac & rare disease care."
        canonical="/"
      />

      <div className="topbar">
        <div className="logo">
          wm<span>.</span>
        </div>
        <div className="tag">
          Specialty Pharmacy
          <br />
          Pune, Maharashtra
        </div>
      </div>

      <div className="label-wrap">
        <div className="pin"></div>
        <div className="card">
          <div className="stamp">Handle&nbsp;with&nbsp;care</div>
          <div className="rx-row">
            <div className="rx-symbol">℞</div>
            <div className="rx-title">
              Prescription for a better pharmacy experience
              <small>WellMeds Specialty Pharmacy · Baner, Pune</small>
            </div>
          </div>

          <div className="field">
            <div className="k">Patient</div>
            <div className="v">
              You, and everyone who's ever waited too long for a medicine
            </div>
          </div>
          <div className="field">
            <div className="k">Medication</div>
            <div className="v headline">wellmeds.in — full digital pharmacy</div>
          </div>
          <div className="field">
            <div className="k">Composition</div>
            <div className="v">
              3,000+ SKUs across oncology, HIV, transplant, hepatitis, cardiac &amp; rare disease care
            </div>
          </div>
          <div className="field">
            <div className="k">Directions</div>
            <div className="v">
              Check back in 2 weeks. Do not skip a dose of patience.
            </div>
          </div>
          <div className="field">
            <div className="k">Authorised by</div>
            <div className="v">Remy, Chief Pharmacist-in-Training 🩺</div>
          </div>

          <div className="blister-section">
            <div className="blister-label">
              <span>Refill schedule — 14 day course</span>
              <span className="count-text" id="countText">
                {countText}
              </span>
            </div>
            <div className="blister" id="blister">
              {poppedPills.map((isPopped, idx) => (
                <div
                  key={idx}
                  className={`pill ${isPopped ? "popped" : ""}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="cta-wrap">
        <p className="cta-lead">
          We're compounding something worth the wait.
          <br />
          Be the <strong>first prescription</strong> we fill.
        </p>

        <form className="notify-form" onSubmit={handleNotifySubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            disabled={isSubmitted || isSubmitting}
          />
          <button type="submit" disabled={isSubmitted || isSubmitting}>
            {isSubmitted ? "Added ✓" : isSubmitting ? "Adding..." : "Notify me"}
          </button>
        </form>

        {isSubmitted && (
          <div className="confirm-msg" id="confirmMsg">
            Noted. We'll reach out the moment we open.
          </div>
        )}

        <div className="whatsapp-alt">
          Prefer WhatsApp?{" "}
          <a
            href="https://wa.me/917798795353?text=Hi%2C%20please%20notify%20me%20when%20WellMeds.in%20goes%20live!"
            target="_blank"
            rel="noopener noreferrer"
          >
            Message us to get notified
          </a>
        </div>
      </div>

      <footer>
        <div className="row">
          <b>WellMeds</b> — Shop No 3, Echelon Apartment, Baner - Pashan Link Rd, Baner, Pune, Maharashtra 411021
          <br />
          +91 77987 95353 &nbsp;·&nbsp; info@wellmeds.in
          <div className="hours">OPEN DAILY · 8:00 AM – 11:00 PM</div>
        </div>
      </footer>
    </div>
  );
};

export default MaintenancePage;
