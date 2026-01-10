/**
 * VyaparAI - Main Application Component
 * AI Marketing Assistant for Local Businesses
 */
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { PromotionProvider } from './contexts/PromotionContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileProtectedRoute from './components/ProfileProtectedRoute';
import LoadingScreen from './components/LoadingScreen';

import './index.css';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SetupPage = lazy(() => import('./pages/SetupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StartPage = lazy(() => import('./pages/StartPage'));
const ConfirmPage = lazy(() => import('./pages/ConfirmPage'));
const StylePage = lazy(() => import('./pages/StylePage'));
const ResultPage = lazy(() => import('./pages/ResultPage'));
const SharePage = lazy(() => import('./pages/SharePage'));

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <PromotionProvider>
              <div className="app">
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />

                    {/* Setup Route - Requires login only */}
                    <Route
                      path="/setup"
                      element={
                        <ProtectedRoute>
                          <SetupPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Protected Routes - Require login AND profile completion */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProfileProtectedRoute>
                          <DashboardPage />
                        </ProfileProtectedRoute>
                      }
                    />
                    <Route
                      path="/start"
                      element={
                        <ProfileProtectedRoute>
                          <StartPage />
                        </ProfileProtectedRoute>
                      }
                    />
                    <Route
                      path="/confirm"
                      element={
                        <ProfileProtectedRoute>
                          <ConfirmPage />
                        </ProfileProtectedRoute>
                      }
                    />
                    <Route
                      path="/style"
                      element={
                        <ProfileProtectedRoute>
                          <StylePage />
                        </ProfileProtectedRoute>
                      }
                    />
                    <Route
                      path="/result"
                      element={
                        <ProfileProtectedRoute>
                          <ResultPage />
                        </ProfileProtectedRoute>
                      }
                    />
                    <Route
                      path="/share"
                      element={
                        <ProfileProtectedRoute>
                          <SharePage />
                        </ProfileProtectedRoute>
                      }
                    />

                    {/* 404 Fallback */}
                    <Route
                      path="*"
                      element={
                        <div className="page center-content">
                          <div>
                            <h1 style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</h1>
                            <h2>Page Not Found</h2>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                              The page you're looking for doesn't exist.
                            </p>
                            <button
                              className="btn btn--primary"
                              onClick={() => window.location.href = '/'}
                              style={{ marginTop: '24px' }}
                            >
                              Go Home
                            </button>
                          </div>
                        </div>
                      }
                    />
                  </Routes>
                </Suspense>
              </div>
            </PromotionProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

