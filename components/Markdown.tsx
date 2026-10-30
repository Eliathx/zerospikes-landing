import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { docHref } from "@/lib/docs";
import { CodeBlock } from "./CodeBlock";

const components: Components = {
  // Fenced blocks go through CodeBlock; inline code (no newline, no language) stays a plain <code>.
  pre: ({ children }) => <>{children}</>,
  code: ({ node, className, children }) => {
    const text = String(children);
    const lang = /language-(\w+)/.exec(className ?? "")?.[1];
    if (!lang && !text.includes("\n")) return <code>{children}</code>;
    // The fence's extra words: ```ts title="playwright.config.ts"
    const meta = (node?.data as { meta?: string } | undefined)?.meta ?? "";
    const title = /title="([^"]+)"/.exec(meta)?.[1];
    return <CodeBlock lang={lang} title={title} code={text.replace(/\n$/, "")} />;
  },
  a: ({ href = "", children }) => {
    // Pages link to each other as `x.md`, which is what agents read.
    const page = /^(?:\.\/)?([a-z-]+)\.md(#.*)?$/.exec(href);
    if (page) return <Link href={`${docHref(page[1])}${page[2] ?? ""}`}>{children}</Link>;
    return /^https?:/.test(href) ? (
      <a href={href} rel="noopener">
        {children}
      </a>
    ) : (
      <a href={href}>{children}</a>
    );
  },
};

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
