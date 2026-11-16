// Пространства интерфейса и жизненного цикла, общие для любого мини-приложения (сервис или игра):
// тема, вьюпорт, кнопки внизу и сверху, всплывающие окна, тактильный отклик и закрытие. По смыслу это
// то, что Telegram Mini Apps даёт через WebApp: мини-приложение описывает, что хочет показать, а
// лаунчер рисует это в своих островах и окнах. Тексты кнопок и окон — уже переведённые строки.

import type { SafeAreaInsets } from '../insets';

export type ThemeScheme = 'light' | 'dark';

export interface AppTheme {
  /** Текущая тема лаунчера: светлая или тёмная (системная — уже разрешённая) */
  scheme(): ThemeScheme;
  /** Подписка на смену темы. Возвращает функцию отписки */
  subscribe(listener: (scheme: ThemeScheme) => void): () => void;
}

export interface AppViewportSize {
  width: number;
  height: number;
}

export interface AppViewport {
  /** Текущая область мини-приложения в DIP (то же, что пропы width и height) */
  size(): AppViewportSize;
  /** Отступы, которые закрывают острова лаунчера */
  safeArea(): SafeAreaInsets;
  /** Подписка на изменение размера или отступов. Возвращает функцию отписки */
  subscribe(listener: (size: AppViewportSize, safeArea: SafeAreaInsets) => void): () => void;
}

export interface MainButtonState {
  text: string;
  visible: boolean;
  /** Выключенная кнопка видна, но не нажимается */
  enabled: boolean;
  /** Крутилка вместо текста: идёт долгое действие */
  progress: boolean;
}

export interface AppMainButton {
  /** Изменить кнопку; не переданные поля остаются как были */
  set(patch: Partial<MainButtonState>): void;
  state(): MainButtonState;
  /** Нажатие главной кнопки. Возвращает функцию отписки */
  onClick(handler: () => void): () => void;
}

export interface AppBackButton {
  show(): void;
  hide(): void;
  visible(): boolean;
  /** Нажатие «назад» в островах лаунчера. Возвращает функцию отписки */
  onClick(handler: () => void): () => void;
}

export type PopupButtonStyle = 'default' | 'destructive' | 'cancel';

export interface PopupButton {
  /** Идентификатор, который вернёт popup() при нажатии */
  id: string;
  text: string;
  style?: PopupButtonStyle;
}

export interface PopupOptions {
  title?: string;
  message: string;
  /** Кнопки по порядку; нет — одна кнопка «ОК» */
  buttons?: PopupButton[];
}

export interface AppPopups {
  /** Показать окно; ответ — id нажатой кнопки или null, если окно закрыли без выбора */
  popup(options: PopupOptions): Promise<string | null>;
  /** Окно с одной кнопкой «ОК» */
  alert(message: string): Promise<void>;
  /** Окно «Да / Нет»: true — подтвердили */
  confirm(message: string): Promise<boolean>;
}

export type HapticImpact = 'light' | 'medium' | 'heavy';
export type HapticNotice = 'success' | 'warning' | 'error';

export interface AppHaptics {
  /** Отклик на нажатие. true — лаунчер сыграл отклик; false — на этой системе его нет */
  impact(kind: HapticImpact): boolean;
  /** Отклик на результат действия */
  notice(kind: HapticNotice): boolean;
}

export interface AppUi {
  mainButton: AppMainButton;
  backButton: AppBackButton;
  popups: AppPopups;
  haptics: AppHaptics;
}

export interface AppLifecycle {
  /** Мини-приложение отрисовалось и готово: лаунчер может убрать экран загрузки */
  ready(): void;
  /** Закрыть мини-приложение и вернуться туда, откуда открыли */
  close(): void;
  /** Спрашивать ли подтверждение перед закрытием (несохранённые данные) */
  setClosingConfirmation(enabled: boolean): void;
  closingConfirmation(): boolean;
}
