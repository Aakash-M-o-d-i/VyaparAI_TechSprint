# VyaparAI 🛒

**AI Marketing Assistant for Local Businesses**

VyaparAI helps local Indian business owners create AI-powered promotional posters and marketing messages using voice or text input, in their preferred regional language. No English needed. No designer needed.

## 🌟 Features

- **Voice-First Input**: Speak your offer naturally in Hindi, Tamil, Telugu, or English
- **AI-Powered Understanding**: Gemini AI extracts product details, pricing, and offers
- **Automatic Poster Generation**: Creates professional promotional posters using AI
- **Multi-Platform Sharing**: One-tap sharing to WhatsApp, Instagram, and Facebook
- **Auto-Generated Captions**: Platform-specific captions in the user's language
- **Multi-Language Support**: Full support for English, Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు)
- **Mobile-First Design**: Optimized for mobile devices and first-time digital users

## 📱 Pages

1. **Landing Page** (`/`) - Welcome screen with language selection
2. **Login Page** (`/login`) - Google Sign-in and Phone OTP authentication
3. **Dashboard** (`/dashboard`) - User's shop overview with past promotions
4. **Start Promotion** (`/start`) - Voice or text input for offers
5. **AI Confirmation** (`/confirm`) - Review AI-extracted details
6. **Style Selection** (`/style`) - Choose promotion mood (Friendly, Festive, etc.)
7. **Result Page** (`/result`) - View generated poster and captions
8. **Share Page** (`/share`) - One-tap sharing to social platforms

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Custom CSS with modern design system
- **Authentication**: Firebase Authentication (Google + Phone OTP)
- **Database**: Firebase Firestore
- **AI Engine**: Google Gemini API (Text + Image Generation)
- **Hosting**: Firebase Hosting (recommended)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Authentication and Firestore enabled
- Google AI Studio API key for Gemini

### Installation

1. Clone the repository:
   ```bash
   cd vyaparai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## 📁 Project Structure

```
vyaparai/
├── public/
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/
│   │   └── ProtectedRoute.jsx
│   ├── config/
│   │   ├── firebase.js     # Firebase configuration
│   │   └── gemini.js       # Gemini AI configuration
│   ├── contexts/
│   │   ├── AuthContext.jsx     # Authentication state
│   │   ├── LanguageContext.jsx # Multi-language support
│   │   └── PromotionContext.jsx# Promotion workflow state
│   ├── locales/
│   │   └── translations.js # All UI translations
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── StartPage.jsx
│   │   ├── ConfirmPage.jsx
│   │   ├── StylePage.jsx
│   │   ├── ResultPage.jsx
│   │   └── SharePage.jsx
│   ├── services/
│   │   ├── aiService.js    # Gemini API integration
│   │   └── speechService.js# Web Speech API
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css           # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## 🎨 Design System

The app uses a custom CSS design system with:

- **Colors**: Warm orange primary palette with purple accents
- **Typography**: Inter font family
- **Components**: Cards, buttons, inputs with consistent styling
- **Animations**: Micro-animations for enhanced UX
- **Responsive**: Mobile-first design

## 🔐 Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication providers:
   - Google Sign-In
   - Phone Authentication
3. Create a Firestore database
4. Add your web app and copy the configuration

## 🤖 Gemini API Setup

1. Get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Enable the Gemini Pro models
3. Add the API key to your `.env` file

## 📱 Languages Supported

| Language | Code | Display Name |
|----------|------|--------------|
| English  | en   | English      |
| Hindi    | hi   | हिंदी         |
| Tamil    | ta   | தமிழ்        |
| Telugu   | te   | తెలుగు       |

## 🎯 Target Users

- Local shop owners (juice shops, kirana stores, salons, cafés)
- Street vendors and small business owners
- Users with low or no English proficiency
- First-time web or smartphone users

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for local Indian businesses
