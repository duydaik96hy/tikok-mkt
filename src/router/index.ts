import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'account-manage',
      component: () => import('../views/AccountManage.vue'),
    },
    {
      path: '/seeding',
      name: 'seeding',
      component: () => import('../views/SeedingVideo.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
    },
  ],
})

export default router
