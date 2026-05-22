<route lang="jsonc" type="page">
    {
      "layout": "default",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "商品确认订单"
      }
    }
 </route>

<script lang="ts" setup>
defineOptions({
  name: 'Delivery Order',
})

import { ref, computed } from 'vue'
import { useToast, useMessage } from 'wot-design-uni'
import { debounce } from 'lodash-es'
import Big from 'big.js';
import { getCollectProducts } from '@/api/goods';
import { commonOrderPay, wxOrderPay } from '@/api/payment';
import cartBar from './components/cart-bar/index.vue'

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

const {
  show: showToast,
  loading: showLoading,
  close: hideLoading,
} = useToast()

const { alert, confirm } = useMessage()

onLoad(async (option) => {
  console.log("onLoad");
  // 获取路由参数
  const data = JSON.parse(decodeURIComponent(option.data));
  console.log('options data', data);

  // 收货地址id
  addressId.value = userStore.userAddress.id || 0  

  productList.value = data
  buyGoodsNum.value = productList.value.length
})

// 收货地址
const addressId = ref<number>(0)

// 列表
const productList = ref<any[]>([])

// 商品数量
const buyGoodsNum = ref<number>(1)

// 余额支付开关
const isBalanceDeduction = ref(false) 

// 商品列表主键ID
const productIdsString = computed(() => {
  let ProductIds = productList.value.map(item => item.id)
  console.log(ProductIds.join(','));
  return ProductIds.join(',')
})

// 计算初始运费
const shippingFeeTotal =  computed(() => {
  if (buyGoodsNum.value < 5) {
    return productList.value.reduce((pre, cur) => {
      return pre + Number(cur.shippingFee)
    }, 0)
  }
  return 0
})

// 确保输入值合法
function safeBig(val: any): Big {
  const num = Number(String(val).trim()) // 这里有个知识点，Number不会抛错，只会返回NaN
  return isFinite(num) ? new Big(num) : new Big(0)
}

// 计算实际可用多少余额
const actualBalance =  computed(() => {
  // 判断商品运费和余额的大小
  // 余额大时抵扣全部运费，
  // 余额小时抵扣全部余额
  // 保留两位小数，向下取整 比方说 0.119  就展示 0.11
  let bigBalance = safeBig(userStore.userInfo.balance).round(2, 1);
  let currentPrice = safeBig(shippingFeeTotal.value).round(2, 1);
  console.log('Big balance --', bigBalance.toString());
  console.log('currentPrice--', currentPrice.toString());
  let difference = bigBalance.minus(currentPrice)
  console.log('difference', difference.toNumber())
  if (difference.gte(0)) {
    return currentPrice.toNumber()
  } else {
    return bigBalance.toNumber()
  }
})

// 计算运费
const orderShippingFee = computed(() => {
  // console.log('totalDiscountAmount', buyGoodsNum.value * parseInt(goodsInfo.value.premium))
  if (buyGoodsNum.value >= 5) {
    return 0
  } else {
    // 开启余额支付，判断商品总金额和余额的大小，余额大返回0，余额小显示差价
    let bigBalance = safeBig(userStore.userInfo.balance).round(2, 1);
    let currentPrice = safeBig(shippingFeeTotal.value).round(2, 1);
    if (isBalanceDeduction.value) {
      console.log('Big balance --', bigBalance.toString());
      console.log('currentPrice--', currentPrice.toString());
      let difference = bigBalance.minus(currentPrice)
      console.log('difference', difference)
      if (difference.gte(0)) {
        return 0
      } else {
        return -1 * difference.toNumber()
      }
    } else {
      return shippingFeeTotal.value
    }
  }
})

// 添加防抖，避免短时间多次提交
const onToSettle = debounce(() => {

  if (userStore.isLoggedIn()) {
    // 判断地址是否选择收货地址
    if (addressId.value === 0) {
      showToast('请选择收货地址')
      return
    }
    
    // 调用商品下单
    console.log('调用商品下单')

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
}, 1000, { leading: true, trailing: false })


// 批量提货下单
const createGoodsOrderHandle = async () => {
  try {
    // 调用API
    const response = await getCollectProducts({
      id: productIdsString.value, // 多个id 以逗号分隔
      shippingFee: shippingFeeTotal.value, // 初始运费
      balance: isBalanceDeduction.value ? actualBalance.value : 0, // 余额
      addressId: addressId.value // 收货地址id
    })


    console.log('orderNo', response.orderNo)

    // todo 更新本地用户余额
    // 更新用户余额
    if (isBalanceDeduction.value) {
      userStore.deductingBalance(actualBalance.value)
    }

    console.log('response.orderNo')

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

// 普通调用支付
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

  // todo 支付成功后续操作
  // 跳转到订单详情页面
  setTimeout(() => {
    uni.redirectTo({
      url: `/pages-order/result/index?isPaySuccess=true&orderNo=${orderNo}`,
      success(res) {
        console.log('跳转成功')
      }
    })
  }, 2000)
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
  <view class="box-border w-full">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="'确认订单'"
      page-name="boxDeliveryOrder"
      :show-icon="true"
      :bg-color="''"
    >
    </custom-nav-bar>

    <!-- 首选收货地址组件 -->
    <preferred-address origin-page="boxOrder" />    

    <view class="order-body">

      <view class="goods-order-info">
        <view class="goods-intro pr-5 flex" v-for="item in productList" :key="item.id">
          <view class="goods-pic mt-5 mb-5 ml-5 mr-5">
            <wd-img
              :width="80"
              :height="80"
              :src="item.icon"
            />
          </view>
          <view class="flex-1">
            <view class="goods-name mb-5 mt-5">
              <wd-text :text="item.name" size="18px" bold color="000" />
            </view>
            <view class="flex flex-justify-between">
              <view class="goods-price">
              </view>
                <view class="goods-num">
                x1
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="shippingFee flex flex-justify-between pt-2 pb-2 pl-5 pr-5">
        <view class="">
          运费：
        </view>
        <view>
          {{ '￥' + shippingFeeTotal }}
        </view>
      </view>

      <view class="shippingFee flex flex-justify-between pt-2 pb-2 pl-5 pr-5">
        <view class="">
          订单类型：
        </view>
        <view>
          提货订单
        </view>
      </view>

      <!-- 运费大于0时，显示余额抵扣 -->
      <view v-if="shippingFeeTotal > 0" class="balance-deduction flex flex-justify-between pt-2 pb-2 pl-5 pr-5">
        <view class="">
          余额抵扣
        </view>
        <view class="flex remark">
          <wd-text class="mr-2" :text="'￥' + actualBalance" color="#F24600"></wd-text>
          <wd-switch v-model="isBalanceDeduction" size="32rpx" />
          <!-- <view class="ml-2 balance-icon" :class="[isBalanceDeduction  ? 'lock-icon' : 'unlock-icon']" @click="isBalanceDeduction = !isBalanceDeduction"></view> -->
        </view>
      </view>

      <view class="shippingFee flex flex-justify-between pt-2 pb-2 pl-5 pr-5">
        <view class="">
          备注信息：
        </view>
        <view>
          {{ '选填备注信息' }}
        </view>
      </view>

      <view class="pay-weixin">
        <view class="flex items-center">
          <wd-img :width="36" :height="36" src="https://img.niantu.cn/spark-mall/static/wx-pay-icon.png" />
          <wd-text class="ml-2" text="微信支付" color="#333"></wd-text>
        </view>
        <wd-icon name="check-circle-filled" size="22px" color="#4D802B"></wd-icon>
      </view>
      <view class="tips">
        <wd-text text="提示：商品购买后，3-7个工作日发货。平台包邮" color="#fff"></wd-text>
      </view>

    </view>

    <footer-tool-bar>
      <!-- 商品小计以及结算按钮 -->
      <cart-bar
        :total-amount="orderShippingFee"
        :total-goods-num="buyGoodsNum"
        :fixed="true"
        :bottomHeight="112"
        @handleToSettle="onToSettle"
      />
    </footer-tool-bar>
  </view>
</template>

<style lang="scss" scoped>
.home {
  width: 100vw;
  box-sizing: border-box;
  background: #fff;
}

.order-body{
  height: 1200rpx;
  overflow-y: auto;
}
.goods-intro{
  border-bottom: 1px solid #ccc;
}
.goods-list-wrap {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  padding: 0;
  background: #fff;
}
.goods-pic {
  text-align: center;
}
.goods-price{
  font-size: 36rpx;
  font-weight: bold;
}
.goods-num{
  color: #F24600;
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
  border-radius: 5px;
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
</style>
