import { Children, isValidElement, type ReactNode } from "react";
import styles from "./Collage.module.css";
import type { CollageLayout, PhotoProps } from "./types";

const layoutClasses: Record<CollageLayout, string> = {
  single: styles.single,
  "two-column": styles.twoColumn,
  "three-column": styles.threeColumn,
  "large-left": styles.largeLeft,
  "large-right": styles.largeRight,
  "hero-two": styles.heroTwo,
  "portrait-pair": styles.portraitPair,
  masonry: styles.masonry,
  "film-strip": styles.filmStrip,
};

const requiredPhotoCounts: Partial<Record<CollageLayout, number>> = {
  single: 1,
  "two-column": 2,
  "three-column": 3,
  "large-left": 3,
  "large-right": 3,
  "hero-two": 3,
  "portrait-pair": 2,
};

export interface CollageProps {
  layout: CollageLayout;
  children: ReactNode;
  label?: string;
}

export function Collage({ layout, children, label = "Photo gallery" }: CollageProps) {
  const count = Children.count(children);
  const requiredCount = requiredPhotoCounts[layout];
  if (requiredCount !== undefined && count !== requiredCount) {
    throw new Error(`Collage layout "${layout}" requires ${requiredCount} photo${requiredCount === 1 ? "" : "s"}; received ${count}.`);
  }
  if (count === 0) throw new Error(`Collage layout "${layout}" requires at least one photo.`);

  return (
    <section className={`${styles.collage} ${layoutClasses[layout]}`} aria-label={label} data-layout={layout}>
      {children}
    </section>
  );
}

export function AutoGallery({ children, label = "Automatic photo gallery" }: Omit<CollageProps, "layout">) {
  const photos = Children.toArray(children);
  let layout: CollageLayout;

  if (photos.length === 1) {
    layout = "single";
  } else if (photos.length === 2) {
    const bothPortrait = photos.every((photo) => {
      if (!isValidElement<PhotoProps>(photo)) return false;
      return photo.props.height > photo.props.width;
    });
    layout = bothPortrait ? "portrait-pair" : "two-column";
  } else if (photos.length === 3) {
    layout = "large-left";
  } else {
    layout = "masonry";
  }

  return <Collage layout={layout} label={label}>{photos}</Collage>;
}
