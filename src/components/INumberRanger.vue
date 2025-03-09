<script lang="ts" setup>
const model = defineModel<Array<number>>()
</script>

<template>
  <span v-if="model && model.length == 2">
    <el-input-number
      v-model="model[0]"
      controls-position="right"
      size="small"
      :step="1"
      :max="model[1]"
      style="width: calc(49% - 11px)"
    />
    <>
    <el-input-number
      v-model="model[1]"
      :min="model[0]"
      controls-position="right"
      size="small"
      :step="1"
      style="width: calc(49% - 11px)"
    />
  </span>
</template>
