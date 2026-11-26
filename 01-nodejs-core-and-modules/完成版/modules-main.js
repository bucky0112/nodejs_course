// 具名匯入用大括號；預設匯出可以自己取名字
import greet, { add, subtract } from './math.js'

console.log(add(5, 3)) // 8
console.log(subtract(5, 3)) // 2
console.log(greet('Node')) // Hello, Node!

// 條件式載入：用得到才載入，ESM 用動態 import()
// report.js 沒有在上面靜態 import，沒加 --report 就完全不會載入它
if (process.argv.includes('--report')) {
  const { printReport } = await import('./report.js')
  printReport(5, 3)
}
