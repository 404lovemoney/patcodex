<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "邀请有奖"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'Agency',
})

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

// 注册一个回调函数，在组件挂载完成后执行。
onMounted(async () => {
  console.log("onMounted");
})

// 我的团队
const goTeamPage = () => {
  uni.navigateTo({
    url: '/pages-user/agency/team/index'
  })
}

// 去佣金详情
const goCommissionPage = () => {
  uni.navigateTo({
    url: '/pages-user/agency/commission/index'
  })
}

// 去我的推广
const goInvitationPage = () => {
  uni.navigateTo({
    url: '/pages-user/agency/invitation/index'
  })
}

</script>

<template>
    <!-- 自定义顶部标题蓝 -->
    <custom-nav-bar
      title="邀请有奖"
      page-name="agency"
      :show-icon="true"
      color="#fff"
    >
    </custom-nav-bar>

  <view class="wrapper">
    <!-- 宣传图 -->
    <view class="poster">
      <wd-img src="https://img.niantu.cn/spark-mall/static/agency/poster.png" width="100%" height="100%"></wd-img>
    </view>
   
    <view class="invitation">
      <view class="title">邀请奖励</view>

      <view class="invitation-list flex">
        <view class="invitation-item">
          <view class="pic">
            <wd-img src="https://img.niantu.cn/spark-mall/static/agency/award-01.png" width="100%" height="100%"></wd-img>
          </view>
          <view class="label">
            <text>好友成功注册<br />2000积分</text>
          </view>
        </view>
        <view class="invitation-item">
          <view class="pic">
            <wd-img src="https://img.niantu.cn/spark-mall/static/agency/award-02.png" width="100%" height="100%"></wd-img>
          </view>
          <view class="label">
            <text>好友首次开启盲盒<br />4000积分</text>
          </view>
        </view>
      </view>

      <view class="statistic">
        <view class="statistic-item">
          <view class="label">
            <text>已邀请</text>
          </view>
          <view class="num">{{ userStore.userInfo.totalInvitCount }}人</view>
          <view class="btn" @click="goTeamPage">
            查看详情
          </view>
        </view>
        <view class="statistic-item">
          <view class="label">
            <text>累计收益</text>
          </view>
          <view class="num">{{ userStore.userInfo.totalCommission }} 元</view>
          <view class="btn" @click="goCommissionPage">
            查看详情
          </view>
        </view>
      </view>

      <view class="my-invitation text-center">
        <text class="" @click="goInvitationPage">我的推广</text>
      </view>
    </view>

    <view class="rules">
      <view class="paragraph">活动说明: </view>
      <view class="paragraph">(1)您可在【我的邀请】中确认邀请关系是否绑定成功；若未绑定成功，可联系在线客服或让您的好友在【邀请有奖】-【我的邀请人】 进行补填邀请码； </view>
      <view class="paragraph">(2)请奖励可能存在延迟到账的情况，敬请谅解！如有疑问，可联系在线客服咨询； </view>
      <view class="paragraph">(3)相同设备绑定邀请关系，无法获得活动奖励: </view>
      <view class="paragraph">(4)本活动最终解释权归本公司所有； </view>
      <view class="paragraph">(5)本活动与苹果公司无关。</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.wrapper {
  background: #E6E6E6;
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  box-sizing: border-box;
}
.poster{
  width: 750rpx;
  height: 866rpx;
}
.invitation{
  margin: 10rpx;
  background: #fff;
  .title{
    padding-top: 30rpx;
    height: 58rpx;
    font-size: 30rpx;
    font-weight: bold;
    text-align: center;
    color: #000;
  }
}
.invitation-list{
  justify-content: space-between;
  padding: 0 0 30rpx 0;
  border-bottom: 1rpx solid #E6E6E6;
  .invitation-item{
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    .pic{
      width: 214rpx;
      height: 214rpx;
    }
    .label {
      width: 240rpx;
      text-align: center;
      margin-top: 15rpx;
      font-weight: bold;
      font-size: 30rpx;
      color: #000000;
    }
  }
}

.statistic{
  padding-top: 50rpx;
  padding-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  .statistic-item{
    flex: 1;
    text-align: center;
    .num{
      margin: 50rpx 0 20rpx;
      color: #FB0A01;
      font-weight: bold;
      font-size: 24rpx;
    }
    .btn{
      margin: 0 auto;
      width: 152rpx;
      height: 44rpx;
      line-height: 44rpx;
      background: #24BFD6;
      color: #fff;
      border-radius: 22rpx;
      font-size: 24rpx;
    }
  }
}

.my-invitation{
  padding-bottom: 20rpx;
  color: #26B3FF;
  font-size: 28rpx;
  text-decoration: underline;
}

.rules{
  padding: 20rpx 40rpx;
  background: #E6E6E6;
  color: #2A2A2A;
  .paragraph{
    margin: 20rpx 0;
  }
}

</style>
