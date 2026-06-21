# 概念卡：JWT 是什麼（簽名 ≠ 加密）

> 一句話：JWT 是一段「**被簽名、但沒被加密**」的字串。簽名保證「沒被竄改、來源可信」，但內容是**明文、人人可讀**。

這是整門課最容易被教錯、也最危險的觀念，請務必讀完。

---

## 一、結構：三段、用 `.` 隔開

```
eyJhbGciOiJIUzI1NiJ9 . eyJzdWIiOiIxIn0 . viYp9TC3aJFECWch...
└─── Header ───┘       └── Payload ──┘     └─ Signature ─┘
```

- **Header**：用什麼演算法（如 `HS256`）
- **Payload**：要帶的資料（如 `{ "sub": "1" }` 代表 user 1）
- **Signature**：用密鑰對前兩段算出的簽章

---

## 二、最關鍵的事實：Payload 是明文

Header 和 Payload 只是 **Base64URL 編碼**，**不是加密**。任何人拿到 token，都能解開讀內容：

```bash
echo "eyJzdWIiOiIxIn0" | base64 -d
# → {"sub":"1"}
```

（你在 M6 工作坊就會親眼看到這個。把 token 貼到 [jwt.io](https://jwt.io) 也會直接顯示內容。）

> ⚠️ 因此：**絕對不要把密碼、信用卡號等機密放進 Payload**。它不是保險箱，是貼了封條的明信片——別人改不了（封條會破），但看得到。

---

## 三、簽名保證什麼、不保證什麼

| | 保證 | 不保證 |
|---|---|---|
| 簽名（Signature） | **完整性**（沒被竄改）、**來源可信**（是持有密鑰的人簽的） | **機密性**（內容仍是明文可讀） |

把前面那段話用一句記住：**JWT 是「防偽」，不是「保密」。**

> ⚠️ 常見錯誤教法：「JWT 用來安全地傳遞資料 / 加密資料」——這是把「簽名」誤當「加密」。簽名只防竄改，不防偷看。

---

## 四、兩個致命陷阱（務必避開）

### 1. 永遠 `verify`，不要只 `decode`

```js
jwt.decode(token)   // ✗ 只解碼、不檢查簽名——偽造的 token 也照解，等於沒驗
jwt.verify(token, SECRET, { algorithms: ['HS256'] })  // ✓ 驗章，確認沒被偽造
```

用 `decode` 出來的 `userId` 去做授權判斷，等於讓任何人自稱任何人。

### 2. 固定指定 `algorithms`

驗章時一定要寫 `algorithms: ['HS256']`。否則可能被「**演算法混淆**」或「**`alg: none`**」攻擊——攻擊者把 Header 的演算法換成 `none` 或換成另一種，繞過簽章檢查。

---

## 五、本課程怎麼用

```js
// 簽發（登入時）
const token = jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET, {
  algorithm: 'HS256',
  expiresIn: '7d',
})

// 驗證（每個受保護的請求）
const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
req.userId = Number(payload.sub)
```

---

## 延伸
- JWT vs Session 各自的取捨 → [概念卡：Session vs JWT](./session-vs-jwt.md)
- token 該存在瀏覽器哪裡（又是一組安全取捨）→ [概念卡：Token 該存哪裡](./token-存哪裡.md)
