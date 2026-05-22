<template>
  <view :class="['operation-bar']">
    <view class="check_tips pt-2 mb-2 text-center">
      <wd-icon name="check-circle-filled" size="18px" color="#4D5F95"></wd-icon>
      <text>我已满18岁，阅读并同意</text>
      <text>《支付协议》</text>
    </view>
    <view class="cart-bar flex">
      <view class="cart-bar__total flex1">
        <view class="flex pt-3">
          <view>
            <text class="cart-bar__total--bold text-padding-right">已选{{ totalGoodsNum }}件 | 合计</text>
          </view>
          <view>
            <text class="cart-bar__total--bold cart-bar__total--price">{{ '￥' + totalAmount }}</text>
          </view>
        </view>
      </view>
      <view @click="handleToSettle" class="submit-btn">
        <text class="hidden">提交订单</text>
      </view>
    </view>
  </view>
</template>

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
  bottomHeight: {
    type: Number,
    default: 100
  },
  fixed: Boolean
})

const emit = defineEmits(['handleToSettle'])

const handleToSettle = () => {
  emit('handleToSettle')
}
</script>

<style lang="scss" scoped>
.operation-bar__placeholder {
  height: 100rpx;
}
.operation-bar--fixed {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 99;
  bottom: 0;
  background: #fff;
}
.flex {
  display: flex;
}
.flex-v-center {
  align-items: center;
}
.flex1 {
  flex: 1;
}
.algin-bottom {
  text-align: end;
}
.cart-bar--fixed {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 99;
  bottom: 0;
}

.cart-bar {
  height: 112rpx;
  background-color: #fff;
  border-top: 1rpx solid #e5e5e5;
  padding: 16rpx 32rpx;
  box-sizing: border-box;
  font-size: 24rpx;
  line-height: 36rpx;
  color: #333;
}

.cart-bar .cart-bar__check {
  margin-right: 12rpx;
}

.cart-bar .cart-bar__total {
  margin-left: 24rpx;
}

.cart-bar .submit-btn {
  margin: 0 auto;
  width: 196rpx;
  height: 82rpx;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: 0 0;
}
.cart-bar .submit-btn{
  background-image: url(https://img.niantu.cn/spark-mall/static/box/delivery-submit-btn.png);
}
.cart-bar .disabled-btn {
  background-color: #cccccc !important;
}
.cart-bar .hover-btn {
  opacity: 0.5;
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
