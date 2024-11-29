const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const { PrismaClient } = require('@prisma/client')
const mongoose = require('mongoose')
const cors = require('cors')

const prisma = new PrismaClient()
const app = express()

app.use(express.json())
app.use(cors())

mongoose.connect(
  'mongodb+srv://nov_27:Q0eN5IZXw6j916no@cluster0.yfcru.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
)

const ImageSchema = new mongoose.Schema({
  book_id: Number,
  image_data: Buffer,
  content_type: String,
  created_at: {
    type: Date,
    default: Date.now()
  }
})

const Image = mongoose.model('Image', ImageSchema)

app.get('/scrape/images', async (req, res) => {
  try {
    const BASE_URL = 'https://books.toscrape.com'
    const response = await axios.get(BASE_URL)
    const $ = cheerio.load(response.data)
    const results = []

    const books = $('article.product_pod').slice(0, 10)

    for (let i = 0; i < books.length; i++) {
      const book = books.eq(i)
      const title = book.find('h3 a').attr('title')
      const priceText = book.find('.price_color').text().replace('£', '')
      const rating = book.find('p.star-rating').attr('class').split(' ')[1]
      const relativeImageUrl = book.find('img').attr('src')
      const imageUrl = new URL(relativeImageUrl, BASE_URL).toString()

      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      })

      const image = new Image({
        image_data: imageResponse.data,
        content_type: imageResponse.headers['content-type']
      })

      const savedImage = await image.save()

      const savedBook = await prisma.books.create({
        data: {
          title,
          price: parseFloat(priceText),
          mongodb_image_id: savedImage._id.toString()
        }
      })

      await Image.findByIdAndUpdate(savedImage._id, {
        book_id: savedBook.id
      })

      results.push({
        id: savedBook.id,
        title,
        price: priceText,
        status: 'success'
      })

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    res.json({
      status: 'success',
      results
    })
  } catch (err) {
    console.error(err.message)
  }
})

app.get('/books', async (req, res) => {
  try {
    const books = await prisma.books.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })

    const bookWithImages = await Promise.all(
      books.map(async (book) => {
        if (!book.mongodb_image_id) {
          return {
            ...book,
            imageBase64: null
          }
        }

        const image = await Image.findById(book.mongodb_image_id)

        if (!image) {
          return {
            ...book,
            imageBase64: null
          }
        }

        const base64 = Buffer.from(image.image_data).toString('base64')
        const imageBase64 = `data:${image.content_type};base64,${base64}`

        return {
          ...book,
          imageBase64
        }
      })
    )

    res.json({ data: bookWithImages, status: 'success' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(3000, () => {
  console.log('server running')
})
