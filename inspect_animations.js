const fs = require('fs');

function inspectAnimations(filePath) {
  console.log(`\n=== Animations: ${filePath} ===`);
  const buffer = fs.readFileSync(filePath);
  
  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546C67) {
    console.error("Not a valid GLB file");
    return;
  }
  
  const chunkLength = buffer.readUInt32LE(12);
  const jsonBuffer = buffer.slice(20, 20 + chunkLength);
  const gltf = JSON.parse(jsonBuffer.toString('utf8'));
  
  if (!gltf.animations) {
    console.log("No animations found.");
    return;
  }
  
  gltf.animations.forEach((anim, index) => {
    console.log(`Animation ${index}: "${anim.name}"`);
    let scaleChannels = 0;
    let translationChannels = 0;
    anim.channels.forEach(channel => {
      if (channel.target.path === 'scale') scaleChannels++;
      if (channel.target.path === 'translation') translationChannels++;
    });
    console.log(`  Scale channels: ${scaleChannels}, Translation channels: ${translationChannels}`);
  });
}

inspectAnimations('public/models/male.glb');
inspectAnimations('public/models/female.glb');
