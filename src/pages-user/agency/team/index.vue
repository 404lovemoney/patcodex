<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "我的团队"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'Team',
})
import { getMyInviteList } from '@/api/auth'

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

// 注册一个回调函数，在组件挂载完成后执行。
onLoad(async () => {
  console.log("onLoad");
  await getMyInviteListHandle(true)
})


// 注册一个回调函数，在组件挂载完成后执行。
onMounted(async () => {
  console.log("onMounted");
})

// 滚动到底部加载更多
onReachBottom(() => {
  console.log('onReachBottom')
  if (listLoadStatus.value === 0) {
    getMyInviteListHandle()
  }
})

// 重试
const onReTry = () => {
  getMyInviteListHandle()
}

// 记录列表
const recordList = ref<any[]>([
  {
    id: 30,
    avatar: "",
    nickName: null,
    totalCash: 0
  }
])


const tabList = [
  {
    label: "一级成员",
  },
  {
    label: "二级成员",
  },
  {
    label: "三级成员",
  }
];

// 点击事件
const handleTabClick = async (event) => {
  console.log('click', event.index)
  // await getUserPointsChangeListHandle(event.index)
}

// 获取邀请列表
const getMyInviteListHandle = async (fresh = false) => {
  if (fresh) {
    listPagination.page = 1
    uni.pageScrollTo({
      scrollTop: 0,
    })
  }

  listLoadStatus.value = 1

  try {
    const res = await getMyInviteList({
      // userId: 1
      page: listPagination.page,
      pageSize: listPagination.pageSize,
    })

    if (fresh) {
      recordList.value = res.userList
    }
    else {
      recordList.value = recordList.value.concat(res.userList)
    }
    
    listLoadStatus.value = 0

    listPagination.page = res.pagination?.currentPage
    listPagination.pageSize = res.pagination?.pageSize


    // 总页数
    const totalPages = res.pagination?.lastPage
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
      :title="'我的团队'"
      page-name="team"
      :show-icon="true"
      :color="'#fff'"
    >
    </custom-nav-bar>

    <view class="header">
      <view class="flex title">
        <view class="label">我的下级：</view>
        <view class="num">{{ userStore.userInfo?.totalInvitCount + '人' }}</view>
      </view>
    </view>
    <!-- <view class="team-level">
      <wd-tabs v-model="tab" @click="handleTabClick" custom-class="team-tabs">
        <wd-tab v-for="(tab, index) in tabList" :key="index" :title="tab.label"></wd-tab>
      </wd-tabs>
    </view> -->
    <view class="content">
        <!-- 内容{{ index }} -->
        <view class="team-item" v-for="item in recordList" :key="item.id">
          <view class="flex items-center">
            <view class="author-avatar">
              <wd-img :src=" item.avatar ? item.avatar : 'https://img.niantu.cn/spark-mall/static/consignment/author-avatar.png'" width="100%" height="100%"></wd-img>
            </view>
            <text class="author">{{ item.nickName }}</text>
          </view>
          <view class="team-intro">
            <view class="label">累计消费：</view>
            <view class="price">{{ '¥' + item.totalCash  }}元</view>
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
.team-level{
  margin: 0 10rpx;
}
:deep(.wd-tabs) {
  background-color: transparent;
}
:deep(.wd-tabs__nav-item) {
  font-size: 28rpx;
  background-color: transparent;
  color: #262626;
}
:deep(.wd-tabs__nav-item.is-active) {
  color: #27BAAC;
}
:deep(.wd-tabs__line) {
  background-color: #27BAAC;
}

.content{
  margin: 10rpx;
}


.team-item{
  display: flex;
  align-items: center;
  background: #fff;
  margin-bottom: 10rpx;
  padding: 12rpx;
  font-size: 24rpx;
  color: #050505;
}

.author-avatar{
  margin-right: 15rpx;
  width: 88rpx;
  height: 88rpx;
  background: #BFBFBF;
  border-radius: 50%;
}
.author{
  color: #202020;
}

.team-intro {
  margin-left: 110rpx;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.price{

}

</style>
