# S3 · Docker 容器化：讓 todo app「在哪都跑得起來」

> 側模組（side module）· **進階可選**。主線在 [M9 Railway] 就已經把 todo app 部署上線了——那條路不需要 Docker。這章是給想再進一步、讓環境**完全可攜、可自架**的人。不學它也能完課。

---

## ① 這章你會做出什麼、搞懂什麼

**做出**：把前面的 todo app（Express + Drizzle + PostgreSQL）裝進 Docker——寫一份 `Dockerfile` 把 app 打包成 image，再用一份 `compose.yaml` 把「app + 資料庫」兩個容器一行指令一起拉起來。

**搞懂**：
- image 和 container 差在哪、跟虛擬機差在哪
- Dockerfile 的層快取：為什麼先 `COPY package.json` 再 `COPY . .`
- Compose 怎麼讓多個容器互連（app 連 db 用 service 名稱，不是 localhost）
- volume：為什麼資料庫資料要存到容器外，否則容器一刪就沒了

> 進階旁支：本章還附一套 **[安全沙盒工具](./security-sandbox/)**——用 Docker 隔離環境安全檢視陌生的 GitHub 專案。是獨立小工具，有興趣再看。

---

## ② 前置檢查

- [ ] 完成 [M2]（手上有一個 Express + Drizzle + PostgreSQL 的 todo app）。本章只是把它容器化，不重教 app 本身。
- [ ] 安裝 **Docker Desktop**（[官網下載](https://www.docker.com/products/docker-desktop/)），啟動後 `docker version` 看得到 Server 版本。
- [ ] 認得基本指令會更順：`docker ps`（看容器）、`docker images`（看映像）、`docker logs`（看日誌）。

---

## ③ 工作坊

**→ [開始工作坊](./工作坊.md)**

| 步驟 | 你會做到 | 檢查點 |
|---|---|---|
| 1 | 寫 `Dockerfile`，把 todo app 包成 image | A |
| 2 | `.dockerignore` 瘦身 build context | B |
| 3 | 寫 `compose.yaml`：app + postgres 一起跑 | C |
| 4 | `docker compose up`，跑 migration、測 API | D（完成版） |

完成版在 [`完成版/`](./完成版/)。

---

## ④ 概念卡

- [Docker image vs container](../concepts/docker-image-vs-container.md) — 範本 vs 實例、跟 VM 的差別、layer / volume / compose

---

## ⑤ 驗收 + 挑戰

> ✏️ **課堂練習**：做完工作坊後，先試 [課堂練習](./課堂練習.md)——不看工作坊的 `Dockerfile`、自己修好一份壞掉的 Dockerfile（基底太肥、層快取沒利用、缺 `.dockerignore`）。練的是「能不能自己抓出問題並修對」，跟下面的挑戰（延伸功能）分工。

### 驗收

```bash
cd 完成版
docker compose up -d --build          # 建 image、拉起 app + db 兩個容器
docker compose exec app npm run migrate   # 在 app 容器裡建表
curl localhost:3000/health            # {"status":"ok"}
curl -X POST localhost:3000/todos -H 'Content-Type: application/json' -d '{"title":"用 Docker 跑起來"}'
curl localhost:3000/todos
docker compose down                   # 收掉（資料還在 volume 裡，下次 up 還在）
```

確認：

- [ ] `docker compose up` 後，`docker compose ps` 看到 `app` 和 `db` 兩個容器都 healthy
- [ ] `curl localhost:3000/todos` 回傳剛剛新增的 todo
- [ ] `docker compose down` 再 `up`，**資料還在**（因為存在 volume）
- [ ] 改 `compose.yaml` 把 `db` 的 volume 拿掉再重來，資料就會消失——體會 volume 的作用

### 挑戰（可選）

1. **多階段 build**：用 multi-stage Dockerfile 把最終 image 再縮小（build 階段裝 devDependencies，production 階段只留必要檔案）。
2. **健康檢查**：給 `app` 也加一個 `healthcheck`（打 `/health`），讓 Compose 知道 app 何時真的 ready。
3. **安全沙盒**：照 [`security-sandbox/`](./security-sandbox/) 的說明，用 `./test-local.sh ./security-sandbox/malicious-demo` 在隔離容器裡檢查一個「惡意」範例專案，觀察它怎麼揪出 `postinstall` 等危險 script。

---

**這是課程的最後一站。** 回到 [課程總覽](../README.md) 看看完整地圖，或挑一張還沒讀的[概念卡](../concepts/)複習。
