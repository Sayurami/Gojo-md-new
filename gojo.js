const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const { spawn } = require('child_process');

async function downloadAndExtractZip(zipUrl) {
  const zipPath = path.join(__dirname, 'temp.zip');
  const extractPath = __dirname;

  try {
    const response = await axios({
      method: 'GET',
      url: zipUrl,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(zipPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log('✅ ZIP downloaded.');

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    console.log('✅ ZIP extracted.');
    fs.unlinkSync(zipPath);
    console.log('🗑️ ZIP file deleted.');
    console.log('🚀 Starting bot...');

    const bot = spawn('node', ['index.js'], { stdio: 'inherit', cwd: __dirname });

    bot.on('exit', (code) => {
      console.log(`🔁 Bot exited with code: ${code}`);
    });

  } catch (err) {
    console.error('❌ Error during setup:', err);
  }
}

// 🔗 NEW ZIP URL
const zipUrl = 'https://files.catbox.moe/0qt9de.zip';
downloadAndExtractZip(zipUrl);
