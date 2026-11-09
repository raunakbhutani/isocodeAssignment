import Image from "next/image";

// Keep remote car photography consistently sized and optimized across pages.
export default function CarPhoto({ src, alt, className = "", sizes = "100vw", priority = false }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
