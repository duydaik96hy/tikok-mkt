<template>
  <div class="contain">
    <table id="table">
      <thead>
        <tr>
          <th style="width: 50px; min-width: 50px">
            <el-checkbox v-model="checkAll" size="large" />
          </th>
          <th v-for="item in props.head" :key="item.name">
            <div style="text-transform: capitalize">{{ $t(item.name) }}</div>
          </th>
          <th>
            <div>{{ $t('actionStatus') }}</div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in data"
          :key="item.id"
          @mousedown="mousedown($event, index)"
          @mouseup="mouseup()"
          @mousemove="mousemove(index)"
          @click.right="rightClick($event, index)"
          :class="[
            selectRowsList.includes(index)
              ? 'is-selected'
              : item.status && !item.status.status && !!item.status.type
                ? 'die-account'
                : 'un-select',
          ]"
        >
          <td style="width: 50px; min-width: 50px">
            <el-checkbox v-model="item.isSelected" size="large" />
          </td>
          <td v-for="h in props.head" :key="h.name" @dblclick="$copy(item[h.value])">
            <span v-if="h.value == 'status' && item.status">{{
              item.status.status ? $t('active') : $t('code.' + item.status.type)
            }}</span>
            <span v-else-if="h.value == 'imagesNum'">{{ item.imageList.length }}</span>
            <span v-else>{{ item[h.value] }}</span>
          </td>
          <td>{{ item.actionStatus ? item.actionStatus.value : '' }}</td>
        </tr>
      </tbody>
    </table>
    <div
      class="base-action right-action"
      :style="`top:${rightActionPosition.y - 10}px;left:${rightActionPosition.x - 10}px`"
      v-show="showRightAction"
      ref="rightActionRef"
      @mouseenter="showRightAction = true"
      @mouseleave="showRightAction = false"
    >
      <div
        class="f-s-b item"
        v-for="item in rightActionList"
        :key="item.value"
        @mouseenter="item.showChild = true"
        @mouseleave="item.showChild = false"
        @click="clickFeild(item.childs, item.value)"
      >
        <span class="f-s"
          ><EleIcon :icon="item.icon" :size="24" />&nbsp; <span>{{ $t(item.name) }}</span></span
        >
        <EleIcon icon="ArrowRightBold" :size="14" v-if="item.childs" />

        <div
          class="base-action child"
          @mouseenter="item.showChild = true"
          v-if="item.childs && item.showChild"
          :style="`right:${showLeft ? 100 : -122}%`"
        >
          <p
            v-for="child in item.childs"
            :key="child.name"
            @click="childItemAction(item.value, child.value)"
          >
            {{ $t(child.name) }}
          </p>
        </div>
      </div>
    </div>
    <el-dialog v-model="customsConfigurationDialog" append-to-body>
      <template #header>
        <h3 style="font-size: 24px">{{ $t('customsConfiguration') }}</h3>
      </template>
      <div>
        <el-select
          v-model="customConfig"
          multiple
          filterable
          allow-create
          clearable
          default-first-option
          :reserve-keyword="false"
          :placeholder="$t('customsConfiguration')"
          style="width: 100%; min-width: 250px"
          size="large"
        >
          <el-option
            v-for="item in configurationList"
            :key="item.value"
            :label="$t(item.name)"
            :value="item.value"
          >
          </el-option>
          <template #tag>
            <el-tag v-for="item in customConfig" :key="item" class="custom-tag">{{
              formatInputFormat(item)
            }}</el-tag>
          </template>
        </el-select>
      </div>
      <template #footer>
        <div>
          <button class="btn-4" @click="customsConfigurationDialog = false">
            {{ $t('cancel') }}</button
          >&nbsp;
          <button
            class="btn-3"
            @click="customsConfigurationAction"
            :disabled="customConfig.length == 0"
          >
            {{ isCopyAction ? $t('copy') : $t('paste') }}
          </button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="editAccountDialog" append-to-body top="2vh">
      <template #header>
        <h3 style="font-size: 24px">{{ $t('updateAccountInfo') }}</h3>
      </template>
      <div style="height: 77vh; overflow-y: auto">
        <div>
          <span>{{ $t('inputFormat') }}</span> &nbsp;&nbsp;
          <el-select
            v-model="inputFormat"
            multiple
            filterable
            allow-create
            clearable
            default-first-option
            :reserve-keyword="false"
            placeholder="Chọn định dạng nhập"
            style="width: 80%; min-width: 250px"
            size="large"
          >
            <el-option
              v-for="item in configurationList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            >
            </el-option>
            <template #tag>
              <el-tag v-for="item in inputFormat" :key="item" class="custom-tag">{{
                formatInputFormat(item)
              }}</el-tag>
            </template>
          </el-select>
        </div>
        <div class="input-area">
          <p>{{ $t('newAccountInfo') }}</p>
          <el-input
            v-model="inputData"
            style="width: 100%"
            :disabled="!inputFormat || inputFormat.length == 0"
            :rows="10"
            type="textarea"
            :placeholder="$t('inputFormatArea')"
          />
        </div>
        <div class="show-input-area">
          <p>{{ $t('selectedAccount') }}</p>
          <div style="width: 100%; overflow-x: auto">
            <table>
              <thead>
                <tr>
                  <th v-for="head in configurationList" :key="head.value">
                    {{ head.name }}
                  </th>
                </tr>
              </thead>
              <tbody v-if="updateAccountList.length != 0">
                <tr v-for="item in updateAccountList" :key="item.id">
                  <td v-for="value in configurationList" :key="item.id + value.value">
                    {{ item[value.value] }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="updateAccountList.length == 0" class="f-c" style="height: 150px">
              {{ $t('noData') }}
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div>
          <button class="btn-4" @click="editAccountDialog = false">
            {{ $t('cancel') }}</button
          >&nbsp;
          <button class="btn-3" @click="updateAccountInfo">
            {{ $t('update') }}
          </button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="changeFolderDialog" append-to-body @click="hideSelect = !hideSelect">
      <template #header>
        <h3 style="font-size: 24px">{{ $t('selectNewFolder') }}</h3>
      </template>
      <div style="position: relative">
        <SelectItem
          :active-item="accountFolderList[0]"
          :items="[...accountFolderList]"
          :show="showSelect"
          :hide="hideSelect"
          style="width: 300px; position: absolute; top: 0; left: 130px; z-index: 1"
          :select-item="
            (e, val) => {
              newFolder = val
            }
          "
        ></SelectItem>
      </div>
      <template #footer>
        <div>
          <button class="btn-4" @click="changeFolderDialog = false">
            {{ $t('cancel') }}
          </button>
          &nbsp;
          <button class="btn-3" @click="changeFolder">
            {{ $t('update') }}
          </button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="deleteContentDialog" append-to-body>
      <template #header>
        <h3 style="font-size: 24px">{{ $t('deleteContent') }}</h3>
      </template>
      <div style="position: relative; height: 50vh; overflow: auto">
        <table>
          <tbody>
            <tr>
              <td style="min-width: 50px; width: 50px">
                <el-checkbox v-model="deleteCheckAll" size="large" />
              </td>
              <td>{{ $t('title') }}</td>
            </tr>
            <tr v-for="item in confirmList" :key="item.title">
              <td style="min-width: 50px; width: 50px">
                <el-checkbox v-model="item.isSelected" size="large" />
              </td>
              <td>{{ item.title }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <div>
          <button class="btn-4" @click="deleteContentDialog = false">
            {{ $t('cancel') }}
          </button>
          &nbsp;
          <button class="btn-3" @click="deleteContent">
            {{ $t('delete') }}
          </button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="editContentDialog" append-to-body width="70%">
      <template #header>
        <h3 style="font-size: 24px">{{ $t('editContent') }}</h3>
      </template>
      <div class="f-s edit-content">
        <div class="left-nav">
          <p
            v-for="(item, i) in confirmList"
            :key="item.title"
            @click="activeEdit = i"
            :style="`background-color:${activeEdit == i ? '#eee' : '#fff'};border-bottom: 1px solid ${activeEdit == i ? '#f06305' : '#c5c5c5'};`"
          >
            {{ item.title }}
          </p>
        </div>
        <div class="right-content" v-if="editContentDialog">
          <AddPosts :data="confirmList[activeEdit]" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, nextTick, getCurrentInstance, onMounted } from 'vue'
import SelectItem from './SelectItem.vue'
import EleIcon from './icons/EleIcon.vue'
import { Store } from '../stores'
import { useRoute } from 'vue-router'
import { IRightClickOption } from '../electron/model/userInfomation'
import { AcountDto } from '../electron/model/dto/AccountDto'

const store = Store()
const route = useRoute()
const { proxy } = getCurrentInstance()

const props = defineProps({
  list: {
    type: Array,
    default: () => {
      return []
    },
  },
  head: {
    type: Array<{ name: string; value: string }>,
    default: () => {
      return []
    },
  },
})
const newFolder = ref('')

const deleteContentDialog = ref(false)
const deleteCheckAll = ref(true)
const confirmList = ref([])
const editContentDialog = ref(false)
const rightActionList = ref<Array<IRightClickOption>>([
  {
    value: 'select',
    name: 'select',
    icon: 'selected',
    showChild: false,
    childs: [
      {
        value: 'all',
        name: 'all',
      },
      {
        value: 'blueField',
        name: 'blueField',
      },
    ],
  },
  {
    value: 'copy',
    name: 'copy',
    icon: 'copy',
    showChild: false,
    childs: [
      {
        value: 'name',
        name: 'name',
      },
      {
        value: 'password',
        name: 'password',
      },
      // {
      //   value: 'uid-password-privateKey',
      //   name: 'uidPassPrivateKey',
      // },
      // {
      //   value: 'email-passwordMail',
      //   name: 'emailPassMail',
      // },
      // {
      //   value: 'copyWithCustomsConfiguration',
      //   name: 'copyWithCustomsConfiguration',
      // },
    ],
  },
  {
    value: 'paste',
    name: 'paste',
    icon: 'paste',
    showChild: false,
    childs: [
      {
        value: 'proxy',
        name: 'pasteProxy',
      },
      {
        value: 'recoveryMail',
        name: 'pasteRecoveryMail',
      },
      // {
      //   value: 'password',
      //   name: 'pastePassword',
      // },
      // {
      //   value: 'cookies',
      //   name: 'pasteCookies',
      // },
      // {
      //   value: 'pasteWithCustomsConfiguration',
      //   name: 'pasteWithCustomsConfiguration',
      // },
    ],
  },
  {
    value: 'delete',
    name: 'delete',
    icon: 'delete',
    showChild: false,
    childs: [
      {
        value: 'account',
        name: 'deleteAccount',
      },
      {
        value: 'proxy',
        name: 'deleteProxy',
      },
    ],
  },
  {
    value: 'loginMail',
    name: 'loginMail',
    icon: 'facebook',
    showChild: false,
  },
  // {
  //   value: 'checkAccount',
  //   name: 'checkAccount',
  //   icon: 'check',
  //   showChild: false,
  //   childs: [
  //     {
  //       value: 'flashCheck',
  //       name: 'flashCheck',
  //     },
  //     {
  //       value: 'specialCheck',
  //       name: 'specialCheck',
  //     },
  //   ],
  // },
  {
    value: 'updateAccountInfo',
    name: 'updateAccountInfo',
    icon: 'update-info',
    showChild: false,
  },
  {
    value: 'createChormeProfile',
    name: 'createChormeProfile',
    icon: 'chorme',
    showChild: false,
  },
  {
    value: 'changeFolder',
    name: 'changeFolder',
    icon: 'change-folder',
    showChild: false,
  },
  {
    value: 'closeAllChorme',
    name: 'closeAllChorme',
    icon: 'quit',
    showChild: false,
  },
])
const rightActionPosition = ref({
  x: 0,
  y: 0,
})
const configurationList = ref<Array<{ value: string; name: string }>>([
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
const accountFolderList = ref(store.accountFolderList)
const customConfig = ref([])
const selectRowsList = ref<Array<number>>([])
const inputFormat = ref<Array<string>>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateAccountList = ref<Array<any>>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data = ref<Array<any>>(props.list)

data.value = data.value.map((x) => {
  return { ...x, isSelected: false }
})

const inputData = ref('')
const activeEdit = ref(0)

const changeFolderDialog = ref(false)
const customsConfigurationDialog = ref(false)
const showSelect = ref(false)
const hideSelect = ref(false)
const editAccountDialog = ref(false)
const isDown = ref(false)
const showLeft = ref(false)
const showRightAction = ref(false)
const checkAll = ref(false)

const isCopyAction = ref()
const rightActionRef = ref()

// if (proxy.$localSocket) {
//   proxy.$localSocket.on('action-status', (d) => {
//     const i = data.value.findIndex((x) => x.uid == d.uid)
//     if (i != -1)
//       data.value = [
//         ...data.value.slice(0, i),
//         {
//           ...data.value[i],
//           actionStatus: { type: d.type, value: proxy.$t('code.' + d.message) },
//         },
//         ...data.value.slice(i + 1),
//       ]
//   })
//   proxy.$localSocket.on('user-status', (d) => {
//     store.editAccount(d.user)
//     nextTick(() => {
//       const i = data.value.findIndex((x) => x.uid == d.user.uid)
//       if (i != -1)
//         data.value = [
//           ...data.value.slice(0, i),
//           {
//             ...data.value[i],
//             status: d.user.status,
//             actionStatus: {
//               type: d.type,
//               value: proxy.$t('code.' + d.user.status.type),
//             },
//           },
//           ...data.value.slice(i + 1),
//         ]
//     })
//   })
// }

onMounted(() => {
  const table = document.getElementById('table')
  if (table) {
    table.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  }
})

const updateAccountInfo = () => {
  store.editMoreAccount(updateAccountList.value)
  editAccountDialog.value = true
}

const formatInputFormat = (val) => {
  let t = val
  const item = configurationList.value.find((x) => x.value == val)
  if (item) {
    t = item.name
  }
  return t
}

const customsConfigurationAction = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  isCopyAction.value ? copy('custom') : paste('custom')
}

const mousedown = (event, e) => {
  if (event.button != 2) {
    isDown.value = true
    // data.value = [
    //   ...data.value.map((x, k) => {
    //     return { ...x, isSelected: e === k }
    //   })
    // ]
    selectRowsList.value = [e]
  }
}

const mousemove = (e) => {
  if (isDown.value && !selectRowsList.value.includes(e)) {
    const length = e - selectRowsList.value[selectRowsList.value.length - 1]
    if (length > 0) {
      for (let index = 0; index < length; index++) {
        selectRowsList.value.push(e - index)
      }
    }
    if (length < 0) {
      for (let index = 0; index < Math.abs(length); index++) {
        selectRowsList.value.push(e + index)
      }
    }
    // nextTick(() => {
    //   data.value = [
    //     ...data.value.map((x, k) => {
    //       return { ...x, isSelected: selectRowsList.value.includes(k) }
    //     })
    //   ]
    // })
  }
}

const mouseup = () => {
  isDown.value = false
}

const rightClick = (e, i) => {
  if (!selectRowsList.value.includes(i)) {
    selectRowsList.value = [i]
  }
  setTimeout(() => {
    rightActionPosition.value.x =
      e.pageX + rightActionRef.value.clientWidth > window.innerWidth
        ? e.pageX - rightActionRef.value.clientWidth
        : e.pageX
    rightActionPosition.value.y =
      e.pageY + rightActionRef.value.clientHeight > window.innerHeight
        ? e.pageY - rightActionRef.value.clientHeight
        : e.pageY
    showLeft.value = e.pageX + rightActionRef.value.clientWidth + 230 > window.innerWidth
  }, 1)
  showRightAction.value = true
}

const clickFeild = (childs, typeActions) => {
  const selectedUserList = [...data.value.filter((x) => x.isSelected)]
  if (selectedUserList.length == 0) {
    proxy.$notification('error', proxy.$t('selectUserPlease'))
  } else if (!childs) {
    switch (typeActions) {
      case 'loginHotmail':
        // proxy.$localSocket.emit('login-hotmail', selectedUserList)
        break
      case 'loginFacebook':
        // proxy.$localSocket.emit('login-facebook', selectedUserList)
        break
      case 'updateAccountInfo':
        inputData.value = selectedUserList
          .map((x) => {
            return configurationList.value
              .map((t) => {
                return x[t.value]
              })
              .join('|')
          })
          .join('\n')
        inputFormat.value = configurationList.value.map((x) => x.value)
        editAccountDialog.value = true
        break
      case 'createChormeProfile':
        break
      case 'changeFolder':
        changeFolderDialog.value = true
        break
      case 'closeAllChorme':
        // proxy.$localSocket.emit('action-close', {
        //   type: 'all',
        //   uid: selectedUserList.map((x) => x.uid),
        // })
        break
      default:
        break
    }
  }
  if (typeActions !== 'select') showRightAction.value = false
  isDown.value = false
}

const childItemAction = (typeActions, value) => {
  switch (typeActions) {
    case 'copy':
      copy(value)
      break
    case 'paste':
      paste(value)
      break
    case 'delete':
      del(value)
      break
    case 'select':
      select(value)
      break
    case 'checkAccount':
      checkAccount(value)

    default:
      break
  }
}

function checkAccount(type) {
  // proxy.$localSocket.emit('check-account', {
  //   users: [...data.value.filter((x) => x.isSelected)],
  //   type,
  // })
}

function copy(type) {
  let text = ''
  if (type != 'copyWithCustomsConfiguration') {
    const copySingleValueArr = ['uid', 'password', 'token', 'copy2FA']
    const copyMoreValueArr = ['uid-password-privateKey', 'email-passwordMail']
    if (copySingleValueArr.includes(type)) {
      text = data.value
        .filter((x) => x.isSelected)
        .map((x) => x[type])
        .join('\n')
    }
    if (copyMoreValueArr.includes(type)) {
      text = data.value
        .filter((x) => x.isSelected)
        .map((x) => {
          return type
            .split('-')
            .map((t) => x[t])
            .join('|')
        })
        .join('\n')
    }
    if (type == 'custom') {
      text = data.value
        .filter((x) => x.isSelected)
        .map((x) => {
          let t = ''
          customConfig.value.forEach((c) => {
            console.log(c, x[c])
            t += x[c] ? x[c] + '|' : ''
          })
          return t.replace(/\|$/g, '')
        })
        .join('\n')
    }
    proxy.$copy(text)
  } else {
    isCopyAction.value = true
    customsConfigurationDialog.value = true
  }

  showRightAction.value = false
}

function paste(type) {
  if (type != 'pasteWithCustomsConfiguration') {
    const arr = ['proxy', 'recoveryMail', 'password', 'cookies']
    if (arr.includes(type)) {
      navigator.clipboard.readText().then((text) => {
        if (text) {
          const pasteArr = text.split('\n')
          let i = 0
          data.value = [
            ...data.value.map((x) => {
              const newData = { ...x }
              if (x.isSelected && i != pasteArr.length) {
                newData[type] = pasteArr[i]
                i++
              }
              return newData
            }),
          ]
        }
      })
    }

    if (type == 'custom') {
      navigator.clipboard.readText().then((text) => {
        if (text) {
          const pasteArr = text.split('\n')
          let i = 0
          data.value = [
            ...data.value.map((x) => {
              const newData = { ...x }
              if (x.isSelected && i != pasteArr.length) {
                const valueList = pasteArr[i].split('|')
                customConfig.value.forEach((custom, valueIndex) => {
                  newData[custom] = valueList[valueIndex] ? valueList[valueIndex] : ''
                })

                i++
              }
              return newData
            }),
          ]
          nextTick(() => {
            store.editMoreAccount(data.value)
          })
        }
      })
    }
    nextTick(() => {
      store.editMoreAccount(data.value)
    })
  } else {
    isCopyAction.value = false
    customsConfigurationDialog.value = true
  }
  showRightAction.value = false
}

function del(type) {
  if (type != 'account') {
    const arr = ['proxy', 'cookies', 'token', 'recoveryMail']
    if (arr.includes(type)) {
      data.value = [
        ...data.value.map((x) => {
          const newData = { ...x }
          if (x.isSelected) {
            newData[type] = ''
          }
          return newData
        }),
      ]
      nextTick(() => {
        store.editMoreAccount(data.value)
      })
    }
  } else {
    store.deleteMoreAccount(data.value.filter((x) => x.isSelected).map((x) => x.id))
    nextTick(() => {
      data.value = [...store.accountList]
    })
  }
  selectRowsList.value = []
  showRightAction.value = false
}

function select(type) {
  switch (type) {
    case 'all':
      data.value = [
        ...data.value.map((x) => {
          return { ...x, isSelected: true }
        }),
      ]
      break
    case 'blueField':
      data.value = [
        ...data.value.map((x, k) => {
          return { ...x, isSelected: selectRowsList.value.includes(k) }
        }),
      ]
      break
    case 'active':
      data.value = [
        ...data.value.map((x) => {
          return { ...x, isSelected: x.status.status === true }
        }),
      ]
      break
    case 'haveImage':
      data.value = [
        ...data.value.map((x) => {
          return { ...x, isSelected: x.imageList.length !== 0 }
        }),
      ]
      break
    case 'noImage':
      data.value = [
        ...data.value.map((x) => {
          return { ...x, isSelected: x.imageList.length === 0 }
        }),
      ]
      break

    case 'disabled':
      data.value = [
        ...data.value.map((x) => {
          return { ...x, isSelected: x.status.status === false }
        }),
      ]
      break

    default:
      break
  }
}

function changeFolder() {
  const newData = data.value.map((x) => {
    return {
      ...x,
      folderName: x.isSelected && newFolder.value ? newFolder.value : x.folderName,
    }
  })
  data.value = newData
  // proxy.$localSocket.emit('change-folder', {
  //   type: route.name == 'content-manage' ? 'content' : 'account',
  //   data: newData,
  // })
  proxy.$notification('success', proxy.$t('updateFolderSuccess'))
  changeFolderDialog.value = false
}

watch(checkAll, (n) => {
  data.value = [
    ...data.value.map((x) => {
      return { ...x, isSelected: n }
    }),
  ]
})

watch(props, (n) => {
  console.log(n)
  data.value = n.list
})

let timeout: NodeJS.Timeout | null = null

//

watch(inputData, (newData) => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => {
    updateAccountList.value = []
    const d = newData.split('\n')
    const selectedList = data.value.filter((x) => x.isSelected)
    selectedList.forEach((x, k) => {
      const newObj = x
      let newObjData = d[k].split('|')
      if (newObjData.length == 0) newObjData = d[k].split(' ')
      inputFormat.value.forEach((i, k) => {
        newObj[i] = newObjData[k]
      })
      updateAccountList.value.push(AcountDto.init(newObj))
    })
  }, 500)
})
</script>
<style scoped lang="scss">
:global(.table-gray-color) {
  border-color: gray !important;
}

:global(table) {
  margin-top: 0px !important;
}

:global(.el-table__empty-block) {
  min-height: 250px;
  max-height: 60vh !important;
}

.contain {
  position: relative;
  resize: none;
  transition: all 0.3s linear;
  &::-webkit-scrollbar {
    height: 5px;
    width: 5px;
  }
  &:hover {
    &::-webkit-scrollbar {
      height: 10px;
      width: 10px;
    }
  }
  width: 100%;
  max-height: 77vh;
  overflow: auto;
}

table {
  transition: all 0.3s linear;

  div {
    resize: horizontal;
    overflow: auto;
    height: 100%;
    min-width: 200px;
    margin: 0px;
    padding: 0px;
    display: block;
  }
  tr {
    transition: all 0.2s linear;
  }
  td,
  th {
    border: 1px solid #d2d2d2;
    color: #646464;
  }
  td {
    padding: 0;
    margin: 0px;
    overflow: auto;
    min-width: 200px;
    user-select: none;
    > div {
      box-sizing: border-box;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
      overflow-wrap: break-word;
      line-height: 23px;
      height: 100%;
      padding: 0 12px;
      border: none;
      &::-webkit-resizer {
        background-color: transparent;
      }
    }
  }
  .is-selected {
    background: rgb(20, 105, 233);

    td {
      color: #fff;
      border-color: #fff;
    }
  }
  .un-select {
    background: #fff;
    td {
      border: 1px solid #d2d2d2;
      color: #646464;
    }
  }

  .die-account {
    background-color: rgba($color: red, $alpha: 0.15);
    td {
      border: 1px solid #d2d2d2;
      color: #646464;
    }
  }
}

.right-action {
  position: fixed;
  top: 0;
  left: 0;
  background: #fff;
  height: max-content;
  resize: none;
  border-radius: 10px;
  padding: 20px;
  z-index: 1;
  .item {
    padding: 5px 10px;
    border-radius: 6px;
    position: relative;
    min-width: 188px;
    span {
      font-size: 14px;
    }
    &:hover {
      background: rgba($color: #ff7300, $alpha: 0.2);
    }
    .child {
      position: absolute;
      background: #ffffff;
      top: 0;
      right: 0;
      padding: 10px;
      border-radius: 10px 20px;
      width: 230px;
      z-index: 2;
      p {
        font-size: 14px;
        padding: 5px 10px;
        border-radius: 10px 20px;
        box-sizing: border-box;
        &:hover {
          background: rgba($color: #ff7300, $alpha: 0.2);
        }
      }
    }
  }
}

.base-action {
  transition: all 0.1s linear;
  &::before {
    content: '';
    background: linear-gradient(
      45deg,
      #ff0000,
      #ff7300,
      #fffb00,
      #48ff00,
      #00ffd5,
      #002bff,
      #7a00ff,
      #ff00c8,
      #ff0000
    );
    position: absolute;
    top: -2px;
    left: -2px;
    background-size: 400%;
    z-index: -1;
    filter: blur(5px);
    width: calc(100% + 3px);
    height: calc(100% + 3px);
    animation: glowing 20s linear infinite;
    transition: opacity 0.3s ease-in-out;
    border-radius: 10px;
  }
  &::after {
    z-index: -1;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: #fff;
    left: 0;
    top: 0;
    border-radius: 10px;
  }
}

.custom-tag {
  position: relative;
  border: 1px solid #409eff;
  font-size: 14px;
  &::after {
    content: '';
    position: absolute;
    display: inline-block;
    top: 0;
    right: -5px;
    width: 2px;
    height: 100%;
    background: #000;
  }
}

@keyframes glowing {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 400% 0;
  }
  100% {
    background-position: 0 0;
  }
}

.edit-content {
  position: relative;
  height: 70vh;
  overflow: auto;
  align-items: start;
  .left-nav {
    position: sticky;
    top: 0;
    left: 0;
    width: 250px;
    height: 100%;
    overflow: auto;
    margin-right: 20px;
    border-radius: 10px;
    padding: 10px 0;
    border: 1px solid #f06305;
    border-left: 8px solid #f06305;
    box-shadow:
      6px 6px 12px #c5c5c5,
      -6px -6px 12px #ffffff;
    p {
      max-width: 98%;
      padding: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      border-bottom: 1px solid #c5c5c5;
      border-radius: 0 30px 10px 0;
      margin-bottom: 10px;
    }
  }
  .right-content {
    width: calc(100% - 280px);
  }
}
</style>
