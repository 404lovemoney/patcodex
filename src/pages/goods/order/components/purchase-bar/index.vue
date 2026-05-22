
<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps({
  totalGoodsNum: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  totalPointsAmount: {
    type: Number,
    default: 0
  },
  buyType: {
    type: String,
    default: 'exchange'
  },
  fixed: Boolean
})

const isDisabled = ref(false)

watch(
  () => props.totalGoodsNum,
  (num) => {
    const disabled = num === 0
    setTimeout(() => {
      isDisabled.value = disabled
    })
  }
)

const emit = defineEmits(['handleToSettle'])

const handleToSettle = () => {
  if (isDisabled.value) return
  emit('handleToSettle')
}
</script>

<template>
  <view class="operation-bar">
    <view class="check_tips mb-5 text-center">
      <wd-icon name="check-circle-filled" size="24rpx" color="#ff0c00"></wd-icon>
      <text class="ml-10rpx text-24rpx color-#929292">我已满18岁，阅读并同意</text>
      <text class="text-24rpx color-#929292">《支付协议》</text>
    </view>
    <view class="cart-bar flex items-center">
      <view class="flex-1 flex  items-center">
        <text class="text-30rpx fw-bold color-#212121">共{{ totalGoodsNum }}件</text>
        <text class="ml-10rpx mr-10rpx text-30rpx color-#929292">|</text>
        <text class="text-24rpx color-#929292">合计:</text>
        <text class="text-40rpx fw-bold color-#ff0c00">{{ '￥' + totalAmount }}</text>
      </view>
      <view @click="handleToSettle" class="goods-submit-btn">
        <view class="">提交订单</view>
      </view>
    </view>

  </view>
</template>

<style lang="scss" scoped>
.cart-bar {
  padding: 0rpx 20rpx;
  height: 100rpx;
  background-color: #fff;
  box-sizing: border-box;
}

.cart-bar .goods-submit-btn {
  width: 220rpx;
  height: 76rpx;
  border-radius: 38rpx;
  background-color: #ff0c00;
  font-size: 30rpx;
  font-weight: bold;
  line-height: 76rpx;
  color: #ffffff;
  text-align: center;
}
</style>
