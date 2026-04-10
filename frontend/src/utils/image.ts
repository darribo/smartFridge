import { config } from "../config/constants";

export const GENERIC_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80";

export const RECIPE_IMAGE_PLACEHOLDER = "https://content.elmueble.com/medio/2025/07/04/sandwich-de-tortillas_4dc8baa9_250704161901_1125x1500.webp";


export const resolveImage = (isProduct: boolean, image?: string | null): string => {
    if (!image || !image.trim()) {

        if (isProduct){
            return GENERIC_PRODUCT_IMAGE;
        }
        else{
            return RECIPE_IMAGE_PLACEHOLDER;
        }
    }

    if(image.startsWith("http://") || image.startsWith("https://")) {
        return image;
    }

    if (image.startsWith("/")) {
        return `${config.BASE_URL}${image}`;
    }

    return image;
}
