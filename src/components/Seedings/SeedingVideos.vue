<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="f-s-b mb-2">
    <span style="max-width: 50%">{{ $t('numberOfStreams') }}</span>
    <span>
      <el-input-number size="small" v-model="configuration.numberOfStreams" :step="1" />
      {{ $t('streams') }}
    </span>
  </div>
  <div class="f-s-b mb-2">
    <span style="max-width: 50%">{{ $t('viewVideoTime') }}</span>
    <span class="f-s">
      <INumberRanger
        style="width: 90%; text-align: right"
        v-model="configuration.viewVideoTime"
      ></INumberRanger>
      {{ $t('second') }}
    </span>
  </div>
  <div class="mb-2">
    <span style="max-width: 50%">{{ $t('idLists') }}</span>
    <div>
      <el-input
        type="textarea"
        v-model="configuration.idLists"
        rows="6"
        :placeholder="$t('typevideoIdListPlease')"
        style="width: 100%"
      />
    </div>
  </div>

  <div class="f-c action-btn">
    <button class="btn-2 start" v-show="!running" @click="startActive">
      {{ $t('start') }}
    </button>
    &nbsp;
    <button class="btn-2 stop" v-show="running" @click="stopActive">
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
const configuration = ref(store.baseSetiings.seedings.seedingVideos)
const running = ref(false)

const startActive = () => {
  running.value = true
  if (window) {
    const win = window as any
    if (win.api) {
      win.api.send(
        'actions',
        JSON.stringify({
          type: 'start-seeding-videos',
          data: configuration.value,
          users: store.accountList,
        }),
      )
    }
  }
}

const stopActive = () => {
  running.value = false
  if (window) {
    const win = window as any
    if (win.api) {
      win.api.send(
        'actions',
        JSON.stringify({
          type: 'stop-seeding-videos',
          data: {},
        }),
      )
    }
  }
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
