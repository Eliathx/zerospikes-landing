import type { ReactNode } from "react";
import { Page } from "@/components/Page";
import "./docs.css";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Page
        footer={
          <span>
            Every page is also plain Markdown: <a href="/llms.txt">llms.txt</a>
          </span>
        }
      >
        {children}
      </Page>
    </>
  );
}
