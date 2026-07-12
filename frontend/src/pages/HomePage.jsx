import React, { useState } from "react";
import Hero from "../components/HeroBanner";
import QuickActionCards from "../components/QuickActionCards";
import PromoCarousel from "../components/home/PromoCarousel";
import CategorySection from "../components/CategorySection";
import FeaturedProductsSection from "../components/FeaturedProductsSection";
import CouponCarousel from "../components/CouponCarousel";
import WhyChooseWellMeds from "../components/WhyChooseWellMeds";
import clinicalBannerImg from "../assets/clinical/clinical_Excellence.png";
import UploadPrescriptionBanner from "../components/UploadPrescriptionBanner";
import WellnessProductsSection from "../components/WellnessProductsSection";
import SurgicalProductsSection from "../components/SurgicalProductsSection";
import TestimonialsSection from "../components/TestimonialsSection";
import ConsultationModal from "../components/ConsultationModal";
import HomeSectionContainer from "../components/layout/HomeSectionContainer";

const HomePage = () => {
  const [consultModalOpen, setConsultModalOpen] = useState(false);

  return (
    <div className="animate-[fade-in_0.3s_ease-out]">
      {/* Hero Banner */}
      <Hero />

      {/* Quick Action Cards Section */}
      <HomeSectionContainer className="mt-7 md:mt-9">
        <QuickActionCards />
      </HomeSectionContainer>

      {/* NEW Promotional Carousel */}
      <HomeSectionContainer className="mt-8 md:mt-10">
        <PromoCarousel />
      </HomeSectionContainer>

      {/* Active Coupons Carousel */}
      <CouponCarousel />

      {/* Shop by Category strip */}
      <CategorySection />

      {/* Surgical Devices / OTC Catalog Strip */}
      <SurgicalProductsSection />

      {/* Upload Rx Prescription Banner */}
      <UploadPrescriptionBanner />

      {/* Wellness Products Section */}
      <WellnessProductsSection />

      {/* Clinical Excellence Banner */}
      <section className="mt-[40px] mb-[48px] home-section-container">
        <div className="w-full relative overflow-hidden rounded-3xl shadow-lg group hover:scale-[1.01] transition-all duration-300">
          <img
            src={clinicalBannerImg}
            alt="Clinical Excellence & Safety Assured"
            loading="lazy"
            className="w-full h-[160px] sm:h-[220px] md:h-[260px] lg:h-[300px] block object-cover rounded-3xl"
          />
        </div>
      </section>

      {/* Featured Best Sellers Grid */}
      <FeaturedProductsSection />

      {/* Brand Value Propositions */}
      <WhyChooseWellMeds />

      {/* Customer Testimonials & Reviews */}
      <TestimonialsSection />

      {/* Pharmacist Consultation Details Form Modal */}
      <ConsultationModal
        isOpen={consultModalOpen}
        onClose={() => setConsultModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;
