/**
 * The site's pages and the links between them, shared by the top nav and the
 * footer so the two never drift apart.
 *
 * Each link names its target once per page. On the page that holds a section
 * the link is a bare "#hash" — SmoothScroll only eases links that start with
 * "#", so writing "/#philosophy" on the home page would turn a glide into a
 * jump. From any other page the same link carries the path.
 *
 * Products sit first and by name, not under a "Products" menu: with two of
 * them a dropdown only hides them behind a click (and a tap on a phone). When
 * a third arrives, these entries are the ones to fold under one parent.
 */
export type Page = "home" | "cleansing";

export type NavLink = { label: string; href: Record<Page, string> };

export const NAV_LINKS: NavLink[] = [
  { label: "Suncream", href: { home: "#product", cleansing: "/" } },
  {
    label: "Cleansing Water",
    href: { home: "/cleansing-water", cleansing: "#top" },
  },
  { label: "Philosophy", href: { home: "#philosophy", cleansing: "/#philosophy" } },
  // Manufacturing lives on the home page only; it covers both products.
  { label: "Quality", href: { home: "#manufacturing", cleansing: "/#manufacturing" } },
];

/** Which link stands for the page itself, for aria-current. */
export const CURRENT_LABEL: Record<Page, string> = {
  home: "Suncream",
  cleansing: "Cleansing Water",
};

export const LOGO_HREF: Record<Page, string> = { home: "#top", cleansing: "/" };
