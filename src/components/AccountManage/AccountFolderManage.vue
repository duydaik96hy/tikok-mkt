<template>
  <table>
    <colgroup>
      <col style="width: 100px" />
      <col style="width: 70%" />
      <col style="width: 20%" />
    </colgroup>
    <thead>
      <tr>
        <td>STT</td>
        <td>{{ $t('folderName') }}</td>
        <td>{{ $t('action') }}</td>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in accountFolderList" :key="index">
        <td width="100px">{{ index + 1 }}</td>
        <td>
          {{ item }}
        </td>
        <td>
          <el-icon
            size="26"
            color="#00cc00"
            @click="
              ((isEditAction = true),
              (activeIndex = index),
              (newfolderName = item),
              (showAddNewFolder = true))
            "
          >
            <EditPen /> </el-icon
          >&nbsp;
          <el-icon
            size="26"
            color="#ff0000"
            @click="((newfolderName = item), (activeIndex = index), (showDeleteNewFolder = true))"
            ><Delete
          /></el-icon>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="f-c add-btn">
    <button
      class="btn-1"
      @click="((newfolderName = ''), (isEditAction = false), (showAddNewFolder = true))"
    >
      {{ $t('addNewFolder') }}
    </button>
  </div>
  <el-dialog
    v-model="showAddNewFolder"
    :title="isEditAction ? $t('editNewFolder') : $t('addNewFolder')"
    style="width: calc((100% - 320px) / 2); left: 160px"
  >
    <el-input
      v-model="newfolderName"
      style="width: 240px"
      size="large"
      :placeholder="$t('folderName')"
    />
    <template #footer>
      <div class="f-s" style="justify-content: flex-end">
        <button class="btn-2" @click="showAddNewFolder = false" style="color: red">
          {{ $t('cancel') }}
        </button>
        &nbsp; &nbsp;
        <button class="btn-2" @click="addNewFolder" style="color: blue">
          {{ isEditAction ? $t('edit') : $t('add') }}
        </button>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="showDeleteNewFolder"
    :title="$t('deleteFolder')"
    style="width: calc((100% - 320px) / 2); left: 160px"
  >
    <span>{{ $t('deleteFolderConfirm') }}</span>
    &nbsp; : &nbsp;
    <span>{{ newfolderName }}</span>
    <template #footer>
      <div class="f-s" style="justify-content: flex-end">
        <button class="btn-2" @click="showDeleteNewFolder = false" style="color: red">
          {{ $t('cancel') }}
        </button>
        &nbsp; &nbsp;
        <button class="btn-2" @click="deleteNewFolder" style="color: blue">
          {{ $t('delete') }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref, getCurrentInstance } from 'vue'
import { ElNotification } from 'element-plus'
import { Store } from './../../stores'

const store = Store()
const instance = getCurrentInstance()
const proxy: any = instance?.proxy
const newfolderName = ref('')
const activeIndex = ref(0)
const accountFolderList = ref(store.accountFolderList)

const showAddNewFolder = ref(false)
const showDeleteNewFolder = ref(false)
const isEditAction = ref(false)

const addNewFolder = () => {
  if (newfolderName.value) {
    if (isEditAction.value) {
      accountFolderList.value[activeIndex.value] = newfolderName.value
      store.editFolder(newfolderName.value, activeIndex.value)
    } else {
      store.addFolder(newfolderName.value)
    }
    ElNotification({
      message: isEditAction.value ? proxy.$t('editFolderSuccess') : proxy.$t('addFolderSuccess'),
      type: 'success',
    })
  } else {
    ElNotification({
      message: proxy.$t('fillFolderNamePlease'),
      type: 'error',
    })
  }
}

const deleteNewFolder = () => {
  accountFolderList.value.splice(activeIndex.value, 1)
  store.deleteFolder(activeIndex.value)
  showDeleteNewFolder.value = false
  ElNotification({
    message: proxy.$t('deleteFolderSuccess'),
    type: 'success',
  })
}
</script>

<style lang="scss" scoped>
.add-folder {
  table {
    margin-top: 0 !important;
    max-height: 310px;
    width: 100%;
    overflow: hidden auto !important;
    display: block;
    position: relative;
    thead {
      position: sticky;
      top: -1px;
      left: 0;
      background: #ffffff;
      z-index: 1;
      td {
        border: 1px solid red;
      }
    }
  }
  .add-btn {
    margin-top: 10px;
  }
}
</style>
