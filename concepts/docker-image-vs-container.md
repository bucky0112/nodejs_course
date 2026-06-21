# 概念卡：Docker image vs container

> 一句話：**image（映像檔）是「不會動的範本」，container（容器）是「image 跑起來的那個實例」**。image 之於 container，就像 class 之於 instance、安裝光碟之於正在執行的系統。

---

## 一、為什麼要 Docker？

最經典的痛點：「**我電腦可以跑啊**」。同事跑不起來、上了伺服器又炸——因為大家的 Node 版本、系統套件、環境變數都不一樣。

Docker 把「應用程式 + 它需要的整個環境」打包成一個 image。**任何裝了 Docker 的機器跑這個 image，跑出來的環境都一模一樣**。從此「在我電腦可以」等於「在哪都可以」。

---

## 二、image 和 container 的關係

```
Dockerfile  ──build──▶  image  ──run──▶  container（可以開很多個）
（食譜）                （成品範本）       （正在跑的實例）
```

- **image**：唯讀的範本。由 `Dockerfile` 一層一層 build 出來，可以推到 registry（如 Docker Hub）分享。
- **container**：image 的執行實例。同一個 image 可以同時跑出很多個 container，彼此隔離。
- 改了程式 → 重新 `build` image → 用新 image 重新 `run` container。

> 類比：image 是 class，container 是 `new` 出來的 instance；image 是安裝光碟，container 是正在執行的那台電腦。

---

## 三、container vs 虛擬機（VM）

| | 虛擬機 (VM) | 容器 (Container) |
|---|---|---|
| 包了什麼 | 一整個作業系統 | 只有 app + 必要的函式庫 |
| 啟動 | 幾十秒～分鐘 | 幾秒 |
| 大小 | 數 GB | 數十～數百 MB |
| 隔離方式 | 模擬整台硬體 | 共用主機核心，只隔離行程 |

容器不像 VM 那樣模擬一整台電腦，而是**共用主機的作業系統核心**，只把行程、檔案系統、網路隔離開來——所以它又輕又快。

---

## 四、最常碰到的幾個東西

- **Dockerfile**：build image 的「食譜」。`FROM` 挑基底、`COPY` 搬程式、`RUN` 裝套件、`CMD` 定啟動指令。
- **layer（層）**：Dockerfile 每個指令是一層，會被快取。所以慣例先 `COPY package*.json` 再 `npm ci`、最後才 `COPY . .`——程式碼變動時不必重裝套件。
- **volume**：container 裡的檔案會隨 container 刪除而消失；要持久化的資料（如 PostgreSQL）要掛 volume 存到 container 外。
- **Docker Compose**：用一個 `compose.yaml` 同時定義多個 container（例如 app + db）並一行指令一起啟動。

> 補充：新版 Compose 的 `version:` 欄位已經**過時、該刪掉**——寫了反而會跳警告。直接從 `services:` 開始就好。

---

## 延伸
- 容器化常和「部署」一起談，但兩者可以分開：本課程主線用 [M9 Railway] 部署（它自動偵測 Node，不需要你寫 Dockerfile）。Docker 是想要「環境完全可攜、可自架」時的進階選項。
- image 越小越好：用 `node:22-slim` 而非 `node:22`，並善用 `.dockerignore` 把 `node_modules`、`.env`、`.git` 排除在 build context 外。
