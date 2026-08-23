const fs = require('fs');

function inspectBounds(filePath) {
  console.log(`\n=== Bounds: ${filePath} ===`);
  const buffer = fs.readFileSync(filePath);
  
  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546C67) {
    console.error("Not a valid GLB file");
    return;
  }
  
  const chunkLength = buffer.readUInt32LE(12);
  const jsonBuffer = buffer.slice(20, 20 + chunkLength);
  const gltf = JSON.parse(jsonBuffer.toString('utf8'));
  
  // Let's find meshes and their position accessors
  if (gltf.meshes) {
    gltf.meshes.forEach((mesh, index) => {
      console.log(`Mesh ${index}: "${mesh.name || 'unnamed'}"`);
      mesh.primitives.forEach((prim, pIdx) => {
        const posAccessorIndex = prim.attributes.POSITION;
        if (posAccessorIndex !== undefined && gltf.accessors) {
          const accessor = gltf.accessors[posAccessorIndex];
          console.log(`  Primitive ${pIdx} POSITION accessor ${posAccessorIndex}:`);
          console.log(`    min: ${JSON.stringify(accessor.min)}`);
          console.log(`    max: ${JSON.stringify(accessor.max)}`);
          if (accessor.min && accessor.max) {
            const h = accessor.max[1] - accessor.min[1];
            const w = accessor.max[0] - accessor.min[0];
            const d = accessor.max[2] - accessor.min[2];
            console.log(`    computed dimensions: width=${w.toFixed(3)}, height=${h.toFixed(3)}, depth=${d.toFixed(3)}`);
          }
        }
      });
    });
  }
}

inspectBounds('public/models/male.glb');
inspectBounds('public/models/female.glb');
