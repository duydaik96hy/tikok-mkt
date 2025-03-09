<template>
  <ul>
    <li
      v-for="(item, index) in menu"
      :key="index"
      :class="[
        { 'active-nav': statusField == 1 && index != 0 },
        { 'unactive-nav': statusField == 2 && index != 0 },
      ]"
      @click.stop="changeItemstatusField(statusField + 1, item)"
      class="flex-start"
    >
      <span v-if="item.icon && item.icon != 'none'">
        <img
          :src="item.icon"
          v-if="item.icon.includes('https')"
          width="26px"
          style="margin-right: 10px"
        />
        <span style="transform: translateY(3px); display: inline-block" v-else>
          <EleIcon :icon="item.icon" />
        </span>
      </span>
      &nbsp;&nbsp;&nbsp;
      <span>{{ item.icon ? item.name : item }}</span>
    </li>
  </ul>
</template>

<script>
import EleIcon from './icons/EleIcon.vue'

export default {
  name: 'select-item',
  components: { EleIcon },
  props: {
    items: {
      type: Array,
      default: () => {
        return []
      },
    },
    selectItem: Function,
    show: {
      type: Boolean,
      default: false,
    },
    hide: {
      type: Boolean,
      default: false,
    },
    activeItem: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      slideWidth: 0,
      statusField: 0,
      menu: [],
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      let menu = this.items
      if (this.activeItem) {
        if (typeof this.items[0] == 'string') {
          menu = menu.filter((x) => x != this.activeItem)
          menu.unshift(this.activeItem)
        } else {
          const index = menu.findIndex((x) => x.value == this.activeItem)
          if (index != -1) {
            const newItem = menu[index]
            menu.splice(index, 1)
            menu.unshift(newItem)
          }
        }
      } else {
        this.menu = menu
      }
      this.menu = menu
    },
    changeItemstatusField(statusField, item) {
      this.statusField = statusField > 2 ? 0 : statusField
      if (statusField == 2) {
        setTimeout(() => {
          this.statusField = 0
          this.selectItem(false, item)
          if (item) {
            let menu = this.items
            if (typeof this.items[0] == 'string') {
              menu = this.items.filter((x) => x != item)
              menu.unshift(item)
            } else {
              const index = menu.findIndex((x) => x.value == item.value)
              if (index != -1) {
                const newItem = menu[index]
                menu.splice(index, 1)
                menu.unshift(newItem)
              }
            }

            this.menu = menu
          }
        }, 400)
      }
    },
  },
  watch: {
    show(val) {
      if (val) {
        this.statusField = 1
      } else {
        this.statusField = 0
      }
    },
    hide() {
      if (this.statusField == 1) this.changeItemstatusField(2, this.activeItem)
    },
    items() {
      this.init()
    },
  },
}
</script>

<style lang="scss" scoped>
.flex-start {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
ul {
  background-color: #ffffff;
  border-radius: 10px;
  border: 1px solid #a6abb5;
  padding: 0 10px;
  display: inline-block;
  max-height: 242px;
  overflow-y: auto;

  li {
    overflow: hidden;
    border-bottom: 1px solid #a6abb5;
    padding: 0 10px;
    margin-bottom: 0;

    &:first-child {
      height: 40px;
    }
    &:last-child {
      border-bottom: none;
    }
    &:not(li:first-child) {
      height: 0;
    }
    &:hover {
      background-color: #ffffff;
      color: black !important;
      border-radius: 5px;
    }
  }
}

@keyframes show-bottom {
  0% {
    height: 0;
    transform: translateY(100%);
  }
  100% {
    // width: 100%;
    height: 40px;
    transform: translateY(0);
  }
}

@keyframes hide-bottom {
  0% {
    // width: 100%;
    height: 40px;
    transform: translateY(0);
  }
  100% {
    // width: 0;
    height: 0;
    transform: translateY(100%);
  }
}

.active-nav {
  animation: show-bottom 0.4s 1 cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
.unactive-nav {
  animation: hide-bottom 0.4s 1 cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>
