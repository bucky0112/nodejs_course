const fs = require('fs');

console.log('--- 同步開始 ---');
console.time('同步總耗時');

// readFileSync 會阻塞主執行緒，直到檔案讀取完成
try {
    const data1 = fs.readFileSync('file1.txt', 'utf8');
    console.log('讀取檔案 1 完成');
    
    const data2 = fs.readFileSync('file2.txt', 'utf8');
    console.log('讀取檔案 2 完成');
} catch (err) {
    console.error('讀取失敗');
}

console.log('這句話必須等上面都讀完才會出現');
console.timeEnd('同步總耗時');
