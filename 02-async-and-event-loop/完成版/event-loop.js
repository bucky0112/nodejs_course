// 猜猜看：這支程式印出來的順序是什麼？先猜，再執行 node event-loop.js 對答案

console.log('1. 同步：第一行')

setTimeout(() => {
  console.log('5. timer：setTimeout 0 毫秒')
}, 0)

Promise.resolve().then(() => {
  console.log('3. microtask：Promise.then')
})

queueMicrotask(() => {
  console.log('4. microtask：queueMicrotask')
})

console.log('2. 同步：最後一行')

// 規則：
// 1) 同步程式碼一路跑完（1、2）
// 2) 接著清空 microtask 佇列（3、4，Promise 的 .then / await 之後的程式都在這裡）
// 3) 最後才輪到 timer 佇列（5），就算設定 0 毫秒也一樣
