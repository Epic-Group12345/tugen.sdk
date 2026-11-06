import { createContext, useContext } from 'react';
import { View, type ViewProps } from 'react-native';
import {
  ZERO_INSETS,
  paddingFor,
  type SafeAreaEdge,
  type SafeAreaInsets,
} from './insets';

export { ZERO_INSETS };
export type { SafeAreaEdge, SafeAreaInsets };

const SafeAreaContext = createContext<SafeAreaInsets>(ZERO_INSETS);

/** Отступы ставит лаунчер вокруг App; мини-приложению провайдер не нужен */
export const SafeAreaProvider = SafeAreaContext.Provider;

/**
 * Отступы, закрытые интерфейсом лаунчера. Вне провайдера — нули, а не ошибка: мини-приложение
 * должно рисоваться и в превью, и в отдельном окне, где ничего не закрыто
 */
export function useSafeArea(): SafeAreaInsets {
  return useContext(SafeAreaContext);
}

export type SafeAreaViewProps = ViewProps & {
  /** Края, на которых нужен отступ; по умолчанию все четыре */
  edges?: Array<SafeAreaEdge>;
};

/** View с padding по Safe Area на выбранных краях; padding из style на этих краях перекрывается */
export function SafeAreaView({ edges, style, ...props }: SafeAreaViewProps) {
  const insets = useSafeArea();
  return <View {...props} style={[style, paddingFor(insets, edges)]} />;
}
