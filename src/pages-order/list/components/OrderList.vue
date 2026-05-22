<script setup lang="ts">

import { fetchOrderList } from '@/api/order'
import { onMounted, ref } from 'vue'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

// 定义 porps
const props = defineProps<{
  orderState: number
}>()

// 请求参数
let queryParams = {
  page: 1,
  pageSize: 5,
  status: props.orderState,
}

// 订单列表数据
const orderList = ref<any[]>([])

// 是否加载中标记，用于防止滚动触底触发多次请求
const isLoading = ref(false)

// 获取订单列表
const fetchOrderListHandle = async () => {
  // 如果数据出于加载中，退出函数
  if (isLoading.value) return
  // 退出分页判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据~' })
  }
  // 发送请求前，标记为加载中
  isLoading.value = true


  const params = Object.assign({}, queryParams);
  
  // 为全部订单时，不传 status 参数
  if (props.orderState === -1) {
    delete params.status
  }

  // console.log('params', params)

  // 发送请求
  const res = await fetchOrderList(params)

  // 发送请求后，重置标记
  isLoading.value = false

  // 数组追加
  orderList.value.push(...res.orderList)

  // 分页条件
  if (queryParams.page < res.pagination.lastPage) {
    // 页码累加
    queryParams.page++
  } else {
    // 分页已结束
    isFinish.value = true
  }
}

onMounted(async () => {
  console.log('OrderList onMounted')
  await fetchOrderListHandle()
})

// 是否分页结束
const isFinish = ref(false)
// 是否触发下拉刷新
const isTriggered = ref(false)
// 自定义下拉刷新被触发
const onRefresherrefresh = async () => {
  // 开始动画
  isTriggered.value = true
  // 重置数据
  queryParams.page = 1
  orderList.value = []
  isFinish.value = false
  // 加载数据
  await fetchOrderListHandle()
  // 关闭动画
  isTriggered.value = false
}

const orderStateList = [
  { id: 0, text: '待付款' },
  { id: 1, text: '待发货' },
  { id: 2, text: '待收货' },
  { id: 3, text: '已完成' },
  { id: 4, text: '已取消' },
]

</script>

<template>
  <scroll-view
    enable-back-to-top
    scroll-y
    class="orders"
    refresher-enabled
    :refresher-triggered="isTriggered"
    @refresherrefresh="onRefresherrefresh"
    @scrolltolower="fetchOrderListHandle"
  >
    <view class="card" v-for="order in orderList" :key="order.id">
      <!-- 订单信息 -->
      <view class="status">
        <text class="date">订单时间：{{ order.created_at }}</text>
        <!-- 订单状态文字 -->
        <text :style="{ color: order.status === 0 ? '#FB0A01' : '' }">{{ orderStateList[order.status].text }}</text>
      </view>
      <navigator
        class="product-list"
        v-for="product in order.productList"
        :key="product.id"
        :url="`/pages-order/detail/index?orderNo=${order.orderNo}&orderType=${order.orderType}`"
        hover-class="none"
      >
        <view class="goods flex">
          <view class="thumbnail">
            <wd-img
              width="100%"
              height="100%"
              radius="10"
              :src="product.storePageIcon"
            />
          </view>
          <view class="flex-1 title pt-2 pb-2">{{ product.productName }}</view>
          <view class="text-right">
            <view class="mt-2 font-size-24rpx">{{ product.premium }}</view>
            <view class="mt-24rpx count color-#A1A1A1">{{ 'x' + product.count }}</view>
          </view>
        </view>
      </navigator>
      <view class="payment flex items-baseline justify-end">
        <view class="quantity color-#A1A1A1">共{{ order.productCount }}件</view>
        <text class="ml-2 mr-2 color-#A1A1A1">|</text>
        <view class="amount color-black" v-if="order.orderType === 1 || order.orderType === 2">
          合计：<text class="symbol">¥</text><text class="font-size-36rpx fw-bold">{{ order.totalPrice }}</text>
        </view>
        <view class="amount flex color-black" v-if="order.orderType === 3">
          合计：
          <view class="flex items-center">
            <text class="symbol mr-1">¥</text><text class="font-size-26rpx">{{ order.totalPrice }}</text>
          </view>
          <text class="ml-2 mr-2">+</text>
          <view class="flex items-center">
              <view class="points-icon mr-1"></view>
              <view class="point color-#F2451D font-size-26rpx fw-bold">
                {{ order.totalPoints + '积分' }}
              </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 底部提示文字 -->
    <view class="loading-text" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
      {{ isFinish ? '没有更多数据~' : '正在加载...' }}
    </view>
  </scroll-view>
</template>

<style lang="scss">
// 订单列表
.orders {
  .card {
    min-height: 100rpx;
    padding: 20rpx;
    margin: 20rpx 20rpx 0;
    border-radius: 10rpx;
    background-color: #fff;

    &:last-child {
      padding-bottom: 40rpx;
    }
  }

  .status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 78rpx;
    box-sizing: border-box;
    font-size: 28rpx;
    color: #999;
    margin-bottom: 15rpx;
    padding-bottom: 10rpx;
    border-bottom: 1rpx solid #EDEDED;

    .date {
      color: #030303;
      flex: 1;
    }

    .primary {
      color: #ff9240;
    }

    .icon-delete {
      line-height: 1;
      margin-left: 10rpx;
      padding-left: 10rpx;
      border-left: 1rpx solid #e3e3e3;
    }
  }

  .goods {
    display: flex;
    margin-bottom: 20rpx;

    .thumbnail{
      width: 144rpx;
      height: 144rpx;
    }
    .title {
      margin-left: 20rpx;
      line-height: 32rpx;
      font-size: 24rpx;
      color: #262626;
    }
  }

  .payment {

    .quantity {

    }

    .amount {

    }

    .symbol {
    }
  }

  .action {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: 20rpx;

    .button {
      width: 180rpx;
      height: 60rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: 20rpx;
      border-radius: 60rpx;
      border: 1rpx solid #ccc;
      font-size: 26rpx;
      color: #444;
    }

    .secondary {
      color: #27ba9b;
      border-color: #27ba9b;
    }

    .primary {
      color: #fff;
      background-color: #27ba9b;
      border-color: #27ba9b;
    }
  }

  .loading-text {
    text-align: center;
    font-size: 28rpx;
    color: #666;
    padding: 20rpx 0;
  }
}

.points-icon{
  width: 24rpx;
  height: 24rpx;
  background: url(https://img.niantu.cn/spark-mall/static/points-icon.png) no-repeat 0 0;
  background-size: 100% 100%;
}
</style>
