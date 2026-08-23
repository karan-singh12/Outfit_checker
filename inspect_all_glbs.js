const fs = require('fs');
const path = require('path');

function inspectGlb(filePath) {
  console.log(`\n=== Inspecting: ${filePath} ===`);
  try {
    const buffer = fs.readFileSync(filePath);
    
    // GLB header is 12 bytes
    const magic = buffer.readUInt32LE(0);
    if (magic !== 0x46546C67) {
      console.error("Not a valid GLB file");
      return;
    }
    
    const chunkLength = buffer.readUInt32LE(12);
    const jsonBuffer = buffer.slice(20, 20 + chunkLength);
    const gltf = JSON.parse(jsonBuffer.toString('utf8'));
    
    console.log("Meshes found:");
    if (gltf.meshes) {
      gltf.meshes.forEach((mesh, index) => {
        console.log(`- Mesh ${index}: ${mesh.name}`);
        if (mesh.primitives) {
          mesh.primitives.forEach((prim, pIndex) => {
            const matIndex = prim.material;
            const matName = matIndex !== undefined && gltf.materials ? gltf.materials[matIndex].name : 'None';
            console.log(`  Primitive ${pIndex}: Material = "${matName}"`);
          });
        }
      });
    } else {
      console.log("No meshes array");
    }
  } catch (e) {
    console.error("Error inspecting file:", e.message);
  }
}

const dir = 'public/models';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.glb')) {
    inspectGlb(path.join(dir, file));
  }
});
