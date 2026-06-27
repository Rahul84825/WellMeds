import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  ShoppingBag, 
  AlertCircle 
} from "lucide-react";
import { api } from "../services/api";

const CouponCarousel = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Carousel States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isHovered, setIsHovered] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Touch Swipe States
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Resize listener to manage visible cards
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load coupons", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showControls = coupons.length > visibleCount;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? coupons.length - visibleCount : prev - 1));
  }, [coupons.length, visibleCount]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= coupons.length - visibleCount ? 0 : prev + 1));
  }, [coupons.length, visibleCount]);

  // Autoplay
  useEffect(() => {
    if (!showControls || isHovered) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [showControls, isHovered, handleNext]);

  // Touch handlers for swiping
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!showControls) return;
    if (touchStart - touchEnd > 50) {
      handleNext();
    }
    if (touchStart - touchEnd < -50) {
      handlePrev();
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setToastMessage(`Coupon code "${code}" copied successfully!`);
    
    // Clear state after 3s
    setTimeout(() => {
      setCopiedCode("");
      setToastMessage("");
    }, 3000);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <section className="py-xl bg-surface-container/20 dark:bg-surface-container-high/10 transition-colors duration-300">
        <div className="max-w-max-width mx-auto px-12 sm:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
            {Array.from({ length: visibleCount }).map((_, i) => (
              <div key={i} className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/20 p-lg rounded-2xl h-[300px] flex flex-col justify-between animate-pulse">
                <div className="space-y-sm">
                  <div className="h-8 bg-surface-container dark:bg-surface-container-high rounded w-2/3"></div>
                  <div className="h-4 bg-surface-container dark:bg-surface-container-high rounded w-1/2"></div>
                  <div className="h-6 bg-surface-container dark:bg-surface-container-high rounded-lg w-1/3 mt-md"></div>
                </div>
                <div className="space-y-xs">
                  <div className="h-4 bg-surface-container dark:bg-surface-container-high rounded w-1/3"></div>
                  <div className="h-10 bg-surface-container dark:bg-surface-container-high rounded-xl w-full mt-md"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Rendering error state
  if (error) {
    return (
      <section className="py-xxl bg-surface-container/20 dark:bg-surface-container-high/10 transition-colors duration-300">
        <div className="max-w-max-width mx-auto px-margin-desktop text-center py-xl space-y-md">
          <div className="inline-flex p-sm rounded-full bg-error-container/20 text-error mb-xs">
            <AlertCircle className="w-8 h-8" />
          </div>
          <p className="font-headline-sm text-headline-sm text-on-surface">
            Failed to load active offers.
          </p>
          <p className="text-on-surface-variant dark:text-surface-variant font-body-sm max-w-sm mx-auto">
            There was a connection issue. Please retry to load current WellMeds promotions.
          </p>
          <button 
            onClick={fetchCoupons} 
            className="bg-[#004782] text-white px-lg py-md rounded-xl font-label-md hover:bg-[#003866] active:scale-95 transition-all shadow-md select-none"
          >
            Retry Connection
          </button>
        </div>
      </section>
    );
  }

  // Rendering empty state
  if (coupons.length === 0) {
    return (
      <section className="py-xxl bg-surface-container/20 dark:bg-surface-container-high/10 transition-colors duration-300">
        <div className="max-w-max-width mx-auto px-margin-desktop text-center">
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/20 p-xl rounded-2xl max-w-md mx-auto shadow-xs space-y-md">
            <p className="text-on-surface-variant dark:text-surface-variant font-body-md font-bold">
              No active offers available right now.
            </p>
            <p className="text-[12px] text-on-surface-variant/70 dark:text-surface-variant/70 leading-relaxed">
              Check back later for exclusive discounts on your chronic medications and clinical supplies.
            </p>
            <Link 
              to="/products" 
              className="inline-flex bg-[#004782] text-white px-lg py-sm rounded-xl font-label-md font-bold hover:bg-[#003866] active:scale-95 transition-all select-none"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="py-xl bg-surface-container/20 dark:bg-surface-container-high/10 transition-colors duration-300 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-max-width mx-auto relative px-12 sm:px-16">
   
        {/* Carousel Window */}
        <div className="relative overflow-hidden w-full py-2">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {coupons.map((coupon, index) => {
              const isEven = index % 2 === 0;
              const cardBgClass = isEven 
                ? "bg-gradient-to-br from-[#004782]/5 to-[#004782]/10 border-[#004782]/20 text-[#004782]"
                : "bg-gradient-to-br from-[#086b53]/5 to-[#086b53]/10 border-[#086b53]/20 text-[#086b53]";
              const codeBorderClass = isEven ? "border-[#004782]" : "border-[#086b53]";
              const codeTextClass = isEven ? "text-[#004782] dark:text-primary-fixed-dim" : "text-[#086b53] dark:text-[#84d6b9]";
              const copyButtonClass = isEven 
                ? "bg-[#004782] hover:bg-[#003866] text-white" 
                : "bg-[#086b53] hover:bg-[#054d3c] text-white";

              return (
                <div 
                  key={coupon._id || coupon.id}
                  className="px-sm shrink-0 select-none"
                  style={{ width: `${100 / visibleCount}%` }}
                >
                  {/* Coupon Ticket Card */}
                  <div className={`relative border p-lg rounded-2xl shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between h-[300px] overflow-hidden ${cardBgClass}`}>
                    
                    {/* Left Notch */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-7 bg-surface-container dark:bg-surface-container-high rounded-r-full -translate-x-[1px] border border-outline-variant/30 dark:border-outline/20 border-l-0"></div>
                    {/* Right Notch */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-7 bg-surface-container dark:bg-surface-container-high rounded-l-full translate-x-[1px] border border-outline-variant/30 dark:border-outline/20 border-r-0"></div>

                    {/* Top Content */}
                    <div>
                      <div className="flex justify-between items-start mb-sm">
                        <span className="font-extrabold text-2xl tracking-tight leading-none uppercase">
                          {coupon.discountType === "percentage" 
                            ? `${coupon.discountAmount}% OFF` 
                            : `₹${coupon.discountAmount} OFF`}
                        </span>
                        {coupon.minOrderValue > 0 && (
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">
                            Min Order: ₹{coupon.minOrderValue}
                          </span>
                        )}
                      </div>

                      {/* Dynamic Subtitle */}
                      <p className="text-on-surface-variant dark:text-surface-variant font-body-sm leading-relaxed mb-md">
                        {coupon.discountType === "percentage" 
                          ? `Get a flat ${coupon.discountAmount}% discount on prescription medicines and healthcare items.` 
                          : `Get a flat discount of ₹${coupon.discountAmount} off on purchase of eligible medical supplies.`}
                      </p>
                      
                      {/* Coupon Code Block */}
                      <div className={`border-2 border-dashed px-md py-sm rounded-lg font-mono font-extrabold tracking-widest text-center select-all inline-block ${codeBorderClass} ${codeTextClass} bg-white/50 dark:bg-black/10`}>
                        {coupon.code}
                      </div>
                    </div>

                    {/* Bottom Content */}
                    <div className="space-y-md">
                      <div className="flex justify-between items-center text-[11px] text-on-surface-variant/80 dark:text-surface-variant/80 font-medium">
                        <span>Expires: {formatDate(coupon.expiryDate)}</span>
                        <span className="font-semibold text-secondary">Verified Offer</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-sm">
                        <button
                          onClick={() => handleCopyCode(coupon.code)}
                          className={`flex-1 py-2 rounded-xl text-label-sm font-bold shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-xs cursor-pointer select-none ${copyButtonClass}`}
                        >
                          {copiedCode === coupon.code ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                        
                        <Link
                          to="/products"
                          className="px-md py-2 border border-outline-variant dark:border-outline/40 hover:bg-surface-container text-on-surface rounded-xl text-label-sm font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-xs select-none"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Shop</span>
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        {showControls && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/40 dark:border-outline/20 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container hover:scale-105 active:scale-95 transition-all shadow-md z-10 cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/40 dark:border-outline/20 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container hover:scale-105 active:scale-95 transition-all shadow-md z-10 cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Carousel Pagination Dots */}
        {showControls && (
          <div className="flex justify-center gap-sm mt-lg">
            {Array.from({ length: coupons.length - visibleCount + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === i 
                    ? "bg-[#004782] w-5" 
                    : "bg-outline-variant/60 dark:bg-outline/40 hover:bg-outline-variant dark:hover:bg-outline"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-lg py-md rounded-xl shadow-2xl z-50 animate-[fade-in_0.2s_ease-out] flex items-center gap-sm border border-outline/25">
          <Check className="w-5 h-5 text-secondary" />
          <span className="font-label-md text-label-md font-bold">{toastMessage}</span>
        </div>
      )}

    </section>
  );
};

export default CouponCarousel;
