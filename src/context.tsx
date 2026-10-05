import { createContext, useContext } from 'react';
import type { GameHost } from './host';

const HostContext = createContext<GameHost | null>(null);

/** Обёртку ставит лаунчер вокруг App игры; самому мини-приложению она не нужна */
export const HostProvider = HostContext.Provider;

/** Доступ к лаунчеру из компонентов мини-приложения */
export function useHost(): GameHost {
  const host = useContext(HostContext);
  if (!host) {
    throw new Error(
      'TUGEN SDK: useHost() вызван вне лаунчера (нет HostProvider)',
    );
  }
  return host;
}
