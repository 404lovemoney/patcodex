<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationBarTitleText": "寄售专区",
        "navigationStyle": "custom"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'ConsignMent',
})

import {
  fetchConsignmentList,
  fetchMyConsignmentList,
} from '@/api/boxInfo';
import { formatTime } from '@/utils/util'
// import { orderPay } from '@/api/payment';

import { useUserStore } from '@/store'

// pinia
const userStore = useUserStore()

import customNavBar from "@/components/custom-nav-bar/custom-nav-bar.vue";

const consignmentItemStatus = {
  0: '寄售中',
  1: '已出售',
  2: '已取消'
}

// 寄售专区 发布中列表
const consignmentList = ref<any[]>([])
// 寄售专区 我发布的
const myConsignmentList = ref<any[]>([])
// 当前列表项 0-默认 1-我发布的
const listTabIndex = ref<Number>(0)

onLoad(async () => {
  console.log("onLoad");
  init()
})

onMounted(async () => {
  console.log("onMounted");
})

onShow(() => {
  console.log("onShow");
  init()
})

// 初始化，请求列表
const init = async ()=> {
  await Promise.all([  
    fetchConsignmentListHandle(true),
    fetchMyConsignmentListHandle(true),
  ])
  // await fetchConsignmentListHandle(true)
}

// scroll-view 竖向滚动条位置
const scrollTop = ref(1)

// 切换列表
const switchTabHandle = async (idx) => {
  listTabIndex.value = idx

  // 页码重置
  listPagination.page = 1

  // 滚动条重置
  scrollTop.value = 0
  // 踩坑：uni-app 中 scroll-view 的 scrollTop 属性只有在变化时才会触发滚动
  const _delay = setTimeout(() => {
      // 重置滚动量
      scrollTop.value = 1
      clearTimeout(_delay)
  }, 10)

  // 列表状态加载状态重置
  listLoadStatus.value = 0

  // 获取当前选项
  console.log(listTabIndex.value)
  switch (listTabIndex.value) {
    case 0:
      console.log("发布中");
      await fetchConsignmentListHandle(true)
      break;
    case 1:
      await fetchMyConsignmentListHandle(true)
      console.log("我发布的");
      break;
    default:
      console.log(`${listTabIndex.value}`);
  }
}

// 列表加载中标记 0-否 1-是
const listLoadStatus = ref<number>(0)

// 加载更多 根据state 展示不同的文案
const state = ref<any>('loading')

// 分页数据
const listPagination = reactive({
  page: 1,
  pageSize: 10,
})

// 滚动触底
const onScrolltolower = async () => {
  // 获取当前选项
  console.log(listTabIndex.value)
  if (listLoadStatus.value === 0) {
    switch (listTabIndex.value) {
      case 0:
        console.log("发布中");
        await fetchConsignmentListHandle()
        break;
      case 1:
        await fetchMyConsignmentListHandle()
        console.log("我发布的");
        break;
      default:
        console.log(`${listTabIndex.value}`);
    }
  }
}

// 加载寄售中列表
const fetchConsignmentListHandle = async (fresh = false) => {
  if (fresh) {
    listPagination.page = 1
  }

  listLoadStatus.value = 1

  try {
    // 调用API
    const res = await fetchConsignmentList({
      page: listPagination.page,
      pageSize: listPagination.pageSize
    })
  
    if (fresh) {
      consignmentList.value = res.productList
    }
    else {
      consignmentList.value = consignmentList.value.concat(res.productList)
    }

    listLoadStatus.value = 0

    listPagination.page = res.pagination.currentPage
    listPagination.pageSize = res.pagination.pageSize

    // 总页数
    const totalPages = res.pagination.lastPage
    console.log('totalPages', totalPages)
    
    // 最后一页处理 
    if (listPagination.page === totalPages) {
      listLoadStatus.value = 1
      state.value = "finished"
    } else {
      listLoadStatus.value = 0
      listPagination.page++
    }

  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

// 加载我发布的列表
const fetchMyConsignmentListHandle = async (fresh = false) => {
  if (fresh) {
    listPagination.page = 1
  }
  try {
    // 调用API
    const res = await fetchMyConsignmentList({
      status: 0, // 寄售状态 0 发售中 1 已出售 2 全部
      page: listPagination.page,
      pageSize: listPagination.pageSize
    })

    if (fresh) {
      myConsignmentList.value = res.productList
    }
    else {
      myConsignmentList.value = myConsignmentList.value.concat(res.productList)
    }

    listLoadStatus.value = 0

    listPagination.page = res.pagination.currentPage
    listPagination.pageSize = res.pagination.pageSize

    // 总页数
    const totalPages = res.pagination.lastPage
    console.log('totalPages', totalPages)
    
    // 最后一页处理 
    if (listPagination.page === totalPages) {
      listLoadStatus.value = 1
      state.value = "finished"
    } else {
      listLoadStatus.value = 0
      listPagination.page++
    }

  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

// 物品详情页
const goDetailHandle = (id) => {
  uni.navigateTo({
    url: `/pages-consignment/detail/index?id=${id}`,
  })
}

// 前往发布页
const onToSellHandle = (id) => {
  uni.navigateTo({
    url: `/pages-consignment/create/index`,
  })
}

// 去登录
const toLoginHandle = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  })
}

</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题蓝 -->
    <custom-nav-bar
      title="寄售专区"
      page-name="consignment"
      :show-icon="true"
      :color="'#fff'"
    >
    </custom-nav-bar>
    <template v-if="userStore.isLoggedIn()">
      <view class="tabs">
        <text :class="[listTabIndex === 0 ? 'current-item' : '']" @click="switchTabHandle(0)">发布中</text>
        <text class="ml-3 mr-3">|</text> 
        <text :class="[listTabIndex === 1 ? 'current-item' : '']" @click="switchTabHandle(1)">我发布的</text>
      </view>

      <scroll-view 
        class="scroll-view"
        scroll-y
        enable-back-to-top
        :scroll-top="scrollTop"
        @scrolltolower="onScrolltolower"
      >
        <view class="consignment-list" v-if="listTabIndex === 0">
          <view class="consignment-item" v-for="item in consignmentList" :key="item.id"  @click="goDetailHandle(item.id)">
            <view class="status-badge">{{ consignmentItemStatus[item.status] }}</view>
            <view class="type flex items-center">
              <text class="author mr-2">普通寄售</text>
              <view class="type-icon"></view>
            </view>
            
            <view class="flex items-center">
              <view class="thumbnail">
                <wd-img
                  width="90%"
                  height="90%"
                  :mode="'heightFix'"
                  :src="item.storePageIcon"
                />
              </view>
              <view class="title pb-2">{{ item.productName }}</view>
            </view>

            <view class="consignment-main">
              <view class="price">
                <wd-text :text="'¥' + item.consignPrice" size="28rpx" color="#F20901" bold></wd-text>
              </view>
              <view class="flex justify-between">
                <view class="flex items-center">
                  <view class="author-avatar">
                    <wd-img :src="userStore.userInfo.avatar" round width="40rpx" height="40rpx"></wd-img>
                  </view>
                  <text class="author ml-2">{{ item.nickName }}</text>
                </view>
                <text class="time">{{ formatTime(item.created_at, 'YYYY-MM-DD HH:mm:ss') }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="consignment-list" v-if="listTabIndex === 1">
          <view class="consignment-item" v-for="item in myConsignmentList" :key="item.id" @click="goDetailHandle(item.id)">
            <view class="status-badge">{{ consignmentItemStatus[item.status] }}</view>
            <view class="type flex items-center">
              <text class="author mr-2">普通寄售</text>
              <view class="type-icon"></view>
            </view>
            <view class="flex items-center">
              <view class="thumbnail">
                <wd-img
                  width="90%"
                  height="90%"
                  :mode="'heightFix'"
                  :src="item.storePageIcon"
                />
              </view>
              <view class="title pb-2">{{ item.productName }}</view>
            </view>

            <view class="consignment-main">
              <view class="price">
                <wd-text :text="'¥' + item.consignPrice" size="28rpx" color="#F20901" bold></wd-text>
              </view>
              <view class="flex justify-between">
                <view class="flex items-center">
                  <view class="author-avatar">
                    <wd-img :src="userStore.userInfo.avatar" round width="40rpx" height="40rpx"></wd-img>
                  </view>
                  <text class="author ml-2">{{ item.nickName }}</text>
                </view>
                <text class="time">{{ formatTime(item.created_at, 'YYYY-MM-DD HH:mm:ss') }}</text>
              </view>
            </view>
          </view>
        </view>
        <!-- state 为 error 加载错误时，点击文案触发 reload 事件 -->
        <wd-loadmore :state="state" />
      </scroll-view>

      <footer-tool-bar :safe-area-inset-bottom="true">
        <view class="flex justify-center items-center h-100rpx bg-[#EDEDED]">
          <view @click="onToSellHandle" class="operation-btn">
            <text class="">发起交易</text>
          </view>
        </view>
      </footer-tool-bar>
    </template>
    <template v-else>
      <view class="pt-30 no-login-info">
        <view class="no-login-default"></view>
        <view class="tips text-align-center mb-10">登录后才可以查看信息哦</view>
        <view class="text-align-center">
          <wd-button @click="toLoginHandle">去登录</wd-button>
        </view>
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.wrapper {
  background: #ededed;
  height: calc(100vh - var(--window-top) - var(--window-bottom));
  display: flex;
  flex-direction: column;
}
.no-login-default{
  margin: 0 auto;
  width: 396px;
  height: 246px;
  background: url(https://img.niantu.cn/spark-mall/static/no-login.png) no-repeat center center;
  background-size: 100% 100%;
}
.scroll-view{
  flex: 1;
  overflow: scroll;
}
.tabs{
  width: 100%;
  padding: 20rpx 36rpx 0;
  height: 60rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #7A7A7A;
  background: #fff;
  .current-item{
    color: #000000;
  }
}
.consignment-list{
  padding: 16rpx;
}
.consignment-item {
  position: relative;
  height: 250rpx;
  font-size: 14px;
  margin: 10px 0;
  padding: 18rpx 18rpx 18rpx 26rpx;
  background: #fff;
  border-radius: 10px;
  .status-badge{
    position: absolute;
    top: 0;
    right: 0;
    width: 112rpx;
    height: 22rpx;
    line-height: 22rpx;
    text-align: center;
    color: #000000;
    background: url(https://img.niantu.cn/spark-mall/static/consignment/status-badge.png) no-repeat 0 0;
    background-size: 100%;
    font-size: 18rpx;
  }
  .type{
    position: absolute;
    top: 144rpx;
    right: 20rpx;
    color: #ABABAB;
    .type-icon{
      width: 46rpx;
      height: 46rpx;
      background: url(https://img.niantu.cn/spark-mall/static/consignment/type-icon.png) no-repeat 0 0;
      background-size: 100%;
    }
  }
}
.thumbnail{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 98rpx;
  height: 98rpx;
  background: #f8f8f8;
}
.title {
  margin-left: 20rpx;
  font-size: 32rpx;
  font-weight: bold;
}
.consignment-main {
  flex: 1;
  margin-left: 10px;
  .price{
    margin: 16rpx 0;
    color: #f00;
    font-weight: bold;
  }
  .author-avatar{
    width: 40rpx;
    height: 40rpx;
    background: #BFBFBF;
    border-radius: 50%;
  }
  .author{
    color: #202020;
  }
  .time{
    color: #ABABAB;
  }
}
.operation-btn{
  text-align: center;
  line-height: 60rpx;
  width: 380rpx;
  height: 60rpx;
  background: #F0A637;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  border-radius: 30rpx;
  font-weight: bold;
}
</style>
