const fs = require('fs');

function inspectGlb(filePath) {
  console.log(`\n=== Inspecting: ${filePath} ===`);
  const buffer = fs.readFileSync(filePath);
  
  // GLB header is 12 bytes
  const magic = buffer.readUInt32LE(0);
  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);
  
  if (magic !== 0x46546C67) {
    console.error("Not a valid GLB file");
    return;
  }
  
  // First chunk header is 8 bytes
  const chunkLength = buffer.readUInt32LE(12);
  const chunkType = buffer.readUInt32LE(16);
  
  if (chunkType !== 0x4E4F534A) {
    console.error("First chunk is not JSON");
    return;
  }
  
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
    console.log("No meshes array in root GLTF JSON.");
  }
  
  console.log("Animations found:");
  if (gltf.animations) {
    gltf.animations.forEach((anim, index) => {
      console.log(`- Anim ${index}: ${anim.name}`);
    });
  } else {
    console.log("No animations array in root GLTF JSON.");
  }
  
  console.log("Nodes found:");
  if (gltf.nodes) {
    gltf.nodes.slice(0, 30).forEach((node, index) => {
      console.log(`- Node ${index}: ${node.name} (mesh index: ${node.mesh !== undefined ? node.mesh : 'none'})`);
    });
    if (gltf.nodes.length > 30) {
      console.log(`... and ${gltf.nodes.length - 30} more nodes`);
    }
  }
}

inspectGlb('public/models/male.glb');
inspectGlb('public/models/female.glb');
