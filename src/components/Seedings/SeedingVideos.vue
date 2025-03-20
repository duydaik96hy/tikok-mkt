<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="f-s-b mb-2">
    <span style="max-width: 50%">{{ $t('numberOfStreams') }}</span>
    <span>
      <el-input-number size="small" v-model="configuration.numberOfStreams" :step="1" />
      {{ $t('times') }}&nbsp;&nbsp;
    </span>
  </div>
  <!-- --el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949 -->
  <!-- <div class="script">
    <h3 class="f-s-b">
      <span>{{ $t('script') }}</span>
      <span style="width: 50%">
        <el-select
          v-model="configuration.script"
          filterable
          :placeholder="$t('script')"
          style="width: 50%"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        &nbsp;
        <span
          ><button
            class="btn-3"
            @click="((newData = { ...baseData }), (isAddAction = true), (showDialog = true))"
          >
            {{ $t('add') }}
          </button>
          <button
            class="btn-3"
            v-if="options.length != 0 && configuration.script"
            style="background: goldenrod"
            @click="editScript()"
          >
            {{ $t('edit') }}
          </button></span
        >
      </span>
    </h3>
  </div> -->
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
    <div style="position: relative; height: 77vh; overflow-y: auto">
      <div v-for="item in Object.keys(newData)" :key="item">
        <div class="f-s-b" v-if="item == 'scriptName'">
          <span>{{ $t(item) }}</span
          >&nbsp;&nbsp;
          <el-input v-model="newData[item]" style="width: 50%" :placeholder="$t('scriptNamePlh')" />
        </div>
        <div class="f-s-b" v-else-if="item == 'totalInteractiveAction'" style="margin: 10px 0">
          <span>{{ $t('totalInteractiveAction') }}({{ $t('times') }})</span>&nbsp;
          <el-input-number size="small" v-model="newData.totalInteractiveAction" :step="1" />
        </div>
        <div class="f-s-b" v-else-if="item == 'timeoutAction'">
          <span style="width: 50%">{{ $t('timeoutAction') }}({{ $t('second') }})</span>&nbsp;
          <INumberRanger
            style="width: 45%; text-align: right"
            v-model="newData.timeoutAction"
          ></INumberRanger>
        </div>
        <div class="list" v-else-if="item != 'id'">
          <h2>{{ $t(item) }}</h2>
          <div
            v-for="active in Object.keys(newData[item])"
            :key="active"
            style="margin-bottom: 20px"
          >
            <div class="f-s-b">
              <span
                style="width: 45%; display: inline-flex; align-items: center"
                :style="`width:${[5, 12].includes(newData[item][active].type) ? '100' : '45'}%`"
              >
                <el-switch
                  v-model="newData[item][active].status"
                  class="ml-2"
                  v-if="![4, 5, 10].includes(newData[item][active].type)"
                  style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                />
                &nbsp;<span
                  >{{ $t(active) }}
                  <span
                    v-if="newData[item][active].unit"
                    style="color: blue; text-transform: lowercase"
                  >
                    ( {{ $t(newData[item][active].unit) }} )</span
                  >
                </span>
              </span>
              <span class="f-s" style="width: 45%; justify-content: flex-end">
                <el-input-number
                  v-if="newData[item][active].type == 7 && newData[item][active].status"
                  size="small"
                  v-model="newData[item][active].value"
                  :step="1"
                />
                <span
                  v-if="newData[item][active].each && newData[item][active].status"
                  style="margin-top: 5px"
                >
                  <span style="text-transform: lowercase"
                    >{{ $t('each') }} {{ $t(newData[item][active].unit) }}</span
                  >
                  <INumberRanger
                    v-model="newData[item][active].each"
                    style="text-align: right; display: inline-block"
                    :style="`width: calc(100% - ${newData[item][active].unit == 'group' ? 63 : 57}px);`"
                  ></INumberRanger>
                </span>
                <INumberRanger
                  v-if="
                    ([8, 11].includes(newData[item][active].type) &&
                      newData[item][active].status) ||
                    newData[item][active].type == 4
                  "
                  v-model="newData[item][active].value"
                  style="text-align: right; width: 100%"
                ></INumberRanger>
                <el-input
                  v-if="newData[item][active].type == 9 && newData[item][active].status"
                  v-model="newData[item][active].value"
                  style="width: 100%"
                  :placeholder="$t(newData[item][active].placeholder)"
                />
                <el-select
                  v-model="newData[item][active].activeType"
                  filterable
                  :placeholder="$t('script')"
                  style="width: 100%"
                  v-if="newData[item][active].type == 10"
                >
                  <el-option
                    v-for="item in interactiveWithOption"
                    :key="item.value"
                    :label="$t(item.label)"
                    :value="item.value"
                  />
                </el-select>
              </span>
            </div>
            <div>
              <el-input
                v-model="
                  newData[item][active][newData[item][active].type == 5 ? 'value' : 'content']
                "
                style="width: 100%"
                :rows="8"
                v-if="
                  ([11, 12].includes(newData[item][active].type) && newData[item][active].status) ||
                  newData[item][active].type == 5 ||
                  (newData[item][active].type == 10 &&
                    newData[item][active].activeType == 'groupIdList')
                "
                type="textarea"
                :placeholder="$t(newData[item][active].placeholder)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div>
        <button class="btn-4" @click="showDialog = false">
          {{ $t('cancel') }}</button
        >&nbsp;
        <button class="btn-3" @click="configurationAction">
          {{ isAddAction ? $t('add') : $t('edit') }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import INumberRanger from '../INumberRanger.vue'
import { ref, getCurrentInstance, nextTick } from 'vue'
import { Store } from '../../stores'

const store = Store()
const { proxy } = getCurrentInstance()

const showDialog = ref(false)
const isAddAction = ref(false)

const configuration = ref({ ...store.baseSetiings.seedings, running: false })
const interactiveWithOption = ref([
  { value: 'accountGroup', label: 'accountGroup' },
  { value: 'groupIdList', label: 'groupIdList' },
])

const baseData = ref({
  buffFollow: {
    numberOfStreams: {
      type: 3,
      value: false,
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
      value: [1, 3],
      type: 6,
      unit: '',
    },
  },
  seedingVideos: {
    numberOfStreams: {
      type: 3,
      value: false,
    },
    viewVideoTime: {
      status: false,
      value: [1, 100],
      type: 8,
      unit: 'second',
    },
    likePage: {
      status: false,
      type: 8,
      value: [1, 100],
      unit: 'page',
      placeholder: 'typePageIdListPlease',
    },
    likeCommentInPostsOnPage: {
      status: false,
      type: 8,
      value: [1, 100],
      unit: 'posts',
    },
    followPage: {
      status: false,
      type: 8,
      value: [1, 100],
      unit: 'page',
    },
    commentPostsOnPage: {
      status: false,
      type: 11,
      value: [1, 100],
      comment: '',
      unit: 'posts',
      placeholder: 'typeContentPlease',
    },
    likePostsOnPage: {
      status: false,
      type: 8,
      value: [1, 100],
      unit: 'posts',
    },
    inviteFriendLike: {
      status: false,
      type: 7,
      value: 0,
      each: [1, 100],
      unit: 'page',
    },
    inviteFriendFollow: {
      status: false,
      type: 7,
      value: 0,
      each: [1, 100],
      unit: 'page',
    },
  },
})

// type = 0 : text , 1 number , 2 select , 3 switch ,4 From - to, 5 textarea,6: select and text input,7:switch and number input,
// 8: switch and number ranger input,9:switch and text input,10:switch and select,11:switch and number ranger and textarea,12 switch and textarea
const newData = ref(baseData.value)

const configurationAction = () => {
  if (isAddAction.value) {
    store.addScript(newData.value)
    proxy.$notification('success', proxy.$t('addScriptSuccsess'))
  } else {
    store.updateScipt(newData.value)
    proxy.$notification('success', proxy.$t('updateScriptSuccess'))
  }
  nextTick(() => {
    options.value = store.scriptList.map((x) => {
      return { value: x.id, label: x.scriptName }
    })
    showDialog.value = false
    newData.value = baseData.value
  })
}

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
