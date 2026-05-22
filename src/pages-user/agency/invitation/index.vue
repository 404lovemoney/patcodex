<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "我的推广"
      }
    }
 </route>

<script setup lang="ts">
defineOptions({
  name: 'Invitation',
})
import { getDateStats } from '@/api/auth'

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

const totalCount = ref<number>(0);

// 列表加载中标记 0-否 1-是
const listLoadStatus = ref<number>(0)

// 加载更多 根据state 展示不同的文案
const state = ref<any>('loading')

onLoad(async () => {
  console.log("onLoad");
  await getDateStatsHandle()
})

// 注册一个回调函数，在组件挂载完成后执行。
onMounted(async () => {
  console.log("onMounted");
})

// 滚动到底部加载更多
// onReachBottom(() => {
//   if (listLoadStatus.value === 0) {
//     loadList()
//   }
// })

// 记录列表
const recordList = ref<any[]>([
])

// 点击事件
const handleTabClick = async (event) => {
  console.log('click', event.index)
  // await getUserPointsChangeListHandle(event.index)
}

// 获取用户积分信息  1收入 2支出  默认返回全部
const getDateStatsHandle = async () => {
  try {
    const response = await getDateStats({
    // userId: 1
    })
    console.log('getDateStatsList', response);
    recordList.value = response.dataList
    totalCount.value = response.totalInvitCount
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="'我的推广'"
      page-name="invitation"
      :show-icon="true"
      :color="'#fff'"
    >
    </custom-nav-bar>

    <view class="header">
      <view class="flex title">
        <view class="label">邀请成功：</view>
        <view class="num">{{ totalCount + '人' }}</view>
      </view>
      <view class="region">仅显示最近一个月数据源</view>
    </view>

    <view class="content">
      <view class="item-label">
        <view class="date">日期</view>
        <view class="date">有效用户</view>
        <view class="date">充值额</view>
      </view>
      <view class="invitation-list">
        <view class="invitation-item" v-for="item in recordList" :key="item.id">
            <view class="date">
              {{ item.date }}
            </view>
            <view class="intro">{{ item.invitCount }}</view>
            <view class="price">{{ item.totalCash  }}</view>
        </view>
      </view>

      <!-- <wd-loadmore state="finished" /> -->
    </view>
  </view>
</template>

<style lang="scss" scoped>
.wrapper {
  background: #E6E6E6;
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  box-sizing: border-box;
  padding-top: 10rpx;
}

.header{
  margin: 0 10rpx 10rpx;
  height: 200rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  color: #000;
  padding-left: 20px;
  .title {
    font-size: 36rpx;
  }
  .num{
    font-weight: bold;
  }
  .region{
    margin-top: 36rpx;
    color: #C6C6C6;
    font-size: 22rpx;
  }
}
.content{
  margin: 10rpx;
  .item-label{
    display: grid;
    height: 66rpx;
    justify-content: space-between;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 0rpx; 
    & > view{
      text-align: center;
      font-weight: bold;
      font-size: 32rpx;
      color: #262626;
    }
  }
}
.invitation-list{
  padding: 20rpx 0;
  background: #fff;
  height: 500rpx;
}
.invitation-item{
  display: grid;
  justify-content: space-between;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 0rpx; 
  height: 66rpx;
  & > view{
    text-align: center;
    font-size: 22rpx;
    color: #262626;
  }
}
.intro {
  font-size: 14px;
}
.date{
}
.price{
  color: #27BCAF;
  font-weight: bold;
  font-size: 28rpx;
}

</style>
