<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="f-s-b mb-2">
    <span style="max-width: 50%">{{ $t('numberOfStreams') }}</span>
    <span>
      <el-input-number size="small" v-model="configuration.numberOfStreams.value" :step="1" />
      {{ $t('times') }}
    </span>
  </div>
  <div class="f-s-b mb-2">
    <span style="max-width: 50%">{{ $t('viewVideoTime') }}</span>
    <span class="f-s">
      <INumberRanger
        style="width: 90%; text-align: right"
        v-model="configuration.viewVideoTime.value"
      ></INumberRanger>
      {{ $t('times') }}
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
</template>
<script lang="ts" setup>
import INumberRanger from '../INumberRanger.vue'
import { ref, getCurrentInstance } from 'vue'
import { Store } from '../../stores'

const store = Store()
const { proxy } = getCurrentInstance()

const configuration = ref({
  numberOfStreams: 1,
  viewVideoTime: {
    value: [1, 100],
    unit: 'second',
  },
  idLists: {
    status: false,
    type: 8,
    value: '',
    placeholder: 'typevideoIdListPlease',
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
  margin-top: 100px;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #ff7300;
  border-left-width: 6px;
}
</style>
