const fs = require('fs');

function inspectAttributes(filePath) {
  console.log(`\n=== Inspecting Attributes: ${filePath} ===`);
  const buffer = fs.readFileSync(filePath);
  
  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546C67) {
    console.error("Not a valid GLB file");
    return;
  }
  
  const chunkLength = buffer.readUInt32LE(12);
  const jsonBuffer = buffer.slice(20, 20 + chunkLength);
  const gltf = JSON.parse(jsonBuffer.toString('utf8'));
  
  if (gltf.meshes) {
    gltf.meshes.forEach((mesh, index) => {
      console.log(`Mesh ${index}: "${mesh.name || 'unnamed'}"`);
      mesh.primitives.forEach((prim, pIdx) => {
        console.log(`  Primitive ${pIdx}: Attributes:`, Object.keys(prim.attributes));
      });
    });
  }
}

inspectAttributes('public/models/male.glb');
inspectAttributes('public/models/female.glb');
