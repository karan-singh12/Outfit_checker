const fs = require('fs');

function inspectGlb(filePath) {
  console.log(`\n=== Inspecting: ${filePath} ===`);
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
  }

  console.log("Materials list:");
  if (gltf.materials) {
    gltf.materials.forEach((mat, idx) => {
      console.log(`- Material ${idx}: "${mat.name}"`, JSON.stringify(mat.pbrMetallicRoughness || {}));
    });
  }

  console.log("Nodes list:");
  if (gltf.nodes) {
    gltf.nodes.slice(0, 30).forEach((node, index) => {
      if (node.mesh !== undefined) {
        console.log(`- Node ${index}: ${node.name} (mesh index: ${node.mesh})`);
      }
    });
  }
}

inspectGlb('public/models/michelle.glb');
inspectGlb('public/models/soldier.glb');
