<script setup lang="ts">
import { getNavBarHeight, getStatusBarHeight, getTitleBarHeight } from '@/utils/system';
import { setPreviousPage, removePreviousPage } from '@/utils/util'
import { useToast } from 'wot-design-uni'

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

const { show: showToast, loading: showLoading, close: hideLoading } = useToast()
const props = defineProps({
  originPage: {
    type: String,
    default: ''
  },
})

const emit = defineEmits([''])

// 前往添加地址
const goCreateAddressHandle = ()=> {
  if (userStore.isLoggedIn()) {
    // 记录路由地址
    setPreviousPage()
    // todo 添加成功后返回
    uni.navigateTo({
      url: `/pages-user/address/add-address?originPage=${props.originPage}`,
    })
  } else {
    showToast('请先登录后再进行添加')
  }
}

// 前往地址列表页选择地址
const goAddressListHandle = ()=> {
  // 记录路由地址
  setPreviousPage()
  // todo 添加成功后返回
  uni.navigateTo({
    url: `/pages-user/address/list?originPage=${props.originPage}`,
  })
}

</script>

<template>
    <block v-if="userStore.isLoggedIn() && userStore.isFirstAddress()">
      <view class="address flex justify-between items-center h-120rpx pl-20rpx pr-20rpx">
        <view class="item-content text-24rpx">
            <view class="user">
              {{ userStore.userAddress.contactName }}
              <text class="contact">{{ userStore.userAddress.contactPhone }}</text>
            </view>
            <view class="locate">{{ userStore.userAddress.province + userStore.userAddress.city + userStore.userAddress.district + userStore.userAddress.detailAddress }}</view>
          </view>
          <wd-icon class="mr-2" name="a-chevron-rightdouble" size="24rpx" @click="goAddressListHandle"></wd-icon>
      </view>
    </block>
    <block v-else>
      <view class="address flex items-center h-80rpx pl-20rpx pr-20rpx">
        <view class="flex items-center" @click="goCreateAddressHandle">
          <view class="create_address_icon mr-1"></view>
          <text class="text-26rpx color-#212121 fw-bold">添加收货地址</text>
        </view>
      </view>
    </block>
</template>

<style lang="scss">
.address {
  background: #fff;
  .create_address_icon{
    width: 40rpx;
    height: 40rpx;
    background: url(https://www.niantu.cn/img/spark-mall/static/create_address_icon.png) no-repeat 0 0;
    background-size: 100% 100%;
  }
}
</style>

