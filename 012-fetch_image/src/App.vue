<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'

const books = ref([])

const fetchBookWithImage = async (bookId) => {
  try {
    // 取得圖片數據
    const imageResponse = await axios.get(`http://localhost:3000/book/${bookId}/image`, {
      responseType: 'arraybuffer'
    })

    // 轉換為 Base64
    const base64 = Buffer.from(imageResponse.data, 'binary').toString('base64')
    return `data:${imageResponse.headers['content-type']};base64,${base64}`
  } catch (error) {
    console.error(`獲取圖片失敗 (ID: ${bookId}):`, error)
    return null
  }
}

const fetchBooks = async () => {
  try {
    const response = await axios.get('http://localhost:3000/books')
    books.value = response.data.data
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  fetchBooks()
})
</script>

<template>
  <div v-for="book in books" :key="book.id">
    <img :src="book.imageBase64" :alt="book.title" />
    <div class="book-info">
      <h3>{{ book.title }}</h3>
      <p>價格: ${{ book.price }}</p>
    </div>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
