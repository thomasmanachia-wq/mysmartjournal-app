import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");
const scriptsFile = path.resolve(__dirname, "data/scripts.json");
const outDir = path.resolve(rootDir, "out");

if (!fs.existsSync(scriptsFile)) {
  console.error(`[Remotion Bulk Render] Scripts file not found: ${scriptsFile}`);
  process.exit(1);
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const scripts = JSON.parse(fs.readFileSync(scriptsFile, "utf-8"));
const targetId = process.argv[2];
const isStillOnly = process.argv.includes("--still");

const itemsToRender = targetId && !targetId.startsWith("--")
  ? scripts.filter((s) => s.id === targetId)
  : scripts;

if (itemsToRender.length === 0) {
  console.error(`[Remotion Bulk Render] No script found matching ID: ${targetId}`);
  process.exit(1);
}

console.log(`\n======================================================`);
console.log(`🎬 REMOTION BULK RENDERING ENGINE - MYSMARTJOURNAL`);
console.log(`======================================================`);
console.log(`Found ${itemsToRender.length} video script(s) to render.`);
console.log(`Output Directory: ${outDir}\n`);

const startTime = Date.now();
let successCount = 0;

for (let i = 0; i < itemsToRender.length; i++) {
  const item = itemsToRender[i];
  const progressPrefix = `[${i + 1}/${itemsToRender.length}]`;
  console.log(`${progressPrefix} Starting render: ${item.id} (${item.tradePair} · ${item.direction})`);
  console.log(`   Hook: "${item.hookText}"`);

  const itemStart = Date.now();
  try {
    if (isStillOnly) {
      const outputPath = path.resolve(outDir, `${item.id}-preview.png`);
      execSync(
        `npx remotion still src/remotion/index.js ${item.id} ${outputPath} --frame=120`,
        { cwd: rootDir, stdio: "inherit" }
      );
      console.log(`   ✅ Still preview generated: out/${item.id}-preview.png (${((Date.now() - itemStart) / 1000).toFixed(1)}s)\n`);
    } else {
      const outputPath = path.resolve(outDir, `${item.id}.mp4`);
      execSync(
        `npx remotion render src/remotion/index.js ${item.id} ${outputPath}`,
        { cwd: rootDir, stdio: "inherit" }
      );
      console.log(`   ✅ Video generated: out/${item.id}.mp4 (${((Date.now() - itemStart) / 1000).toFixed(1)}s)\n`);
    }
    successCount++;
  } catch (err) {
    console.error(`   ❌ Failed to render ${item.id}:`, err.message);
  }
}

const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`======================================================`);
console.log(`🎉 BULK RENDER COMPLETE: ${successCount}/${itemsToRender.length} succeeded in ${totalTime}s`);
console.log(`======================================================\n`);
