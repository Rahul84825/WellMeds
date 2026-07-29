import React, { useState, useEffect } from "react";
import SEO from "../components/common/SEO";
import api from "../services/api";
import "./MaintenancePage.css";

import logo from "../assets/logos/logo.png";

const TOTAL_DAYS = 14;

const MaintenancePage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.post("/notifications/subscribe", { email }).catch(() => {});
    } catch (err) {
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
        <img className="logo" src={logo} alt="WellMeds" />
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
              Launching soon. Do not skip a dose of patience.
            </div>
          </div>
          <div className="field">
            <div className="k">Authorised by</div>
            <div className="v">Remy, Chief Pharmacist-in-Training 🩺</div>
          </div>

          <div className="blister-section">
            <div className="blister-label">
              <span>Your refills, ready when we open</span>
              <span className="count-text">Coming Soon</span>
            </div>
            <div className="blister" id="blister">
              {new Array(TOTAL_DAYS).fill(0).map((_, idx) => (
                <div key={idx} className="pill" />
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
