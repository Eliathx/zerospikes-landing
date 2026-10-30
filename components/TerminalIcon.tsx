/** A console window with a prompt, in 1px strokes like the copy icon, for the header of a terminal panel. */
export function TerminalIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="1.5" y="2.5" width="13" height="11" />
      <path d="M4.5 6.5l2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 10.5h3" strokeLinecap="round" />
    </svg>
  );
}
