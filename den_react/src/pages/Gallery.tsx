import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    gallery as items,
    goreGallery as goreItems,
    nsfwGallery as nsfwItems,
    type GalleryItem
} from "../data/gallery";

type LightboxState = {
    open: boolean;
    src: string;
    caption: string;
}

export default function Gallery() {
    const [lb, setLb] = useState<LightboxState>(
        {
            open: false,
            src: "",
            caption: ""
        }
    );
    const [showNsfw, setShowNsfw] = useState(false);
    const [showGore, setShowGore] = useState(false);
    const [transitionPhase, setTransitionPhase] = useState<"idle" | "out" | "in">("idle");
    const gridRef = useRef<HTMLDivElement | null>(null);
    const transitionTimers = useRef<number[]>([]);
    const visibleItems = showNsfw ? (showGore ? goreItems : nsfwItems) : items;

    const onImgLoad: React.ReactEventHandler<HTMLImageElement> = (e) => {
        const img = e.currentTarget;
        if (img.naturalWidth <= img.naturalHeight) {
            img.classList.add("portrait");
        }
        else {
            img.classList.remove("portrait");
        }
    };

    useEffect(() => {
        if (!lb.open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setLb((s) => ({ ...s, open: false}));
        };
        document.addEventListener("keyup", onKey);
        return () => document.removeEventListener("keyup", onKey);
    }, []);

    useEffect(() => {
        if (!showNsfw && showGore) {
            setShowGore(false);
        }
    }, [showNsfw, showGore]);

    const startTransition = (nextNsfw: boolean, nextGore: boolean) => {
        if (transitionPhase !== "idle") return;
        transitionTimers.current.forEach((id) => window.clearTimeout(id));
        transitionTimers.current = [];
        setTransitionPhase("out");
        const swapDelay = 450;
        const totalDuration = 900;
        const swapId = window.setTimeout(() => {
            setShowNsfw(nextNsfw);
            setShowGore(nextNsfw ? nextGore : false);
            setTransitionPhase("in");
        }, swapDelay);
        const endId = window.setTimeout(() => {
            setTransitionPhase("idle");
        }, totalDuration);
        transitionTimers.current.push(swapId, endId);
    };

    useEffect(() => {
        return () => {
            transitionTimers.current.forEach((id) => window.clearTimeout(id));
        };
    }, []);

    const onOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
        const target = e.target as HTMLElement;
        if (target.id === "lightbox") {
            setLb((s) => ({ ...s, open: false}));
        };
    };

    const openLightbox = (it: GalleryItem) => {
        setLb({
            open: true,
            src: it.src,
            caption: it.title ?? "",
        });
    };


    return (
        <section id="gallery" className="container" aria-labelledby="gallery-title">
        <div className="gallery-header">
            <h2 id="gallery-title">Gallery</h2>
            <div className="gallery-controls">
                <button
                    type="button"
                    className={`toggle-btn ${showNsfw ? "is-active" : ""}`}
                    aria-pressed={showNsfw}
                    onClick={() => startTransition(!showNsfw, showGore)}
                    disabled={transitionPhase !== "idle"}
                >
                    NSFW
                </button>
                {showNsfw && (
                    <button
                        type="button"
                        className={`toggle-btn ${showGore ? "is-active" : ""}`}
                        aria-pressed={showGore}
                        onClick={() => startTransition(showNsfw, !showGore)}
                        disabled={transitionPhase !== "idle"}
                    >
                        Gore
                    </button>
                )}
            </div>
        </div>
        <div
            className={`gallery grid ${transitionPhase !== "idle" ? "is-transitioning" : ""} is-${transitionPhase}`}
            ref={gridRef}
        >
            {visibleItems.map((it: GalleryItem, i: number) => (
            <figure key={i} onClick={() => openLightbox(it)}>
                <img
                src={it.src}
                onLoad={onImgLoad}
                loading="lazy"
                />
                <figcaption>{it.title}</figcaption>
            </figure>
            ))}
        </div>

        {/* Lightbox overlay */}
        {typeof document !== "undefined" &&
            createPortal(
                <div
                    id="lightbox"
                    className={lb.open ? "open" : ""}
                    aria-hidden={lb.open ? "false" : "true"}
                    onClick={onOverlayClick}
                >
                    <figure>
                    {lb.open && <img src={lb.src} />}
                    <figcaption>{lb.caption}</figcaption>
                    </figure>
                </div>,
                document.body
            )}
        </section>
    );
}
