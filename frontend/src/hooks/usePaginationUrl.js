import { useSearchParams } from "react-router-dom";

/**
 * Custom hook to synchronize page number with URL search params (?page=N)
 * while preserving all other active URL parameters (search, category, sort, etc.)
 */
export const usePaginationUrl = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);

  const setPage = (newPage) => {
    const params = new URLSearchParams(searchParams);
    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }
    setSearchParams(params, { replace: false });
  };

  return { currentPage, setPage, searchParams, setSearchParams };
};

export default usePaginationUrl;
