<template>
  <view class="cart-bar__placeholder" v-if="fixed" />
  <view
    :class="[
      'cart-bar',
      fixed ? 'cart-bar--fixed' : '',
    ]"
  >
    <view class="operation pl-2 pr-2 flex items-center">
        <view class="cart-bar__total flex1">
          <!-- <wd-checkbox v-model="value" ></wd-checkbox> -->
          <view class="flex items-center">
            <wd-icon
              size="40rpx"
              :color="isAllSelected ? '#FA4126' : '#BBBBBB'"
              :name="isAllSelected ? 'check-circle-filled' : 'circle'"
              class="cart-bar__check"
              @click="handleSelectAll"
            />
            <text class="ml-1 cart-bar__total--bold text-padding-right"
              >已选{{ totalGoodsNum }}件 | 合计</text
            >
          </view>
          <view>
            <text class="cart-bar__total--bold cart-bar__total--price"
              >{{ totalAmount }}积分</text
            >
          </view>
        </view>
      <view
        @click="handleToDismantle"
        :class="`${!isDisabled ? '' : 'disabled-btn'} dismantle-btn`"
        hover-class="{{!isDisabled ? '' : 'hover-btn'}}"
      >
        <text class="hidden">分解</text>
      </view>
    </view>
  </view>
</template>
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
  bottomHeight: {
    type: Number,
    default: 100,
  },
  fixed: Boolean,
});

const isDisabled = ref(false);

const emit = defineEmits(["handleSelectAll", "handleToDismantle"]);

const handleSelectAll = () => {
  console.log("handleSelectAll");
  const { isAllSelected } = props;
  emit("handleSelectAll", { isAllSelected });
};

const handleToDismantle = () => {
  if (isDisabled.value) return;
  emit("handleToDismantle");
};
</script>
<style lang="scss" scoped>
.cart-bar__placeholder {
  height: 100rpx;
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
  bottom: 0;
}

.cart-bar {
  padding: 6rpx 0;
  height: 112rpx;
  box-sizing: border-box;
  background: #fff;
}
.operation{
  height: 100rpx;
}
.cart-bar .fragment-btn,
.cart-bar .dismantle-btn {
  margin: 0 auto;
  width: 196rpx;
  height: 82rpx;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: 0 0;
}
.cart-bar .dismantle-btn{
  background-image: url(https://img.niantu.cn/spark-mall/static/box/dismantle-list-btn.png);
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
  color: #fa4126;
  font-weight: bold;
  font-size: 36rpx;
}

.text-padding-right {
  padding-right: 4rpx;
}
</style>
