const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });
function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}


module.exports = {
SESSION_ID: process.env.SESSION_ID === undefined ? '6gQRhYTS#Bv8B9AtMzA5x9SL1O8UIC6KvOvg8pecbi36RWrPLSUM' : process.env.SESSION_ID,  
