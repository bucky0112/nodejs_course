import fs from 'node:fs/promises'

async function asyncDemo() {
  console.log('--- 非同步開始 ---')
  console.time('非同步總耗時')

  // 發出讀取請求後，執行緒就自由了，不會卡在這裡等
  const p1 = fs.readFile('file1.txt', 'utf8').then(() => console.log('非同步：檔案 1 完成'))
  const p2 = fs.readFile('file2.txt', 'utf8').then(() => console.log('非同步：檔案 2 完成'))

  console.log('當檔案還在讀取時，我已經執行到這行了！')

  // 兩個一起等：總時間 = 最慢那個，而不是相加
  await Promise.all([p1, p2])
  console.timeEnd('非同步總耗時')
}

asyncDemo()
