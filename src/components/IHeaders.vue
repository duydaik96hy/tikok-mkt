<!-- eslint-disable vue/valid-v-model -->
<template>
  <div class="f-s" style="margin: 5px 0">
    <span class="menu-btn" @click="drawer2 = true">
      <el-icon size="40" style="transform: translateY(4px)"><Expand /></el-icon>
    </span>
    <p v-if="props.type < 3">
      <span>
        <span>{{ $t('total') }}</span>
        <span style="margin: 0 30px; color: blue">{{ totalData.total }}</span>
      </span>
      <span style="margin: 0 50px">
        <span>{{ $t('live') }}</span>
        <span style="margin: 0 30px; color: green">{{ totalData.live }}</span>
      </span>
      <span>
        <span>{{ $t('die') }}</span>
        <span style="margin: 0 30px; color: red">{{ totalData.die }}</span>
      </span>
    </p>
    <p v-if="props.type == 3">
      <span>
        <span>{{ $t('total') }}</span>
        <span style="margin: 0 30px; color: blue">{{ totalData.total }}</span>
      </span>
      <span style="margin: 0 50px">
        <span>{{ $t('haveImage') }}</span>
        <span style="margin: 0 30px; color: green">{{ totalData.haveImage }}</span>
      </span>
      <span>
        <span>{{ $t('noImage') }}</span>
        <span style="margin: 0 30px; color: red">{{ totalData.noImage }}</span>
      </span>
    </p>
    <el-drawer v-model="drawer2" direction="ltr" custom-class="drawer" :size="drawerSize">
      <template #header>
        <h1 style="border-bottom: 1px solid #f06305; padding: 10px">{{ props.title }}</h1>
      </template>
      <template #default>
        <ul v-if="props.type == 1">
          <li v-for="(item, index) in props.list" :key="item.value" @click="change(item)">
            <div class="f-s">
              <EleIcon :size="27" :icon="item.icon"></EleIcon> &nbsp; {{ $t(item.name) }}
            </div>
            <div class="child" :class="`${activeNav == index ? 'show-nav' : 'hide-nav'}`">
              <div v-if="item.type == 0" class="add-folder">
                <SeedingVideos />
              </div>
              <div v-if="item.type == 1">
                <BuffFollow />
              </div>
            </div>
          </li>
        </ul>
        <ul v-if="props.type == 2">
          <li v-for="(item, index) in props.list" :key="item.value" @click="change(item)">
            <div class="f-s">
              <EleIcon :size="27" :icon="item.icon"></EleIcon> &nbsp; {{ $t(item.name) }}
            </div>
            <div class="child" :class="`${activeNav == index ? 'show-nav' : 'hide-nav'}`">
              <div v-if="item.type == 0" class="add-folder">
                <AccountFolderManage />
              </div>
              <div v-if="item.type == 1">
                <AddAccount />
              </div>
            </div>
          </li>
        </ul>
      </template>
    </el-drawer>
  </div>
</template>
<script lang="ts" setup>
import AccountFolderManage from './AccountManage/AccountFolderManage.vue'
import AddAccount from './AccountManage/AddAccount.vue'
import EleIcon from './icons/EleIcon.vue'
import { ref } from 'vue'
import SeedingVideos from './Seedings/SeedingVideos.vue'
import BuffFollow from './Seedings/BuffFollow.vue'

const emit = defineEmits(['change'])

interface IMenu {
  name: string
  value: number
  icon: string
  type: number
}

const props = defineProps({
  list: Array<IMenu>,
  title: String,
  type: {
    type: Number,
    default: 0,
  },
})

const activeNav = ref(0)

const drawerSize = ref('80%')

const totalData = ref({
  total: 0,
  live: 0,
  die: 0,
  noImage: 0,
  haveImage: 0,
})

const drawer2 = ref(false)

const change = (item) => {
  drawerSize.value = '80%'
  activeNav.value = item.value
  emit('change', item.value)
}
</script>

<style lang="scss" scoped>
.menu-btn {
  padding: 5px 15px;
  border-bottom: 1px solid rgba($color: #f06305, $alpha: 0.3);
  border-right: 6px solid #f06305;
  border-radius: 10px;
  margin-right: 50px;
  box-shadow:
    6px 6px 12px #c5c5c5,
    -6px -6px 12px #ffffff;
  transition: all 0.3s ease;
  &:active {
    letter-spacing: 3px;
    background-color: hsl(261deg 80% 48%);
    color: hsl(0, 0%, 100%);
    box-shadow: rgb(93 24 220) 0px 0px 0px 0px;
    transform: translateY(10px);
    transition: 100ms;
  }
}

table {
  td {
    padding: 5px 10px;
  }
}

ul {
  padding: 0;
}

:global(.el-overlay) {
  position: absolute;
  top: 0px;
  left: 0px;
  border-radius: 10px;
}
li {
  border-bottom: 1px solid rgba($color: #f06305, $alpha: 0.8);
}

.script {
  position: relative;
  border: 1px solid #f06305;
  border-left: 6px solid #f06305;
  border-radius: 10px;
  padding: 20px;
}

@keyframes show-nav {
  0% {
    height: 0;
  }
  100% {
    height: 50vh;
  }
}

@keyframes hide-nav {
  0% {
    height: 50vh;
  }
  100% {
    height: 0;
  }
}

.child {
  height: 0;
  overflow: hidden;
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #f06305;
  border-radius: 10px;
  > div {
    height: 100%;
    overflow: auto;
    padding: 10px;
  }
}

.show-nav {
  animation: show-nav 0.2s 1 linear forwards;
  background: url('@/assets/bg.png') top left repeat;
}
.hide-nav {
  border: none;
  padding: 0;
  margin-top: 0;
  animation: hide-nav 0.2s 1 linear forwards;
}

.drawer {
  background: url('@/assets/bg.png') top left repeat;
}
</style>
