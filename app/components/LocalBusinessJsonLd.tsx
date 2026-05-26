import { localBusiness, siteSeo } from "../config/seo";
import { hero, storeMap } from "../config/home";
import { getSiteUrl } from "../lib/site-url";

export function LocalBusinessJsonLd() {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PetStore",
    name: localBusiness.name,
    url: siteUrl.toString(),
    image: new URL(hero.image.src, siteUrl).toString(),
    description: siteSeo.description,
    telephone: localBusiness.telephone,
    priceRange: localBusiness.priceRange,
    address: {
      "@type": "PostalAddress",
      ...localBusiness.address,
    },
    openingHours: localBusiness.openingHours,
    areaServed: localBusiness.areaServed.map((area) => ({
      "@type": "Place",
      name: area,
    })),
    serviceArea: {
      "@type": "Place",
      name: "上海市普陀区及周边社区",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "宠物洗护与护理服务",
      itemListElement: localBusiness.services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service,
        },
      })),
    },
    hasMap: storeMap.mapUrl,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
