// services/ocr.service.js
import vision from '@google-cloud/vision';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Get GCP credentials from env variables or fallback to ADC
 */
export const getGCPCredentials = () => {
  return process.env.GCP_PRIVATE_KEY
    ? {
        credentials: {
          client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        projectId: process.env.GCP_PROJECT_ID,
      }
    : {}; // fallback to local ADC
};

// Initialize Vision client
const client = new vision.ImageAnnotatorClient(getGCPCredentials());

/**
 * Clean OCR text: keep only letters, numbers, and spaces
 * @param {string} text
 */
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/[^\w\s]/g, ' ') // remove all non-word chars except spaces
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

    if (typeof input === 'string' && !input.startsWith('data:image') && !input.startsWith('http')) {
      return { raw_text: cleanText(input.trim()), confidence: 1.0 };
    }

    if (typeof input === 'string' && input.startsWith('data:image')) {
      const buffer = Buffer.from(input.split(',')[1], 'base64');
      return await processBuffer(buffer);
    }

    if (typeof input === 'string' && input.startsWith('http')) {
      return await processImageUri(input);
    }

    if (Buffer.isBuffer(input)) {
      return await processBuffer(input);
    }

    return { status: 'needs_clarification', message: 'Unsupported OCR input format' };
  } catch (err) {
    return { status: 'needs_clarification', message: `OCR processing failed: ${err.message}` };
  }
};

/**
 * Process image buffer using documentTextDetection
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

    // Average confidence
    let totalConfidence = 0, count = 0;
    annotation.pages.forEach(page =>
      page.blocks.forEach(block => {
        if (block.confidence !== undefined) {
          totalConfidence += block.confidence;
          count++;
        }
      })
    );

    const avgConfidence = count > 0 ? totalConfidence / count : 0.9;
    return { raw_text: cleanText(annotation.text), confidence: parseFloat(avgConfidence.toFixed(2)) };
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

    let totalConfidence = 0, count = 0;
    annotation.pages.forEach(page =>
      page.blocks.forEach(block => {
        if (block.confidence !== undefined) {
          totalConfidence += block.confidence;
          count++;
        }
      })
    );

    const avgConfidence = count > 0 ? totalConfidence / count : 0.9;
    return { raw_text: cleanText(annotation.text), confidence: parseFloat(avgConfidence.toFixed(2)) };
  } catch (err) {
    return { status: 'needs_clarification', message: `Google OCR (URL) failed: ${err.message}` };
  }
};
