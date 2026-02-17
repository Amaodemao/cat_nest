import React from "react";
import type { To } from "react-router-dom";

const loadHome = () => import("../pages/Home");
const loadGallery = () => import("../pages/Gallery");
const loadJournal = () => import("../pages/Journal");
const loadPostPage = () => import("../pages/JournalPage");

export const Home = React.lazy(loadHome);
export const Gallery = React.lazy(loadGallery);
export const Journal = React.lazy(loadJournal);
export const PostPage = React.lazy(loadPostPage);

function normalizePath(path: string): string {
  const base = path.split("?")[0]?.split("#")[0] ?? "";
  if (!base) return "";
  return base.startsWith("/") ? base : `/${base}`;
}

function toPathname(to: To): string {
  if (typeof to === "string") {
    return normalizePath(to);
  }
  return normalizePath(to.pathname ?? "");
}

export function preloadRouteModule(to: To): Promise<unknown> | null {
  const pathname = toPathname(to);
  if (!pathname) return null;

  if (pathname === "/") return loadHome();
  if (pathname === "/gallery") return loadGallery();
  if (pathname === "/journal") return loadJournal();
  if (pathname.startsWith("/journal/contents/")) return loadPostPage();

  return null;
}

export async function preloadNonCriticalRoutes() {
  await Promise.allSettled([loadGallery(), loadJournal(), loadPostPage()]);
}
