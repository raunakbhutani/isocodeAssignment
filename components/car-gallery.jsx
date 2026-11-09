"use client";

import { useState } from "react";
import CarPhoto from "./car-photo";
import { InfoNotice } from "./ui";

const photos = [
  "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85",
];

export default function CarGallery({ stockId, model, images = [] }) {
  const gallery = images.length
    ? images.map((image) => ({ src: image.url, alt: image.altText, isAssumed: image.isAssumed }))
    : photos.map((src, index) => ({
        src,
        alt: `Placeholder photo ${index + 1}; not stock unit ${stockId}`,
        isAssumed: true,
      }));
  const [activePhoto, setActivePhoto] = useState(0);

  return (
    <div>
      <div className="relative aspect-[1.25/1] overflow-hidden bg-[#efefec] sm:aspect-[1.4/1]">
        <CarPhoto
          src={gallery[activePhoto].src}
          alt={gallery[activePhoto].alt}
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority
        />
        <span className="absolute bottom-3 left-3 bg-white/95 px-3 py-2 text-[9px] uppercase tracking-[0.13em] text-[var(--ink)]">
          {gallery[activePhoto].isAssumed ? `Placeholder image · ${model}` : model}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {gallery.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            aria-label={`Show vehicle photo ${index + 1}`}
            aria-pressed={activePhoto === index}
            onClick={() => setActivePhoto(index)}
            className={`relative aspect-[1.5/1] overflow-hidden bg-[#efefec] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              activePhoto === index ? "ring-2 ring-[var(--accent)]" : ""
            }`}
          >
            <CarPhoto src={image.src} alt={image.alt} sizes="33vw" />
          </button>
        ))}
      </div>
      {gallery[activePhoto].isAssumed && (
        <InfoNotice title="Image note:">
          These placeholder photographs do not depict the listed stock unit.
        </InfoNotice>
      )}
    </div>
  );
}
