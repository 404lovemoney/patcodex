<route lang="jsonc" type="page">
    {
      "layout": "default",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "商品列表页"
      }
    }
 </route>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useToast } from 'wot-design-uni'
// import { fetchGoodsList } from '../../../service/good/fetchGoods'
import { fetchGoodsList } from '@/api/goods';
import goodsCard from './components/goods-card/goods-card.vue'
import { getNavBarHeight, getStatusBarHeight, getTitleBarHeight } from '@/utils/system';

defineOptions({
  name: 'GoodsList',
})
const {
  show: showToast,
  loading: showLoading,
  close: hideLoading,
} = useToast()

const state = ref<any>('loading')
const goodsListId = ref<number>(0)  
const goods = ref<any[]>([])
const goodsListLoadStatus = ref<number>(0)

// #ifdef H5
const isH5 = true
// #endif

// #ifdef MP-WEIXIN
const isWXMP = true
// #endif

// 分页信息
const goodListPagination = reactive({
  pageSize: 10,
  page: 1,
})
// const pageSize = goodListPagination.num
// let pageIndex = goodListPagination.index + 1

// 类目信息
const categoryIntro = reactive({
  cateName: '', // 商品列表分类名称
})

onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options

  console.log('options', options);
  if (options.id) {
    categoryIntro.cateName = options.name
    goodsListId.value = options.id
    // 设置标题
    // uni.setNavigationBarTitle({
    //   title: categoryIntro.cateName
    // });
    init()
  } else {
    uni.showToast({
      title: '商品列表ID不存在',
      icon: 'error'
    })
  }  
  
})

onReachBottom(() => {
  if (goodsListLoadStatus.value === 0) {
    loadGoodsList()
  }
})

onPullDownRefresh(() => {
  init()
})

function init() {
  console.log('init')
  loadGoodsList(true)
}

function onReTry() {
  loadGoodsList(true)
}


// 其值为：-1、0、1，分别代表：降序、未选中状态、升序。
const priceSort = ref(-1)
const pointsSort = ref(-1)

// asc 升序 desc 降序 默认 desc
const orderType = ref('desc') 

// 排序字段 1 价格 2积分
const sortType = ref(1)

const resetSortHandle = () => {
  console.log('goodsListId', goodsListId.value);
  priceSort.value = -1
  pointsSort.value = - 1
  orderType.value = 'desc'
  loadGoodsList(true, goodsListId.value)
}

const priceSortHandle = ({ value }) => {
  console.log(value)
  pointsSort.value = - 1
  sortType.value = 1
  orderType.value = value === -1 ? 'desc' : 'asc'
  loadGoodsList(true, goodsListId.value)
}

const pointsSortHandle = ({ value }) => {
  console.log(value)
  priceSort.value = - 1
  sortType.value = 2
  orderType.value = value === -1 ? 'desc' : 'asc'
  loadGoodsList(true, goodsListId.value)
}


async function loadGoodsList(fresh = false) {
  console.log('loadGoodsList', fresh)
  if (fresh) {
    uni.pageScrollTo({
      scrollTop: 0,
    })
  }

  if (fresh) {
    goodListPagination.page = 1
  }

  try {
    const res = await fetchGoodsList({
      id: goodsListId.value,
      sort: sortType.value,
      order: orderType.value,
      page: goodListPagination.page,
      pageSize: goodListPagination.pageSize
    })

    if (fresh) {
      goods.value = res.productList
    }

    else {
      goods.value = goods.value.concat(res.productList)
    }

    goodListPagination.page = res.pagination.currentPage
    goodListPagination.pageSize = res.pagination.pageSize

    // 总页数
    // const totalPages = calculateTotalPages(res.pagination.total, goodListPagination.pageSize);
    const totalPages = res.pagination?.lastPage
    console.log('totalPages', totalPages)
    
    // 最后一页处理 
    if (goodListPagination.page === totalPages) {
      goodsListLoadStatus.value = 1
      state.value = "finished"
    } else {
      goodsListLoadStatus.value = 0
      goodListPagination.page++
    }

    console.log('goods data --------', goods.value)
  }
  catch (err) {
    goodsListLoadStatus.value = 3
  }

  console.log('goods value', goods.value)
}

// 前往商品详情页
function goodListClickHandle(id) {
  console.log('goodListClickHandle id', id);
  uni.navigateTo({
    url: `/pages/goods/detail/index?id=${id}`,
  })
}

// 计算总页数
// totalItems：总条目数 
// itemsPerPage：每页显示的条目数
function calculateTotalPages(totalItems, itemsPerPage) {
    return Math.ceil(totalItems / itemsPerPage);
}
</script>

<template>
  <page-wraper>
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="categoryIntro.cateName"
      :show-icon="true"
      page-name="goodsList"
      :color="'#fff'"
    >
    </custom-nav-bar>
    <view class="box-border w-full">
      // #ifdef MP-WEIXIN
      <wd-sticky :offset-top="getNavBarHeight()">
      // #endif
      // #ifndef MP-WEIXIN
      <wd-sticky :offset-top="isH5 ? -4 : 0">
      // #endif
        <view class="goods-menu bg-#fff p-20rpx border-rd-10rpx">
          <view class="flex items-center justify-around list-filter">
            <view class="default-sort fw-500" @click="resetSortHandle">综合</view>
            <wd-sort-button class="" :line="false" title="价格" v-model="priceSort" @change="priceSortHandle" />
            <wd-sort-button class="" :line="false" title="积分" v-model="pointsSort" @change="pointsSortHandle" />
          </view>
        </view>
      </wd-sticky>
      <template v-if="goods.length">
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
        <wd-loadmore :state="state" @reload="onReTry" />
      </template>
      <template v-else>
        <view class="p-20 text-align-center">该分类，暂时没有商品数据哦~</view>
      </template>

    </view>
  </page-wraper>
</template>

<style lang="scss" scoped>
.home {
  width: 100vw;
  box-sizing: border-box;
  background: #fff;
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
.default-sort{
  font-size: 14px;
}
:deep(.wd-sort-button){
  height: 50rpx;
  line-height: 50rpx;
  :deep(.wd-sort-button__left) {
    font-size: 28rpx;
    color: #f00;
  }
}
</style>
