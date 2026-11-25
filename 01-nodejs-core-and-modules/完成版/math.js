// 一個最小的模組：用 ESM 的 export 把函式交出去
export const add = (a, b) => a + b
export const subtract = (a, b) => a - b

// 也可以有「預設匯出」：一個檔案的主角
export default function greet(name) {
  return `Hello, ${name}!`
}
