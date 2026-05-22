<script lang="ts" setup>
const props = defineProps({
  orderTagInfos: {
    type: Array<any>,
    default: () => [],
  },
  title: {
    type: String,
    default: '我的订单',
  },
  desc: {
    type: String,
    default: '全部订单',
  },
  isTop: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['onClickTop', 'onClickItem'])

function onClickItem(status) {
  console.log('order item status', status)
  emit('onClickItem', status)
}

function onClickTop() {
  emit('onClickTop', {})
}
</script>

<template>
  <view class="mb-3 overflow-hidden rounded-2 bg-white">
    <view class="h-60rpx title pl-3 box-border pt-3">
      {{ title }}
    </view>
    <view class="h-144rpx w-full flex overflow-hidden bg-white">
      <view
        v-for="(item, index) in orderTagInfos"
        :key="index"
        class="order-group__item flex flex-auto flex-col flex-justify-center flex-items-center overflow-hidden"
        @click="onClickItem(item.status)"
      >
        <view class="relative mb-2 h-56rpx w-56rpx">
          <wd-badge :model-value="item.orderNum" :max="99" color="#FF4646">
            <wd-icon
              :name="item.iconName"
              size="56rpx"
              custom-style="background-image: -webkit-linear-gradient(90deg, #6a6a6a 0%,#929292 100%);-webkit-background-clip: text;-webkit-text-fill-color: transparent;"
            />
          </wd-badge>
        </view>
        <view class="text-3 text-gray-600 line-height-4">
          {{ item.title }}
        </view>
      </view>
    </view>
  </view>
</template>
