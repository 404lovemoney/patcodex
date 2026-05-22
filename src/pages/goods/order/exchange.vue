<route lang="jsonc" type="page">
    {
      "layout": "default",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "确认订单"
      }
    }
 </route>

<script lang="ts" setup>
defineOptions({
  name: 'GoodsOrder',
})

import { ref, computed } from 'vue'
import { useToast, useMessage } from 'wot-design-uni'

import { getExchangeProduct } from '@/api/goods';
import { commonOrderPay, wxOrderPay } from '@/api/payment';

import exchangeBar from './components/exchange-bar/index.vue'

import { setPreviousPage, removePreviousPage } from '@/utils/util'
import { 
  fetchProductList,
} from '@/api/boxInfo';
// import { getBoxDraw } from '@/api/boxInfo';
import Big from 'big.js';

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

const {
  show: showToast,
  loading: showLoading,
  close: hideLoading,
} = useToast()

const { alert, confirm } = useMessage()

onLoad((options) => {
  console.log('onLoad', options)
  defaultGoodsOrderData.value = JSON.parse(options.data);
  console.log('defaultGoodsOrderData======', defaultGoodsOrderData.value);

  buyType.value = defaultGoodsOrderData.value.buyType
  buyGoodsNum.value = defaultGoodsOrderData.value.buyGoodsNum

  // 收货地址id
  addressId.value = userStore.userAddress.id || 0

  initData()
})

onMounted(() => {
  console.log("onMounted");  
})

onShow(async () => {
  console.log("onShow")
  // 更新用户积分信息
  await userStore.getUserInfo()
})

// 数据初始化
const initData = async () => {
  // 获取升级物品列表（盒柜待领取列表）
  await fetchProductListHandle()
}

// 商品信息
const defaultGoodsOrderData = ref<any | null>({
  goodsId: '',
  goodsIcon: '',
  goodsExchangePrice: ''
})

// 购买类型
const buyType = ref('') 

// 余额支付开关
const isBalanceDeduction = ref(false) 

// 商品数量
const buyGoodsNum = ref<number>(1)

// 收货地址
const addressId = ref<number>(0)

// 积分开关
const pointsSwitchVal = ref<boolean>(true)

// 待领取列表
const productList = ref<any[]>([])

// 已选中的待领取列表
const selectedProductList = ref<any[]>([])

// 升级物品是否全选状态
const isAllSelected = ref<boolean>(false)

// 底部Bar数据
const exchangeBarData = ref<any | null>({
  isAllSelected: false,
  selectedBlindBoxCount: 0,
  totalAmount: 0
})

// 总运费 商品单个运费*数量
const shippingFeeAmount = computed(() => {
  // console.log('totalDiscountAmount', buyGoodsNum.value * parseInt(goodsInfo.value.premium))
  return buyGoodsNum.value * parseInt(defaultGoodsOrderData.value.goodsShippingFee)
})

// 兑换进度积分（已勾选总积分 + 用户现有积分）
const progressTotalPoints = computed(() => {
  if (pointsSwitchVal.value) {
    return parseInt(exchangeBarData.value.totalAmount) + userStore.userInfo.points
  } else {
    return parseInt(exchangeBarData.value.totalAmount)
  }
})

// 积分百分比
const progressPercentage = computed(() => {
  console.log('progressTotalPoints-------', progressTotalPoints.value)
  if (buyGoodsPointsAmount.value === 0 || progressTotalPoints.value === 0) {
    return '0%'
  } else {
    let divisor = new Big(buyGoodsPointsAmount.value)
    let dividend = new Big(progressTotalPoints.value)
    let percentage = dividend.div(divisor).times(100).round(2,1).toString() + '%'
    return percentage
  }
  // percentage.round(2,1).toString()
})


// 传递给接口的积分计算
// 实际需要使用的积分数 
// 例1：要兑换的 商品 是1200 积分，选择的商品 是 1000积分 用户 有500积分 这时候 还需要扣减 200  就传 200
// 例2：要兑换的 商品 是1200 积分，选择的商品 是 1500积分 用户 有500积分 这时候 不需要 扣减  就传 0
const pointsAmount = computed(() => {
  console.log('商品所需积分--', buyGoodsPointsAmount.value)
  console.log('已选升级物品可兑换积分--', exchangeBarData.value.totalAmount)
  console.log('用户余额积分--', userStore.userInfo.points)
  if (exchangeBarData.value.totalAmount > buyGoodsPointsAmount.value) {
    return 0
  } 
  // 升级物品积分 + 用户当前积分 大于等于商品所需积分时，传差值
  else if ((exchangeBarData.value.totalAmount + userStore.userInfo.points) > buyGoodsPointsAmount.value) {
    let difference = (exchangeBarData.value.totalAmount + userStore.userInfo.points) - buyGoodsPointsAmount.value
    // 实际用的积分为当前积分减去差值
    let actualPoints = userStore.userInfo.points - difference
    return actualPoints
  }
  return -999 // 积分不足标识
})

// 商品所需总积分
const buyGoodsPointsAmount = computed(() => {
  // console.log('totalDiscountAmount', buyGoodsNum.value * parseInt(goodsInfo.value.premium))
  return buyGoodsNum.value * parseInt(defaultGoodsOrderData.value.goodsExchangePrice)
})

// 支付类型
const payType = computed(() => {
  // console.log('totalDiscountAmount', buyGoodsNum.value * parseInt(goodsInfo.value.premium))
  return buyType.value === 'exchange' ? 2 : 1
})

// 商品总价
const goodsSumPrice =  computed(() => {
  return buyGoodsNum.value * parseInt(defaultGoodsOrderData.value.goodsPremium)
})

// 筛选出待领取选中项的订单号
const selectedProductIdsString = computed(() => {
  let productIds = selectedProductList.value.map(item => item.id)
  console.log(productIds.join(','));
  return productIds.join(',')
})


// 监听升级物品列表，筛选出选中的项
watch(
  () => productList.value,
  (newValue) => {
    console.log('watch', newValue)
    selectedProductList.value = newValue.filter((item) => {
      return item.isSelected === true
    })
    // 商品项都选中时，设置底部导航全选框状态为选中
    // 商品项没有全选时（含选中项为空）设置底部导航全选框状态为未选中
    if (selectedProductList.value.length == productList.value.length) {
      isAllSelected.value = true
    } else {
      isAllSelected.value = false
    }
    console.log('watch selectedProductList', selectedProductList.value)

  },
  {
    deep: true,
    immediate: true
  }
)

// 监听已选中物品列表项
watch(
  () => selectedProductList.value,
  (newValue) => {
    // 计算选中项的数量
    exchangeBarData.value.selectedBlindBoxCount = selectedProductList.value.length
    console.log('selectedBlindBoxCount', exchangeBarData.value.selectedBlindBoxCount);
    // 计算选中项的积分数量
    let selectedBlindBoxExchangePriceList = selectedProductList.value.map(item => parseInt(item.exchangePrice))
    // console.log('selectedProductExchangePriceList', selectedProductExchangePriceList)
    if (selectedBlindBoxExchangePriceList.length) {
      exchangeBarData.value.totalAmount = selectedBlindBoxExchangePriceList.reduce((prev, cur, index, arr) => {
        // console.log(prev, cur, index);
        return prev + cur;
      }, 0)
    } else {
      exchangeBarData.value.totalAmount = 0
    }
  },
  {
    deep: true,
    immediate: true
  }
)

// 是否加载中标记，用于防止滚动触底触发多次请求
const isLoading = ref(false)

// 是否分页结束
const isFinish = ref(false)

// 是否触发下拉刷新
const isTriggered = ref(false)

// 分页数据
const listPagination = reactive({
  page: 1,
  pageSize: 10,
})

// 自定义下拉刷新被触发
// const onRefresherrefresh = async () => {
//   // 开始动画
//   isTriggered.value = true
//   // 重置数据
//   listPagination.page = 1
//   productList.value = []
//   isFinish.value = false
//   // 加载数据
//   await fetchProductListHandle()
//   // 关闭动画
//   isTriggered.value = false
// }


// 加载待领取列表
const fetchProductListHandle = async () => {
  // 如果数据出于加载中，退出函数
  if (isLoading.value) return
  // 退出分页判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据~' })
  }
  // 发送请求前，标记为加载中
  isLoading.value = true

  // console.log('params', params)

  // 发送请求
  const res = await fetchProductList(listPagination)

  // 发送请求后，重置标记
  isLoading.value = false

  // 数组追加
  productList.value.push(...res.productList)

  // 总页数
  const totalPages = res.pagination.lastPage
  console.log('totalPages', totalPages)

  // 最后一页处理 
  if (listPagination.page === totalPages) {
    // 分页已结束
    isFinish.value = true
  } else {
    listPagination.page++
  }
}

// 加载待领取列表
// const fetchProductListHandle = async () => {
//   try {
//     // 调用API
//     const response = await fetchProductList()
//     console.log('fetchProductList response', response)
//     productList.value = response
//     if (productList.value.length) {
//       productList.value.forEach((item => {
//         item.isSelected = false
//       }))
//     }
//     console.log('new selected', productList.value);
//   } catch (error: any) {
//     uni.showToast({
//       title: error.message || '出错了，请重试',
//       icon: 'none',
//       duration: 2000
//     })
//   } finally {
//   }
// }

// 全选操作
function onClickSelectAll() {
  isAllSelected.value = !isAllSelected.value
  // 调用接口改变全选
  if (isAllSelected.value) {
    checkAllProductListHandle()
  } else {
    removeAllProductListHandle()
  }
}
// 升级物品列表（待领取列表）全选
const checkAllProductListHandle = () => {
  productList.value.forEach(item => {
      item.isSelected = true
  })
}

// 升级物品列表（待领取列表）取消全选
const removeAllProductListHandle = () => {
  productList.value.forEach(item => {
      item.isSelected = false
  })
}

// 修改物品列表某项选中状态
const receiveItemSelectHandle = (id) => {
  console.log('curerent id', id)
  productList.value.forEach(item => {
    if (item.id === id) {
      item.isSelected = !item.isSelected
    }
  })
}

// 提交订单
function onToSettle() {
  if (userStore.isLoggedIn()) {
    // 积分不足时先提示
    if (pointsAmount.value === -999) {
      showToast('所选物品积分不足兑换')
      return
    }
    // 判断地址是否选择收货地址
    if (addressId.value === 0) {
      showToast('请选择收货地址')
      return
    }
    // 调用兑换升级商品
    getExchangeProductHandle()
  }
}

// 创建订单 创建订单，然后调 支付，
// 如果有现金支付的话 会返回跳转链接。
const getExchangeProductHandle = async () => {
  try {
    // 调用API
    const response = await getExchangeProduct({
      id: parseInt(defaultGoodsOrderData.value.goodsId), // 商品id
      count: buyGoodsNum.value, // 个数
      shippingFee: shippingFeeAmount.value, // 运费
      points: pointsAmount.value, // 积分
      balance: 0, // 使用的余额
      addressId: addressId.value, // 地址id
      resultIds: selectedProductIdsString.value, // 盒柜商品主键id，多个id 以逗号分隔
    })

    console.log('orderNo-----', response.orderNo)

    // todo 调用订单支付 
    // todo 余额够的时候发起请求直接生成订单号。但是不走支付渠道，不掉起 第三方支付。但支付 那一步还是要走
    // todo 更新本地用户信息（积分）

    // #ifdef MP-WEIXIN
    console.log("运行在微信小程序中");
      wxPayHandle(response.orderNo)
    // #endif
    
    // #ifndef MP-WEIXIN
      // 调用支付
      goodsOrderPayHandle(response.orderNo)
    // #endif


  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}


// 微信小程序支付
const wxPayHandle = async (orderNo) => {
  console.log('wxPayHandle--------')
  try {
    // 调用API
    const res = await wxOrderPay({
      orderNo: orderNo,
      openId: uni.getStorageSync('openId') || ''
    })

    console.log('wxPayHandle res', res)

    // 有现金支付才会返回微信支付相关参数
    // 有参数调起微信支付
    // 没有参数继续后续流程
    if (res.package && res.paySign && res.signType) {
      // 调起微信支付
      wx.requestPayment
        (
          {
            "timeStamp": res.timeStamp,
            "nonceStr": res.nonceStr,
            "package": res.package,
            "signType": res.signType,
            "paySign": res.paySign,
            "success": function(res){
              console.log('wxRequestPayment success ------', res)
              paySuccess(orderNo)
            },
            "fail":function(res){
              console.log('fail', res)
              payFail(orderNo)
            },
            "complete":function(res){
              console.log('complete', res)
            }
          }
        )
    } else {
      paySuccess(orderNo)
    }

  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

// 调用通用支付
const goodsOrderPayHandle = async (orderNo) => {
  try {
    // 调用API
    const response = await commonOrderPay({
      orderNo: orderNo
    })

    uni.showToast({
      title: '支付成功',
      icon: 'success'
    })

    // 支付成功后续操作
    paySuccess(orderNo)

  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

// 支付成功后调用
const paySuccess = (orderNo) => {
  uni.showToast({
    title: '支付成功',
    icon: 'success'
  })

  // 支付成功后续操作
  // 跳转到用户中心
  setTimeout(() => {
    uni.redirectTo({
      url: `/pages-order/result/index?isPaySuccess=true&orderNo=${orderNo}`,
      success(res) {
        console.log('跳转成功')
      }
    })
  }, 1000)
}

// 支付失败后调用
const payFail = (orderNo) => {
  uni.showToast({
    title: '支付失败',
    icon: 'none'
  })

  // 支付失败后续操作
  setTimeout(() => {
    uni.redirectTo({
      url: `/pages-order/result/index?isPaySuccess=false&orderNo=${orderNo}`,
      success(res) {
      }
    })
  }, 1000)
}

</script>

<template>
  <!-- 商品订单页  -->
  <view class="order-page box-border w-full">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="'确认订单'"
      page-name="goodsExchange"
      :show-icon="true"
    >
    </custom-nav-bar>

    <!-- 首选收货地址组件 -->
    <preferred-address origin-page="goodsExchange"  />

    <!-- 收货地址 -->
    <!-- <view v-if="userStore.isFirstAddress()" class="address pt-5 pb-5 pl-5 flex justify-between items-center">
      <view class="item-content">
          <view class="user">
            {{ userStore.userAddress.contactName }}
            <text class="contact">{{ userStore.userAddress.contactPhone }}</text>
          </view>
          <view class="locate">{{ userStore.userAddress.province + userStore.userAddress.city + userStore.userAddress.district + userStore.userAddress.detailAddress }}</view>
        </view>
        <wd-icon class="mr-2" name="a-chevron-rightdouble" size="24px" @click="goAddressListHandle"></wd-icon>
    </view>
    <view v-else class="address pt-5 pb-5 pl-5">
      <view class="flex flex-items-center" @click="goCreateAddressHandle">
        <view class="create_address_icon mr-1"></view>
        添加收货地址
      </view>
    </view> -->

    <view class="goods-order-info">

      <view class="flex goods-intro pr-5">

        <view class="goods-pic mt-5 mb-5 ml-5 mr-5">
          <wd-img
            :width="80"
            :height="80"
            :src="defaultGoodsOrderData.goodsIcon"
          />
        </view>

        <view class="flex-1">

          <view class="goods-name mb-5 mt-6">
            <wd-text :text="defaultGoodsOrderData.goodsName" size="18px" bold color="020202" />
          </view>

          <view class="flex items-center justify-between">
            <view class="flex items-center">
                <view class="points-icon mr-1"></view>
                <view class="point spec-for-point">
                  {{ defaultGoodsOrderData.goodsExchangePrice + '积分' }}
                </view>
            </view>
          </view>

        </view>

      </view>

      <view class="flex flex-justify-between num mt-2 pb-5 pl-5">
        <view class="">
          数量
        </view>
        <view>
          <wd-input-number v-model="buyGoodsNum" />
        </view>
      </view>

      <view class="shippingFee flex flex-justify-between pt-2 pb-2 pl-5 pr-5">
        <view class="">
          运费
        </view>
        <view>
          {{ '￥' + shippingFeeAmount }}
        </view>
      </view>

      <view class="flex flex-justify-between progress mt-2 pb-5 pl-5 pr-5">
        <view class="">
          兑换进度 {{ progressPercentage }}
        </view>
        <view class="flex items-center">
          <view class="points-icon mr-1"></view>
          <view class="point spec-for-point" style="font-size: 24rpx;">
            {{ progressTotalPoints + '/' + buyGoodsPointsAmount }}
          </view>
        </view>
      </view>

      <view class="flex flex-justify-between num mt-2 pb-5 pl-5 pr-2">
        <view class="">
          积分账号拥有 <wd-text class="ml-1 mr-1" :text="userStore.userInfo.points" color="#787878" bold size="24rpx"></wd-text>
        </view>
        <view>
          <wd-switch v-model="pointsSwitchVal" size="32rpx" />
        </view>
      </view>

      <view class="flex flex-justify-between num mt-2 pb-5 pl-5 pr-2">
        <view class="flex items-center">
          <text class="mr-2">选择兑换物品</text>
          <wd-button size="small" custom-class="checkAll-btn" @click="onClickSelectAll">全选</wd-button>
        </view>
        <view class="flex items-center">
          <text class="mr-2">已选 {{ selectedProductList.length + '个' }}</text>
          <view class="flex items-center">
            <view class="points-icon mr-1"></view>
            <view class="point spec-for-point" style="font-size: 24rpx;">
              {{ exchangeBarData.totalAmount + '积分' }}
            </view>
          </view>
        </view>
      </view>

    </view>

    <!-- 升级物品列表（待领取商品列表） -->
    <scroll-view
      enable-back-to-top
      scroll-y
      class="products"
      @scrolltolower="fetchProductListHandle"
    >
      <view class="lists" v-if="productList.length">
        <view class="blind-box-item flex items-center" v-for="item in productList" :key="item.id">
            <view class="check-icon">
              <wd-icon
                size="40rpx"
                :color="item.isSelected ? '#FA4126' : '#BBBBBB'"
                :name="item.isSelected ? 'check-rectangle-filled' : 'rectangle'"
                @click="receiveItemSelectHandle(item.id)"
              />
            </view>
            <view class="thumbnail">
              <wd-img
                width="100%"
                height="100%"
                radius="10"
                :src="item.icon"
              />
            </view>
            <view class="title">{{ item.name }}</view>
        </view>
      </view>
    </scroll-view>

    <view class="tips">
      <wd-text text="提示：商品购买后，3-7个工作日发货。平台包邮" color="#fff"></wd-text>
    </view>

    <!-- <view class="check_tips pt-20 pb-10 text-center">
      <wd-icon name="check-circle-filled" size="18px" color="#4D5F95"></wd-icon>
      <text>我已满18岁，阅读并同意</text>
      <text>《支付协议》</text>
    </view> -->

    <footer-tool-bar :safe-area-inset-bottom="true">
      <!-- 订单 Bar -->
      <exchange-bar
        :total-amount="1"
        :total-points-amount="buyGoodsPointsAmount"
        :total-goods-num="buyGoodsNum"
        :total-shipping-fee="shippingFeeAmount"
        :buy-type="buyType"
        :fixed="true"
        :bottomHeight="0"
        @handleToSettle="onToSettle"
      />
    </footer-tool-bar>
  </view>
</template>

<style lang="scss" scoped>
.order-page {
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  box-sizing: border-box;
  background: #f5f5f5;
}

.products{
  min-height: 280rpx;
  max-height: 600rpx;
}
.lists{
  padding: 0rpx 20rpx;
  display: grid;
  justify-content: space-between;
  grid-template-columns: repeat(auto-fill, 222rpx);
  grid-gap: 0rpx; // grid-gap属性是grid-column-gap和grid-row-gap的合并简写形式 如果grid-gap省略了第二个值，浏览器认为第二个值等于第一个值。
  .blind-box-item{
    position: relative;
    margin: 10rpx 0;
    width: 222rpx;
    height: 244rpx;
    .thumbnail{
      width: 222rpx;
      height: 222rpx;
    }
    .check-icon{
      position: absolute;
      top: 20rpx;
      left: 10rpx;
      width: 40rpx;
      height: 40rpx;
      z-index: 1;
    }
    .title{
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 54rpx;
      line-height: 54rpx;
      text-align: center;
      font-size: 24rpx;
      color: #fff;
      background-color: #FC8B1C;
      border-bottom-left-radius: 14rpx;
      border-bottom-right-radius: 14rpx;
    }
  }
}

.checkAll-btn{
  background: #FC8B1C !important;
}
.goods-order-info{
  background: #fff;
}
.goods-intro{
  border-bottom: 1px solid #ccc;
}
.goods-pic {
  text-align: center;
}

.goods-currency{
  color: #F24600;
  font-size: 36rpx;
  font-weight: bold;
}
.balance-icon{
  width: 88rpx;
  height: 44rpx;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 100% 100%;
}
.lock-icon{
  background-image: url(https://img.niantu.cn/spark-mall/static/lock-icon.png);
}
.unlock-icon{
  background-image: url(https://img.niantu.cn/spark-mall/static/unlock-icon.png);
}
.remark{
  color: #bcbcbc;
}

.progress,
.num {
  padding-bottom: 8px;
  border-bottom: 1px solid #ccc;
}
.balance-deduction,
.shippingFee{
  border-bottom: 1px solid #ccc;
}
.pay-weixin{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px;
  background: #E5F8F8;
  border-radius: 10rpx;
}
.tips{
  margin-top: 10rpx;
  padding: 0 20rpx;
  line-height: 70rpx;
  background-color: #24AB97;
}
.goods-info{
  padding: 20px;
}
.points-icon{
  width: 24rpx;
  height: 24rpx;
  background: url(https://img.niantu.cn/spark-mall/static/points-icon.png) no-repeat 0 0;
  background-size: 100% 100%;
}

.spec-for-point{
  font-size: 32rpx;
  font-weight: 700;
  color: #E57143;
}
</style>
