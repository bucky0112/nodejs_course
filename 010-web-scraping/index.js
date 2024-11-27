const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs').promises
const path = require('path')

const app = express()

// 取得總頁數
const getTotalPages = async (url) => {
  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)

    const pagerText = $('ul.pager li.current').text().trim()
    const totalPages = pagerText.split(' of ')[1]
    return totalPages
  } catch (err) {
    console.error(`err: ${err.message}`)
  }
}

// 處理單一頁面的撈取
const scrapePage = async (url) => {
  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)
    const books = []

    $('article.product_pod').each((index, el) => {
      const book = {
        id: index + 1,
        name: $(el).find('h3 a').attr('title'),
        price: $(el).find('div.product_price .price_color').text()
      }

      books.push(book)
      console.log(`處理中，現在是第 ${index + 1} 本書，書名：${book.name}`)
    })

    return books
  } catch (err) {
    console.error(`err: ${err.message}`)
  }
}

app.get('/scrape', async (req, res) => {
  const allBooks = []
  try {
    // 取得網頁完整內容
    const URL = 'https://books.toscrape.com'

    const totalPages = await getTotalPages(URL)

    for (let page = 1; page <= Number(totalPages); page++) {
      // https://books.toscrape.com/catalogue/page-2.html
      const pageURL = page === 1 ? URL : `${URL}/catalogue/page-${page}.html`

      console.log(`正在處理第 ${page} 頁：${pageURL}`)
      const booksOnPage = await scrapePage(pageURL)
      allBooks.push(booksOnPage)
    }

    res.json({
      status: 'success',
      result: allBooks
    })
  } catch (err) {
    console.error('發生錯誤:', err.message)
    res.json({
      status: 'error',
      statusCode: 500
    })
  }
})

// 圖片處理
const downloadImage = async (imageUrl, imageName) => {
  try {
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'arraybuffer'
    })

    const imagePath = path.join(__dirname, 'images', imageName)
    await fs.writeFile(imagePath, response.data)

    return imagePath
  } catch (err) {
    console.error(`err:${err.message}`)
  }
}

app.get('/scrape/images', async (req, res) => {
  try {
    const BASE_URL = 'https://books.toscrape.com'
    const response = await axios.get(BASE_URL)
    const $ = cheerio.load(response.data)
    const results = []

    const imageFolder = path.join(__dirname, 'images')
    await fs.mkdir(imageFolder, { recursive: true })

    const books = $('article.product_pod').slice(0, 10)

    for (let i = 0; i < books.length; i++) {
      const book = books.eq(i)
      const tempImageUrl = book.find('img').attr('src')
      const imageUrl = new URL(tempImageUrl, BASE_URL).toString()

      try {
        const imageName = `book-${i + 1}.jpg`
        console.log(`正在下載：${imageUrl}`)
        const savedPath = await downloadImage(imageUrl, imageName)

        result.push({
          savedPath
        })
      } catch (error) {
        console.error(error.message)
      }
    }

    res.json({
      status: 'success'
    })
  } catch (err) {
    console.error(err.message)
  }
})

app.listen(3000, () => {
  console.log('server running')
})
