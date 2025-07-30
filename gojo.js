const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const { spawn } = require('child_process');

async function downloadAndExtractZip(zipUrl) {
  const zipPath = path.join(__dirname, 'temp.zip');
  const extractPath = __dirname;

  try {
    // ZIP එක download කරන්න
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

    // ZIP extract කරන්න
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);
    console.log('✅ ZIP එක extract කරා.');

    // ZIP file එක delete කරන්න
    fs.unlinkSync(zipPath);
    console.log('🗑️ ZIP file එක delete කරා.');

    // Extract වෙලා ඇති folder list එක බලන්න
    const extractedFolders = fs.readdirSync(extractPath)
      .filter(f => fs.statSync(path.join(extractPath, f)).isDirectory());
    console.log('Extracted folders:', extractedFolders);

    if (extractedFolders.length === 0) {
      console.error('❌ Extracted folder එකක් හමු නොවීය.');
      return;
    }

    // Main extracted folder එක assume කරමු පළවෙනි එක
    const mainExtractedFolder = extractedFolders[0];
    const mainFolderPath = path.join(extractPath, mainExtractedFolder);

    // plugins folder path
    const pluginPath = path.join(mainFolderPath, 'plugins');
    if (fs.existsSync(pluginPath)) {
      const pluginFiles = fs.readdirSync(pluginPath).filter(f => f.endsWith('.js'));
      for (const file of pluginFiles) {
        try {
          require(path.join(pluginPath, file));
          console.log(`✅ Plugin එක load වුනා: ${file}`);
        } catch (err) {
          console.error(`❌ Plugin load error: ${file}`, err);
        }
      }
    } else {
      console.warn('⚠️ Plugins folder එක හමු නොවුණා:', pluginPath);
    }

    // index.js path බලමු
    const indexPath = path.join(mainFolderPath, 'index.js');
    if (!fs.existsSync(indexPath)) {
      console.error('❌ index.js file එක හමු නොවීය:', indexPath);
      return;
    }

    // Bot start කිරීම
    console.log(`🚀 Bot එක ${indexPath} වෙතින් start වෙමින්...`);
    const bot = spawn('node', [indexPath], { stdio: 'inherit', cwd: mainFolderPath });

    bot.on('exit', (code) => {
      console.log(`🔁 Bot එක නවත්වුනා code එක: ${code}`);
    });

  } catch (err) {
    console.error('❌ Setup එකේ දෝෂයක්:', err);
  }
}

const zipUrl = 'https://files.catbox.moe/59cwqr.zip'; // ඔයාට අවශ්‍ය URL එක දාන්න
downloadAndExtractZip(zipUrl);
