
import { useEffect } from 'react';

export default function Alert({ type = 'success', message = '', show = true, onClose }) {

    console.log(`Alert component rendered with type: ${type} and message: ${message}`);

    if (!show || !message) {
        return null;
    }

    const getIcon = () => {
        switch (type) {
            case 'error':
                return (
                    <svg className="alert-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="alert-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H12Z" clipRule="evenodd" />
                    </svg>
                );
            case 'success':
            default:
                return (
                    <svg className="alert-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5" />
                    </svg>
                );
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Enter') {
                handleClose();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="alert">
            <div className={`alert-container alert-${type}`}>
                <div className="alert-header">
                    <div className="alert-icon-wrapper">
                        {getIcon()}
                    </div>
                    <div className="alert-title">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                </div>
                <div className="alert-message">{message}</div>
                <div className="alert-footer">
                    <button className="alert-btn-ok" onClick={handleClose}>OK</button>
                </div>
            </div>
        </div>
    );

}