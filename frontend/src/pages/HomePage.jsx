import React, { useState } from "react";
import Hero from "../components/HeroBanner";
import CategorySection from "../components/CategorySection";
import FeaturedProductsSection from "../components/FeaturedProductsSection";
import CouponCarousel from "../components/CouponCarousel";
import WhyChooseWellMeds from "../components/WhyChooseWellMeds";
import TrustStatsBar from "../components/TrustStatsBar";
import PrescriptionCTA from "../components/PrescriptionCTA";
import SurgicalProductsSection from "../components/SurgicalProductsSection";
import TestimonialsSection from "../components/TestimonialsSection";
import FloatingConsultButton from "../components/FloatingConsultButton";
import ConsultationModal from "../components/ConsultationModal";

const HomePage = () => {
  const [consultModalOpen, setConsultModalOpen] = useState(false);

  return (
    <div className="animate-[fade-in_0.3s_ease-out]">
      {/* Hero Banner */}
      <Hero />

      {/* Shop by Category strip */}
      <CategorySection />

      {/* Featured Best Sellers Grid */}
      <FeaturedProductsSection />

      {/* Active Coupons Carousel */}
      <CouponCarousel />

      {/* Brand Value Propositions */}
      <WhyChooseWellMeds />

      {/* Trust & Clinical Statistics */}
      <TrustStatsBar />

      {/* Upload Rx Prescription CTA */}
      <PrescriptionCTA />

      {/* Surgical Devices / OTC Catalog Strip */}
      <SurgicalProductsSection />

      {/* Customer Testimonials & Reviews */}
      <TestimonialsSection />

      {/* Floating Pharmacist Consultation Call-To-Action */}
      <FloatingConsultButton onClick={() => setConsultModalOpen(true)} />

      {/* Pharmacist Consultation Details Form Modal */}
      <ConsultationModal
        isOpen={consultModalOpen}
        onClose={() => setConsultModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;
