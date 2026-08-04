import apiInstance from "./api";

let productsListCache = null;
let productsListPromise = null;
const getProductPromises = {};
const getSimilarProductPromises = {};

export const productService = {
  /**
   * Get products with optional filters.
   * @param {Object} params - { search, category, brand, filter, sort, page, limit }
   * @returns {{ products, total, page, pages }} — full paginated response
   */
  async getProducts(params = {}, config = {}) {
    const { search, category, speciality, molecule, brand, page, limit, productType, isSurgical, surgicalCategory, isGLP1Medicine, isHealthSupplement, isBestSeller, stock, rx, sortBy, sort } = params;
    const cleanParams = {};
    if (search) cleanParams.search = search;
    if (category) cleanParams.category = category;
    if (speciality) cleanParams.speciality = speciality;
    if (molecule) cleanParams.molecule = molecule;
    if (brand) cleanParams.brand = brand;
    if (page) cleanParams.page = page;
    if (limit) cleanParams.limit = limit;
    if (productType) cleanParams.productType = productType;
    if (isSurgical) cleanParams.isSurgical = isSurgical;
    if (surgicalCategory) cleanParams.surgicalCategory = surgicalCategory;
    if (isGLP1Medicine !== undefined) cleanParams.isGLP1Medicine = isGLP1Medicine;
    if (isHealthSupplement !== undefined) cleanParams.isHealthSupplement = isHealthSupplement;
    if (isBestSeller !== undefined) cleanParams.isBestSeller = isBestSeller;
    if (stock) cleanParams.stock = stock;
    if (rx) cleanParams.rx = rx;
    if (sortBy) cleanParams.sortBy = sortBy;
    if (sort) cleanParams.sort = sort;

    const data = await apiInstance.get("/products", { params: cleanParams, signal: config?.signal });
    return {
      products: data.products || [],
      total: data.totalProducts || data.total || 0,
      totalProducts: data.totalProducts || data.total || 0,
      page: data.page || data.currentPage || 1,
      currentPage: data.currentPage || data.page || 1,
      pages: data.totalPages || data.pages || 1,
      totalPages: data.totalPages || data.pages || 1,
      pageSize: data.pageSize || limit || 20,
    };
  },

  /**
   * Convenience helper — returns just the products array.
   * Used by admin pages that don't need pagination.
   */
  async getProductsList(params = {}) {
    const isDefault = !params || Object.keys(params).length === 0 || (params.limit === 1000 && Object.keys(params).length === 1);
    if (isDefault) {
      if (productsListCache) return productsListCache;
      if (productsListPromise) return productsListPromise;
      
      productsListPromise = productService.getProducts({ limit: 1000, ...params })
        .then(({ products }) => {
          productsListCache = products;
          productsListPromise = null;
          return products;
        })
        .catch((err) => {
          productsListPromise = null;
          throw err;
        });
      return productsListPromise;
    }
    const { products } = await productService.getProducts({ limit: 1000, ...params });
    return products;
  },

  async getProduct(id) {
    if (getProductPromises[id]) {
      return getProductPromises[id];
    }
    getProductPromises[id] = apiInstance.get(`/products/${id}`)
      .then(data => data.product)
      .finally(() => {
        delete getProductPromises[id];
      });
    return getProductPromises[id];
  },

  async createProduct(productData) {
    const data = await apiInstance.post("/products", productData);
    return data.product;
  },

  async updateProduct(id, updatedData) {
    const data = await apiInstance.put(`/products/${id}`, updatedData);
    return data.product;
  },

  async deleteProduct(id) {
    const data = await apiInstance.delete(`/products/${id}`);
    return data.success;
  },

  async getSubstitutes(id) {
    if (getSimilarProductPromises[id]) {
      return getSimilarProductPromises[id];
    }
    getSimilarProductPromises[id] = apiInstance.get(`/products/${id}/substitutes`)
      .then(data => data.substitutes || data.products || [])
      .finally(() => {
        delete getSimilarProductPromises[id];
      });
    return getSimilarProductPromises[id];
  },

  async getSimilarProducts(id) {
    return productService.getSubstitutes(id);
  },

  async getTrendingProducts() {
    const data = await apiInstance.get("/products/trending");
    return data.products || [];
  }
};
