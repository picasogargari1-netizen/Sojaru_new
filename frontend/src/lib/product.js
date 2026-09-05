export function firstImage(p) {
  return p?.images?.[0]?.src || "https://placehold.co/600x750/F4EFE6/121212?text=Sojaru";
}
export function secondImage(p) {
  return p?.images?.[1]?.src || firstImage(p);
}
export function isNew(p) {
  if (!p?.date_created) return false;
  const created = new Date(p.date_created).getTime();
  return Date.now() - created < 1000 * 60 * 60 * 24 * 30;
}
export function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
}
export function discountPct(p) {
  const reg = Number(p?.regular_price || 0);
  const sale = Number(p?.sale_price || 0);
  if (!reg || !sale || sale >= reg) return 0;
  return Math.round(((reg - sale) / reg) * 100);
}
