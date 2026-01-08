export type GalleryItem = {
    src: string;    title: string;
};

const buildGallery = (modules: Record<string, unknown>, basePath: string) =>
    Object.keys(modules)
        .map((path) => {
            const fileName = path.split("/").pop() ?? path;
            return {
                src: `${basePath}/${fileName}`,
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

export const gallery: GalleryItem[] = buildGallery(modules, "/img/gallery");
export const nsfwGallery: GalleryItem[] = buildGallery(nsfwModules, "/img/gallery/NSFW");
export const goreGallery: GalleryItem[] = buildGallery(goreModules, "/img/gallery/NSFW/gore");
