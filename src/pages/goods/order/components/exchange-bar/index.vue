
<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps({
  totalGoodsNum: {
    type: Number,
    default: 0
  },
  totalShippingFee:{
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

const emit = defineEmits(['handleToSettle'])

const handleToSettle = () => {
  if (isDisabled.value) return
  emit('handleToSettle')
}
</script>

<template>
  <view class="operation-bar">
    <view v-if="false" class="check_tips mb-5 text-center">
      <wd-icon name="check-circle-filled" size="18px" color="#4D5F95"></wd-icon>
      <text>我已满18岁，阅读并同意</text>
      <text>《支付协议》</text>
    </view>
    <view class="cart-bar flex justify-end items-center">
      <view class="shipping-fee mr-2 flex items-center">
        <text class="label">运费：</text>
        <text class="price">{{ '￥' + totalShippingFee }}</text></view>
      <view @click="handleToSettle" class="goods-submit-btn">
        <view class="hidden">提交订单</view>
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
  font-size: 24rpx;
  color: #333;
}

.shipping-fee{
  .label{
    font-size: 26rpx;
    color: #A6A6A6;
  }
  .price{
    font-size: 36rpx;
    font-weight: bold;
    color: #F14C24;
  }
}

.cart-bar .goods-submit-btn {
  width: 196rpx;
  height: 82rpx;
  background-color: #B3A705;
  background: url(https://img.niantu.cn/spark-mall/static/goods_submit_btn.png) no-repeat 0 0;
  background-size: 100% 100%;
}

.cart-bar__total .cart-bar__total--bold {
  font-size: 28rpx;
  line-height: 40rpx;
  color: #333;
  font-weight: bold;
}
.cart-bar__total .cart-bar__total--normal {
  font-size: 24rpx;
  line-height: 32rpx;
  color: #999;
}

.cart-bar__total .cart-bar__total--price {
  color: #F24600;
  font-weight: bold;
  font-size: 36rpx;
}

.text-padding-right {
  padding-right: 4rpx;
}
</style>
