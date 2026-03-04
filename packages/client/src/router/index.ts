import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardPage.vue'),
      },
      {
        path: 'professors',
        name: 'Professors',
        component: () => import('@/views/professor/ProfessorList.vue'),
      },
      {
        path: 'kanban',
        name: 'Kanban',
        component: () => import('@/views/kanban/KanbanPage.vue'),
      },
      {
        path: 'interviews',
        name: 'Interviews',
        component: () => import('@/views/interview/InterviewPage.vue'),
      },
      {
        path: 'templates',
        name: 'Templates',
        component: () => import('@/views/template/TemplatePage.vue'),
      },
      {
        path: 'tags',
        name: 'Tags',
        component: () => import('@/views/tag/TagPage.vue'),
      },
      {
        path: 'reminders',
        name: 'Reminders',
        component: () => import('@/views/note/NotePage.vue'),
      },
      {
        path: 'notes',
        name: 'Notes',
        component: () => import('@/views/note/NotePage.vue'),
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: () => import('@/views/dashboard/DashboardPage.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/SettingsPage.vue'),
      },
      {
        path: 'data',
        name: 'Data',
        component: () => import('@/views/data/DataPage.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth !== false && !authStore.isLoggedIn) {
    next({ name: 'Login' })
  } else if ((to.name === 'Login' || to.name === 'Register') && authStore.isLoggedIn) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
