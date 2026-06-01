import { createRouter, createWebHistory } from 'vue-router'
import RoomsView from '../views/RoomsView.vue'
import ChatView from '../views/ChatView.vue'

const routes = [
  { path: '/', redirect: '/rooms' },
  { path: '/rooms', name: 'Rooms', component: RoomsView },
  { path: '/rooms/:id', name: 'Chat', component: ChatView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
