<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "寄售物品详情"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'Consignment Detail',
})

import { fetchConsignmentInfo, getCancelConsignment } from '@/api/boxInfo';
import { useUserStore } from '@/store';
import { formatTime, diffInMilliseconds } from '@/utils/util'
import { useToast, useMessage } from 'wot-design-uni'

const { alert, confirm } = useMessage()

onLoad(async (options) => {
  console.log("onLoad");
  // 获取路由参数
  console.log('options data', options.id);

  if (options.id) {
    consignmentId.value = options.id
    await fetchConsignmentInfoHandle()
  } else {
    uni.showToast({
      title: '寄售物品不存在',
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

// pinia
const userStore = useUserStore()

// id
const consignmentId = ref('')
// 寄售物品详情
const consignmentInfo = ref({
  status: 0, // 0 发售中 1 已出售 2 已取消 3 全部
  consignPrice: '',
  created_at: '',
  expireTime: '',
  id: 0,
  productId: 0, // 商品id
  productName: '',
  resultId: '',
  storePageIcon: '',
  userId: 0,
  nickName: ''
})

const format = ref<string>('DD天HH时mm分ss秒')

// 倒计时总时长，单位为毫秒
const time = computed(() => {
  return diffInMilliseconds(consignmentInfo.value.expireTime)
})


// 是否是发布者
const isAuthor = computed(() => {
  return parseInt(userStore.userInfo.id) === consignmentInfo.value.userId
})

// 加载寄售物品详情
const fetchConsignmentInfoHandle = async () => {
  try {
    // 调用API
    const response = await fetchConsignmentInfo({
      id: consignmentId.value
    })

    consignmentInfo.value = response

    // time.value = diffInMilliseconds(consignmentInfo.value.expireTime)
    // console.log('time --', typeof time.value)

  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}


// 取消寄售确认框
const cancelConfirmHandle = () => {
  confirm({
    msg: `是否取消所选物品的寄售`,
    title: '提示',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  })
  .then(() => {
    console.log('点击了确定按钮')
    cancelConsignmentHandle()
  })
  .catch(() => {
    console.log('点击了取消按钮')
  })
}


// 取消寄售 
const cancelConsignmentHandle = async () => {
  console.log('cancelConsignmentHandle', consignmentInfo.value.id);
  
  if (consignmentInfo.value.id) {
    
    // todo 调用取消寄售接口API
    const response = await getCancelConsignment({
      idList: (consignmentInfo.value.id).toString()
    })
    uni.showToast({
      title: '已取消寄售',
      icon: 'success',
      duration: 2000
    })
    goBackHandle()
  } else {
    uni.showToast({
      title: '请选择要取消寄售的商品',
      icon: 'error'
    })
    // uni.navigateBack()
  }
}

// 倒计时结束事件
const onFinish = () => {
  // 修改状态为已取消
  consignmentInfo.value.status = 2
  uni.showToast({
    icon: 'none',
    title: '寄售已取消',
  })
}

// 返回
const goBackHandle = () => {
  uni.navigateBack()
}

// 前往商品详情页，传递id和来源页
function goodsClickHandle(id) {
  console.log('goodListClickHandle id', id);
  uni.navigateTo({
    url: `/pages/goods/detail/index?originPage=consignmentDetail&id=${id}`,
  })
}

</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="'寄售物品详情'"
      page-name="consignmentDetail"
      :show-icon="true"
      :color="'#fff'"
    >
    </custom-nav-bar>
    <view class="consignment-info">
      <view class="status-badge" v-if="time">
        <wd-count-down :time="time" :format="format" @finish="onFinish" />
      </view>
      <view class="header">
        <view class="flex items-center">
          <view class="author-avatar">
            <wd-img :src="userStore.userInfo.avatar" width="100%" height="100%" round></wd-img>
          </view>
          <view class="ml-2 flex-1">
            <view class="mb-1">
                <text class="author">{{ consignmentInfo?.nickName }}</text>
            </view>
            <view class="flex justify-between">
              <text class="time">{{ formatTime(consignmentInfo.created_at, 'YYYY-MM-DD HH:mm:ss') }}</text>
              <text class="total">1个物品</text>
            </view>
          </view>
        </view>
      </view>

      
      <view class="flex items-start">
        <view class="thumbnail" @click="goodsClickHandle(consignmentInfo.productId)">
          <wd-img
            width="100%"
            height="100%"
            radius="10"
            :src="consignmentInfo.storePageIcon"
          />
        </view>
        <view class="title pt-5 pb-2">{{ consignmentInfo.productName }}</view>
      </view>

      <view class="consignment-main">
        <view class="flex justify-between items-center">
          <view class="price">
            <wd-text :text="'￥' + consignmentInfo.consignPrice" size="28rpx" color="#F20901" bold></wd-text>
          </view>
          <view class="type flex items-center">
            <text class="author mr-2">普通寄售</text>
            <view class="type-icon"></view>
          </view>
        </view>
      </view>
    </view>

    <footer-tool-bar>
      <view class="flex justify-center">
        <view v-if="isAuthor && consignmentInfo.status === 0" @click="cancelConfirmHandle" class="operation-btn">
          <text class="">取消寄售</text>
        </view>
        <view v-else @click="goBackHandle" class="operation-btn">
          <text class="">返回</text>
        </view>
      </view>
    </footer-tool-bar>
  </view>
</template>

<style lang="scss" scoped>
.wrapper {
  background: #f5f5f5;
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
}
.consignment-info {
  position: relative;
  font-size: 14px;
  margin: 10px 0;
  padding: 18rpx 18rpx 18rpx 26rpx;
  background: #fff;
  border-radius: 10px;
  .header{
    margin-bottom: 70rpx;
  }
  .status-badge{
    position: absolute;
    top: 0;
    right: 0;
    padding: 0 10rpx;
    width: 268rpx;
    height: 36rpx;
    line-height: 36rpx;
    text-align: center;
    color: #000000;
    background: #F0A637;
    background-size: 100%;
    font-size: 16rpx;
  }
  .type{
    color: #ABABAB;
    .type-icon{
      width: 46rpx;
      height: 46rpx;
      background: url(https://img.niantu.cn/spark-mall/static/consignment/type-icon.png) no-repeat 0 0;
      background-size: 100%;
    }
  }
}
.thumbnail{
  width: 240rpx;
  height: 240rpx;
}
.title {
  margin-left: 20rpx;
  font-size: 36rpx;
  font-weight: bold;
}
.consignment-main {
  flex: 1;
  margin-left: 10px;
  .price{
    margin: 16rpx 0;
    color: #f00;
    font-weight: bold;
    font-size: 24rpx;
  }
}
.author-avatar{
  width: 88rpx;
  height: 88rpx;
  background: #BFBFBF;
  border-radius: 50%;
}
.author{
  color: #202020;
}
.total,
.time{
  color: #ABABAB;
}

.operation-btn{
  text-align: center;
  line-height: 60rpx;
  width: 380rpx;
  height: 60rpx;
  background: #F0A637;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  border-radius: 30rpx;
  font-weight: bold;
}

</style>
