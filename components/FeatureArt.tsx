import type { ReactNode } from "react";

/*
 * Isometric line drawings for the feature cards: one object per card on the same thin
 * slab, one part of it in the accent. Shapes are placed in 3D units and projected here,
 * and the viewBox is fitted to whatever was drawn.
 */

type P = [x: number, y: number, z: number];

const UNIT = 10;
const COS30 = Math.cos(Math.PI / 6);

/** A pointer arrow in screen pixels, its tip at the origin. */
const CURSOR = "M0 0 L0 12 L3.2 9.2 L5.4 14 L7.5 13 L5.4 8.4 L9.2 8.4 Z";

class Scene {
  private els: ReactNode[] = [];
  private minX = Infinity;
  private minY = Infinity;
  private maxX = -Infinity;
  private maxY = -Infinity;

  private project([x, y, z]: P): [number, number] {
    return [(x - y) * COS30 * UNIT, ((x + y) / 2 - z) * UNIT];
  }

  private track(sx: number, sy: number) {
    this.minX = Math.min(this.minX, sx);
    this.minY = Math.min(this.minY, sy);
    this.maxX = Math.max(this.maxX, sx);
    this.maxY = Math.max(this.maxY, sy);
  }

  private points(points: P[]) {
    return points
      .map((p) => {
        const [sx, sy] = this.project(p);
        this.track(sx, sy);
        return `${sx.toFixed(1)},${sy.toFixed(1)}`;
      })
      .join(" ");
  }

  private add(el: (key: number) => ReactNode) {
    this.els.push(el(this.els.length));
  }

  /** The three faces seen from the front: +y on the left, +x on the right, the top. */
  box(x: number, y: number, z: number, w: number, d: number, h: number, className = "") {
    const faces: [string, P[]][] = [
      ["l", [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]],
      ["r", [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]],
      ["t", [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]],
    ];
    for (const [face, points] of faces) {
      const pts = this.points(points);
      this.add((key) => <polygon key={key} points={pts} className={`${face} ${className}`.trim()} />);
    }
  }

  /** A flat rectangle at height z. */
  plane(x: number, y: number, z: number, w: number, d: number, className: string) {
    const pts = this.points([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]]);
    this.add((key) => <polygon key={key} points={pts} className={className} />);
  }

  /** A circle of radius r lying flat at height z, which projects to an upright ellipse. */
  ellipse(x: number, y: number, z: number, r: number, className: string) {
    const [cx, cy] = this.project([x, y, z]);
    const rx = r * Math.SQRT2 * COS30 * UNIT;
    const ry = (r * UNIT) / Math.SQRT2;
    this.track(cx - rx, cy - ry);
    this.track(cx + rx, cy + ry);
    this.add((key) => <ellipse key={key} cx={cx.toFixed(1)} cy={cy.toFixed(1)} rx={rx.toFixed(1)} ry={ry.toFixed(1)} className={className} />);
  }

  /** An upright cylinder: its side, then its top. */
  cylinder(x: number, y: number, z: number, r: number, h: number, className = "") {
    const [cx, cy] = this.project([x, y, z]);
    const rx = r * Math.SQRT2 * COS30 * UNIT;
    const ry = (r * UNIT) / Math.SQRT2;
    const top = cy - h * UNIT;
    this.track(cx - rx, top);
    this.track(cx + rx, cy + ry);
    const d = `M${(cx - rx).toFixed(1)} ${top.toFixed(1)} V${cy.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${(cx + rx).toFixed(1)} ${cy.toFixed(1)} V${top.toFixed(1)} Z`;
    this.add((key) => <path key={key} d={d} className={`l ${className}`.trim()} />);
    this.ellipse(x, y, z + h, r, `t ${className}`.trim());
  }

  line(points: P[], className = "") {
    const pts = this.points(points);
    this.add((key) => <polyline key={key} points={pts} className={className || undefined} />);
  }

  dot(p: P, r: number, className = "") {
    const [cx, cy] = this.project(p);
    this.track(cx - r, cy - r);
    this.track(cx + r, cy + r);
    this.add((key) => <circle key={key} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={r} className={className || undefined} />);
  }

  cursor(p: P) {
    const [sx, sy] = this.project(p);
    this.track(sx, sy);
    this.track(sx + 10, sy + 15);
    this.add((key) => <path key={key} d={CURSOR} transform={`translate(${sx.toFixed(1)} ${sy.toFixed(1)})`} className="cursor" />);
  }

  svg() {
    const pad = 3;
    const x = Math.floor(this.minX - pad);
    const y = Math.floor(this.minY - pad);
    const w = Math.ceil(this.maxX + pad) - x;
    const h = Math.ceil(this.maxY + pad) - y;
    return (
      <svg className="feature-art" viewBox={`${x} ${y} ${w} ${h}`} width={w} height={h} preserveAspectRatio="xMinYMid meet" aria-hidden="true">
        {this.els}
      </svg>
    );
  }
}

/** The runner as a slab, main along it and the pull request branching off and back. */
function Runner() {
  const s = new Scene();
  s.box(0, 0, 0, 14, 8, 0.6);
  const z = 0.6;
  const main = 6;
  const pr = 2;
  s.line([[1, main, z], [13, main, z]], "track");
  s.line([[3.5, main, z], [5.5, pr, z], [9.5, pr, z], [11.5, main, z]], "trail");
  s.cylinder(2, main, z, 0.8, 0.4);
  s.cylinder(6, pr, z, 0.8, 0.4, "a");
  s.cylinder(9, pr, z, 0.8, 0.4, "a");
  s.cylinder(7.5, main, z, 0.8, 0.4);
  s.cylinder(12.5, main, z, 0.8, 0.4);
  return s.svg();
}

/** A page floating over the slab and a drag across it, sampled every step. */
function Pointer() {
  const s = new Scene();
  s.box(0, 0, 0, 10, 10, 0.6);
  for (const [x, y] of [[1.5, 8.5], [8.5, 8.5], [8.5, 1.5]]) {
    s.line([[x, y, 0.6], [x, y, 3]], "dash");
  }
  s.box(1.5, 1.5, 3, 7, 7, 0.12);
  const z = 3.12;
  const trail: P[] = [];
  for (let i = 0; i <= 32; i++) {
    const t = i / 32;
    trail.push([2.8 + 4.4 * t, 7.2 - 4.6 * t + 1.3 * Math.sin(t * Math.PI * 2), z]);
  }
  s.ellipse(...trail[0], 0.35, "a t");
  s.line(trail, "trail");
  s.cursor(trail[trail.length - 1]);
  return s.svg();
}

/**
 * A memory module standing on its edge, its chips filling up in the accent from one end:
 * what every open-and-close kept and never gave back.
 */
function Leak() {
  const s = new Scene();
  const length = 15;
  // The board runs along y and shows its +x face, so it reads left to right, rising.
  s.box(0, 0, 0, 0.3, length, 4.6);
  for (let y = 1; y < length - 0.5; y += 0.7) s.line([[0.31, y, 0.15], [0.31, y, 0.75]], "dash");
  // Far end first: each chip sits in front of the one before it.
  const chips = 5;
  for (let i = 0; i < chips; i++) {
    const y = 0.9 + i * 2.75;
    s.box(0.3, y, 1.3, 0.45, 2.2, 2.6, i >= chips - 3 ? "a" : "");
  }
  return s.svg();
}

/** A board standing on the slab: a scenario's trend across runs, main against the branch. */
function History() {
  const s = new Scene();
  // The board runs along y and shows its +x face, so time reads left to right, rising.
  s.box(0, 0, 0, 6, 15, 0.6);
  s.box(2.5, 1, 0.6, 0.35, 13, 6.5);
  const x = 2.86;
  const base = 0.6;
  const limit = base + 4;
  const y = (i: number) => 13 - i * (11 / 7);
  s.line([[x, y(0), limit], [x, y(7), limit]], "dash");
  const main = [2, 2.4, 2.1, 2.5, 2.2, 2.4, 2.2, 2.5];
  // The branch leaves main at the fifth run and climbs past the limit.
  const branch = [2.2, 3, 4.3, 5.4];
  s.line(main.map((v, i) => [x, y(i), base + v]), "track");
  s.line(branch.map((v, i) => [x, y(i + 4), base + v]), "trail");
  s.dot([x, y(7), base + branch[3]], 2.5, "a");
  return s.svg();
}

export const FEATURE_ART = { Runner, Pointer, Leak, History };
