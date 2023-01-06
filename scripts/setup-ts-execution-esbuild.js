const esbuild = require(`esbuild-wasm`);
const fs = require(`fs`);
const v8 = require(`v8`);
const path = require(`path`);
const pirates = require(`pirates`);

process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ``} -r ${JSON.stringify(require.resolve(`pnpapi`))}`;

const weeksSinceUNIXEpoch = Math.floor(Date.now() / 604800000);

const cache = {
  version: `3\0${esbuild.version}\0${weeksSinceUNIXEpoch}`,
  files: new Map(),
  isDirty: false,
};

const cachePath = path.join(__dirname, `../node_modules/.cache/yarn/esbuild-transpile-cache.bin`);
try {
  const cacheData = v8.deserialize(fs.readFileSync(cachePath));
  if (cacheData.version === cache.version) {
    cache.files = cacheData.files;
  }
} catch { }

process.once(`exit`, () => {
  if (!cache.isDirty)
    return;

  fs.mkdirSync(path.dirname(cachePath), {recursive: true});
  fs.writeFileSync(cachePath, v8.serialize({
    version: cache.version,
    files: cache.files,
  }));
});

pirates.addHook(
  (sourceCode, filename) => {
    const cacheEntry = cache.files.get(filename);

    if (cacheEntry?.source === sourceCode)
      return cacheEntry.code;

    const res = esbuild.transformSync(sourceCode, {
      target: `node14`,
      loader: path.extname(filename).slice(1),
      sourcefile: filename,
      sourcemap: `inline`,
      platform: `node`,
      format: `cjs`,
    });

    cache.isDirty = true;
    cache.files.set(filename, {
      source: sourceCode,
      code: res.code,
    });

    return res.code;
  },
  {
    extensions: [`.jsx`, `.js`, `.ts`, `.tsx`],
    matcher(p) {
      if (p?.endsWith(`.js`)) return /packages(\\|\/)yarnpkg-pnp(\\|\/)sources(\\|\/)node/.test(p);

      return true;
    },
  },
);
