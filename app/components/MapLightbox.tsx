"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { storeMap } from "../config/home";

export function MapLightbox() {
  const [isMapPreviewOpen, setIsMapPreviewOpen] = useState(false);

  useEffect(() => {
    if (!isMapPreviewOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMapPreviewOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMapPreviewOpen]);

  return (
    <>
      <div className="illustrated-map location-map-frame">
        <button
          className="location-map-trigger"
          type="button"
          onClick={() => setIsMapPreviewOpen(true)}
          aria-label="放大查看沐绒 Pet Spa 来店地图"
        >
          <Image
            className="location-map-image"
            src={storeMap.image.src}
            alt={storeMap.image.alt}
            fill
            sizes="(max-width: 880px) calc(100vw - 76px), 520px"
          />
        </button>
      </div>

      {isMapPreviewOpen ? (
        <div className="map-lightbox" role="dialog" aria-modal="true" aria-label="沐绒 Pet Spa 来店地图大图">
          <button
            className="map-lightbox-backdrop"
            type="button"
            onClick={() => setIsMapPreviewOpen(false)}
            aria-label="关闭地图大图"
          />
          <figure className="map-lightbox-panel">
            <button
              className="map-lightbox-close"
              type="button"
              onClick={() => setIsMapPreviewOpen(false)}
              aria-label="关闭地图大图"
            >
              ×
            </button>
            <Image
              src={storeMap.image.src}
              alt={storeMap.image.previewAlt}
              width={storeMap.image.width}
              height={storeMap.image.height}
              sizes="(max-width: 936px) 92vw, 860px"
            />
          </figure>
        </div>
      ) : null}
    </>
  );
}
