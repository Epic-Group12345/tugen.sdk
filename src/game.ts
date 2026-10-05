import type { ComponentType } from 'react';

/** Версия SDK: лаунчер не откроет мини-приложение, собранное под более новую major-версию */
export const SDK_VERSION = '0.1.0';

export interface GameManifest {
  /** Постоянный идентификатор: имя пространства игры и ключ её настроек. Латиница, цифры и «-» */
  id: string;
  /** Название для игрока */
  name: string;
  version: string;
}

export interface GameAppProps {
  /** Ширина и высота области, которую лаунчер отдал мини-приложению */
  width: number;
  height: number;
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
  return { ...game, sdk: SDK_VERSION };
}
