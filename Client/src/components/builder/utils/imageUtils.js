
export const NO_IMAGE_SRC = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGXtgrD_NEffCs9_271b6wshd7SrK1Ssi5ZA&s";

/**
 * Returns a valid image source.
 * If the provided src is empty, null, or undefined, returns the NO_IMAGE_SRC.
 * @param {string} src - The image source URL.
 * @returns {string} - A valid image source URL.
 */
export const getValidImageSrc = (src) => {
    if (!src || src.trim() === "") {
        return NO_IMAGE_SRC;
    }
    return src;
};
