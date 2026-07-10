import React, { useState } from "react";

import { toast } from "sonner";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Support");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    setSubmitted(true);
    setTimeout(() => {
      toast.success("Thank you for contacting MediShop! Our support agents will reach out to you shortly.");
      setName("");
      setEmail("");
      setSubject("Support");
      setMessage("");
      setSubmitted(false);
    }, 1000);
  };

  return (
    <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      <div className="text-center space-y-sm max-w-2xl mx-auto mb-xxl">
        <span className="bg-primary-container text-on-primary-container border border-primary/20 px-md py-xs rounded-full font-label-sm text-label-sm uppercase tracking-wider">
          Get in Touch
        </span>
        <h1 className="font-headline-lg text-headline-lg md:text-5xl font-bold text-primary dark:text-primary-fixed-dim">
          We are here to help
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed">
          Reach out to our clinical staff or technical support team. We generally respond within 15 minutes.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-xl">
        {/* Left Side: Contact Information */}
        <div className="w-full lg:w-96 space-y-lg">
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg space-y-md shadow-sm">
            <h3 className="font-label-md text-label-md text-on-surface font-bold pb-md border-b border-outline-variant dark:border-outline/40 mb-lg">
              Contact Details
            </h3>
            
            <div className="space-y-md text-body-sm text-on-surface-variant dark:text-surface-variant">
              <div className="flex gap-sm items-start">
                <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">call</span>
                <div>
                  <h4 className="font-label-sm text-label-sm font-bold text-on-surface">Phone Support</h4>
                  <p className="mt-xs">+1 (800) 555-MEDI</p>
                  <p className="text-[12px] opacity-75">Toll-free 24/7 hotline</p>
                </div>
              </div>

              <div className="flex gap-sm items-start">
                <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">mail</span>
                <div>
                  <h4 className="font-label-sm text-label-sm font-bold text-on-surface">Email Address</h4>
                  <p className="mt-xs">support@medishop.com</p>
                  <p className="text-[12px] opacity-75">General & regulatory inquiries</p>
                </div>
              </div>

              <div className="flex gap-sm items-start">
                <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">location_on</span>
                <div>
                  <h4 className="font-label-sm text-label-sm font-bold text-on-surface">Clinical HQ</h4>
                  <p className="mt-xs">100 Healthcare Parkway</p>
                  <p>Suite 300, Austin, TX 78701</p>
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
                <span>Monday - Friday</span>
                <span className="text-on-surface font-semibold">8:00 AM - 10:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span className="text-on-surface font-semibold">9:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="text-on-surface font-semibold">10:00 AM - 6:00 PM</span>
              </div>
              <div className="bg-secondary-container/20 text-secondary p-sm rounded-lg text-[12px] font-medium text-center">
                Emergency support line is active 24h.
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
              className="bg-primary text-on-primary font-bold px-xl py-sm rounded-lg font-label-md hover:bg-primary-container active:scale-95 transition-all inline-block disabled:opacity-50"
            >
              {submitted ? "Sending..." : "Submit Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
