export async function upscaleImage(file, scale = 2.5) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Image upscaling failed"));

            resolve(
              new File(
                [blob],
                file.name.replace(/\.\w+$/, ".jpg"),
                { type: "image/jpeg" }
              )
            );
          },
          "image/jpeg",
          0.95
        );
      };

      img.onerror = () => reject(new Error("Invalid image"));
      img.src = reader.result;
    };

    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}