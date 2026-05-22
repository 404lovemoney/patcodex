<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "订单"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'OrderResult',
})

import { useUserStore } from '@/store';

onLoad(async (options) => {
  console.log("onLoad");
  // 获取路由参数
  console.log('options data', options);

  if (options.orderNo) {
    orderNo.value = options.orderNo
    // 把字符串的‘false‘和‘true‘转换成Boolean布尔值的false和true
    isPaySuccess.value = JSON.parse(options.isPaySuccess) 
  } else {
    uni.showToast({
      title: '订单不存在',
      icon: 'error'
    })
    // uni.navigateBack()
  }
})

onMounted(async () => {
  console.log("onMounted");
})

onShow(() => {
  console.log("onShow");
})

const userStore = useUserStore()

// 订单号
const orderNo = ref('')

// 订单支付结果
const isPaySuccess = ref(false)

// 查看订单
const viewOrderDetail = () => {
  uni.redirectTo({
    url: `/pages-order/detail/index?orderNo=${orderNo.value}`,
    success(res) {
      console.log('跳转成功')
    }
  })
}

// 跳转到首页
const goToHomePage = () => {
  // switchTab 必须写完整路径
  uni.switchTab({
    url: '/pages/home/home',
    success(res) {
    }
  })
}
</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="'订单'"
      page-name="orderResult"
      :show-icon="true"
    >
    </custom-nav-bar>
    <view class="mt-6rpx order-status">
      <text>订单支付{{ isPaySuccess ? '成功' : '失败' }}</text>
    </view>
      <!-- 订单状态 0 未支付 1待发货 2 已发货 3 已完成  4 已取消 -->
      <view class="operation-bar">
        <view class="flex justify-center">
          <view class="btn" @click="viewOrderDetail">查看订单</view>
          <view class="btn" @click="goToHomePage">返回主页</view>
        </view>
      </view>
  </view>
</template>

<style lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  // 计算页面视口最大高度
  height: calc(100vh - var(--window-top) - var(--window-bottom));
  position: relative;
  background: #fff;
}
.order-status{
  padding: 100rpx 0 0;
  text-align: center;
  font-size: 38rpx;
  color: #090909;
}
.operation-bar{
  margin-top: 70px;
  align-items: center;
  height: 100rpx;
  background: #fff;
  padding: 0 30rpx;
  .btn{
    margin: 0 30rpx;
    width: 190rpx;
    height: 82rpx;
    line-height: 80rpx;
    text-align: center;
    color: #141414;
    font-size: 34rpx;
    border-radius: 10rpx;
    color: #333;
    border: 1rpx solid #141414;
  }
}

</style>
