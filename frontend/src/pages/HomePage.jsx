import React, { useState } from "react";
import Hero from "../components/HeroBanner";
import QuickActionCards from "../components/QuickActionCards";
import PromoCarousel from "../components/home/PromoCarousel";
import CategorySection from "../components/CategorySection";
import FeaturedProductsSection from "../components/FeaturedProductsSection";
import CouponCarousel from "../components/CouponCarousel";
import WhyChooseWellMeds from "../components/WhyChooseWellMeds";
import clinicalBannerImg from "../assets/clinical/clinical_Excellence.png";
import PrescriptionCTA from "../components/PrescriptionCTA";
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

      {/* Featured Best Sellers Grid */}
      <FeaturedProductsSection />

      {/* Brand Value Propositions */}
      <WhyChooseWellMeds />

      {/* Clinical Excellence Banner */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <img
            src={clinicalBannerImg}
            alt="Clinical Excellence & Safety Assured"
            loading="lazy"
            className="w-full h-auto block object-contain"
          />
        </div>
      </section>

      {/* Upload Rx Prescription CTA */}
      <PrescriptionCTA />

      {/* Surgical Devices / OTC Catalog Strip */}
      <SurgicalProductsSection />

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
