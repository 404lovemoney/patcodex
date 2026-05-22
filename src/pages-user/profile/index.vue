<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "个人资料"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'profilePage',
})

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

import { fetchMessageDetail } from '@/api/message';
import { JSONParse } from '@alova/shared';

onLoad(async (options) => {
  console.log("onLoad");
})

onMounted(async () => {
  console.log("onMounted");
})

onShow(() => {
  console.log("onShow");
})

const profile = ref({
  avatar: userStore.userInfo.avatar
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

// 修改头像
const onAvatarChange = () => {
  // 调用拍照/选择图片
  // 选择图片条件编译
  // #ifdef H5 || APP-PLUS
  // 微信小程序从基础库 2.21.0 开始， wx.chooseImage 停止维护，请使用 uni.chooseMedia 代替
  uni.chooseImage({
    count: 1,
    success: (res) => {
      // 文件路径
      const tempFilePaths = res.tempFilePaths
      // 上传
      uploadFile(tempFilePaths[0])
    },
  })
  // #endif

  // #ifdef MP-WEIXIN
  // uni.chooseMedia 仅支持微信小程序端
  uni.chooseMedia({
    // 文件个数
    count: 1,
    // 文件类型
    mediaType: ['image'],
    success: (res) => {
      // 本地路径
      const { tempFilePath } = res.tempFiles[0]
      // 上传
      uploadFile(tempFilePath)
    },
  })
  // #endif
}

// 文件上传-兼容小程序端、H5端、App端
const uploadFile = (file: string) => {
  // 文件上传
  uni.uploadFile({
    url: '/user/setAvatar',
    name: 'avatar',
    filePath: file,
    formData: {
      'x-token': userStore.userInfo.token,
    },
    success: (res) => {
      console.log('res', res)
      if (res.statusCode === 200) {
        console.log(JSON.parse(res.data))
        const avatar = JSON.parse(res.data).data.avatar
        // 个人信息页数据更新
        profile.value.avatar = avatar
        // Store头像更新
        userStore.userInfo.avatar = avatar
        uni.showToast({ icon: 'success', title: '更新成功' })
      } else {
        uni.showToast({ icon: 'error', title: '出现错误' })
      }
    },
  })
}

</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="'个人资料'"
      page-name="profile"
      :show-icon="true"
      :bg-color="'#fff'"
    >
    </custom-nav-bar>

    <view class="content">
        <!-- {{ userStore.userInfo.avatar }} -->
        <!-- 头像 -->
        <view class="item avatar-item">
          <view class="label">头像</view>
          <view class="flex items-center">
            <view @click="onAvatarChange" class="avatar-content mr-10rpx">
              <wd-img width="100%" height="100%" round :src="profile.avatar" mode="aspectFill" />
            </view>
            <wd-icon name="arrow-right" size="24rpx"></wd-icon>
          </view>
        </view>

        <!-- id -->
        <view class="item id-item">
          <view class="label">ID</view>
          <view class="">
            <text class="text">{{ userStore.userInfo.id }}</text>
          </view>
        </view>

        <!-- 昵称 -->
        <view class="item nickName-item">
          <view class="label">昵称</view>
          <view class="flex items-center">
            <navigator
              url="/pages-user/profile/nickName"
              open-type="navigate"
              hover-class="navigator-hover"
            >
              <text class="text mr-10rpx">{{ userStore.userInfo.nickName }}</text>
              <wd-icon name="arrow-right" size="24rpx"></wd-icon>
            </navigator>
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

.item {
  padding: 0 30rpx 0 36rpx;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
  background: #fff;
  font-size: 28rpx;
  color: #262626;
}
.avatar-item{
  height: 156rpx;
  align-items: center;
  .avatar-content{
    width: 124rpx;
    height: 124rpx;
  }
}
.id-item,
.nickName-item{
  padding: 0 30rpx 0 36rpx;
  align-items: center;
  height: 110rpx;
}
</style>
