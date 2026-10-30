import { createHighlighter, type Highlighter, type ThemeRegistrationRaw } from "shiki";

/** The landing's palette. Shared by every code block, landing and docs alike. */
export const COLORS = {
  text: "#dedede",
  keyword: "#ec5067",
  fn: "#52a8ff",
  string: "#56c055",
  comment: "#777a73",
  warn: "#f0bd72",
  error: "#ec5067",
} as const;

const rule = (scope: string | string[], foreground: string) => ({ scope, settings: { foreground } });

const theme: ThemeRegistrationRaw = {
  name: "zerospikes",
  type: "dark",
  fg: COLORS.text,
  bg: "transparent",
  settings: [
    rule(["keyword.control", "storage.type", "storage.modifier", "constant.language", "keyword.operator.new"], COLORS.keyword),
    rule("storage.type.function.arrow", COLORS.text),
    rule(["entity.name.function", "entity.name.command", "support.function", "constant.numeric", "support.type.property-name", "entity.name.tag"], COLORS.fn),
    // A key like `before:` is also scoped as a function name; the longer selector wins.
    rule("meta.object-literal.key entity.name.function", COLORS.text),
    rule("meta.object-literal.key punctuation", COLORS.text),
    rule("string", COLORS.string),
    rule("comment", COLORS.comment),
  ],
};

export const LANGUAGES = ["ts", "tsx", "bash", "json", "yaml"] as const;

let highlighter: Promise<Highlighter> | undefined;
export const getHighlighter = () => (highlighter ??= createHighlighter({ themes: [theme], langs: [...LANGUAGES] }));

export const isLanguage = (lang: string | undefined): lang is (typeof LANGUAGES)[number] =>
  !!lang && (LANGUAGES as readonly string[]).includes(lang);

export interface Token {
  content: string;
  color?: string;
}

/** Tokens per line, colored by the theme above. */
export async function highlight(code: string, lang: (typeof LANGUAGES)[number]): Promise<Token[][]> {
  const { tokens } = (await getHighlighter()).codeToTokens(code, { lang, theme: "zerospikes" });
  return tokens.map((line) => line.map(({ content, color }) => ({ content, color })));
}
