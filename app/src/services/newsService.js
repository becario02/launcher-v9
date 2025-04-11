import { newsService } from "@/services/api/newsService";

export const initialNewsData = async () => {
  try {
    const response = await newsService.obtenerNoticias();
    return response;
  } catch (error) {
    console.error("Error al obtener noticias:", error);
    return { data: [] };
  }
};