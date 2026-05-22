<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "我的佣金"
      }
    }
 </route>

<script setup lang="ts">
defineOptions({
  name: 'Commission',
})

import { getCommissionList } from '@/api/auth'
import { formatTime } from '@/utils/util'
// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

// 列表加载中标记 0-否 1-是
const listLoadStatus = ref<number>(0)

// 加载更多 根据state 展示不同的文案
const state = ref<any>('loading')

// 分页数据
const listPagination = reactive({
  page: 1,
  pageSize: 15,
})

onLoad(async () => {
  console.log("onLoad");
  await getCommissionListHandle(true)
})

onMounted(async () => {
  console.log("onMounted");
})

// 滚动到底部加载更多
onReachBottom(() => {
  console.log('onReachBottom')
  if (listLoadStatus.value === 0) {
    getCommissionListHandle()
  }
})

// 记录列表
const recordList = ref<any[]>([
  // {
  //   "id": 6,
  //   "avatar": "",
  //   "nickName": "13999999999",
  //   "commission": "-2763.00",
  //   "level": 1,
  //   "created_at": "2025-09-12T11:44:07.000000Z"
  // },
  // {
  //   "id": 5,
  //   "avatar": "",
  //   "nickName": "13999999999",
  //   "commission": "-250.88",
  //   "level": 1,
  //   "created_at": "2025-09-12T11:44:06.000000Z"
  // },
  // {
  //   "id": 6,
  //   "avatar": "",
  //   "nickName": "13999999999",
  //   "commission": "-2763.00",
  //   "level": 1,
  //   "created_at": "2025-09-12T11:44:07.000000Z"
  // },
  // {
  //   "id": 5,
  //   "avatar": "",
  //   "nickName": "13999999999",
  //   "commission": "-250.88",
  //   "level": 1,
  //   "created_at": "2025-09-12T11:44:06.000000Z"
  // },
  // {
  //   "id": 6,
  //   "avatar": "",
  //   "nickName": "13999999999",
  //   "commission": "-2763.00",
  //   "level": 1,
  //   "created_at": "2025-09-12T11:44:07.000000Z"
  // },
  // {
  //   "id": 5,
  //   "avatar": "",
  //   "nickName": "13999999999",
  //   "commission": "-250.88",
  //   "level": 1,
  //   "created_at": "2025-09-12T11:44:06.000000Z"
  // },
  // {
  //   "id": 6,
  //   "avatar": "",
  //   "nickName": "13999999999",
  //   "commission": "-2763.00",
  //   "level": 1,
  //   "created_at": "2025-09-12T11:44:07.000000Z"
  // },
  // {
  //   "id": 5,
  //   "avatar": "",
  //   "nickName": "13999999999",
  //   "commission": "-250.88",
  //   "level": 1,
  //   "created_at": "2025-09-12T11:44:06.000000Z"
  // },
  // {
  //   "id": 6,
  //   "avatar": "",
  //   "nickName": "13999999999",
  //   "commission": "-2763.00",
  //   "level": 1,
  //   "created_at": "2025-09-12T11:44:07.000000Z"
  // },
  // {
  //   "id": 5,
  //   "avatar": "",
  //   "nickName": "13999999999",
  //   "commission": "-250.88",
  //   "level": 1,
  //   "created_at": "2025-09-12T11:44:06.000000Z"
  // }
])

// 重试
const onReTry = () => {
  getCommissionListHandle()
}

// 获取佣金数据
const getCommissionListHandle = async (fresh = false) => {
  if (fresh) {
    listPagination.page = 1
    uni.pageScrollTo({
      scrollTop: 0,
    })
  }

  listLoadStatus.value = 1

  try {
    const res = await getCommissionList({
      // userId: 1
      page: listPagination.page,
      pageSize: listPagination.pageSize,
    })

    if (fresh) {
      recordList.value = res.commissionList
    }
    else {
      recordList.value = recordList.value.concat(res.commissionList)
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
    listLoadStatus.value = 3
    uni.showToast({
      title: error.message || '出错了，请重试',
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
      :title="'我的佣金'"
      page-name="commission"
      :show-icon="true"
      :color="'#fff'"
    >
    </custom-nav-bar>

    <view class="header">
      <view class="flex title">
        <view class="label">累计佣金：</view>
        <view class="num">{{ userStore.userInfo.totalCommission }}</view>
      </view>
    </view>

    <view class="content" v-if="recordList.length">
      <!-- 内容{{ index }} -->
      <view class="record-item" v-for="item in recordList" :key="item.id">
          <view class="time">
            {{ formatTime(item.created_at, 'YYYY-MM-DD HH:mm:ss') }}
          </view>
          <view class="record-intro">
            <view class="intro">来自二级成员: {{ item.nickName }}消费获得</view>
            <view class="price">{{ item.commission }}</view>
          </view>
      </view>
    </view>

    <!-- state 为 error 加载错误时，点击文案触发 reload 事件 -->
    <wd-loadmore :state="state" @reload="onReTry" />
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
  .label {
    font-size: 36rpx;
  }
  .num{
    font-size: 38rpx;
    font-weight: bold;
  }
}

.content{
  margin: 10rpx;
}

.record-item{
  background: #fff;
  margin-bottom: 5px;
  padding: 5px;
  font-size: 16px;
  
}
.record-intro {
  font-size: 14px;
  margin: 10px 10px;
  display: flex;
  justify-content: space-between;
}
.time{
  padding: 5px 10px;
  border-bottom: 1px solid #ccc;
}

.price{
  color: #27BCAF;
  font-weight: bold;
  font-size: 28rpx;
}

</style>
