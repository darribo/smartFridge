import { config } from "../config/constants";

export const GENERIC_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80";


export const resolveProductImage = (image?: string | null): string => {
    if (!image || !image.trim()) {
        return GENERIC_PRODUCT_IMAGE;
    }

    if(image.startsWith("http://") || image.startsWith("https://")) {
        return image;
    }

    if (image.startsWith("/")) {
        return `${config.BASE_URL}${image}`;
    }

    return image;
}
