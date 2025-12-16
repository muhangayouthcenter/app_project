import './mycss.css';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../../api/api.js';

export default function Login() {
  const navigate = useNavigate();
  const { setAlertType, setAlertMessage, setShowAlert, setShowLoader, setLoaderMessage, setAuthToken, showAlert } = useOutletContext();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;
console.log(window.localStorage.getItem('authToken'))
    if(window.localStorage.getItem('authToken')) {
      
      return window.location.href = '/';
    }

    if (!username || !password) {
      setAlertType('warning');
      setAlertMessage('Please fill in all fields');
      setShowAlert(true);
      return;
    }

    try {
      setLoaderMessage('Logging in...');
      setShowLoader(true);

      const response = await api('sudo/login', 'POST', {
        username,
        password
      });

      if (response.status) {
        setAuthToken(response.access_token);
        setAlertType(response.type || 'success');
        setAlertMessage(response.message);
        setShowAlert(true);
        setShowLoader(false);
        
        // Navigate to dashboard after successful login
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setAlertType(response.type || 'warning');
        setAlertMessage(response.message);
        setShowAlert(true);
        setShowLoader(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setAlertType('error');
      setAlertMessage(error.message || 'An error occurred during login please try again later!');
      setShowAlert(true);
      setShowLoader(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    try {
      setLoaderMessage('Sending credentials...');
      setShowLoader(true);

      const response = await api('admin/emails/send-credentials', 'POST', {});

      if (response.status) {
        setAlertType(response.type || 'success');
        setAlertMessage(response.message);
        setShowAlert(true);
        setShowLoader(false);
      } else {
        setAlertType(response.type || 'warning');
        setAlertMessage(response.message);
        setShowAlert(true);
        setShowLoader(false);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setAlertType('error');
      setAlertMessage(error.message || 'An error occurred while sending credentials');
      setShowAlert(true);
      setShowLoader(false);
    }
  };

  return (
    <div className="login-root">
      <div className="box-root flex-flex flex-direction--column flex-grow-content">
        <div className="loginbackground box-background--white padding-top--64">
          <div className="loginbackground-gridContainer">
            <div className="box-root flex-flex grid-area-1">
              <div className="box-root box-background-gradient">
              </div>
            </div>
          </div>
        </div>
        <div className="box-root padding-top--24 flex-flex flex-direction--column flex-grow-content">
          <div className="box-root padding-top--48 padding-bottom--24 flex-flex flex-justifyContent--center">
          </div>
          <div className="formbg-outer">
            <div className="formbg">
              <div className="formbg-inner padding-horizontal--48">
                <div className="login-header">
                  <div className="login-icon-container">
                    <svg className="login-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="white" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 20a7.966 7.966 0 0 1-5.002-1.756l.002.001v-.683c0-1.794 1.492-3.25 3.333-3.25h3.334c1.84 0 3.333 1.456 3.333 3.25v.683A7.966 7.966 0 0 1 12 20ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.5-4.44 9.963-9.932 10h-.138C6.438 21.962 2 17.5 2 12Zm10-5c-1.84 0-3.333 1.455-3.333 3.25S10.159 13.5 12 13.5c1.84 0 3.333-1.455 3.333-3.25S13.841 7 12 7Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="login-header-text">
                    <h1 className="login-title">MUHANGA YOUTH CENTER</h1>
                    <p className="login-subtitle">Administrator Login</p>
                  </div>
                </div>
                <form id="stripe-login" onSubmit={handleSubmit}>
                  <div className="field">
                    <label htmlFor="username">Username*</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Enter your username"
                    />
                  </div>
                  <div className="field">
                    <div className="field-header">
                      <label htmlFor="password">Password*</label>
                    </div>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={togglePasswordVisibility}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="m4 15.6 3.055-3.056A4.913 4.913 0 0 1 7 12.012a5.006 5.006 0 0 1 5-5c.178.009.356.027.532.054l1.744-1.744A8.973 8.973 0 0 0 12 5.012c-5.388 0-10 5.336-10 7A6.49 6.49 0 0 0 4 15.6Z" />
                            <path d="m14.7 10.726 4.995-5.007A.998.998 0 0 0 18.99 4a1 1 0 0 0-.71.305l-4.995 5.007a2.98 2.98 0 0 0-.588-.21l-.035-.01a2.981 2.981 0 0 0-3.584 3.583c0 .012.008.022.01.033.05.204.12.402.211.59l-4.995 4.983a1 1 0 1 0 1.414 1.414l4.995-4.983c.189.091.386.162.59.211.011 0 .021.007.033.01a2.982 2.982 0 0 0 3.584-3.584c0-.012-.008-.023-.011-.035a3.05 3.05 0 0 0-.21-.588Z" />
                            <path d="m19.821 8.605-2.857 2.857a4.952 4.952 0 0 1-5.514 5.514l-1.785 1.785c.767.166 1.55.25 2.335.251 6.453 0 10-5.258 10-7 0-1.166-1.637-2.874-2.179-3.407Z" />
                          </svg>


                        ) : (
                          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M4.998 7.78C6.729 6.345 9.198 5 12 5c2.802 0 5.27 1.345 7.002 2.78a12.713 12.713 0 0 1 2.096 2.183c.253.344.465.682.618.997.14.286.284.658.284 1.04s-.145.754-.284 1.04a6.6 6.6 0 0 1-.618.997 12.712 12.712 0 0 1-2.096 2.183C17.271 17.655 14.802 19 12 19c-2.802 0-5.27-1.345-7.002-2.78a12.712 12.712 0 0 1-2.096-2.183 6.6 6.6 0 0 1-.618-.997C2.144 12.754 2 12.382 2 12s.145-.754.284-1.04c.153-.315.365-.653.618-.997A12.714 12.714 0 0 1 4.998 7.78ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
                          </svg>

                        )}
                      </button>
                    </div>
                  </div>
                  <div className="field field-submit">
                    <input type="submit" name="submit" value="Continue" />
                  </div>
                  <div className="field field-mode-switch">
                    <a href="#" onClick={handleForgotPassword} className="forgot-password-button">Forgot Account data?</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
