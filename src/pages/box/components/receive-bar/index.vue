<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isAllSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['handleSelectAll', 'handleToDismantlePage', 'handleToDeliveryPage', 'handleToMallPage', 'handleToConsignmentPage'])

const handleSelectAll = () => {
  console.log('handleSelectAll')
  const { isAllSelected } = props
  emit('handleSelectAll', { isAllSelected })
}

const handleToMall = () => {
  emit('handleToMallPage')
}

const handleToDismantle = () => {
  emit('handleToDismantlePage')
}

const handleToConsignment = () => {
  emit('handleToConsignmentPage')
}

const handleToDelivery = () => {
  emit('handleToDeliveryPage')
}
</script>

<template>
  <view class="cart-bar flex items-center">
    <view class="flex flex-1">
      <wd-icon
        size="32rpx"
        :color="isAllSelected ? '#ff0000' : '#c4c4c4'"
        :name="isAllSelected ? 'check-circle-filled' : 'circle'"
        class="cart-bar__check"
        @click="handleSelectAll"
      />
      <text class="ml-10rpx font-size-24rpx fw-bold" @click="handleSelectAll">全选</text>
    </view>
    <!--  
    <view @click="handleToDismantle" :class="`${!isDisabled ? '' : 'disabled-btn'} fragment-btn`" hover-class="{{!isDisabled ? '' : 'hover-btn'}}">
      <text class="hidden">分解</text>
    </view>
    -->
    <view class="btn-list flex justify-between">
      <view @click="handleToMall" class="operation-btn">
        <text class="">兑换</text>
      </view>
      <view @click="handleToConsignment" class="operation-btn">
        <text class="">寄售</text>
      </view>
      <view @click="handleToDelivery" class="operation-btn">
        <text class="">提货</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.cart-bar {
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
  &:last-child{
    margin-right: 0;
  }
}
</style>
