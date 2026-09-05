import React from "react";
import { Link } from "react-router-dom";
import { BUSINESS_INFO, getWhatsAppLink } from "../config/businessInfo";
import wellmedsLogo from "../assets/Footer/wellmeds-lowercase-monochrome-black.png";
import facebookIcon from "../assets/Footer/facebook.svg";
import instagramIcon from "../assets/Footer/instagram.svg";
import linkedinIcon from "../assets/Footer/linkedin.svg";
import youtubeIcon from "../assets/Footer/youtube.svg";
import masterCardsImg from "../assets/Footer/master_cards.png";
import "./Footer.css";

// Centralized Navigation Columns & Route Definitions
const SPECIALTY_LINKS = [
  { label: "All Prescription Medicines", to: "/products" },
  { label: "Medicine Delivery in Pune", to: "/delivery" },
  { label: "Pharmaceutical Brands", to: "/brands" },
  { label: "Molecule Reference Index", to: "/molecules" },
  { label: "Surgical & Hospital Supplies", to: "/surgical" },
];

const HELP_LINKS = [
  { label: "Upload Doctor's Prescription", to: "/upload-prescription" },
  { label: "Patient Assistance Program", to: "/patient-assistance-program" },
  { label: "Clinical Health Library", to: "/health-library" },
  { label: "About WellMeds Pharmacy", to: "/about" },
  { label: "Contact Pharmacists", to: "/contact" },
];

const CONTACT_LINKS = [
  {
    label: BUSINESS_INFO.phoneDisplay || "+91 77987 95353",
    href: `tel:${BUSINESS_INFO.phoneRaw || "+917798795353"}`,
    isHighlight: true,
  },
  {
    label: BUSINESS_INFO.email || "info@wellmeds.in",
    href: `mailto:${BUSINESS_INFO.email || "info@wellmeds.in"}`,
    isHighlight: true,
  },
  {
    label: "WhatsApp Pharmacist Desk",
    href: getWhatsAppLink("Hello WellMeds, I need pharmacist assistance."),
    isExternal: true,
  },
  {
    label: "Baner, Pune, Maharashtra",
    to: "/contact",
  },
];

const LEGAL_LINKS = [
  { label: "Terms of Service", to: "/terms-and-conditions" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Return & Refund Policy", to: "/refund-policy" },
  { label: "Cold-Chain Shipping Policy", to: "/shipping-policy" },
  { label: "Grievance Redressal", to: "/contact" },
];

const FOOTER_COLUMNS = [
  { title: "Specialty Pharmacy", links: SPECIALTY_LINKS },
  { title: "Help & Assistance", links: HELP_LINKS },
  { title: "Contact Us", links: CONTACT_LINKS },
  { title: "Legal & Policies", links: LEGAL_LINKS },
];

const MOBILE_SECTIONS = [
  { title: "Specialty Pharmacy", links: SPECIALTY_LINKS },
  { title: "Help & Assistance", links: HELP_LINKS },
  { title: "Legal & Policies", links: LEGAL_LINKS },
];

const BOTTOM_LINKS = [
  { label: "Terms of Service", to: "/terms-and-conditions" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Return & Refund Policy", to: "/refund-policy" },
];

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/wellmeds.co?igsi=czV1MHZ5ZHBvYnZz",
    icon: instagramIcon,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/19N3wTFhe6/",
    icon: facebookIcon,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/wellmeds/",
    icon: linkedinIcon,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/channel/UCNZLS2p5bI67d03aPmSnHFQ",
    icon: youtubeIcon,
  },
];

const Footer = () => {
  const currentYear = 2026;

  return (
    <footer className="wm-footer" role="contentinfo">
      {/* Top Brand & Navigation Grid */}
      <div className="wm-footer-top">
        {/* Left Brand Area */}
        <div className="wm-footer-brand">
          <Link to="/" className="wm-logo-link" aria-label="WellMeds Home">
            <img
              className="wm-logo"
              alt="WellMeds"
              src={wellmedsLogo}
              loading="lazy"
            />
          </Link>
          <div className="wm-socials">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href || "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                title={social.name}
              >
                <img
                  src={social.icon}
                  alt={social.name}
                  className="wm-social-icon"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Desktop 4-Column Navigation */}
        <div className="wm-footer-links">
          {FOOTER_COLUMNS.map((column) => (
            <div className="wm-link-col" key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to}>{link.label}</Link>
                    ) : (
                      <a
                        href={link.href}
                        className={link.isHighlight ? "wm-contact-highlight" : undefined}
                        target={link.isExternal ? "_blank" : undefined}
                        rel={link.isExternal ? "noopener noreferrer" : undefined}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Accordion Navigation */}
      <div className="wm-footer-accordion">
        {MOBILE_SECTIONS.map((section) => (
          <details className="wm-accordion-item" key={section.title}>
            <summary className="wm-accordion-summary">
              <span>{section.title}</span>
              <svg
                className="chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <ul>
              {section.links.map((link) => (
                <li key={link.label}>
                  {link.to ? (
                    <Link to={link.to}>{link.label}</Link>
                  ) : (
                    <a
                      href={link.href}
                      className={link.isHighlight ? "wm-contact-highlight" : undefined}
                      target={link.isExternal ? "_blank" : undefined}
                      rel={link.isExternal ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </details>
        ))}

        {/* Mobile Contact Information */}
        <div className="wm-accordion-contact">
          <h4>Contacts</h4>
          <p>
            Need help? Our customer care is just a message away — available daily from 8:00 AM – 11:00 PM.
          </p>
          <a href={`tel:${BUSINESS_INFO.phoneRaw || "+917798795353"}`}>
            {BUSINESS_INFO.phoneDisplay || "+91 77987 95353"}
          </a>
          <a href={`mailto:${BUSINESS_INFO.email || "info@wellmeds.in"}`}>
            {BUSINESS_INFO.email || "info@wellmeds.in"}
          </a>
        </div>
      </div>

      {/* Payment Partners Badge Row */}
      <div className="wm-payment-row">
        <h5>Our Payment Partners</h5>
        <div className="wm-payment-badges">
          <img
            src={masterCardsImg}
            alt="Payment Partners - Cards, NetBanking, UPI"
            className="wm-payment-cards-img"
            loading="lazy"
          />
        </div>
      </div>

      {/* Footer Bottom: Medical Disclaimer & Copyright */}
      <div className="wm-footer-bottom">
        <p className="wm-disclaimer">
          <strong style={{ color: "var(--wm-footer-ink-faint)", fontWeight: 600 }}>
            Medical Disclaimer:
          </strong>{" "}
          WellMeds operates as a licensed digital retail pharmacy. Information provided on this platform is for informational and educational purposes only and is not intended as medical advice or a substitute for professional diagnosis, counsel, or treatment by a qualified healthcare practitioner. Prescription medicines (Schedule H, H1, and X) require a valid doctor's prescription from a registered medical practitioner in India.
        </p>

        <div className="wm-bottom-bar">
          <span>© {currentYear} WellMeds — Baner, Pune, Maharashtra, India</span>
          <div className="wm-bottom-links">
            {BOTTOM_LINKS.map((link) => (
              <Link key={link.label} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
