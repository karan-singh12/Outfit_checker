const fs = require('fs');

function inspectMaterials(filePath) {
  console.log(`\n=== Inspecting Materials: ${filePath} ===`);
  const buffer = fs.readFileSync(filePath);
  
  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546C67) {
    console.error("Not a valid GLB file");
    return;
  }
  
  const chunkLength = buffer.readUInt32LE(12);
  const jsonBuffer = buffer.slice(20, 20 + chunkLength);
  const gltf = JSON.parse(jsonBuffer.toString('utf8'));
  
  console.log("Materials:");
  if (gltf.materials) {
    console.log(JSON.stringify(gltf.materials, null, 2));
  } else {
    console.log("No materials found");
  }

  console.log("Textures:");
  if (gltf.textures) {
    console.log(JSON.stringify(gltf.textures, null, 2));
  } else {
    console.log("No textures found");
  }

  console.log("Images:");
  if (gltf.images) {
    console.log(JSON.stringify(gltf.images, null, 2));
  } else {
    console.log("No images found");
  }
}

inspectMaterials('public/models/male.glb');
inspectMaterials('public/models/female.glb');
