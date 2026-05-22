<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "公告详情"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'NoticeDetail',
})

import { fetchNoticeDetail } from '@/api/boxInfo';

onLoad(async (options) => {
  console.log("onLoad");
  // 获取路由参数
  console.log('options data', options.id);

  if (options.id) {
    noticeId.value = options.id
    await fetchNoticeDetailHandle()
  } else {
    uni.showToast({
      title: '公告不存在',
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
const noticeId = ref<number>(0)
// 公告标题
// const noticeTitle = ref<string>('')
// 公告详情
const noticeInfo = ref({
  content: '',
  detailImg: '',
})


// 加载公告详情
const fetchNoticeDetailHandle = async () => {
  try {
    // 调用API
    const response = await fetchNoticeDetail({
      id: noticeId.value
    })

    noticeInfo.value = response
    // 设置标题
    uni.setNavigationBarTitle({
      title: noticeInfo.value.content
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

// 返回
const goBackHandle = (() => {
  uni.navigateBack()
})

</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="noticeInfo.content"
      page-name="noticeDetail"
      :show-icon="true"
      color="#fff"
      :bg-color="'#fff'"
    >
    </custom-nav-bar>
    <view class="notice-info">
      <wd-img
        width="100%"
        mode="widthFix"
        :src="noticeInfo.detailImg"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.wrapper {
}
.notice-info {
  width: 100%;
}
</style>
