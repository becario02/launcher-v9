'use client';

import { useState, useEffect } from 'react';

export default function PromotionCard() {
  const [promotionImage, setPromotionImage] = useState("url('/assets/PromotionCard/default_image.png')");
  const [promotionUrl, setPromotionUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar promoción actual al montar el componente
  useEffect(() => {
    fetchCurrentPromotion();
  }, []);

  // Función para obtener la promoción actual
  const fetchCurrentPromotion = async () => {
    try {
      const response = await fetch('http://localhost:5173/mslauncher/api/v1/promotions/current', {
        headers: {
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.statusCode === "200" && result.data) {
          // Establecer imagen
          if (result.data.image) {
            setPromotionImage(`url(data:image/jpeg;base64,${result.data.image})`);
          }
          
          // Establecer URL de referencia
          if (result.data.urlReference) {
            setPromotionUrl(result.data.urlReference);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar promoción:', error);
      // Mantiene la imagen por defecto en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el clic en la promoción
  const handlePromotionClick = () => {
    if (promotionUrl) {
      // Validar que la URL tenga protocolo
      let url = promotionUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Abrir en nueva pestaña
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="bg-white dark:bg-[#1C1C24] border border-gray-200 dark:border-[#2C2C38] rounded-xl overflow-hidden h-[300px] shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer bg-cover bg-center"
      style={{ backgroundImage: promotionImage }}
      onClick={handlePromotionClick}
    />
  );
}