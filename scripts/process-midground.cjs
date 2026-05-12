/**
 * Midground asset pipeline
 *
 * The source PNG already has a transparent background (sky removed manually).
 * This script copies it into public/ and removes the sparkle watermark
 * from the bottom-right corner.
 *
 * Usage: node scripts/process-midground.cjs
 */

const Jimp = require('jimp');
const path = require('path');

const INPUT  = path.resolve(__dirname, '../Landing Page Midground Image Building.png');
const OUTPUT = path.resolve(__dirname, '../public/midground-mask.png');

const WATERMARK_X_START = 0.93;
const WATERMARK_Y_START = 0.88;

async function main() {
  console.log('Reading midground source…');
  const image = await Jimp.read(INPUT);
  const { width, height, data } = image.bitmap;
  console.log(`    ${width} × ${height} px`);

  // Remove sparkle watermark (bottom-right corner) by filling with adjacent pixels
  const wmXStart = Math.floor(width  * WATERMARK_X_START);
  const wmYStart = Math.floor(height * WATERMARK_Y_START);
  const fillRefX = wmXStart - 30;
  for (let wy = wmYStart; wy < height; wy++) {
    const refIdx = (wy * width + fillRefX) * 4;
    const fr = data[refIdx], fg = data[refIdx + 1], fb = data[refIdx + 2], fa = data[refIdx + 3];
    for (let wx = wmXStart; wx < width; wx++) {
      const i = (wy * width + wx) * 4;
      data[i] = fr; data[i + 1] = fg; data[i + 2] = fb; data[i + 3] = fa;
    }
  }

  console.log('Writing midground-mask.png…');
  await image.writeAsync(OUTPUT);
  console.log(`Done → ${OUTPUT}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
