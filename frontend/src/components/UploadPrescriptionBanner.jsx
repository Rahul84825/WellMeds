import React from "react";
import { NavLink } from "react-router-dom";
import uploadBannerImg from "../assets/uploads/Upload.png";

const UploadPrescriptionBanner = () => {
  return (
    <section className="py-6 md:py-8 home-section-container">
      <NavLink
        to="/upload-prescription"
        className="block transition-all duration-300 md:hover:-translate-y-1 md:hover:shadow-xl rounded-2xl overflow-hidden cursor-pointer"
      >
        <img
          src={uploadBannerImg}
          alt="Upload Prescription"
          loading="lazy"
          className="w-full h-auto block object-contain rounded-2xl"
        />
      </NavLink>
    </section>
  );
};

export default UploadPrescriptionBanner;
