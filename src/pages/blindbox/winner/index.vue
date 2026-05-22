<route lang="jsonc" type="page">
    {
      "layout": "default",
      "style": {
        "navigationStyle": "custom",        
        "navigationBarTitleText": "盲盒开奖页"
      },
      "app-plus": {
        "titleNView": false
      }
    }
 </route>

<script lang="ts" setup>

defineOptions({
  name: "BlindBoxWinner",
});

import { ref, computed } from "vue";
import { useToast } from "wot-design-uni";
import { nextTick, getCurrentInstance } from 'vue'

import winnerBar from "../components/winner-bar/index.vue";
import { 
  getBoxDraw,
  getTestDraw
} from '@/api/boxInfo';

const {
  show: showToast,
  loading: showLoading,
  close: hideLoading,
} = useToast();

// 类this
const { ctx } = getCurrentInstance()


// 订单号
const orderNo = ref<number>(0)
// 来源
const originPage = ref<string>('')
// 盲盒id
const blindBoxId = ref<number>(0)
// 类型
const type = ref<string>('')

// 开奖后获取的列表
const productList = ref<any[]>([])

/* 
const productList = ref<any[]>([
  {
    count: 1,
    dismantlePrice: "221850.00",
    exchangePrice: "266220.00",
    icon: "http://49.233.20.99:8074/Goods/icon_Elviswatch.jpeg",
    id: 239,
    name: "猫王手表",
    orderNo: "202508311108467309",
    productGrade: "高级",
    productRating: 5,
    productId: 1031,
    shippingFee: "9",
    premium: "592.00"
  },
])

  {
    count: 1,
    dismantlePrice: "221850.00",
    exchangePrice: "266220.00",
    icon: "http://49.233.20.99:8074/Goods/icon_Elviswatch.jpeg",
    id: 239,
    name: "猫王手表",
    orderNo: "202508311108467309",
    productGrade: "高级",
    productRating: 4,
    productId: 1031,
    shippingFee: "9",
    premium: "592.00"
  },

  {
    count: 1,
    dismantlePrice: "221850.00",
    exchangePrice: "266220.00",
    icon: "http://49.233.20.99:8074/Goods/icon_Elviswatch.jpeg",
    id: 239,
    name: "猫王手表",
    orderNo: "202508311108467309",
    productGrade: "高级",
    productRating: 3,
    productId: 1031,
    shippingFee: "9",
    premium: "592.00"
  },
  {
    count: 1,
    dismantlePrice: "221850.00",
    exchangePrice: "266220.00",
    icon: "http://49.233.20.99:8074/Goods/icon_Elviswatch.jpeg",
    id: 239,
    name: "猫王手表",
    orderNo: "202508311108467309",
    productGrade: "高级",
    productRating: 2,
    productId: 1031,
    shippingFee: "9",
    premium: "592.00"
  },
 
  {
    count: 1,
    dismantlePrice: "221850.00",
    exchangePrice: "266220.00",
    icon: "http://49.233.20.99:8074/Goods/icon_Elviswatch.jpeg",
    id: 239,
    name: "猫王手表",
    orderNo: "202508311108467309",
    productGrade: "高级",
    productRating: 2,
    productId: 1031,
    shippingFee: "9",
    premium: "592.00"
  },
  {
    count: 1,
    dismantlePrice: "221850.00",
    exchangePrice: "266220.00",
    icon: "http://49.233.20.99:8074/Goods/icon_Elviswatch.jpeg",
    id: 239,
    name: "猫王手表",
    orderNo: "202508311108467309",
    productGrade: "高级",
    productRating: 2,
    productId: 1031,
    shippingFee: "9",
    premium: "592.00"
  },
 
  {
    count: 1,
    dismantlePrice: "221850.00",
    exchangePrice: "266220.00",
    icon: "http://49.233.20.99:8074/Goods/icon_Elviswatch.jpeg",
    id: 239,
    name: "猫王手表",
    orderNo: "202508311108467309",
    productGrade: "高级",
    productRating: 2,
    productId: 1031,
    shippingFee: "9",
    premium: "592.00"
  },
  {
    count: 1,
    dismantlePrice: "221850.00",
    exchangePrice: "266220.00",
    icon: "http://49.233.20.99:8074/Goods/icon_Elviswatch.jpeg",
    id: 239,
    name: "猫王手表",
    orderNo: "202508311108467309",
    productGrade: "高级",
    productRating: 2,
    productId: 1031,
    shippingFee: "9",
    premium: "592.00"
  },
  {
    count: 1,
    dismantlePrice: "221850.00",
    exchangePrice: "266220.00",
    icon: "http://49.233.20.99:8074/Goods/icon_Elviswatch.jpeg",
    id: 239,
    name: "猫王手表",
    orderNo: "202508311108467309",
    productGrade: "高级",
    productRating: 2,
    productId: 1031,
    shippingFee: "9",
    premium: "592.00"
  },

 
  {
    count: 1,
    dismantlePrice: "221850.00",
    exchangePrice: "266220.00",
    icon: "http://49.233.20.99:8074/Goods/icon_Elviswatch.jpeg",
    id: 239,
    name: "猫王手表",
    orderNo: "202508311108467309",
    productGrade: "高级",
    productRating: 2,
    productId: 1031,
    shippingFee: "9",
    premium: "592.00"
  },
  {
    count: 1,
    dismantlePrice: "221850.00",
    exchangePrice: "266220.00",
    icon: "http://49.233.20.99:8074/Goods/icon_Elviswatch.jpeg",
    id: 239,
    name: "猫王手表",
    orderNo: "202508311108467309",
    productGrade: "高级",
    productRating: 2,
    productId: 1031,
    shippingFee: "9",
    premium: "592.00"
  },
  {
    count: 1,
    dismantlePrice: "221850.00",
    exchangePrice: "266220.00",
    icon: "http://49.233.20.99:8074/Goods/icon_Elviswatch.jpeg",
    id: 239,
    name: "猫王手表",
    orderNo: "202508311108467309",
    productGrade: "高级",
    productRating: 2,
    productId: 1031,
    shippingFee: "9",
    premium: "592.00"
  },
  {
    count: 1,
    dismantlePrice: "221850.00",
    exchangePrice: "266220.00",
    icon: "http://49.233.20.99:8074/Goods/icon_Elviswatch.jpeg",
    id: 239,
    name: "猫王手表",
    orderNo: "202508311108467309",
    productGrade: "高级",
    productRating: 2,
    productId: 1031,
    shippingFee: "9",
    premium: "592.00"
  },
  
])
*/


// 积分总价值
const pointsSum = ref<number>(0)

// 
const headerTop = ref<number>(0)
const footerTop = ref<number>(0)
const scrollViewTop = ref<number>(0)
const scrollViewHeight = ref<number>(0)

onLoad(async (options) => {
  console.log('options', options);

  // 设置来源页和盲盒id
  originPage.value = options.originPage
  blindBoxId.value = options.blindBoxId
  orderNo.value = options.orderNo
  type.value = options.type

  if (options.type === 'try' && options.blindBoxId) {
    // 调用盲盒试玩开奖
    await getTestDrawHandle()
    return
  }

  if (options.type === 'default' && options.orderNo) {
    await getBoxDrawHandle()
    return
  } else {
    uni.showToast({
      title: '盲盒ID不存在',
      icon: 'error'
    })
    // uni.navigateBack()
  }

})

onMounted(async () => {
  console.log("onMounted");

  const query = uni.createSelectorQuery().in(ctx)
  // DOM 更新完成后执行
  nextTick(() => {
    // DOM 更新完成后执行
    // query.select("#header").boundingClientRect((data: any) => {
    //   console.log('标题距离顶部', data)
    //   headerTop.value = data.top
    // }).exec()

    query.select("#footer").boundingClientRect((data: any) => {
      console.log('底部菜单距离顶部', data)
      footerTop.value = data.top
    }).exec()

    query.select("#scroll-view").boundingClientRect((data: any) => {
      console.log('scroll-view距离顶部', data)
      scrollViewTop.value = data.top
    }).exec()

    uni.getSystemInfo({
				success: (res) => {
          // _this.height = resu.windowHeight - res[0].top + 'px';
          console.log('打印页面的剩余高度', res.windowHeight)
          scrollViewHeight.value = footerTop.value - scrollViewTop.value
          console.log('打印页面的剩余高度', scrollViewHeight.value)
				},
				fail: (res) => {}
			})
    })

  // 开奖数量为1时加载动画
  if (productList.value.length === 1) {
    console.log('preloadImage -------------')
    // 预加载动画图片
    preloadImage(["0.png","1.png","2.png","3.png","4.png","5.png","6.png","7.png","8.png","9.png","10.png","11.png","12.png","13.png","14.png","15.png","16.png","17.png","18.png","19.png","20.png","21.png","22.png","23.png","24.png","25.png","26.png"], function() {
        // document.getElementById('gka').className += " animation"
        console.log('loading finish')
        
    }, "https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/")
    animationBgLevel5.value = true

    preloadImage(["0.png","1.png","2.png","3.png","4.png","5.png","6.png","7.png","8.png","9.png","10.png","11.png","12.png","13.png","14.png","15.png","16.png","17.png","18.png","19.png","20.png","21.png","22.png","23.png","24.png","25.png","26.png"], function() {
        // document.getElementById('gka').className += " animation"
        console.log('loading finish')
    }, "https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/")
    animationBgLevel4.value = true
    
    preloadImage(["0.png","1.png","2.png","3.png","4.png","5.png","6.png","7.png","8.png","9.png","10.png","11.png","12.png","13.png","14.png","15.png","16.png","17.png","18.png","19.png","20.png","21.png","22.png","23.png","24.png","25.png","26.png"], function() {
        // document.getElementById('gka').className += " animation"
        console.log('loading finish')
    }, "https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/")
    animationBgLevel3.value = true

    preloadImage(["0.png","1.png","2.png","3.png","4.png","5.png","6.png","7.png","8.png","9.png","10.png","11.png","12.png","13.png","14.png","15.png","16.png","17.png","18.png","19.png","20.png","21.png","22.png","23.png","24.png","25.png","26.png"], function() {
        // document.getElementById('gka').className += " animation"
        console.log('loading finish')
    }, "https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/")
    animationBgLevel2.value = true
  }
  
  // 获取路由参数
  // const pages = getCurrentPages()
  // const currentPage = pages[pages.length - 1]
  // const options = currentPage.options
})

// 盲盒开奖
const getBoxDrawHandle = async () => {
  try {
    // 调用API
    const response = await getBoxDraw({
      orderNo: orderNo.value
    })
    
    productList.value = response.productList

    console.log('productList', productList.value)

    productList.value.forEach((item => {
      item.isSelected = true
    }))

    pointsSum.value = productList.value.reduce((prev, curr) => prev + parseInt(curr.exchangePrice), 0)
    console.log('pointsSum', pointsSum.value);

  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

// 盲盒试玩开奖
const getTestDrawHandle = async () => {
  try {
    // 调用API
    const response = await getTestDraw({
      boxId: blindBoxId.value
    })
    
    // 将返回的对象数据放入数组第一个
    productList.value[0] = response.productList

    console.log('Try productList', productList.value)

    productList.value.forEach((item => {
      item.isSelected = true
    }))


    pointsSum.value = productList.value.reduce((prev, curr) => prev + parseInt(curr.exchangePrice), 0)
    console.log('pointsSum', pointsSum.value);

  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

const gkaCache = ref<any>([])
const animationBgLevel5 = ref<boolean>(false)
const animationBgLevel4 = ref<boolean>(false)
const animationBgLevel3 = ref<boolean>(false)
const animationBgLevel2 = ref<boolean>(false)

const preloadImage = (names, cb, prefix) => {
  console.log('preloadImage start')
  let gkaCache = [];
  let n = 0,img,imgs = {};
  names.forEach(function(name) {
      let src = (prefix || '') + name;
      
      uni.getImageInfo({
        src: src,
        success: (res) => {
          console.log('Image loaded:', res.path)
          gkaCache.push(src)
        }
      })

      if (names.length === gkaCache.length) {
        cb()
        return
      }
  })
}

function init() {
  console.log("init");
}

// 计算盲盒开奖区域内容高度
const contentHeight = computed(() => {
  let num = productList.value.length
  let height = 0
  switch (num) {
    case 1:
      height = 966
      break;
    case 2:
      height = 390 
      break;
    case 3:
    case 4:
      height = 800 // 390*2 + 20
      break;
    case 5:
    case 6:
      height = 538 // 260 * 2 + 18
      break;
    case 7:
    case 8:
    case 9:
      height = 816 // 260 * 3 + 36
      break;
    // 大于9
    default:
      height = 816
      // height = 1094 // 260 * 4 + 54
  }
  return height + 'rpx'
})

// 跳转到分解列表页面
const goToDeliveryPage = () => {
  // 跳转至可提货商品列表，并传递已选中的项
  // console.log('selectedProductList', productList.value)

  uni.navigateTo({
    url: '/pages/box/delivery/index?data=' + encodeURIComponent(JSON.stringify(productList.value)),
    success: function(res) {
    }
  })
}

// 跳转到首页
const goToHomePage = () => {
  // switchTab 必须写完整路径
  uni.switchTab({
    url: '/pages/home/home',
    success(res) {
    }
  })
}

// 跳转到提货列表页
const goToDismantlePage = () => {
  // 跳转至可提货商品列表，并传递已选中的项
  console.log('selectedProductList', productList.value)

  uni.navigateTo({
    url: '/pages/box/dismantle/index?data=' + encodeURIComponent(JSON.stringify(productList.value)),
    success: function(res) {
    }
  })
}

// 跳转至寄售首页
const goToConsignmentPage = () => {
  uni.navigateTo({
    url: '/pages-consignment/index/index',
    success: function(res) {
    }
  })
}

// 跳转至盲盒详情页
const goToBlindBoxPage = () => {
  console.log('goToBlindBoxPage')
  // todo 判断有没有盲盒详情页id，没有则返回首页
  if (blindBoxId.value) {
    uni.navigateTo({
      url: '/pages/blindbox/detail/index?id=' + blindBoxId.value,
      success: function(res) {
      }
    })
  } else {
    console.log('go home')
    // switchTab 必须写完整路径
    uni.switchTab({
      url: '/pages/home/home',
      success(res) {
      }
    })
  }
}

const videoErrorCallback = () => {
  console.log('videoErrorCallback')
}
const videoEndedHandle = () => {
  console.log('播放结束')
  isPlayEnded.value = true
}

const isPlayEnded = ref(false)

</script>

<template>

  <!-- 小程序端展现视频 -->
  <!-- #ifdef MP-WEIXIN -->
  <!-- 视频 -->
    <template v-if="!isPlayEnded">
      <view class="video-wrap">
        <video
          id="myVideo"
          src="https://img.niantu.cn/spark-mall/static/kaijiang.mp4"
          object-fit="cover"
          :autoplay="true"
          :muted="true"
          :controls="false"
          :show-center-play-btn="false"
          @ended="videoEndedHandle"
          @error="videoErrorCallback"
      ></video>
      </view>
    </template>
  <!-- #endif -->
  <!-- 内容 -->
  <!-- <template></template> -->
  <!-- #ifdef MP-WEIXIN -->
  <view class="winner box-border" v-if="isPlayEnded">
  <!-- #endif -->
  <!-- #ifndef MP-WEIXIN -->
  <view class="winner box-border">
  <!-- #endif -->
      <view id="header" class="winner-title">
        <!-- <wd-text text="恭喜您获得" size="36px" color="#fff"></wd-text> -->
      </view>

      <!-- 通过数组判断抽中了几个盲盒，来决定展示逻辑1、3、5、9 -->
      <!-- {{ productList.length }} -->

      <scroll-view 
        id="scroll-view"
        class="scroll-view"
        :style="{height: scrollViewHeight + 'px'}"
        scroll-y
      >
        <view style="height: 100%;" class="flex items-center justify-center">

          <!-- 1个盲盒 -->
          <template v-if="productList.length == 1">
            <view class="winner-box-one"
              :class="[ animationBgLevel5 ? 'animation-level-' + productList[0].productRating : '']"
            >
              <!-- <view class="animation-level-5"></view> -->
              <view 
                v-for="(item) in productList"
                :key="item.id"
                class="blind-box-intro"
                :class="['blind-box-intro-level-' + item.productRating]"
              >
                
                <view class="title" :class="['title-level-' + item.productRating]">
                  <text class="hidden">{{ item.productGrade }}</text>
                </view>

                <!-- 盲盒图片展示  -->
                <view class="mt-50rpx ml-auto mr-auto mb-32rpx w-250rpx h-250rpx">
                  <wd-img
                    width="100%"
                    height="100%"
                    radius="0"
                    :src="item.icon"
                  />
                </view>

                <view
                  class="info mx-auto w-404rpx h-148rpx"
                  :class="['info-bg-level-' + item.productRating]"
                >
                  <!-- 盲盒名称 -->
                  <view class="w-380rpx pt-10rpx pl-15rpx font-size-42rpx fw-bold color-#ffffff overflow-hidden text-ellipsis whitespace-nowrap">
                    {{ item.name }}
                  </view>

                  <!-- 盲盒价格 -->
                  <view class="mt-15rpx font-size-48rpx fw-bold color-#f3fe44">
                    {{ '￥' + item.premium }}
                  </view>
                </view>
              </view>

            </view>
          </template>

          <!-- 大于1小于4 盲盒 -->
          <template v-if="productList.length > 1 && productList.length <= 4">
            <view class="winner-box-four" :style="{ 'height': contentHeight }">
              <view class="winner-box-wrap" v-for="item in productList" :key="item.id">
                <view class="blind-box-intro" :class="['blind-box-intro-level-' + item.productRating]">

                  <view class="title" :class="['title-level-' + item.productRating]">
                    <text class="hidden">{{ item.productGrade }}</text>
                  </view>

                  <!-- 盲盒图片展示  -->
                  <view class="mt-30rpx mx-auto mb-20rpx w-165rpx h-165rpx">
                    <wd-img
                      width="100%"
                      height="100%"
                      radius="0"
                      :src="item.icon"
                    />
                  </view>

                  <view
                    class="info mx-auto box-border pl-10rpx pr-10rpx"
                  :class="['info-bg-level-' + item.productRating]"
                  >
                    <!-- 盲盒名称 -->
                    <view class="pt-10rpx font-size-28rpx fw-bold color-#ffffff overflow-hidden text-ellipsis whitespace-nowrap">
                      {{ item.name }}
                    </view>

                    <!-- 盲盒价格 -->
                    <view class="mt-5rpx font-size-32rpx fw-bold color-#f3fe44">
                      {{ '￥' + item.premium }}
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </template>

          <!-- 大于4小于9 个盲盒 -->
          <template v-if="productList.length > 4 && productList.length <= 9">
            <view class="winner-box-nine" :style="{'height': contentHeight}">
              <view class="winner-box-wrap" v-for="item in productList" :key="item.id">
                <view class="blind-box-intro" :class="['blind-box-intro-level-' + item.productRating]">

                  <view class="title" :class="['title-level-' + item.productRating]">
                    <text class="hidden">{{ item.productGrade }}</text>
                  </view>

                  <!-- 盲盒图片展示  -->
                  <view class="mt-20rpx mx-auto mb-12rpx w-110rpx h-110rpx">
                    <wd-img
                      width="100%"
                      height="100%"
                      radius="0"
                      :src="item.icon"
                    />
                  </view>

                  <view
                    class="info mx-auto box-border pl-10rpx pr-10rpx"
                  :class="['info-bg-level-' + item.productRating]"
                  >
                    <!-- 盲盒名称 -->
                    <view class="pt-6rpx font-size-19rpx fw-bold color-#ffffff overflow-hidden text-ellipsis whitespace-nowrap">
                      {{ item.name }}
                    </view>

                    <!-- 盲盒价格 -->
                    <view class="mt-5rpx font-size-22rpx fw-bold color-#f3fe44">
                      {{ '￥' + item.premium }}
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </template>

          <!-- 大于 9个盲盒 -->
          <template v-if="productList.length > 9">
            <view class="winner-box-ten" :style="{'height': contentHeight}">
              <view class="winner-box-wrap" v-for="item in productList" :key="item.id">
                <view class="blind-box-intro" :class="['blind-box-intro-level-' + item.productRating]">

                  <view class="title" :class="['title-level-' + item.productRating]">
                    <text class="hidden">{{ item.productGrade }}</text>
                  </view>

                  <!-- 盲盒图片展示  -->
                  <view class="mt-20rpx mx-auto mb-12rpx w-110rpx h-110rpx">
                    <wd-img
                      width="100%"
                      height="100%"
                      radius="0"
                      :src="item.icon"
                    />
                  </view>

                  <view
                    class="info mx-auto box-border pl-10rpx pr-10rpx"
                  :class="['info-bg-level-' + item.productRating]"
                  >
                    <!-- 盲盒名称 -->
                    <view class="pt-6rpx font-size-19rpx fw-bold color-#ffffff overflow-hidden text-ellipsis whitespace-nowrap">
                      {{ item.name }}
                    </view>

                    <!-- 盲盒价格 -->
                    <view class="mt-5rpx font-size-22rpx fw-bold color-#f3fe44">
                      {{ '￥' + item.premium }}
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </template>

        </view>
      </scroll-view>

      <view id="footer" class="footer">
        <!-- 商品小计以及结算按钮 -->
        <footer-tool-bar v-if="type === 'default'">
          <winner-bar
            v-if="type === 'default'"
            :totalPoints=pointsSum
            :fixed="true"
            @handleToHomePage="goToHomePage"
            @handleToDeliveryPage="goToDeliveryPage"
            @handleToConsignmentPage="goToConsignmentPage"
            @handleToBlindBoxPage="goToBlindBoxPage"
          />
        </footer-tool-bar>

        <!-- 试玩底部 -->
        <footer-tool-bar v-if="type === 'try'">
          <view class="" @click="goToBlindBoxPage">
            <view class="sum font-size-42rpx fw-bold color-#fff"> 总价值：{{ pointsSum }}积分 </view>
            <view class="winner-try-btn">
              <text class="font-size-44rpx font-italic">来把真的试试手气</text>
            </view>
            <view class="pt-20rpx pb-30rpx text-center try-tips font-size-24rpx fw-bold color-#ffffff">试玩结果仅供参考</view>
          </view>
        </footer-tool-bar>
      </view>
  </view>
  

</template>

<style lang="scss" scoped>
.winner {
  display: flex;
  flex-direction: column;
  // 计算页面视口最大高度
  height: calc(100vh - var(--window-top) - var(--window-bottom));
  position: relative;
  box-sizing: border-box;
  padding-top: 150rpx;
  background: #11181C;
  // background: url(https://img.niantu.cn/spark-mall/static/winner_bg.jpg) no-repeat 0 0;
  // background-size: 750rpx 100%;
}
.winner-title {
  margin: 0rpx auto 0;
  width: 570rpx;
  height: 150rpx;
  background: url(https://www.niantu.cn/img/spark-mall/static/winner/winner-title.png) no-repeat 0 0;
  background-size: 100% 100%;
}
.scroll-view {
  flex: 1;
}
.footer{
  height: 360rpx;
}

.video-wrap{
  width: 100vw;
  height: 100vh;
  // background: #f00;
  video{
    width: 100%;
    height: 100%;
  }
}

.sum{
  margin-bottom: 32rpx;
  text-align: center;
}
.winner-try-btn{
  margin: 20rpx auto 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 640rpx;
  height: 118rpx;
  font-family: 'myFz';
  color: #fff;
  font-weight: bold;
  background: url(https://www.niantu.cn/img/spark-mall/static/winner/winner-try-btn.png) no-repeat 0 0;
  background-size: 100% 100%;
}

.winner-item-level{
  display: flex;
  justify-content: center;
  .winner-item-level-star{
    background-image: url(https://img.niantu.cn/spark-mall/static/box/winner-item-level-star.png);
    background-size: 100% 100%;
  }
}
.winner-box-one {
  margin: 0 auto;
  box-sizing: border-box;
  padding-top: 186rpx;
  width: 686rpx;
  height: 966rpx;
  // background: url(https://www.niantu.cn/img/spark-mall/static/winner/one-level-wrap-1.png) no-repeat;
  // background-size: 100% 100%;
  .blind-box-intro {
      position: relative;
      width: 470rpx;
      height: 590rpx;
      margin: 0rpx auto 0;
      padding: 0rpx 0 0 0;
      box-sizing: border-box;
      text-align: center;
      color: #fff;
      background-repeat: no-repeat;
      background-position: 0 0;
      background-size: 100% 100%;
      &-level-5{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-5.png);
      }
      &-level-4{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-4.png);
      }
      &-level-3{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-3.png);
      }
      &-level-2{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-2.png);
      }

      .title {
          margin:0 auto;
          width: 180rpx;
          height: 46rpx;
          background-repeat: no-repeat;
          background-position: 0 0;
          background-size: 100% 100%;
          &-level-5{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-5.png);
          }
          &-level-4{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-4.png);
          }
          &-level-3{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-3.png);
          }
          &-level-2{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-2.png);
          }
      }
      
      .blind-box-pic {
      }
      
      .info{
        width: 404rpx;
        height: 148rpx;
        background-repeat: no-repeat;
        background-position: 0 0;
        background-size: 100% 100%;
        &-bg-level-5{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-5.png);
        }
        &-bg-level-4{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-4.png);
        }
        &-bg-level-3{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-3.png);
        }
        &-bg-level-2{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-2.png);
        }
      }
      .blind-box-name{
        text-align: center;
      }
  }
}

.winner-box-four {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 640rpx;
  height: 1012rpx;
  // background: #000;
  flex-wrap: wrap;
  .winner-box-wrap {
    margin: 0 auto;
    box-sizing: border-box;
    width: 310rpx;
    height: 390rpx;
    // background: url(https://www.niantu.cn/img/spark-mall/static/winner/one-level-wrap-1.png) no-repeat;
    // background-size: 100% 100%;
    .blind-box-intro {
      position: relative;
      width: 310rpx;
      height: 390rpx;
      margin: 0rpx auto 0;
      padding: 0rpx 0 0 0;
      box-sizing: border-box;
      text-align: center;
      color: #fff;
      background-repeat: no-repeat;
      background-position: 0 0;
      background-size: 100% 100%;
      &-level-5{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-5.png);
      }
      &-level-4{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-4.png);
      }
      &-level-3{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-3.png);
      }
      &-level-2{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-2.png);
      }

      .title {
          margin:0 auto;
          width: 180rpx;
          height: 46rpx;
          background-repeat: no-repeat;
          background-position: 0 0;
          background-size: 100% 100%;
          &-level-5{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-5.png);
          }
          &-level-4{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-4.png);
          }
          &-level-3{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-3.png);
          }
          &-level-2{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-2.png);
          }
      }

      .blind-box-pic {
      }
      
      .info{
        width: 264rpx;
        height: 96rpx;
        background-repeat: no-repeat;
        background-position: 0 0;
        background-size: 100% 100%;
        &-bg-level-5{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-5.png);
        }
        &-bg-level-4{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-4.png);
        }
        &-bg-level-3{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-3.png);
        }
        &-bg-level-2{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-2.png);
        }
      }
      .blind-box-name{
        text-align: center;
      }
    }
  }
}


/**------------- 大于4 小于等于9个 ---------------------*/

.winner-box-nine {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 1012rpx;
  width: 660rpx;
  // background: #000;
  flex-wrap: wrap;
  .winner-box-wrap {
    margin: 0 auto;
    box-sizing: border-box;
    // padding-top: 93rpx;
    width: 208rpx;
    height: 260rpx;
    // background: url(https://www.niantu.cn/img/spark-mall/static/winner/one-level-wrap-1.png) no-repeat;
    // background-size: 100% 100%;
    .blind-box-intro {
      position: relative;
      width: 208rpx;
      height: 260rpx;
      margin: 0rpx auto 0;
      padding: 0rpx 0 0 0;
      box-sizing: border-box;
      text-align: center;
      color: #fff;
      background-repeat: no-repeat;
      background-position: 0 0;
      background-size: 100% 100%;
      &-level-5{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-5.png);
      }
      &-level-4{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-4.png);
      }
      &-level-3{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-3.png);
      }
      &-level-2{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-2.png);
      }

      .title {
          margin:0 auto;
          width: 122rpx;
          height: 32rpx;
          background-repeat: no-repeat;
          background-position: 0 0;
          background-size: 100% 100%;
          &-level-5{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-5.png);
          }
          &-level-4{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-4.png);
          }
          &-level-3{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-3.png);
          }
          &-level-2{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-2.png);
          }
      }
      .blind-box-pic {
      }
      
      .info{
        width: 178rpx;
        height: 64rpx;
        background-repeat: no-repeat;
        background-position: 0 0;
        background-size: 100% 100%;
        &-bg-level-5{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-5.png);
        }
        &-bg-level-4{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-4.png);
        }
        &-bg-level-3{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-3.png);
        }
        &-bg-level-2{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-2.png);
        }
      }
      .blind-box-name{
        text-align: center;
      }
    }
  }
}

/**------------- 大于等于10个 ---------------------*/

.winner-box-ten {
  display: grid;
  justify-content: space-between;
  grid-template-columns: repeat(auto-fill, 208rpx);
  grid-gap: 18rpx; // grid-gap属性是grid-column-gap和grid-row-gap的合并简写形式 如果grid-gap省略了第二个值，浏览器认为第二个值等于第一个值。
  width: 660rpx; // 208 * 3 + 36
  // height: 1012rpx;
  // background: #000;
  flex-wrap: wrap;
  .winner-box-wrap {
    margin: 0 auto;
    box-sizing: border-box;
    // padding-top: 93rpx;
    width: 208rpx;
    height: 260rpx;
    // background: url(https://www.niantu.cn/img/spark-mall/static/winner/one-level-wrap-1.png) no-repeat;
    // background-size: 100% 100%;
    .blind-box-intro {
      position: relative;
      width: 208rpx;
      height: 260rpx;
      margin: 0rpx auto 0;
      padding: 0rpx 0 0 0;
      box-sizing: border-box;
      text-align: center;
      color: #fff;
      background-repeat: no-repeat;
      background-position: 0 0;
      background-size: 100% 100%;
      &-level-5{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-5.png);
      }
      &-level-4{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-4.png);
      }
      &-level-3{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-3.png);
      }
      &-level-2{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/box-intro-bg-level-2.png);
      }

      .title {
          margin:0 auto;
          width: 122rpx;
          height: 32rpx;
          background-repeat: no-repeat;
          background-position: 0 0;
          background-size: 100% 100%;
          &-level-5{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-5.png);
          }
          &-level-4{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-4.png);
          }
          &-level-3{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-3.png);
          }
          &-level-2{
            background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/title-level-2.png);
          }
      }
      .blind-box-pic {
      }
      
      .info{
        width: 178rpx;
        height: 64rpx;
        background-repeat: no-repeat;
        background-position: 0 0;
        background-size: 100% 100%;
        &-bg-level-5{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-5.png);
        }
        &-bg-level-4{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-4.png);
        }
        &-bg-level-3{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-3.png);
        }
        &-bg-level-2{
          background-image: url(https://www.niantu.cn/img/spark-mall/static/winner/info-bg-level-2.png);
        }
      }
      .blind-box-name{
        text-align: center;
      }
    }
  }
}


.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.block {
  width: 300px;
  height: 200px;
  background: linear-gradient(90deg, #3dcc9e, #7dc487, #a0bb7e, #b6b381);
  .title {
    padding: 10px 20px 5px;
    color: #fff;
  }
  .btn-list {
    padding: 10px 20px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .btn-item {
    box-sizing: border-box;
    margin: 10px 0;
    width: 45%;
    background: #4d80f0;
    border-radius: 5px;
    text-align: center;
    .label {
      font-weight: bold;
      font-size: 16px;
      color: #fff;
    }
    .price {
    }
  }
}


.animation-level-5 {
    // position: absolute;
    // top: 0;
    // left: 0;
    // width: 686rpx;
    // height: 966rpx;
    // background-color: #fff;
    background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/0.png");
    background-size: 686rpx 966rpx;
    background-repeat: no-repeat;
    animation-name: animation-bg5;
    animation-duration: 1.08s;
    animation-delay: 0s;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
    animation-timing-function: steps(1);
}
.animation-level-4 {
    // position: absolute;
    // top: 0;
    // left: 0;
    // width: 686rpx;
    // height: 966rpx;
    // background-color: #fff;
    background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/0.png");
    background-size: 686rpx 966rpx;
    background-repeat: no-repeat;
    animation-name: animation-bg4;
    animation-duration: 1.08s;
    animation-delay: 0s;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
    animation-timing-function: steps(1);
}
.animation-level-3 {
    // position: absolute;
    // top: 0;
    // left: 0;
    // width: 686rpx;
    // height: 966rpx;
    // background-color: #fff;
    background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/0.png");
    background-size: 686rpx 966rpx;
    background-repeat: no-repeat;
    animation-name: animation-bg3;
    animation-duration: 1.08s;
    animation-delay: 0s;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
    animation-timing-function: steps(1);
}
.animation-level-2 {
    // position: absolute;
    // top: 0;
    // left: 0;
    // width: 686rpx;
    // height: 966rpx;
    // background-color: #fff;
    background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/0.png");
    background-size: 686rpx 966rpx;
    background-repeat: no-repeat;
    animation-name: animation-bg2;
    animation-duration: 1.08s;
    animation-delay: 0s;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
    animation-timing-function: steps(1);
}

@keyframes animation-bg5 {
    0% {
        width: 686rpx;
        height: 966rpx;
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/0.png");
        background-size: 686rpx 966rpx;
    }

    3.70% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/1.png");
    }

    7.41% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/2.png");
    }

    11.11% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/3.png");
    }

    14.81% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/4.png");
    }

    18.52% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/5.png");
    }

    22.22% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/6.png");
    }

    25.93% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/7.png");
    }

    29.63% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/8.png");
    }

    33.33% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/9.png");
    }

    37.04% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/10.png");
    }

    40.74% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/11.png");
    }

    44.44% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/12.png");
    }

    48.15% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/13.png");
    }

    51.85% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/14.png");
    }

    55.56% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/15.png");
    }

    59.26% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/16.png");
    }

    62.96% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/17.png");
    }

    66.67% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/18.png");
    }

    70.37% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/19.png");
    }

    74.07% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/20.png");
    }

    77.78% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/21.png");
    }

    81.48% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/22.png");
    }

    85.19% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/23.png");
    }

    88.89% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/24.png");
    }

    92.59% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/25.png");
    }

    96.30%,
    100% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-5/26.png");
    }
}
@keyframes animation-bg4 {
    0% {
        width: 686rpx;
        height: 966rpx;
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/0.png");
        background-size: 686rpx 966rpx;
    }

    3.70% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/1.png");
    }

    7.41% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/2.png");
    }

    11.11% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/3.png");
    }

    14.81% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/4.png");
    }

    18.52% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/5.png");
    }

    22.22% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/6.png");
    }

    25.93% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/7.png");
    }

    29.63% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/8.png");
    }

    33.33% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/9.png");
    }

    37.04% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/10.png");
    }

    40.74% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/11.png");
    }

    44.44% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/12.png");
    }

    48.15% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/13.png");
    }

    51.85% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/14.png");
    }

    55.56% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/15.png");
    }

    59.26% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/16.png");
    }

    62.96% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/17.png");
    }

    66.67% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/18.png");
    }

    70.37% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/19.png");
    }

    74.07% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/20.png");
    }

    77.78% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/21.png");
    }

    81.48% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/22.png");
    }

    85.19% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/23.png");
    }

    88.89% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/24.png");
    }

    92.59% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/25.png");
    }

    96.30%,
    100% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-4/26.png");
    }
}
@keyframes animation-bg3 {
    0% {
        width: 686rpx;
        height: 966rpx;
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/0.png");
        background-size: 686rpx 966rpx;
    }

    3.70% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/1.png");
    }

    7.41% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/2.png");
    }

    11.11% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/3.png");
    }

    14.81% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/4.png");
    }

    18.52% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/5.png");
    }

    22.22% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/6.png");
    }

    25.93% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/7.png");
    }

    29.63% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/8.png");
    }

    33.33% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/9.png");
    }

    37.04% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/10.png");
    }

    40.74% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/11.png");
    }

    44.44% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/12.png");
    }

    48.15% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/13.png");
    }

    51.85% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/14.png");
    }

    55.56% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/15.png");
    }

    59.26% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/16.png");
    }

    62.96% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/17.png");
    }

    66.67% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/18.png");
    }

    70.37% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/19.png");
    }

    74.07% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/20.png");
    }

    77.78% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/21.png");
    }

    81.48% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/22.png");
    }

    85.19% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/23.png");
    }

    88.89% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/24.png");
    }

    92.59% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/25.png");
    }

    96.30%,
    100% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-3/26.png");
    }
}
@keyframes animation-bg2 {
    0% {
        width: 686rpx;
        height: 966rpx;
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/0.png");
        background-size: 686rpx 966rpx;
    }

    3.70% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/1.png");
    }

    7.41% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/2.png");
    }

    11.11% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/3.png");
    }

    14.81% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/4.png");
    }

    18.52% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/5.png");
    }

    22.22% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/6.png");
    }

    25.93% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/7.png");
    }

    29.63% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/8.png");
    }

    33.33% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/9.png");
    }

    37.04% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/10.png");
    }

    40.74% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/11.png");
    }

    44.44% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/12.png");
    }

    48.15% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/13.png");
    }

    51.85% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/14.png");
    }

    55.56% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/15.png");
    }

    59.26% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/16.png");
    }

    62.96% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/17.png");
    }

    66.67% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/18.png");
    }

    70.37% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/19.png");
    }

    74.07% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/20.png");
    }

    77.78% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/21.png");
    }

    81.48% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/22.png");
    }

    85.19% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/23.png");
    }

    88.89% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/24.png");
    }

    92.59% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/25.png");
    }

    96.30%,
    100% {
        background-image: url("https://www.niantu.cn/img/spark-mall/static/winner/animation-bg/level-2/26.png");
    }
}
</style>

