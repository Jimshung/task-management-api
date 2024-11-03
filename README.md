# Todo App

基於 LoopBack 4 和 MySQL 的 Todo 應用。

## 功能特點

- Todo 和 Item 的 CRUD 操作
- 支援分頁和篩選
- RESTful API
- OpenAPI 文檔
- MySQL 資料庫

## 環境要求

- Node.js (18 || 20 || 22)
- Docker
- MySQL 8

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動 MySQL 容器

```bash
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=wewe9073 \
  -e MYSQL_DATABASE=todo_db \
  -p 3306:3306 \
  -v $(pwd)/my.cnf:/etc/mysql/conf.d/my.cnf \
  mysql:8.0
```

### 3. 設置環境變數

```bash
cp .env.example .env
```

### 4. 初始化資料庫

```bash
npm run db:init
npm run db:migrate
```

### 5. 啟動應用

```bash
npm start
```

## 資料庫設定

在 `my.cnf` 中配置 MySQL:

```ini
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
default-time-zone='+08:00'
```

## 開發工具

### 程式碼檢查

```bash
# 執行 ESLint
npm run lint

# 自動修復 ESLint 問題
npm run lint:fix

# 格式化程式碼
npm run prettier:fix
```

### 測試

```bash
# 運行所有測試
npm test

# 開啟 SQL 調試日誌運行測試
DEBUG_SQL=true npm test

# 關閉 SQL 調試日誌（預設）
npm test
```

### 資料庫操作

```bash
# 檢查資料庫連接和結構
npm run db:check

# 重建資料庫結構
npm run db:migrate:rebuild
```

```

```
