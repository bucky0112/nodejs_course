# Session Demo

這是一個展示 Cookie 和 Session 功能的範例專案。

## 安裝與啟動

```bash
npm install
npm run dev
```

## API 端點

### Cookie 操作

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/cookie/set` | 設定 Cookie |
| GET | `/cookie/get` | 讀取 Cookie |
| GET | `/cookie/clear` | 刪除 Cookie |

### 認證功能

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/login` | 登入 |
| GET | `/me` | 檢查登入狀態 |
| POST | `/logout` | 登出 |
| GET | `/profile` | 個人資料（需登入） |
| GET | `/admin/dashboard` | 管理員頁面（需 admin） |

### 購物車

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/cart` | 查看購物車 |
| POST | `/cart/add` | 加入商品 |
| DELETE | `/cart` | 清空購物車 |

## 測試帳號

| 角色 | 帳號 | 密碼 |
|------|------|------|
| Admin | john | 1234 |
| User | jane | 5678 |

## 測試範例

使用 curl 或 Postman：

```bash
# 登入
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"1234"}' \
  -c cookies.txt

# 查看個人資料（帶上 Cookie）
curl http://localhost:3000/profile -b cookies.txt

# 加入購物車
curl -X POST http://localhost:3000/cart/add \
  -H "Content-Type: application/json" \
  -d '{"item":"MacBook Pro"}' \
  -b cookies.txt

# 查看購物車
curl http://localhost:3000/cart -b cookies.txt

# 登出
curl -X POST http://localhost:3000/logout -b cookies.txt
```
