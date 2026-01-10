# VyaparAI

## Empowering Local Businesses with AI Marketing

VyaparAI is an AI-powered marketing assistant designed specifically for local business owners in India. It enables users to create professional promotional material and social media content using simple voice or text commands in their preferred regional language.

## The Problem

Small business owners—including kirana store owners, street vendors, and local service providers—often struggle with professional marketing due to:
- Language barriers (difficulty creating content in English)
- Technical complexity of modern design tools
- High costs associated with hiring professional designers
- Limited time to manage digital presence

## The Solution

VyaparAI bridges the digital divide by offering a voice-first, multi-lingual platform that automates the creative process. A shop owner can simply speak their offer in their native language, and the system handles the extraction of details, design of the poster, and generation of social media captions.

## Core Features

- Voice-First Input: Support for Hindi, Tamil, Telugu, and English, allowing for natural interaction.
- AI Understanding: Utilizes Google Gemini AI to accurately extract product names, prices, and offer details from natural speech.
- Automated Design: Generates professional-grade promotional posters based on extracted data.
- Social Connectivity: One-tap sharing to platforms like WhatsApp, Instagram, and Facebook.
- Localized Experience: Completely localized UI and auto-generated captions in the user's chosen language.

## Technical Architecture

### Frontend
- React 18: Core library for building the user interface.
- Vite: Lightning-fast build tool and development server.
- Custom CSS: A hand-crafted design system focused on mobile-first accessibility and premium aesthetics.

### Backend and Infrastructure
- Firebase Authentication: Secure login via Google and Phone OTP.
- Firebase Firestore: Scalable NoSQL database for storing user profiles and promotion history.
- Web Speech API: Real-time voice-to-text processing for intuitive input.

### Artificial Intelligence
- Google Gemini API: Performs complex natural language understanding and governs the content generation logic.

## Environment Setup

### Prerequisites
- Node.js (version 18 or higher)
- App-level API keys for Firebase and Google AI Studio

### Installation Steps

1. Clone the repository and navigate to the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to a new file named `.env`
   - Fill in your Firebase configuration and Gemini API key.
4. Launch the development server:
   ```bash
   npm run dev
   ```

## Project Directory Structure

```text
vyaparai/
├── src/
│   ├── components/      # Reusable UI components (TopBar, ProgressIndicator, etc.)
│   ├── config/          # Configuration files for Firebase and Gemini AI
│   ├── contexts/        # React Contexts for Auth, Language, and Promotions
│   ├── locales/         # Multi-language translation dictionaries
│   ├── pages/           # Screen components for each step of the user journey
│   ├── services/        # Logic for AI integration and Web Speech API
│   ├── index.css        # Global styles and design system tokens
│   ├── App.jsx          # Main application routing and providers
│   └── main.jsx         # Application entry point
├── public/              # Static assets and PWA manifest
├── .env.example         # Template for environment variables
├── .gitignore           # Git exclusion rules
├── package.json         # Project dependencies and scripts
└── vite.config.js       # Vite build configuration
```

### Key Modules
- **src/contexts**: Manages global state including user sessions, language preferences, and the multi-step promotion creation data.
- **src/services/aiService.js**: Interfaces with the Google Gemini API for natural language extraction and creative content generation.
- **src/services/speechService.js**: Encapsulates the Web Speech API for seamless voice-to-text functionality.
- **src/locales/translations.js**: Centralized repository for all UI strings across support languages.

## Impact and Future Scope

VyaparAI aims to democratize professional marketing for millions of small businesses. Future developments include:
- Support for more regional Indian dialects.
- Advanced AI image generation for product-specific visuals.
- Direct integration with local advertising networks.

## License

This project is licensed under the MIT License.
