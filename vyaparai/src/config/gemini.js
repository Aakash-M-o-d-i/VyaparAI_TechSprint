/**
 * Gemini AI Configuration
 * Initializes Google Generative AI client for text and image generation
 * 
 * Puter.js is used as primary for text generation (free, no API key needed)
 * Gemini is used for image generation with the "Nano Banana" model
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Get Gemini model for text generation (fallback - Puter.js is primary)
export const geminiModel = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
    }
});

// Get Gemini 2.5 Flash Image model for image generation ("Nano Banana" model)
// This is the dedicated image generation model
export const imageGenModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-image',
    generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
    }
});

export default genAI;
