import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyMarkdownButton } from "@/components/CopyMarkdownButton";
import { Markdown } from "@/components/Markdown";
import { PAGES, docHref, readDoc } from "@/lib/docs";

type Params = { slug?: string[] };

export const dynamicParams = false;

export const generateStaticParams = (): Params[] =>
  PAGES.map(({ slug }) => ({ slug: slug === "index" ? [] : [slug] }));

const pageFor = (params: Params) => {
  const slug = params.slug?.[0] ?? "index";
  return PAGES.find((page) => page.slug === slug);
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const page = pageFor(await params);
  return { title: page ? `${page.title} | zerospikes docs` : "Docs | zerospikes" };
}

export default async function DocPage({ params }: { params: Promise<Params> }) {
  const page = pageFor(await params);
  if (!page) notFound();
  const markdown = await readDoc(page.slug);
  // The title sits in the header row beside the copy button, so the body starts after it.
  const body = markdown.replace(/^# .*\r?\n/, "");

  return (
    <div className="docs-layout">
      <nav className="docs-nav" aria-label="Documentation">
        {PAGES.map(({ slug, title }) => (
          <Link key={slug} href={docHref(slug)} aria-current={slug === page.slug ? "page" : undefined}>
            {title}
          </Link>
        ))}
      </nav>
      <article className="docs-main">
        <div className="doc-header">
          <h1>{page.title}</h1>
          <CopyMarkdownButton markdown={markdown} />
        </div>
        <div className="doc">
          <Markdown>{body}</Markdown>
        </div>
      </article>
    </div>
  );
}
