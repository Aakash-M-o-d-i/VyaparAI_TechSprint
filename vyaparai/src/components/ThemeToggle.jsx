/**
 * Theme Toggle Component
 * Beautiful animated toggle for light/dark mode
 */
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle({ size = 'default' }) {
    const { theme, toggleTheme, isDark } = useTheme();

    const sizeClasses = {
        small: 'theme-toggle--sm',
        default: 'theme-toggle--default',
        large: 'theme-toggle--lg'
    };

    return (
        <button
            className={`theme-toggle ${sizeClasses[size] || sizeClasses.default} ${isDark ? 'theme-toggle--dark' : ''}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <span className="theme-toggle__track">
                <span className="theme-toggle__thumb">
                    <span className="theme-toggle__icon theme-toggle__icon--sun">☀️</span>
                    <span className="theme-toggle__icon theme-toggle__icon--moon">🌙</span>
                </span>
            </span>
        </button>
    );
}

export default ThemeToggle;
