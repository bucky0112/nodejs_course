const http = require('http')
const fs = require('fs')

const server = http.createServer((req, res) => {
  const url = req.url
  const method = req.method

  if (url === '/') {
    res.setHeader('Content-Type', 'text/html')
    res.write('<html>')
    res.write('<head><meta charset="utf-8"><title>My page</title></head>')
    res.write('<body>')
    res.write('<form method="POST" action="/create-user">')
    res.write(
      '<input type="text" name="username"><button type="submit">送出</button>'
    )
    res.write('</form >')
    res.write('</body>')
    res.write('</html>')
    return res.end()
  }

  if (url === '/create-user' && method === 'POST') {
    fs.writeFileSync('user.txt', 'test')
    res.statusCode = 302
    res.setHeader('Location', '/')
    return res.end()
  }

  res.setHeader('Content-Type', 'text/html')
  res.write('<html>')
  res.write('<head><title>My page</title></head>')
  res.write('<body>')
  res.write('<h1>Hello World</h1>')
  res.write('</body>')
  res.write('</html>')
})

server.listen(3100)
