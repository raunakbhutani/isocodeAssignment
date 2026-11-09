"use client";

import { useState } from "react";
import CarPhoto from "./car-photo";
import { InfoNotice } from "./ui";

const photos = [
  "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85",
];

export default function CarGallery({ stockId, model }) {
  // The selected placeholder photo is local UI state; it is not an inventory gallery record.
  const [activePhoto, setActivePhoto] = useState(0);

  return (
    <div>
      <div className="relative aspect-[1.25/1] overflow-hidden bg-[#efefec] sm:aspect-[1.4/1]">
        <CarPhoto
          src={photos[activePhoto]}
          alt={`Placeholder image ${activePhoto + 1}; not stock unit ${stockId}`}
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority
        />
        <span className="absolute bottom-3 left-3 bg-white/95 px-3 py-2 text-[9px] uppercase tracking-[0.13em] text-[var(--ink)]">
          Placeholder image · {model}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <button
            key={photo}
            type="button"
            aria-label={`Show placeholder photo ${index + 1}`}
            aria-pressed={activePhoto === index}
            onClick={() => setActivePhoto(index)}
            className={`relative aspect-[1.5/1] overflow-hidden bg-[#efefec] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              activePhoto === index ? "ring-2 ring-[var(--accent)]" : ""
            }`}
          >
            <CarPhoto src={photo} alt={`Placeholder photo ${index + 1}`} sizes="33vw" />
          </button>
        ))}
      </div>
      <InfoNotice title="Image note:">
        These generic placeholder photographs do not depict the listed stock unit.
      </InfoNotice>
    </div>
  );
}
