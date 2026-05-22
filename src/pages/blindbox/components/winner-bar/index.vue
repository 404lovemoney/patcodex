<template>
  <view class="operation-bar">
    <view class="sum"> 总价值：{{ totalPoints }}积分 </view>
    <view class="cart-bar">
      <view
        @click="handleToConsignmentPage"
        :class="`btn go-consignment-btn`"
      >
        <text class="hidden">去交易</text>
      </view>
      <view
        @click="handleToHomePage"
        :class="`btn go-exchange-btn`"
      >
      <text class="hidden">去兑换</text>
      </view>
      <view
        @click="handleToDeliveryPage"
        :class="`btn go-delivery-btn`"
      >
        <text class="hidden">去提货</text>
      </view>
      <view
        @click="handleToBlindBoxPage"
        :class="`btn go-again-btn`"
      >
      <text class="hidden">再来一次</text>
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { ref } from "vue";

const props = defineProps({
  totalPoints: Number,
  bottomHeight: {
    type: Number,
    default: 100
  },
  fixed: Boolean,
});

const isDisabled = ref(false);

const emit = defineEmits(["handleToHomePage", "handleToDeliveryPage", "handleToConsignmentPage", "handleToBlindBoxPage"]);

const handleToConsignmentPage = () => {
  emit("handleToConsignmentPage");
};

const handleToBlindBoxPage = () => {
  emit("handleToBlindBoxPage");
};

const handleToHomePage = () => {
  emit("handleToHomePage");
};

const handleToDeliveryPage = () => {
  emit("handleToDeliveryPage");
};
</script>

<style lang="scss">
.operation-bar{
  // height: 300rpx;
  // background: blue;
}
.sum{
  margin-bottom: 20rpx;
  text-align: center;
  font-size: 38rpx;
  font-weight: bold;
  color: #fff;
}

.cart-bar {
  display: flex;
  flex-wrap: wrap;
  padding: 0rpx 0 0rpx;
  box-sizing: border-box;
  font-size: 24rpx;
  color: #333;
  justify-content: center;
}

.cart-bar .btn{
  margin: 20rpx 20rpx 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 310rpx;
  height: 100rpx;
  background-position: 0 0;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
.go-consignment-btn{
  background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/go-consignment-btn.png);
}
.go-exchange-btn{
  background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/go-exchange-btn.png);
}
.go-delivery-btn{
  background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/go-delivery-btn.png);
}
.go-again-btn{
  background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/go-again-btn.png);
}

</style>
