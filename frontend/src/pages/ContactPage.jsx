import { useState } from "react";

import { api } from "../services/api";
import { toast } from "sonner";
import SEO from "../components/common/SEO";

const wellmedsStoreData = {
  name: "WellMeds Pharmacy",
  address: "Shop No 3, Echelon Apartment, Baner - Pashan Link Rd, Baner",
  city: "Pune",
  state: "Maharashtra",
  pincode: "411021",
  country: "India",
  phone: "+91 7798795353",
  email: "info@wellmeds.in",
  workingHours: "08:00 AM - 11:00 PM (Mon - Sun)",
  latitude: DEFAULT_PHARMACY_LAT,
  longitude: DEFAULT_PHARMACY_LNG,
};

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Support");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitted(true);
    try {
      const res = await api.submitContactForm({ name, email, subject, message });
      toast.success(
        res.message ||
          "Thank you for contacting WellMeds! Our healthcare team will reach out to you shortly."
      );
      setName("");
      setEmail("");
      setSubject("Support");
      setMessage("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setSubmitted(false);
    }
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Contact Us", url: "/contact" },
  ];

  const contactPharmacySchema = {
    "@context": "https://schema.org",
    "@type": "Pharmacy",
    "name": "WellMeds Specialty Pharmacy",
    "url": "https://wellmeds.in/contact",
    "logo": "https://wellmeds.in/favicon.png",
    "telephone": "+91-7798795353",
    "email": "info@wellmeds.in",
    "priceRange": "₹₹",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Shop No 3, Echelon Apartment, Baner - Pashan Link Rd, Baner",
      "addressLocality": "Baner, Pune",
      "addressRegion": "Maharashtra",
      "postalCode": "411021",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 18.5590,
      "longitude": 73.7868
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "08:00",
      "closes": "23:00"
    }
  };

  return (
    <>
      <SEO
        title="Contact Us & Store Location | WellMeds Pharmacy Baner Pune"
        description="Visit WellMeds Pharmacy at Baner, Pune or contact our registered clinical pharmacists. Toll-free support, interactive store map, prescription inquiries."
        canonical="/contact"
        breadcrumbs={breadcrumbs}
        schema={contactPharmacySchema}
      />
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left space-y-xl">
        {/* Header Title */}
        <div className="text-center space-y-sm max-w-2xl mx-auto mb-lg">
          <span className="bg-primary-container text-on-primary-container border border-primary/20 px-md py-xs rounded-full font-label-sm text-label-sm uppercase tracking-wider">
            Get in Touch
          </span>
          <h1 className="font-headline-lg text-headline-lg md:text-5xl font-bold text-primary dark:text-primary-fixed-dim">
            We are here to help
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed">
            Visit our licensed retail pharmacy in Pune or submit a message below. We generally respond within 15 minutes.
          </p>
        </div>

        {/* Top Retail Store Overview Banner */}
        <div className="bg-[#038076] text-white rounded-2xl p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Licensed Retail Store
            </span>
            <h2 className="text-2xl font-extrabold text-white">WellMeds Super Speciality Pharmacy</h2>
            <p className="text-sm opacity-90 leading-relaxed max-w-xl">
              Shop No 3, Echelon Apartment, Baner - Pashan Link Rd, Baner, Pune, Maharashtra 411021. Pan-India Express Delivery & In-store pickup available.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-xs space-y-1.5 shrink-0 text-left">
            <p className="font-bold text-white">📞 Hotline: +91 7798795353</p>
            <p className="font-bold text-white">✉️ Email: info@wellmeds.in</p>
            <p className="text-white/80">🕒 Hours: 08:00 AM - 11:00 PM (Daily)</p>
          </div>
        </div>

        {/* Lower Section: Contact Info & Form */}
        <div className="flex flex-col lg:flex-row gap-xl pt-md">
          {/* Left Side: Contact Information & Hours */}
          <div className="w-full lg:w-96 space-y-lg flex-shrink-0">
            <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg space-y-md shadow-sm">
              <h3 className="font-label-md text-label-md text-on-surface font-bold pb-md border-b border-outline-variant dark:border-outline/40 mb-lg">
                Contact Details
              </h3>

              <div className="space-y-md text-body-sm text-on-surface-variant dark:text-surface-variant">
                <div className="flex gap-sm items-start">
                  <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">call</span>
                  <div>
                    <h4 className="font-label-sm text-label-sm font-bold text-on-surface">Phone Support</h4>
                    <p className="mt-xs font-semibold text-on-surface">+91 7798795353</p>
                    <p className="text-[12px] opacity-75">Order & consultation hotline</p>
                  </div>
                </div>

                <div className="flex gap-sm items-start">
                  <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">mail</span>
                  <div>
                    <h4 className="font-label-sm text-label-sm font-bold text-on-surface">Email Address</h4>
                    <p className="mt-xs font-semibold text-on-surface">info@wellmeds.in</p>
                    <p className="text-[12px] opacity-75">General & regulatory inquiries</p>
                  </div>
                </div>

                <div className="flex gap-sm items-start">
                  <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">location_on</span>
                  <div>
                    <h4 className="font-label-sm text-label-sm font-bold text-on-surface">Pharmacy Address</h4>
                    <p className="mt-xs font-medium text-on-surface">Shop No 3, Echelon Apartment</p>
                    <p>Baner - Pashan Link Rd, Baner</p>
                    <p>Pune, Maharashtra - 411021</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg space-y-md shadow-sm">
              <h3 className="font-label-md text-label-md text-on-surface font-bold pb-md border-b border-outline-variant dark:border-outline/40 mb-lg">
                Operating Hours
              </h3>
              <div className="space-y-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
                <div className="flex justify-between">
                  <span>Monday - Sunday</span>
                  <span className="text-on-surface font-semibold">08:00 AM - 11:00 PM</span>
                </div>
                <div className="bg-secondary-container/20 text-secondary p-sm rounded-lg text-[12px] font-medium text-center mt-sm">
                  ⚡ Express local delivery within 15 km radius in Pune.
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Message Submission Form */}
          <div className="flex-grow bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm">
            <h3 className="font-label-md text-label-md text-on-surface font-bold pb-md border-b border-outline-variant dark:border-outline/40 mb-lg">
              Send a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="block text-label-sm font-semibold text-on-surface">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                    placeholder="Your Name"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block text-label-sm font-semibold text-on-surface">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                    placeholder="Your Email"
                  />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="block text-label-sm font-semibold text-on-surface">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm dark:bg-inverse-surface"
                >
                  <option value="Support">General Customer Support</option>
                  <option value="Prescription">Prescription/Rx Queries</option>
                  <option value="Orders">Order Tracking & Shipping</option>
                  <option value="Feedback">Feedback & Suggestions</option>
                </select>
              </div>

              <div className="space-y-xs">
                <label className="block text-label-sm font-semibold text-on-surface">Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                  placeholder="Type your concern..."
                />
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="bg-primary text-on-primary font-bold px-xl py-sm rounded-lg font-label-md hover:bg-primary-container active:scale-95 transition-all inline-block disabled:opacity-50 shadow-xs"
              >
                {submitted ? "Sending..." : "Submit Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
