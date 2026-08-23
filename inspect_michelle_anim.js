const fs = require('fs');

function inspectAnimations(filePath) {
  console.log(`\n=== Animations: ${filePath} ===`);
  const buffer = fs.readFileSync(filePath);
  const magic = buffer.readUInt32LE(0);
  const chunkLength = buffer.readUInt32LE(12);
  const jsonBuffer = buffer.slice(20, 20 + chunkLength);
  const gltf = JSON.parse(jsonBuffer.toString('utf8'));
  
  if (!gltf.animations) {
    console.log("No animations found.");
    return;
  }
  gltf.animations.forEach((anim, index) => {
    console.log(`Animation ${index}: "${anim.name}"`);
  });
}

inspectAnimations('public/models/michelle.glb');
inspectAnimations('public/models/soldier.glb');
