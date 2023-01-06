const esbuild = require(`esbuild-wasm`);
const fs = require(`fs`);
const v8 = require(`v8`);
const zlib = require(`zlib`);
const path = require(`path`);
const pirates = require(`pirates`);
const pnpapi = require(`pnpapi`);

// Needed by the worker spawned by Esbuild
process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ``} -r ${JSON.stringify(require.resolve(`pnpapi`))}`;

const weeksSinceUNIXEpoch = Math.floor(Date.now() / 604800000);

const cache = {
  version: [6, esbuild.version, weeksSinceUNIXEpoch, process.versions.node, !!process.setSourceMapsEnabled].join(`\0`),
  files: new Map(),
  isDirty: false,
};

const cachePath = path.join(__dirname, `../node_modules/.cache/yarn/esbuild-transpile-cache.bin`);
try {
  const cacheData = v8.deserialize(zlib.gunzipSync(fs.readFileSync(cachePath)));
  if (cacheData.version === cache.version) {
    cache.files = cacheData.files;
  }
} catch { }

process.once(`exit`, () => {
  if (!cache.isDirty)
    return;

  fs.mkdirSync(path.dirname(cachePath), {recursive: true});
  fs.writeFileSync(cachePath, zlib.gzipSync(v8.serialize({
    version: cache.version,
    files: cache.files,
  }), {level: 1}));
});

process.setSourceMapsEnabled ? process.setSourceMapsEnabled(true) : require(`source-map-support`).install({
  environment: `node`,
  retrieveSourceMap(filename) {
    filename = pnpapi.resolveVirtual(filename) || filename;

    const cacheEntry = cache.files.get(filename);
    if (cacheEntry)
      return {url: undefined, map: cacheEntry.map};

    return null;
  },
});

pirates.addHook(
  (sourceCode, filename) => {
    filename = pnpapi.resolveVirtual(filename) || filename;

    const cacheEntry = cache.files.get(filename);

    if (cacheEntry?.source === sourceCode)
      return cacheEntry.code;

    const res = esbuild.transformSync(sourceCode, {
      target: `node${process.versions.node}`,
      loader: path.extname(filename).slice(1),
      sourcefile: filename,
      sourcemap: process.setSourceMapsEnabled ? `inline` : `both`,
      platform: `node`,
      format: `cjs`,
    });

    cache.isDirty = true;
    cache.files.set(filename, {
      source: sourceCode,
      code: res.code,
      map: res.map,
    });

    return res.code;
  },
  {
    extensions: [`.tsx`, `.ts`, `.js`],
    matcher(p) {
      if (p?.endsWith(`.js`)) return /packages(\\|\/)yarnpkg-pnp(\\|\/)sources(\\|\/)node/.test(p);

      return true;
    },
  },
);
