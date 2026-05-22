<script setup lang="ts">
import { getNavBarHeight, getStatusBarHeight, getTitleBarHeight } from '@/utils/system';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  pageName: {
    type: String,
    default: ''
  },
  isBgColor: {
    type: Boolean,
    default: true
  },
  isDefaultBgImg: {
    type: Boolean,
    default: true
  },
  showIcon: {
    type: Boolean,
    default: false
  },
  bgColor: {
    type: String,
    default: '#fff'
  },
  color: {
    type: String,
    default: '#262626'
  },
  titlePosition: {
    type: String,
    default: 'center'
  },
  isChange: {
    type: Boolean,
    default: false
  },
})

const goBackHandle = (() => {
  console.log('pageName', props.pageName);
  const pageName = props.pageName
  switch (pageName) {
    case 'addressManage':
    case 'orderList':
    case 'balancePage':
      console.log('go user center')
      uni.switchTab({
        url: '/pages/usercenter/index',
        success(res) {
        }
      })
      break;
    case 'blindboxDetail':
    case 'consignment':
      console.log('go home')
      // switchTab 必须写完整路径
      uni.switchTab({
        url: '/pages/home/home',
        success(res) {
        }
      })
      break;
    case 'deliveryPage':
      uni.switchTab({
        url: '/pages/box/index/index',
        success(res) {
        }
      })
      break;
    case 'createSell':
      uni.navigateTo({
        url: '/pages-consignment/index/index',
        success(res) {
        }
      })
      break;
    case 'orderDetail':
      uni.navigateTo({
        url: '/pages-order/list/index',
        success(res) {
        }
      })
      break;
    // case 'withdrawalList':
    //   uni.navigateTo({
    //     url: '/pages-user/balance/index/index',
    //     success(res) {
    //     }
    //   })
    //   break;
    default:
      uni.navigateBack()
  }
  // if (props.pageName === 'blindboxDetail' || props.pageName === 'consignment') {
  // } else {
  //   uni.navigateBack()
  // }
})

</script>

<template>
    <view class="layout">
        <view class="navbar"
          :class="[
            isChange ? 'change-bg' : '',
            isDefaultBgImg ? 'default-bg' : ''
          ]"
        >
            <view class="statusBar" :style="{height: getStatusBarHeight() + 'px'}"></view>
            <view class="titleBar" :style="{height: getTitleBarHeight() + 'px'}">
                <view class="icon flex items-center" v-if="showIcon" @click="goBackHandle">
                  <wd-icon name="arrow-left" size="28rpx" color="#fff"></wd-icon>
                </view>
                <view class="title" :style="{'color': color, 'text-align': titlePosition}">{{ title }}</view>
                <view class="icon" v-if="showIcon"></view>
            </view>
        </view>
        <view class="fill" :style="{height: getNavBarHeight() + 'px'}"></view>
    </view>
</template>

<style lang="scss" scoped>
.layout {
  .navbar{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 10;
    background-size: 100% 100%;
    &.default-bg{
      background: url(https://img.niantu.cn/spark-mall/static/short_bg.png) no-repeat;
    }
    &.change-bg{
      background: url(https://img.niantu.cn/spark-mall/static/short_bg.png) no-repeat;
      color: #fff;
    }
    .statusBar {
      // border: 1px solid red;
    }
    .titleBar {
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      // border: 1px solid green;
      .icon {
        width: 40rpx;
        height: 100%;
      }
      .title {
        flex: 1;
        font-family: 'myFz';
        font-size: 36rpx;
        text-align: center;
      }
    }
  }
}
</style>

