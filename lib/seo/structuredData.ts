import { env } from "../env";

export function getLocalBusinessJsonLd() {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL;

  return {
    "@context": "https://schema.org",
    "@type": "ChildCare",
    name: "Riley Day Care",
    url: baseUrl,
    telephone: "+1-972-286-0357",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1509 Haymarket Rd",
      addressLocality: "Dallas",
      addressRegion: "TX",
      postalCode: "75253",
      addressCountry: "US"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 32.678,
      longitude: -96.617
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "18:00"
      }
    ]
  };
}

