import type { ComponentType } from 'react';

/** Версия SDK: лаунчер не откроет мини-приложение, собранное под более новую major-версию */
export const SDK_VERSION = '0.2.0';

/** Текст на языках интерфейса: строка — одна на все языки; иначе по коду языка, 'ru' — обязателен */
export type LocalizedText = string | ({ ru: string } & Record<string, string>);

/** Текст на языке интерфейса: нет перевода — русский */
export const localize = (text: LocalizedText, locale: string): string =>
  typeof text === 'string' ? text : text[locale] ?? text.ru;

/**
 * Раздел игры — сервис издателя. Разделы стоят в боковой панели лаунчера, пока игрок в игре:
 * основные кнопки лаунчера уезжают, вместо них — «Назад» и разделы игры. Встроенные сервисы
 * лаунчера (например, «Друзья») остаются под ними
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
   * Разделы в боковой панели, по порядку. Первый открывается, когда игрок впервые заходит в игру;
   * дальше лаунчер возвращает на последний открытый. Нет разделов — игра одним экраном
   */
  sections?: GameSection[];
}

export interface GameAppProps {
  /** Ширина и высота области, которую лаунчер отдал мини-приложению */
  width: number;
  height: number;
  /**
   * Открытый раздел (GameSection.id); у игры без разделов — пустая строка. Сменить раздел из
   * самой игры — useHost().navigation.open
   */
  section: string;
}

export interface TugenGame {
  manifest: GameManifest;
  sdk: string;
  /** Корневой компонент: лаунчер рисует его в своём окне, на месте страницы игры */
  App: ComponentType<GameAppProps>;
}

const ID = /^[a-z0-9][a-z0-9-]*$/;

/** Описание мини-приложения игры — то, что пакет игры отдаёт лаунчеру по умолчанию */
export function defineGame(game: Omit<TugenGame, 'sdk'>): TugenGame {
  if (!ID.test(game.manifest.id)) {
    throw new Error(`TUGEN SDK: неверный id игры «${game.manifest.id}»`);
  }
  const seen = new Set<string>();
  for (const section of game.manifest.sections ?? []) {
    if (!ID.test(section.id) || seen.has(section.id)) {
      throw new Error(
        `TUGEN SDK: неверный или повторный id раздела «${section.id}»`,
      );
    }
    seen.add(section.id);
  }
  return { ...game, sdk: SDK_VERSION };
}
