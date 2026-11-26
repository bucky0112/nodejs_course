// 假裝這是一個「很重」的模組（例如要載入圖表、PDF 套件）
import { add, subtract } from './math.js'

// 這行寫在最上層：只要檔案被載入就會印出來，方便觀察「何時載入」
console.log('[report.js] 模組載入了')

export function printReport(a, b) {
  console.log(`報表：${a} + ${b} = ${add(a, b)}，${a} - ${b} = ${subtract(a, b)}`)
}
