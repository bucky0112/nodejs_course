## 新增資料

```sql
INSERT INTO heroes
(name, gender, age, hero_level, hero_rank, description)
VALUES
('角色名稱', 'F', 25, 'C', 388, '描述');
```

*注意的地方*

- 文字資料需要使用引號包起來
- 數字型態（整數、小數）則不需要使用引號

## 新增資料（省略欄位）

```sql
INSERT INTO heroes
VALUES
('角色名稱', 'F', 25, 'C', 388, '描述');
```

## 新增資料（部份欄位）

```sql
INSERT INTO heroes
(name, hero_level, description)
VALUES
('角色名稱', 'C', '描述');
```