## 建立資料庫

```sql
CREATE DATABASE test_1;
```

## 刪除資料庫

```sql
DROP DATABASE test_1;
```
## 建立表格範例

![](https://i.imgur.com/5IG048r.png)

## 文字類型差異

'ABC'

- CHAR: CHAR(10) -> "ABC       "
- VARCHAR: VARCHAR(10) -> "ABC"
- TEXT -> "ABC"

- CHAR: 255 (max)
- VARCHAR: 上限依資料庫而異（本課程用 PostgreSQL，VARCHAR(n) 的 n 最大可達約 10 億字元；MySQL 則為單列約 6 萬多）
- TEXT: 不限長度

```sql
CREATE TABLE heroes (
    id SERIAL PRIMARY KEY,                -- Auto Increment, 流水編號
    name VARCHAR(100) NOT NULL,          -- 姓名
    gender CHAR(1),                      -- 性別
    age INT,                             -- 年齡
    hero_level CHAR(1) NOT NULL,         -- 級別，分 S、A、B、C
    hero_rank INT,                       -- 排行
    description TEXT                     -- 說明
);
```

## SERIAL 跟 INT 不同的地方？

## 請練習建立一個反派角色的表格：

![](https://i.imgur.com/gcP1Zur.png)

## 追加欄位

```sql
ALTER TABLE heroes
ADD COLUMN super_power VARCHAR(100);
```

## 刪除欄位

```sql
ALTER TABLE heroes
DROP COLUMN super_power;
```

## 刪除資料表

```sql
DROP TABLE heroes;
```

## 加上外鍵約束

```sql
ALTER TABLE monsters
ADD CONSTRAINT fk_kill_by
FOREIGN KEY (kill_by)
REFERENCES heroes(id);
```

### 說明：

- fk_kill_by 是自定義的 constraint（約束）名稱（可隨意命名，只要不重複）。

- FOREIGN KEY (kill_by) 指定欄位。

- REFERENCES heroes(id) 是對應的主表與主鍵欄位。

### 注意事項：

- monsters.kill_by 欄位中現有資料，必須全部為 NULL 或是對應到 heroes.id 中存在的值，否則會報錯。

- 若你預期將來可能會刪除 heroes 資料，建議加上：

```sql
ALTER TABLE monsters
ADD CONSTRAINT fk_kill_by
FOREIGN KEY (kill_by)
REFERENCES heroes(id)
ON DELETE SET NULL; -- 加上這行
```

## 常見的 Constraint 種類：

| Constraint 類型 | 功能                     |
| ------------- | ---------------------- |
| `PRIMARY KEY` | 唯一且非 NULL 的欄位，一個表只能有一個 |
| `FOREIGN KEY` | 外鍵，指向另一個表的主鍵           |
| `UNIQUE`      | 資料必須唯一                 |
| `NOT NULL`    | 不允許 NULL 值             |
| `CHECK`       | 資料必須符合某個條件（如 age > 0）  |
| `DEFAULT`     | 若未提供值時，使用預設值           |
