// Generates a WebP version next to every JPG/PNG in public/images, resized and
// compressed for the web. Originals are never modified.
//
// Usage:
//   npm run optimizar-imagenes
//   npm run optimizar-imagenes -- --dir public/images/productos --max-width 1200 --quality 75
//   npm run optimizar-imagenes -- --force      (regenerate even if the WebP is up to date)

import { readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const { values: options } = parseArgs({
  options: {
    dir: { type: 'string', default: 'public/images' },
    'max-width': { type: 'string', default: '1600' },
    quality: { type: 'string', default: '80' },
    force: { type: 'boolean', default: false },
  },
});

const maxWidth = Number(options['max-width']);
const quality = Number(options.quality);
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

async function* findImages(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* findImages(path);
    } else if (SOURCE_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      yield path;
    }
  }
}

async function isUpToDate(source, target) {
  try {
    return (await stat(target)).mtimeMs >= (await stat(source)).mtimeMs;
  } catch {
    return false;
  }
}

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`.padStart(8);
}

let totalBefore = 0;
let totalAfter = 0;
let converted = 0;
let skipped = 0;

// photo.jpg and photo.png would both become photo.webp: keep the most recently edited one.
const sources = new Map();
for await (const source of findImages(options.dir)) {
  const target = source.slice(0, -extname(source).length) + '.webp';
  const other = sources.get(target);
  if (other) {
    const [newer, older] =
      (await stat(source)).mtimeMs > (await stat(other)).mtimeMs ? [source, other] : [other, source];
    console.warn(
      `Aviso: ${relative(options.dir, older)} se ignora; se usa ${relative(options.dir, newer)} (más reciente).`,
    );
    sources.set(target, newer);
  } else {
    sources.set(target, source);
  }
}

for (const [target, source] of sources) {
  const name = relative(options.dir, source);
  if (!options.force && (await isUpToDate(source, target))) {
    skipped++;
    continue;
  }
  try {
    const info = await sharp(source)
      .rotate() // apply the camera orientation before EXIF data is dropped
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(target);
    const before = (await stat(source)).size;
    totalBefore += before;
    totalAfter += info.size;
    converted++;
    const saved = Math.round((1 - info.size / before) * 100);
    console.log(`${kb(before)} → ${kb(info.size)}  (${String(saved).padStart(3)} %)  ${name}`);
  } catch (error) {
    console.error(`No se pudo convertir ${name}: ${error.message}`);
    process.exitCode = 1;
  }
}

console.log(
  `\n${converted} convertidas, ${skipped} ya estaban al día.` +
    (converted
      ? ` Total: ${kb(totalBefore).trim()} → ${kb(totalAfter).trim()}` +
        ` (${Math.round((1 - totalAfter / totalBefore) * 100)} % menos).`
      : ''),
);
