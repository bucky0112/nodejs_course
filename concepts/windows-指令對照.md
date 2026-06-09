# 概念卡：Windows 指令對照

> 一句話：本課程的指令範例以 **macOS / Linux（bash）** 為基準。Windows 使用者大多沒問題，但有**四個地方**會踩雷——這張卡集中講清楚，遇到指令跑不動先回來對一下。

> 建議 Windows 使用者用 **PowerShell**（Windows Terminal 預設）而不是舊的 `cmd`，相容性好很多。以下沒特別說明的，都以 PowerShell 為準。

---

## 一、`curl` 測 API：最容易中的坑 ⚠️

課程很多章用 `curl` 測 API，範例長這樣（單引號包 JSON）：

```bash
curl -X POST localhost:3000/todos -H 'Content-Type: application/json' -d '{"title":"買牛奶"}'
```

這行在 Windows 有**兩個問題**：

1. **PowerShell 的 `curl` 不是真的 curl** — 它是 `Invoke-WebRequest` 的別名，參數語法完全不同，照打會噴一堆看不懂的錯。
2. **Windows 不認單引號** `'...'` 包字串，JSON 會壞掉。

**正解**：在 PowerShell 裡指定 `curl.exe`（用 Windows 10+ 內建的真 curl），並把外層改雙引號、內層用 `\"` 跳脫：

```powershell
curl.exe -X POST localhost:3000/todos -H "Content-Type: application/json" -d "{\"title\":\"買牛奶\"}"
```

> 嫌跳脫引號很煩？這正是課程推薦用 **VS Code REST Client 或 Postman** 測 API 的原因——跨平台一致、不用跟引號搏鬥。能用圖形工具就別硬打 curl。

---

## 二、多行指令的接行符號不一樣

課程偶爾把長指令拆多行（部署那章有一個），bash 用行尾反斜線 `\` 接行：

```bash
curl -X POST https://你的app.up.railway.app/auth/register \
  -H 'Content-Type: application/json' -d '{"username":"alice","password":"secret123"}'
```

| 環境 | 接行符號 |
|---|---|
| bash（mac/Linux） | 行尾 `\` |
| PowerShell | 行尾反引號 `` ` `` |
| cmd | 行尾 `^` |

**最簡單的辦法：全部寫成一行，不要換行**，就不用管接行符號：

```powershell
curl.exe -X POST https://你的app/auth/register -H "Content-Type: application/json" -d "{\"username\":\"alice\",\"password\":\"secret123\"}"
```

---

## 三、複製檔案 `cp`

課程設定環境變數時會用：

```bash
cp .env.example .env
```

PowerShell 有把 `cp` 別名到 `Copy-Item`，所以這行**在 PowerShell 其實能跑**。但如果你用的是 `cmd`，要改成：

```cmd
copy .env.example .env
```

> 不確定自己在哪個 shell？提示字元是 `PS C:\...>` 就是 PowerShell；是 `C:\...>` 就是 cmd。

---

## 四、`psql` / `createdb` 找不到指令

SQL 章節會用 PostgreSQL 內建指令：

```bash
createdb todo_app
psql -d todo_app
```

指令本身**跨平台都一樣**，但 Windows 的 PostgreSQL 安裝程式**預設不會把它們加進 PATH**，所以你打了會出現「找不到指令」。三條路：

1. 安裝 PostgreSQL 時記得勾把 `bin` 加入 PATH，或事後手動把 `C:\Program Files\PostgreSQL\16\bin` 加進系統環境變數 PATH。
2. 直接用 GUI（TablePlus、DBeaver、pgAdmin）連資料庫，不碰終端機。
3. 用 Docker 起 PostgreSQL，指令進到容器裡跑。

> macOS 用 Homebrew 裝 PostgreSQL 會自動進 PATH，所以課程範例沒特別提這件事。

---

## 延伸
- 想徹底避開這些差異，可以裝 **WSL2（Windows Subsystem for Linux）**，在 Windows 裡跑一個真的 Ubuntu，所有 bash 指令原樣可用。後端開發長期來看很值得，但對入門學生不強求。
- 路徑分隔符 Windows 是反斜線 `\`、mac/Linux 是斜線 `/`，但本課程的 Node 程式都用 `path` 模組或 `import.meta.dirname` 處理，不會手寫路徑，所以這點不影響你跑課程。
