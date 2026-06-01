<script setup>
import { ref, onMounted } from 'vue'
import { notesApi, usersApi } from '../services/api.js'
import NoteCard from '../components/NoteCard.vue'
import NoteForm from '../components/NoteForm.vue'

const notes = ref([])
const users = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingNote = ref(null)

const fetchNotes = async () => {
  loading.value = true
  try {
    const [notesRes, usersRes] = await Promise.all([
      notesApi.getAll(),
      usersApi.getAll()
    ])
    notes.value = notesRes.data.data
    users.value = usersRes.data.data
  } catch (error) {
    console.error('Failed to fetch notes:', error)
  } finally {
    loading.value = false
  }
}

const handleCreate = async (noteData) => {
  try {
    await notesApi.create(noteData)
    showForm.value = false
    await fetchNotes()
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to create note')
  }
}

const handleEdit = (note) => {
  editingNote.value = note
  showForm.value = true
}

const handleUpdate = async (noteData) => {
  try {
    await notesApi.update(editingNote.value.id, noteData)
    showForm.value = false
    editingNote.value = null
    await fetchNotes()
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to update note')
  }
}

const handleDelete = async (id) => {
  if (!confirm('確定要刪除這則筆記嗎？')) return
  try {
    await notesApi.delete(id)
    await fetchNotes()
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to delete note')
  }
}

const handleCancel = () => {
  showForm.value = false
  editingNote.value = null
}

onMounted(fetchNotes)
</script>

<template>
  <div class="notes-view">
    <div class="header">
      <h2>筆記列表</h2>
      <button @click="showForm = true" class="btn-primary" v-if="!showForm">
        新增筆記
      </button>
    </div>

    <NoteForm
      v-if="showForm"
      :note="editingNote"
      :users="users"
      @submit="editingNote ? handleUpdate($event) : handleCreate($event)"
      @cancel="handleCancel"
    />

    <div v-if="loading" class="loading">載入中...</div>

    <div v-else-if="notes.length === 0" class="empty">
      還沒有任何筆記，新增一個吧！
    </div>

    <div v-else class="notes-grid">
      <NoteCard
        v-for="note in notes"
        :key="note.id"
        :note="note"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
}

.btn-primary {
  background: #3ecf8e;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  background: #38b880;
}

.loading,
.empty {
  text-align: center;
  padding: 40px;
  color: #666;
}

.notes-grid {
  display: grid;
  gap: 16px;
}
</style>
