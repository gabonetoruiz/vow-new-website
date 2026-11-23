// Sectors that have at least one photo, in menu order: drives the Gallery filter chips.
import sectors from "./sectors.json" with { type: "json" };
import gallery from "./gallery.json" with { type: "json" };

export default sectors
  .filter((s) => gallery.some((p) => p.sector === s.slug))
  .map(({ slug, name }) => ({ slug, name }));
