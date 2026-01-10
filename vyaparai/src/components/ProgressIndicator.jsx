/**
 * Progress Indicator Component
 * Shows current step in the promotion creation workflow
 */
import { useLocation } from 'react-router-dom';

function ProgressIndicator() {
    const location = useLocation();

    const steps = [
        { path: '/start', label: 'Input' },
        { path: '/confirm', label: 'Review' },
        { path: '/style', label: 'Style' },
        { path: '/result', label: 'Poster' },
        { path: '/share', label: 'Share' }
    ];

    const currentIndex = steps.findIndex(step => step.path === location.pathname);

    if (currentIndex === -1) return null;

    return (
        <div className="progress-steps">
            {steps.map((step, index) => (
                <div
                    key={step.path}
                    className={`progress-step ${index === currentIndex ? 'active' :
                            index < currentIndex ? 'completed' : ''
                        }`}
                    title={step.label}
                />
            ))}
        </div>
    );
}

export default ProgressIndicator;
