// src/utils/prepareImageForOCR.js
export async function prepareImageForOCR(file) {
  if (file.type === "application/pdf") {
    // Convert first page of PDF to high-quality JPEG
    const pdfjsLib = await import("pdfjs-dist/build/pdf");
    const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const scale = 3.0;
    const viewport = page.getViewport({ scale });

    const canvas = new OffscreenCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.95 });
    return new File([blob], "bill-summary.jpg", { type: "image/jpeg" });
  }

  // For images: upscale and enhance contrast
  if (file.type.startsWith("image/")) {
    const img = await createImageBitmap(file);

    const scale = Math.max(2000 / Math.min(img.width, img.height), 2);
    const canvas = new OffscreenCanvas(img.width * scale, img.height * scale);
    const ctx = canvas.getContext("2d");

    ctx.filter = "contrast(1.6) brightness(1.2)";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.95 });
    return new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" });
  }

  return file; // fallback
}
