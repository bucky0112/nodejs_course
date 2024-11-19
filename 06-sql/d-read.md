## 查詢

### 查詢全部英雄資料

```sql
SELECT *
FROM heroes;
```

## 過濾資料

### 查詢所有 S 級英雄資料

```sql
SELECT *
FROM heroes
WHERE hero_level = 'S';
```

## 練習題

- 列出所有 A 級的英雄
- 列出所有女性英雄的姓名以及年齡
- 列出所有災害等級是 S 級的怪獸