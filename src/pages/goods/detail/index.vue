<route lang="jsonc" type="page">
    {
      "layout": "default",
      "style": {
        // 'custom' 表示开启自定义导航栏，默认 'default'
        "navigationStyle": "custom",
        "navigationBarTitleText": "商品详情页"
      }
    }
</route>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useToast } from 'wot-design-uni'
import { fetchGoodsInfo, goodsInfoResponse } from '@/api/goods';
import cartBar from './components/cart-bar/index.vue'
import { useUserStore } from '@/store'
import { formatNumberToZeroString } from '@/utils/util'
import Big from 'big.js';

// pinia
const userStore = useUserStore()

defineOptions({
  name: 'GoodsDetail',
})


// 获取页面参数
const goodsId = ref('')
const originPage = ref('') //来源页

onLoad(async (options) => {
  console.log("onLoad");

  if (options.id) {
    goodsId.value = options.id
    await fetchGoodsInfoHandle()
  } else {
    uni.showToast({
      title: '商品ID不存在',
      icon: 'error'
    })
  }
  if (options.originPage) {
    originPage.value = options.originPage
    console.log('originPage', originPage.value)
  }

})

onMounted(async () => {
  console.log("onMounted");
})

onShow(() => {
  console.log("onShow");
})


// 确保输入值合法
function safeBig(val: any): Big {
  const num = Number(String(val).trim()) // 这里有个知识点，Number不会抛错，只会返回NaN
  return isFinite(num) ? new Big(num) : new Big(0)
}

// 商品数量
const buyGoodsNum = ref<number>(1)
// function handleChange({ value }) {
//   console.log(buyGoodsNum.value)
// }

// 总价
const buyGoodsAmount = computed(() => {
  console.log('goodsInfo.value.premium', safeBig(goodsInfo.value.premium).toFixed(2))
  // console.log('goodsInfo.value.premium', Number(goodsInfo.value.premium))
  // console.log('totalDiscountAmount', buyGoodsNum.value * parseInt(goodsInfo.value.premium))
  return safeBig(buyGoodsNum.value).times(safeBig(goodsInfo.value.premium).toFixed(2)).toNumber()
})

// 总价字符串
const buyGoodsAmountString = computed(() => {
  return formatNumberToZeroString(buyGoodsAmount.value, 2)
})

const {
  show: showToast,
  loading: showLoading,
  close: hideLoading,
} = useToast()


const goodsInfo = ref<goodsInfoResponse | null>({
  id: 0, // 商品id
  productName: '', // 名称
  productGrade: '', // 等级
  premium: '', // 商品溢价（售价）
  exchangePrice: '', // 兑换价（积分）
  dismantlePrice: '', // 分解价格（积分）
  storePageIcon: '', // 图标
  productDetailAdImage: '', // 广告介绍图
  productDetailImages: '', // 商品介绍图
  shippingFee: '' // 运费
})


// 加载盲盒详情
const fetchGoodsInfoHandle = async () => {
  try {
    // 调用API
    const response = await fetchGoodsInfo({
      id: goodsId.value
    })

    console.log('goodsInfo', response)

    goodsInfo.value = response

    // 从商品列表取出图片做为图片轮播
    if (response.storePageIcon == '') {
      goodsInfo.value.storePageIcon = 'https://picsum.photos/300/300?random=1000' + Math.floor(Math.random()*52 + 1)
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

// 前往商品订单，buyType 两种类型 purchase-直接购买  exchange -积分兑换
function goToGoodsOrderHandle(buyType) {
  // showToast('前往商品确认订单')
  let orderConfig = {
    buyType: buyType,
    goodsId: goodsId.value,
    goodsIcon: goodsInfo.value.storePageIcon,
    goodsPremium: goodsInfo.value.premium,
    goodsExchangePrice: goodsInfo.value.exchangePrice,
    goodsName: goodsInfo.value.productName,
    buyGoodsNum: buyGoodsNum.value,
    buyGoodsAmount: buyGoodsAmount.value,
    goodsShippingFee: goodsInfo.value.shippingFee,
  }
  if (buyType === 'exchange') {
    uni.navigateTo({
      url: `/pages/goods/order/exchange?data=${JSON.stringify(orderConfig)}`
    })
  } else {
    uni.navigateTo({
      url: `/pages/goods/order/purchase?data=${JSON.stringify(orderConfig)}`
    })
  }

  // uni.setStorageSync('order.goodsRequestList', JSON.stringify(goodsRequestList))
  // wx.navigateTo({ url: '/pages/order/order-confirm/index?type=cart' })
}

function goodListAddCartHandle() {
  showToast('点击加入购物车')
}

function navToSearchPage() {
  // router.push('/pages/goods/search/index');
}

function navToActivityDetail({ detail }) {
  const { index: promotionID = 0 } = detail || {}
  // router.push(`/pages/promotion-detail/index?promotion_id=${promotionID}`);
}
</script>

<template>
  <view class="box-border w-full">
    <!-- 自定义顶部标题蓝 -->
    <custom-nav-bar
      title=""
      :show-icon="true"
      :bg-color="'#ffffff'"
    >
    </custom-nav-bar>

    <!-- 商品详情页  -->
    <view class="goods-header bg-#f8f8f8">
      <view class="goods-pic-wrap">
        <view class="goods-pic">
          <wd-img
            width="100%"
            height="100%"
            :src="goodsInfo.storePageIcon"
          />
        </view>
      </view>

      <view class="goods-intro bg-#fff pt-20rpx rounded-tl-20rpx">
        <view class="goods-intro-item pl-20rpx pr-20rpx flex justify-between">
          <view class=" goods-price">
            <view class="font-size-40rpx fw-bold color-#ff0c00">{{ '￥' + goodsInfo.premium }}</view>
          </view>

          <view class="goods-point flex flex-items-center" v-if="!originPage">
            <view class="points-icon mr-8rpx"></view>
            <view class="text-26rpx fw-bold color-#ef8106">{{ goodsInfo.exchangePrice + '积分'}}</view>
          </view>

        </view>

        <view class="goods-intro-item pl-20rpx pr-20rpx goods-name pt-20rpx pb-20rpx">
          <text class="text-24rpx color-#212121">{{ goodsInfo.productName }}</text>
        </view>

        <view class="goods-intro-item pl-20rpx pr-20rpx h-70rpx flex items-center justify-between">
          <text class="text-24rpx color-#212121">运费</text>
          <text class="text-24rpx color-#929292">{{ goodsInfo.shippingFee }}</text>
        </view>

        <view class="goods-intro-item pl-20rpx pr-20rpx h-70rpx flex items-center justify-between">
          <text class="text-24rpx color-#212121">服务保证</text>
          <text class="text-24rpx color-#929292">七天内发货 · 品质保证 · 无忧售后</text>
        </view>

        <view class="goods-intro-item pl-20rpx pr-20rpx h-86rpx flex justify-between items-center" v-if="!originPage">
          <view class="text-24rpx color-#212121">
            数量
          </view>
          <view class="pr-2">
            <wd-input-number v-model="buyGoodsNum" />
          </view>
      </view>
    </view>

    </view>

    <view class="h-40rpx flex items-center justify-center bg-#ebebeb">
      <wd-text text="提示：商品非质量问题不支持7天无理由退货" size="20rpx" color="#929292"></wd-text>
    </view>

    <view class="goods-gallery">
      <wd-img 
        v-for="(item, index) in goodsInfo.productDetailImages" 
        :key="index"
        :lazy-load="true"
        width="100%"
        custom-class="goods-info-pic"
        :mode="'widthFix'"
        :src="item"
      />
      <!-- <image :src="item" :mode="'widthFix'" style="width: 100%"></image> -->
    </view>

    <footer-tool-bar :safe-area-inset-bottom="true">
      <!-- 商品小计以及结算按钮 -->
      <cart-bar
        v-if="!originPage"
        :total-amount="buyGoodsAmountString"
        :total-goods-num="buyGoodsNum"
        :fixed="true"
        @handleToExchange="goToGoodsOrderHandle('exchange')"
        @handleToPurchase="goToGoodsOrderHandle('purchase')"
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
.goods-pic-wrap {
}
.goods-pic {
  margin: 0rpx auto;
  width: 600rpx;
  height: 600rpx;
  text-align: center;
}

.points-icon{
  width: 32rpx;
  height: 32rpx;
  background: url(https://www.niantu.cn/img/spark-mall/static/points-icon.png) no-repeat 0 0;
  background-size: 100% 100%;
}

.goods-intro-item{
  border-bottom: 2rpx solid #f8f8f8;
}


.spec-for-price {
  font-size: 32rpx;
  white-space: nowrap;
  font-weight: 700;
  order: 1;
  color: #050505;
  margin: 0;
}
.spec-for-point {
  font-size: 24rpx;
  white-space: nowrap;
  font-weight: 700;
  order: 1;
  color: #E57143;
  margin: 0;
}

.buy_num {
  padding-top: 18rpx;
  padding-bottom: 8rpx;
  display: flex;
  border-top: 1px solid #e3e3e3;
}
.tips{
  margin-top: 10px;
  padding: 0 10px;
  line-height: 40px;
  background-color: #24AB97;
}
.goods-gallery{
  padding: 0px 0;
  display: flex;
  flex-direction: column;
}
.goods-info-pic{
  vertical-align: top;
}
</style>
