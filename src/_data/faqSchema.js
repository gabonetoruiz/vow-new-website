// schema.org FAQPage markup, generated from faqs.json so the visible FAQs and the structured data never differ.
import faqs from "./faqs.json" with { type: "json" };

export default {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.flatMap((g) =>
    g.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    }))
  ),
};
