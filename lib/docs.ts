import { readFile } from "node:fs/promises";
import path from "node:path";

/** Order of the sidebar. Each slug is a Markdown file in `public/docs`, served as-is for agents. */
export const PAGES = [
  { slug: "index", title: "Getting started" },
  { slug: "scenarios", title: "Writing scenarios" },
  { slug: "metrics", title: "Metrics" },
  { slug: "limits", title: "Limits" },
  { slug: "cli", title: "CLI and CI" },
  { slug: "api", title: "API reference" },
] as const;

export const docHref = (slug: string) => (slug === "index" ? "/docs" : `/docs/${slug}`);

export const readDoc = (slug: string) => readFile(path.join(process.cwd(), "public", "docs", `${slug}.md`), "utf8");
