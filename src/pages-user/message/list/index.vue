<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "系统消息"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'MessageDetail',
})

import { fetchMessageList } from '@/api/message';

onLoad(async (options) => {
  console.log("onLoad");
  await loadList(true)
})

onMounted(async () => {
  console.log("onMounted");
})

onShow(async () => {
  console.log("onShow");
  await loadList(true)
})

// 数据列表
const dataList = ref<any>([])

// 列表加载中标记 0-否 1-是
const listLoadStatus = ref<number>(0)

// 加载更多 根据state 展示不同的文案
const state = ref<any>('loading')

// 分页数据
const listPagination = reactive({
  page: 1,
  pageSize: 10,
})

function onReTry() {
  loadList()
}

// 滚动到底部加载更多
onReachBottom(() => {
  console.log('onReachBottom')
  if (listLoadStatus.value === 0) {
    loadList()
  }
})

/** */
async function loadList(fresh = false) {
  if (fresh) {
    uni.pageScrollTo({
      scrollTop: 0,
    })
  }

  listLoadStatus.value = 1

  if (fresh) {
    listPagination.page = 1
  }

  try {
    const res = await fetchMessageList({
      page: listPagination.page,
      pageSize: listPagination.pageSize
    })
    if (fresh) {
      dataList.value = res.messageList
    }
    else {
      dataList.value = dataList.value.concat(res.productList)
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

// 前往详情页面
const goDetailHandle = (id) => {
  uni.navigateTo({
    url: `/pages-user/message/detail/index?id=${id}`,
  })
}

</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="'系统消息'"
      page-name="messageDetail"
      :show-icon="true"
      :bg-color="'#fff'"
    >
    </custom-nav-bar>

    <view class="content">

      <view class="message-list">
        <view class="item" v-for="(item, index) in dataList" :key="index" @click="goDetailHandle(item.id)">
          <view class="flex justify-between">
            <view class="title font-size-28rpx fw-bold color-#000000">
              <view class="icon" v-if="item.status === 0"></view>
              {{ item.title }}
            </view>
            <view class="time mr-30rpx text-right">
              {{ item.created_at }}
            </view>
          </view>
          <view class="mt-20rpx">
            {{ item.content }}
          </view>
        </view>
      </view>

    </view>
    <!-- state 为 error 加载错误时，点击文案触发 reload 事件 -->
    <wd-loadmore :state="state" @reload="onReTry" />
  </view>
</template>

<style lang="scss" scoped>
.wrapper {
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  background-color: #E8E8E8;
}
.content{
  padding-top: 10rpx;
}
.message-list {
  padding: 0rpx 0rpx;
  font-size: 24rpx;
  color: #888888;
  .item{
    box-sizing: border-box;
    margin-bottom: 10rpx;
    padding: 30rpx;
    height: 192rpx;
    background: #fff;
    .icon{
      display: inline-block;
      width: 24rpx;
      height: 24rpx;
      background: #FF0000;
      border-radius: 50%;
    }
  }
}
</style>
