<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "站内信详情"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'MessageDetail',
})

import { fetchMessageDetail } from '@/api/message';

onLoad(async (options) => {
  console.log("onLoad");
  // 获取路由参数
  console.log('options data', options.id);

  if (options.id) {
    messageId.value = options.id
    await fetchMessageDetailHandle()
  } else {
    uni.showToast({
      title: '站内信不存在',
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


// id
const messageId = ref<number>(0)
// 公告标题
// const messageTitle = ref<string>('')
// 公告详情
const messageInfo = ref({
  title: '',
  content: '',
  status: '',
  created_at: '',
})


// 加载公告详情
const fetchMessageDetailHandle = async () => {
  try {
    // 调用API
    const response = await fetchMessageDetail({
      id: messageId.value
    })

    messageInfo.value = response
    // 设置标题
    uni.setNavigationBarTitle({
      title: messageInfo.value.title
    })
  } catch (error: any) {
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
      :title="messageInfo.title"
      page-name="messageDetail"
      :show-icon="true"
      :bg-color="'#fff'"
    >
    </custom-nav-bar>

    <view class="content">
      <view class="message-info">
        <view class="info">
          {{ messageInfo.content }}
        </view>
        <view class="time mr-30rpx text-right">
        {{ messageInfo.created_at }}
      </view>
      </view>

    </view>
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
.message-info {
  padding: 50rpx 30rpx;
  background: #fff;
  font-size: 24rpx;
  color: #888888;
  .info{
    line-height: 36rpx;
  }
}
</style>
