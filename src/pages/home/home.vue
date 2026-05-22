<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page -->
<route lang="jsonc" type="home">
    {
      "layout": "tabbar",
      "style": {
        // 'custom' 表示开启自定义导航栏，默认 'default'
        "navigationStyle": "custom",
        "navigationBarTitleText": "商城"
      }
    }
</route>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { fetchGoodsCategory } from '@/api/goods'
import { fetchHomeInfo } from '@/api/home'

import goodsCard from './components/goods-card/goods-card.vue'
import navBar from './components/nav-bar/nav-bar.vue'
import { fetchGoodsList } from '@/api/goods'
import { useUserStore } from '@/store'
import { nextTick, getCurrentInstance } from 'vue'
import { getNavBarHeight, getStatusBarHeight, getTitleBarHeight } from '@/utils/system';
import { rpx2px } from '@/utils/util'
import { debounce, random } from 'lodash-es'

// pinia
const userStore = useUserStore()

defineOptions({
  name: 'Home',
})

const {
  show: showToast,
  loading: showLoading,
  close: hideLoading,
} = useToast()

// state展示不同的文案
const state = ref<any>('loading')

const goods = ref<any[]>([])

// 是否加载中标记 0-否 1-是
const goodsListLoadStatus = ref<number>(0)

const goodsCategory = ref<any[]>([])

const swiperList = ref<any[]>([])
const autoplay = ref(true)
const duration = ref<number>(500)
const interval = ref<number>(5000)

const homeData = ref<any>({
  topList: [], // 中奖公告
  tuijianList: [], // 推荐盲盒
  hotList: [], // 热销盲盒
  productList: [] // 商品列表
})

const goodListPagination = reactive({
  index: 1,
  num: 10,
})

// #ifdef H5
const isH5 = true
// #endif

// #ifdef MP-WEIXIN
const isWXMP = true
// #endif

// 屏幕高度
const screenHeight = ref<number>(0)

// 页面滚动距离
const scrollTop = ref<number>(0)

// 商品分类距离顶部位置，单位px
const goodsCategoryTop = ref<number>(0)

// 计算商品筛选项和我的积分的高度并转为px
const goodsMenuHeight = computed(() => {
  return userStore.isLoggedIn() ? rpx2px(160) : rpx2px(120)
})

// 计算下滑到商品筛选区域展示时距离顶部的高度
const showGoodsMenuTop = computed(() => {
  return goodsCategoryTop.value - goodsMenuHeight.value - getNavBarHeight() - 40
})

// 类this
const { ctx } = getCurrentInstance()

onLoad(async () => {
  console.log("onLoad")
  // screenHeight.value = uni.getSystemInfoSync().screenHeight
  // await loadHomePage()
})

onPageScroll(debounce(function(e) {
  console.log('页面滚动', e);
  // 在这里执行你的逻辑
  scrollTop.value = e.scrollTop
  console.log('scrollTop', scrollTop.value)
}, 200)) // 200毫秒内最多执行一次

onMounted(async () => {
  console.log("onMounted")
  // await loadHomePage()
})

onShow(async() => {
  console.log("onShow");
  await loadHomePage()
 
  // 更新用户信息
  if (userStore.isLoggedIn()) {
    await userStore.getUserInfo()
  }

  const query = uni.createSelectorQuery().in(ctx)
  // DOM 更新完成后执行
  nextTick(() => {
    // DOM 更新完成后执行
    query.select("#goods-category").boundingClientRect((data: any) => {
      console.log('商品分类距离顶部', data)
      goodsCategoryTop.value = data.top
    }).exec()
    console.log('goodsCategoryTop', goodsCategoryTop.value)
    console.log('goodsMenuHeight', goodsMenuHeight.value)
    // query.select("#goods-menu").boundingClientRect((data: any) => {
    //   console.log('商品筛选项距离顶部', data)
    // }).exec()
  })
})

onReachBottom(() => {
  if (goodsListLoadStatus.value === 0) {
    loadGoodsList()
  }
})

onPullDownRefresh(() => {
  loadHomePage()
})

// 加载首页数据
const fetchHomeInfoHandle = async () => {
  try {
    // 调用API
    const response = await fetchHomeInfo()
    // console.log('homeInfo', response)

    homeData.value.productList = response.ProductList
    homeData.value.topList = response.topList
    homeData.value.tuijianList = response.tuijianList
    // homeData.value.tuijianList = response.tuijianList.splice(1, 1)
    homeData.value.hotList = response.hotList
    // homeData.value.hotList = response.hotList.splice(1, 1)

    // 生成轮播图数据格式调整
    swiperList.value = homeData.value.topList.map(item => {
      return {
        'type': 'image',
        'value': item.imgSrc,
        'clickType': item.type,
        'detailImg': item.detailImg,
        'boxId': item.boxId,
        'id': item.id
      }
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

// 加载商品分类
const fetchGoodsCategoryHandle = async () => {
  try {
    // 调用API
    const response = await fetchGoodsCategory()
    // console.log('fetchGoodsCategory', response)
    goodsCategory.value = response
  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

// 轮播图点击处理
function swiperClickHandle (item) {
  console.log('swiperClickHandle', item)
  let type = item.clickType // 类型 1盲盒 2 公告
  let id = item.id // 公告id
  let boxId = item.boxId // 盲盒id

  console.log('swiperList.value[e.index]', item.value)
  if (type == 1) {
    console.log('前往盲盒详情页面')
    goBlindBoxHandle(boxId)
  } else {
    console.log('公告类型')
    goNoticeHandle(id)
  }
}

// 轮播图点击处理
function wdSwiperClickHandle (e) {
  console.log('swiperClickHandle', e)
  let type = swiperList.value[e.index].clickType // 类型 1盲盒 2 公告
  let id = swiperList.value[e.index].id // 公告id
  let boxId = swiperList.value[e.index].boxId // 盲盒id

  console.log('swiperList.value[e.index]', swiperList.value[e.index].value)
  if (type == 1) {
    console.log('前往盲盒详情页面')
    goBlindBoxHandle(boxId)
  } else {
    console.log('公告类型')
    goNoticeHandle(id)
  }
}

// 加载首页数据
const loadHomePage =  async () => {
  // uni.showLoading({
	//   title: '加载中'
  // })
  showLoading({
    loadingType: 'ring',
    loadingColor: '#ffffff',
    position: 'middle',
    direction: 'vertical',
    msg: '加载中'
  })
  await Promise.all([
    fetchHomeInfoHandle(),
    fetchGoodsCategoryHandle(),
    loadGoodsList(true)
  ])
  hideLoading()
  // uni.hideLoading()
}

function onReTry() {
  loadGoodsList()
}

async function loadGoodsList(fresh = false) {
  if (fresh) {
    // uni.pageScrollTo({
    //   scrollTop: 0,
    // })
  }

  goodsListLoadStatus.value = 1

  if (fresh) {
    goodListPagination.index = 1
  }

  try {
    const res = await fetchGoodsList({
      page: goodListPagination.index,
      pageSize: goodListPagination.num,
      sort: sortType.value,
      order: orderType.value,
      showStore: 1
    })
    if (fresh) {
      goods.value = res.productList
    }
    else {
      goods.value = goods.value.concat(res.productList)
    }
    goodsListLoadStatus.value = 0

    goodListPagination.index = res.pagination.currentPage
    goodListPagination.num = res.pagination.pageSize

    // 总页数
    const totalPages = res.pagination.lastPage
    console.log('totalPages', totalPages)
    
    // 最后一页处理 
    if (goodListPagination.index === totalPages) {
      goodsListLoadStatus.value = 1
      state.value = "finished"
    } else {
      goodsListLoadStatus.value = 0
      goodListPagination.index++
    }
  }
  catch (err) {
    goodsListLoadStatus.value = 3
  }
}

// 前往商品详情页
function goodListClickHandle(id) {
  console.log('goodListClickHandle id', id);
  uni.navigateTo({
    url: `/pages/goods/detail/index?id=${id}`,
  })
}

// 盲盒详情页
function goBlindBoxHandle(id) {
  uni.navigateTo({
    url: `/pages/blindbox/detail/index?id=${id}`,
  })
}

// 公告详情页
function goNoticeHandle(id) {
  uni.navigateTo({
    url: `/pages/notice/detail/index?id=${id}`,
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

// 商品列表页
function categoryHandle(cateId, cateName) {
  uni.navigateTo({
    url: `/pages/goods/list/index?id=${cateId}&name=${cateName}`,
  })
}

// 是否显示商品筛选项和我的积分
const isShowGoodsMenu = ref(false)
// 是否显示我的积分
const isShowMyPoints = ref(false)

const isShowSideBarMenu = ref(true)
const toggleSideBarHandle = () => {
  isShowSideBarMenu.value = !isShowSideBarMenu.value
}

// 其值为：-1、0、1，分别代表：降序、未选中状态、升序。
const priceSort = ref(-1)
const pointsSort = ref(-1)

// asc 升序 desc 降序 默认 desc
const orderType = ref('desc') 

// 排序字段 1 价格 2积分
const sortType = ref(1)

const resetSortHandle = () => {
  priceSort.value = -1
  pointsSort.value = - 1
  orderType.value = 'desc'
  loadGoodsList(true)
}

const priceSortHandle = ({ value }) => {
  console.log(value)
  pointsSort.value = - 1
  sortType.value = 1
  orderType.value = value === -1 ? 'desc' : 'asc'
  loadGoodsList(true)
}

const pointsSortHandle = ({ value }) => {
  console.log(value)
  priceSort.value = - 1
  sortType.value = 2
  orderType.value = value === -1 ? 'desc' : 'asc'
  loadGoodsList(true)
}

// 顶部广告位 swiper
const currentIndex = ref(0)
const changeCurrent = (e) => {
  // console.log(e);
  // console.log(e.detail.current);
  // currentIndex.value = e.detail.current
}

const scrollLeft = ref(0) // 控制横向滚动位置
const categoryProgress = ref(0) // 类别滚动条百分比

// rpx2px
const convertRpxToPx = (rpxValue) => {
  return uni.rpx2px(rpxValue)
}

const calculatePercentage = (part, total) => {
  if (total === 0) return 0; // Avoid division by zero
  return (part / total) * 100;
}

// 滚动事件监听(处理商品分类百分比)
const handleScroll = (e) => {
  console.log('convertRpxToPx', convertRpxToPx(150))
  console.log('当前横向滚动位置:', e.detail.scrollLeft)
  console.log(typeof e.detail.scrollLeft)

  if (goodsCategory.value.length <= 5) {
    categoryProgress.value = 100
  } else {
    let current = e.detail.scrollLeft / convertRpxToPx(150)
    console.log('current', current)
    let percentage = calculatePercentage(current, goodsCategory.value.length - 5)
    console.log('percentage', percentage)
    categoryProgress.value = percentage
    // 设置100% 和 0%
    if (e.detail.scrollLeft >= convertRpxToPx(150) * (goodsCategory.value.length - 5)) {
      categoryProgress.value = 100
    }
    if (e.detail.scrollLeft < 10) {
      categoryProgress.value = 0
    }
  }

}

</script>

<template>
    <view class="home">
      <!-- 首页自定义顶部标题栏 -->
      <nav-bar
        title="商城"
        title-position="left"
        color="#fff"
        :is-change="scrollTop > 10 ? true : false"
        :show-icon="false"
      >
      </nav-bar>

      <view class="home-header">

        <view class="mt-5 mb-2 hidden">
          <view class="mb-2 hidden">
            <wd-text text="商城" bold size="18px" color="#000000" />
          </view>
          <wd-text color="#ffffff" text="全新正品 | 精选好物 | 急速发货" />
        </view>

        <!-- 
        <view class="container">
          <swiper 
            class="swiper" 
            :circular="false" 
            :autoplay="false"
            :duration="500"
            :previous-margin="'154rpx'" 
            :next-margin="'154rpx'"
            :style="{ width: '382rpx', height: '502rpx' }"
            :current=currentIndex
            easing-function="easeInOutCubic"
            @change="changeCurrent"
          >
            <swiper-item v-for="(item, index) in swiperList" :key="index" @click="swiperClickHandle(item)">
              <view :class="index == currentIndex? 'active-swiper-item' : 'swiper-item'">
                <wd-img
                  :src="item.value"
                  width="100%"
                  height="100%"
                  mode="scaleToFill"
                />
              </view>
            </swiper-item>
          </swiper>
        </view>
        -->

        <!---->
        <view v-if="swiperList.length" class="card-swiper">
          <wd-swiper
            autoplay
            v-model:current="current"
            width="382rpx"
            height="502rpx"
            custom-indicator-class="custom-indicator-class"
            custom-image-class="custom-image"
            custom-next-image-class="custom-image-prev"
            custom-prev-image-class="custom-image-prev"
            :indicator="false"
            :list="swiperList"
            @click="wdSwiperClickHandle"
            previousMargin="190rpx"
            nextMargin="190rpx"
          />
        </view>
        

        <!-- {{ homeData.tuijianList.length }} -->

        <view
          v-if="homeData.tuijianList.length"
          class="box-region recommend-box-region"
          :style="{
            height: homeData.tuijianList.length * 364 + 72 + 'rpx',
          }"
        >
          <view class="title">
            <text class="hidden">新人专享</text>
          </view>
          <view
            v-for="(item, index) in homeData.tuijianList"
            :key="item.id"
            @click="goBlindBoxHandle(item.id)"
            class="box-item"
            :class="['recommend-item-' + item.bgType]"
            :style="{
              backgroundImage: `url(${item.imgSrc})`,
              top: index === 0 ? (72 + 'rpx') : (72 + index * 364 + 'rpx')
            }"
          >


            <view class="name">
              <!-- <text class="iconfont icon-chat"></text> -->
              {{ item.name ? item.name : '新手专享' }}
            </view>
            <view class="desc">{{ item.desc }}</view>

            <block v-if="item.iconType && item.iconType !== 0">
              <view class="badge-icon" :class="['badge-icon-' + item.iconType]"></view>
            </block>

            <view class="mt-160rpx ml-290rpx" v-if="item.bgType === 1">
              <view class="flex items-center justify-center color-#ff0c00 w-220rpx h-82rpx box-border">
                <view style="line-height: 1;">
                  <text class="font-size-36rpx fw-bold">￥</text>
                  <text class="font-size-60rpx fw-bold">{{ item.firstPrice }}</text>
                  <text class="ml-5rpx font-size-26rpx color-#929292 line-through">{{ item.discountPrice }}</text>
                </view>
              </view>
            </view>

            <view class="mt-147rpx ml-375rpx"  v-if="item.bgType === 2">
              <view class="flex items-end color-#FB213C w-162rpx h-52rpx">
                <view style="line-height: 1;">
                  <text class="font-size-26rpx fw-bold">￥</text>
                  <text class="font-size-42rpx fw-bold">{{ item.price }}</text>
                </view>
              </view>
            </view>

            
            
            <view class="open-animation" v-if="item.bgType === 1">
            </view>

            <view class="buy-animation" v-if="item.bgType === 2">
            </view>

          </view>
        </view>

        <!-- 热销盲盒 -->
        <view
          v-if="homeData.hotList.length"
          class="box-region hot-box-region"
          :style="{
            height: homeData.hotList.length * 364 + 82 + 'rpx'
          }"
        >
          <view class="title hot-title">
            <text class="hidden">热销盲盒</text>
          </view>
          <view
            v-for="(item, index) in homeData.hotList"
            :key="item.id"
            @click="goBlindBoxHandle(item.id)"
            class="box-item"
            :class="['hot-item']"
            :style="{
              backgroundImage: `url(${item.imgSrc})`,
              top: index === 0 ? (82 + 'rpx') : (82 + index * 364 + 'rpx')
            }"
          >

            <!-- 盲盒底部动画 -->
            <view v-if="false" class="bg-animation" :style="{ animationDelay: (index + 1) * -5 + 's', animationDuration: random(3, 3.2) + 's', animationPlayState: 'running' }"></view>

            <view class="name">
              {{ item.name ? item.name : '热销盲盒' }}
            </view>
            <view class="desc">{{ item.desc }}</view>

            <block v-if="item.iconType && item.iconType !== 0">
              <view class="badge-icon" :class="['badge-icon-' + item.iconType]"></view>
            </block>

            <view class="flex mt-134rpx ml-306rpx">
              <view class="flex items-center justify-center color-#FB213C w-230rpx h-87rpx">
                  <view class="" style="line-height: 1">
                    <text class="font-size-48rpx fw-bold">￥</text>
                    <text class="font-size-84rpx fw-bold">{{ item.price }}</text>
                  </view>
              </view>
              <view class=" w-174rpx pt-38rpx text-center">
                <!-- <text class="font-size-24rpx color-#fffcb2">商品价值</text> -->
                <text class="font-size-28rpx color-#ffffff">{{ item.prizePriceLimit + '元' }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="bg-#fff" v-if="scrollTop >= showGoodsMenuTop">
      <!-- <view class="bg-#fff" v-if="true"> -->

        // #ifdef MP-WEIXIN
        <wd-sticky :offset-top="getNavBarHeight() + 30">
        // #endif
        // #ifndef MP-WEIXIN
        <wd-sticky :offset-top="isH5 ? 30 : 0">
        // #endif
          <view id="goods-menu" class="goods-menu bg-#fff p-20rpx box-border">
            <view class="my-points h-40rpx flex items-center" v-if="userStore.isLoggedIn()">
              <view class="points-icon mr-6rpx"></view>
              <view class="">
                <text>我的积分: </text>
                <text>{{ userStore.userInfo.points }}</text>
              </view>
            </view>
            <view class="h-80rpx list-filter flex items-center justify-around">
              <view class="default-sort fw-500" @click="resetSortHandle">综合</view>
              <wd-sort-button class="sort-btn" :line="false" title="价格" v-model="priceSort" @change="priceSortHandle" />
              <wd-sort-button class="sort-btn" :line="false" title="积分" v-model="pointsSort" @change="pointsSortHandle" />
            </view>
          </view>
        </wd-sticky>
      </view>

      <view class="home-main">
        <view id="goods-category" class="goods-category">
          <scroll-view 
            class='scrollContainer'
            scroll-x
            :scroll-with-animation="true"
            :scroll-left="scrollLeft"
            @scroll="handleScroll"
          >
            <view class='scrollitem' v-for="(item, index) in goodsCategory" :key="index" @click="categoryHandle(item.cateId, item.cateName)">
              <image class="scrollimage" :src="item.icon"></image>
              <view class="recommandItemText">{{item.cateName}}</view>
            </view>
            <view class="EmptyData" v-if="goodsCategory.length==0">暂无数据</view>
          </scroll-view>

          <view class="category-progress w-40rpx mx-auto mt-10rpx h-12rpx">
            <wd-progress :percentage="categoryProgress" hide-text color="#ff0c00" />
          </view>
        </view>

        <!--
        <view v-if="goodsCategory.length" class="goods-category flex">
          <view class="category flex-1 mb-5" v-for="item in goodsCategory" :key="item.cateId" @click="categoryHandle(item.cateId, item.cateName)">
            <view class="icon text-align-center">
              <wd-img :src="item.icon" :width="50" :height="50" />
            </view>
            <view class="name font-size-20rpx text-align-center">{{ item.cateName }}</view>
          </view>
        </view>
        -->

        <view class="goods-list-wrap">
          <block v-for="(item, index) in goods" :key="index">
            <goods-card
              :id="`gd-${index}`"
              :data="item"
              :currency="item.currency || '¥'"
              @goodsClick="goodListClickHandle"
              class="goods-card-inside"
            />
          </block>
        </view>

        <!-- state 为 error 加载错误时，点击文案触发 reload 事件 -->
        <wd-loadmore :state="state" @reload="onReTry" />
      </view>

      <!-- 右侧浮动边栏 -->
      <view :class="['sidebar', isShowSideBarMenu ? 'open' : '']" >
        <view class="toggle-button flex items-center justify-center" @click="toggleSideBarHandle">
          <view  :style="{ transform: isShowSideBarMenu ? 'rotate(0deg)' : 'rotate(180deg)' }">
            <wd-img
            src="https://www.niantu.cn/img/spark-mall/static/home/aside/arrow.png"
            width="25rpx"
            height="25rpx"      
          ></wd-img>
          </view>
        </view>
        <view class="menus flex flex-col justify-around items-center">
          <view class="item">
            <wd-img src="https://www.niantu.cn/img/spark-mall/static/home/aside/coupon.png" width="100%" height="100%"></wd-img>
          </view>
          <view class="item" @click="goNoticeHandle('10002')">
            <wd-img src="https://www.niantu.cn/img/spark-mall/static/home/aside/benefit.png" width="100%" height="100%"></wd-img>
          </view>
          <view class="item" @click="goToConsignmentPage">
            <wd-img src="https://www.niantu.cn/img/spark-mall/static/home/aside/consignment.png" width="100%" height="100%"></wd-img>
          </view>
        </view>
      </view>
    </view>
</template>

<style lang="scss" scoped>
.home {
  width: 100vw;
  box-sizing: border-box;


  &::after{
    position: fixed;
    z-index: -1;
    top: 0;
    left: 0;
    content: '';
    width: 750px;
    height: 1130rpx;
    background: #fff url(https://img.niantu.cn/spark-mall/static/homg_bg.png) no-repeat 0 0;
    background-size: 100% 1130rpx;
  }

  .sidebar{
    position: fixed;
    z-index: 99;
    display: flex;
    align-items: center;
    top: 400rpx;
    right: -105rpx;
    width: 138rpx;
    height: 413rpx;
    transition: left 0.3s ease;
    .menus {
      flex: 1;
      height: 368rpx;
      align-items: right;
      // background: rgba($color: #000000, $alpha: .6);
      background: url(https://www.niantu.cn/img/spark-mall/static/home/aside/sidebar.png);
      background-repeat: no-repeat;
      background-size: 100% 100%;
      padding: 20rpx 0;
      border-radius: 32rpx 0 0 32rpx;
      .item{
        width: 100rpx;
        height: 100rpx;
        margin-left: 25rpx;
      }
    }
    .toggle-button {
      height: 80rpx;
      width: 80rpx;
      position: absolute;
      left: -12%;
      top:39% ; 
      // background: url(https://www.niantu.cn/img/spark-mall/static/home/aside/arrow.png);
      // background-repeat: no-repeat;
      // background-color: rgba($color: #000000, $alpha: .6);
      // border-top-left-radius: 32rpx;
      // border-bottom-left-radius: 32rpx;
    }
  }
  .sidebar.open {
    right: 0;
  }

  .home-header {
  }

  .box-region{
    position: relative;
    margin: 0rpx auto 0;
    width: 750rpx;
    padding: 0 0rpx 0rpx 0;

    .title{
      width: 492rpx;
      height: 72rpx;
      background: url(https://www.niantu.cn/img/spark-mall/static/home/newuser-box-title.png) no-repeat;
      background-size: 100%;
      &.hot-title{
        width: 437rpx;
        background-image: url(https://www.niantu.cn/img/spark-mall/static/home/hot-box-title.png);
      }
    }
    .box-item{
      margin: 0 auto;
      width: 744rpx;
      height: 364rpx;
      position: absolute;
      left: 3rpx;
      top: 0rpx;
      background-position: 0 0;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      .name {
        position: absolute;
        left: 276rpx;
        top: 40rpx;
        font-family: 'myFz';
        font-style: italic;
        font-size: 44rpx;
        // font-weight: bold;
        color: #fff;
      }
      .desc{
        position: absolute;
        left: 284rpx;
        top: 94rpx;
        font-family: 'myFz';
        font-style: italic;
        font-size: 28rpx;
        // font-weight: bold;
        color: #FFFCB2;
      }
      .badge-icon{
        position: absolute;
        top: -50rpx;
        right: 0;
        width: 150rpx;
        height: 156rpx;
        background-repeat: no-repeat;
        background-position: 0 0;
        background-size: 100% 100%;
      }
      .badge-icon-1{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/home/badge-01.png);   
      }
      .badge-icon-2{
        top: -45rpx;
        height: 146rpx;
        background-image: url(https://www.niantu.cn/img/spark-mall/static/home/badge-02.png);   
      }
      .badge-icon-3{
        top: -45rpx;
        height: 146rpx;
        background-image: url(https://www.niantu.cn/img/spark-mall/static/home/badge-03.png);   
      }
    }
    .recommend-item-1{
      .badge-icon{
        background-image: url(https://www.niantu.cn/img/spark-mall/static/home/badge-01.png);
      }
    }
    .recommend-item-2{
      .name{
        top: 40rpx;
      }
      .desc {
        top: 100rpx;
      }
    }
  }
  .recommend-box-region{
    margin-top: 20rpx;
    padding-bottom: 20rpx;
    background: url(https://www.niantu.cn/img/spark-mall/static/home/box-bg-1.png) no-repeat 0 bottom;
    background-size: 750rpx 200rpx;
  }
  .hot-box-region{
    padding-top: 10rpx;
    .title{
      margin-bottom: 10rpx;
      // display: none;
    }
    &::after{
      position: absolute;
      top: 0;
      left: 0;
      content: '';
      width: 750px;
      height: 100rpx;
      background: url(https://www.niantu.cn/img/spark-mall/static/home/box-bg-2.png) no-repeat 0 0;
      background-size: 750rpx 100rpx;
    }
    // top: -150rpx;
    .hot-item{
      .name{
        left: 286rpx;
        top: 30rpx;
      }
      .desc {
        left: 294rpx;
        top: 94rpx;
      }
    }
  }

  .goods-category{
    padding-top: 10rpx;
    background: #fff;
  }
}

.card-swiper {
  --wot-swiper-radius: 0;
  --wot-swiper-item-padding: 0 24rpx;
  --wot-swiper-nav-dot-color: #e7e7e7;
  --wot-swiper-nav-dot-active-color: #4d80f0;
  // padding-bottom: 24rpx;
  :deep(.custom-indicator-class) {
    bottom: -16px;
  }
  :deep(.custom-image) {
    // border-radius: 12rpx;
    // border: 1px solid #f00;
    height: 200px;
  }
  :deep(.custom-image-prev) {
    // height: 168px !important;
    // border: 1px solid #000;
  }
}

.default-sort{
  font-size: 28rpx;
  color: #ef8106;
}
.sort-btn{
  color: #ef8106;
}
:deep(.wd-sort-button){
  height: 50rpx;
  line-height: 50rpx;
}
:deep(.wd-sort-button__wrapper) {
  font-size: 28rpx;
  color: #ef8106;
}

.goods-list-wrap {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  padding: 10rpx;
  background: #F5F5F5;
}
.goods-menu{
  width: 100vw;
}
.my-points{
  width: 350rpx;
  padding: 0 15rpx;
  font-size: 26rpx;
  font-weight: bold;
  color: #EF8106;
  background-color: #f3f3f3;
  border-radius: 20rpx;
}
.points-icon{
  width: 34rpx;
  height: 34rpx;
  background: url(https://www.niantu.cn/img/spark-mall/static/points-icon.png) no-repeat 0 0;
  background-size: 100% 100%;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
 
.swiper {
  width: 100%;
  overflow: visible; /* 确保部分滑块可见 */
  height: 100%;
}
 
.swiper-item {
  display: flex;
  height: 100%;
  width: 100%;
  margin: 0rpx auto;
  justify-content: center;
  align-items: center;
}
.active-swiper-item {
	display: flex;
	height: 502rpx;
	width: 382rpx;
	margin: 0 30rpx;
	justify-content: center;
	align-items: center;
}

.goods-category{
  padding-bottom: 30rpx;
}

	// 商品分类容器
	.scrollContainer {
		width: 750rpx;
		height: 120rpx;
		white-space: nowrap;
    overflow-x: auto;
	}

	// 容器项
	.scrollitem {
		display: inline-block;
		width: 150rpx;
		height: 120rpx;
    text-align: center;
    // background: #000;
	}

	.scrollimage {
		width: 82rpx;
		height: 82rpx;
	}

	.recommandItemText {
    margin-top: 10rpx;
		width: 150rpx;
		text-align: center;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
    font-size: 20rpx;
	}

	.EmptyData {
		text-align: center;
		margin-top: 50rpx;
	}

.open-animation {
    position: absolute;
    right: 6rpx;
    top: 116rpx;
    width: 268rpx;
    height: 168rpx;
    background-image: url("https://www.niantu.cn/img/spark-mall/static/home/open-sprites.png");
    background-size: 2144rpx 168rpx;
    background-repeat: no-repeat;
    animation-name: keyframes-open;
    animation-duration: 0.6s;
    animation-delay: 0s;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
    animation-timing-function: steps(1);
}

.buy-animation {
    position: absolute;
    right: 3rpx;
    top: 106rpx;
    width: 226rpx;
    height: 173rpx;
    background-image: url("https://www.niantu.cn/img/spark-mall/static/home/buy-sprites.png");
    background-size: 1808rpx 173rpx;
    background-repeat: no-repeat;
    animation-name: keyframes-buy;
    animation-duration: 0.6s;
    animation-delay: 0s;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
    animation-timing-function: steps(1);
}

.bg-animation {
    position: absolute;
    top: 0rpx;
    left: 0;
    width: 750rpx;
    height: 338rpx;
    background-image: url("https://www.niantu.cn/img/spark-mall/static/home/bg-sprites.png");
    background-size: 14250rpx 338rpx;
    background-repeat: no-repeat;
    animation-name: keyframes-bg;
    animation-duration: 1s;
    animation-delay: 0s;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
    animation-timing-function: steps(1);
}

@keyframes keyframes-bg {
    0% {
        width: 750rpx;
        height: 338rpx;
        background-image: url("https://www.niantu.cn/img/spark-mall/static/home/bg-sprites.png");
        background-size: 14250rpx 338rpx;
    }

    5.26% {
        background-position: -750rpx 0rpx;
    }

    10.53% {
        background-position: -1500rpx 0rpx;
    }

    15.79% {
        background-position: -2250rpx 0rpx;
    }

    21.05% {
        background-position: -3000rpx 0rpx;
    }

    26.32% {
        background-position: -3750rpx 0rpx;
    }

    31.58% {
        background-position: -4500rpx 0rpx;
    }

    36.84% {
        background-position: -5250rpx 0rpx;
    }

    42.11% {
        background-position: -6000rpx 0rpx;
    }

    47.37% {
        background-position: -6750rpx 0rpx;
    }

    52.63% {
        background-position: -7500rpx 0rpx;
    }

    57.89% {
        background-position: -8250rpx 0rpx;
    }

    63.16% {
        background-position: -9000rpx 0rpx;
    }

    68.42% {
        background-position: -9750rpx 0rpx;
    }

    73.68% {
        background-position: -10500rpx 0rpx;
    }

    78.95% {
        background-position: -11250rpx 0rpx;
    }

    84.21% {
        background-position: -12000rpx 0rpx;
    }

    89.47% {
        background-position: -12750rpx 0rpx;
    }

    94.74%,
    100% {
        background-position: -13500px 0px;
    }
}

@keyframes keyframes-open {
    0% {
        width: 268rpx;
        height: 168rpx;
        background-image: url("https://www.niantu.cn/img/spark-mall/static/home/open-sprites.png");
        background-size: 2144rpx 168rpx;
    }

    12.50% {
        background-position: -268rpx 0rpx;
    }

    25.00% {
        background-position: -536rpx 0rpx;
    }

    37.50% {
        background-position: -804rpx 0rpx;
    }

    50.00% {
        background-position: -1072rpx 0rpx;
    }

    62.50% {
        background-position: -1340rpx 0rpx;
    }

    75.00% {
        background-position: -1608rpx 0rpx;
    }

    87.50%,
    100% {
        background-position: -1876rpx 0rpx;
    }
}

@keyframes keyframes-buy {
    0% {
        width: 226rpx;
        height: 173rpx;
        background-image: url("https://www.niantu.cn/img/spark-mall/static/home/buy-sprites.png");
        background-size: 1808rpx 173rpx;
    }

    12.50% {
        background-position: -226rpx 0rpx;
    }

    25.00% {
        background-position: -452rpx 0rpx;
    }

    37.50% {
        background-position: -678rpx 0rpx;
    }

    50.00% {
        background-position: -904rpx 0rpx;
    }

    62.50% {
        background-position: -1130rpx 0rpx;
    }

    75.00% {
        background-position: -1356rpx 0rpx;
    }

    87.50%,
    100% {
        background-position: -1582rpx 0rpx;
    }
}

</style>
