import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_SITE_NAME = "WellMeds";
const DEFAULT_DOMAIN = "https://wellmeds.com";
const DEFAULT_TITLE = "WellMeds — Online Pharmacy & Medical Supplies | Buy Medicines Online";
const DEFAULT_DESCRIPTION = "WellMeds is India's trusted online pharmacy delivering authentic prescription medicines, wellness products, surgical devices, and specialty healthcare directly to your doorstep.";
const DEFAULT_IMAGE = `${DEFAULT_DOMAIN}/assets/logos/logo.png`;

/**
 * Helper to dynamically create or update a <meta> tag in document <head>
 */
const updateMetaTag = (selector, attrName, attrValue, content) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content || "");
};

/**
 * Helper to dynamically create or update a <link> tag in document <head>
 */
const updateLinkTag = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
};

/**
 * Helper to inject or update JSON-LD Schema script
 */
const updateJsonLd = (schemaData, id = "json-ld-schema") => {
  let script = document.getElementById(id);
  if (!schemaData) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.setAttribute("id", id);
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schemaData);
};

const SEO = ({
  title,
  description,
  keywords,
  image,
  type = "website",
  noindex = false,
  canonical,
  schema,
  breadcrumbs,
}) => {
  const location = useLocation();
  const currentUrl = `${DEFAULT_DOMAIN}${location.pathname}`;

  const metaTitle = title ? `${title} | ${DEFAULT_SITE_NAME}` : DEFAULT_TITLE;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const metaImage = image ? (image.startsWith("http") ? image : `${DEFAULT_DOMAIN}${image}`) : DEFAULT_IMAGE;
  const metaCanonical = canonical ? (canonical.startsWith("http") ? canonical : `${DEFAULT_DOMAIN}${canonical}`) : currentUrl;
  const metaRobots = noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  useEffect(() => {
    // 1. Document Title
    document.title = metaTitle;

    // 2. Standard Meta Tags
    updateMetaTag('meta[name="description"]', "name", "description", metaDescription);
    updateMetaTag('meta[name="robots"]', "name", "robots", metaRobots);
    if (keywords) {
      updateMetaTag('meta[name="keywords"]', "name", "keywords", keywords);
    }

    // 3. Canonical Link
    updateLinkTag("canonical", metaCanonical);

    // 4. Open Graph Meta Tags (Facebook / WhatsApp / LinkedIn / Telegram)
    updateMetaTag('meta[property="og:title"]', "property", "og:title", metaTitle);
    updateMetaTag('meta[property="og:description"]', "property", "og:description", metaDescription);
    updateMetaTag('meta[property="og:image"]', "property", "og:image", metaImage);
    updateMetaTag('meta[property="og:url"]', "property", "og:url", metaCanonical);
    updateMetaTag('meta[property="og:type"]', "property", "og:type", type);
    updateMetaTag('meta[property="og:site_name"]', "property", "og:site_name", DEFAULT_SITE_NAME);

    // 5. Twitter Card Meta Tags
    updateMetaTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    updateMetaTag('meta[name="twitter:title"]', "name", "twitter:title", metaTitle);
    updateMetaTag('meta[name="twitter:description"]', "name", "twitter:description", metaDescription);
    updateMetaTag('meta[name="twitter:image"]', "name", "twitter:image", metaImage);

    // 6. JSON-LD Schemas
    let primarySchema = schema;

    // Auto-generate BreadcrumbList Schema if breadcrumbs array provided
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": crumb.name,
          "item": crumb.url?.startsWith("http") ? crumb.url : `${DEFAULT_DOMAIN}${crumb.url}`
        }))
      };

      if (primarySchema) {
        primarySchema = [primarySchema, breadcrumbSchema];
      } else {
        primarySchema = breadcrumbSchema;
      }
    }

    updateJsonLd(primarySchema);
  }, [metaTitle, metaDescription, metaImage, metaCanonical, metaRobots, type, keywords, schema, breadcrumbs]);

  return null;
};

export default SEO;
