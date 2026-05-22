<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useUserStore } from '@/store'

// pinia
const userStore = useUserStore()

const props = defineProps({
  totalGoodsNum: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  bottomHeight: {
    type: Number,
    default: 0
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

const emit = defineEmits(['handleToPurchase', 'handleToExchange'])

const handleToPurchase = () => {
  emit('handleToPurchase')
}

const handleToExchange = () => {
  emit('handleToExchange')
}
</script>

<template>
  <view class="cart-bar flex items-center">
    <view class="flex-1">
      <view class="flex items-center">
        <text class="text-30rpx fw-bold color-#212121">共{{ totalGoodsNum }}件</text>
        <text class="ml-10rpx mr-10rpx text-30rpx color-#929292">|</text>
        <text class="text-24rpx color-#929292">合计</text>
      </view>
      <view class="text-36rpx fw-bold color-#ff0c00">{{ '￥' + totalAmount || '0' }}</view>
    </view>
    <view v-if="userStore.isLoggedIn()" @click="handleToExchange" class="goods-point-btn">
      <text class="">积分兑换</text>
    </view>
    <view @click="handleToPurchase" class="goods-buy-btn">
      <text class="">立即购买</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.cart-bar {
  height: 100rpx;
  background-color: #fff;
  padding: 0 20rpx;
}

.cart-bar .goods-point-btn {
  margin-right: 10rpx;
  width: 220rpx;
  height: 76rpx;
  border-radius: 38rpx;
  background-color: #ef8106;
  font-size: 30rpx;
  font-weight: bold;
  line-height: 76rpx;
  color: #ffffff;
  text-align: center;
}
.cart-bar .goods-buy-btn {
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
