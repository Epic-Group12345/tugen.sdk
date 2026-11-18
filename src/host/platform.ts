// Доступ к устройству и вебу: буфер обмена, внешние ссылки, камера и микрофон. Всё, что требует
// разрешения системы, идёт через право в манифесте (APP_PERMISSIONS в app.ts) и подтверждение
// пользователя. Записи камеры и микрофона попадают в пространство мини-приложения, а не в систему.

/** Файл, записанный в пространство мини-приложения (путь внутри него, через «/») */
export interface AppMediaFile {
  path: string;
  /** MIME-тип, например 'image/jpeg' или 'audio/wav' */
  mime: string;
  durationMs?: number;
}

export interface AppClipboard {
  readText(): Promise<string>;
  /** true — записано */
  writeText(text: string): Promise<boolean>;
}

export interface AppLinks {
  /**
   * Открыть ссылку в браузере по умолчанию. Разрешены только http и https; другие схемы лаунчер
   * отклоняет. Ответ — открыто ли
   */
  open(url: string): Promise<boolean>;
}

export interface AppCamera {
  /** Спросить разрешение у пользователя (один раз, дальше — ответ системы) */
  requestAccess(): Promise<boolean>;
  /** Снимок с веб-камеры в файл пространства; null — отказ или камеры нет */
  snapshot(options?: { maxWidth?: number }): Promise<AppMediaFile | null>;
}

export interface AppRecording {
  /** Остановить запись и получить файл; null — ничего не записано */
  stop(): Promise<AppMediaFile | null>;
  /** Остановить и выбросить запись */
  cancel(): void;
}

export interface AppMicrophone {
  requestAccess(): Promise<boolean>;
  /** Начать запись в файл пространства; maxMs — предел длительности, по умолчанию без предела */
  record(options?: {
    path: string;
    maxMs?: number;
  }): Promise<AppRecording | null>;
}
