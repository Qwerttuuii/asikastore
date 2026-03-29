import { useEffect } from "react";

type SeoOptions = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  robots?: string;
};

const ensureMeta = (key: string, value: string, isProperty = false) => {
  const selector = isProperty ? `meta[property="${key}"]` : `meta[name="${key}"]`;
  let node = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!node) {
    node = document.createElement("meta");
    if (isProperty) {
      node.setAttribute("property", key);
    } else {
      node.setAttribute("name", key);
    }
    document.head.appendChild(node);
  }

  node.setAttribute("content", value);
};

const ensureCanonical = (url: string) => {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
};

export const useSeo = ({ title, description, path, image, robots }: SeoOptions) => {
  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const canonical = new URL(path || window.location.pathname, siteUrl).toString();
    const ogImage = image || "/asika-logo.jpeg";

    document.title = title;

    ensureMeta("description", description);
    ensureMeta("robots", robots || "index, follow");
    ensureMeta("og:title", title, true);
    ensureMeta("og:description", description, true);
    ensureMeta("og:type", "website", true);
    ensureMeta("og:url", canonical, true);
    ensureMeta("og:image", new URL(ogImage, siteUrl).toString(), true);
    ensureMeta("twitter:card", "summary_large_image");
    ensureMeta("twitter:title", title);
    ensureMeta("twitter:description", description);
    ensureMeta("twitter:image", new URL(ogImage, siteUrl).toString());
    ensureCanonical(canonical);
  }, [title, description, path, image, robots]);
};
