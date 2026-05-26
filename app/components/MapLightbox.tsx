"use client";

import Image from "next/image";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { storeMap } from "../config/home";

export function MapLightbox() {
  const [isMapPreviewOpen, setIsMapPreviewOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const hasOpenedPreviewRef = useRef(false);

  const closePreview = () => {
    setIsMapPreviewOpen(false);
  };

  useEffect(() => {
    if (!isMapPreviewOpen) {
      return;
    }

    hasOpenedPreviewRef.current = true;
    closeRef.current?.focus();

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMapPreviewOpen]);

  useEffect(() => {
    if (!isMapPreviewOpen && hasOpenedPreviewRef.current) {
      triggerRef.current?.focus();
    }
  }, [isMapPreviewOpen]);

  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");

    if (!focusableElements.length) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <>
      <div className="illustrated-map location-map-frame">
        <button
          ref={triggerRef}
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
        <div
          className="map-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="沐绒 Pet Spa 来店地图大图"
          onKeyDown={trapFocus}
        >
          <button
            className="map-lightbox-backdrop"
            type="button"
            onClick={closePreview}
            aria-label="关闭地图大图"
            tabIndex={-1}
          />
          <figure className="map-lightbox-panel">
            <button
              ref={closeRef}
              className="map-lightbox-close"
              type="button"
              onClick={closePreview}
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
