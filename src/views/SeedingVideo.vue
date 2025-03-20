<script lang="ts" setup>
import IHeaders from '../components/IHeaders.vue'
import SelectItem from '../components/SelectItem.vue'
import ITableData from '../components/ITableData.vue'
import { ref, getCurrentInstance } from 'vue'
import { Store } from '../stores'

const { proxy } = getCurrentInstance()
const store = Store()
const list = ref(store.accountList)
const accountFolderList = ref(store.accountFolderList)
const head = ref([
  { value: 'uid', name: 'UID', show: true },
  { value: 'name', name: 'name', show: true },
  { value: 'email', name: 'email', show: true },
  { value: 'friend', name: 'friend', show: true },
  { value: 'group', name: 'group', show: true },
  { value: 'runningInfo', name: 'runningInfo', show: true },
  { value: 'processed', name: 'processed', show: true },
])

const showSelect = ref(false)
const hideSelect = ref(false)
const selectedFolder = ref('')
const menuList = [
  {
    name: 'BuffFollow',
    value: 0,
    icon: `BuffFollow`,
    type: 0,
  },
  {
    name: 'SeedingVideos',
    value: 1,
    icon: `SeedingVideos`,
    type: 1,
  },
]
// proxy.$localSocket.on('selected-folder', (data) => {
//   list.value = data
// })

const changeFolder = (e, val) => {
  // proxy.$localSocket.emit('selected-folder', val == proxy.$t('all') ? 'all' : val)
  selectedFolder.value = val
}
</script>

<template>
  <div class="full interactive" @click="hideSelect = !hideSelect">
    <div>
      <IHeaders :list="menuList" :title="$t('Seedings')" :type="1"></IHeaders>
      <div class="f-s">
        <span>
          <IconRefresh></IconRefresh>
        </span>
        <div style="position: relative; height: 52px; width: 300px; margin: 20px; z-index: 5">
          <SelectItem
            :active-item="selectedFolder"
            :items="[$t('all'), ...accountFolderList]"
            :show="showSelect"
            :hide="hideSelect"
            style="width: 300px; position: absolute; top: 0; left: 0; z-index: 1"
            :select-item="changeFolder"
          ></SelectItem>
        </div>
      </div>
    </div>
    <ITableData :list="list" :head="head"></ITableData>
  </div>
</template>
<style scoped lang="scss">
.interactive {
}
</style>
