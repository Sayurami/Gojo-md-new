if (require('fs').existsSync('config.env')) require('dotenv').config({ path: './config.env' });

module.exports = {
  SESSION_ID: process.env.SESSION_ID || '6gQRhYTS#Bv8B9AtMzA5x9SL1O8UIC6KvOvg8pecbi36RWrPLSUM'
};
