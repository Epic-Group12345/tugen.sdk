import type { ComponentType } from 'react';
import type { SafeAreaInsets } from './insets';

// Контракт мини-приложения. Мини-приложение — отдельная единица лаунчера: сервис (друзья, чаты) или
// игра (пространство с файлами, запуском процессов и загрузками). Одинаково описывается манифестом
// и одинаково открывается: как вкладка в панели приложений, на всё окно под островами лаунчера.

/** Версия SDK: лаунчер не откроет мини-приложение, собранное под более новую major-версию */
export const SDK_VERSION = '1.0.0';

/** Текст на языках интерфейса: строка — одна на все языки; иначе по коду языка, 'ru' — обязателен */
export type LocalizedText = string | ({ ru: string } & Record<string, string>);

/** Текст на языке интерфейса: нет перевода — русский */
export const localize = (text: LocalizedText, locale: string): string =>
  typeof text === 'string' ? text : (text[locale] ?? text.ru);

/**
 * Вид мини-приложения:
 * - 'service' — сервис лаунчера: общение, друзья и подобное. Работает с данными аккаунта через
 *   социальный API хоста.
 * - 'game' — игра: своё пространство файлов, загрузки и запуск процесса игры.
 */
export type AppKind = 'service' | 'game';

/**
 * Право на часть хоста. Лаунчер выдаёт права по доверию к пакету: встроенное мини-приложение —
 * все, пакет .map — только разрешённые лаунчером. Без права часть хоста существует, но её вызов
 * бросает понятную ошибку
 */
export const APP_PERMISSIONS = [
  'files',
  'downloads',
  'process',
  'net',
  'clipboard',
  'camera',
  'microphone',
] as const;

export type AppPermission = (typeof APP_PERMISSIONS)[number];

/** Раздел мини-приложения. Это список для лаунчера: он запоминает открытый раздел и передаёт его пропом */
export interface AppSection {
  /** Постоянный идентификатор раздела. Латиница, цифры и «-» */
  id: string;
  title: LocalizedText;
  /** Имя иконки Gravity UI (https://gravity-ui.com/icons) в PascalCase, например 'Server' */
  icon: string;
}

/**
 * Где лаунчер открывает мини-приложение:
 * - 'embedded' — в окне лаунчера, на месте страницы, под его островами. По умолчанию.
 * - 'window' — запланировано: отдельное окно ОС. Лаунчер, который отдельных окон пока не умеет,
 *   открывает его как 'embedded' — поэтому верстать нужно под оба варианта.
 */
export type AppPresentation = 'embedded' | 'window';

export interface AppManifest {
  /** Постоянный идентификатор: имя пространства и ключ настроек. Латиница, цифры и «-» */
  id: string;
  /** Название для игрока */
  name: string;
  /** Версия мини-приложения */
  version: string;
  kind: AppKind;
  /** Имя иконки Gravity UI в PascalCase, например 'Cube'. Нет — значок лаунчера по умолчанию */
  icon?: string;
  /** По умолчанию 'embedded' */
  presentation?: AppPresentation;
  /** Права на части хоста; по умолчанию — ни одного: тема, интерфейс, хранилище, система и ссылки доступны всем */
  permissions?: AppPermission[];
  /**
   * Разделы по порядку. Первый открывается, когда игрок впервые заходит; дальше лаунчер возвращает
   * на последний открытый. Переключатель разделов рисует само мини-приложение
   */
  sections?: AppSection[];
}

/** Свойства корневого компонента, которые лаунчер передаёт мини-приложению */
export interface AppProps {
  /** Ширина и высота области, которую лаунчер отдал мини-приложению */
  width: number;
  height: number;
  /** Открытый раздел (AppSection.id); без разделов — пустая строка */
  section: string;
  /** Параметры открытия из другого мини-приложения (например, id друга для чата); пустой объект по умолчанию */
  params: Readonly<Record<string, string>>;
  /** Отступы от краёв, закрытые интерфейсом лаунчера — то же, что useSafeArea() */
  safeArea: SafeAreaInsets;
}

export interface TugenApp {
  manifest: AppManifest;
  /** Версия SDK, под которую собрано мини-приложение */
  sdk: string;
  /** Корневой компонент: лаунчер рисует его в своём окне, на месте страницы */
  App: ComponentType<AppProps>;
}

export type DefineAppInput = Pick<TugenApp, 'manifest' | 'App'>;

const ID = /^[a-z0-9][a-z0-9-]*$/;
/** Имя иконки Gravity UI: PascalCase, как в экспортах @gravity-ui/icons */
const ICON = /^[A-Z][A-Za-z0-9]*$/;
const PRESENTATIONS: readonly AppPresentation[] = ['embedded', 'window'];
const KINDS: readonly AppKind[] = ['service', 'game'];

const isText = (value: unknown): boolean =>
  typeof value === 'string' ||
  (typeof value === 'object' &&
    value !== null &&
    typeof (value as { ru?: unknown }).ru === 'string');

/** Проверка списка прав: текст ошибки или null */
const permissionsError = (permissions: unknown): string | null => {
  if (!Array.isArray(permissions)) return 'permissions — не массив';
  const unknown = permissions.find(
    p => !APP_PERMISSIONS.includes(p as AppPermission),
  );
  return unknown === undefined
    ? null
    : `неизвестное право «${String(unknown)}»`;
};

/** Проверка разделов: текст ошибки или null */
const sectionsError = (sections: unknown): string | null => {
  if (!Array.isArray(sections)) return 'sections — не массив';
  const seen = new Set<string>();
  for (const section of sections as Partial<AppSection>[]) {
    const id = section?.id;
    if (typeof id !== 'string' || !ID.test(id) || seen.has(id)) {
      return `неверный или повторный id раздела «${String(id)}»`;
    }
    if (!isText(section.title)) return `у раздела «${id}» нет названия`;
    if (typeof section.icon !== 'string' || !ICON.test(section.icon)) {
      return `неверное имя иконки раздела «${id}»`;
    }
    seen.add(id);
  }
  return null;
};

/**
 * Проверка манифеста: текст ошибки или null. Общая для defineApp и пакетов .map — манифест пакета
 * приходит из JSON без типов, поэтому проверяются типы каждого поля, а не только форматы
 */
export function validateManifest(manifest: AppManifest): string | null {
  const m = manifest as unknown as Record<string, unknown>;
  if (typeof m !== 'object' || m === null) return 'манифест — не объект';
  if (typeof m.id !== 'string' || !ID.test(m.id)) {
    return `неверный id «${String(m.id)}»`;
  }
  if (typeof m.name !== 'string' || m.name === '') {
    return 'у мини-приложения нет названия (name)';
  }
  if (typeof m.version !== 'string' || m.version === '') {
    return 'у мини-приложения нет версии (version)';
  }
  if (!KINDS.includes(m.kind as AppKind)) {
    return `неверный вид «${String(m.kind)}» (service или game)`;
  }
  const { icon, presentation, permissions, sections } = m;
  if (icon !== undefined && (typeof icon !== 'string' || !ICON.test(icon))) {
    return `неверное имя иконки «${String(icon)}»`;
  }
  if (
    presentation !== undefined &&
    !PRESENTATIONS.includes(presentation as AppPresentation)
  ) {
    return `неверный presentation «${String(presentation)}»`;
  }
  if (permissions !== undefined) {
    const error = permissionsError(permissions);
    if (error) return error;
  }
  if (sections !== undefined) return sectionsError(sections);
  return null;
}

/** Описание мини-приложения — то, что пакет отдаёт лаунчеру по умолчанию */
export function defineApp(app: DefineAppInput): TugenApp {
  const error = validateManifest(app.manifest);
  if (error) throw new Error(`TUGEN SDK: ${error}`);
  return { ...app, sdk: SDK_VERSION };
}
