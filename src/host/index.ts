// Хост мини-приложения: то, что лаунчер даёт через useHost(). Пространства одинаковы для сервисов и
// игр; у пространств, где нужно право из манифеста, без права вызов бросает ошибку с именем права.
// Список прав — APP_PERMISSIONS в app.ts.

import type { AppDatabase, AppSecure } from './data';
import type {
  AppDownloads,
  AppFiles,
  AppNavigation,
  AppNet,
  AppProcess,
  AppRegistry,
  AppStorage,
  AppSystem,
} from './capabilities';
import type { AppLifecycle, AppTheme, AppUi, AppViewport } from './core';
import type {
  AppCamera,
  AppClipboard,
  AppLinks,
  AppMicrophone,
} from './platform';

export type * from './capabilities';
export type * from './core';
export type * from './platform';
export type * from './data';

export interface TugenHost {
  /** Готовность, закрытие, подтверждение закрытия; всегда */
  lifecycle: AppLifecycle;
  /** Разделы своего мини-приложения и закрытие экрана; всегда */
  navigation: AppNavigation;
  /** Другие мини-приложения: список сервисов и игр, открытие; всегда */
  apps: AppRegistry;
  /** Тема лаунчера; всегда */
  theme: AppTheme;
  /** Размер области и отступы под островами; всегда */
  viewport: AppViewport;
  /** Главная и «назад», окна, отклик; всегда */
  ui: AppUi;
  /** Память, язык, система и архитектура; всегда */
  system: AppSystem;
  /** Ключ-значение мини-приложения между запусками; всегда */
  storage: AppStorage;
  /** Собственная база SQLite приложения; всегда (изолирована от других приложений) */
  db: AppDatabase;
  /** Защищённые значения приложения (шифруются системой); всегда */
  secure: AppSecure;
  /** Внешние ссылки в браузере (только http и https); всегда */
  links: AppLinks;
  /** Файлы — только в пространстве мини-приложения; право «files» */
  files: AppFiles;
  /** Пачки загрузок с проверкой SHA-1; право «downloads» */
  downloads: AppDownloads;
  /** Запуск и контроль процессов, например игры; право «process» */
  process: AppProcess;
  /** Сеть: GET текстом и JSON; право «net» */
  net: AppNet;
  /** Буфер обмена; право «clipboard» */
  clipboard: AppClipboard;
  /** Веб-камера: доступ и снимок; право «camera» */
  camera: AppCamera;
  /** Микрофон: доступ и запись; право «microphone» */
  microphone: AppMicrophone;
}
