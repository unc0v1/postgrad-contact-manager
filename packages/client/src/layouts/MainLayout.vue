<template>
  <n-layout has-sider style="height: 100vh">
    <!-- 左侧导航栏 -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="220"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="p-4 text-center font-bold text-lg">
        <span v-if="!collapsed">套磁管理系统</span>
        <span v-else>套磁</span>
      </div>
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuClick"
      />
    </n-layout-sider>

    <n-layout>
      <!-- 顶部栏 -->
      <n-layout-header bordered class="h-56px flex items-center justify-between px-4">
        <div class="text-lg font-medium">{{ currentTitle }}</div>
        <div class="flex items-center gap-3">
          <span>{{ authStore.user?.nickname || authStore.user?.email }}</span>
          <n-button text @click="handleLogout">退出登录</n-button>
        </div>
      </n-layout-header>

      <!-- 内容区 -->
      <n-layout-content content-style="padding: 24px;" class="bg-gray-50">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const collapsed = ref(false)

const activeKey = computed(() => route.name as string)

const currentTitle = computed(() => {
  const titles: Record<string, string> = {
    Dashboard: '仪表盘',
    Professors: '导师管理',
    Kanban: '看板视图',
    Interviews: '面试管理',
    Templates: '邮件模板',
    Tags: '标签管理',
    Reminders: '提醒事项',
    Notes: '笔记管理',
    Calendar: '日历视图',
    Settings: '系统设置',
    Data: '数据导入导出',
  }
  return titles[route.name as string] || '套磁管理系统'
})

const menuOptions: MenuOption[] = [
  { label: '仪表盘', key: 'Dashboard' },
  { label: '导师管理', key: 'Professors' },
  { label: '看板视图', key: 'Kanban' },
  { label: '面试管理', key: 'Interviews' },
  { label: '邮件模板', key: 'Templates' },
  { label: '标签管理', key: 'Tags' },
  { label: '提醒事项', key: 'Reminders' },
  { label: '笔记管理', key: 'Notes' },
  { label: '日历视图', key: 'Calendar' },
  { label: '系统设置', key: 'Settings' },
  { label: '数据管理', key: 'Data' },
]

function handleMenuClick(key: string) {
  router.push({ name: key })
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>
