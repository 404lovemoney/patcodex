<route lang="jsonc" type="page">
    {
      "layout": "default",
      "style": {
        "navigationStyle": "custom",        
        "navigationBarTitleText": "地址管理"
      },
      "app-plus": {
        "titleNView": false
      }
    }
 </route>

<script lang="ts" setup>
defineOptions({
  name: 'Address List',
})
//
import { useToast, useMessage } from 'wot-design-uni'
import type { addressItem } from '@/api/types/address';
import { fetchUserAddressList, deleteUserAddress, setDefaultAddress } from '@/api/address';
const { alert, confirm } = useMessage()

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

// 页面加载
onLoad((options) => {
  console.log('options', options);
  // 设置来源页
  originPage.value = options.originPage
})

// 初始化调用(页面显示)
onShow(() => {
  console.log('address list onShow');
  getMemberAddressData()
})

const isSelected = ref<boolean>(true);

// 来源
const originPage = ref<string>('')

// 获取收货地址列表数据
const addressList = ref<addressItem[]>([])

const getMemberAddressData = async () => {
  const res = await userStore.getUserAddressList()
  console.log('getMemberAddressData-------', res)
  addressList.value = res
  console.log('addressList', addressList.value)
}

// 监听地址列表，地址为空时，清除首选地址
watch(
  () => addressList.value,
  (newValue) => {
    console.log('watch', newValue)
    if (!addressList.value.length) {
      // todo 执行清除首选地址
      userStore.removeUserAddress()
    }
  },
  {
    deep: true,
    immediate: true
  }
)

// 前往修改地址
const modifyUserAddressHandle = (item) => {
  uni.navigateTo({
    url: '/pages-user/address/modify-address?data=' + encodeURIComponent(JSON.stringify(item)),
    success: function(res) {
    }
  })
}

// 设为默认地址
const setDefaultAddressHandle = async (id) => {
  const res = await setDefaultAddress({
    id: id
  })

  // todo 更新列表数据状态
  addressList.value.forEach(item => {
    item.isDefault = 0
    if (item.id === id) {
      item.isDefault = 1
    }
  })

  console.log('addressList.value', addressList.value)

  uni.showToast({
    title: '已设为默认'
  })
}

// 删除地址
const deleteUserAddressHandle = (id) => {
  confirm({
      msg: '是否要删除该地址',
      title: '提示',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    .then(() => {
      console.log('点击了确定按钮')
      deleteUserAddressApi(id)
    })
    .catch(() => {
      console.log('点击了取消按钮')
    })
}

// 调用删除地址接口
const deleteUserAddressApi = async (id)=> {
  if (!id) return // id为空，直接返回
  const res = await deleteUserAddress({
    id: id
  })
  console.log('删除成功')
  console.log('address id', id)
  addressList.value = addressList.value.filter(item => item.id !== id)
  // console.log('addressList value', addressList.value)
  uni.showToast({
    title: '删除成功'
  })
}

// 前往创建地址
const goCretateAddress = () => {
  uni.navigateTo({
    url: `/pages-user/address/add-address`,
  })
}

// 地址列表项操作，判断是否来自于其他页面
const addressItemHandle = (currentId) => {
  console.log('设置首选地址')
  console.log('===', addressList.value.filter(item => item.id === currentId)[0])
  let { id, userId, contactName, contactPhone, province, city, district, detailAddress, isDefault} = addressList.value.filter(item => item.id === currentId)[0]
  let currentAddress = { id, userId, contactName, contactPhone, province, city, district, detailAddress, isDefault}
  console.log('currentAddress', currentAddress)
  // 设置首选地址
  userStore.setUserAddress(currentAddress)

  // 从非地址列表页来的
  if (originPage.value) {
    // todo
    let pageUrl = uni.getStorageSync('pageUrl')
    if (pageUrl) {
      // 如果为tabbar页面则用reLaunch跳转
      if (['/pages/home/home'].includes(pageUrl)) {
        uni.reLaunch({url: pageUrl})
      } else {
        uni.redirectTo({url: pageUrl})
      }
      //跳转后，删除url记录避免重复跳转
      uni.removeStorageSync('pageUrl')
    }
  } else {
    return
  }
}


</script>

<template>
  <view class="viewport">
    <!-- 自定义顶部标题栏 -->
     <!-- 有来源页，默认返回来源，没有则返回我的 -->
    <custom-nav-bar
      title="地址管理"
      :pageName="originPage ? '' : 'addressManage'"
      :show-icon="true"
    >
    </custom-nav-bar>
    <!-- 地址列表 -->
    <scroll-view class="scroll-view" scroll-y>
      <view v-if="true" class="address">
        <view class="address-list">
          <!-- 收货地址项 -->
          <view class="item" v-for="(item, index) in addressList" :key="index">
            <view class="item-content" @click="addressItemHandle(item.id)">
              <view class="user">
                {{ item.contactName }}
                <text class="contact">{{ item.contactPhone }}</text>
                <!-- <text v-if="item.isDefault == 1" class="badge">默认</text> -->
              </view>
              <view class="locate">{{ item.province + item.city + item.district + item.detailAddress }}</view>
            </view>
            <view class="item-operation flex justify-between">
              <view class="flex items-center" @click="setDefaultAddressHandle(item.id)">
                <wd-icon
                  size="40rpx"
                  :color="item.isDefault == 1 ? '#FA4126' : '#BBBBBB'"
                  :name="item.isDefault == 1 ? 'check-circle-filled' : 'circle'"
                  class="cart-bar__check"
                  @click="isSelected = !isSelected"
                />
                <text class="ml-1 cart-bar__total--bold text-padding-right">设为默认</text>
              </view>
              <view class="flex">
                <text @click="modifyUserAddressHandle(item)">修改</text>
                <text class="ml-2 mr-2"> | </text>
                <text @click="deleteUserAddressHandle(item.id)">删除</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="blank">暂无收货地址</view>
    </scroll-view>

    <footer-tool-bar>
      <!-- 添加按钮 -->
      <view class="add-btn" @click="goCretateAddress">
          新增地址
      </view>
    </footer-tool-bar>
  </view>
</template>

<style lang="scss">
.viewport {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 0 0 100rpx 0;
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  background-color: #f4f4f4;

  .scroll-view {
    padding-top: 20rpx;
    flex: 1;
  }
}

.address {
  
  margin: 0 20rpx;
  
  .item{
    margin-bottom: 20rpx;
    padding: 10rpx;
    background-color: #fff;
    border-radius: 10rpx;
  }

  .item-content {
    line-height: 1;
    padding: 40rpx 10rpx 38rpx;
    position: relative;

    .edit {
      position: absolute;
      top: 36rpx;
      right: 30rpx;
      padding: 2rpx 0 2rpx 20rpx;
      border-left: 1rpx solid #666;
      font-size: 26rpx;
      color: #666;
      line-height: 1;
    }
  }

  .item:last-child .item-content {
    border: none;
  }

  .user {
    font-size: 28rpx;
    margin-bottom: 20rpx;
    color: #333;

    .contact {
      color: #666;
    }

    .badge {
      display: inline-block;
      padding: 4rpx 10rpx 2rpx 14rpx;
      margin: 2rpx 0 0 10rpx;
      font-size: 26rpx;
      color: #27ba9b;
      border-radius: 6rpx;
      border: 1rpx solid #27ba9b;
    }
  }

  .locate {
    line-height: 1.6;
    font-size: 26rpx;
    color: #333;
  }
}

.blank {
  margin-top: 300rpx;
  text-align: center;
  font-size: 32rpx;
  color: #888;
}

.add-btn {
  height: 80rpx;
  text-align: center;
  line-height: 80rpx;
  margin: 30rpx 20rpx;
  color: #fff;
  border-radius: 80rpx;
  font-size: 30rpx;
  background-color: #27ba9b;
}
</style>