<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "余额"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'Points',
})
import { getUserBalanceChangeList } from '@/api/auth'

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

const tab = ref<number>(0);
const value = ref<boolean>(true)

// 注册一个回调函数，在组件挂载完成后执行。
onMounted(async () => {
  // 拉取用户信息
  await userStore.getUserInfo()
  await loadList(true)
})

// 余额记录列表
const recordList = ref<any[]>([])

const tabList = [
  {
    label: "全部",
  },
  {
    label: "收入",
  },
  {
    label: "支出",
  }
];

// 点击事件
const handleTabClick = async (event) => {
  console.log('click', event.index)
  tabIndex.value = event.index
  // 滚动条重置
  scrollTop.value = 0
  // 踩坑：uni-app 中 scroll-view 的 scrollTop 属性只有在变化时才会触发滚动
  const _delay = setTimeout(() => {
      // 重置滚动量
      scrollTop.value = 1
      clearTimeout(_delay)
  }, 10)
  await loadList(true)
}

// 当前选中项标识
const tabIndex = ref(0)

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
  // 获取当前选项
  console.log(tabIndex.value)
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
    const res = await getUserBalanceChangeList({
      page: listPagination.page,
      pageSize: listPagination.pageSize,
      type: tabIndex.value
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
      :title="'余额'"
      page-name="balancePage"
      :show-icon="true"
      :bg-color="'#fff'"
    >
    </custom-nav-bar>
    <view class="user-balance">
      <view class="balance-item">
        <view class="label">当前余额</view>
        <view class="num">{{ userStore.userInfo.balance }}</view>
      </view>
      <view class="balance-item">
        <view class="label">已提现余额</view>
        <view class="num">{{ userStore.userInfo.withdrawalAmount }}</view>
      </view>
      <view class="balance-item">
        <view class="label">提现审核中</view>
        <view class="num">{{ userStore.userInfo.processAmount }}</view>
      </view>
    </view>
    <wd-tabs v-model="tab" @click="handleTabClick">
      <wd-tab v-for="(tab, index) in tabList" :key="index" :title="tab.label">
      </wd-tab>
    </wd-tabs>
    <scroll-view 
      scroll-y 
      class="content"
      enable-back-to-top
      :scroll-top="scrollTop"
      @scrolltolower="onScrolltolower"
    >
      <!-- 内容{{ index }} -->
      <view class="point-item" v-for="item in recordList" :key="item.id">
          <view class="time">
            {{ item.created_at }}
          </view>
          <view class="point-intro">
            <view class="intro">{{ item.title }}</view>
            <view class="price">{{ item.balance > 0 ? '+' + item.balance : item.balance  }}</view>
          </view>
      </view>

      <!-- state 为 error 加载错误时，点击文案触发 reload 事件 -->
      <wd-loadmore :state="state" @reload="onReTry" />
    </scroll-view>

    <footer-tool-bar>
      <view class="operation bg-#fff">
        <view class="pos-relative flex justify-center items-center h-100rpx">
          <navigator
            url="/pages-user/balance/apply-withdrawal/index"
            open-type="navigate"
          >
            <view class="operation-btn">
              <text class="">申请提现</text>
            </view>
          </navigator>
        </view>
        <view class="pos-absolute top-24rpx right-60rpx">
          <navigator
            url="/pages-user/balance/withdrawal-list/index"
            open-type="navigate"
          >
            <text class="color-#23C2E6 font-size-30rpx fw-bold decoration-underline">提现记录</text>  
          </navigator>
        </view>
      </view>
    </footer-tool-bar>
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
}

.user-balance{
  box-sizing: border-box;
  height: 166rpx;
  display: flex;
  justify-content: center;
  background: #fff;
  color: #141414;
  padding-top: 25rpx;
  .balance-item{
    flex: 1;
    text-align: center;
    position: relative;
    &::before {
      content: "";
      background-color: #EEEEEE;
      width: 2rpx;
      height: 76rpx;
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }
    &:first-child:before {
      display: none;
    }
  }
  .label {
    margin-bottom: 25rpx;
    font-size: 32rpx;
  }
  .num{
    font-size: 28rpx;
    font-weight: bold;
  }
}
:deep(.wd-tabs) {
  background-color: transparent;
}
:deep(.wd-tabs__nav-item) {
  font-size: 28rpx;
  font-weight: bold;
  background-color: #E6E6E6;
  color: #262626;
}
:deep(.wd-tabs__nav-item.is-active) {
  color: #27BAAC;
}
:deep(.wd-tabs__line) {
  background-color: #27BAAC;
}
.point-item{
  background: #fff;
  margin-bottom: 5px;
  padding: 5px;
  font-size: 16px;
  
}
.point-intro {
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
