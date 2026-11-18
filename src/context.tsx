import { createContext, useContext } from 'react';
import type { TugenHost } from './host';

const HostContext = createContext<TugenHost | null>(null);

/** Обёртку ставит лаунчер вокруг App мини-приложения; самому мини-приложению она не нужна */
export const HostProvider = HostContext.Provider;

/** Доступ к лаунчеру из компонентов мини-приложения */
export function useHost(): TugenHost {
  const host = useContext(HostContext);
  if (!host) {
    throw new Error(
      'TUGEN SDK: useHost() вызван вне лаунчера (нет HostProvider)',
    );
  }
  return host;
}
