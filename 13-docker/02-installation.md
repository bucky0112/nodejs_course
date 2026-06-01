# 安裝 Docker Desktop

## Docker Desktop 是什麼？

Docker Desktop 是 Docker 官方提供的桌面應用程式，包含：

- **Docker Engine** - 執行容器的核心
- **Docker CLI** - 命令列工具
- **Docker Compose** - 多容器管理工具
- **圖形化介面** - 方便管理容器和映像檔

## 系統需求

### macOS
- macOS 12 或更新版本
- Apple Silicon (M1/M2/M3) 或 Intel 處理器
- 至少 4GB RAM

### Windows
- Windows 10/11 64 位元
- 啟用 WSL 2 (Windows Subsystem for Linux)
- 至少 4GB RAM

## 安裝步驟

### macOS

1. **下載 Docker Desktop**

   前往 [Docker 官網](https://www.docker.com/products/docker-desktop/)

   根據你的 Mac 選擇：
   - Apple Silicon (M1/M2/M3) → 選擇 "Mac with Apple Silicon"
   - Intel → 選擇 "Mac with Intel chip"

2. **安裝**

   - 開啟下載的 `.dmg` 檔案
   - 將 Docker 圖示拖曳到 Applications 資料夾
   - 從 Applications 開啟 Docker

3. **首次啟動**

   - 系統會要求授權，輸入密碼
   - 等待 Docker Engine 啟動（狀態列會出現 🐳 鯨魚圖示）

### Windows

1. **啟用 WSL 2**

   以系統管理員身份開啟 PowerShell：
   ```powershell
   wsl --install
   ```

   重新啟動電腦。

2. **下載並安裝 Docker Desktop**

   - 前往 [Docker 官網](https://www.docker.com/products/docker-desktop/)
   - 下載 Windows 版本
   - 執行安裝程式，勾選「Use WSL 2 instead of Hyper-V」
   - 完成安裝後重新啟動

3. **首次啟動**

   - 開啟 Docker Desktop
   - 等待初始化完成

## 驗證安裝

開啟終端機（Terminal 或 PowerShell），執行以下指令：

```bash
# 查看 Docker 版本
docker --version
```

應該會看到類似：
```
Docker version 27.x.x, build xxxxxx
```

再執行：

```bash
# 執行測試容器
docker run hello-world
```

如果看到以下訊息，代表安裝成功！

```
Hello from Docker!
This message shows that your installation appears to be working correctly.
...
```

## Docker Desktop 介面導覽

啟動 Docker Desktop 後，你會看到：

```
┌─────────────────────────────────────────────────────┐
│  Docker Desktop                              _ □ X  │
├───────────┬─────────────────────────────────────────┤
│           │                                         │
│ Containers│  目前執行中的容器列表                      │
│           │                                         │
│ Images    │  已下載的映像檔列表                        │
│           │                                         │
│ Volumes   │  資料卷（容器資料儲存）                     │
│           │                                         │
│ Dev Envs  │  開發環境（進階功能）                      │
│           │                                         │
├───────────┴─────────────────────────────────────────┤
│  🔍 Search    🐳 Running                   ⚙️ Settings│
└─────────────────────────────────────────────────────┘
```

### 主要區塊

| 區塊 | 功能 |
|------|------|
| **Containers** | 查看、啟動、停止容器 |
| **Images** | 管理本地映像檔 |
| **Volumes** | 管理資料卷 |
| **Settings** | Docker 設定（資源限制等）|

## 資源設定（建議）

點擊右上角的 ⚙️ Settings，調整資源限制：

### 建議設定

| 項目 | 建議值 | 說明 |
|------|--------|------|
| CPUs | 2-4 核心 | 給 Docker 使用的 CPU 數量 |
| Memory | 4-8 GB | 記憶體限制 |
| Disk image size | 32 GB+ | 儲存映像檔的空間 |

> 💡 **提示**：如果電腦效能足夠，可以給更多資源讓容器跑得更順。

## 常見問題

### macOS：「Docker Desktop requires...」

確認 macOS 版本是否符合需求，並確保已下載正確的版本（Apple Silicon vs Intel）。

### Windows：WSL 2 相關錯誤

1. 確認 WSL 2 已安裝：
   ```powershell
   wsl --status
   ```

2. 更新 WSL：
   ```powershell
   wsl --update
   ```

3. 設定 WSL 2 為預設：
   ```powershell
   wsl --set-default-version 2
   ```

### Docker 啟動很慢

- 增加分配給 Docker 的 CPU 和記憶體
- 確認沒有其他虛擬化軟體衝突（如 VirtualBox）

## 小結

現在你已經成功安裝 Docker Desktop！

- ✅ Docker Engine 運作中
- ✅ Docker CLI 可以使用
- ✅ Docker Compose 已包含

下一章，我們會學習 Docker 的基礎指令。
