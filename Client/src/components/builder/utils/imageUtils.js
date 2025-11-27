
export const NO_IMAGE_SRC = "/assets/image/no-image.png";

export const getValidImageSrc = (src) => {
    if (!src || src.trim() === "") {
        return NO_IMAGE_SRC;
    }
    return src;
};
