<script lang="ts" setup>
import IconRefresh from '../components/icons/IconRefresh.vue'
import IHeaders from '../components/IHeaders.vue'
import ITableData from '../components/ITableData.vue'
import SelectItem from '../components/SelectItem.vue'
import { ref, getCurrentInstance, watch } from 'vue'
import { Store } from '../stores'
const { proxy } = getCurrentInstance()

const store = Store()
const accountFolderList = ref(store.accountFolderList)
const list = ref(store.accountList)
const showSelect = ref(false)
const hideSelect = ref(false)

const head = ref([
  {
    value: 'uid',
    name: 'UID',
  },
  {
    value: 'password',
    name: 'password',
  },
  {
    value: 'privateKey',
    name: 'Private Key',
  },
  {
    value: 'proxy',
    name: 'Proxy',
  },
  {
    value: 'cookies',
    name: 'Cookies',
  },
  {
    value: 'token',
    name: 'Token',
  },
  {
    value: 'email',
    name: 'Email',
  },
  {
    value: 'passwordMail',
    name: 'passwordMail',
  },
  {
    value: 'recoveryMail',
    name: 'recoveryMail',
  },
  {
    value: 'recoveryMailPassword',
    name: 'recoveryMailPassword',
  },
  {
    value: 'birthday',
    name: 'birthday',
  },
  {
    value: 'status',
    name: 'accountStatus',
  },
])

head.value = head.value.map((x) => {
  const item = store.showCol.find((s) => x.value == s.value)
  return { ...x, show: item ? item.show : true }
})

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
  {
    name: 'selectDisplayFields',
    value: 2,
    icon: `Monitor`,
    type: 2,
  },
]
const changeMenu = () => {
  // console.log(val)
}
watch(store, (_n) => {
  head.value = head.value.map((x) => {
    const item = _n.showCol.find((s) => x.value == s.value)
    return { ...x, show: item ? item.show : true }
  })
})

const selectedFolder = ref('')
proxy.$localSocket.on('selected-folder', (data) => {
  list.value = data
})

const changeFolder = (e, val) => {
  proxy.$localSocket.emit('selected-folder', val == proxy.$t('all') ? 'all' : val)
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
.account-manager {
}
</style>
