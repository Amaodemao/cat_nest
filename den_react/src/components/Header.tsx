import { useEffect } from "react";
import ViewTransitionNavLink from "./ViewTransitionNavLink";

const preloadGallery = () => import("../pages/Gallery");

const scheduleIdlePrefetch = () => {
    if (typeof window === "undefined") return () => {};
    const w = window as Window & {
        requestIdleCallback?: (cb: () => void) => number;
        cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
        const id = w.requestIdleCallback(() => { void preloadGallery(); });
        return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => { void preloadGallery(); }, 1500);
    return () => window.clearTimeout(id);
};

export default function Header() {
    useEffect(() => scheduleIdlePrefetch(), []);
    return (
        <header>
            <div className="container">
                <nav aria-label="Primary">
                    <ViewTransitionNavLink className="logo" to="/#top"> Amao's Den ✦</ViewTransitionNavLink>
                    <input type="checkbox" id="menuToggle" aria-label="Open menu" />
                    <label id="hamburger" htmlFor="menuToggle">☰</label>
                    <ul>
                        <li><ViewTransitionNavLink to="/">Home</ViewTransitionNavLink></li>
                        <li><ViewTransitionNavLink to="/gallery">Gallery</ViewTransitionNavLink></li>
                        <li><ViewTransitionNavLink to="/journal">Journal</ViewTransitionNavLink></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
