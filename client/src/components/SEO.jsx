import { useEffect } from "react";

const BASE_URL = "https://fly-high-consultancy.vercel.app";
const SITE_NAME = "Fly High Consultancy";
const DEFAULT_TITLE = `${SITE_NAME} | Study Abroad & Visa Experts in Pehowa`;
const DEFAULT_DESCRIPTION =
  "Study abroad, tourist & spouse visa experts in Pehowa. Canada, Australia, UK, USA, New Zealand & Europe, IELTS/PTE preparation, interview guidance & free consultation.";

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: BASE_URL,
  logo: `${BASE_URL}/logo.webp`,
  image: `${BASE_URL}/fly-high-og.jpg`,
  telephone: "+919306142129",
  address: {
    "@type": "PostalAddress",
    streetAddress: "2nd Floor, Amar Complex, Near New PNB Bank",
    addressLocality: "Pehowa",
    addressRegion: "Kurukshetra",
    postalCode: "136128",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 29.9806,
    longitude: 76.5814,
  },
  sameAs: [
    "https://www.instagram.com/fly.highconsultancypehowa/",
    "https://www.facebook.com/p/Flyhigh-Consultancy-Pehowa-61571970445323/",
    "https://wa.me/919306142129",
  ],
  foundingDate: "2024",
  areaServed: ["IN", "CA", "AU", "GB", "US", "NZ", "AE"],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+919306142129",
    contactType: "customer service",
    availableLanguage: ["English", "Hindi"],
  },
};

const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE_NAME,
  image: `${BASE_URL}/fly-high-og.jpg`,
  telephone: "+919306142129",
  address: {
    "@type": "PostalAddress",
    streetAddress: "2nd Floor, Amar Complex, Near New PNB Bank",
    addressLocality: "Pehowa",
    addressRegion: "Kurukshetra",
    postalCode: "136128",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 29.9806,
    longitude: 76.5814,
  },
  url: BASE_URL,
  sameAs: [
    "https://www.instagram.com/fly.highconsultancypehowa/",
    "https://www.facebook.com/p/Flyhigh-Consultancy-Pehowa-61571970445323/",
    "https://wa.me/919306142129",
  ],
  priceRange: "₹",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "19:00",
    },
  ],
};

const breadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: `${BASE_URL}${item.path}`,
  })),
});

const webPageSchema = (path, name, description) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name,
  description,
  url: `${BASE_URL}${path}`,
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE_URL,
  },
});

const SEO = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  ogImage = "/fly-high-og.jpg",
  ogType = "website",
  noIndex = false,
  schema = null,
}) => {
  const canonical = `${BASE_URL}${path}`;
  const ogUrl = canonical;
  const ogTitle = title;
  const ogDescription = description;
  const twitterTitle = title;
  const twitterDescription = description;

  useEffect(() => {
    document.title = title;

    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setProperty = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("robots", noIndex ? "noindex,nofollow" : "index,follow");

    setProperty("og:type", ogType);
    setProperty("og:site_name", SITE_NAME);
    setProperty("og:locale", "en_IN");
    setProperty("og:title", ogTitle);
    setProperty("og:description", ogDescription);
    setProperty("og:url", ogUrl);
    setProperty("og:image", `${BASE_URL}${ogImage}`);
    setProperty("og:image:secure_url", `${BASE_URL}${ogImage}`);
    setProperty("og:image:width", "1200");
    setProperty("og:image:height", "630");
    setProperty("og:image:type", "image/jpeg");
    setProperty("og:image:alt", title);

    setProperty("twitter:card", "summary_large_image");
    setProperty("twitter:title", twitterTitle);
    setProperty("twitter:description", twitterDescription);
    setProperty("twitter:image", `${BASE_URL}${ogImage}`);
    setProperty("twitter:image:alt", title);

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", canonical);

    const existingSchema = document.getElementById("seo-schema-ld");
    if (existingSchema) existingSchema.remove();

    const schemas = [
      ORGANIZATION_SCHEMA,
      LOCAL_BUSINESS_SCHEMA,
      ...(schema || []),
    ];

    schemas.forEach((s, i) => {
      const script = document.createElement("script");
      script.id = `seo-schema-ld-${i}`;
      script.type = "application/ld+json";
      script.text = JSON.stringify(s);
      document.head.appendChild(script);
    });

    return () => {
      document.querySelectorAll('[id^="seo-schema-ld-"]').forEach((el) => el.remove());
    };
  }, [
    title,
    description,
    path,
    ogImage,
    ogType,
    canonical,
    ogUrl,
    ogTitle,
    ogDescription,
    twitterTitle,
    twitterDescription,
    noIndex,
    schema,
  ]);

  return null;
};

export { SEO, ORGANIZATION_SCHEMA, LOCAL_BUSINESS_SCHEMA, breadcrumbSchema, webPageSchema };
export default SEO;
