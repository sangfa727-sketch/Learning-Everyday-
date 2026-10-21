import test from "node:test";
import assert from "node:assert/strict";
import { extractPdfText, normalizeExtractedText, validatePdfFile, MAX_PDF_BYTES } from "./pdf-import.js";

test("validates PDF type and file size before reading", () => {
  assert.match(validatePdfFile(null), /Choose a PDF/);
  assert.match(validatePdfFile({ name: "notes.txt", type: "text/plain", size: 10 }), /does not look like a PDF/);
  assert.match(validatePdfFile({ name: "large.pdf", type: "application/pdf", size: MAX_PDF_BYTES + 1 }), /15 MB/);
  assert.equal(validatePdfFile({ name: "story.pdf", type: "", size: 100 }), null);
});

test("normalizes extracted whitespace and null characters", () => {
  assert.equal(normalizeExtractedText("  Hello\u0000   world \n\n\n next  "), "Hello world\n\nnext");
});

test("extracts text page-by-page and destroys the local PDF document", async () => {
  const calls = [];
  const pdfjs = {
    getDocument: ({ data }) => {
      assert.equal(data.byteLength, 4);
      return { promise: Promise.resolve({
        numPages: 2,
        getPage: async (n) => ({
          getTextContent: async () => ({ items: [{ str: n === 1 ? "Hello" : "Everyday" }, { str: "learners." }] }),
          cleanup: () => calls.push("cleanup" + n)
        }),
        destroy: async () => calls.push("destroy")
      }) };
    }
  };
  const result = await extractPdfText({ name: "story.pdf", type: "application/pdf", size: 4, arrayBuffer: async () => new ArrayBuffer(4) }, pdfjs);
  assert.equal(result, "Hello learners.\n\nEveryday learners.");
  assert.deepEqual(calls, ["cleanup1", "cleanup2", "destroy"]);
});

test("rejects scanned PDFs with no selectable text", async () => {
  const pdfjs = { getDocument: () => ({ promise: Promise.resolve({ numPages: 1, getPage: async () => ({ getTextContent: async () => ({ items: [] }) }), destroy: async () => {} }) }) };
  await assert.rejects(extractPdfText({ name: "scan.pdf", size: 1, arrayBuffer: async () => new ArrayBuffer(1) }, pdfjs), /scanned\/image-only PDF/);
});

test("rejects oversized documents before invoking the PDF engine", async () => {
  let called = false;
  const pdfjs = { getDocument: () => { called = true; throw new Error("should not run"); } };
  await assert.rejects(extractPdfText({ name: "large.pdf", type: "application/pdf", size: MAX_PDF_BYTES + 1 }, pdfjs), /15 MB/);
  assert.equal(called, false);
});
