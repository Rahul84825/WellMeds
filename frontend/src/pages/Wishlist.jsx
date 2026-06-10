import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";

const Wishlist = () => {
  const { wishlistItems, clearWishlist } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-max-width mx-auto px-margin-desktop py-xxl animate-[fade-in_0.3s_ease-out] text-center">
        <div className="max-w-md mx-auto space-y-md py-xl">
          <span className="material-symbols-outlined text-6xl text-outline mb-sm animate-pulse">favorite</span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Your Wishlist is Empty</h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Save your clinical supplies and wellness vitamins here to keep track of them easily.
          </p>
          <Link
            to="/products"
            className="inline-block bg-primary text-on-primary px-xl py-sm rounded-lg font-label-md text-label-md font-bold hover:bg-primary-container active:scale-95 transition-all shadow-md"
          >
            Browse Essentials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-max-width mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xl font-bold">My Wishlist</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
        {wishlistItems.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
