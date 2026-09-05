import { useEffect } from "react";

function setMeta(attr, key, value) {
  if (!value) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

export function usePageMeta({ title, description, image }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) setMeta("name", "description", description);
    if (title) setMeta("property", "og:title", title);
    if (description) setMeta("property", "og:description", description);
    if (image) setMeta("property", "og:image", image);
    setMeta("property", "og:type", "website");
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href.split("?")[0]);
  }, [title, description, image]);
}
