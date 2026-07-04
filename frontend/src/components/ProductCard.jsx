import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import Modal from "./Modal";
import PrescriptionUpload from "./PrescriptionUpload";
import { formatCurrency } from "../utils/currency";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [rxUploadOpen, setRxUploadOpen] = useState(false);
  const [localRxFile, setLocalRxFile] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const productId = (product._id || product.id)?.toString();
  const favorited = isInWishlist(productId);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    
    if (product.requiresRx && !localRxFile) {
      setRxUploadOpen(true);
      return;
    }
    
    setIsAdding(true);
    try {
      if (product.requiresRx && localRxFile) {
        await addToCart({ ...product, rxUploaded: true, rxFile: localRxFile }, 1);
      } else {
        await addToCart(product, 1);
      }
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product to cart.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRxSuccess = (data) => {
    setLocalRxFile(data.fileName);
    setRxUploadOpen(false);
    // Add to cart with prescription data attached
    addToCart({ ...product, rxUploaded: true, rxFile: data.fileName }, 1);
    toast.success(`${product.name} added to cart with prescription!`);
  };

  const calculateDiscount = () => {
    if (!product.originalPrice || product.originalPrice <= product.price) return null;
    const diff = product.originalPrice - product.price;
    const pct = Math.round((diff / product.originalPrice) * 100);
    return `${pct}% OFF`;
  };

  const savings = product.originalPrice && product.originalPrice > product.price 
    ? product.originalPrice - product.price 
    : 0;

  // Resolve molecule
  const molecule = product.molecules && product.molecules.length > 0 ? product.molecules[0] : null;

  return (
    <>
      <div 
        role="group"
        aria-label={`Product card for ${product.name}`}
        className="group relative bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl p-sm sm:p-md flex flex-col justify-between h-full transition-all duration-300 md:hover:shadow-lg md:hover:-translate-y-1 hover:border-[#038076]/30 dark:hover:border-[#038076]/50 select-none text-left"
      >
        
        {/* Product Image Section (45-50% height) */}
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center shrink-0 h-[140px] sm:h-[160px] md:h-[180px] w-full">
          <img
            alt={product.name}
            className="max-h-[85%] max-w-[85%] object-contain p-1 transition-transform duration-500 md:group-hover:scale-105"
            src={product.image}
            loading="lazy"
          />
          
          {/* Quick View Button on Desktop Hover */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 transform translate-y-4 transition-all duration-300 pointer-events-none md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto z-10">
            <button
              onClick={() => setQuickViewOpen(true)}
              className="bg-white hover:bg-[#038076] hover:text-white text-slate-800 font-bold px-md py-2 text-xs rounded-xl shadow-md transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-[#038076] focus-visible:ring-offset-2 outline-none cursor-pointer"
            >
              Quick View
            </button>
          </div>
          
          {/* Badges Stack (Vertical top-left) */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {calculateDiscount() && (
              <span className="bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm w-fit">
                {calculateDiscount()}
              </span>
            )}
            {product.requiresRx && (
              <span className="bg-sky-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm w-fit">
                Rx Required
              </span>
            )}
            {product.stock === 0 ? (
              <span className="bg-slate-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm w-fit">
                Out of Stock
              </span>
            ) : product.stock <= 10 ? (
              <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm w-fit">
                Low Stock
              </span>
            ) : null}
            {product.badge && product.badge !== "Rx Required" && product.badge !== "Top Rated" && product.badge !== "Low Stock" && (
              <span className="bg-teal-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm w-fit">
                {product.badge}
              </span>
            )}
          </div>

          {/* Wishlist Button Overlay */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-black/75 shadow-sm hover:bg-white dark:hover:bg-black text-slate-400 hover:text-rose-600 dark:hover:text-rose-500 hover:scale-110 active:scale-90 transition-all z-10 focus-visible:ring-2 focus-visible:ring-[#038076] outline-none cursor-pointer"
            title={favorited ? "Remove from wishlist" : "Add to wishlist"}
          >
            <span className={`material-symbols-outlined text-[18px] ${favorited ? "text-rose-600 dark:text-rose-500" : ""}`} style={{ fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}>
              favorite
            </span>
          </button>
        </div>

        {/* Product Details Section */}
        <div className="pt-sm pb-xs flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            
            {/* Brand */}
            {product.brand && (
              <p className="text-[10px] md:text-[11px] text-slate-400 uppercase tracking-widest font-extrabold truncate">
                {product.brand}
              </p>
            )}

            {/* Product Title */}
            <Link 
              to={`/products/${product.slug || productId}`} 
              aria-label={`View details for ${product.name}`}
              className="block hover:text-[#038076] dark:hover:text-[#a4c9ff] transition-colors focus-visible:ring-2 focus-visible:ring-[#038076] outline-none rounded-sm"
            >
              <h3 className="font-extrabold text-[14px] sm:text-[15px] md:text-base text-slate-800 dark:text-zinc-100 leading-snug line-clamp-2 h-10 md:h-12 overflow-hidden hover:text-[#038076] dark:hover:text-[#a4c9ff] transition-colors" title={product.name}>
                {product.name}
              </h3>
            </Link>

            {/* Molecule Link (Dynamic secondary navigation) */}
            {molecule ? (
              <div className="mt-1 h-4 md:h-5">
                <Link 
                  to={`/molecules/${molecule.slug}`} 
                  aria-label={`Search other medicines containing molecule ${molecule.name}`}
                  className="inline-block text-[10px] md:text-xs font-black tracking-wider text-[#038076] dark:text-[#84d6b9] hover:underline cursor-pointer uppercase truncate max-w-full"
                  title={molecule.name}
                >
                  {molecule.name}
                </Link>
              </div>
            ) : (
              <div className="h-4 md:h-5"></div>
            )}
          </div>

          {/* Pricing & Add to Cart */}
          <div className="mt-3 space-y-md">
            
            {/* Price section */}
            <div className="flex flex-col text-left">
              <div className="flex items-baseline gap-xs">
                <span className="text-[15px] sm:text-base md:text-lg font-black text-slate-800 dark:text-zinc-100">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-slate-400 line-through text-[11px] md:text-xs font-semibold">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              
              {savings > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400 text-[10px] md:text-xs font-bold mt-0.5">
                  You Save {formatCurrency(savings)}
                </span>
              )}
            </div>

            {/* Add to Cart full-width button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              aria-label={
                product.stock === 0 
                  ? "Out of Stock" 
                  : product.requiresRx && !localRxFile 
                    ? "Upload prescription to purchase product" 
                    : `Add ${product.name} to cart`
              }
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#004782] to-[#038076] hover:opacity-95 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs shadow-xs hover:shadow-md hover:shadow-[#038076]/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer min-h-[44px]"
            >
              {isAdding ? (
                <RefreshCw className="animate-spin h-4 w-4" />
              ) : product.stock === 0 ? (
                "Out of Stock"
              ) : product.requiresRx && !localRxFile ? (
                "Upload Rx & Add"
              ) : (
                "Add to Cart"
              )}
            </button>

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
        <div className="space-y-sm mb-md text-left">
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
        <div className="flex flex-col md:flex-row gap-lg text-left">
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
                  disabled={product.stock === 0 || isAdding}
                  className="flex-1 bg-secondary text-white py-2 min-h-[44px] flex items-center justify-center rounded-lg font-label-md text-label-md font-bold hover:bg-on-secondary-container transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 outline-none"
                >
                  {isAdding ? "Adding..." : product.stock === 0 ? "Out of Stock" : product.requiresRx ? "Upload Rx & Add" : "Add to Cart"}
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
