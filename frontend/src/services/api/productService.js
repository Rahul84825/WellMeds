import apiInstance from "./api";

export const productService = {
  /**
   * Get products with optional filters.
   * @param {Object} params - { search, category, brand, filter, sort, page, limit }
   * @returns {{ products, total, page, pages }} — full paginated response
   */
  async getProducts(params = {}) {
    const { search, category, speciality, page, limit, productType, isSurgical, surgicalCategory, isImported } = params;
    const cleanParams = {};
    if (search) cleanParams.search = search;
    if (category) cleanParams.category = category;
    if (speciality) cleanParams.speciality = speciality;
    if (page) cleanParams.page = page;
    if (limit) cleanParams.limit = limit;
    if (productType) cleanParams.productType = productType;
    if (isSurgical) cleanParams.isSurgical = isSurgical;
    if (surgicalCategory) cleanParams.surgicalCategory = surgicalCategory;
    if (isImported !== undefined) cleanParams.isImported = isImported;

    const data = await apiInstance.get("/products", { params: cleanParams });
    return {
      products: data.products || [],
      total: data.total || 0,
      page: data.page || 1,
      pages: data.pages || 1,
    };
  },

  /**
   * Convenience helper — returns just the products array.
   * Used by admin pages that don't need pagination.
   */
  async getProductsList(params = {}) {
    const { products } = await productService.getProducts({ limit: 1000, ...params });
    return products;
  },

  async getProduct(id) {
    const data = await apiInstance.get(`/products/${id}`);
    return data.product;
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

  async getSimilarProducts(id) {
    const data = await apiInstance.get(`/products/${id}/similar`);
    return data.products || [];
  },

  async getTrendingProducts() {
    const data = await apiInstance.get("/products/trending");
    return data.products || [];
  }
};
