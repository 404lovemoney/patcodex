<route lang="jsonc" type="page">
    {
      "layout": "default",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "可提货商品列表"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'Delivery',
})

import { useUserStore } from '@/store'

// pinia
const userStore = useUserStore()

import { useToast } from 'wot-design-uni'

const { show: showToast, loading: showLoading, close: hideLoading } = useToast()

import deliveryBar from "../components/delivery-bar/index.vue";


// 列表
const productList = ref<any[]>([])
// 已选中的列表
const selectedProductList = ref<any[]>([])

// 底部Bar数据
const deliveryBarData = ref<any | null>(null)
deliveryBarData.value = {
  isAllSelected: false,
  selectedGoodsCount: 0,
  totalAmount: 0
}

onLoad(async (option) => {
  console.log("onLoad")
  // showToast('请选择商品')

  // 获取路由参数
  const data = JSON.parse(decodeURIComponent(option.data))
  console.log('options data', data)
  productList.value = data
})

onMounted(async () => {
  console.log("onMounted")
  init()
})

onShow(() => {
  console.log("onShow")
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

// 筛选出待领取选中项的主键ID
const selectedProductIdsString = computed(() => {
  let ProductIds = selectedProductList.value.map(item => item.id)
  console.log(ProductIds.join(','));
  return ProductIds.join(',')
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
    deliveryBarData.value.selectedGoodsCount = selectedProductList.value.length
    console.log('selectedGoodsCount', deliveryBarData.value.selectedGoodsCount);
    // 计算选中项的积分数量
    let selectedProductExchangePriceList = selectedProductList.value.map(item => parseInt(item.exchangePrice))
    // console.log('selectedProductExchangePriceList', selectedProductExchangePriceList)
    if (selectedProductExchangePriceList.length) {
      deliveryBarData.value.totalAmount = selectedProductExchangePriceList.reduce((prev, cur, index, arr) => {
        // console.log(prev, cur, index);
        return prev + cur;
      })
    } else {
      deliveryBarData.value.totalAmount = 0
    }
    console.log('deliveryBarData.value.totalAmount', deliveryBarData.value.totalAmount);
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
      deliveryBarData.value.isAllSelected = true
    } else {
      deliveryBarData.value.isAllSelected = false
    }
  },
  {
    deep: true,
    immediate: true
  }
)

// 底部Bar全选操作
function onDeliverySelectAll(event) {
  console.log('event----', event)
  deliveryBarData.value.isAllSelected = !event.isAllSelected
  // 调用接口改变全选
  if (deliveryBarData.value.isAllSelected) {
    checkAllProductListHandle()
  } else {
    removeAllProductListHandle()
  }
}

// 列表全选
const checkAllProductListHandle = () => {
  console.log('checkAllProductListHandle')
  productList.value.forEach(item => {
      item.isSelected = true
  })
}

// 列表取消全选
const removeAllProductListHandle = () => {
  console.log('removeAllProductListHandle')
  productList.value.forEach(item => {
      item.isSelected = false
  })
}

// 修改某项选中状态
const reliveryItemSelectHandle = (id) => {
  console.log('curerent id', id)
  productList.value.forEach(item => {
    if (item.id === id) {
      item.isSelected = !item.isSelected
    }
  })
}

// 前往提货确认订单
const onToDeliveryOrderHandle = () => {
  console.log('即将跳转至确认订单')
  // GetdeliveryProductHandle()
  console.log('selectedProductList', selectedProductList.value)

  uni.navigateTo({
    url: '/pages/box/order/index?data=' + encodeURIComponent(JSON.stringify(selectedProductList.value)),
    success: function(res) {
      // 通过 eventChannel 向被打开页面传送数据
    }
  })
}

</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="'可提货商品'"
      page-name="deliveryPage"
      :show-icon="true"
      color="#fff"
    >
    </custom-nav-bar>

    <!-- 可提货商品列表 -->
    <view class="blind-box-item flex items-center" v-for="item in productList" :key="item.id">
        <view class="mr-2">
          <wd-icon
            size="40rpx"
            :color="item.isSelected ? '#FA4126' : '#BBBBBB'"
            :name="item.isSelected ? 'check-circle-filled' : 'circle'"
            class="cart-store__check"
            @click="reliveryItemSelectHandle(item.id)"
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

    <footer-tool-bar :safe-area-inset-bottom="true">
      <!-- delivery bar -->
      <delivery-bar
        :is-all-selected="deliveryBarData.isAllSelected"
        :total-amount="deliveryBarData.totalAmount"
        :total-goods-num="deliveryBarData.selectedGoodsCount"
        @handleToDeliveryOrder="onToDeliveryOrderHandle"
        @onDeliverySelectAll="onDeliverySelectAll"
      />
    </footer-tool-bar>

  </view>
</template>

<style lang="scss" scoped>
.wrapper {
  background: #f5f5f5;
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
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
  height: 480px;
  padding: 10px;

  .confirm-title {
    padding: 5px 10px;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
  }

  .confirm-group{
    height: 330px;
  }

  .confirm-btn{
    padding-bottom: 10px;
    text-align: center;
  }
}

</style>
