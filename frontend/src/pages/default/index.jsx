
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/loading/Loader";
import { useOutletContext } from 'react-router-dom';
import api from '../../api/api.js';

export default function DefaultPage() {
    console.log('DefaultPage rendered');
    const navigate = useNavigate();
    const { authToken, myEmail, setAlertType, setAlertMessage, setShowAlert, setShowLoader, setLoaderMessage } = useOutletContext();

    useEffect(() => {
        
        const token = authToken || localStorage.getItem('authToken');

        if (!token) {
            navigate('/login');
            return;
        }
        let mounted = true;
        const validate = async () => {
            try {
                const response = await api('token/validate', 'GET', null, token, myEmail || null);
                console.log('Token validate response:', response);

                if (!mounted) return;

                setShowLoader(false);

                if (response && !response.status) {
                    localStorage.clear();
                }

                if (response && response.show_alert) {
                    setAlertType(response.type || 'warning');
                    setAlertMessage(response.message || '');
                    setShowAlert(true);
                }

                if (response && response.status) {
                    if (!response.goto_login) {
                        navigate('/dashboard');
                    } else {
                        navigate('/login');
                    }
                } else {
                    if (response && response.goto_login) {
                        navigate('/login');
                    }
                }
            } catch (err) {
                console.error('Error validating token:', err);
                setAlertType('error');
                setAlertMessage(err.message || 'Error validating session');
                setShowAlert(true);
                navigate('/login');
            }
        };

        validate();

        return () => { mounted = false; };
    }, [authToken, myEmail, navigate, setAlertType, setAlertMessage, setShowAlert, setShowLoader, setLoaderMessage]);

    return (
        <div className="start-up">
            <div id="Loader">
                <Loader />
            </div>
        </div>
    );

}
