export type FocalPoint =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface PhotoProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  focalPoint?: FocalPoint;
  priority?: boolean;
  lightbox?: boolean;
  sizes?: string;
}

export type CollageLayout =
  | "single"
  | "two-column"
  | "three-column"
  | "large-left"
  | "large-right"
  | "hero-two"
  | "portrait-pair"
  | "masonry"
  | "film-strip";
