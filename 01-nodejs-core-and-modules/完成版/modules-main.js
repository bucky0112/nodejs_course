// 具名匯入用大括號；預設匯出可以自己取名字
import greet, { add, subtract } from './math.js'

console.log(add(5, 3)) // 8
console.log(subtract(5, 3)) // 2
console.log(greet('Node')) // Hello, Node!

// 條件式載入：ESM 用動態 import()，不是 require
if (process.argv.includes('--extra')) {
  const { default: greetAgain } = await import('./math.js')
  console.log(greetAgain('動態載入'))
}
