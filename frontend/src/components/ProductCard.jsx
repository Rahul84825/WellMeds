import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import Modal from "./Modal";
import PrescriptionUpload from "./PrescriptionUpload";
import { formatCurrency } from "../utils/currency";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [rxUploadOpen, setRxUploadOpen] = useState(false);
  const [localRxFile, setLocalRxFile] = useState(null);

  const productId = (product._id || product.id)?.toString();
  const favorited = isInWishlist(productId);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    
    if (product.requiresRx && !localRxFile) {
      setRxUploadOpen(true);
      return;
    }
    
    addToCart(product, 1);
  };

  const handleRxSuccess = (data) => {
    setLocalRxFile(data.fileName);
    setRxUploadOpen(false);
    // Add to cart with prescription data attached
    addToCart({ ...product, rxUploaded: true, rxFile: data.fileName }, 1);
  };

  const calculateDiscount = () => {
    if (!product.originalPrice) return null;
    const diff = product.originalPrice - product.price;
    const pct = Math.round((diff / product.originalPrice) * 100);
    return `${pct}% OFF`;
  };

  return (
    <>
      <div className="product-card-hover group relative bg-surface-container-lowest dark:bg-inverse-surface rounded-2xl md:rounded-xl border border-outline-variant dark:border-outline/40 p-3 md:p-sm flex flex-col h-full transition-all duration-300 md:hover:shadow-lg md:hover:-translate-y-1">
        
        {/* Product Image Panel */}
        <div className="relative overflow-hidden rounded-xl md:rounded-lg aspect-square bg-white dark:bg-zinc-950 flex-shrink-0">
          <img
            alt={product.name}
            className="w-full h-full object-contain p-1 md:p-2 bg-white dark:bg-zinc-950 transition-transform duration-500 md:group-hover:scale-105"
            src={product.image}
            loading="lazy"
          />
          
          {/* Quick View Overlay on Hover */}
          <div className="quick-view-overlay absolute inset-0 bg-black/25 backdrop-blur-xs flex items-center justify-center opacity-0 transform translate-y-4 transition-all duration-300 pointer-events-none md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto">
            <button
              onClick={() => setQuickViewOpen(true)}
              className="bg-white text-primary px-lg py-2 min-h-[44px] flex items-center justify-center rounded-lg font-label-md text-label-md shadow-md hover:bg-primary hover:text-white transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
            >
              Quick View
            </button>
          </div>
          
          {/* Badges */}
          {product.badge && product.badge !== "Top Rated" && (
            <span className={`absolute top-2 left-2 text-[8px] md:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 md:px-2 md:py-1 rounded shadow-sm ${
              product.badge === "Rx Required" 
                ? "bg-secondary-container text-on-secondary-container border border-secondary"
                : "bg-primary text-white"
            }`}>
              {product.badge}
            </span>
          )}

          {/* Discount Badge */}
          {product.originalPrice && (
            <span className="absolute top-2 right-2 bg-error text-white text-[8px] md:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 md:px-2 md:py-1 rounded shadow-sm">
              {calculateDiscount()}
            </span>
          )}

          {/* Wishlist Heart Icon Toggle */}
          <button
            onClick={() => toggleWishlist(product)}
            className="absolute bottom-2 right-2 w-8 h-8 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white/90 dark:bg-black/75 shadow-md hover:bg-white dark:hover:bg-black text-on-surface-variant hover:text-error active:scale-90 transition-all z-10 focus-visible:ring-2 focus-visible:ring-primary outline-none"
            title={favorited ? "Remove from wishlist" : "Add to wishlist"}
          >
            <span className={`material-symbols-outlined text-[16px] md:text-[20px] ${favorited ? "text-error" : ""}`} style={{ fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}>
              favorite
            </span>
          </button>
        </div>

        {/* Product Details Panel */}
        <div className="pt-2 md:pt-md pb-xs md:pb-sm px-1 md:px-2 flex-1 flex flex-col justify-between">
          <div className="text-left">
            <p className="text-[9px] md:text-label-sm text-on-surface-variant dark:text-surface-variant mb-1 md:mb-xs truncate uppercase tracking-wider font-semibold">
              {product.brand}
            </p>
            <Link 
              to={`/products/${product.slug || productId}`} 
              className="hover:text-primary dark:hover:text-primary-fixed-dim transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none rounded-sm"
            >
              <h3 className="font-headline-sm text-xs sm:text-sm md:text-headline-sm text-on-surface leading-tight mb-2 md:mb-md line-clamp-2 h-8 md:h-10 overflow-hidden">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="mt-2">
            {/* Price & Action */}
            <div className="flex items-center justify-between gap-1">
              <div className="text-left min-w-0 flex-1">
                <span className="text-xs sm:text-sm md:text-headline-sm font-bold md:font-black text-primary dark:text-primary-fixed-dim block sm:inline">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-on-surface-variant dark:text-surface-variant line-through text-[10px] sm:text-xs md:text-sm sm:ml-xs block sm:inline">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>

              {product.stock === 0 ? (
                <span className="text-[9px] md:text-label-sm text-error font-semibold bg-error-container/20 px-1.5 py-0.5 md:px-sm md:py-1 rounded border border-error/20 truncate">
                  Out of Stock
                </span>
              ) : product.requiresRx ? (
                <button
                  onClick={handleAddToCart}
                  className={`flex items-center justify-center gap-1.5 w-9 h-9 md:w-auto md:h-11 md:px-md md:py-2 text-white rounded-lg transition-colors shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2 outline-none shrink-0 ${
                    localRxFile 
                      ? "bg-secondary hover:bg-on-secondary-container focus-visible:ring-secondary" 
                      : "bg-primary hover:bg-primary-container focus-visible:ring-primary"
                  }`}
                  title={localRxFile ? "Rx Uploaded" : "Upload Rx"}
                >
                  <span className="material-symbols-outlined text-[16px] md:text-[18px]">
                    {localRxFile ? "verified" : "prescriptions"}
                  </span>
                  <span className="font-label-md text-label-md hidden md:inline">
                    {localRxFile ? "Rx Uploaded" : "Upload Rx"}
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-secondary text-white rounded-lg hover:bg-on-secondary-container transition-colors shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 outline-none shrink-0"
                  title="Add to Cart"
                >
                  <span className="material-symbols-outlined text-[18px] md:text-[20px]">add_shopping_cart</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Upload Modal */}
      <Modal
        isOpen={rxUploadOpen}
        onClose={() => setRxUploadOpen(false)}
        title="Upload Prescription (Rx Required)"
        maxWidth="max-w-md"
      >
        <div className="space-y-sm mb-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            You are adding a regulated prescription drug: <strong className="text-on-surface">{product.name}</strong>.
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            To proceed, upload a valid medical prescription signed by a certified practitioner.
          </p>
        </div>
        <PrescriptionUpload
          onUploadSuccess={handleRxSuccess}
          onClose={() => setRxUploadOpen(false)}
        />
      </Modal>

      {/* Quick View Modal */}
      <Modal
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        title="Product Quick View"
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col md:flex-row gap-lg">
          <div className="w-full md:w-1/2 aspect-square rounded-lg overflow-hidden bg-surface-container">
            <img alt={product.name} className="w-full h-full object-cover" src={product.image} />
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-between">
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                {product.brand}
              </p>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface mt-xs">
                {product.name}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant my-md leading-relaxed">
                {product.description}
              </p>
              <div className="flex items-center gap-sm my-md">
                <span className="text-headline-lg font-bold text-primary dark:text-primary-fixed-dim">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-on-surface-variant line-through text-body-md">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-sm pt-md border-t border-outline-variant">
              {product.requiresRx && (
                <div className="flex items-center gap-xs text-secondary font-medium text-body-sm">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Prescription Required</span>
                </div>
              )}
              
              <div className="flex gap-sm">
                <button
                  onClick={(e) => {
                    handleAddToCart(e);
                    setQuickViewOpen(false);
                  }}
                  disabled={product.stock === 0}
                  className="flex-1 bg-secondary text-white py-2 min-h-[44px] flex items-center justify-center rounded-lg font-label-md text-label-md font-bold hover:bg-on-secondary-container transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 outline-none"
                >
                  {product.stock === 0 ? "Out of Stock" : product.requiresRx ? "Upload Rx & Add" : "Add to Cart"}
                </button>
                <button
                  onClick={() => {
                    toggleWishlist(product);
                  }}
                  className="p-sm w-11 h-11 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-primary outline-none"
                  title={favorited ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <span className={`material-symbols-outlined ${favorited ? "text-error" : "text-on-surface-variant"}`} style={{ fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}>
                    favorite
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductCard;
