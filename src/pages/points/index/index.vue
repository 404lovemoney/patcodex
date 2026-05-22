<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "积分"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'Points',
})
import { getUserPointsChangeList } from '@/api/auth'
import cartBar from "../components/cart-bar/index.vue";

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

const tab = ref<number>(0);
const value = ref<boolean>(true)

// 注册一个回调函数，在组件挂载完成后执行。
onMounted(async () => {
  console.log("onMounted");
  if (userStore.isLoggedIn()) {
    // 拉取用户信息
    await userStore.getUserInfo()
    await loadList(true)
  } else {
    console.log('未登录')
  }
})

// 积分记录列表
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



// 获取用户积分信息  1收入 2支出  默认返回全部
const loadList = async (fresh = false) => {

listLoadStatus.value = 1

if (fresh) {
  listPagination.page = 1
}

try {
  const res = await getUserPointsChangeList({
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
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

// 去登录
const toLoginHandle = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  })
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
      :title="'积分'"
      page-name="pointsPage"
      title-position="left"
      :color="'#fff'"
    >
    </custom-nav-bar>

    <template v-if="userStore.userInfo.token">
      <view class="user-points">
        <view class="icon"></view>
        <view class="">
          <view class="title">当前积分</view>
          <view class="mt-12rpx points-num">{{ userStore.userInfo.points }}</view>
        </view>
      </view>

      <view class="content">
        <view class="points-tabs">
          <wd-tabs
            v-model="tab"
            auto-line-width
            color="#EF8105"
            inactiveColor="#929292"
            @click="handleTabClick"
          >
            <wd-tab v-for="(tab, index) in tabList" :key="index" :title="tab.label">
            </wd-tab>
          </wd-tabs>
        </view>
      </view>

      <scroll-view 
        scroll-y 
        class="scroll-view"
        enable-back-to-top
        :scroll-top="scrollTop"
        @scrolltolower="onScrolltolower"
      >
        <view class="point-item" v-for="item in recordList" :key="item.id">
            <view class="point-intro">
              <view class="intro">{{ item.title }}</view>
              <view class="time">
                {{ item.created_at }}
              </view>
            </view>
            <view class="price">{{ item.points > 0 ? '+' + item.points : item.points  }}</view>
        </view>
        <!-- state 为 error 加载错误时，点击文案触发 reload 事件 -->
        <wd-loadmore :state="state" @reload="onReTry" />
      </scroll-view>

      <footer-tool-bar>
        <!-- 积分兑换按钮 -->
        <view class="flex justify-center items-center h-100rpx bg-#fff">
          <view @click="toHomeHandle" class="operation-btn">
            <text class="">兑换商品</text>
          </view>
        </view>
      </footer-tool-bar>
    </template>
    <template v-else>
      <view class="pt-30 no-login-info">
        <view class="no-login-default"></view>
        <view class="tips text-align-center mb-10">快登录看看你的积分吧</view>
        <view class="text-align-center">
          <wd-button @click="toLoginHandle">去登录</wd-button>
        </view>
      </view>
    </template>
  </view>
</template>

<style lang="scss">
.wrapper {
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  // 计算页面视口最大高度
  height: calc(100vh - var(--window-top) - var(--window-bottom));
  background: #fff url(https://img.niantu.cn/spark-mall/static/homg_bg.png) no-repeat 0 0;
  background-size: 100%;
}
.no-login-default{
  margin: 0 auto;
  width: 396px;
  height: 246px;
  background: url(https://img.niantu.cn/spark-mall/static/no-login.png) no-repeat center center;
  background-size: 100% 100%;
}
.user-points{
  width: 734rpx;
  height: 152rpx;
  display: flex;
  align-items: center;
  background: url(https://www.niantu.cn/img/spark-mall/static/points/user-points-bg.png) no-repeat 0 0;
  background-size: 100% 100%;
  color: #2A2A2A;
  padding-left: 20px;
  .icon{
    margin: 0 30rpx 0 0rpx;
    width: 114rpx;
    height: 134rpx;
    background: url(https://www.niantu.cn/img/spark-mall/static/points/my-points-icon.png) no-repeat 0 0;
    background-size: 100% 100%;
  }
  .title {
    font-size: 30rpx;
  }
  .points-num{
    line-height: 56rpx;
    font-size: 56rpx;
    font-weight: bold;
  }
}
.points-tabs{
  margin: 0 10rpx;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  padding: 0 30rpx;
  background: #fff;
}
:deep(.wd-tabs__line) {
  background-color: #EF8105;
}
.scroll-view{
  margin: 0 10rpx;
  width: 730rpx;
  background: #fff;
}
.point-item{
  display: flex;
  align-items: center;
  margin: 0 20rpx;
  padding: 30rpx 0;
  font-size: 16px;
  border-bottom: 1rpx solid #ccc;
}
.point-intro {
  flex: 1;
  .intro{
    font-size: 26rpx;
    font-weight: bold;
  }
}
.time{
  margin-top: 15rpx;
  font-size: 20rpx;
  color: #949494;
}

.price{
  color: #EF8105;
  font-weight: bold;
  font-size: 28rpx;
}

.operation-btn{
  text-align: center;
  line-height: 70rpx;
  width: 700rpx;
  height: 70rpx;
  background: #ff0000;
  font-size: 30rpx;
  color: #fff;
  border-radius: 40rpx;
  font-weight: bold;
}

</style>
