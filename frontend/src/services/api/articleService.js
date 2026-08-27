import apiInstance from "./api";
import { fetchWithCache, clearCache } from "./cacheUtil";

export const articleService = {
  // Public: Get all articles with filter/search/sort/page
  async getArticles(params = {}) {
    const { category, topic, search, sort, page, limit } = params;
    const cleanParams = {};
    if (category) cleanParams.category = category;
    if (topic) cleanParams.topic = topic;
    if (search) cleanParams.search = search;
    if (sort) cleanParams.sort = sort;
    if (page) cleanParams.page = page;
    if (limit) cleanParams.limit = limit;

    const cacheKey = `articles:${JSON.stringify(cleanParams)}`;
    return fetchWithCache(cacheKey, async () => {
      const data = await apiInstance.get("/articles", { params: cleanParams });
      return {
        articles: data.articles || [],
        total: data.total || 0,
        page: data.page || 1,
        pages: data.pages || 1,
      };
    });
  },

  // Public: Get featured carousel articles
  async getFeaturedArticles() {
    return fetchWithCache("articles:featured", async () => {
      const data = await apiInstance.get("/articles/featured");
      return data.featured || [];
    });
  },

  // Public: Get single article by slug
  async getArticleBySlug(slug) {
    const cleanSlug = slug.replace(/\.html$/i, "");
    return fetchWithCache(`article:${cleanSlug}`, async () => {
      const data = await apiInstance.get(`/articles/${cleanSlug}`);
      return {
        article: data.article,
        related: data.related || [],
      };
    });
  },

  // Admin: Get paginated articles with status filters
  async adminGetArticles(params = {}) {
    const { search, category, topic, status, page, limit } = params;
    const cleanParams = {};
    if (search) cleanParams.search = search;
    if (category) cleanParams.category = category;
    if (topic) cleanParams.topic = topic;
    if (status) cleanParams.status = status;
    if (page) cleanParams.page = page;
    if (limit) cleanParams.limit = limit;

    const data = await apiInstance.get("/articles/admin/all", { params: cleanParams });
    return {
      articles: data.articles || [],
      total: data.total || 0,
      page: data.page || 1,
      pages: data.pages || 1,
    };
  },

  // Admin: Create article
  async createArticle(articleData) {
    const data = await apiInstance.post("/articles", articleData);
    clearCache("article");
    return data.article;
  },

  // Admin: Update article
  async updateArticle(id, articleData) {
    const data = await apiInstance.put(`/articles/${id}`, articleData);
    clearCache("article");
    return data.article;
  },

  // Admin: Delete article
  async deleteArticle(id) {
    const data = await apiInstance.delete(`/articles/${id}`);
    clearCache("article");
    return data.success;
  },

  // Admin: Seed articles
  async seedArticles() {
    const data = await apiInstance.post("/articles/seed");
    clearCache("article");
    return data;
  },
};
