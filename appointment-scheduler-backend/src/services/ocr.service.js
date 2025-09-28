// services/ocr.service.js
import vision from '@google-cloud/vision';
import dotenv from 'dotenv';
dotenv.config();

// Initialize client (auto-loads credentials from GOOGLE_APPLICATION_CREDENTIALS)
const client = new vision.ImageAnnotatorClient();

/**
 * Clean OCR text: keep only letters, numbers, and spaces
 * @param {string} text
 */
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/[^\w\s]/g, ' ') // remove all non-word characters except spaces
    .replace(/\s+/g, ' ')     // collapse multiple spaces
    .trim();
};

/**
 * Process OCR from input (Buffer, base64, URL, plain text)
 * @param {string|Buffer} input
 */
export const processInput = async (input) => {
  try {
    if (!input || (typeof input === 'string' && input.trim() === '')) {
      return { status: 'needs_clarification', message: 'Missing or empty input for OCR' };
    }

    // Plain text passthrough
    if (typeof input === 'string' && !input.startsWith('data:image') && !input.startsWith('http')) {
      return { raw_text: cleanText(input.trim()), confidence: 1.0 };
    }

    // Base64 string
    if (typeof input === 'string' && input.startsWith('data:image')) {
      const buffer = Buffer.from(input.split(',')[1], 'base64');
      return await processBuffer(buffer);
    }

    // URL
    if (typeof input === 'string' && input.startsWith('http')) {
      return await processImageUri(input);
    }

    // Buffer
    if (Buffer.isBuffer(input)) {
      return await processBuffer(input);
    }

    return { status: 'needs_clarification', message: 'Unsupported OCR input format' };
  } catch (err) {
    return { status: 'needs_clarification', message: `OCR processing failed: ${err.message}` };
  }
};

/**
 * Process image buffer using documentTextDetection and compute approximate confidence
 * @param {Buffer} buffer
 */
export const processBuffer = async (buffer) => {
  try {
    if (!buffer || buffer.length === 0) {
      return { status: 'needs_clarification', message: 'Empty image buffer' };
    }

    const [result] = await client.documentTextDetection({ image: { content: buffer } });
    const annotation = result.fullTextAnnotation;

    if (!annotation || !annotation.text) {
      return { status: 'needs_clarification', message: 'Google OCR returned empty text' };
    }

    // Compute average block confidence
    let totalConfidence = 0;
    let count = 0;
    annotation.pages.forEach(page => {
      page.blocks.forEach(block => {
        if (block.confidence !== undefined) {
          totalConfidence += block.confidence;
          count++;
        }
      });
    });

    const avgConfidence = count > 0 ? totalConfidence / count : 0.9; // fallback

    // Clean the text before returning
    const cleanedText = cleanText(annotation.text);

    return {
      raw_text: cleanedText,
      confidence: parseFloat(avgConfidence.toFixed(2))
    };
  } catch (err) {
    return { status: 'needs_clarification', message: `Google OCR failed: ${err.message}` };
  }
};

/**
 * Process publicly accessible image URL
 * @param {string} uri
 */
export const processImageUri = async (uri) => {
  try {
    const [result] = await client.documentTextDetection({ image: { source: { imageUri: uri } } });
    const annotation = result.fullTextAnnotation;

    if (!annotation || !annotation.text) {
      return { status: 'needs_clarification', message: 'Google OCR returned empty text from URL' };
    }

    // Average confidence
    let totalConfidence = 0;
    let count = 0;
    annotation.pages.forEach(page => {
      page.blocks.forEach(block => {
        if (block.confidence !== undefined) {
          totalConfidence += block.confidence;
          count++;
        }
      });
    });

    const avgConfidence = count > 0 ? totalConfidence / count : 0.9;

    // Clean the text
    const cleanedText = cleanText(annotation.text);

    return {
      raw_text: cleanedText,
      confidence: parseFloat(avgConfidence.toFixed(2))
    };
  } catch (err) {
    return { status: 'needs_clarification', message: `Google OCR (URL) failed: ${err.message}` };
  }
};
