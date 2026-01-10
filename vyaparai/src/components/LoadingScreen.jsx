/**
 * Loading Screen Component
 * Displayed while lazy-loaded pages are being fetched
 */
function LoadingScreen() {
    return (
        <div className="page center-content">
            <div className="loader">
                <div className="loader__spinner" style={{ width: '56px', height: '56px' }}></div>
                <span className="loader__text" style={{ marginTop: '16px', fontSize: '1.1rem' }}>
                    Loading...
                </span>
            </div>
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <span style={{ fontSize: '2rem' }}>🛒</span>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>VyaparAI</p>
            </div>
        </div>
    );
}

export default LoadingScreen;
