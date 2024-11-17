# url 模組

```
const url = require('url');

// 解析 URL
const myUrl = new URL('https://example.com/path?name=test&age=25');

console.log('主機名:', myUrl.hostname);     // example.com
console.log('路徑名:', myUrl.pathname);     // /path
console.log('搜尋參數:', myUrl.searchParams.get('name')); // test
console.log('完整搜尋字串:', myUrl.search); // ?name=test&age=25

// 修改 URL 參數
myUrl.searchParams.append('sort', 'desc');
console.log('新的 URL:', myUrl.href);
```