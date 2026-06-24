import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import Hero from "../components/HeroBanner";

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, prods] = await Promise.all([
          api.getCategories(),
          api.getProductsList()
        ]);
        setCategories(cats);
        // Take first 4 products for featured section
        setFeaturedProducts(Array.isArray(prods) ? prods.slice(0, 4) : []);
      } catch (err) {
        console.error("Failed to load homepage data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("MEDISTART20");
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-[fade-in_0.3s_ease-out]">
      {/* Hero Section */}
      <Hero />

      {/* Promo Banner */}
      <section className="py-xxl max-w-max-width mx-auto px-margin-desktop">
        <div className="bg-primary dark:bg-primary-container rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row items-center border border-outline-variant/30">
          <div className="flex-1 p-xl md:p-xxl text-left">
            <h2 className="font-headline-lg text-headline-lg text-on-primary mb-lg">
              20% off your first order
            </h2>
            <p className="text-on-primary-container dark:text-primary-fixed font-body-lg text-body-lg mb-xl opacity-95">
              Get premium healthcare products delivered to your doorstep with an exclusive first-time buyer discount.
            </p>
            <div className="flex flex-wrap items-center gap-md">
              <div className="bg-white/10 dark:bg-black/20 border-2 border-dashed border-white/30 dark:border-outline/40 px-xl py-md rounded-xl text-on-primary font-headline-sm tracking-widest">
                MEDISTART20
              </div>
              <button
                onClick={handleCopyCoupon}
                className="bg-white dark:bg-inverse-surface text-primary dark:text-primary-fixed-dim px-xl py-md rounded-lg font-label-md font-bold hover:bg-surface-container-low transition-all active:scale-95"
              >
                {copiedCoupon ? "Copied!" : "Copy Code"}
              </button>
            </div>
          </div>
          <div className="flex-1 w-full h-64 md:h-80 relative overflow-hidden">
            <img
              alt="Pharmacist promo"
              className="w-full h-full object-cover rounded-lg"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxr9a9BZ7uZjIAgex8m212dSE8oZZ378LNCU61QGXYiMVdzxsG7VdTm6Rz8IBPUYF4QDggHvH8mNE7T9JJ0xU_KRS4rGJxd9ALF41K5WOQ10jORgrxEpdL3g31lRZ4h2wVw90K3eRqgUj81M3CfGZnZlmZx_lCfqZQh1zFwQZ0QwJ_RJ4cgnuvYFdI8p6wrgDYk84FNG-ScPB4TEzFpsIfMP-cwpsWk1DJbBYIUlwY0vXhXeVslg_ayRcNmBJONkn4LOG2mm31M7fi"
            />
          </div>
        </div>
      </section>

      {/* Category Strip */}
      <section className="py-xl bg-surface-container-lowest dark:bg-surface-container-high transition-colors duration-300">
        <div className="max-w-max-width mx-auto px-margin-desktop">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Shop by Category</h2>
            <Link to="/products" className="text-primary dark:text-primary-fixed-dim font-label-md hover:underline">
              View All
            </Link>
          </div>
          <div className="flex overflow-x-auto pb-md gap-md no-scrollbar snap-x custom-scrollbar">
            {categories.map((cat) => (
              <CategoryCard key={(cat._id || cat.id)?.toString()} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Best Sellers */}
      <section className="py-xxl max-w-max-width mx-auto px-margin-desktop">
        <div className="flex items-center justify-between mb-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface">Best Sellers</h2>
          <Link to="/products" className="text-primary dark:text-primary-fixed-dim font-label-md hover:underline flex items-center gap-xs">
            <span>Browse Products</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
          {featuredProducts.map((prod) => (
            <ProductCard key={(prod._id || prod.id)?.toString()} product={prod} />
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-xxl bg-surface-container dark:bg-surface-container-high transition-colors duration-300">
        <div className="max-w-max-width mx-auto px-margin-desktop text-center mb-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface">Why trust MediShop?</h2>
          <p className="text-on-surface-variant dark:text-surface-variant font-body-md mt-sm">
            Your health is our priority, backed by professional verification standards.
          </p>
        </div>
        <div className="max-w-max-width mx-auto px-margin-desktop grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
          <div className="flex flex-col items-center text-center p-md bg-surface-container-lowest dark:bg-inverse-surface rounded-xl border border-outline-variant dark:border-outline/40">
            <div className="w-16 h-16 bg-primary-fixed dark:bg-surface-container rounded-full flex items-center justify-center mb-lg text-primary dark:text-primary-fixed-dim">
              <span className="material-symbols-outlined text-3xl">local_shipping</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm mb-sm">Fast Delivery</h3>
            <p className="text-on-surface-variant dark:text-surface-variant font-body-sm">
              Get your prescriptions within 24 hours in most cities.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-md bg-surface-container-lowest dark:bg-inverse-surface rounded-xl border border-outline-variant dark:border-outline/40">
            <div className="w-16 h-16 bg-secondary-fixed dark:bg-surface-container rounded-full flex items-center justify-center mb-lg text-secondary dark:text-secondary-fixed-dim">
              <span className="material-symbols-outlined text-3xl">verified</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm mb-sm">100% Genuine</h3>
            <p className="text-on-surface-variant dark:text-surface-variant font-body-sm">
              All products are sourced directly from verified manufacturers.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-md bg-surface-container-lowest dark:bg-inverse-surface rounded-xl border border-outline-variant dark:border-outline/40">
            <div className="w-16 h-16 bg-tertiary-fixed dark:bg-surface-container rounded-full flex items-center justify-center mb-lg text-tertiary dark:text-tertiary-fixed-dim">
              <span className="material-symbols-outlined text-3xl">support_agent</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm mb-sm">Expert Support</h3>
            <p className="text-on-surface-variant dark:text-surface-variant font-body-sm">
              Consult with our pharmacists anytime via live chat.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-md bg-surface-container-lowest dark:bg-inverse-surface rounded-xl border border-outline-variant dark:border-outline/40">
            <div className="w-16 h-16 bg-error-container/20 rounded-full flex items-center justify-center mb-lg text-error">
              <span className="material-symbols-outlined text-3xl">lock_open</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm mb-sm">Secure Checkout</h3>
            <p className="text-on-surface-variant dark:text-surface-variant font-body-sm">
              Your medical data and payments are encrypted and safe.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-xxl max-w-max-width mx-auto px-margin-desktop">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-xl text-center">What our customers say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="bg-surface-container-lowest dark:bg-inverse-surface p-lg rounded-xl border border-outline-variant dark:border-outline/40 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex gap-1 text-secondary mb-lg">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="font-body-md text-body-md text-on-surface dark:text-on-surface italic mb-lg">
                "The fast delivery saved me when I ran out of my insulin. MediShop is a lifesaver!"
              </p>
            </div>
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden">
                <img
                  alt="Customer"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1qqFDPjz3Mr8onJQ_6cbTaWVtMMoFCE-6sTlTgkcqLOKLEU7U3qWgl5neLi-aExwyKcNlOuGK-jbKREv0LmfG8eMYE5dhyYdml4NKYqh4jZZ2II3rQMplB5l1wdrg1iQYa8NUGFdLEAwtlT52u8uBWQBJ-cy9N9Vy-zcunLCewUWgbW3Qv1O3vsKGczS5bkVn8SqR5U8VoIf7kgX8sA9FPbOVUcKMKSC7eL7KLtU2azZeiAd1cJmdoYS_ASeVhCh_u3Th9Vj86YqO"
                />
              </div>
              <div>
                <p className="font-label-md text-label-md font-bold text-on-surface">Sarah Johnson</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Verified Buyer</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest dark:bg-inverse-surface p-lg rounded-xl border border-outline-variant dark:border-outline/40 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex gap-1 text-secondary mb-lg">
                {[...Array(4)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>star</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface dark:text-on-surface italic mb-lg">
                "I appreciate the prescription verification process. It feels very secure and professional."
              </p>
            </div>
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden">
                <img
                  alt="Customer"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAphcqGx1fnNXyk5p_UtWhj_s54is7crJPOrdv-bdBBDjM48or3uFwhmUtrwjHBoS1DJjVoeJj_btREqdZQp1g8-Lbe94PGnvb7v74XRz3Aj5VYtoE_hsUmosd8fMoqz5B1wG6_vhc7YoDq_71RmIVWjnpqzvXZxpze9TDRNG6lLxdGwlgGCRNwIxQYR4QhQxhmRZ83e3lkrp7IfWJFRkhX5qm5siC1CD7CtiAQWlmqIP7k1wOHo5Oz12fYUEJvrtFjgc-vKMHgMYEb"
                />
              </div>
              <div>
                <p className="font-label-md text-label-md font-bold text-on-surface">Mark Davis</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Regular Customer</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest dark:bg-inverse-surface p-lg rounded-xl border border-outline-variant dark:border-outline/40 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex gap-1 text-secondary mb-lg">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="font-body-md text-body-md text-on-surface dark:text-on-surface italic mb-lg">
                "Best prices for chronic medication. The prescription log feature is incredibly convenient."
              </p>
            </div>
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden">
                <img
                  alt="Customer"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzX8IBvLldjApG9rj0bhInruyvu-5aL0N1oxJh_FTwZPrSp-FgL1WRGlIEfV3Y_PWkw-2-NDTounyW9TTY9wBzEwHTYngSzgjsDPCTEAeAWD9F8uBdH1ZcIR5y57r78mVrBrM9Uzb7aS4c7PglCbbJP9onxrTgjrX4gZ7S8BPqo-hMQBmY2PA1UcbiDGWBKVeJcK3h5uLrxW9aXyVN90BPOKREzBHrZpFQ3q94AOMP_n5vi2_Mns5utqL-QlOVKMMEWWHRlPIou5Mg"
                />
              </div>
              <div>
                <p className="font-label-md text-label-md font-bold text-on-surface">Emily Chen</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Verified Buyer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAB chat support */}
      <button
        onClick={() => setConsultModalOpen(true)}
        className="fixed bottom-xl right-xl bg-primary text-on-primary w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <span className="material-symbols-outlined text-3xl">chat_bubble</span>
        <span className="absolute right-full mr-sm bg-inverse-surface text-inverse-on-surface px-md py-sm rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Talk to a Pharmacist
        </span>
      </button>

      {/* Pharmacist Consultation Modal */}
      <Modal
        isOpen={consultModalOpen}
        onClose={() => setConsultModalOpen(false)}
        title="Consult with a Pharmacist"
        maxWidth="max-w-md"
      >
        <div className="space-y-md text-left">
          <div className="flex items-center gap-md bg-surface-container p-md rounded-xl">
            <div className="h-12 w-12 rounded-full overflow-hidden border border-outline-variant">
              <img
                alt="Pharmacist avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxr9a9BZ7uZjIAgex8m212dSE8oZZ378LNCU61QGXYiMVdzxsG7VdTm6Rz8IBPUYF4QDggHvH8mNE7T9JJ0xU_KRS4rGJxd9ALF41K5WOQ10jORgrxEpdL3g31lRZ4h2wVw90K3eRqgUj81M3CfGZnZlmZx_lCfqZQh1zFwQZ0QwJ_RJ4cgnuvYFdI8p6wrgDYk84FNG-ScPB4TEzFpsIfMP-cwpsWk1DJbBYIUlwY0vXhXeVslg_ayRcNmBJONkn4LOG2mm31M7fi"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-label-md text-label-md font-bold text-on-surface">Dr. Claire Wilson, PharmD</p>
              <p className="text-body-sm text-secondary font-medium">Online & Ready to Help</p>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Need advice on medication dosage, interactions, or finding alternatives? Leave your concern below, and our pharmacist will contact you in minutes.
          </p>
          <div className="space-y-md">
            <label className="block text-label-sm font-semibold text-on-surface">Your Message</label>
            <textarea
              placeholder="Type your health concern or prescription query here..."
              rows={4}
              className="w-full p-md bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => {
              alert("Consultation request sent! A licensed pharmacist will reach out to you shortly.");
              setConsultModalOpen(false);
            }}
            className="w-full bg-primary text-on-primary py-sm rounded-lg font-label-md text-label-md font-bold hover:bg-primary-container active:scale-95 transition-all"
          >
            Submit Request
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;
