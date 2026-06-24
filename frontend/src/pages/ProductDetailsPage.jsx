import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import PrescriptionUpload from "../components/PrescriptionUpload";
import { formatCurrency } from "../utils/currency";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  const [rxUploadOpen, setRxUploadOpen] = useState(false);
  const [localRxFile, setLocalRxFile] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const prod = await api.getProduct(id);
        setProduct(prod);
        
        // Fetch related products of the same category
        const allProds = await api.getProductsList();
        const related = allProds.filter(p => p.category === prod.category && p.id !== prod.id).slice(0, 4);
        setRelatedProducts(related);
        setQuantity(1);
        setLocalRxFile(null);
      } catch (err) {
        console.error("Product fetch failed", err);
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id, navigate]);

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    
    if (product.requiresRx && !localRxFile) {
      setRxUploadOpen(true);
      return;
    }
    
    addToCart({ ...product, rxUploaded: !!localRxFile, rxFile: localRxFile }, quantity);
    alert(`${quantity} item(s) added to cart.`);
  };

  const handleRxSuccess = (data) => {
    setLocalRxFile(data.fileName);
    setRxUploadOpen(false);
    addToCart({ ...product, rxUploaded: true, rxFile: data.fileName }, quantity);
    alert(`${quantity} prescription item(s) added to cart.`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const favorited = isInWishlist(product.id);

  return (
    <div className="max-w-max-width mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      {/* Back to shop */}
      <div className="mb-xl">
        <Link 
          to="/products" 
          className="text-body-sm text-primary dark:text-primary-fixed-dim hover:underline flex items-center gap-xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none rounded-md p-1"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Main product columns */}
      <div className="flex flex-col md:flex-row gap-xl mb-xxl">
        {/* Left Column: Image */}
        <div className="w-full md:w-1/2 aspect-square rounded-xl bg-surface-container dark:bg-surface-container-high overflow-hidden border border-outline-variant dark:border-outline/40">
          <img alt={product.name} className="w-full h-full object-cover" src={product.image} />
        </div>

        {/* Right Column: Specs */}
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div className="space-y-md">
            <div>
              <span className="bg-primary-container text-on-primary-container text-label-sm font-bold uppercase tracking-widest px-sm py-1 rounded">
                {product.category}
              </span>
              {product.badge && product.badge !== "Rx Required" && (
                <span className="ml-sm bg-secondary text-white text-label-sm font-bold uppercase tracking-widest px-sm py-1 rounded">
                  {product.badge}
                </span>
              )}
            </div>
            
            <div>
              <p className="text-body-md text-on-surface-variant dark:text-surface-variant font-medium uppercase tracking-wide">
                {product.brand}
              </p>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-xs">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-sm">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: i < Math.floor(product.rating || 5) ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                {product.rating || "5.0"} ({product.reviewsCount} verified reviews)
              </span>
            </div>

            <div className="flex items-center gap-md">
              <span className="text-headline-lg md:text-4xl font-bold text-primary dark:text-primary-fixed-dim">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-on-surface-variant dark:text-surface-variant line-through text-body-lg">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant leading-relaxed">
              {product.description}
            </p>
            
            <div className="pt-md border-t border-outline-variant dark:border-outline/40 space-y-md">
              {/* Product SKU and Stock Status */}
              <div className="flex flex-wrap gap-xl text-body-sm text-on-surface-variant dark:text-surface-variant">
                <p>SKU: <span className="font-bold text-on-surface">{product.sku}</span></p>
                <p>Availability: 
                  <span className={`font-bold ml-xs ${product.stock > 10 ? "text-secondary" : product.stock > 0 ? "text-error" : "text-error"}`}>
                    {product.stock > 10 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} Left` : "Out of Stock"}
                  </span>
                </p>
              </div>

              {/* Rx Required Accent Border Box */}
              {product.requiresRx && (
                <div className="bg-secondary-container/20 border-2 border-secondary/20 rounded-xl p-md flex items-center justify-between">
                  <div className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-secondary text-[26px]">prescriptions</span>
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-secondary-container">Prescription Item</h4>
                      <p className="text-body-sm text-on-surface-variant leading-tight">
                        Requires verified physician signed Rx sheet before checkout.
                      </p>
                    </div>
                  </div>
                  {localRxFile ? (
                    <div className="flex items-center gap-xs text-secondary font-bold text-body-sm">
                      <span className="material-symbols-outlined">check_circle</span>
                      <span>Rx Attached</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRxUploadOpen(true)}
                      className="bg-secondary text-white px-md py-sm min-h-[44px] flex items-center justify-center rounded-lg font-label-md hover:bg-on-secondary-container transition-colors font-bold text-sm focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 outline-none"
                    >
                      Attach Rx
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-xl mt-xl border-t border-outline-variant dark:border-outline/40 flex flex-col sm:flex-row items-center gap-md">
            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center border border-outline-variant dark:border-outline rounded-lg bg-surface-container-low dark:bg-inverse-surface h-12">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="px-md h-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset outline-none rounded-l-lg"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <span className="px-lg font-bold text-on-surface min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock}
                  className="px-md h-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset outline-none rounded-r-lg"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            )}

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 w-full bg-primary text-on-primary font-bold h-12 rounded-lg hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              <span>{product.stock === 0 ? "Out of Stock" : product.requiresRx && !localRxFile ? "Upload Rx & Buy" : "Add to Cart"}</span>
            </button>

            {/* Wishlist button */}
            <button
              onClick={() => toggleWishlist(product)}
              className="w-12 h-12 border border-outline-variant dark:border-outline rounded-lg flex items-center justify-center hover:bg-surface-container-low dark:hover:bg-inverse-surface active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-primary outline-none"
              title={favorited ? "Remove from wishlist" : "Add to wishlist"}
            >
              <span className={`material-symbols-outlined ${favorited ? "text-error" : "text-on-surface-variant"}`} style={{ fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}>
                favorite
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-xxl border-t border-outline-variant dark:border-outline/40">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-xl">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Prescription Upload Modal */}
      <Modal
        isOpen={rxUploadOpen}
        onClose={() => setRxUploadOpen(false)}
        title="Upload Prescription (Rx Required)"
        maxWidth="max-w-md"
      >
        <div className="space-y-md mb-lg">
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
    </div>
  );
};

export default ProductDetails;
