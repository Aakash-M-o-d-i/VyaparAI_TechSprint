/**
 * TopBar Component
 * Fixed top-right corner with language selector and theme toggle
 */
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

function TopBar() {
    const { language, changeLanguage, getAvailableLanguages } = useLanguage();
    const { theme, toggleTheme, isDark } = useTheme();
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

    const languages = getAvailableLanguages();
    const currentLang = languages.find(l => l.code === language);

    return (
        <div className="top-bar">
            {/* Language Selector Dropdown */}
            <div className="top-bar__language">
                <button
                    className="top-bar__lang-btn"
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    aria-label="Select language"
                >
                    <span className="top-bar__lang-icon">🌐</span>
                    <span className="top-bar__lang-text">{currentLang?.name || 'EN'}</span>
                    <span className="top-bar__lang-arrow">{showLanguageDropdown ? '▲' : '▼'}</span>
                </button>

                {showLanguageDropdown && (
                    <div className="top-bar__dropdown">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                className={`top-bar__dropdown-item ${language === lang.code ? 'active' : ''}`}
                                onClick={() => {
                                    changeLanguage(lang.code);
                                    setShowLanguageDropdown(false);
                                }}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Theme Toggle */}
            <button
                className={`top-bar__theme-btn ${isDark ? 'dark' : ''}`}
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
                <span className="top-bar__theme-icon">
                    {isDark ? '🌙' : '☀️'}
                </span>
            </button>
        </div>
    );
}

export default TopBar;
