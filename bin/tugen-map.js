#!/usr/bin/env node
// tugen-map — сборка пакета мини-приложения .map (zip: manifest.json + bundle.js).
//
//   tugen-map build [entry=src/index.tsx] [--manifest src/manifest.ts] [--out dist/<id>.map]
//
// Правила пакета (формат, SANDBOX_MODULES, проверка манифеста) берутся из src/map.ts самого SDK —
// CLI собирает его esbuild-ом на лету, чтобы не держать вторую копию правил на JS.

'use strict';

const fs = require('fs');
const path = require('path');
const Module = require('module');
const esbuild = require('esbuild');
const { zipSync, strToU8 } = require('fflate');

const USAGE =
  'Использование: tugen-map build [entry=src/index.tsx] [--manifest src/manifest.ts] [--out dist/<id>.map]';

/** Выполнить собранный CommonJS-код в Node и вернуть его exports */
function evaluate(code, filename) {
  const mod = new Module(filename);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  mod._compile(code, filename);
  return mod.exports;
}

/** Собрать файл в один CommonJS-модуль для Node, без записи на диск */
function bundleForNode(options) {
  const result = esbuild.buildSync({
    bundle: true,
    format: 'cjs',
    platform: 'node',
    write: false,
    logLevel: 'silent',
    ...options,
  });
  return result.outputFiles[0].text;
}

function loadSdkRules() {
  const src = path.join(__dirname, '..', 'src');
  const code = bundleForNode({
    stdin: {
      contents: [
        "export { SDK_VERSION, validateManifest } from './game';",
        "export { MAP_FORMAT, SANDBOX_MODULES } from './map';",
      ].join('\n'),
      resolveDir: src,
      loader: 'ts',
    },
  });
  return evaluate(code, path.join(src, '__tugen-map-rules.js'));
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  if (command !== 'build') return null;
  const args = { entry: 'src/index.tsx', manifest: 'src/manifest.ts' };
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === '--manifest' || arg === '--out') {
      const value = rest[++i];
      if (!value) return null;
      args[arg.slice(2)] = value;
    } else if (arg.startsWith('--')) {
      return null;
    } else {
      args.entry = arg;
    }
  }
  return args;
}

function build(args) {
  const cwd = process.cwd();
  const rules = loadSdkRules();
  const external = [...rules.SANDBOX_MODULES];

  // Манифест — модуль TS с экспортом manifest: собираем и выполняем, чтобы взять готовый объект.
  // Модули песочницы не вшиваем: манифесту они нужны только ради типов
  const manifestPath = path.resolve(cwd, args.manifest);
  const manifestCode = bundleForNode({ entryPoints: [manifestPath], external });
  const game = evaluate(manifestCode, manifestPath).manifest;
  if (!game) {
    throw new Error(`${args.manifest}: нет экспорта manifest`);
  }
  const error = rules.validateManifest(game);
  if (error) throw new Error(`${args.manifest}: ${error}`);

  // Бандл: CommonJS под Hermes; всё, кроме модулей песочницы, вшивается внутрь
  const bundle = esbuild.buildSync({
    entryPoints: [path.resolve(cwd, args.entry)],
    bundle: true,
    format: 'cjs',
    target: 'es2019',
    platform: 'neutral',
    mainFields: ['react-native', 'browser', 'module', 'main'],
    conditions: ['react-native'],
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    jsx: 'automatic',
    external,
    minify: true,
    write: false,
    logLevel: 'warning',
    define: { 'process.env.NODE_ENV': '"production"' },
  }).outputFiles[0].text;

  const mapManifest = {
    format: rules.MAP_FORMAT,
    sdk: rules.SDK_VERSION,
    entry: 'bundle.js',
    game,
  };
  const zip = zipSync({
    'manifest.json': strToU8(JSON.stringify(mapManifest, null, 2)),
    'bundle.js': strToU8(bundle),
  });

  const out = path.resolve(
    cwd,
    args.out ?? path.join('dist', `${game.id}.map`),
  );
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, zip);
  return { out, size: zip.length, game };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args) {
    console.error(USAGE);
    process.exit(2);
  }
  try {
    const { out, size, game } = build(args);
    console.log(
      `Пакет ${game.id} ${game.version}: ${path.relative(
        process.cwd(),
        out,
      )} (${Math.ceil(size / 1024)} КБ)`,
    );
  } catch (error) {
    // Ошибки esbuild уже содержат файл и строку — печатаем их как есть
    console.error(
      `tugen-map: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }
}

main();
