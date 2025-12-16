import React, { useState } from 'react';

export default function PermissionModal({ show, onCancel, onRequest, isLoading }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const validateEmail = (emailValue) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailValue);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setError('');
    };

    const handleRequest = () => {
        if (!email.trim()) {
            onRequest(null, true);
            return;
        }

        if (!validateEmail(email)) {
            onRequest(null, true);
            return;
        }

        onRequest(email);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleRequest();
        }
    };

    if (!show) return null;

    return (
        <div className="permission-modal-overlay">
            <div className="permission-modal-container">
                <div className="permission-modal-header">
                    <div className="permission-modal-icon">🔐</div>
                    <h2 className="permission-modal-title">Limited Access</h2>
                </div>

                <div className="permission-modal-content">
                    <p className="permission-modal-message">
                        You have logged in successfully, but you don't have administrator permissions.
                        To request full administrator access, please enter your email address below.
                    </p>

                    <div className="permission-modal-form">
                        <label htmlFor="admin-email" className="permission-modal-label">
                            Email Address
                        </label>
                        <input
                            id="admin-email"
                            type="email"
                            className={`permission-modal-input ${error ? 'error' : ''}`}
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={handleEmailChange}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            autoFocus
                        />
                        {error && (
                            <p className="permission-modal-error">{error}</p>
                        )}
                    </div>

                    <p className="permission-modal-note">
                        If your email isn't listed by an administrator, please contact your system administrator for assistance.
                    </p>
                </div>

                <div className="permission-modal-footer">
                    <button
                        className="permission-modal-btn cancel-btn"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        className="permission-modal-btn request-btn"
                        onClick={handleRequest}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Waiting...' : 'Check Access'}
                    </button>
                </div>
            </div>
        </div>
    );
}
