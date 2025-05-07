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
- VARCHAR: 6萬多
- TEXT

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

