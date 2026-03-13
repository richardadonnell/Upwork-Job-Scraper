import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const sizes = [16, 32, 48, 96, 128];
const source = "public/logo.svg";
const outputDir = "public/icon";

await mkdir(outputDir, { recursive: true });

for (const size of sizes) {
  await sharp(source)
    .resize(size, size)
    .png()
    .toFile(`${outputDir}/${size}.png`);
}

console.log("Generated icons from public/logo.svg");