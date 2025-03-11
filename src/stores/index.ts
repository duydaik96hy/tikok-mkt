/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { IBaseSettings } from '../electron/model/baseSetiings'
import { IUser, IAccount } from '../electron/model/userInfomation'

function editInfo(type: string, data: any) {
  if (window) {
    const win = window as any
    if (win.api) {
      console.log(win.api)
      win.api.send('edit-info', { type, data: JSON.stringify(data) })
    }
  }
}
function isExist(id, listId) {
  let flag = false
  listId.forEach((x) => {
    if (x == id) flag = true
  })
  return flag
}

export const Store = defineStore('setting', () => {
  const userInfo = ref<IUser | null>(null)
  const token = ref<string | null>(null)
  const accountList = ref<Array<IAccount>>([])
  const accountFolderList = ref<string[]>([])
  const baseSetting = ref<IBaseSettings>({
    btInfo: {
      ipList: [],
      link: '',
      userName: '',
      password: '',
    },
    themeList: [],
    loginInfo: {
      username: '',
      password: '',
      rememberPwd: false,
    },
  })

  const initData = (data: any) => {
    if (data.userInfo) userInfo.value = data.userInfo
    if (data.token) userInfo.value = data.token
    if (data.baseSetting) userInfo.value = data.baseSetting
  }

  const editUserInfo = (user: IUser) => {
    userInfo.value = user
    editInfo('userInfo', user)
  }

  const editToken = (t: string) => {
    token.value = t
    editInfo('token', t)
  }

  const editBaseSetting = (data: IBaseSettings) => {
    baseSetting.value = data
    editInfo('baseSetting', baseSetting.value)
  }

  const addAccount = (data: Array<IAccount>) => {
    data
      .filter((x) => !!x.id)
      .forEach((x) => {
        if (
          !isExist(
            x.id,
            accountList.value.map((a) => a.id),
          )
        ) {
          accountList.value.push(x)
          editInfo('accountList', accountList.value)
        }
      })
  }

  const editAccount = (data) => {
    const index = accountList.value.findIndex((x) => x.id == data.id)
    if (index != -1) {
      accountList.value = [
        ...accountList.value.slice(0, index),
        { ...data },
        ...accountList.value.slice(index + 1),
      ]
      editInfo('accountList', accountList.value)
    }
  }

  const editMoreAccount = (data) => {
    let newData = [...accountList.value]
    if (data.length != newData.length)
      data.forEach((x) => {
        const i = newData.findIndex((n) => n.id == x.id)
        if (i != -1) newData = [...newData.slice(0, i), x, ...newData.slice(i + 1)]
      })
    else newData = [...data]
    accountList.value = [...newData]
    editInfo('accountList', accountList.value)
  }

  const deleteAccount = (id) => {
    const index = accountList.value.findIndex((x) => x.id == id)
    if (index != -1) {
      accountList.value.splice(index, 1)
      editInfo('accountList', accountList.value)
    }
  }

  const deleteMoreAccount = (listId) => {
    accountList.value = accountList.value.filter((x) => !listId.includes(x.id))
    editInfo('accountList', accountList.value)
  }

  const addFolder = (data) => {
    accountFolderList.value.unshift(data)
    editInfo('accountFolderList', accountFolderList.value)
  }

  const editFolder = (data, index) => {
    accountFolderList.value = [
      ...accountFolderList.value.slice(0, index),
      data,
      ...accountFolderList.value.slice(index + 1),
    ]
    editInfo('accountFolderList', accountFolderList.value)
  }

  const deleteFolder = (index) => {
    accountFolderList.value.splice(index, 1)
    editInfo('accountFolderList', accountFolderList.value)
  }

  return {
    userInfo,
    token,
    baseSetting,
    accountList,
    accountFolderList,
    initData,
    addAccount,
    editUserInfo,
    editToken,
    editBaseSetting,
    editAccount,
    editMoreAccount,
    deleteAccount,
    deleteMoreAccount,
    addFolder,
    editFolder,
    deleteFolder,
  }
})
