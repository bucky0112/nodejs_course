## 安裝 Node.js 的方法

- 透過官網直接下載
- NVM 管理 Node.js 版本

## NVM 常見指令

###  安裝與版本查看

```
# 查看目前安裝的 nvm 版本
nvm --version

# 列出所有可安裝的 Node.js 版本
nvm ls-remote

# 列出本機已安裝的 Node.js 版本
nvm ls

# 查看目前使用的 Node.js 版本
nvm current
```

### 安裝 Node.js

```
# 安裝最新的 LTS 版本
nvm install --lts

# 安裝特定版本（例如：16.15.0）
nvm install 16.15.0

# 安裝最新版本
nvm install node

# 安裝特定主要版本的最新版本（例如：v16 的最新版）
nvm install 16
```

### 切換 Node.js 版本

```
# 切換到特定版本
nvm use 16.15.0

# 切換到最新的 LTS 版本
nvm use --lts

# 切換到最新版本
nvm use node

# 切換到特定主要版本的最新版本
nvm use 16
```

### 設定預設版本

```
# 設定特定版本為預設版本
nvm alias default 16.15.0

# 設定 LTS 版本為預設版本
nvm alias default lts/*
```

### 移除 Node.js 版本

```
# 移除特定版本
nvm uninstall 16.15.0

# 移除特定主要版本
nvm uninstall 16
```

### 系統路徑相關

```
# 查看當前版本的安裝路徑
nvm which current

# 查看特定版本的安裝路徑
nvm which 16.15.0
```