import type { ComponentType } from 'react';
import type { SafeAreaInsets } from './insets';

/** Версия SDK: лаунчер не откроет мини-приложение, собранное под более новую major-версию */
export const SDK_VERSION = '0.4.0';

/** Текст на языках интерфейса: строка — одна на все языки; иначе по коду языка, 'ru' — обязателен */
export type LocalizedText = string | ({ ru: string } & Record<string, string>);

/** Текст на языке интерфейса: нет перевода — русский */
export const localize = (text: LocalizedText, locale: string): string =>
  typeof text === 'string' ? text : text[locale] ?? text.ru;

/**
 * Раздел мини-приложения — сервис издателя. Это список для лаунчера: он запоминает открытый раздел и
 * передаёт его пропом `section`, а `navigation.open` переключает раздел. Боковой панели у лаунчера
 * нет — навигацию по разделам (вкладки, меню) мини-приложение рисует в своём UI
 */
export interface GameSection {
  /** Постоянный идентификатор раздела. Латиница, цифры и «-» */
  id: string;
  title: LocalizedText;
  /** Имя иконки Gravity UI (https://gravity-ui.com/icons) в PascalCase, например 'Server' */
  icon: string;
}

export interface GameManifest {
  /** Постоянный идентификатор: имя пространства игры и ключ её настроек. Латиница, цифры и «-» */
  id: string;
  /** Название для игрока */
  name: string;
  version: string;
  /**
   * Имя иконки Gravity UI (https://gravity-ui.com/icons) в PascalCase, например 'Cube'. Лаунчер
   * показывает её рядом с `name` в верхней плашке, пока мини-приложение открыто; нет иконки —
   * значок лаунчера по умолчанию
   */
  icon?: string;
  /** Где лаунчер открывает мини-приложение; по умолчанию 'embedded' */
  presentation?: GamePresentation;
  /**
   * Разделы по порядку. Первый открывается, когда игрок впервые заходит в мини-приложение; дальше
   * лаунчер возвращает на последний открытый. Переключатель разделов рисует само мини-приложение.
   * Нет разделов — мини-приложение одним экраном
   */
  sections?: GameSection[];
}

/**
 * Где открывается мини-приложение:
 * - 'embedded' — в окне лаунчера на месте страницы, под его островами (верхняя плашка и навигация
 *   снизу). По умолчанию.
 * - 'window' — запланировано: отдельное окно ОС. Лаунчер, который отдельных окон пока не умеет,
 *   открывает такое мини-приложение как 'embedded' — поэтому верстать нужно под оба варианта
 *   (Safe Area в отдельном окне будет нулевой)
 */
export type GamePresentation = 'embedded' | 'window';

export interface GameAppProps {
  /** Ширина и высота области, которую лаунчер отдал мини-приложению */
  width: number;
  height: number;
  /**
   * Открытый раздел (GameSection.id); у игры без разделов — пустая строка. Сменить раздел из
   * самой игры — useHost().navigation.open
   */
  section: string;
  /** Отступы от краёв, закрытые интерфейсом лаунчера, — то же значение, что у useSafeArea() */
  safeArea: SafeAreaInsets;
}

export interface TugenGame {
  manifest: GameManifest;
  sdk: string;
  /** Корневой компонент: лаунчер рисует его в своём окне, на месте страницы игры */
  App: ComponentType<GameAppProps>;
}

const ID = /^[a-z0-9][a-z0-9-]*$/;
/** Имя иконки Gravity UI: PascalCase, как в экспортах @gravity-ui/icons */
const ICON = /^[A-Z][A-Za-z0-9]*$/;
const PRESENTATIONS: readonly GamePresentation[] = ['embedded', 'window'];

const isText = (value: unknown): boolean =>
  typeof value === 'string' ||
  (typeof value === 'object' &&
    value !== null &&
    typeof (value as { ru?: unknown }).ru === 'string');

/**
 * Проверка манифеста игры: текст ошибки или null. Общая для defineGame и пакетов .map — манифест
 * пакета приходит из JSON без типов, поэтому проверяются и сами типы полей, а не только форматы
 */
export function validateManifest(manifest: GameManifest): string | null {
  const m = manifest as unknown as Record<string, unknown>;
  if (typeof m !== 'object' || m === null) return 'манифест игры — не объект';
  if (typeof m.id !== 'string' || !ID.test(m.id)) {
    return `неверный id игры «${String(m.id)}»`;
  }
  if (typeof m.name !== 'string' || m.name === '') {
    return 'у игры нет названия (name)';
  }
  if (typeof m.version !== 'string' || m.version === '') {
    return 'у игры нет версии (version)';
  }
  const { icon, presentation, sections } = m;
  if (icon !== undefined && (typeof icon !== 'string' || !ICON.test(icon))) {
    return `неверное имя иконки «${String(icon)}»`;
  }
  if (
    presentation !== undefined &&
    !PRESENTATIONS.includes(presentation as GamePresentation)
  ) {
    return `неверный presentation «${String(presentation)}»`;
  }
  if (sections === undefined) return null;
  if (!Array.isArray(sections)) return 'sections — не массив';
  const seen = new Set<string>();
  for (const section of sections as Partial<GameSection>[]) {
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
}

/** Описание мини-приложения игры — то, что пакет игры отдаёт лаунчеру по умолчанию */
export function defineGame(game: Omit<TugenGame, 'sdk'>): TugenGame {
  const error = validateManifest(game.manifest);
  if (error) throw new Error(`TUGEN SDK: ${error}`);
  return { ...game, sdk: SDK_VERSION };
}
