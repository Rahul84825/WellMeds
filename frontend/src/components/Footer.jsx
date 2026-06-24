import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-surface-container-lowest dark:bg-inverse-surface w-full py-xxl border-t border-outline-variant dark:border-outline transition-colors duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-lg px-margin-desktop max-w-max-width mx-auto">
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <Link to="/" className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim mb-md block">
            MediShop
          </Link>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant mb-md max-w-xs leading-relaxed">
            Your trusted online pharmacy for quality healthcare products, prescription fulfillment, and expert medical advice since 2024.
          </p>
          <div className="flex gap-md">
            <a href="#" className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">public</span>
            </a>
            <a href="#" className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">forum</span>
            </a>
            <a href="#" className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">mail</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim mb-md">Shop</h4>
          <ul className="flex flex-col gap-sm">
            <li>
              <Link to="/products?category=Prescription" className="text-on-surface-variant dark:text-surface-variant hover:underline font-body-sm text-body-sm">
                Prescriptions
              </Link>
            </li>
            <li>
              <Link to="/products?category=Vitamins" className="text-on-surface-variant dark:text-surface-variant hover:underline font-body-sm text-body-sm">
                Vitamins & Supplements
              </Link>
            </li>
            <li>
              <Link to="/products?category=Medical Devices" className="text-on-surface-variant dark:text-surface-variant hover:underline font-body-sm text-body-sm">
                Medical Devices
              </Link>
            </li>
            <li>
              <Link to="/products?category=Personal Care" className="text-on-surface-variant dark:text-surface-variant hover:underline font-body-sm text-body-sm">
                Personal Care
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim mb-md">Company</h4>
          <ul className="flex flex-col gap-sm">
            <li>
              <Link to="/about" className="text-on-surface-variant dark:text-surface-variant hover:underline font-body-sm text-body-sm">
                About Us
              </Link>
            </li>
            <li>
              <a href="#" className="text-on-surface-variant dark:text-surface-variant hover:underline font-body-sm text-body-sm">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="text-on-surface-variant dark:text-surface-variant hover:underline font-body-sm text-body-sm">
                Health Blog
              </a>
            </li>
            <li>
              <a href="#" className="text-on-surface-variant dark:text-surface-variant hover:underline font-body-sm text-body-sm">
                Press Kit
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim mb-md">Support</h4>
          <ul className="flex flex-col gap-sm">
            <li>
              <Link to="/contact" className="text-on-surface-variant dark:text-surface-variant hover:underline font-body-sm text-body-sm">
                Contact Support
              </Link>
            </li>
            <li>
              <a href="#" className="text-on-surface-variant dark:text-surface-variant hover:underline font-body-sm text-body-sm">
                Returns & Shipping Policy
              </a>
            </li>
            <li>
              <a href="#" className="text-on-surface-variant dark:text-surface-variant hover:underline font-body-sm text-body-sm">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="text-on-surface-variant dark:text-surface-variant hover:underline font-body-sm text-body-sm">
                Accessibility
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-max-width mx-auto px-margin-desktop mt-xl pt-lg border-t border-outline-variant dark:border-outline/30 flex flex-col md:flex-row justify-between items-center gap-md">
        <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant opacity-70">
          © 2026 MediShop. All rights reserved.
        </p>
        <div className="flex items-center gap-md grayscale opacity-50 dark:invert">
          <span className="material-symbols-outlined" title="Secure Payments">payments</span>
          <span className="material-symbols-outlined" title="Credit Cards">credit_card</span>
          <span className="material-symbols-outlined" title="Wallets">account_balance_wallet</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
