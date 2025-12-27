export async function prepareImageForOCR(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = () => {
      img.onload = () => {
        const MAX_WIDTH = 3000;
        const scale = Math.min(1, MAX_WIDTH / img.width);

        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Grayscale + contrast boost
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
          const boosted = gray > 200 ? 255 : gray * 1.15;
          d[i] = d[i + 1] = d[i + 2] = boosted;
        }
        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob(
          blob => {
            if (!blob) return reject(new Error("OCR preprocessing failed"));
            resolve(
              new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
                type: "image/jpeg"
              })
            );
          },
          "image/jpeg",
          0.92
        );
      };
      img.onerror = reject;
      img.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}