/**
 * Resume File Parser
 * Extracts plain text from PDF and DOCX files
 * Browser-only, no backend required
 */

/**
 * Parses a resume file (PDF or DOCX) and extracts plain text
 * @param {File} file - The file to parse
 * @returns {Promise<{success: boolean, text: string, error?: string}>}
 */
export async function parseResumeFile(file) {
  if (!file) {
    return {
      success: false,
      text: "",
      error: "No file provided"
    };
  }

  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // Detect file type
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    return await parsePDF(file);
  } else if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    return await parseDOCX(file);
  } else {
    return {
      success: false,
      text: "",
      error: `Unsupported file type. Please upload a PDF or DOCX file.`
    };
  }
}

/**
 * Parses a PDF file and extracts text
 */
async function parsePDF(file) {
  try {
    // Dynamic import - Vite should handle this correctly after npm install
    // For pdfjs-dist v4, use the build path
    const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");
    
    // Set worker source - use unpkg CDN which is reliable
    if (typeof window !== "undefined") {
      // Get the actual version from the library (should be 4.10.38)
      const version = pdfjsLib.version || "4.10.38";
      
      // Use unpkg CDN for the worker (more reliable than cdnjs)
      // For pdfjs-dist v4, the worker is at build/pdf.worker.min.mjs
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF with worker, with fallback if worker fails
    let pdf;
    try {
      pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        verbosity: 0,
        useSystemFonts: true
      }).promise;
    } catch (workerError) {
      // If worker fails, try without worker (slower but works)
      console.warn("PDF worker failed, retrying without worker:", workerError.message);
      pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0,
        useSystemFonts: true
      }).promise;
    }
    
    let fullText = "";
    const numPages = pdf.numPages;

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items, preserving line breaks
      const pageText = textContent.items
        .map(item => item.str)
        .join(" ")
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();
      
      if (pageText) {
        fullText += pageText + "\n";
      }
    }

    // Clean up text: preserve line breaks but normalize spacing
    // This format works with existing evidence extraction which splits on \n
    const cleanedText = fullText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join("\n")
      .trim();

    return {
      success: true,
      text: cleanedText || ""
    };
  } catch (error) {
    return {
      success: false,
      text: "",
      error: `Failed to parse PDF: ${error.message || "Unknown error"}`
    };
  }
}

/**
 * Parses a DOCX file and extracts text
 */
async function parseDOCX(file) {
  try {
    // Dynamic import
    const mammoth = await import("mammoth");

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (result.messages.length > 0) {
      // Log warnings but don't fail
      console.warn("DOCX parsing warnings:", result.messages);
    }

    // Clean up text: preserve line breaks but normalize spacing
    const cleanedText = result.value
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join("\n");

    return {
      success: true,
      text: cleanedText || ""
    };
  } catch (error) {
    return {
      success: false,
      text: "",
      error: `Failed to parse DOCX: ${error.message || "Unknown error"}`
    };
  }
}

/**
 * Validates file before parsing
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateResumeFile(file) {
  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: "File size exceeds 10MB limit" };
  }

  const fileName = file.name.toLowerCase();
  const validExtensions = [".pdf", ".docx"];
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return { valid: false, error: "Please upload a PDF or DOCX file" };
  }

  return { valid: true };
}

