
import axios from 'axios';
const backendURL = 'https://mycdar-backend.vercel.app/api';

export default async function FetchData(endpoint, method = 'GET', data = null, authToken = null, userEmail = null) {
    const config = {
        method: method,
        url: `${backendURL}/${endpoint}`,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Prepare request data with email_ss field
    let requestData = data || {};
    if (userEmail) {
        requestData.email_ss = userEmail;
    }
    
    if (requestData && Object.keys(requestData).length > 0) {
        config.data = requestData;
    }
  
    // apply retry logic for maximum 3 attempts
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            const response = await axios(config);
            return response.data;
        } catch (error) {
            attempt++;
            if (attempt >= maxRetries) {
                throw error;
            }
            // wait for a short delay before retrying
            await new Promise(res => setTimeout(res, 100));
        }
    }
}
