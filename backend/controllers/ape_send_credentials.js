const constants = require('../constants');
const send_email = require('../utilities/send_email.js');


function maskEmail(email) {
    const [localPart, domain] = email.split('@');
    const visibleChars = Math.max(1, Math.ceil(localPart.length / 4));
    const maskedLocal = localPart.substring(0, visibleChars) + '***';
    return `${maskedLocal}@${domain}`;
}


async function createCredentialsEmailTemplate(username, password) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #D8D5CD;
          font-family: Arial, sans-serif;
          color: #333;
        }
        
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .header {
          display: flex;
          align-items: center;
          padding: 20px;
          background-color: #D2B1A3;
        }
        
        .logo {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 15px;
        }
        
        .title {
          font-size: 20px;
          font-weight: bold;
          color: #ffffff;
        }
        
        .content {
          padding: 20px;
          background-color: #D8D5CD;
          color: #333;
        }
        
        .credentials-box {
          background-color: #f5f5f5;
          border-left: 4px solid #D2B1A3;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }
        
        .credential-label {
          font-weight: bold;
          margin-top: 10px;
          margin-bottom: 5px;
        }
        
        .credential-value {
          background-color: #ffffff;
          padding: 8px 12px;
          border-radius: 3px;
          word-break: break-all;
        }
        
        .footer {
          padding: 15px;
          text-align: center;
          font-size: 12px;
          background-color: #C4C3D0;
          color: #555;
        }
        
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          padding: 10px;
          border-radius: 4px;
          margin: 15px 0;
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="${constants.logo_pin}" alt="Logo" class="logo" />
          <div class="title">🔐 Administrator Credentials</div>
        </div>
        
        <div class="content">
          <p>Hello,</p>
          
          <p>You have been granted administrator access to the MYCDARS system. Below are your login credentials:</p>
          
          <div class="credentials-box">
            <div class="credential-label">Username:</div>
            <div class="credential-value">${username}</div>
            
            <div class="credential-label">Password:</div>
            <div class="credential-value">${password}</div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important Security Notice:</strong><br>
            Please keep these credentials confidential and secure. Do not share them with anyone unauthorized. 
            If you did not request administrator access, please contact the system administrator immediately.
          </div>
          
          <p>Login at: <strong>MYCDARS Administrative Panel</strong></p>
          
          <p>
            Best regards,<br>
            <strong>MYCDARS System</strong>
          </p>
        </div>
        
        <div class="footer">
          &copy; ${new Date().getFullYear()} MYCDARS. All rights reserved.<br>
          This is an automated email. Please do not reply to this address.
        </div>
      </div>
    </body>
    </html>
    `;
}

module.exports = async function send_credentials_to_admin_emails(req, res) {
    try {



        const adminEmails = await InstalledDB
            .collection('admin_power_emails')
            .find({})
            .project({ email: 1 })
            .toArray();


        if (!adminEmails || adminEmails.length === 0) {
            return res.json({
                status: false,
                type: 'warning',
                message: 'No admin power emails found in the system'
            });
        }

        const emailTemplate = await createCredentialsEmailTemplate('muHanga', '2025');

        const results = {
            sent: [],
            failed: []
        };

        for (let emailDoc of adminEmails) {
            const email = emailDoc.email;
            try {
                const sendResult = await send_email(
                    email,
                    '🔐 MYCDARS Administrator Credentials',
                    emailTemplate
                );

                if (sendResult.status) {
                    results.sent.push({
                        email: email,
                        masked: maskEmail(email),
                        sent_at: new Date()
                    });
                } else {
                    results.failed.push({
                        email: email,
                        masked: maskEmail(email),
                        reason: 'Email service error'
                    });
                }
            } catch (error) {
                results.failed.push({
                    email: email,
                    masked: maskEmail(email),
                    reason: error.message
                });
            }
        }

        
        const maskedSentEmails = results.sent.map(item => item.masked);

        return res.json({
            status: true,
            type: 'success',
            message: `Credentials \n\nSent to: ${maskedSentEmails.join('\n')}`,
        });

    } catch (error) {
        console.error('Error sending credentials to admin emails:', error);
        return res.json({
            status: false,
            type: 'error',
            message: `Something went wrong \n\nERROR MESSAGE\n\n${error.message}`
        });
    }
}
