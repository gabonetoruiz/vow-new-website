// Which sectors have photos: sector pages only link to the gallery when they do.
import gallery from "./gallery.json" with { type: "json" };

export default Object.fromEntries(
  [...new Set(gallery.map((p) => p.sector).filter(Boolean))].map((slug) => [slug, true])
);
