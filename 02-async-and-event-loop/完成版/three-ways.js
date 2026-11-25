// 同一件事（讀 file1 → 再讀 file2）用三代寫法各寫一次
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'

const file1 = new URL('./file1.txt', import.meta.url)
const file2 = new URL('./file2.txt', import.meta.url)

function withCallback(done) {
  fs.readFile(file1, 'utf8', (err, a) => {
    if (err) return done(err)
    fs.readFile(file2, 'utf8', (err, b) => {
      if (err) return done(err)
      console.log('[callback]', a.trim(), b.trim())
      done(null)
    })
  })
}

function withPromise() {
  let a
  return fsPromises
    .readFile(file1, 'utf8')
    .then((content) => {
      a = content
      return fsPromises.readFile(file2, 'utf8')
    })
    .then((b) => console.log('[Promise]', a.trim(), b.trim()))
}

async function withAsyncAwait() {
  const a = await fsPromises.readFile(file1, 'utf8')
  const b = await fsPromises.readFile(file2, 'utf8')
  console.log('[async/await]', a.trim(), b.trim())
}

withCallback(async (err) => {
  if (err) return console.error('callback 出錯：', err.message)
  try {
    await withPromise()
    await withAsyncAwait()
  } catch (err) {
    console.error('出錯：', err.message)
  }
})
