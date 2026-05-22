<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationBarTitleText": "可分解商品列表"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'Dismantle',
})

import { 
  fectchProductList,
  GetDismantleProduct
} from '@/api/boxInfo';

import { useUserStore } from '@/store'

// pinia
const userStore = useUserStore()

import { useToast } from 'wot-design-uni'
const {
  show: showToast,
  loading: showLoading,
  close: hideLoading,
} = useToast()

import dismantleBar from "../components/dismantle-bar/index.vue";


// 列表
const productList = ref<any[]>([])
// 已选中的列表
const selectedProductList = ref<any[]>([])

// 分解确认弹层显示状态
const dismantleConfirmPopupShow = ref<boolean>(false)

// 底部Bar数据
const dismantleBarData = ref<any | null>(null)
dismantleBarData.value = {
  isAllSelected: false,
  selectedGoodsCount: 0,
  totalAmount: 0
}

// 关闭确认弹层
function handleOrderConfirmPopupClose() {
  dismantleConfirmPopupShow.value = false;
}

onLoad(async (option) => {
  console.log("onLoad");
  // 获取路由参数
  const data = JSON.parse(decodeURIComponent(option.data));
  console.log('options data', data);
  productList.value = data
})

onMounted(async () => {
  console.log("onMounted");
  init()
})

onShow(() => {
  console.log("onShow");
  init()
})

// 初始化，请求列表
const init = async ()=> {
  if (userStore.isLoggedIn()) {
    console.log('已登录')
  } else {
    console.log('未登录')
  }
}

// 将待领取选中项的主键ID转换为字符串
const selectedProductIdsString = computed(() => {
  return selectedProductIds.value.join(',')
})

// 筛选出待领取选中项的主键ID
const selectedProductIds = computed(() => {
  return selectedProductList.value.map(item => item.id)
})

// 监听列表，筛选出选中的项，组成新数组等
watch(
  () => productList.value,
  (newValue) => {
    console.log('watch', newValue)
    selectedProductList.value = newValue.filter((item) => {
      return item.isSelected === true
    })
    console.log('watch selectedProductOrderNO', selectedProductList.value)
    // 计算选中项的数量
    dismantleBarData.value.selectedGoodsCount = selectedProductList.value.length
    console.log('selectedGoodsCount', dismantleBarData.value.selectedGoodsCount);
    // 计算选中项的积分数量
    let selectedProductExchangePriceList = selectedProductList.value.map(item => parseInt(item.exchangePrice))
    // console.log('selectedProductExchangePriceList', selectedProductExchangePriceList)
    if (selectedProductExchangePriceList.length) {
      dismantleBarData.value.totalAmount = selectedProductExchangePriceList.reduce((prev, cur, index, arr) => {
        // console.log(prev, cur, index);
        return prev + cur;
      })
    } else {
      dismantleBarData.value.totalAmount = 0
    }
    console.log('dismantleBarData.value.totalAmount', dismantleBarData.value.totalAmount);
  },
  {
    deep: true,
    immediate: true
  }
)

// 监听已选中列表项
watch(
  () => selectedProductList.value,
  (newValue) => {
    console.log('watch', newValue)

    // 商品项都选中时，设置底部导航全选框状态为选中
    // 商品项没有全选时（含选中项为空）设置底部导航全选框状态为未选中
    if (selectedProductList.value.length == productList.value.length) {
      dismantleBarData.value.isAllSelected = true
    } else {
      dismantleBarData.value.isAllSelected = false
    }
  },
  {
    deep: true,
    immediate: true
  }
)


// 分解商品Handle
const GetDismantleProductHandle = async () => {

  // 先关闭弹层
  handleOrderConfirmPopupClose()

  // 判断是否有选中项
  if (selectedProductIdsString.value === '') {
    showToast('请选择要分解的商品')
    return false
  }

  try {
    // 调用API
    const response = await GetDismantleProduct({
      id: selectedProductIdsString.value
    })
    console.log('fectchProductList response', response)

    // 从商品列表中删除已分解的项
    productList.value = productList.value.filter(item => !selectedProductIds.value.includes(item.id))
    // 更新用户积分
    userStore.increasePoints(response.points)

    uni.showToast({
      title: '分解成功',
      icon: 'success',
      duration: 2000
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




// 底部Bar全选操作
function onReceiveSelectAll(event) {
  console.log('event', event)
  dismantleBarData.value.isAllSelected = !event.isAllSelected
  // 调用接口改变全选
  if (dismantleBarData.value.isAllSelected) {
    checkAllProductListHandle()
  } else {
    removeAllProductListHandle()
  }
}

// 列表全选
const checkAllProductListHandle = () => {
  productList.value.forEach(item => {
      item.isSelected = true
  })
}

// 列表取消全选
const removeAllProductListHandle = () => {
  productList.value.forEach(item => {
      item.isSelected = false
  })
}

// 修改某项选中状态
const receiveItemSelectHandle = (id) => {
  console.log('curerent id', id)
  productList.value.forEach(item => {
    if (item.id === id) {
      item.isSelected = !item.isSelected
    }
  })
}


// 选中项分解操作
const onToDismantleHandle = () => {
  dismantleConfirmPopupShow.value = true;
  // GetDismantleProductHandle()
}
</script>

<template>
  <view class="wrapper">
    <!-- 当前积分，需动态更新 -->
    <view class="user-points">
      <view class="title">当前积分</view>
      <view class="mt-2 points-num">{{ userStore.userInfo.points }}</view>
    </view>

    <!-- 可分解商品列表 -->
    <view class="blind-box-item flex items-center" v-for="item in productList" :key="item.id">
        <view class="mr-2">
          <wd-icon
            size="40rpx"
            :color="item.isSelected ? '#FA4126' : '#BBBBBB'"
            :name="item.isSelected ? 'check-circle-filled' : 'circle'"
            class="cart-store__check"
            @click="receiveItemSelectHandle(item.id)"
          />
        </view>
        <view class="thumbnail">
          <wd-img
            :width="80"
            :height="80"
            radius="10"
            :src="item.icon"
          />
        </view>
        <view class="blind-box-main">
          <view class="title pb-5">{{ item.name }}</view>
          <wd-text :text="'积分 ' + item.exchangePrice || 0" size="16px" color="#F95133" bold></wd-text>
        </view>
    </view>
      
    <!-- dismantle bar -->
    <dismantle-bar
      :is-all-selected="dismantleBarData.isAllSelected"
      :total-amount="dismantleBarData.totalAmount"
      :total-goods-num="dismantleBarData.selectedGoodsCount"
      :fixed="true"
      @handleToDismantle="onToDismantleHandle"
      @handleSelectAll="onReceiveSelectAll"
    />

    <!-- 确认弹出层 -->
    <wd-popup v-model="dismantleConfirmPopupShow" position="bottom" :safe-area-inset-bottom="true" custom-style="border-radius:16rpx;" @close="handleOrderConfirmPopupClose">
      <view class="order-confirm">
        <view class="confirm-title">
          <wd-text text="确认分解" color="#333" bold></wd-text>
          <wd-icon name="arrow-down" size="22px" @click="dismantleConfirmPopupShow = false"></wd-icon>
        </view>

        <scroll-view scroll-y class="confirm-group">
          <template v-if="selectedProductList.length">
              <view class="blind-box-item flex items-center" v-for="item in selectedProductList" :key="item.id">
                <view class="thumbnail">
                  <wd-img
                    :width="80"
                    :height="80"
                    radius="10"
                    :src="item.icon"
                  />
                </view>
                <view class="blind-box-main">
                  <view class="title pb-5">{{ item.name }}</view>
                  <wd-text :text="'积分 ' + item.exchangePrice || 0" size="16px" color="#F95133" bold></wd-text>
                </view>
              </view>
          </template>
          <template v-else>
            <wd-status-tip image="content" tip="还没有选择待分解商品" />
          </template>
        </scroll-view>

        <view class="p-5 flex justify-between">
          <view>总价值：</view>
          <view><wd-text :text="dismantleBarData.totalAmount + '积分'" size="18px" color="#F95133" bold></wd-text></view>
        </view>

        <view class="confirm-btn" @click="GetDismantleProductHandle">
          <text>分解</text>
        </view>

      </view>
    </wd-popup>
  </view>
</template>

<style lang="scss" scoped>
.wrapper {
  background: #f5f5f5;
  height: 100vh;
}

.user-points{
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #2E4241;
  color: #fff;
  padding-left: 20px;
  .title {

  }
  .points-num{
    font-size: 18px;
    font-weight: bold;
  }
}

.content{
  background: #F5F5F5;
}
.blind-box-item {
  font-size: 14px;
  margin: 10px 10px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  background: #fff;
  border-radius: 10px;
}
.thumbnail{
  width: 120px;
}
.blind-box-main {
  flex: 1;
  margin-left: 10px;
  .title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  .price{
    color: #f00;
    font-weight: bold;
  }
}

.order-confirm{
  height: 500px;
  padding: 10px;

  .confirm-title {
    padding: 5px 10px;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
  }

  .confirm-group{
    height: 330px;
    overflow-y: auto;
  }

  .confirm-btn{
    margin: 0 auto;
    padding-bottom: 10px;
    text-align: center;
    width: 670rpx;
    height: 82rpx;
    line-height: 82rpx;
    background: url(https://img.niantu.cn/spark-mall/static/box/confirm-btn-bg.png) no-repeat 0 0;
    background-size: 670rpx 82rpx;
    color: #fff;
  }
}

</style>
