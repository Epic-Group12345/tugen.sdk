// Данные приложения: собственная база SQLite и защищённые значения. Каждое приложение видит только
// свою базу: лаунчер открывает отдельный файл на приложение, соседние базы недоступны. Защищённые
// значения шифруются средствами системы (Windows — DPAPI, macOS — связка ключей) и тоже привязаны
// к приложению.

export type SqlValue = string | number | boolean | null;

export type SqlRow = Record<string, SqlValue>;

export interface SqlResult {
  /** Строки ответа; у запросов без строк — пусто */
  rows: SqlRow[];
  /** Сколько строк изменил последний запрос */
  rowsAffected: number;
  /** id последней вставленной строки */
  insertId: number;
}

export interface AppDatabase {
  /**
   * Выполнить запросы (несколько через «;»). Параметры — по порядку, на места «?». Ошибка SQL —
   * исключение с текстом SQLite. Синхронно: запрос быстрый и локальный
   */
  execute(sql: string, params?: SqlValue[]): SqlResult;
  /**
   * Схема по миграциям: номер применённой хранится в PRAGMA user_version. Уже выпущенные миграции
   * не меняют — только дописывают в конец. Возвращает номер версии после применения
   */
  migrate(migrations: readonly string[]): number;
}

export interface AppSecure {
  /** Значение по ключу или null, если его нет или его нельзя расшифровать на этой учётной записи */
  get(key: string): string | null;
  /** true — сохранено */
  set(key: string, value: string): boolean;
  /** true — удалено (или не было) */
  remove(key: string): boolean;
}
