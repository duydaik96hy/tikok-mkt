<script lang="ts" setup>
import IconRefresh from '../components/icons/IconRefresh.vue'
import IHeaders from '../components/IHeaders.vue'
import ITableData from '../components/ITableData.vue'
import SelectItem from '../components/SelectItem.vue'
import { ref, getCurrentInstance } from 'vue'
import { Store } from '../stores'
const { proxy } = getCurrentInstance()

const store = Store()
const accountFolderList = ref(store.accountFolderList)
const list = ref(store.accountList)
const showSelect = ref(false)
const hideSelect = ref(false)

const head = ref([
  {
    value: 'name',
    name: 'name',
  },
  {
    value: 'username',
    name: 'username',
  },
  {
    value: 'password',
    name: 'password',
  },
  {
    value: 'email',
    name: 'email',
  },
  {
    value: 'passEmail',
    name: 'passEmail',
  },
  {
    value: 'emailRecover',
    name: 'emailRecover',
  },
  {
    value: 'pwdEmailRecover',
    name: 'pwdEmailRecover',
  },
  {
    value: 'proxy',
    name: 'proxy',
  },
])

const menuList = [
  {
    name: 'folderManage',
    value: 0,
    icon: `FolderAdd`,
    type: 0,
  },
  {
    name: 'addAccount',
    value: 1,
    icon: `AccountAdd`,
    type: 1,
  },
]
const changeMenu = () => {
  // console.log(val)
}

const selectedFolder = ref('')
// proxy.$localSocket.on('selected-folder', (data) => {
//   list.value = data
// })

const changeFolder = (e, val) => {
  // proxy.$localSocket.emit('selected-folder', val == proxy.$t('all') ? 'all' : val)
  selectedFolder.value = val
}
</script>

<template>
  <div class="full account-manager" @click="hideSelect = !hideSelect">
    <div class="head-nav">
      <IHeaders :list="menuList" @change="changeMenu" :type="2" title="Menu"></IHeaders>
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
    <div class="contain">
      <ITableData :list="list" :head="head"></ITableData>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.head-nav {
  position: unset;
}
</style>
