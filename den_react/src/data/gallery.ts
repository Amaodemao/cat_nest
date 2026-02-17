export type GalleryItem = {
    src: string;
    thumbSrc: string;
    fullSrc: string;
    title: string;
};

const buildGallery = (modules: Record<string, unknown>) =>
    Object.keys(modules)
        .map((path) => {
            const relativePath = path.split("/gallery/").pop() ?? "";
            const fileName = path.split("/").pop() ?? path;
            const noExtPath = relativePath.replace(/\.[^/.]+$/, "");
            return {
                src: `/img/gallery/${relativePath}`,
                thumbSrc: `/img/gallery-optimized/thumb/${noExtPath}.jpg`,
                fullSrc: `/img/gallery-optimized/full/${noExtPath}.jpg`,
                title: toTitle(fileName),
            };
        })
        .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));

const toTitle = (fileName: string) => {
    const noExt = fileName.replace(/\.[^/.]+$/, "");
    return noExt.replace(/[-_]+/g, " ");
};

const modules = import.meta.glob("../../public/img/gallery/*.{png,jpg,jpeg,webp,avif,gif}");
const nsfwModules = import.meta.glob("../../public/img/gallery/NSFW/*.{png,jpg,jpeg,webp,avif,gif}");
const goreModules = import.meta.glob("../../public/img/gallery/NSFW/gore/*.{png,jpg,jpeg,webp,avif,gif}");

export const gallery: GalleryItem[] = buildGallery(modules);
export const nsfwGallery: GalleryItem[] = buildGallery(nsfwModules);
export const goreGallery: GalleryItem[] = buildGallery(goreModules);
