<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "我的订单"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'OrderList',
})

import OrderList from './components/OrderList.vue'
import { useUserStore } from '@/store';

onLoad(async (options) => {
  console.log("onLoad");
  // 获取路由参数
  // console.log('options data', options.type);
  if (options.type) {
    type.value = options.type
    // await fetchNoticeDetailHandle()
    console.log('orderTabs.value', orderTabs.value)
    console.log('orderTabs.type', type.value)
    console.log('activeIndex', activeIndex.value)
  } else {
    type.value = -1
  }
  activeIndex.value = orderTabs.value.findIndex((v) => v.orderState === Number(type.value))
})

onMounted(async () => {
  console.log("onMounted");
// 默认渲染容器
  orderTabs.value[activeIndex.value].isRender = true
})

onShow(() => {
  console.log("onShow");
})

// tabs 数据
const orderTabs = ref([
  { orderState: -1, title: '全部', isRender: false },
  { orderState: 0, title: '待付款', isRender: false },
  { orderState: 1, title: '待发货', isRender: false },
  { orderState: 2, title: '待收货', isRender: false },
  { orderState: 3, title: '已完成', isRender: false },
])

// 高亮下标
const activeIndex = ref(0)

// 订单 type
const type = ref(0)

// 返回
const goBackHandle = (() => {
  uni.navigateBack()
})

</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="'我的订单'"
      page-name="orderList"
      :show-icon="true"
    >
    </custom-nav-bar>
    <!-- tabs -->
    <view class="tabs">
      <text
        class="item"
        v-for="(item, index) in orderTabs"
        :key="item.title"
        @click="
          () => {
            activeIndex = index
            item.isRender = true
          }
        "
      >
        {{ item.title }}
      </text>
      <!-- 游标 -->
      <view class="cursor" :style="{ left: activeIndex * 20 + '%' }"></view>
    </view>
    <!-- 滑动容器 -->
    <swiper class="swiper" :current="activeIndex" @change="activeIndex = $event.detail.current">
      <!-- 滑动项 -->
      <swiper-item v-for="item in orderTabs" :key="item.title">
        <!-- 订单列表 -->
         <!-- {{ item.orderState }} -->
        <OrderList v-if="item.isRender" :order-state="item.orderState" />
      </swiper-item>
    </swiper>
  </view>
</template>

<style lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  // 计算页面视口最大高度
  height: calc(100vh - var(--window-top) - var(--window-bottom));
  position: relative;
  background: #E6E6E6;
}

// tabs
.tabs {
  display: flex;
  justify-content: space-around;
  line-height: 60rpx;
  margin: 0 10rpx;
  background-color: #E6E6E6;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);
  position: relative;
  z-index: 9;

  .item {
    flex: 1;
    text-align: center;
    padding: 20rpx;
    font-size: 28rpx;
    color: #262626;
  }

  .cursor {
    position: absolute;
    box-sizing: border-box;
    left: 0;
    bottom: 0;
    width: 20%;
    height: 6rpx;
    margin: 0 auto;
    // padding: 0 50rpx;
    background-color: #27BAAD;
    /* 过渡效果 */
    transition: all 0.4s;
  }
}

// swiper
.swiper {
  background-color: #f7f7f8;
}
</style>
