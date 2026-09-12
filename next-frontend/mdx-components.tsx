import type { MDXComponents } from "mdx/types";

const components = {
  h2: ({ children }) => <h2>{children}</h2>,
  h3: ({ children }) => <h3>{children}</h3>,
  p: ({ children }) => <p>{children}</p>,
  a: ({ children, href }) => (
    <a href={href} rel={href?.startsWith("http") ? "noreferrer" : undefined}>
      {children}
    </a>
  ),
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
