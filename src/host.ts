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
}

export interface GameHost {
  files: GameFiles;
  downloads: GameDownloads;
  process: GameProcess;
  system: GameSystem;
}
