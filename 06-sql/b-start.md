## 建立資料庫

```sql
CREATE SCHEMA `test-schema` ;
```

```sql
create database test_1;
```

## 使用資料庫

```sql
USE test_1;
```

## 刪除資料庫

```sql
DROP DATABASE test_1;
```
## 建立表格範例

![](https://i.imgur.com/5IG048r.png)

```sql
CREATE TABLE heroes (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  gender CHAR(1),
  age INT,
  hero_level CHAR(1) NOT NULL,
  hero_rank INT,
  description TEXT,
  PRIMARY KEY (id)
)
```

請練習建立一個反派角色的表格：

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

