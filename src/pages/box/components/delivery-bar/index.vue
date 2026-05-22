<template>
  <view class="operation-bar">
    <view class="tips text-center">
      <wd-text
        text="一次性提货满5件免运费"
        color="#fff"
      ></wd-text>
    </view>
    <view class="cart-bar flex items-center justify-between">
      <view class="flex-1 flex items-center">
        <wd-icon
          size="40rpx"
          :color="isAllSelected ? '#FA4126' : '#BBBBBB'"
          :name="isAllSelected ? 'check-circle-filled' : 'circle'"
          class="cart-bar__check"
          @click="handleSelectAll"
        />
        <text class="ml-1 cart-bar__total--bold text-padding-right"
          >已选{{ totalGoodsNum }}件</text
        >
      </view>
      <view
        @click="handleToDeliveryOrder"
        class="send-btn"
      >
        <text class="hidden">立即提货</text>
      </view>
    </view>
  </view>
  <wd-toast selector="myToast" />
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";

const props = defineProps({
  isAllSelected: {
    type: Boolean,
    default: false,
  },
  totalGoodsNum: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
});

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


const emit = defineEmits(["onDeliverySelectAll", "handleToDeliveryOrder"]);

const handleSelectAll = () => {
  console.log("handleSelectAll");
  const { isAllSelected } = props;
  emit("onDeliverySelectAll", { isAllSelected });
};

const handleToDeliveryOrder = () => {
  // 当isDisabled为true时，提货按钮将被禁用。
  console.log('isDisabled', isDisabled.value)
  if (isDisabled.value) {
    // showToast('请选择商品')
    uni.showToast({
      icon:'none',
      title: '请选择提货商品',
      duration: 2000
    })
    return
  }
  emit("handleToDeliveryOrder")
};
</script>
<style lang="scss" scoped>
.operation-bar {
  height: 160rpx;
  background: #000;
}

.cart-bar {
  height: 90rpx;
  padding: 0rpx 20rpx;
  box-sizing: border-box;
  background: #fff;
  font-size: 24rpx;
  color: #333;
}

.cart-bar .send-btn {
  margin: 0 auto;
  width: 196rpx;
  height: 82rpx;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: 0 0;
}
.cart-bar .send-btn {
  background-image: url(https://img.niantu.cn/spark-mall/static/box/delivery-list-btn.png);
}

.tips {
  height: 70rpx;
  padding: 0 20rpx;
  line-height: 70rpx;
  background-color: #24ab97;
}
</style>
