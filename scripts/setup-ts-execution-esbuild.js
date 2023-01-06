const esbuild = require(`esbuild-wasm`);
const fs = require(`fs`);
const crypto = require(`crypto`);
const v8 = require(`v8`);
const path = require(`path`);
const pirates = require(`pirates`);

process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ``} -r ${JSON.stringify(require.resolve(`pnpapi`))}`;

let cache = {
  version: `3\0${esbuild.version}`,
  files: new Map(),
};

const cachePath = path.join(__dirname, `../node_modules/.cache/yarn/esbuild-transpile-cache.bin`);
try {
  const cacheData = v8.deserialize(fs.readFileSync(cachePath));
  if (cacheData.version === cache.version) {
    cache = cacheData;
  }
} catch { }

process.once(`exit`, () => {
  fs.mkdirSync(path.dirname(cachePath), {recursive: true});
  fs.writeFileSync(cachePath, v8.serialize(cache));
  // TODO: Remove unused entries from the cache
});

pirates.addHook(
  (code, filename) => {
    const cachedEntry = cache.files.get(filename);
    const {mtimeMs} = fs.statSync(filename);
    if (cachedEntry?.mtimeMs === mtimeMs)
      return cachedEntry.code;


    const hash = crypto.createHash(`sha1`).update(code).digest(`hex`);

    if (cachedEntry?.hash === hash)
      return cachedEntry.code;

    const res = esbuild.transformSync(code, {
      target: `node14`,
      loader: path.extname(filename).slice(1),
      sourcefile: filename,
      sourcemap: `inline`,
      platform: `node`,
      format: `cjs`,
    });

    cache.files.set(filename, {
      hash,
      mtimeMs,
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
