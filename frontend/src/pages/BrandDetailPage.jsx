import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import PageFallback from "../components/common/PageFallback";
import { Building2, ShieldCheck, ArrowLeft, Filter, Sparkles } from "lucide-react";

const BrandDetailPage = () => {
  const { brandSlug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState("");

  const formatBrandTitle = (slug) => {
    if (!slug) return "Brand";
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const loadBrandProducts = async () => {
      setLoading(true);
      try {
        const title = formatBrandTitle(brandSlug);
        setBrandName(title);

        const res = await api.getProducts({ limit: 100 });
        const allProds = res?.products || res?.data || (Array.isArray(res) ? res : []);
        
        // Filter products matching this brand or manufacturer
        const matched = allProds.filter((p) => {
          let b = "";
          if (typeof p.brand === "string") b = p.brand;
          else if (p.brand && typeof p.brand === "object" && p.brand.name) b = p.brand.name;
          else if (typeof p.manufacturer === "string") b = p.manufacturer;

          const pSlug = b.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          return pSlug === brandSlug.toLowerCase() || b.toLowerCase().includes(title.toLowerCase());
        });

        setProducts(matched.length > 0 ? matched : allProds.slice(0, 12)); // Fallback showcase
      } catch (err) {
        console.error("Error loading brand products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBrandProducts();
  }, [brandSlug]);

  const displayName = brandName || formatBrandTitle(brandSlug);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Brands", url: "/brands" },
    { name: displayName, url: `/brands/${brandSlug}` },
  ];

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": displayName,
    "url": `https://wellmeds.in/brands/${brandSlug}`,
    "description": `Browse authentic prescription medicines, wellness products, and healthcare formulations manufactured by ${displayName} on WellMeds.`
  };

  if (loading) return <PageFallback />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      <SEO
        title={`${displayName} Medicines & Formulations | Buy Online at WellMeds`}
        description={`Buy 100% authentic ${displayName} prescription medicines and health products online at WellMeds. Cold-chain storage, best prices, and express door delivery.`}
        canonical={`/brands/${brandSlug}`}
        breadcrumbs={breadcrumbs}
        schema={brandSchema}
      />

      {/* Header Banner */}
      <section className="bg-[#172b26] text-white py-14 px-4 border-b border-[#26453d]">
        <div className="max-w-6xl mx-auto">
          <Link
            to="/brands"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#84d6b9] hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Pharmaceutical Brands</span>
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#84d6b9] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                <Building2 className="w-4 h-4" />
                <span>WHO-GMP Certified Manufacturer</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-serif leading-tight">
                {displayName} Medications & Products
              </h1>
              <p className="mt-2 text-slate-300 text-sm max-w-2xl leading-relaxed">
                Explore genuine clinical formulations manufactured by {displayName}, stored in temperature-monitored facilities and fulfilled by licensed pharmacists.
              </p>
            </div>

            <div className="bg-[#203a34] border border-[#2e5249] p-4 rounded-xl flex items-center gap-3 shrink-0">
              <ShieldCheck className="w-8 h-8 text-[#84d6b9]" />
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">100% Authentic</div>
                <div className="text-[11px] text-slate-300">Direct Sourcing Guarantee</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product List */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#157a6d]" />
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Available Formulations ({products.length})
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Express Dispatch Available
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No specific products found for {displayName}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              We are constantly expanding our catalog. Contact our pharmacist desk for special medicine procurement.
            </p>
            <Link
              to="/products"
              className="inline-block mt-4 px-5 py-2.5 rounded-lg bg-[#157a6d] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#116257] transition-colors"
            >
              Browse All Medicines
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id || product.slug} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BrandDetailPage;
