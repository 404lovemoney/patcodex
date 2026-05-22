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
  isChange: {
    type: Boolean,
    default: false
  },
})

</script>

<template>
    <view class="layout">
        <view class="navbar"
          :class="isChange ? 'short_bg' : ''"
          :style="{height: (getNavBarHeight() + 40) + 'px'}"
        >
            <view class="statusBar" :style="{height: getStatusBarHeight() + 'px'}"></view>
            <view class="titleBar" :style="{height: getTitleBarHeight() + 'px'}">
                <view class="title">{{ title }}</view>
            </view>
            <view class="">
              <wd-text color="#ffffff" size="24rpx" text="全新正品 | 精选好物 | 急速发货" />
              <!-- {{ getNavBarHeight() }} -->
            </view>
        </view>
        <view class="fill" :style="{height: (getNavBarHeight() + 40) + 'px'}"></view>
    </view>
</template>

<style lang="scss" scoped>
.layout {
  .fill{
  }
  .navbar{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 10;
    padding: 0 30rpx;
    box-sizing: border-box;
    &.short_bg{
      background: url(https://img.niantu.cn/spark-mall/static/short_bg.png) no-repeat;
      background-size: 100% 100%;
      // background-color: #000;
    }
    .statusBar {
      // border: 1px solid red;
    }
    .titleBar {
      display: flex;
      align-items: center;
      padding: 0 0rpx;
      // border: 1px solid green;
      .icon {
        width: 40rpx;
        height: 100%;
      }
      .title {
        flex: 1;
        font-family: 'myFz';
        font-size: 44rpx;
        // font-weight: bold;
        text-align: left;
        color: #fff;
      }
    }
  }
}
</style>

