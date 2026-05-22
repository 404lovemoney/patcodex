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

import { createGoodsOrder } from '@/api/goods';
import { commonOrderPay, wxOrderPay } from '@/api/payment';

import purchaseBar from './components/purchase-bar/index.vue'
import { setPreviousPage, removePreviousPage } from '@/utils/util'
import { formatNumberToZeroString } from '@/utils/util'
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

onMounted(async () => {
  console.log("onMounted");
})

onShow(async () => {
  console.log("onShow");
  // 未登录时设置，登录后清除
  if (userStore.isLoggedIn()) {
    removePreviousPage()
  } else {
    // 记录路由地址
    setPreviousPage()
  }
})

// 数据初始化
const initData = async () => {
}

// 初始订单数据
const defaultGoodsOrderData = ref<any | null>({})

// 购买类型
const buyType = ref('') 

// 余额支付开关
const isBalanceDeduction = ref(false) 

// 收货地址
const addressId = ref<number>(0)

// 商品数量
const buyGoodsNum = ref<number>(1)

// 总价
const goodsSumPrice = computed(() => {
  return safeBig(buyGoodsNum.value).times(safeBig(defaultGoodsOrderData.value.goodsPremium).toFixed(2)).toNumber()
})

// 总价字符串
const goodsSumPriceString = computed(() => {
  return formatNumberToZeroString(goodsSumPrice.value, 2)
})

// 计算实际使用了多少余额
const actualBalance =  computed(() => {
  // 判断商品总价和余额的大小
  // 余额大时抵扣商品总价，
  // 余额小时抵扣余额
  // let testBalance = '22222.15'
  // let bigBalance = new Big(testBalance).round(2);
  // 保留两位小数，向下取整 比方说 0.119  就展示 0.11
  let bigBalance = safeBig(userStore.userInfo.balance).round(2, 1);
  let currentPrice = safeBig(goodsSumPrice.value).round(2, 1);
  console.log('Big balance --', bigBalance.toString());
  console.log('currentPrice--', currentPrice.toString());
  let difference = bigBalance.minus(currentPrice)
  console.log('difference', difference.toString())
  if (difference.gte(0)) {
    return currentPrice.toNumber()
  } else {
    return bigBalance.toNumber()
  }
})

// 直接购买时计算总价（根据是否使用余额）
const buyGoodsAmount = computed(() => {
  // 开启余额支付，判断商品总金额和余额的大小，余额大返回0，余额小显示差价
  let bigBalance = safeBig(userStore.userInfo.balance).round(2, 1);
  let currentPrice = safeBig(goodsSumPrice.value).round(2, 1);
  if (isBalanceDeduction.value) {
    let difference = bigBalance.minus(currentPrice)
    console.log('difference', difference)
    if (difference.gte(0)) {
      return 0
    } else {
      return -1 * difference.toNumber()
    }
  }
  return currentPrice.toNumber()
})

// 总积分
const buyGoodsPointsAmount = computed(() => {
  // console.log('totalDiscountAmount', buyGoodsNum.value * parseInt(goodsInfo.value.premium))
  return buyGoodsNum.value * parseInt(defaultGoodsOrderData.value.goodsExchangePrice)
})

// 支付类型
const payType = computed(() => {
  // console.log('totalDiscountAmount', buyGoodsNum.value * parseInt(goodsInfo.value.premium))
  return buyType.value === 'exchange' ? 2 : 1
})

// 是否需要选中微信支付
const isWxPay = computed(() => {
  // console.log('totalDiscountAmount', buyGoodsNum.value * parseInt(goodsInfo.value.premium))
  return buyGoodsAmount.value > 0 ? true : false
})

// 提交订单
function onToSettle() {
  if (userStore.isLoggedIn()) {
    // 判断地址是否选择收货地址
    if (addressId.value === 0) {
      showToast('请选择收货地址')
      return
    }
    // 调用商品下单
    createGoodsOrderHandle()
  } else {
    // 去登录 toto
      confirm({
        msg: '请先登录后，再提交订单',
        title: '登录提醒',
        confirmButtonText: '去登录',
        cancelButtonText: '取消'
      })
      .then(() => {
        console.log('点击了确定按钮')
        uni.navigateTo({
          url: '/pages/login/login'
        })
      })
      .catch(() => {
        console.log('点击了取消按钮')
      })
  }
}

// 确保输入值合法
const safeBig = (val: any): Big => {
  const num = Number(String(val).trim()) // 这里有个知识点，Number不会抛错，只会返回NaN
  return isFinite(num) ? new Big(num) : new Big(0)
}


// 创建订单 创建订单，然后调 支付，
// 如果有现金支付的话 会返回跳转链接。
const createGoodsOrderHandle = async () => {
  try {
    // 调用API
    const response = await createGoodsOrder({
      id: parseInt(defaultGoodsOrderData.value.goodsId), // 商品id
      payType: payType.value, // 支付类型 1 现金 2积分
      count: buyGoodsNum.value, // 个数
      totalPrice: goodsSumPrice.value, // 订单总金额
      points: buyGoodsPointsAmount.value, // 积分
      addressId: addressId.value, // 地址id
      balance: isBalanceDeduction.value ? actualBalance.value : 0 // 使用的余额
    })

    console.log('orderNo', response.orderNo)

    // todo 调用订单支付 
    // todo 余额够的时候发起请求直接生成订单号。但是不走支付渠道，不掉起 第三方支付。但支付 那一步还是要走

    // 更新用户余额
    if (isBalanceDeduction) {
      userStore.deductingBalance(actualBalance.value)
    } 

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

// 调用普通支付
const goodsOrderPayHandle = async (orderNo) => {
  try {
    // 调用API
    const response = await commonOrderPay({
      orderNo: orderNo
    })

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
      page-name="goodsPurchase"
      color="#fff"
      :show-icon="true"
    >
    </custom-nav-bar>

    <!-- 首选收货地址组件 -->
    <preferred-address origin-page="goodsPurchase" />

    <view class="goods-order-info">

      <view class="goods-intro-wrap">
        <view class="flex h-180rpx goods-intro bg-#fff">
          <view class="goods-pic flex justify-center items-center border-rd-10rpx">
            <wd-img
              width="90%"
              height="90%"
              :src="defaultGoodsOrderData.goodsIcon"
            />
          </view>
          <view class="flex-1 ml-10rpx">
            <view class="goods-name">
              <wd-text :text="defaultGoodsOrderData.goodsName" size="24rpx" color="212121" />
            </view>
            <view class="mt-20rpx text-26rpx color-#212121 fw-bold">
              {{ '￥' + defaultGoodsOrderData.goodsPremium }}
            </view>
          </view>
        </view>
      </view>

      <view class="order-item">
        <view class="">
          数量
        </view>
        <view>
          <wd-input-number v-model="buyGoodsNum" />
        </view>
      </view>

      <view class="order-item">
        <view class="">
          运费
        </view>
        <!-- 在立即购买和积分兑换的状态下，运费是包邮状态。不计算运费 -->
        <view v-if="buyType === 'exchange' || buyType === 'purchase' ">
          <text class="color-#929292">{{ '包邮' }}</text>
        </view>
        <view v-else>
          {{ '￥' + defaultGoodsOrderData.goodsShippingFee }}
        </view>
      </view>

      <!-- 商品总价仅直接购买展示 -->
      <view v-if="buyType === 'purchase'" class="order-item">
        <view class="">
          商品总价
        </view>
        <view class="goods-currency">
          {{ '￥' + goodsSumPriceString }}
        </view>
        <!-- <view class="goods-currency" v-if="buyType === 'exchange'">
          {{ buyGoodsPointsAmount + '积分' }} 
        </view> -->
      </view>

      <!-- 登录状态且直接购买时才显示余额 -->
      <view v-if="userStore.isLoggedIn() && buyType === 'purchase'" class="order-item">
        <view class="">
          余额抵扣
        </view>
        <view class="flex items-center">
          <text class="mr-15rpx color-#ff0c00">{{ '￥' + userStore.userInfo.balance }}</text>
          <wd-switch v-model="isBalanceDeduction" size="28rpx" active-color="#ff0c00" inactive-color="#C4C4C4" />
        </view>
      </view>

      <!-- 登录状态且直接购买时才显示备注 -->
      <view v-if="userStore.isLoggedIn() && buyType === 'purchase'" class="order-item">
        <view class="">
          备注信息
        </view>
        <view class="flex items-baseline">
          <text class="mr-5rpx color-#929292">{{ '选填备注信息' }}</text>
          <wd-icon name="arrow-right" size="22rpx" color="#929292"></wd-icon>
        </view>
      </view>

    </view>

    <!-- 直接购买时，微信支付 -->
    <view v-if="buyType === 'purchase'" class="pay-group">
      <view class="pay-weixin">
        <view class="flex items-center">
          <view class="wx-pay-icon mr-15rpx"></view>
          <wd-text text="微信支付" size="24rpx" color="#212121"></wd-text>
        </view>
        <wd-icon v-if="isWxPay" name="check-circle-filled" size="32rpx" color="#ff0000"></wd-icon>
        <wd-icon v-if="!isWxPay" name="check-circle" size="32rpx" color="#c4c4c4"></wd-icon>
      </view>
    </view>

    <view class="h-40rpx flex items-center justify-center bg-#ebebeb">
      <wd-text text="提示：商品购买后，3-7个工作日发货。平台包邮" size="20rpx" color="#929292"></wd-text>
    </view>

    <!-- <view class="check_tips pt-20 pb-10 text-center">
      <wd-icon name="check-circle-filled" size="18px" color="#4D5F95"></wd-icon>
      <text>我已满18岁，阅读并同意</text>
      <text>《支付协议》</text>
    </view> -->

    <footer-tool-bar :safe-area-inset-bottom="true">
      <!-- 订单 Bar -->
      <purchase-bar
        :total-amount="buyGoodsAmount"
        :total-points-amount="buyGoodsPointsAmount"
        :total-goods-num="buyGoodsNum"
        :buy-type="buyType"
        @handleToSettle="onToSettle"
      />
    </footer-tool-bar>
  </view>
</template>

<style lang="scss" scoped>
.order-page {
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  box-sizing: border-box;
  background: #fff;
}

.goods-order-info{
  background: #fff;
}
.goods-intro-wrap{
  padding: 8rpx 0;
  background: #F8F8F8;
}
.goods-intro{
  padding: 15rpx;
  box-sizing: border-box;
}
.goods-pic {
  width: 150rpx;
  height: 150rpx;
  background: #F8F8F8;
}

.order-item{
  margin: 15rpx 0;
  padding: 0 30rpx;
  height: 50rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.num {
  padding-bottom: 8px;
  border-bottom: 1px solid #ccc;
}
.balance-deduction,
.shippingFee{
  border-bottom: 1px solid #ccc;
}

.pay-group{
  padding: 8rpx 0;
  background: #F8F8F8;
}
.pay-weixin{
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80rpx;
  padding: 24rpx 20rpx;
  background: #ffffff;
  border-radius: 12rpx;
  box-sizing: border-box;
  .wx-pay-icon {
    width: 54rpx;
    height: 48rpx;
    background: url(https://www.niantu.cn/img/spark-mall/static/blindbox/wx-pay-icon.png) no-repeat center center;
    background-size: 100% 100%;
  }
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

.spec-for-price{
    font-size: 32rpx;
    font-weight: 700;
    color: #050505;
  }
.spec-for-point{
    font-size: 24rpx;
    font-weight: 700;
    color: #E57143;
  }
</style>
