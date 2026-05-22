<script lang="ts" setup>
import { ref, watch } from "vue";

const value = ref<boolean>(true);

const props = defineProps({
  isAllSelected: {
    type: Boolean,
    default: false,
  },
  totalGoodsNum: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
});

const isDisabled = ref(false);

const emit = defineEmits(["handleSelectAll", "handleToConsignment"]);

const handleSelectAll = () => {
  console.log("handleSelectAll");
  const { isAllSelected } = props;
  emit("handleSelectAll", { isAllSelected });
}

const handleToConsignment = () => {
  console.log('handleToConsignment ----')
  emit("handleToConsignment")
}
</script>

<template>
  <view class="cart-bar">
    <view class="operation pl-2 pr-2 flex items-center justify-between">
      <view class="flex items-center" @click="handleSelectAll">
        <wd-icon
          size="40rpx"
          :color="isAllSelected ? '#FA4126' : '#BBBBBB'"
          :name="isAllSelected ? 'check-circle-filled' : 'circle'"
          class="cart-bar__check"
        />
        <text class="ml-1 cart-bar__total--bold text-padding-right">全选 </text>
      </view>
      <view>
          <text class="text-28rpx color-#ff0c00 fw-bold">合计: {{ '¥' + totalAmount }}</text>
        </view>
        <view @click="handleToConsignment" class="operation-btn">
          <text class="">寄售</text>
        </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>


.cart-bar {
  padding: 0 20rpx;
  height: 100rpx;
  box-sizing: border-box;
  background: #fff;
}
.operation{
  height: 100rpx;
}
.operation-btn{
  text-align: center;
  line-height: 80rpx;
  width: 180rpx;
  height: 80rpx;
  background: #F7E344;
  font-size: 28rpx;
  color: #262626;
  border-radius: 40rpx;
  font-weight: bold;
}
</style>
