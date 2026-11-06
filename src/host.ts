// Что лаунчер даёт мини-приложению игры. Реализует лаунчер (tugen.launcher), поверх своих нативных
// модулей и ядра tugen.core; мини-приложение видит только этот интерфейс, а не модули лаунчера.
//
// Все пути — внутри пространства игры (своей папки), через «/». Путь, который выводит за пределы
// пространства, лаунчер отклоняет: игра не видит файлы лаунчера и других игр.

export interface DownloadFile {
  url: string;
  /** Куда положить, внутри пространства игры */
  path: string;
  /** Файл с другим SHA-1 не примется; готовый файл с тем же SHA-1 не качается заново */
  sha1?: string;
  size?: number;
}

export interface DownloadProgress {
  done: number;
  total: number;
  bytes: number;
}

export interface DownloadResult {
  downloaded: number;
  skipped: number;
}

export interface GameFiles {
  exists(path: string): boolean;
  readText(path: string): string | null;
  writeText(path: string, text: string): boolean;
  remove(path: string): boolean;
  copyFolder(from: string, to: string): Promise<boolean>;
  /** Распаковать zip, пропуская пути с префиксами из exclude */
  extract(zip: string, dest: string, exclude?: string[]): Promise<boolean>;
  /** Открыть папку в проводнике */
  openFolder(path: string): void;
  /**
   * Пачка копий: from[i] → to[i], оба внутри пространства. Параллельные массивы, а не пары: так
   * тысячи путей уходят в нативный модуль без дерева объектов. Ответ — сколько скопировано
   */
  copyFiles(from: string[], to: string[]): Promise<number>;
  /**
   * Объекты ассетов (objects[i], пути внутри пространства) разложить по paths[i] — жёсткими
   * ссылками, где можно (место на диске не тратится), иначе копией. previous — прежняя раскладка:
   * то, чего в paths больше нет, убирается
   */
  materialize(
    objects: string[],
    paths: string[],
    previous: string[],
  ): Promise<{ linked: number; copied: number }>;
  /**
   * Право на запуск файлам (macOS: java из архива приходит без него). На Windows права нет —
   * true без действия
   */
  markExecutable(paths: string[]): Promise<boolean>;
  /**
   * Абсолютный путь файла пространства на диске, с разделителем системы — для аргументов процесса
   * (classpath JVM, -Djava.library.path), которые читает не лаунчер, а сам процесс. Путь за
   * пределами пространства — исключение
   */
  absolutePath(path: string): string;
}

export interface GameDownloads {
  /** Пачка загрузки; job — имя для отмены. Ошибка — первый сбой, после того как остальное докачано */
  download(
    job: string,
    files: DownloadFile[],
    onProgress?: (progress: DownloadProgress) => void,
  ): Promise<DownloadResult>;
  cancel(job: string): void;
}

export interface LaunchOptions {
  /** Исполняемый файл: абсолютный путь или внутри пространства игры */
  exe: string;
  args: string[];
  /** Рабочая папка внутри пространства игры */
  cwd: string;
  /** Вывод процесса целыми строками */
  onLog?: (text: string) => void;
  onExit?: (code: number) => void;
}

export interface GameProcess {
  /** Запустить процесс игры; id — свой, по нему kill и running */
  launch(id: string, options: LaunchOptions): void;
  kill(id: string): boolean;
  running(): string[];
}

export interface GameSystem {
  /** Объём памяти компьютера, МБ: для выбора памяти игре */
  totalMemoryMb(): number;
  /** Язык интерфейса лаунчера: 'ru', 'en' */
  locale: string;
  /** Система: от неё зависят правила библиотек, сборка Java, разделители classpath */
  os: 'windows' | 'macos';
  /** Архитектура процессора */
  arch: 'x64' | 'arm64';
}

export interface FetchOptions {
  /** Предел ожидания ответа, мс; по умолчанию 30 000 */
  timeoutMs?: number;
  /** Повторы при сетевой ошибке (не при ответе с ошибкой); по умолчанию 2 */
  retries?: number;
  headers?: Record<string, string>;
}

export interface GameNet {
  /** GET текстом. Ошибка сети или статус не 2xx — исключение */
  fetchText(url: string, options?: FetchOptions): Promise<string>;
  /** GET и разбор JSON; ошибки — как у fetchText, плюс неверный JSON */
  fetchJson<T = unknown>(url: string, options?: FetchOptions): Promise<T>;
}

export interface GameStorage {
  /**
   * Хранилище ключ-значение игры (JSON): своё у каждой игры, переживает перезапуск лаунчера.
   * Нет ключа или значение не читается — fallback
   */
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown): void;
  remove(key: string): void;
}

export interface GameNavigation {
  /**
   * Открыть раздел (GameSection.id): лаунчер запомнит его и передаст в App пропом `section`.
   * Так мини-приложение переключает разделы из своего UI
   */
  open(section: string): void;
  /** Закрыть мини-приложение: лаунчер откроет свою главную */
  exit(): void;
}

export interface GameHost {
  navigation: GameNavigation;
  files: GameFiles;
  downloads: GameDownloads;
  process: GameProcess;
  system: GameSystem;
  /** Сеть: мини-приложению из песочницы — единственный путь к ней */
  net: GameNet;
  /** Данные игры между запусками */
  storage: GameStorage;
}
