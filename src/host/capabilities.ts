// Базовые пространства хоста: навигация, приложения, файлы, загрузки, процессы, система, сеть и
// хранилище. Реализует лаунчер (tugen.launcher). Мини-приложение видит только этот интерфейс, а не
// модули лаунчера. Все пути файлов — внутри пространства мини-приложения, через «/».

export interface AppNavigation {
  /**
   * Открыть раздел своего мини-приложения (AppSection.id): лаунчер запомнит его и передаст пропом
   * `section`
   */
  open(section: string): void;
  /** Закрыть мини-приложение: лаунчер вернётся к вкладке, с которой его открыли (или на главную) */
  exit(): void;
}

/** Сведения о мини-приложении, которые видно другим: список сервисов и игр */
export interface AppInfo {
  id: string;
  name: string;
  kind: 'service' | 'game';
  icon?: string;
  /** true — встроено в лаунчер, false — пакет .map */
  builtin: boolean;
}

export interface AppOpenOptions {
  /** Раздел открываемого приложения; без него — последний открытый или первый */
  section?: string;
  /** Параметры открытия, попадут в проп `params` (например, id друга для чата) */
  params?: Record<string, string>;
}

export interface AppRegistry {
  /** Установленные и встроенные приложения; kind — только сервисы или только игры */
  list(kind?: AppInfo['kind']): AppInfo[];
  /** Открыть другое мини-приложение: сервис или игру. Текущее мини-приложение не закрывается */
  open(id: string, options?: AppOpenOptions): void;
}

export interface AppFiles {
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
   * ссылками, где можно, иначе копией. previous — прежняя раскладка: то, чего в paths больше нет,
   * убирается
   */
  materialize(
    objects: string[],
    paths: string[],
    previous: string[],
  ): Promise<{ linked: number; copied: number }>;
  /** Право на запуск файлам (macOS). На Windows права нет — true без действия */
  markExecutable(paths: string[]): Promise<boolean>;
  /**
   * Абсолютный путь файла пространства на диске, с разделителем системы — для аргументов процесса
   * (classpath JVM), которые читает не лаунчер, а сам процесс
   */
  absolutePath(path: string): string;
}

export interface DownloadFile {
  url: string;
  /** Куда положить, внутри пространства */
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

export interface AppDownloads {
  /** Пачка загрузки; job — имя для отмены. Ошибка — первый сбой, после того как остальное докачано */
  download(
    job: string,
    files: DownloadFile[],
    onProgress?: (progress: DownloadProgress) => void,
  ): Promise<DownloadResult>;
  cancel(job: string): void;
}

export interface LaunchOptions {
  /** Исполняемый файл: абсолютный путь или внутри пространства */
  exe: string;
  args: string[];
  /** Рабочая папка внутри пространства */
  cwd: string;
  /** Вывод процесса целыми строками */
  onLog?: (text: string) => void;
  onExit?: (code: number) => void;
}

export interface AppProcess {
  /** Запустить процесс; id — свой, по нему kill и running. Ошибка запуска — исключение */
  launch(id: string, options: LaunchOptions): void;
  kill(id: string): boolean;
  /** Идентификаторы запущенных процессов */
  running(): string[];
}

export interface AppSystem {
  /** Объём памяти компьютера, МБ */
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

export interface AppNet {
  /** Запрос с методом, заголовками и телом. Ответ с ошибкой (не 2xx) не бросает: статус — в ответе */
  request(url: string, options?: RequestOptions): Promise<HttpResponse>;
  /** GET текстом. Ошибка сети или статус не 2xx — исключение */
  fetchText(url: string, options?: FetchOptions): Promise<string>;
  /** GET и разбор JSON; ошибки — как у fetchText, плюс неверный JSON */
  fetchJson<T = unknown>(url: string, options?: FetchOptions): Promise<T>;
}

export interface AppStorage {
  /**
   * Хранилище ключ-значение мини-приложения (JSON): своё у каждого, переживает перезапуск.
   * Нет ключа или значение не читается — fallback
   */
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown): void;
  remove(key: string): void;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions extends FetchOptions {
  method?: HttpMethod;
  /** Тело запроса как текст (JSON — сами сериализуйте) */
  body?: string;
}

export interface HttpResponse {
  status: number;
  /** Статус 200–299 */
  ok: boolean;
  headers: Record<string, string>;
  text: string;
}
