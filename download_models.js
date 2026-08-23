const fs = require('fs');
const https = require('https');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} -> ${dest}...`);
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${dest} successfully.`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  try {
    await download('https://models.readyplayer.me/65893b0514f9f5f28e61d783.glb', 'public/models/temp_1.glb');
    await download('https://models.readyplayer.me/661feb3563b4a87a148eb0df.glb', 'public/models/temp_2.glb');
    
    // Check gender of both
    const checkGender = (filePath) => {
      const buffer = fs.readFileSync(filePath);
      const chunkLength = buffer.readUInt32LE(12);
      const json = JSON.parse(buffer.slice(20, 20 + chunkLength).toString('utf8'));
      
      let nodesStr = JSON.stringify(json.nodes || []);
      // Check if it contains keywords like female, woman, male, man, or mixamo rig indicators
      console.log(`\n${filePath}:`);
      console.log(`Nodes count:`, json.nodes ? json.nodes.length : 0);
      console.log(`Meshes:`, json.meshes ? json.meshes.map(m => m.name) : []);
    };
    
    checkGender('public/models/temp_1.glb');
    checkGender('public/models/temp_2.glb');
  } catch (err) {
    console.error(err);
  }
}

run();
