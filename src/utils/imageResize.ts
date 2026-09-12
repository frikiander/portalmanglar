/**
 * Redimensiona y recorta una imagen cargada para que tenga exactamente 500x500 píxeles,
 * centrada y optimizada para almacenamiento y rendimiento visual en toda la plataforma.
 */
export async function resizeImageTo500x500(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('El archivo seleccionado no es una imagen válida.'));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('No se pudo inicializar el contexto del lienzo.'));
      }

      // Suavizado de imagen de alta calidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Calcular recorte centrado (crop & fill 1:1)
      const srcWidth = img.naturalWidth || img.width;
      const srcHeight = img.naturalHeight || img.height;

      const size = Math.min(srcWidth, srcHeight);
      const startX = (srcWidth - size) / 2;
      const startY = (srcHeight - size) / 2;

      // Dibujar centrado en 500x500
      ctx.drawImage(
        img,
        startX,
        startY,
        size,
        size,
        0,
        0,
        500,
        500
      );

      // Exportar en formato WebP optimizado (o JPEG como fallback seguro)
      try {
        const dataUrl = canvas.toDataURL('image/webp', 0.88);
        if (dataUrl.startsWith('data:image/webp')) {
          return resolve(dataUrl);
        }
      } catch {
        // Fallback a JPEG
      }

      const fallbackDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      resolve(fallbackDataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Error al cargar la imagen seleccionada.'));
    };

    img.src = objectUrl;
  });
}
