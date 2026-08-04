import React, { useState } from "react";
import SEO from "../components/common/SEO";
import apiInstance from "../services/api/api";
import { BUSINESS_INFO, getWhatsAppLink } from "../config/businessInfo";
import "./MaintenancePage.css";

const LOGO_BASE64 =
  "data:image/png;base64,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";

const TOTAL_PILLS = 14;

const MaintenancePage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || isSubmitting) return;
    setIsSubmitting(true);
    setConfirmMsg("");
    try {
      const result = await apiInstance.post("/notifications/subscribe", { email });
      if (result?.duplicate) {
        setConfirmMsg("You\u2019re already on our waitlist!");
      } else {
        setConfirmMsg("Noted. We\u2019ll reach out the moment we open.");
      }
      setIsSubmitted(true);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        setConfirmMsg("Too many requests. Please try again in a few minutes.");
      } else if (status === 400) {
        setConfirmMsg("Please enter a valid email address.");
      } else if (status === 503) {
        setConfirmMsg("Service temporarily unavailable. Please try again shortly.");
      } else {
        setConfirmMsg("Unable to subscribe right now. Please try again.");
      }
      // Do NOT set isSubmitted — let user retry
    } finally {
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
        <img className="logo" src={LOGO_BASE64} alt="WellMeds" />
        <div className="tag">
          Specialty Pharmacy<br />
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
            <div className="v">You, and everyone who's ever waited too long for a medicine</div>
          </div>
          <div className="field">
            <div className="k">Medication</div>
            <div className="v headline">wellmeds.in — full digital pharmacy</div>
          </div>
          <div className="field">
            <div className="k">Composition</div>
            <div className="v">3,000+ SKUs across oncology, HIV, transplant, hepatitis, cardiac &amp; rare disease care</div>
          </div>
          <div className="field">
            <div className="k">Directions</div>
            <div className="v">Launching soon. Do not skip a dose of patience.</div>
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
            <div className="blister">
              {Array.from({ length: TOTAL_PILLS }).map((_, i) => (
                <div key={i} className="pill" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="cta-wrap">
        <p className="cta-lead">
          We're compounding something worth the wait.<br />
          Be the <strong>first prescription</strong> we fill.
        </p>

        <form className="notify-form" onSubmit={handleSubmit}>
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

        {isSubmitted && confirmMsg && (
          <div className="confirm-msg" style={{ display: "block" }}>
            {confirmMsg}
          </div>
        )}

        <div className="whatsapp-alt">
          Prefer WhatsApp?{" "}
          <a
            href={getWhatsAppLink("Hi, please notify me when WellMeds.in goes live!")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message us to get notified
          </a>
        </div>
      </div>

      <footer>
        <div className="row">
          <b>WellMeds</b> — Shop No 3, Echelon Apartment, Baner - Pashan Link Rd, Baner, Pune, Maharashtra 411021<br />
          +91 77987 95353 &nbsp;·&nbsp; info@wellmeds.in
          <div className="hours">OPEN DAILY · 8:00 AM – 11:00 PM</div>
        </div>
      </footer>
    </div>
  );
};

export default MaintenancePage;
