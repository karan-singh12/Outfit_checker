const fs = require('fs');

function inspectTransforms(filePath) {
  console.log(`\n=== Transforms: ${filePath} ===`);
  const buffer = fs.readFileSync(filePath);
  
  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546C67) {
    console.error("Not a valid GLB file");
    return;
  }
  
  const chunkLength = buffer.readUInt32LE(12);
  const jsonBuffer = buffer.slice(20, 20 + chunkLength);
  const gltf = JSON.parse(jsonBuffer.toString('utf8'));
  
  // Find any nodes with scale or translations
  gltf.nodes.forEach((node, index) => {
    if (node.scale || node.translation || node.rotation) {
      console.log(`Node ${index} (${node.name}):`);
      if (node.translation) console.log(`  translation: ${JSON.stringify(node.translation)}`);
      if (node.rotation) console.log(`  rotation: ${JSON.stringify(node.rotation)}`);
      if (node.scale) console.log(`  scale: ${JSON.stringify(node.scale)}`);
    }
  });
}

inspectTransforms('public/models/male.glb');
inspectTransforms('public/models/female.glb');
