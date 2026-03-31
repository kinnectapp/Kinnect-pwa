
export const compressImage = async (
  file: File,
  quality = 0.7,
  maxWidth = 1080,
  maxHeight = 1080
): Promise<File> => {
  return new Promise((resolve, reject) => {
     if (!file.type.startsWith("image/")) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height *= maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width *= maxHeight / height));
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          return resolve(file); // Fallback to original
        }

        // Fill white background for transparent images (like PNG) converting to JPEG
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file); // Fallback to original
            }

            // Only use the compressed file if it's actually smaller
            if (blob.size >= file.size) {
              resolve(file);
            } else {
              const newFile = new File(
                [blob], 
                file.name.replace(/\.[^/.]+$/, "") + ".jpeg", 
                {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }
              );
              resolve(newFile);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (error) => reject(new Error("Failed to load image for compression"));
    };
    reader.onerror = (error) => reject(new Error("Failed to read image file"));
  });
};
