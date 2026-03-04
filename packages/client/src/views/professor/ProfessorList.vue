<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <n-page-header title="导师管理" subtitle="管理你关注的导师信息" />
      <n-button type="primary" @click="showAddModal = true">添加导师</n-button>
    </div>
    <n-card>
      <n-data-table :columns="columns" :data="professors" :loading="loading" />
    </n-card>
    <n-empty v-if="!loading && professors.length === 0" description="暂无导师信息，点击右上角添加" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { DataTableColumns } from 'naive-ui'

const loading = ref(false)
const showAddModal = ref(false)
const professors = ref<any[]>([])

const columns: DataTableColumns = [
  { title: '姓名', key: 'name' },
  { title: '学校', key: 'university' },
  { title: '学院', key: 'college' },
  { title: '研究方向', key: 'researchArea' },
  { title: '联系状态', key: 'contactStatus' },
  { title: '优先级', key: 'priority' },
  { title: '操作', key: 'actions', width: 200 },
]

onMounted(() => {
  // TODO: 加载导师列表
})
</script>
