<template>
  <div>
    <n-page-header title="仪表盘" subtitle="总览你的套磁进度" />
    <div class="mt-4 grid grid-cols-4 gap-4">
      <n-card title="导师总数" size="small">
        <div class="text-3xl font-bold text-primary">0</div>
      </n-card>
      <n-card title="已联系" size="small">
        <div class="text-3xl font-bold text-success">0</div>
      </n-card>
      <n-card title="待回复" size="small">
        <div class="text-3xl font-bold text-warning">0</div>
      </n-card>
      <n-card title="面试安排" size="small">
        <div class="text-3xl font-bold text-info">0</div>
      </n-card>
    </div>
    <div class="mt-6">
      <n-card title="最近活动">
        <n-empty description="暂无活动记录" />
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// 仪表盘页面 - 后续实现数据展示
</script>
