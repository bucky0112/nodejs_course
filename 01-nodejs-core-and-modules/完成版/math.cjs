// CommonJS 寫法：副檔名 .cjs 會強制用 CommonJS，不受 "type": "module" 影響
const add = (a, b) => a + b

module.exports = { add }
