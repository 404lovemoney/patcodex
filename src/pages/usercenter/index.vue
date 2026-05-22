<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page -->
<route lang="jsonc" type="page">
  {
    "layout": "tabbar",
    "style": {
      // 'custom' 表示开启自定义导航栏，默认 'default'
      "navigationStyle": "custom",
      "navigationBarTitleText": "我的"
    }
  }
</route>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { fetchUserCenter } from '@/service/usercenter/fetchUsercenter'
// import { saveUserInfoState, isLoggedIn, getUserProfile } from '@/api/auth'
import orderGroup from './components/order-group/index.vue'

import userCenterHeader from './components/user-center-header/index.vue'

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

const { show: showToast } = useToast()

// const UserInfo = ref<UserInfo>
  const defaultAvatarUrl = ref<string>('https://img.niantu.cn/spark-mall/static/images/default-avatar.png')

const menuData = [
  [
    {
      title: '地址管理',
      tit: '',
      url: '',
      type: 'address',
      icon: "location"
    },
    {
      title: '在线客服',
      tit: '',
      url: '',
      type: 'service',
      icon: 'service',
    },
  ],
]

const orderTagInfos = [
  {
    title: '全部订单',
    iconName: 'wallet',
    orderNum: 0,
    status: -1,
  },
  {
    title: '待付款',
    iconName: 'clear',
    orderNum: 0,
    status: 0,
  },
  {
    title: '待发货',
    iconName: 'a-precisemonitor',
    orderNum: 0,
    status: 1,
  },
  {
    title: '待收货',
    iconName: 'tips',
    orderNum: 0,
    status: 2,
  },
  {
    title: '已完成',
    iconName: 'money-circle',
    orderNum: 0,
    status: 3,
  },
]

const state = reactive<any>({
  showMakePhone: false,
  userInfo: userStore.userInfo,
  menuData,
  orderTagInfos,
  customerServiceInfo: {},
  currAuthStep: 1,
  showKefu: true,
  versionNo: '',
})

// 页面加载时检查登录状态
// 注册一个钩子，在组件被挂载之前被调用。
onBeforeMount(() => {

})

// 注册一个回调函数，在组件挂载完成后执行。
onMounted(() => {
  console.log('onMounted')
  // init()
})


onShow(() => {
  init()
})

function init() {
  if (userStore.isLoggedIn()) {
    console.log('已登录')
    fetchUserInfoHandle()
    // fetchUserAddressHandle()
  } else {
    console.log('未登录')
  }
  console.log('userAddress', userStore.userAddress);
}


// 获取用户信息
const fetchUserInfoHandle = async () => {
  try {
    // 调用获取用户信息API
    // const response = await getUserProfile()

    const response = await userStore.getUserInfo()

    // console.log('response', response)

    // 保存用户信息到storage
    // saveUserInfoState(response)
    // userStore.setUserInfo(response)

    state.userInfo = response

    console.log('state.userInfo', state.userInfo.phone);

    state.currAuthStep = 2

  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

// 获取用户地址
const fetchUserAddressHandle = async () => {
  try {
    // 调用获取用户地址列表API
    const response = await userStore.getUserAddressList()
    console.log('response', response)
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

function onClickCell(item) {
  console.log('onClickCell', item)
  switch (item.type) {
    case 'address': {
      showToast({
        msg: '你点击了地址菜单',
      })
      uni.navigateTo({ url: '/pages-user/address/list' })
      break
    }
    case 'service': {
      showToast({
        msg: '你点击了帮助中心',
      })
      // openMakePhone()
      break
    }
    case 'help-center': {
      showToast({
        msg: '你点击了帮助中心',
      })
      break
    }
    case 'point': {
      showToast({
        msg: '你点击了积分菜单',
      })
      break
    }
    case 'coupon': {
      showToast({
        msg: '你点击了优惠券菜单',
      })
      // wx.navigateTo({ url: '/pages/coupon/coupon-list/index' })
      break
    }
    default: {
      showToast({
        msg: '未知跳转',
      })
      break
    }
  }
}

function jumpOrderNav(status) {
  uni.navigateTo({ url: `/pages-order/list/index?type=${status}` })
}

const jumpPageHandle = (pageName) => {
  console.log('pageName:', pageName)
  if (userStore.isLoggedIn()) {
    switch (pageName) {
      case 'balance':
        uni.navigateTo({
          url: '/pages-user/balance/index/index',
          success(res) {
          }
        })
      break
    case 'points':
      // switchTab 必须写完整路径
      uni.switchTab({
        url: '/pages/points/index/index',
        success(res) {
        }
      })
      break
    default:
    }
  } else {
    uni.showToast({
      title: '请登录后操作',
      icon: 'none'
    })
    return
  }
}

function call() {
  wx.makePhoneCall({
    phoneNumber: state.customerServiceInfo.servicePhone,
  })
}

// 退出登录
const logoutHandle = async ()=> {
  await userStore.logout()
  uni.reLaunch({
    url: '/pages/usercenter/index'
  });
}

// 跳转登录页面
const gotoUserEditPage = () => {
  uni.navigateTo({ url: '/pages/login/login' })
}

// 跳转商城首页
const goHomePage = () => {
  // switchTab 必须写完整路径
  uni.switchTab({
    url: '/pages/home/home',
    success(res) {
    }
  })
}

// 跳转代理
const goAgencyPage = () => {
  uni.navigateTo({ url: '/pages-user/agency/index/index'})
}

// 跳转寄售专区
const goConsignmentPage = () => {
  uni.navigateTo({ url: '/pages-consignment/index/index'})
}

// 跳转站内信
const goMessageHandle = () => {
  uni.navigateTo({ url: '/pages-user/message/list/index'})
}
</script>

<template>

  <view class="user-page">
    <!-- 自定义顶部标题蓝 -->
    <custom-nav-bar
      title="我的"
      :show-icon="false"
      :bg-color="''"
      :color="'#ffffff'"
    >
    </custom-nav-bar>
    <view class="header flex justify-between">
      <view class="flex items-center">
        <wd-img width="140rpx" height="140rpx" round :src="userStore.userInfo.avatar || defaultAvatarUrl" />
        <view class="user-intro">
          <template v-if="userStore.isLoggedIn()">
            <navigator
              url="/pages-user/profile/index" 
              open-type="navigate"
              hover-class="navigator-hover"
            >
              <view class="header__name">
                {{ userStore.userInfo.phone }}
              </view>
              <view class="mt-2 header__name">
                ID：{{ userStore.userInfo.id }}
              </view>
            </navigator>
          </template>
          <template v-else>
            <view class="login-tip" @click="gotoUserEditPage">
              请授权登录
            </view>
          </template>
        </view>
      </view>
      <view class="quick-operation flex justify-between">
        <wd-icon name="dong" size="44rpx" color="#fff" @click="goMessageHandle"></wd-icon>
        <wd-icon name="setting1" size="44rpx" color="#fff"></wd-icon>
      </view>
    </view>

    <!-- 只有代理才显示 -->
    <view class="agency-region" v-if="userStore.userInfo.isAgent" @click="goAgencyPage">
      <view class="flex ">
        <view class="flex agency-list">
          <view class="agency-item">
          <view class="label">获得佣金</view>
          <view class="num">{{ userStore.userInfo.totalCommission }}</view>
        </view>
        <view class="agency-item">
          <view class="label">已邀请</view>
          <view class="num">{{ userStore.userInfo.totalInvitCount }}</view>
        </view>
        </view>
        <image
            class="reward-btn"
            src="https://www.niantu.cn/img/spark-mall/static/usercenter/couponbtn.png"
            mode="widthFix"
          />
      </view>     
    </view>

    <view class="relative p-x-4 mb-1">  
      <view class="account-data h-156rpx bg-white rounded-2 grid grid-cols-4">
        <view class="data-item" @click="jumpPageHandle('points')">
          <view class="text-center">{{ userStore.userInfo.points }}</view>
          <view class="text-center label">积分</view>
        </view>
        <view class="data-item" @click="jumpPageHandle('balance')">
          <view class="text-center">{{ userStore.userInfo.balance }}</view>
          <view class="text-center label">余额</view>
        </view>
        <view class="data-item">
          <view class="text-center">{{ 0 }}</view>
          <view class="text-center label">礼品卡</view>
        </view>
        <view class="data-item">
          <view class="text-center">{{ 0 }}</view>
          <view class="text-center label">优惠券</view>
        </view>
      </view>
    </view>

    <view class="relative p-x-4">
      <view class="mb-2">
        <order-group :order-tag-infos="state.orderTagInfos" @on-click-item="jumpOrderNav" />
      </view>

      <!-- 引导区 -->
      <view class="guide-region mb-2 flex justify-between">
        <view class="guide-item" @click="goHomePage" style="background: none;">
          <wd-img src="https://www.niantu.cn/img/spark-mall/static/usercenter/pointsexchange.png" width="100%" height="100%"  mode="widthFix"></wd-img>
        </view>
        <view class="guide-item" @click="goConsignmentPage" style="background: none;">
          <wd-img src="https://www.niantu.cn/img/spark-mall/static/usercenter/consignmentplatform.png" width="100%" height="100%" mode="widthFix"></wd-img>
        </view>
      </view>

      <view class="other-tool mb-3 rounded-2 bg-white">
        <view class="title mb-2 pt-3 pl-3">常用工具</view>
        <view v-for="(item, index) in menuData" :key="index" class="overflow-hidden ">
          <wd-cell-group :border="false">
            <wd-cell v-for="(xitem, xindex) in item" :key="xindex" :title="xitem.title" :value="xitem.tit" is-link @click="onClickCell(xitem)">
              <template #icon v-if="xitem.icon">
                <wd-icon :name="xitem.icon" size="32rpx" />
              </template>
            </wd-cell>
          </wd-cell-group>
        </view>
      </view>

    </view>

    <footer-tool-bar>
      <view class="flex justify-center items-center h-100rpx">
        <view class="user-logout text-align-center" v-if="userStore.isLoggedIn()">
          <wd-button @click="logoutHandle">退出登录</wd-button>
        </view>
      </view>
    </footer-tool-bar>
  </view>
</template>

<style lang="scss" scoped>
.user-page{
  height: 100vh;
  background: #EDEDED url(https://img.niantu.cn/spark-mall/static/user-header-bg.png) repeat-x;
  background-size: 100% 484rpx;
}
.header{
  box-sizing: border-box;
  height: 200rpx;
  padding: 48rpx 24rpx 24rpx;
  // background: #000;
}
.user-intro{
  margin-left: 20rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
}
.login-tip{
  box-sizing: border-box;
  padding-top: 30rpx;
  height: 140rpx;
  font-size: 48rpx;
  font-weight: bold;
}
.quick-operation{
  width: 100rpx;
  padding-top: 22rpx;
}
.account-data{
  margin-top: 20rpx;
}
.data-item{
  // background: #000;
  padding-top: 30rpx;
  font-size: 24rpx;
  .label{
    margin-top: 24rpx;
  }
}
.agency-region{
  margin: 0 auto 20rpx;
  box-sizing: border-box;
  padding: 30rpx 0 0 64rpx;
  width: 736rpx;
  height: 266rpx;
  background: url(https://www.niantu.cn/img/spark-mall/static/usercenter/invitefriends.png) no-repeat 0 0;
  background-size: 100% 100%;  
  .reward-btn{
    width: 210rpx;
    margin-top: 23%;
    margin-left: 15%;
  }
}
.agency-list{
  width: 278rpx;
  // border: 4px solid yellow;
}
.agency-item{
  flex: 1;
  padding-top: 130rpx;
  text-align: center;
  font-size: 24rpx;
  .label{
    font-weight: bold;
    color: #FFFB8D;
  }
  .num{
    margin-top: 5rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: white;
  }
}

.guide-region{
}
.guide-item{
  width: 340rpx;
  height: 178rpx;
  background: #000;
}
</style>
