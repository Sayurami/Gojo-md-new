const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const { spawn } = require('child_process');

async function downloadAndExtract(url, destPath) {
  const tmpPath = path.join(__dirname, 'temp.zip');
  try {
    console.log(`⬇️ Downloading from ${url}...`);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer'
    });
    fs.writeFileSync(tmpPath, response.data);
    console.log(`✅ Downloaded to ${tmpPath}`);

    const zip = new AdmZip(tmpPath);

    // If folder exists, remove it (clean start)
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true, force: true });
      console.log(`🗑️ Deleted existing folder: ${destPath}`);
    }

    zip.extractAllTo(destPath, true);
    console.log(`✅ Extracted to ${destPath}`);

    fs.unlinkSync(tmpPath);
    console.log(`🗑️ Deleted temp.zip`);
  } catch (err) {
    console.error('❌ Download or extract failed:', err);
    process.exit(1);
  }
}

async function main() {
  const pluginsUrl = 'https://files.catbox.moe/rtz9xd.zip';
  const botUrl = 'https://files.catbox.moe/5eskqc.zip';

  const pluginsPath = path.join(__dirname, 'plugins');
  const botPath = path.join(__dirname, 'bot');

  // 1. Download & extract plugins
  await downloadAndExtract(pluginsUrl, pluginsPath);

  // 2. Load plugins
  if (fs.existsSync(pluginsPath)) {
    const pluginFiles = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js'));
    for (const file of pluginFiles) {
      try {
        require(path.join(pluginsPath, file));
        console.log(`✅ Plugin loaded: ${file}`);
      } catch (err) {
        console.error(`❌ Plugin load error: ${file}`, err);
      }
    }
  } else {
    console.warn('⚠️ Plugins folder missing!');
  }

  // 3. Download & extract main bot files
  await downloadAndExtract(botUrl, botPath);

  // 4. Check index.js presence in bot folder
  const indexFile = path.join(botPath, 'index.js');
  if (!fs.existsSync(indexFile)) {
    console.error('❌ index.js not found in bot folder:', indexFile);
    process.exit(1);
  }

  // 5. Start bot
  console.log(`🚀 Starting bot from ${indexFile}...`);
  const botProcess = spawn('node', [indexFile], { stdio: 'inherit', cwd: botPath });

  botProcess.on('exit', (code) => {
    console.log(`🔁 Bot exited with code: ${code}`);
  });
}

main();
