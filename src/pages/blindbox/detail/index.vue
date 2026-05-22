<route lang="jsonc" type="page">
    {
      "layout": "default",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "盲盒详情页"
      }
    }
 </route>

<script lang="ts" setup>
defineOptions({
  name: "BlindBoxDetail",
});

import { ref, computed } from "vue";
import { useToast } from "wot-design-uni";
import Big from 'big.js';

import { fetchBoxInfo, createBoxOrder } from '@/api/boxInfo';
import { commonOrderPay, wxOrderPay } from '@/api/payment';
// import { orderPay } from '@/api/payment';

import { useUserStore } from '@/store'

// pinia
const userStore = useUserStore()

// 开盒次数选择弹层是否展示
let drawCountPopupShow = ref<boolean>(false)
// 确认订单弹层是否展示
let orderConfirmPopupShow = ref<boolean>(false)

// 优惠券弹层是否展示
let couponPopupShow = ref<boolean>(false)
// 积分弹层是否展示
let pointsPopupShow = ref<boolean>(false)

// 概率提示弹层是否显示
let probabilityPopupShow = ref<boolean>(false)
// 已抽规则弹层是否显示
let playRulePopupShow = ref<boolean>(false)

// 优惠券开关
const isCouponDeduction = ref(false)

// 积分折扣开关
const isPointsDeduction = ref(true)

// 余额支付开关
const isBalanceDeduction = ref(true) 

const boxInfo = ref<any | null>({
  sellingPrice: 0, // 销售价
  discountPrice: 0, // 折扣价
  id: 0,
  name: '', // 名称
  price: 0, // 价格
  guaranteeCount: 0,
  drawCount: 0,
  lotteryType: 1, // 1-概率 2-保底
  drawCountInfo: [] // 连抽价格列表
})

// 标题内容
const barTitle = ref<string>('')

// 盲盒商品列表
const productList = ref<any[]>([])

// 当前盲盒轮播商品项
const currentProduct = ref<any>({})

// 当前积分
const currentPoint = userStore.userInfo.points || 0

// 当前购买盲盒次数
let currentDrawCountInfo = reactive({
  count: 0,
  price: 0
})
// 计算总价
const totalPrice = computed(() => currentDrawCountInfo.price)

// 轮播图只显示豪华级别的
const swiperProductList = computed(() => productList.value.filter(item => item.productGradeId === 5))

const {
  show: showToast,
  loading: showLoading,
  close: hideLoading,
} = useToast();


onLoad(async (options) => {
  console.log("onLoad");
  // 获取路由参数
  console.log('options data', options);
  if (options.id) {
    blindBoxId.value = options.id
    await fetchBoxInfoHandle()
  } else {
    uni.showToast({
      title: '盲盒ID不存在',
      icon: 'error'
    })
    // uni.navigateBack()
  }    
  // 收货地址id
  addressId.value = userStore.userAddress.id || 0  
})

onMounted(async () => {
  console.log("onMounted");
  preloadImage(["1.png","2.png","3.png","4.png","5.png","6.png","7.png","8.png","9.png","10.png","11.png","12.png","13.png","14.png","15.png","16.png","17.png","18.png","19.png","20.png","21.png","22.png","23.png","24.png","25.png","26.png","27.png","28.png","29.png","30.png","31.png","32.png","33.png","34.png","35.png","36.png","37.png"], function() {
      // document.getElementById('gka').className += " animation"
      console.log('loading finish')
  }, "https://www.niantu.cn/img/spark-mall/static/blindbox/img/")
  isAnimation.value = true
})

onShow(async() => {
  console.log("onShow");
  // 更新用户信息
  if (userStore.isLoggedIn()) {
    await userStore.getUserInfo()
  }
})

// 收货地址
const addressId = ref<number>(0)

// 顶部图片轮播
const swiperList = ref([])

// 获取页面参数
const blindBoxId = ref('')

// 确保输入值合法
function safeBig(val: any): Big {
  const num = Number(String(val).trim()) // 这里有个知识点，Number不会抛错，只会返回NaN
  return isFinite(num) ? new Big(num) : new Big(0)
}


// 是否显示按钮上的三抽起购提示
// let isShowBtnCountTips = ref<boolean>(false)
const isShowBtnCountTips =  computed(() => {
  return boxInfo.value.drawCountInfo.length === 1 && boxInfo.value.drawCountInfo[0].count === '3'
})


// 计算实际使用了积分
const actualPoints =  computed(() => {
  // Cash2Points 积分兑换现金比 = 积分/500
  return actualPoints2Cash.value * 500
})


// 计算实际使用了积分抵扣了多少钱
const actualPoints2Cash =  computed(() => {
  // Points2Cash 积分兑换现金比 = 积分/500
  // 判断商品金额和Points2Cash大小
  // Points2Cash大时抵扣全部盲盒金额，抵扣商品金额所对应的积分
  // Points2Cash小时抵扣余额，使用全部积分
  // let testBalance = '22222.15'
  // let bigBalance = new Big(testBalance).round(2)
  // 保留两位小数，向下取整 比方说 0.119  就展示 0.11
  let bigPoints = safeBig(userStore.userInfo.points).round(2, 1)
  // big.js库向下取整有问题，需要先用numFilter处理一下
  let Points2Cash= safeBig(numFilter(bigPoints.div(500)))
  console.log('Points2Cash', Points2Cash.toNumber())
  let currentPrice = safeBig(currentDrawCountInfo.price).round(2, 1)
  console.log('Big Points --', bigPoints.toNumber())
  console.log('currentPrice--', currentPrice.toNumber())
  let difference = Points2Cash.minus(currentPrice)
  console.log('difference', difference.toNumber())
  if (difference.gte(0)) {
    return currentPrice.toNumber()
  } else {
    return Points2Cash.toNumber()
  }
})

function numFilter (value) {
  // 截取当前数据到小数点后三位
  let tempVal = parseFloat(value).toFixed(3)
  let realVal = tempVal.substring(0, tempVal.length - 1)
  return realVal
}

// 计算实际使用了多少余额
const actualBalance =  computed(() => {
  // 开启积分支付时，商品总金额和积分兑换的金额进行比较
  // 积分兑换的金额 >= 商品金额时，不使用余额支付，直接返回 0
  // 积分兑换的金额 < 商品金额时，商品总金额扣除掉积分抵扣的部分做为总金额，进行余额操作
  // 判断商品总金额与剩余余额的大小
  // 余额大时抵扣全部盲盒金额，
  // 余额小时抵扣余额
  let bigBalance = safeBig(userStore.userInfo.balance).round(2, 1)
  let currentPrice = safeBig(currentDrawCountInfo.price).round(2, 1)
  // 开启积分兑换后才计算
  if (isPointsDeduction.value) {
    let bigActualPoints2Cash = safeBig(actualPoints2Cash.value).round(2, 1)
    if (bigActualPoints2Cash.gte(currentPrice)) {
      return 0
    } else {
      currentPrice = currentPrice.minus(bigActualPoints2Cash)
    }
  }
  console.log('Big balance --', bigBalance.toNumber())
  console.log('currentPrice--', currentPrice.toNumber())

  let difference = bigBalance.minus(currentPrice)
  console.log('difference', difference.toNumber())
  if (difference.gte(0)) {
    return currentPrice.toNumber()
  } else {
    return bigBalance.toNumber()
  }
})

// 计算支付金额
const orderTotalPrice = computed(() => {
    // 开启积分支付，判断商品总金额和积分兑换额的大小，积分兑换额大返回0，积分兑换额小显示差价
    // 开启余额支付，判断商品总金额和余额的大小，余额大返回0，余额小显示差价
    // 同时开启则为总金额 - 实际使用的积分兑换额 — 实际使用的余额

    let currentPrice = safeBig(currentDrawCountInfo.price).round(2, 1)
    let bigActualPoints2Cash = safeBig(actualPoints2Cash.value).round(2, 1)
    let bigActualBalance = safeBig(actualBalance.value).round(2, 1)
    // 开启积分和余额抵扣
    if (isPointsDeduction.value && isBalanceDeduction.value) {
      return currentPrice.minus(bigActualPoints2Cash).minus(bigActualBalance).toNumber()
    }
    // 开启积分抵扣
    if (isPointsDeduction.value) {
      return currentPrice.minus(bigActualPoints2Cash).toNumber()
    }
    // 开启余额抵扣
    if (isBalanceDeduction.value) {
      return currentPrice.minus(bigActualBalance).toNumber()
    }
    // 默认
    return currentPrice.toNumber()
})

// 加载盲盒详情
const fetchBoxInfoHandle = async () => {
  try {
    // 调用API
    const response = await fetchBoxInfo({
      id: blindBoxId.value
    })

    boxInfo.value = response.boxInfo
    productList.value = response.productList

    // 设置第一个轮播信息
    currentProduct.value = productList.value[0]

    console.log('boxInfo', boxInfo)
    console.log('productList', productList)

    // 设置标题
    barTitle.value = boxInfo.value.name
    uni.setNavigationBarTitle({
      title: boxInfo.value.name
    });

    // 从商品列表取出图片做为图片轮播
    swiperList.value = productList.value.map((item, index) => {
      if (item.storePageIcon == '') {
        item.storePageIcon = 'http://49.233.20.99:8072/images/default.jpg'
      }
      // console.log('productGradeLevel', productGradeLevel(item.productGrade));
      return {
        value: item.storePageIcon,
        title: item.productName,
        productGrade: item.productGrade,
        type: 'image',
        id: item.id
      }
    })
    console.log('swiperList', swiperList.value);

  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}


// 盲盒下单
const createBoxInfoHandle = async () => {
  try {
    // 调用API
    const response = await createBoxOrder({
      id: blindBoxId.value,
      count: currentDrawCountInfo.count,
      totalPrice: currentDrawCountInfo.price,
      balance: isBalanceDeduction.value ? actualBalance.value : 0, // 使用的余额
      cashPrice: orderTotalPrice.value,
      points: isPointsDeduction.value ? actualPoints.value : 0,
      couponAmount: 0
    })

    console.log('orderNo', response.orderNo)

    // 更新本地用户余额和积分

    // 更新用户余额
    if (isBalanceDeduction) {
      userStore.deductingBalance(actualBalance.value)
    }

    // 更新用户积分
    if (isPointsDeduction) {
      userStore.deductingPoints(actualPoints.value)
    }
  
    // #ifdef MP-WEIXIN
    console.log("运行在微信小程序中");
      wxPayHandle(response.orderNo)
    // #endif
    
    // #ifndef MP-WEIXIN
      // 调用支付
      boxOrderPayHandle(response.orderNo)
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
              uni.showToast({
                title: '出错了，请重试',
                icon: 'none',
                duration: 2000
              })
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
const boxOrderPayHandle = async (orderNo) => {
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

  orderConfirmPopupShow.value = false

  // 前往中奖结果页
  uni.navigateTo({
    url: '/pages/blindbox/winner/index?type=default&orderNo=' + orderNo + '&originPage=blindbox' + '&blindBoxId=' + blindBoxId.value
  })
}

// 关闭订单确认弹层
function handleOrderConfirmPopupClose() {
  orderConfirmPopupShow.value = false;
}

// 盲盒试玩
const tryHandle = () => {
  // 前往结果页 (没有订单号，传盲盒id)
  uni.navigateTo({
    url: '/pages/blindbox/winner/index?type=try' + '&originPage=blindbox' + '&blindBoxId=' + blindBoxId.value
  })
}

// 盲盒购买数量
function buyHandle(count, price) {
  console.log('buyHandle count', count, price);
  // 设置当期购买盲盒信息
  currentDrawCountInfo.count = count
  currentDrawCountInfo.price = price
  drawCountPopupShow.value = false;
  orderConfirmPopupShow.value = true;
}

// 点击盲盒立即支付
function confirmBtnHandle() {
  // 调用盲盒下单
  createBoxInfoHandle()
}

function onToSettleHandle() {
  // showToast("点击了去开箱按钮");
  // 显示盲盒抽奖按钮区域，只有一个时直接到确认订单
  if (boxInfo.value.drawCountInfo.length === 1) {

    // 设置当期购买盲盒信息
    currentDrawCountInfo.count = boxInfo.value.drawCountInfo[0]['count']
    currentDrawCountInfo.price = boxInfo.value.drawCountInfo[0]['price']
    orderConfirmPopupShow.value = true
  } else {
    drawCountPopupShow.value = true
  }
}

// 轮播图切换时修改商品名称和价格
function onChange(e) {
  console.log('onChange', e)
  let index = e.current
  currentProduct.value = productList.value[index]
  // console.log(productList.value[index].productName)
}

// 返回等级level
function productGradeLevel(productGrade) {
  const productLevelObj = {
    '1': '豪华',
    '2': '轻奢',
    '3': '高档',
    '4': '标准'
  }
  // console.log('productGrade', productGrade);
  return Object.keys(productLevelObj).find(key => productLevelObj[key] == productGrade);
}

// 前往商品详情页，传递id和来源页
function goodsClickHandle(id) {
  console.log('goodListClickHandle id', id);
  uni.navigateTo({
    url: `/pages/goods/detail/index?originPage=blindbox&id=${id}`,
  })
}

const swiperConifg = {
  background: ['color1', 'color2', 'color3'],
  indicatorDots: false,
  autoplay: false,
  interval: 2000,
  duration: 500
}

// 打开优惠券弹层
const couponPopupShowHandle = () => {
  couponPopupShow.value = true
  orderConfirmPopupShow.value = false
}

// 打开积分弹层
const pointsPopupShowHandle = () => {
  pointsPopupShow.value = true
  orderConfirmPopupShow.value = false
}

// 关闭优惠券弹层
const closeCouponPopupHandle = () => {
  couponPopupShow.value = false
  orderConfirmPopupShow.value = true
}

// 关闭积分弹层
const closePointsPopupHandle = () => {
  pointsPopupShow.value = false
  orderConfirmPopupShow.value = true
}

// 请先阅读并勾选协议
const isAgreePrivacy = ref(true)
const isAgreePrivacyShakeY = ref(false)

const checkedAgreePrivacy = async () => {
  console.log('checkedAgreePrivacy')
  if (!isAgreePrivacy.value) {
    uni.showToast({
      icon: "none",
      title: "请先阅读并勾选协议",
    });
    // 震动提示
    isAgreePrivacyShakeY.value = true;
    setTimeout(() => {
      isAgreePrivacyShakeY.value = false;
    }, 500);
    // 返回错误
    return Promise.reject(new Error("请先阅读并勾选协议"))
  }
}

// 页面滚动距离
const scrollTop = ref<number>(0)
onPageScroll((e) => {
  scrollTop.value = e.scrollTop
})

const gkaCache = ref<any>([])
const isAnimation = ref<boolean>(false)

const preloadImage = (names, cb, prefix) => {
  gkaCache.value = [];
  let n = 0,img,imgs = {};
  names.forEach(function(name) {
      let src = (prefix || '') + name;
      
      uni.getImageInfo({
        src: src,
        success: (res) => {
          console.log('Image loaded:', res.path)
          gkaCache.value.push(src)
        }
      })
      // img = new Image();
      // gkaCache.value.push(img);
      // img.onload = (function(name, img) {
      //     return function() {
      //         imgs[name] = img;
      //         (++n === names.length) && cb && cb(imgs);
      //     }
      // })(name, img);
      // img.src = (prefix || '') + name;
  });
}

</script>

<template>
  <view class="blindbox-page">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="barTitle"
      page-name="blindboxDetail"
      :show-icon="true"
      :is-default-bg-img="false"
      color="#fff"
      :is-change="scrollTop > 10 ? true : false"
    >
    </custom-nav-bar>

    <view class="blind-box-intro">
    <view class="bg-level-1"></view>
    <view class="behind-light"></view>
    <view class="bg-level-2"></view>
    <view class="gka-wrap">
      <view id="gka" :class="isAnimation ? 'animation' : ''"></view>
    </view>
    
    <view class="ahead-light">
    </view>

    <!-- 内容区域 -->
    <view class="header-wrap">

      <view class="try-btn" @click="tryHandle">
        <text class="hidden">免费试玩</text>
      </view>

      <swiper class="swiper" 
        circular
        :indicator-dots="swiperConifg.indicatorDots"
        :autoplay="swiperConifg.autoplay"
        :interval="swiperConifg.interval"
        :duration="swiperConifg.duration">
          <swiper-item v-for="(item, index) in swiperProductList" :key="index">
            <view class="swiper-item">
              <!-- {{ item.storePageIcon }} -->
              <view class="product-pic">
                <view class="header-level" :class="'header-level-' + item.productGradeId"></view>
                <wd-img width="100%" height="100%" :src="item.storePageIcon"></wd-img>
              </view>
              <view class="blind-box-price">
                <wd-text
                  :text="'￥' + Math.floor(item.premium)"
                  size="44rpx"
                  color="#c65715"
                  bold
                />
              </view>
              <!-- 盲盒名称 -->
              <view class="blind-box-name overflow-hidden text-ellipsis whitespace-nowrap font-size-30rpx fw-bold color-#212121">
                {{ item.productName }}
              </view>
            </view>
          </swiper-item>
      </swiper>

      <view class="draw-tips">
        <view class="title">开盒必出以下宝贝之一</view>
        <view class="subheading">抽到不满意可兑换</view>
      </view>

    </view>

    <!-- 盲盒比 -->
    <view class="blind-box-rate text-center">
      <text class="hidden">1/200</text>
    </view>

  </view>

    <!-- 抽奖概率,登录后才可以看到 -->
     <!-- boxInfo.lotteryType === 2 -->
    <view class="lottery-probability" v-if="userStore.isLoggedIn()">
      <view class="probability-capiton">

        <!-- 保底提示条 -->
        <view class="commitment" v-if="boxInfo.lotteryType === 2">
          <view class="pl-120rpx">
            <!-- <text class="mr-2" style="text-shadow: 2px 2px 5px #000000;">保底</text> -->
             <view class="commitment-icon"></view>
            <wd-text text="10抽必出稀有款及以上" color="#fff"></wd-text>
          </view>
          <view class="pr-40rpx" @click="playRulePopupShow = true">
            <wd-text :text="`已抽 ${boxInfo.drawCount}/${boxInfo.guaranteeCount}`" color="#fff"></wd-text>
            <!-- <view class="commitment-arrow-icon"></view> -->
          </view>
        </view>
      </view>

      <!-- 获得概率 -->
      <view class="bg-#f8f8f8 p-10rpx">
        <view class="probability-intro">
          <view class="title mb-2 pt-2 pl-2 italic flex items-center">
            <wd-text text="获得概率" size="30rpx" color="#333"></wd-text>
            <view class="ml-10rpx tips-icon" @click="probabilityPopupShow = true"></view>
          </view>
          <view class="list">
            <view v-for="(item, index) in boxInfo.priorityList" :key="index"  :class="['item', 'level-' + item.productGradeId]" >
              <view class="label">{{ item.productGrade }}</view>
              <view class="level">
                <view class="gold-star" v-for="m in item.productGradeId" :key="m"></view>
                <view class="grey-star" v-for="n in (5 - item.productGradeId)" :key="n"></view>
              </view>
              <view class="num">{{ item.priority }}</view>
            </view>
          </view>


        </view>
      </view>

    </view>

    <!-- 商品列表 -->
    <view class="goods-list-wrap">

      <view class="goods-card" v-for="item in productList" :key="item.id"  @click="goodsClickHandle(item.id)">

        <view class="goods-card__thumb">
          <wd-img 
            :lazy-load="true"
            width="100%"
            :src="item.storePageIcon"
            :mode="'widthFix'"
          />
        </view>

        <view class="pt-20rpx pb-10rpx">
          <view class="font-size-24rpx overflow-hidden text-ellipsis whitespace-nowrap">
            {{ item.productName }}
          </view>

          <view class="mt-10rpx font-size-30rpx fw-bold color-#212121">
            {{ '￥' + item.premium }}
          </view>

          <view class="mt-10rpx flex items-center" v-if="false">
            <view class="points-icon mr-6rpx"></view>
            <view class="font-size-24rpx color-#efb106 fw-bold">
              {{ item.exchangePrice }}
            </view>
          </view>

          <view class="goods-grade-icon" :class="'goods-grade-level-'+ item.productGradeId">
            <view class="level flex">
              <view class="gold-star" v-for="m in item.productGradeId" :key="m"></view>
              <view class="grey-star" v-for="n in (5 - item.productGradeId)" :key="n"></view>
            </view>
          </view>

        </view>
      </view>


    </view>

    <footer-tool-bar>
      <!-- 商品小计以及结算按钮 -->
      <view class="operation">
        <view @click="onToSettleHandle" class="operation-btn">
          <text class="hidden">立即开盒</text>
          <view class="count-tips pt-10rpx font-size-24rpx color-#fff text-center" v-if="isShowBtnCountTips">3抽起购</view>
        </view>
      </view>
    </footer-tool-bar>

    <!-- 概率弹层 -->
    <wd-popup v-model="probabilityPopupShow" position="center" custom-style="border-radius:20rpx;" @close="probabilityPopupShow = false">
      <view class="probability-tips">
        <wd-text
          text="因概率对小数点后三位进行四舍五入处理，故存在总值不为100%的可能。"
          color="#212121"
        ></wd-text>
      </view>
    </wd-popup>

    <!-- 已抽规则弹出层 -->
    <wd-popup v-model="playRulePopupShow" position="bottom" :safe-area-inset-bottom="true" custom-style="border-top-left-radius:23rpx;border-top-right-radius:23rpx;" @close="handleOrderConfirmPopupClose">
      <view class="rules">
        <view class="rules-header">
          <text class="rules-title font-size-30rpx color-#212121">规则说明</text>
          <wd-icon name="arrow-down" size="22px" @click="playRulePopupShow = false"></wd-icon>
        </view>
        <scroll-view scroll-y class="rules-content pl-30rpx pr-20rpx pb-20rpx">
          <view class="rule-item mb-20rpx" v-for="(item, index) in boxInfo.ruleText" :key="index">
            <view class="mb-20rpx label font-size-24rpx fw-bold  color-#ff0c00">
              {{ item.title }}
            </view>
            <view class="font-size-24rpx lh-50rpx">
              {{ item.content }}
            </view>
          </view>
        </scroll-view>
        
        <view class="confirm-btn" @click="playRulePopupShow = !playRulePopupShow">
          <text class="">知道了</text>
        </view>
      </view>
    </wd-popup>

    <!-- 抽奖选项弹层 -->
    <wd-overlay :show="drawCountPopupShow" @click="drawCountPopupShow = false">
      <view class="wrapper">
        <view class="draw-count-info" @click.stop="false">
          <view class="draw-count-header flex justify-end">
            <view class="hidden title font-size-6">
              <text>拆盒抽好礼</text>
            </view>
            <view class="blindbox-icon">
              <wd-img width="250rpx" height="250rpx" :src="boxInfo?.icon"></wd-img>
            </view>
          </view>
          <view class="btn-list" v-if="boxInfo?.drawCountInfo.length">
            <view :class="['btn-item', 'btn-' + index]" v-for="(item, index) in boxInfo.drawCountInfo" :key="index"  @click="buyHandle(item.count, item.price)" >
              <view class="label">{{ item.name }}</view>
              <view class="price">
                <wd-text :text="'￥' + item.price" color="#ffffff" class="mr-1" size="34rpx" bold></wd-text>
                <wd-text :text="'￥' + item.commonPrice" color="#ffb0a6" decoration="line-through" size="26rpx" bold></wd-text>
              </view>
            </view>
          </view>  
        </view>
      </view>
    </wd-overlay>

    <!-- 订单确认弹出层 -->
    <wd-popup v-model="orderConfirmPopupShow" position="bottom" :safe-area-inset-bottom="true" custom-style="border-top-left-radius:23rpx;border-top-right-radius:23rpx;" @close="handleOrderConfirmPopupClose">
      <view class="order-confirm">
        <view class="order-content h-570rpx">
          <view class="confirm-header">
            <text class="confirm-title font-size-30rpx color-#212121">确认订单</text>
            <wd-icon name="arrow-down" size="22px" @click="orderConfirmPopupShow = false"></wd-icon>
          </view>
          <view class="confirm-group">
            <view class="blind-box-desc flex justify-between">
              <view class="blind-box-main">
                <view class="thumbnail border-rd-10rpx">
                  <wd-img
                    width="100%"
                    height="100%"
                    radius="10rpx"
                    :src="boxInfo.icon"
                  />
                </view> 
                <view class="title font-size-24rpx fw-bold">{{ boxInfo.name }}</view>
              </view>
              <view class="price font-size-28rpx fw-bold">{{ boxInfo.discountPrice }}</view>
            </view>

            <view class="confirm-group-item blind-box-num">
              <view class="label">数量</view>
              <view class="num">x{{ currentDrawCountInfo.count }}</view>
            </view>

            
            <view class="confirm-group-item coupon" v-if="false">
              <view class="label">优惠券</view>
              <view class="" @click="couponPopupShowHandle">
                <view class="txt no-coupon flex items-baseline" v-if="true">
                  未选择优惠券
                  <wd-icon name="arrow-right" color="#A0A0A0" class="ml-1" />
                </view>
                <view class="txt" v-if="false">新用户立减5元 <wd-icon name="arrow-right" color="#A0A0A0" class="ml-1" /></view>
              </view>
            </view>
          
            <view class="confirm-group-item point">
              <view class="label">积分抵扣</view>
              <view class="" @click="pointsPopupShowHandle">
                <view class="txt no-points flex items-baseline" v-if="!isPointsDeduction">
                  不使用积分 <wd-icon name="arrow-right" color="#A0A0A0" class="ml-1" />
                </view>
                <!-- 就是积分抵扣时取消了抵扣70%的设定 ， 500积分 算1块钱哈 -->
                <view class="txt" v-else>
                  使用{{ actualPoints }}积分抵扣<text class="highlight">{{ actualPoints2Cash }}</text>元
                  <wd-icon name="arrow-right" color="#A0A0A0" class="ml-1" />
                </view>
              </view>
            </view>

            <view class="confirm-group-item point">
              <view class="label">余额抵扣</view>
              <view class="flex remark">
                <text class="mr-15rpx color-#ff0c00">{{  '￥' + userStore.userInfo.balance }}</text>
                <wd-switch v-model="isBalanceDeduction" size="28rpx" active-color="#ff0c00" inactive-color="#C4C4C4" />
                <!-- <view class="ml-2 balance-icon" :class="[isBalanceDeduction  ? 'lock-icon' : 'unlock-icon']" @click="isBalanceDeduction = !isBalanceDeduction"></view> -->
              </view>
            </view>

            <view class="confirm-group-item total">
              <view class="label">合计</view>
              <view class="txt flex items-baseline">
                <text class="color-#ff0c00">已优惠 {{  '￥' + 0 }}</text>
                <text class="ml-15rpx mr-10rpx">合计</text>
                <text class="color-#212121 font-size-36rpx fw-bold">{{ '￥' + orderTotalPrice }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="pay-group">
          <view class="pay-weixin">
            <view class="flex items-center">
              <view class="wx-pay-icon mr-15rpx"></view>
              <!-- <wd-img width="90rpx" height="80rpx" src="/static/wx-pay-icon.png" /> -->
              <wd-text text="微信支付" size="24rpx" color="#212121"></wd-text>
            </view>
            <wd-icon name="check-circle-filled" size="32rpx" :color="orderTotalPrice > 0 ? '#ff0000' : '#c4c4c4'"></wd-icon>
            <!-- <wd-checkbox v-model="value" checked-color="#4D802B"></wd-checkbox> -->
          </view>
        </view>

        <view class="buy-tips-wrap">
          <view class="buy-tips">
            若完成交易代表您已同意以下约定：<br />
            1、本平台禁止18周岁以下未成年人购买<br />
            2、由于盲盒商品特殊属性，打开后不支持退款<br />
            3、商品抽奖存在概率性，付费请谨慎<br />
            4、5件可免邮费，单件邮费10元，7天内发货，港澳台地区及部分偏远地区无法配送<br />
            5、详情请咨询在线客服
          </view>
        </view>

        <view class="">
          <view class="agree-tips flex justify-center items-center">
            <label class="label" @click="isAgreePrivacy = !isAgreePrivacy">
              <wd-icon name="check-circle-filled" size="28rpx" :color="isAgreePrivacy ? '#ff0000' : '#c4c4c4'"></wd-icon>
              <text class="ml-1">我已满18岁，阅读并同意</text>
            </label>
            <navigator class="link" hover-class="none" url="./protocal">《支付协议》</navigator>
          </view>
          <view class="confirm-btn" @click="confirmBtnHandle">
            <text class="">立即支付 {{ '￥' + orderTotalPrice }}</text>
          </view>
        </view>

      </view>
    </wd-popup>

    <!-- 积分弹出层 -->
    <wd-popup v-model="pointsPopupShow" position="bottom" :safe-area-inset-bottom="true" custom-style="" @close="closePointsPopupHandle">
      <view class="points-popup">
        <view class="points-popup-title">
          <wd-icon class="back-btn" name="arrow-left" size="22px" color="#ACACAC" @click="closePointsPopupHandle"></wd-icon>
          <wd-text class="flex-1 text-align-center" text="积分详情" size="36rpx" color="#333" bold></wd-text>
        </view>
        <view class="points-popup-body">
            <view class="points-intro flex justify-between items-center">
                <view class="">
                  <view class="txt">
                    不使用积分
                  </view>
                </view>
                <view class="">
                  <wd-icon
                    size="32rpx"
                    :color="!isPointsDeduction ? '#ff0000' : '#c4c4c4'"
                    :name="!isPointsDeduction ? 'check-circle-filled' : 'circle'"
                    class="cart-bar__check"
                    @click="isPointsDeduction = !isPointsDeduction"
                  />
                </view>
            </view>
            <view class="points-intro flex justify-between items-center">
                <view class="">
                  <view class="txt">
                    使用{{ actualPoints }}积分抵扣<text class="highlight">{{ actualPoints2Cash }}</text>元
                  </view>
                  <view class="my-points">
                    当前积分：{{ userStore.userInfo.points }}
                  </view>
                </view>
                <view class="">
                  <wd-icon
                    size="32rpx"
                    :color="isPointsDeduction ? '#ff0000' : '#c4c4c4'"
                    :name="isPointsDeduction ? 'check-circle-filled' : 'circle'"
                    class="cart-bar__check"
                    @click="isPointsDeduction = !isPointsDeduction"
                  />
                </view>
            </view>
        </view>
        <view class="points-popup-footer">
          <view class="points-tips text-right" v-if="false">当前可抵扣订单总金额的70%</view>
          <view class="confirm-btn" @click="closePointsPopupHandle">
            确认
          </view>
        </view>
      </view>
    </wd-popup>

    <!-- 优惠券弹出层 -->
    <wd-popup v-model="couponPopupShow" position="bottom" :safe-area-inset-bottom="true" custom-style="border-radius:32rpx;" @close="closeCouponPopupHandle">
      <view class="coupon-popup">
        <view class="coupon-popup-title">
          <wd-icon class="back-btn" name="arrow-left" size="22px" color="#ACACAC" @click="closeCouponPopupHandle"></wd-icon>
          <wd-text class="flex-1 text-align-center" text="优惠详情" size="36rpx" color="#333" bold></wd-text>
        </view>
        <view class="coupon-popup-body">
            <view class="reject-coupon flex justify-between items-center">
                <view class="">
                  <view class="txt">
                    不使用优惠券
                  </view>
                </view>
                <view class="">
                  <wd-icon
                    size="40rpx"
                    :color="!isPointsDeduction ? '#FA4126' : '#BBBBBB'"
                    :name="!isPointsDeduction ? 'check-circle-filled' : 'circle'"
                    class="cart-bar__check"
                    @click="isPointsDeduction = !isPointsDeduction"
                  />
                </view>
            </view>
            <view class="coupon-item flex justify-between items-center">
              <view class="coupon-intro flex">
                <view class="coupon-amount">
                  ￥ 300
                </view>
                <view class="coupon-detail">
                  <view class="txt">
                    300元全场通用券
                  </view>
                  <view class="expiration-time">
                    有效期至：2025-10-11 12:12:33
                  </view>
                </view>
              </view>
              <view class="">
                <wd-icon
                  size="40rpx"
                  :color="isPointsDeduction ? '#FA4126' : '#BBBBBB'"
                  :name="isPointsDeduction ? 'check-circle-filled' : 'circle'"
                  class="cart-bar__check"
                  @click="isPointsDeduction = !isPointsDeduction"
                />
              </view>
            </view>
        </view>
        <view class="coupon-popup-footer">
          <view class="confirm-btn" @click="closeCouponPopupHandle">
            确认
          </view>
        </view>
      </view>
    </wd-popup>

  </view>
</template>

<style lang="scss" scoped>

  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .blindbox-page {
    background: #dc344a;
  }

  .blind-box-intro {
    position: relative;
		width: 750rpx;
		height: 770rpx;
    background: url(https://www.niantu.cn/img/spark-mall/static/blindbox/blindbox_bg.png) no-repeat 0 0;
    background-size: 100% 100%;
  }
  .bg-level-1{
    position: absolute;
    left: 0;
    top: 0;
		width: 750rpx;
		height: 770rpx;
    background: url(https://www.niantu.cn/img/spark-mall/static/blindbox/bg-level-1.png) no-repeat 0 bottom;
    background-size: 100% 100%;
  }
  .bg-level-2{
    position: absolute;
    left: 0;
    top: 0;
		width: 750rpx;
		height: 770rpx;
    background: url(https://www.niantu.cn/img/spark-mall/static/blindbox/bg-level-2.png) no-repeat 0 bottom;
    background-size: 100% 100%;
  }
  .ahead-light{
    position: absolute;
    left: 0;
    top: 0;
		width: 750rpx;
		height: 770rpx;
    background: url(https://www.niantu.cn/img/spark-mall/static/blindbox/ahead_light.png) no-repeat 0 bottom;
    background-size: 100% 100%;
    animation: breathe 3s infinite;
  }
  .behind-light{
    position: absolute;
    left: 0;
    top: 0;
		width: 750rpx;
		height: 770rpx;
    background: url(https://www.niantu.cn/img/spark-mall/static/blindbox/behind_light.png) no-repeat 0 bottom;
    background-size: 100% 100%;
    animation: breathe 3s infinite;
  }
  .header-wrap {
    position: absolute;
    top: 0;
    left: 0;
    width: 750rpx;
    padding-top: 50rpx;
    box-sizing: border-box;
    margin-bottom: 10px;
    text-align: center;
    height: 770rpx;
	}
	.swiper {
    // background: #000;
	}

  .operation{
    height: 140rpx;
    background: #fff;
    padding: 16rpx 0;
    box-sizing: border-box;
  }
  .operation-btn{
    position: relative;
    margin: 0 auto;
    width: 630rpx;
    height: 108rpx;
    background: url(https://www.niantu.cn/img/spark-mall/static/blindbox/blindbox-draw-btn-new.png) no-repeat 0 0;
    background-size: 100% 100%;
    .count-tips{
      position: absolute;
      top: -30rpx;
      right: -42rpx;
      width: 140rpx;
      height: 64rpx;
      background: url(https://www.niantu.cn/img/spark-mall/static/blindbox/count-tips-icon.png) no-repeat 0 0;
      background-size: 100% 100%;
    }
  }
  .highlight{
    color: #ff0c00;
  }

  /*------- 顶部轮播区域  -------*/

	.swiper-item {
    position: relative;
    padding-top: 30rpx;
	}
  .header-level{
    position: absolute;
    top: 0rpx;
    left: 97rpx;
    z-index: 1;
    width: 110rpx;
    height: 96rpx;
    background-position: 0 0;
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
  .header-level-5{
    background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/header-level-5.png);
  }
  .header-level-4{
    background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/header-level-4.png);
  }
  .header-level-3{
    background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/header-level-3.png);
  }
  .header-level-2{
    background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/header-level-2.png);
  }

  .product-pic {
    margin: 0 auto 30rpx;
    width: 430rpx;
    height: 430rpx;
  }
  .blind-box-price{
    height: 60rpx;
    line-height: 60rpx;
  }
  .blind-box-name{
    margin: 20rpx auto 0;
    width: 676rpx;
    height: 56rpx;
    line-height: 56rpx;
    padding:  0 20rpx;
    box-sizing: border-box;
    background: url(https://www.niantu.cn/img/spark-mall/static/blindbox/name_bg.png) no-repeat;
    background-size: 100% 100%;
  }

  .try-btn {
    position: absolute;
    z-index: 9;
    top: 0rpx;
    right: 20rpx;
    width: 108rpx;
    height: 108rpx;
    background: url(https://www.niantu.cn/img/spark-mall/static/blindbox/try_icon.png) no-repeat 0 0;
    background-size: 100% 100%;
  }
  .draw-tips{
    position: absolute;
    bottom: 20rpx;
    left: 0;
    right: 0;

    .title{
      margin: 0 auto;
      width: 290rpx;
      height: 40rpx;
      font-size: 24rpx;
      font-weight: bold;
      background: #FC7D71;
      color: #fff;
      border-radius: 20rpx;
    }
    
    .subheading{
      margin-top: 4rpx;
      font-size: 18rpx;
      color: #fff;
    }
  }


	.info {
		position: absolute;
		right: 20rpx;
	}


.blind-box-pic-swiper{
  margin: 80rpx auto 0rpx;
  width: 360rpx;
  height: 360rpx;
  // background: #000;
  // border: 1rx solid #f00;
}

.blind-box-rate{
  height: 30rpx;
}

.lottery-probability {
  background-color: #F8F8F8;
}
.probability-capiton {
  .title {
    margin: 0 auto;
    width: 428rpx;
    height: 52rpx;
    line-height: 52rpx;
    background-color: #235676;
    color: #fff;
    text-align: center;
    font-size: 28rpx;
  }
  .commitment {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0rpx 0 0;
    padding: 0px 0rpx 0 0rpx;
    height: 60rpx;
    background: url(https://www.niantu.cn/img/spark-mall/static/blindbox/commitment_bg.png?22) no-repeat 0 0;
    background-size: 100% 100%;
    color: #fff;
    font-size: 28rpx;
    .commitment-icon{
      position: absolute;
      top: -15rpx;
      left: 0;
      width: 116rpx;
      height: 88rpx;
      background: url(https://www.niantu.cn/img/spark-mall/static/blindbox/commitment-icon.png) no-repeat 0 0;
      background-size: 100% 100%;
    }
  }
  .commitment-arrow-icon{
    margin-left: 10rpx;

  }
}

.probability-intro {
  width: 730rpx;
  border-radius: 18rpx;
  background: #fff;
  .title{
    font-family: 'myFz';
    color: #212121;
  }
  .tips-icon{
    width: 26rpx;
    height: 26rpx;
    background: url(https://www.niantu.cn/img/spark-mall/static/blindbox/tips-icon.png) no-repeat 0 0;
    background-size: 100% 100%;
  }
  .list {
    display: flex;
    justify-content: center;
    .item {
      flex: 1;
      text-align: center;
      margin-right: 8rpx;
      width: 170rpx;
      height: 140rpx;
      border-radius: 10rpx;
      &:last-child{
        margin-right: 0;
      }
      .level{
        margin-bottom: 5rpx;
        height: 32rpx;
        display: flex;
        justify-content: center;
        .gold-star,
        .grey-star{
          width: 32rpx;
          height: 32rpx;
          background-repeat: no-repeat;
          background-position: 0 0;
          background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/star-gold.png);
          background-size: 100% 100%;
        }
        .grey-star{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/star-grey.png);
        }
      }
      .label {
        padding-top: 10rpx;
        box-sizing: border-box;
        line-height: 1;
        font-size: 46rpx;
        font-family: 'myFz';
      }
      .num {
        margin: 0 auto;
        width: 160rpx;
        height: 42rpx;
        background: #fff;
        font-size: 30rpx;
        border-radius: 10rpx;
      }
    }
    .level-5 {
      background-color: #ff3a34;
      .label {
        color: #fff;
      }
      .num {
        color: #ff3a34;
      }
    }
    .level-4 {
      background-color: #ff8400;
      .label {
        color: #fff;
      }
      .num {
        color: #ff8400;
      }
    }
    .level-3 {
      background-color: #e7b300;
      .label {
        color: #fff;
      }
      .num {
        color: #e7b300;
      }
    }
    .level-2 {
      background-color: #34b0ff;
      .label {
        color: #fff;
      }
      .num {
        color: #34b0ff;
      }
    }
  }
}

.probability-tips {
  width: 700rpx;
  padding: 20rpx 10rpx;
  font-size: 20rpx;
  border-radius: 20rpx;
  background: #fff;
  text-align: center;
}

.goods-list-wrap {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  padding: 10rpx;
  background: #F5F5F5;
}
.goods-card {
  position: relative;
  padding: 0;
  width: 360rpx;
  height: 480rpx;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
  background: #fff;
  padding: 10rpx 0 0 10rpx;
  box-sizing: border-box;
}
.goods-grade-icon{
  position: absolute;
  top: 0;
  left: 0;
  width: 136rpx;
  height: 40rpx;
  background-size: 136rpx 40rpx;
  background-position: 0 0;
  background-repeat: no-repeat;
  .level{
    padding-top: 18rpx;
    padding-left: 68rpx;
  }
  .gold-star,
  .grey-star{
    width: 14rpx;
    height: 14rpx;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/star-gold.png);
    background-size: 100% 100%;
  }
  .grey-star{
    background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/star-grey.png);
  }
}
.goods-grade-level-5{
  background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/goods-level-5.png);
}
.goods-grade-level-4{
  background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/goods-level-4.png);
}
.goods-grade-level-3{
  background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/goods-level-3.png);
}
.goods-grade-level-2{
  background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/goods-level-2.png);
}

.goods-card__thumb {
  position: relative;
  width: 340rpx;
  height: 340rpx;
}

.points-icon{
  width: 34rpx;
  height: 34rpx;
  background: url(https://www.niantu.cn/img/spark-mall/static/points-icon.png) no-repeat 0 0;
  background-size: 100% 100%;
}


/** ----------------- 已抽规则弹层 ------------------ */

.rules{
  height: 520rpx;
  padding: 0px 0rpx 90rpx;

  .rules-content{
    // background-color: #000;
    box-sizing: border-box;
    height: 390rpx;
  }
  .rules-header {
    margin-bottom: 10rpx;
    padding: 40rpx 30rpx 0 30rpx;
    box-sizing: border-box;
    height: 100rpx;
    display: flex;
    justify-content: space-between;
  }
  .rules-title{
    font-family: 'myFz';
  }

  .confirm-btn{
    margin: 0 auto;
    border-radius: 10rpx;
    width: 650rpx;
    height: 74rpx;
    line-height: 74rpx;
    text-align: center;
    background: #FB0C01;
    color: #fff;
    font-size: 32rpx;
  }
}


/** ----------------- 确认订单弹层 ------------------ */

.order-confirm{
  height: 1040rpx;
  padding: 0px 0rpx 90rpx;

  .order-content{
    // background-color: #000;
  }
  .confirm-header {
    margin-bottom: 10rpx;
    padding: 40rpx 30rpx 0 30rpx;
    box-sizing: border-box;
    height: 100rpx;
    display: flex;
    justify-content: space-between;
  }
  .confirm-title{
    font-family: 'myFz';
  }

  .blind-box-desc{
    padding: 0 30rpx;
    height: 150rpx;
    margin-top: 0;
    margin-bottom: 40rpx;
    .price{
      padding-top: 10rpx;
      font-size: 28rpx;
      font-weight: bold;
    }
  }
  .blind-box-main{
    display: flex;
    .title {
      padding-top: 10rpx;
      margin-left: 20rpx;
    }
    .thumbnail{
      width: 150rpx;
      height: 150rpx;
      background: #F8F8F8;
    }
  }
  .blind-box-num{
    .num{
      font-weight: bold;
      color: #929292;
      font-size: 24rpx;
    }
  }

  .confirm-group-item{
    margin: 15rpx 0;
    padding: 0 30rpx;
    height: 50rpx;
    font-size: 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }


  .total{
    .txt{
      text-align: right;
    }
  }
  .coupon{
    .no-coupon{
      color: #A0A0A0;
    }
  }
  .no-points{
    color: #A0A0A0;
  }
  .buy-tips-wrap{
    margin-bottom: 30rpx;
    padding: 0rpx 0rpx 8rpx 0;
    background-color: #E5E5E5;
  }
  .buy-tips{
    padding: 15rpx 30rpx;
    border-radius: 12rpx;
    background: #fff;
    font-size: 18rpx;
    line-height: 36rpx;
    color: #929292;
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

  .agree-tips{
    margin-bottom: 30rpx;
    color: #929292;
    font-size: 28rpx;
  }
  .confirm-btn{
    margin: 0 auto;
    border-radius: 10rpx;
    width: 650rpx;
    height: 74rpx;
    line-height: 74rpx;
    text-align: center;
    background: #FB0C01;
    color: #fff;
    font-size: 32rpx;
  }
}






/** ----------------- 抽奖弹层 ------------------ */

.draw-count-info {
  position: relative;
  box-sizing: border-box;
  width: 750rpx;
  height: 570rpx;
  padding-top: 234rpx;
  background: url(https://www.niantu.cn/img/spark-mall/static/blindbox/draw_count_info.png) no-repeat 0 0;
  background-size: 100% 100%;
  .draw-count-header{
    .title {
      padding: 10px 20px 5px;
      color: #333;
    }
  }
  .blindbox-icon{
    position: absolute;
    top: -20rpx;
    right: 20rpx;
  }

  .btn-list{
    padding: 20rpx 40rpx;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .btn-item{
    box-sizing: border-box;
    margin: 0 0 15rpx 0;
    padding: 60rpx 0 0 0;
    width: 318rpx;
    height: 120rpx;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: 0 0;
    text-align: center;
    &.btn-0{
      background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/draw-count-btn-1.png);
    }
    &.btn-1{
      background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/draw-count-btn-3.png);
    }
    &.btn-2{
      background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/draw-count-btn-5.png);
    }
    &.btn-3{
      background-image: url(https://www.niantu.cn/img/spark-mall/static/blindbox/draw-count-btn-10.png);
    }
    .label{
      display: none;
      font-weight: bold;
      font-size: 32rpx;
      color: #383939;
    }
    .price{
    }
  }
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

/** ----------------- 积分详情弹层 ------------------ */

.points-popup{
  position: relative;
  height: 830rpx;
  background-color: #F8F8F8;
  .points-popup-title{
    position: relative;
    height: 108rpx;
    line-height: 108rpx;
    text-align: center;
    background: #FFFFFF;
    .back-btn{
      position: absolute;
      top: 0rpx;
      left: 10rpx;
    }
  }
  .points-popup-body{
    padding: 14rpx 10rpx;
    .points-intro{
      width: 730rpx;
      height: 130rpx;
      box-sizing: border-box;
      margin-bottom: 10rpx;
      border-radius: 10rpx;
      padding: 46rpx 30rpx;
      background-color: #fff;
      .txt{
        font-size: 30rpx;
        color: #000;
        font-weight: bold;
      }
      .my-points{
        font-size: 24rpx;
        color: #7B7B7B;
        margin-top: 10rpx;
      }
    }
  }
  .points-popup-footer{
    position: absolute;
    bottom: 30rpx;
    left: 0;
    right: 0;
    .points-tips{
      margin: 0 auto 20rpx;
      width: 662rpx;
    }
    .confirm-btn{
      margin: 0 auto;
      border-radius: 10rpx;
      width: 650rpx;
      height: 74rpx;
      line-height: 74rpx;
      text-align: center;
      background: #FB0C01;
      color: #fff;
      font-size: 32rpx;
    }
  }
}

.coupon-popup{
  position: relative;
  height: 900rpx;
  background-color: #e5f8f8;
  .coupon-popup-title{
    position: relative;
    height: 78rpx;
    line-height: 78rpx;
    text-align: center;
    background: #FFFFFF;
    .back-btn{
      position: absolute;
      top: 0rpx;
      left: 10rpx;
    }
  }
  .coupon-popup-body{
    padding: 20rpx;
    .reject-coupon{
      margin-bottom: 20rpx;
      border-radius: 10rpx;
      padding: 46rpx 38rpx;
      background-color: #fff;
      .txt{
        font-size: 36rpx;
        color: #050505;
        font-weight: bold;
      }
    }
    .coupon-item{
      padding-right: 38rpx;
      margin-bottom: 20rpx;
      border-top-right-radius: 10rpx;
      border-bottom-right-radius: 10rpx;
      background-color: #fff;
      .coupon-intro{
        height: 190rpx;
        .coupon-amount{
          width: 224rpx;
          height: 188rpx;
          line-height: 188rpx;
          border-radius: 10rpx;
          // border-top-left-radius: 10rpx;
          // border-bottom-left-radius: 10rpx;
          background-color: #35DBDB;
          text-align: center;
          color: #fff;
          font-size: 30rpx;
          font-weight: bold;
        }
      }
      .coupon-detail{
        padding: 0rpx 30rpx 0rpx;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .txt{
          margin-bottom: 30rpx;
          font-size: 36rpx;
          color: #050505;
          font-weight: bold;
        }
        .expiration-time{
          color: #050505;
          font-size: 20rpx;
        }
      }
    }
  }
  .coupon-popup-footer{
    position: absolute;
    bottom: 30rpx;
    left: 0;
    right: 0;
    .confirm-btn{
      margin: 0 auto;
      border-radius: 10rpx;
      width: 662rpx;
      height: 84rpx;
      line-height: 84rpx;
      text-align: center;
      background: #35DBDB;
      color: #fff;
      font-size: 32rpx;
    }
  }
}

.gka-wrap {
  left: -6rpx;
  position: absolute;
  width: 772rpx;
  height: 680rpx;
}

.animation {
  width: 772rpx;
  height: 680rpx;
  background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/1.png");
  background-size: 772rpx 680px;
  background-repeat: no-repeat;
  animation-name: keyframes-red;
  animation-duration: 2s;
  animation-delay: 0s;
  animation-iteration-count: infinite;
  animation-fill-mode: forwards;
  animation-timing-function: steps(1);
}

@keyframes keyframes-red {
    0% {
        width: 772rpx;
        height: 680rpx;
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/1.png");
        background-size: 772rpx 680rpx;
    }

    2.70% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/2.png");
    }

    5.41% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/3.png");
    }

    8.11% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/4.png");
    }

    10.81% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/5.png");
    }

    13.51% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/6.png");
    }

    16.22% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/7.png");
    }

    18.92% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/8.png");
    }

    21.62% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/9.png");
    }

    24.32% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/10.png");
    }

    27.03% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/11.png");
    }

    29.73% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/12.png");
    }

    32.43% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/13.png");
    }

    35.14% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/14.png");
    }

    37.84% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/15.png");
    }

    40.54% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/16.png");
    }

    43.24% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/17.png");
    }

    45.95% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/18.png");
    }

    48.65% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/19.png");
    }

    51.35% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/20.png");
    }

    54.05% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/21.png");
    }

    56.76% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/22.png");
    }

    59.46% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/23.png");
    }

    62.16% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/24.png");
    }

    64.86% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/25.png");
    }

    67.57% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/26.png");
    }

    70.27% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/27.png");
    }

    72.97% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/28.png");
    }

    75.68% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/29.png");
    }

    78.38% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/30.png");
    }

    81.08% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/31.png");
    }

    83.78% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/32.png");
    }

    86.49% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/33.png");
    }

    89.19% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/34.png");
    }

    91.89% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/35.png");
    }

    94.59% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/36.png");
    }

    97.30%,
    100% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/blindbox/img/37.png");
    }
}

@keyframes breathe {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

</style>
