hyperfine -w 1 \
  -n esbuild-cache \
  --prepare "" \
  "YARN_TRANSPILER=esbuild node ./scripts/run-yarn.js --version" \
  -n esbuild-no-cache \
  --prepare "rm -r ./node_modules/.cache/yarn" \
  "YARN_TRANSPILER=esbuild node ./scripts/run-yarn.js --version" \
  -n esbuild-partial-cache \
  --prepare "echo '//' | tee -a packages/yarnpkg-core/sources/*.ts" \
  "YARN_TRANSPILER=esbuild node ./scripts/run-yarn.js --version" \
  -n babel-cache \
  --prepare "" \
  "YARN_TRANSPILER=babel node ./scripts/run-yarn.js --version" \
  -n babel-no-cache \
  --prepare "rm -r /tmp/babel" \
  "YARN_TRANSPILER=babel node ./scripts/run-yarn.js --version" \
  -n babel-partial-cache \
  --prepare "echo '//' | tee -a packages/yarnpkg-core/sources/*.ts" \
  "YARN_TRANSPILER=babel node ./scripts/run-yarn.js --version"

# Benchmark 1: esbuild-cache
#   Time (mean ± σ):      1.176 s ±  0.026 s    [User: 1.330 s, System: 0.084 s]
#   Range (min … max):    1.142 s …  1.221 s    10 runs

# Benchmark 2: esbuild-no-cache
#   Time (mean ± σ):      3.161 s ±  0.054 s    [User: 1.687 s, System: 0.145 s]
#   Range (min … max):    3.104 s …  3.270 s    10 runs

# Benchmark 3: esbuild-partial-cache
#   Time (mean ± σ):      2.047 s ±  0.023 s    [User: 1.581 s, System: 0.124 s]
#   Range (min … max):    2.006 s …  2.086 s    10 runs

# Benchmark 4: babel-cache
#   Time (mean ± σ):      1.916 s ±  0.044 s    [User: 2.410 s, System: 0.154 s]
#   Range (min … max):    1.852 s …  1.986 s    10 runs

# Benchmark 5: babel-no-cache
#   Time (mean ± σ):      7.089 s ±  0.098 s    [User: 10.853 s, System: 0.373 s]
#   Range (min … max):    6.997 s …  7.297 s    10 runs

# Benchmark 6: babel-partial-cache
#   Time (mean ± σ):      2.910 s ±  0.038 s    [User: 4.215 s, System: 0.214 s]
#   Range (min … max):    2.847 s …  2.996 s    10 runs

# Summary
#   'esbuild-cache' ran
#     1.63 ± 0.05 times faster than 'babel-cache'
#     1.74 ± 0.04 times faster than 'esbuild-partial-cache'
#     2.47 ± 0.06 times faster than 'babel-partial-cache'
#     2.69 ± 0.07 times faster than 'esbuild-no-cache'
#     6.03 ± 0.16 times faster than 'babel-no-cache'
