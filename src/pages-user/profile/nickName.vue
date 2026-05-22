<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "修改昵称"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'nickNamePage',
})

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

import { setUserNickName } from '@/api/auth'

onLoad(async (options) => {
  console.log("onLoad")
})

onMounted(async () => {
  console.log("onMounted")
})

onShow(() => {
  console.log("onShow")
})

const profile = ref({
  nickName: userStore.userInfo.nickName
})

// 修改昵称
const saveNicknameHandle = async () => {

  if (profile.value.nickName === '') {
    uni.showToast({
      icon: 'none',
      title: '昵称不能为空',
      duration: 1000
    })
    return
  }

  try {
    // 调用API
    const res = await setUserNickName({
      nickName: profile.value.nickName
    })

    // Store头像更新
    userStore.userInfo.nickName = profile.value.nickName

    uni.showToast({
      icon: 'success',
      title: '修改成功',
      duration: 1000
    })

    uni.redirectTo({
      url: '/pages-user/profile/index'
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
      :title="'修改昵称'"
      page-name="nickName"
      :show-icon="true"
      :bg-color="'#fff'"
    >
    </custom-nav-bar>

    <view class="content">
        <!-- {{ userStore.userInfo.nickName }} -->
        <!-- 昵称 -->
        <view class="item nickName-item">
          <wd-input
            no-border
            v-model="profile.nickName" 
            placeholder="请输入昵称"
            :focus-when-clear="false"
            clearable 
          />
        </view>

        <view class="operation mt-20rpx text-center">
          <wd-button @click="saveNicknameHandle">保存</wd-button>
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
  margin-bottom: 10rpx;
  background: #fff;
  font-size: 28rpx;
  color: #262626;
}
.nickName-item{
  box-sizing: border-box;
  padding: 30rpx 30rpx 0 36rpx;
  align-items: center;
  height: 110rpx;
}
.is-no-border{
  width: 100%;
}
</style>
