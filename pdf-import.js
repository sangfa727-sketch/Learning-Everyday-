export const MAX_PDF_BYTES = 15 * 1024 * 1024;
export const MAX_PDF_PAGES = 50;

export function validatePdfFile(file) {
  if (!file) return "Choose a PDF file first.";
  const name = String(file.name ?? "");
  const type = String(file.type ?? "").toLowerCase();
  if (type !== "application/pdf" && !name.toLowerCase().endsWith(".pdf")) {
    return "This file does not look like a PDF. Choose a .pdf file.";
  }
  if (Number(file.size) > MAX_PDF_BYTES) {
    return "This PDF is larger than 15 MB. Choose a smaller file.";
  }
  return null;
}

export function normalizeExtractedText(value) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .replace(/[\t\f\v ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractPdfText(file, pdfjs) {
  const validationError = validatePdfFile(file);
  if (validationError) throw new Error(validationError);
  if (!pdfjs || typeof pdfjs.getDocument !== "function") {
    throw new Error("The PDF reader could not be loaded. Connect to the internet and try again.");
  }

  const data = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data });
  let document;
  try {
    document = await loadingTask.promise;
    if (!Number.isInteger(document.numPages) || document.numPages < 1) {
      throw new Error("This PDF does not contain readable pages.");
    }
    if (document.numPages > MAX_PDF_PAGES) {
      throw new Error("This PDF has more than 50 pages. Choose a shorter document.");
    }
    const pages = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .filter((item) => typeof item.str === "string")
        .map((item) => item.str)
        .join(" ");
      pages.push(normalizeExtractedText(text));
      page.cleanup?.();
    }
    const extracted = normalizeExtractedText(pages.filter(Boolean).join("\n\n"));
    if (!extracted) {
      throw new Error("No selectable text was found. This may be a scanned/image-only PDF; OCR is not available in this version.");
    }
    return extracted;
  } finally {
    await document?.destroy?.();
  }
}
