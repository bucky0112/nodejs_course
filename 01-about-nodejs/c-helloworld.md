## REPL (Read-Eval-Print Loop)

REPL 的四個階段：

- Read：讀取使用者的輸入
- Eval：執行/輸入的程式碼
- Print：顯示執行結果
- Loop：重複以上步驟

```
// 直接運算
> 2 + 2
4

// 宣告變數
> let name = "John"
undefined
> name
'John'

// 多行輸入（使用 .editor 模式）
> .editor
// 進入編輯模式
function add(a, b) {
  return a + b;
}
// Ctrl+D 完成編輯
```
