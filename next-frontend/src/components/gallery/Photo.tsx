"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./Photo.module.css";
import type { FocalPoint, PhotoProps } from "./types";

const focalPositions: Record<FocalPoint, string> = {
  center: "50% 50%",
  top: "50% 0%",
  bottom: "50% 100%",
  left: "0% 50%",
  right: "100% 50%",
  "top-left": "0% 0%",
  "top-right": "100% 0%",
  "bottom-left": "0% 100%",
  "bottom-right": "100% 100%",
};

export function Photo({
  src,
  alt,
  width,
  height,
  caption,
  focalPoint = "center",
  priority = false,
  lightbox = true,
  sizes = "(min-width: 896px) 50vw, 100vw",
}: PhotoProps) {
  if (!alt.trim()) throw new Error(`Photo "${src}" requires meaningful alt text.`);
  if (width <= 0 || height <= 0) throw new Error(`Photo "${src}" requires positive width and height.`);

  const [isOpen, setIsOpen] = useState(false);
  const dialogId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [isOpen]);

  return (
    <figure className={`${styles.photo} photo-card`} data-orientation={width >= height ? "landscape" : "portrait"}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        style={{ aspectRatio: `${width} / ${height}` }}
        aria-label={lightbox ? `Open larger view: ${alt}` : undefined}
        aria-haspopup={lightbox ? "dialog" : undefined}
        aria-controls={lightbox ? dialogId : undefined}
        onClick={() => lightbox && setIsOpen(true)}
        disabled={!lightbox}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.image}
          style={{ objectPosition: focalPositions[focalPoint] }}
        />
      </button>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}

      {isOpen && (
        <div
          id={dialogId}
          role="dialog"
          aria-modal="true"
          aria-label={`Larger view: ${alt}`}
          className={styles.overlay}
          onMouseDown={(event) => event.target === event.currentTarget && setIsOpen(false)}
        >
          <button ref={closeRef} type="button" className={styles.close} onClick={() => setIsOpen(false)} aria-label="Close larger view">
            ×
          </button>
          <div className={styles.lightboxImage}>
            <Image src={src} alt={alt} fill sizes="100vw" priority />
          </div>
          {caption && <p className={styles.lightboxCaption}>{caption}</p>}
        </div>
      )}
    </figure>
  );
}
