<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "提现记录"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'withDrawalList',
})
import { getWithdrawalList } from '@/api/auth'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

const itemStatus = {
  0: '审核中',
  1: '打款中',
  2: '提现完成',
  3: '已驳回'
}

// 注册一个回调函数，在组件挂载完成后执行。
onMounted(async () => {
  // 拉取用户信息
  await userStore.getUserInfo()
  await loadList(true)
})

// 计算时间差
const timeDifference = (currentTime) => {
  const diff = dayjs().diff(currentTime)

  const days = dayjs.duration(diff).days()
  const hours = dayjs.duration(diff).hours()
  const minutes = dayjs.duration(diff).minutes()

  return `${days}天${hours}小时${minutes}分钟`
}

// 余额记录列表
const recordList = ref<any[]>([])

// scroll-view 竖向滚动条位置
const scrollTop = ref(1)

// 列表加载中标记 0-否 1-是
const listLoadStatus = ref<number>(0)

// 加载更多 根据state 展示不同的文案
const state = ref<any>('loading')

// 分页数据
const listPagination = reactive({
  page: 1,
  pageSize: 10,
})

// 重试
const onReTry = (fresh = true) => {

  loadList()
}

// 滚动触底
const onScrolltolower = async () => {
  if (listLoadStatus.value === 0) {
    loadList()
  }
}

/** 加载列表 */
async function loadList(fresh = false) {

  listLoadStatus.value = 1

  if (fresh) {
    listPagination.page = 1
  }

  try {
    const res = await getWithdrawalList({
      page: listPagination.page,
      pageSize: listPagination.pageSize
    })
    if (fresh) {
      recordList.value = res.recordList
    }
    else {
      recordList.value = recordList.value.concat(res.recordList)
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
  }
  catch (err) {
    listLoadStatus.value = 3
  }
}

// 去首页
const toHomeHandle = () => {
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/home/home',
      success(res) {
        console.log('跳转成功')
      }
    })
  }, 300)
}
</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="'提现记录'"
      page-name="withdrawalList"
      :show-icon="true"
      :bg-color="'#fff'"
    >
    </custom-nav-bar>
    <scroll-view 
      scroll-y 
      class="content"
      enable-back-to-top
      :scroll-top="scrollTop"
      @scrolltolower="onScrolltolower"
    >
      <view class="record-item" v-for="item in recordList" :key="item.id">
          <view class="title flex justify-between items-center">
            <view class="fw-bold font-size-28rpx">
              <text :class="'status-' + item.status">
                {{ itemStatus[item.status] }}
                
              </text>
              <text :class="'status-' + item.status" v-if="item.status === 0 || item.status === 1">
                {{ '(' + timeDifference(item.created_at) + ')' }}
              </text>
            </view>
              <view class="time">
              {{ item.created_at }}
            </view>
          </view>
          <view class="record-intro flex justify-between items-center">
            <view class="intro">
              <view class="mb-16rpx">收款人姓名：{{ item.realName }}</view>
              <view class="">收款类型：{{ item.payType === 1 ? '支付宝' : '其他' }}</view>
            </view>
            <view class="price">提现金额：{{ item.amount  }}</view>
          </view>
      </view>

      <!-- state 为 error 加载错误时，点击文案触发 reload 事件 -->
      <wd-loadmore :state="state" @reload="onReTry" />
    </scroll-view>

  </view>
</template>

<style lang="scss" scoped>
.wrapper {
  background: #E6E6E6;
  display: flex;
  flex-direction: column;
  // 计算页面视口最大高度
  height: calc(100vh - var(--window-top) - var(--window-bottom));
}
.content{
  flex: 1;
  box-sizing: border-box;
  padding-top: 10rpx;
}

.record-item{
  background: #fff;
  margin-bottom: 4rpx;
  padding: 0 30rpx;
  font-size: 24rpx;
}
.record-intro{
  padding: 0 8rpx;
  height: 110rpx;
}
.title {
  height: 60rpx;
  border-bottom: 1px solid #ccc;
  .status-0{
    color: #FB1214
  }
  .status-1{
    color: #17B4FF
  }
  .status-2{
    color: #7BE000
  }
  .status-3{
    color: #000000
  }
}
.time{
  padding: 5px 10px;
}
.price{
  color: #27BCAF;
  font-weight: bold;
  font-size: 28rpx;
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
