hyperfine -w 1 \
  -n esbuild-cache \
  --prepare "" \
  "YARN_TRANSPILER=esbuild node ./scripts/run-yarn.js --version" \
  -n esbuild-no-cache \
  --prepare "rm -r ./node_modules/.cache/yarn" \
  "YARN_TRANSPILER=esbuild node ./scripts/run-yarn.js --version" \
  -n esbuild-partial-cache \
  --prepare "echo '//' >> packages/yarnpkg-cli/sources/cli.ts" \
  "YARN_TRANSPILER=esbuild node ./scripts/run-yarn.js --version" \
  -n babel-cache \
  --prepare "" \
  "YARN_TRANSPILER=babel node ./scripts/run-yarn.js --version" \
  -n babel-no-cache \
  --prepare "rm -r /tmp/babel" \
  "YARN_TRANSPILER=babel node ./scripts/run-yarn.js --version" \
  -n babel-partial-cache \
  --prepare "echo '//' >> packages/yarnpkg-cli/sources/cli.ts" \
  "YARN_TRANSPILER=babel node ./scripts/run-yarn.js --version"

# Benchmark 1: esbuild-cache
#   Time (mean ± σ):      1.147 s ±  0.017 s    [User: 1.295 s, System: 0.089 s]
#   Range (min … max):    1.114 s …  1.174 s    10 runs

# Benchmark 2: esbuild-no-cache
#   Time (mean ± σ):      3.115 s ±  0.030 s    [User: 1.657 s, System: 0.157 s]
#   Range (min … max):    3.073 s …  3.166 s    10 runs

# Benchmark 3: esbuild-partial-cache
#   Time (mean ± σ):      1.598 s ±  0.024 s    [User: 1.538 s, System: 0.117 s]
#   Range (min … max):    1.566 s …  1.645 s    10 runs

# Benchmark 4: babel-cache
#   Time (mean ± σ):      1.891 s ±  0.034 s    [User: 2.385 s, System: 0.149 s]
#   Range (min … max):    1.842 s …  1.955 s    10 runs

# Benchmark 5: babel-no-cache
#   Time (mean ± σ):      7.251 s ±  0.197 s    [User: 11.019 s, System: 0.424 s]
#   Range (min … max):    7.043 s …  7.593 s    10 runs

# Benchmark 6: babel-partial-cache
#   Time (mean ± σ):      1.843 s ±  0.037 s    [User: 2.293 s, System: 0.159 s]
#   Range (min … max):    1.789 s …  1.887 s    10 runs

# Summary
#   'esbuild-cache' ran
#     1.39 ± 0.03 times faster than 'esbuild-partial-cache'
#     1.61 ± 0.04 times faster than 'babel-partial-cache'
#     1.65 ± 0.04 times faster than 'babel-cache'
#     2.72 ± 0.05 times faster than 'esbuild-no-cache'
#     6.32 ± 0.19 times faster than 'babel-no-cache'
