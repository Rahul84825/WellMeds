import { useState, useEffect } from "react";
import { api } from "../services/api";

export const useFeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const data = await api.getProductsList();
        if (isMounted) {
          // Take first 4 products for featured section
          setFeaturedProducts(Array.isArray(data) ? data.slice(0, 4) : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { featuredProducts, loading, error };
};

export default useFeaturedProducts;
