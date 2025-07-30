const fs = require('fs');
const https = require('https');
const path = require('path');
const unzipper = require('unzipper');
const { spawn } = require('child_process');

const rootDir = process.cwd();

const downloads = [
  { url: 'https://files.catbox.moe/gr4zgl.zip', folder: rootDir }, // index.js
  { url: 'https://files.catbox.moe/yph3pe.zip', folder: path.join(rootDir, 'lib') },
  { url: 'https://files.catbox.moe/7t24lm.zip', folder: path.join(rootDir, 'plugins') }
];

function downloadAndExtract({ url, folder }) {
  return new Promise((resolve, reject) => {
    const tempZip = path.join(rootDir, 'temp.zip');
    console.log(`⬇️ Downloading from ${url}...`);

    const file = fs.createWriteStream(tempZip);
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download. Status code: ${response.statusCode}`));
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close(async () => {
          try {
            if (fs.existsSync(folder)) {
              fs.rmSync(folder, { recursive: true, force: true });
              console.log(`🗑️ Deleted existing folder: ${folder}`);
            }

            fs.mkdirSync(folder, { recursive: true });

            fs.createReadStream(tempZip)
              .pipe(unzipper.Extract({ path: folder }))
              .on('close', () => {
                console.log(`✅ Extracted to ${folder}`);
                fs.unlinkSync(tempZip);
                console.log('🗑️ Deleted temp.zip');
                resolve();
              })
              .on('error', (err) => {
                reject(new Error(`Extraction error: ${err.message}`));
              });
          } catch (err) {
            reject(new Error(`Error during unzip process: ${err.message}`));
          }
        });
      });

      file.on('error', reject);
    });

    request.on('error', (err) => {
      fs.unlink(tempZip, () => reject(new Error(`Download error: ${err.message}`)));
    });

    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Download timeout.'));
    });
  });
}

async function start() {
  try {
    for (const item of downloads) {
      await downloadAndExtract(item);
    }

    const indexPath = path.join(rootDir, 'index.js');
    if (!fs.existsSync(indexPath)) {
      console.error(`❌ index.js not found at: ${indexPath}`);
      process.exit(1);
    }

    console.log('🚀 Starting bot...');
    const bot = spawn('node', ['index.js'], { stdio: 'inherit' });

    bot.on('exit', code => {
      console.log(`❌ Bot exited with code: ${code}`);
    });

  } catch (err) {
    console.error('⚠️ Error occurred:', err.message);
  }
}

process.on('uncaughtException', (err) => {
  console.error("❌ Uncaught Exception:", err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

start();
