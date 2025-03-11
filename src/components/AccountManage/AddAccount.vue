<template>
  <div class="account-main" @click="hideSelect = !hideSelect">
    <div class="f-s">
      <span>{{ $t('selectFolder') }}</span>
      <SelectItem
        :active-item="activeFolder"
        :items="[$t('all'), ...accountFolderList]"
        :show="showSelect"
        :hide="hideSelect"
        style="width: 300px; position: absolute; top: 0; left: 130px; z-index: 1"
        :select-item="
          (e, val) => {
            activeFolder = val
          }
        "
      ></SelectItem>
    </div>
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
        style="width: 60%; min-width: 250px"
        size="large"
      >
        <el-option
          v-for="item in formatOptions"
          :key="item.value"
          :label="$t(item.name)"
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
      <p>{{ $t('inputFormatArea') }}</p>
      <el-input
        v-model="inputData"
        style="width: 100%"
        :disabled="inputFormat.length == 0"
        :rows="10"
        type="textarea"
        :placeholder="$t('inputFormatArea')"
      />
    </div>
    <div class="show-input-area">
      <p>{{ $t('listInputData') }}</p>
      <el-table :data="list" style="width: 100%">
        <el-table-column
          v-for="item in head"
          :key="item.value"
          :prop="item.value"
          :label="$t(item.name)"
          :width="item.width"
        />
      </el-table>
    </div>
    <div class="f-c">
      <button class="btn-2" @click="addNewAccount">{{ $t('add') }}</button>
    </div>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import SelectItem from './../SelectItem.vue'
import { ref, watch, getCurrentInstance } from 'vue'
import { Store } from './../../stores'
import { IAccount } from '../../electron/model/userInfomation'
import { AcountDto } from '../../electron/model/dto/AccountDto'

const store = Store()
const instance = getCurrentInstance()
const proxy: any = instance?.proxy
const showSelect = ref(false)
const hideSelect = ref(false)
const accountFolderList = ref(store.accountFolderList)
const activeFolder = ref('')
const inputFormat = ref<Array<string>>([])
const inputData = ref('')
const formatOptions = ref([
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
const head = ref([
  {
    value: 'name',
    name: 'name',
    show: true,
    width: 200,
  },
  {
    value: 'username',
    name: 'username',
    show: true,
    width: 200,
  },
  {
    value: 'password',
    name: 'password',
    show: true,
    width: 200,
  },
  {
    value: 'email',
    name: 'email',
    show: true,
    width: 200,
  },
  {
    value: 'passEmail',
    name: 'passEmail',
    show: true,
    width: 800,
  },
  {
    value: 'emailRecover',
    name: 'emailRecover',
    show: true,
    width: 200,
  },
  {
    value: 'pwdEmailRecover',
    name: 'pwdEmailRecover',
    show: true,
    width: 200,
  },
  {
    value: 'proxy',
    name: 'proxy',
    show: true,
    width: 200,
  },
])
const list = ref<Array<IAccount>>([])

const addNewAccount = () => {
  store.addAccount(
    list.value.map((x) => {
      return { ...x, status: { status: true }, loginFacebook: false }
    }),
  )
  proxy?.$notification('success', proxy.$t('addAccountSuccess'))
}

const formatInputFormat = (val) => {
  let t = val
  const item = formatOptions.value.find((x) => x.value == val)
  if (item) {
    t = proxy?.$t(item.name)
  }
  return t
}

let timeout: NodeJS.Timeout | null = null

watch(inputData, (newData) => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => {
    list.value = []
    const d = newData.split('\n')
    d.forEach((x) => {
      const newObj = {}
      let newObjData = x.split('|').filter((x) => x != '')
      if (newObjData.length == 0) newObjData = x.split(' ')
      inputFormat.value.forEach((i, k) => {
        newObj[i] = newObjData[k]
      })
      list.value.push(AcountDto.init(newObj))
    })
  }, 500)
})
</script>

<style lang="scss" scoped>
.account-main {
  position: relative;
  > div {
    position: relative;
    min-height: 60px;
    margin-bottom: 10px;
  }
  .input-area,
  .show-input-area {
    // background: #ffffff;
  }
}

.custom-tag {
  position: relative;
  border: 1px solid #409eff;
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
</style>
