const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');

async function downloadAndExtractZip(zipUrl) {
  const zipPath = path.join(__dirname, 'temp.zip');
  const extractPath = __dirname;

  try {
    // ZIP එක බාගන්නවා
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

    console.log('✅ ZIP එක බාගත්තා.');

    // Extract
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);
    console.log('✅ ZIP එක extract කරා.');

    // Delete ZIP
    fs.unlinkSync(zipPath);
    console.log('🗑️ ZIP file එක delete කරා.');

    // Plugins load කිරීම
    const pluginDir = path.join(__dirname, 'plugins');
    if (fs.existsSync(pluginDir)) {
      const plugins = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));
      for (const file of plugins) {
        try {
          require(path.join(pluginDir, file));
          console.log(`✅ Plugin loaded: ${file}`);
        } catch (e) {
          console.error(`❌ Plugin load error (${file}):`, e);
        }
      }
    } else {
      console.warn('⚠️ plugins folder එක හමු නොවුණා!');
    }

  } catch (err) {
    console.error('❌ Error during setup:', err);
  }
}

const zipUrl = 'https://files.catbox.moe/jbz1vo.zip';
downloadAndExtractZip(zipUrl);
