# 概念卡：HTTP 無狀態與 Session 機制

> 一句話：HTTP 每個請求彼此獨立、伺服器預設「不記得你」；Session 就是用一個存在 cookie 裡的 **id**，讓伺服器把多個請求認回同一個人。

---

## 一、HTTP 是無狀態的

你登入後，下一個請求，伺服器其實**不知道你是誰**——HTTP 協定本身不保留前後請求的關係。每個請求都像第一次見面。

那「登入狀態」是怎麼維持的？靠 cookie + session 這套機制補上來。

---

## 二、Session 怎麼運作

```
1. 你登入成功
2. 伺服器在自己這邊建立一筆 session，存「這個 session 屬於 user 1」
   並產生一個隨機的 session id（sid）
3. 伺服器把 sid 放進 Set-Cookie 回給瀏覽器
4. 之後你每個請求，瀏覽器自動帶上這個 sid（在 cookie 裡）
5. 伺服器拿 sid 查出「喔，這是 user 1」→ 認得你了
```

關鍵：**真正的資料（你是誰）存在伺服器**，cookie 裡只有一把「鑰匙」（sid）。

> 在本課程的 Express 程式裡，登入時我們寫 `req.session.userId = user.id`，express-session 就幫我們做完上面整套。

---

## 三、澄清一個常見混淆：Session vs Cookie

很多教材把它們當「二選一」比較，這是錯的。它們是**合作關係**：

- **Cookie** 是「載體」——瀏覽器用來存放並自動帶上小段資料的機制。
- **Session** 是「伺服器端的狀態」——用 cookie 裡的 sid 來認人。

Session **依賴** cookie 來傳 sid。沒有「要 cookie 還是要 session」這種選擇。

---

## 四、Session 存在哪、活多久

- **存哪**：本課程開發用預設的記憶體 store（重啟就清空、無法多機共用）。正式環境要用持久化 store（例如 `connect-pg-simple` 存進 PostgreSQL、或 Redis）。
- **活多久**：由伺服器端的 store TTL 與 cookie 的 `maxAge` 共同決定——可以設很短也可以設很長，不是「關瀏覽器就一定消失」。

---

## 延伸
- Session 是「有狀態」的做法（伺服器要存）。[M6] 的 JWT 是「無狀態」的另一條路（伺服器不存，資訊放 token 裡），各有取捨 → [概念卡：Session vs JWT](./session-vs-jwt.md)。
- sid 一旦被偷（session hijacking），攻擊者就能冒用你——這也是為什麼 cookie 要設 `HttpOnly`/`Secure` → [概念卡：Cookie 的安全屬性](./cookie-安全屬性.md)。
