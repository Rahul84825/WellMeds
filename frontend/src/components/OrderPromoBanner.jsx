import React from "react";
import { Link } from "react-router-dom";
import orderDesktop from "../assets/promo/order_desktop.png";
import orderMobile from "../assets/promo/order_mobile.png";

/**
 * OrderPromoBanner
 * Displays responsive promotional delivery banner (desktop & mobile images) redirecting to products page.
 */
const OrderPromoBanner = () => {
  return (
    <section className="py-4 md:py-6 w-full">
      <div className="home-section-container">
        <Link
          to="/products"
          aria-label="Order Life-Saving Medicines Fast"
          className="group block w-full overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(23,43,38,0.06)] hover:shadow-[0_8px_30px_rgba(23,43,38,0.12)] transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <picture className="w-full h-auto block">
            <source media="(min-width: 768px)" srcSet={orderDesktop} />
            <img
              src={orderMobile}
              alt="Because some medicines can't wait - Life-saving medicines delivered as fast as 3 hours across Pune"
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

export default React.memo(OrderPromoBanner);
