// Пакет мини-приложения .map (mini application package) — как .apk у Android: zip, в корне которого
// manifest.json (MapManifest) и бандл JS. Так мини-приложение ставят в лаунчер без пересборки
// самого лаунчера: в режиме разработчика — «Установить пакет .map». Собирает пакет CLI tugen-map.
//
// Модуль без react-native: его же выполняет CLI в Node.

import { validateManifest, type GameManifest } from './game';

export const MAP_EXTENSION = '.map';

/** Версия формата пакета: лаунчер не откроет пакет с format, которого не знает */
export const MAP_FORMAT = 1;

/**
 * Единственные внешние модули, которые бандл пакета может получить через require; всё остальное
 * бандлер вшивает внутрь. Лаунчер отдаёт свои копии — поэтому у мини-приложения тот же React, что
 * у лаунчера, и рабочий SDK (useHost, Safe Area).
 *
 * `react-native` в песочнице урезанный: без NativeModules, TurboModuleRegistry,
 * DeviceEventEmitter, NativeEventEmitter и Linking. Доступ к системе — только через useHost()
 */
export const SANDBOX_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-native',
  '@tugen/sdk',
] as const;

/**
 * Файл manifest.json в корне пакета.
 *
 * Бандл (`entry`) — CommonJS. Его экспорт по умолчанию — `module.exports.default` или сам
 * `module.exports` — результат `defineGame(...)`
 */
export interface MapManifest {
  format: 1;
  /** Версия SDK, под которую собран пакет (x.y.z) */
  sdk: string;
  /** Путь бандла внутри zip, через «/», обычно 'bundle.js' */
  entry: string;
  game: GameManifest;
}

export type MapManifestResult =
  | { ok: true; manifest: MapManifest }
  | { ok: false; error: string };

const SEMVER = /^\d+\.\d+\.\d+$/;

/** Путь внутри zip не должен выводить за его пределы: ни абсолютного, ни «..», ни «\» */
function entryError(entry: unknown): string | null {
  if (typeof entry !== 'string' || !entry.endsWith('.js')) {
    return 'entry — не путь к .js';
  }
  if (
    entry.startsWith('/') ||
    entry.includes('\\') ||
    /^[A-Za-z]:/.test(entry) ||
    entry.split('/').some(part => part === '..' || part === '')
  ) {
    return `недопустимый путь entry «${entry}»`;
  }
  return null;
}

/** Разбор manifest.json пакета: пакет приходит снаружи, поэтому проверяется каждое поле */
export function parseMapManifest(text: string): MapManifestResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'manifest.json — не JSON' };
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: 'manifest.json — не объект' };
  }
  const { format, sdk, entry, game } = data as Record<string, unknown>;
  if (format !== MAP_FORMAT) {
    return {
      ok: false,
      error: `неизвестный формат пакета «${String(format)}»`,
    };
  }
  if (typeof sdk !== 'string' || !SEMVER.test(sdk)) {
    return { ok: false, error: `неверная версия SDK «${String(sdk)}»` };
  }
  const error =
    entryError(entry) ??
    (typeof game === 'object' && game !== null
      ? validateManifest(game as GameManifest)
      : 'нет манифеста игры (game)');
  if (error) return { ok: false, error };
  return { ok: true, manifest: data as MapManifest };
}
