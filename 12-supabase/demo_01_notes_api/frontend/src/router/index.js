import { createRouter, createWebHistory } from 'vue-router'
import NotesView from '../views/NotesView.vue'
import UsersView from '../views/UsersView.vue'

const routes = [
  { path: '/', redirect: '/notes' },
  { path: '/notes', name: 'Notes', component: NotesView },
  { path: '/users', name: 'Users', component: UsersView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
