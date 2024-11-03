export * from './item.repository';
export * from './todo.repository';

// 確保這個文件被編譯和包含在 dist 目錄中
export interface RepositoryIndexer {
  // 這是一個空的接口，用來確保這個文件被視為一個模塊
  _dummy?: never;
}
