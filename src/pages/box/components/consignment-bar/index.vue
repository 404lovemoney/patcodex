<template>
  <view class="cart-bar">
    <view class="flex mr-20rpx">
      <wd-icon
        size="32rpx"
        :color="isAllSelected ? '#FA4126' : '#BBBBBB'"
        :name="isAllSelected ? 'check-circle-filled' : 'circle'"
        class="cart-bar__check"
        @click="handleSelectAll"
      />
      <text class="ml-10rpx font-size-24rpx fw-bold" @click="handleSelectAll">全选</text>
    </view>
    <view @click="handleToCancelConsignment" class="operation-btn flex-1">
      <text class="">取消寄售</text>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue'

const value = ref<boolean>(true)

const props = defineProps({
  isAllSelected: {
    type: Boolean,
    default: false
  },
  bottomHeight: {
    type: Number,
    default: 100
  },
  fixed: Boolean
})

const isDisabled = ref(false)

const emit = defineEmits(['handleSelectAll', 'handleToCancelConsignment'])

const handleSelectAll = () => {
  console.log('handleSelectAll')
  const { isAllSelected } = props
  emit('handleSelectAll', { isAllSelected })
}

const handleToCancelConsignment = () => {
  if (isDisabled.value) return
  emit('handleToCancelConsignment')
}
</script>

<style lang="scss">
.cart-bar {
  display: flex;
  align-items: center;
  height: 80rpx;
  padding: 0rpx 25rpx;
  box-sizing: border-box;
  background: #fff;
  font-size: 24rpx;
  line-height: 36rpx;
  color: #333;
}

.operation-btn{
  margin-right: 10rpx;
  text-align: center;
  line-height: 60rpx;
  width: 170rpx;
  height: 60rpx;
  background: #FF0C00;
  font-size: 24rpx;
  color: #fff;
  border-radius: 35rpx;
  font-weight: bold;
}

</style>
