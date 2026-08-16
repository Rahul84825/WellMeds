import React from "react";
import { Link } from "react-router-dom";
import uploadDesktop from "../assets/upload/upload_desktop.png";
import uploadMobile from "../assets/upload/upload_mobile.png";

/**
 * UploadPrescriptionBanner
 * Displays responsive upload banner (desktop & mobile images) redirecting to the upload prescription page.
 */
const UploadPrescriptionBanner = () => {
  return (
    <section className="py-4 md:py-6 w-full">
      <div className="home-section-container">
        <Link
          to="/upload-prescription"
          aria-label="Upload Prescription"
          className="group block w-full overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(23,43,38,0.06)] hover:shadow-[0_8px_30px_rgba(23,43,38,0.12)] transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <picture className="w-full h-auto block">
            <source media="(min-width: 768px)" srcSet={uploadDesktop} />
            <img
              src={uploadMobile}
              alt="Upload Your Prescription in Seconds - Snap a photo, we handle the rest"
              className="w-full h-auto object-cover block select-none rounded-2xl"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </Link>
      </div>
    </section>
  );
};

export default React.memo(UploadPrescriptionBanner);

