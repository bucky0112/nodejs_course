# 概念卡：SQL 交易（Transaction）

> 一句話：交易讓「多個操作」變成一個**不可分割的整體**——要嘛全部成功，要嘛全部當作沒發生。

---

## 一、為什麼需要

經典例子是轉帳：A 扣 100、B 加 100，是兩個 UPDATE。如果第一個成功、第二個失敗，錢就憑空消失了。

在我們的 todo app 也一樣：刪掉一個 todo 時，要同時刪掉它在 `todo_tags` 的關聯。如果只刪了一半，資料就壞了（雖然我們用 `ON DELETE CASCADE` 自動處理，但很多情況得自己保證一致性）。

---

## 二、怎麼寫

```sql
BEGIN;                                   -- 開始交易
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;                                   -- 兩個都成功 → 一起生效
```

如果中途發現不對，用 `ROLLBACK` 把一切回復到 `BEGIN` 之前：

```sql
BEGIN;
DELETE FROM todos WHERE list_id = 2;
-- 糟糕，刪錯清單了
ROLLBACK;                                 -- 當作什麼都沒發生
```

---

## 三、破壞性操作的安全習慣

`UPDATE` 和 `DELETE` 最危險的錯誤是**忘了寫 `WHERE`**——會動到整張表：

```sql
DELETE FROM todos;          -- ✗ 清空整張表！
DELETE FROM todos WHERE id = 3;   -- ✓ 只刪這一筆
```

養成三個習慣：
1. 寫 `DELETE`/`UPDATE` 前，**先用相同的 `WHERE` 跑一次 `SELECT`** 確認影響範圍。
2. 不確定的破壞性操作，**包在 `BEGIN ... ROLLBACK/COMMIT` 裡**，確認結果再決定 commit。
3. 永遠先想「這個 `WHERE` 會命中幾列？」

---

## 延伸
- 交易有所謂 ACID 特性（原子性、一致性、隔離性、持久性），初學階段先掌握「原子性：全有或全無」就夠了。
- 用 Prisma 時，可以用 `prisma.$transaction(async (tx) => { ... })` 把多個操作包成一個交易，背後就是這張卡的 `BEGIN/COMMIT`。[第 12 堂](../12-prisma-relations-integration/)的挑戰題會用到。
