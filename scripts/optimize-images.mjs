// Generates a WebP version next to every JPG/PNG in public/images, resized and
// compressed for the web. Originals are never modified.
//
// Usage:
//   npm run optimizar-imagenes
//   npm run optimizar-imagenes -- --dir public/images/productos --max-width 1200 --quality 75
//   npm run optimizar-imagenes -- --force      (regenerate even if the WebP is up to date)
//   npm run optimizar-imagenes -- --recortar   (trim the empty margin of photos without background)
//   npm run optimizar-imagenes -- --quitar-fondo  (make a plain white background transparent, then trim)
//   npm run optimizar-imagenes -- --archivo public/images/store/foto.jpg  (just one file)

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
    recortar: { type: 'boolean', default: false },
    'quitar-fondo': { type: 'boolean', default: false },
    archivo: { type: 'string' },
  },
});

const maxWidth = Number(options['max-width']);
const quality = Number(options.quality);
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
/** Transparent border kept around a trimmed product, relative to its longest side. */
const TRIM_PADDING = 0.02;
/** A pixel counts as white background when its darkest channel is at least this light… */
const WHITE_MIN = 232;
/** …and it is nearly grey (no colour cast), so pale product colours are kept. */
const WHITE_MAX_SPREAD = 18;
/** Share of the photo's border that must be white before removing anything. */
const WHITE_BORDER_SHARE = 0.85;

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

/**
 * Removes the transparent margin around a product whose background was removed, keeping a
 * small border. Returns undefined for opaque photos: trimming them could cut into a plain
 * background that is part of the picture.
 */
async function trimTransparentMargin(source) {
  if ((await sharp(source).stats()).isOpaque) {
    return undefined;
  }
  // PNG keeps the intermediate steps lossless.
  const rotated = await sharp(source).rotate().png().toBuffer();
  return trimBuffer(rotated);
}

async function trimBuffer(png) {
  const { data, info } = await sharp(png)
    .trim({ threshold: 10 })
    .png()
    .toBuffer({ resolveWithObject: true });
  const pad = Math.round(Math.max(info.width, info.height) * TRIM_PADDING);
  const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
  const padded = await sharp(data)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: transparent })
    .png()
    .toBuffer();
  return sharp(padded);
}

/**
 * Makes transparent the white background around a product photographed on white. Only white
 * connected to the edges of the photo is removed, so white areas inside the product (labels,
 * text) stay. Returns undefined when the photo does not have a white border.
 */
async function removeWhiteBackground(source) {
  const { data, info } = await sharp(source)
    .rotate()
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const isWhite = (i) => {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    return Math.min(r, g, b) >= WHITE_MIN && Math.max(r, g, b) - Math.min(r, g, b) <= WHITE_MAX_SPREAD;
  };

  const border = [];
  for (let x = 0; x < width; x++) border.push(x, (height - 1) * width + x);
  for (let y = 1; y < height - 1; y++) border.push(y * width, y * width + width - 1);
  if (border.filter(isWhite).length / border.length < WHITE_BORDER_SHARE) {
    return undefined;
  }

  // Flood fill from the border through white pixels.
  const background = new Uint8Array(width * height);
  const queue = border.filter(isWhite);
  for (const i of queue) background[i] = 1;
  while (queue.length > 0) {
    const i = queue.pop();
    const x = i % width;
    for (const n of [i - width, i + width, x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1]) {
      if (n >= 0 && n < width * height && !background[n] && isWhite(n)) {
        background[n] = 1;
        queue.push(n);
      }
    }
  }

  // Edge pixels next to the background fade by how light they are, to avoid a white halo.
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = data[i * 3];
    rgba[i * 4 + 1] = data[i * 3 + 1];
    rgba[i * 4 + 2] = data[i * 3 + 2];
    if (background[i]) {
      rgba[i * 4 + 3] = 0;
      continue;
    }
    const x = i % width;
    const touchesBackground =
      (i >= width && background[i - width]) ||
      (i < width * (height - 1) && background[i + width]) ||
      (x > 0 && background[i - 1]) ||
      (x < width - 1 && background[i + 1]);
    const lightest = Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
    rgba[i * 4 + 3] = touchesBackground
      ? Math.max(0, Math.min(255, Math.round(((255 - lightest) / 65) * 255)))
      : 255;
  }
  const png = await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer();
  return trimBuffer(png);
}

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`.padStart(8);
}

let totalBefore = 0;
let totalAfter = 0;
let converted = 0;
let skipped = 0;
let trimmedCount = 0;

async function* listSources() {
  if (options.archivo) {
    yield options.archivo;
  } else {
    yield* findImages(options.dir);
  }
}

// photo.jpg and photo.png would both become photo.webp: keep the most recently edited one.
const sources = new Map();
for await (const source of listSources()) {
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
    const trimmedImage =
      (options['quitar-fondo'] ? await removeWhiteBackground(source) : undefined) ??
      (options.recortar || options['quitar-fondo'] ? await trimTransparentMargin(source) : undefined);
    const trimmed = trimmedImage !== undefined;
    trimmedCount += Number(trimmed);
    // Apply the camera orientation before EXIF data is dropped.
    const image = trimmedImage ?? sharp(source).rotate();
    const info = await image
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(target);
    const before = (await stat(source)).size;
    totalBefore += before;
    totalAfter += info.size;
    converted++;
    const saved = Math.round((1 - info.size / before) * 100);
    console.log(
      `${kb(before)} → ${kb(info.size)}  (${String(saved).padStart(3)} %)  ${name}` +
        (trimmed ? `  · recortada a ${info.width}×${info.height}` : ''),
    );
  } catch (error) {
    console.error(`No se pudo convertir ${name}: ${error.message}`);
    process.exitCode = 1;
  }
}

console.log(
  `\n${converted} convertidas` +
    (options.recortar || options['quitar-fondo'] ? ` (${trimmedCount} recortadas)` : '') +
    ', ' +
    `${skipped} ya estaban al día.` +
    (converted
      ? ` Total: ${kb(totalBefore).trim()} → ${kb(totalAfter).trim()}` +
        ` (${Math.round((1 - totalAfter / totalBefore) * 100)} % menos).`
      : ''),
);
