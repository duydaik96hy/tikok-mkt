<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="f-s-b mb-2">
    <span style="max-width: 50%">{{ $t('numberOfStreams') }}</span>
    <span>
      <el-input-number size="small" v-model="configuration.numberOfStreams.value" :step="1" />
      {{ $t('times') }}&nbsp;&nbsp;
    </span>
  </div>
  <div class="f-s-b mb-2">
    <span style="max-width: 50%">{{ $t('viewVideoTime') }}</span>
    <INumberRanger
      style="width: 45%; text-align: right"
      v-model="configuration.viewVideoTime.value"
    ></INumberRanger>
  </div>
  <div class="f-s-b mb-2">
    <span style="max-width: 50%">{{ $t('followAfterWatch') }}</span>
    <span class="f-s">
      <INumberRanger
        style="width: 90%; text-align: right"
        v-model="configuration.followAfterWatch.value"
      ></INumberRanger>
      video
    </span>
  </div>

  <div class="mb-2">
    <span style="max-width: 50%">{{ $t('idLists') }}</span>
    <div>
      <el-input
        type="textarea"
        v-model="configuration.idLists.value"
        rows="6"
        style="width: 100%"
      />
    </div>
  </div>

  <div class="f-c action-btn">
    <button class="btn-2 start" v-show="!configuration.running" @click="startActive">
      {{ $t('start') }}
    </button>
    &nbsp;
    <button class="btn-2 stop" v-show="configuration.running" @click="stopActive">
      {{ $t('stop') }}
    </button>
  </div>

  <el-dialog v-model="showDialog" append-to-body top="2vh">
    <template #header>
      <h3 style="font-size: 24px">
        {{ isAddAction ? $t('newScript') : $t('editScript') }}
      </h3>
    </template>
    <div style="position: relative; height: 77vh; overflow-y: auto"></div>
    <template #footer>
      <div>
        <button class="btn-4" @click="showDialog = false">
          {{ $t('cancel') }}</button
        >&nbsp;
        <button class="btn-3" @click="startActive">
          {{ $t('start') }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import INumberRanger from '../INumberRanger.vue'
import { ref, getCurrentInstance } from 'vue'
import { Store } from '../../stores'

const store = Store()
const { proxy } = getCurrentInstance()

const showDialog = ref(false)
const isAddAction = ref(false)

const configuration = ref({
  numberOfStreams: {
    type: 3,
    value: 1,
  },
  viewVideoTime: {
    status: false,
    value: [1, 100],
    type: 8,
    unit: 'second',
  },
  followAfterWatch: {
    status: false,
    value: [1, 3],
    type: 8,
    unit: 'video',
  },
  idLists: {
    status: false,
    value: '',
    type: 6,
    unit: '',
  },
  running: false,
})

const startActive = () => {
  // if (!configuration.value.script) {
  //   proxy.$notification('error', proxy.$t('selectScriptPlease'))
  // } else {
  //   configuration.value.running = true
  //   const selectedUser = accountStore.accountList.filter((x) => x.status)
  //   proxy.$localSocket.emit('start-interactive', {
  //     configuration: configuration.value,
  //     users: selectedUser
  //   })
  // }
}

const stopActive = () => {
  configuration.value.running = false
  proxy.$notification('warning', proxy.$t('stopInteractive'))
  proxy.$localSocket.emit('action-close', {
    type: 'interactive',
    uid: '',
  })
}
</script>
<style lang="scss" scoped>
.list {
  position: relative;
  top: 0;
  left: 0;
  border: 1px solid #ff7300;
  border-radius: 10px;
  margin: 20px 0;
  > div {
    padding: 0 10px;
  }
  h2 {
    position: sticky;
    top: 0;
    left: 0;
    padding: 6px 10px;
    background-color: #ff7300;
    z-index: 2;
    border-radius: 10px 10px 0 0;
    color: #ffffff;
    margin-bottom: 10px;
  }
}
.action-btn {
  margin-top: 50px;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #ff7300;
  border-left-width: 6px;
}
</style>
