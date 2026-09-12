import type { MDXComponents } from "mdx/types";
import { AutoGallery, Collage, Photo } from "@/components/gallery";

const components = {
  h2: ({ children }) => <h2>{children}</h2>,
  h3: ({ children }) => <h3>{children}</h3>,
  p: ({ children }) => <p>{children}</p>,
  a: ({ children, href }) => (
    <a href={href} rel={href?.startsWith("http") ? "noreferrer" : undefined}>
      {children}
    </a>
  ),
  AutoGallery,
  Collage,
  Photo,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
