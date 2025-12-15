

module.exports = async function forgot_password_email_schema(logo_src, title, message) {
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
      .footer {
        padding: 15px;
        text-align: center;
        font-size: 12px;
        background-color: #C4C3D0;
        color: #555;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <img src="${logo_src}" alt="Logo" class="logo" />
        <div class="title">${title}</div>
      </div>
      <div class="content">
        ${message}
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} MYCDARS. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};