<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "选择物品"
      }
    }
 </route>

<script setup lang="ts">
defineOptions({
  name: 'CommonConsignMent',
})

import { useToast, useMessage } from 'wot-design-uni'


import {
  fetchProductList,
} from '@/api/boxInfo';

import { useUserStore } from '@/store'

// pinia
const userStore = useUserStore()

const { alert, confirm } = useMessage()
const {
  show: showToast,
  loading: showLoading,
  close: hideLoading,
} = useToast()

import consignmentBar from "../components/consignment-bar/index.vue";

onLoad(async (options) => {
  console.log("onLoad");
  // 获取升级物品列表（盒柜待领取列表）
  existsProductList.value = JSON.parse(options.products)
  console.log('options.productIds', existsProductList.value)
  sellType.value = Number(options.type)
  // existsProductIds.value = options.productIds.split(',').map(Number)
  await loadList(true)
})

onMounted(async () => {
  console.log("onMounted");
})

onShow(() => {
  console.log("onShow");
})

// 寄售类型
const sellType = ref<number>(0)


// 数据列表
const productList = ref<any[]>([])
// 已选中的列表
const selectedProductList = ref<any[]>([])


// 传入的已选中项列表
const existsProductList = ref<any[]>([])

// 筛选出待领取选中项的主键ID
const existsProductIds = computed(() => {
  return existsProductList.value.map(item => item.id)
})



// 底部是否全选
const isAllSelected = ref<boolean>(false)

// 列表加载中标记 0-否 1-是
const listLoadStatus = ref<number>(0)

// 加载更多 根据state 展示不同的文案
const state = ref<any>('loading')

// 分页数据
const listPagination = reactive({
  page: 1,
  pageSize: 10,
})

function onReTry() {
  loadList()
}

// 滚动到底部加载更多
onReachBottom(() => {
  console.log('onReachBottom')
  if (listLoadStatus.value === 0) {
    loadList()
  }
})

/** */
async function loadList(fresh = false) {
  if (fresh) {
    uni.pageScrollTo({
      scrollTop: 0,
    })
  }

  listLoadStatus.value = 1

  if (fresh) {
    listPagination.page = 1
  }

  try {
    const res = await fetchProductList({
      page: listPagination.page,
      pageSize: listPagination.pageSize
    })
    if (fresh) {
      productList.value = res.productList
    }
    else {
      productList.value = productList.value.concat(res.productList)
    }
    console.log('existsProductIds', existsProductIds.value)
    // existsProductIds.value = [1537, 1536, 1535]
    productList.value.forEach((item) => {
      if (existsProductIds.value.includes(item.id)|| selectedProductIds.value.includes(item.id)) {
        let data = existsProductList.value.find((xitem) => xitem.id == item.id)
        if (data) {
          item.isSelected = data.isSelected
          item.isCustomPrice = data.isCustomPrice
          item.commonConsignPrice = data.commonConsignPrice
        }
      } else {
        item.isSelected = false
        item.isCustomPrice = false
      }
    })

    listLoadStatus.value = 0
    listPagination.page = res.pagination.currentPage
    listPagination.pageSize = res.pagination.pageSize

    // 总页数
    const totalPages = res.pagination.lastPage
    console.log('totalPages', totalPages)
    
    // 最后一页处理 
    if (listPagination.page === totalPages) {
      listLoadStatus.value = 1
      state.value = "finished"
    } else {
      listLoadStatus.value = 0
      listPagination.page++
    }
  }
  catch (err) {
    listLoadStatus.value = 3
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

// 计算选中项的数量
const selectedGoodsCount = computed(() => {
  return selectedProductList.value.length
})

// 计算选中项的寄售价格（区分普通和急速）
const totalAmount = computed(() => {
  return selectedProductList.value.reduce((prev, cur, index, arr) => {
    // console.log(prev, cur, index);
    return sellType.value === 0 ? prev + parseInt(cur.commonConsignPrice) : prev + parseInt(cur.fastConsignPrice)
  }, 0)
})

// 监听列表，筛选出选中的项，组成新数组等
watch(
  () => productList.value,
  (newValue) => {
    console.log('watch', newValue)
    selectedProductList.value = newValue.filter((item) => {
      return item.isSelected === true
    })
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
      isAllSelected.value = true
    } else {
      isAllSelected.value = false
    }
  },
  {
    deep: true,
    immediate: true
  }
)

// 底部Bar全选操作
function onSelectAll(event) {
  console.log('event', event)
  isAllSelected.value = !event.isAllSelected
  // 调用接口改变全选
  if (isAllSelected.value) {
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
const itemSelectHandle = (id) => {
  console.log('curerent id', id)
  productList.value.forEach(item => {
    if (item.id === id) {
      item.isSelected = !item.isSelected
    }
  })
}

// 修改某项自定义价格
const customPriceSwitchHandle = (id) => {
  console.log('curerent id', id)
  productList.value.forEach(item => {
    if (item.id === id) {
      item.isCustomPrice = !item.isCustomPrice
    }
  })
}

// 选中项寄售操作
const onToConsignmentHandle = () => {
  console.log('selectedProduct', selectedProductList.value)
  uni.navigateTo({
    url: `/pages-consignment/create/index?type=${sellType.value}&data=` + encodeURIComponent(JSON.stringify(selectedProductList.value)),
    success: function(res) {
    }
  })
}

// 根据价格长度计算步长
// 为个位数时，每次加减都是以1递进
// 十位数~百位数时，每次加减都是以10递进
// 千位数~万位数时，每次加减都是以100递进
const myStep = (price) => {
  // 价格长度
  let priceLength = parseInt(price).toString().length
  // console.log('myStep', price, priceLength)
  if (priceLength >= 4) {
    return 100
  } else if (priceLength >= 2 && priceLength < 4) {
    return 10
  } else {
    return 1
  }
}

</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="'选择物品'"
      page-name="commonSell"
      :show-icon="true"
      :color="'#fff'"
    >
    </custom-nav-bar>

    <!-- 可寄售商品列表 -->
    <view class="blind-box-item flex items-center" v-for="item in productList" :key="item.id">
        <view class="mr-2">
          <wd-icon
            size="40rpx"
            :color="item.isSelected ? '#FA4126' : '#BBBBBB'"
            :name="item.isSelected ? 'check-circle-filled' : 'circle'"
            class="cart-store__check"
            @click="itemSelectHandle(item.id)"
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
        <view class="blind-box-main" v-if="sellType === 0">
          <view class="title pb-5">{{ item.name }}</view>
          <view v-if="!item.isCustomPrice" class="flex items-center justify-between">
            <wd-text :text="'寄售推荐价格 ' + item.commonConsignPrice" size="24rpx" color="#F95133" bold></wd-text>
            <wd-button type="info" size="small" @click="customPriceSwitchHandle(item.id)">修改</wd-button>
          </view>
          <view v-else class="">
            <wd-input-number 
              v-model="item.commonConsignPrice"
              :step="myStep(item.commonConsignPrice)"
              input-width="238rpx"	
              custom-class="number-input"
            />
          </view>
        </view>
        <view class="blind-box-main" v-if="sellType === 1">
          <view class="title pb-5">{{ item.name }}</view>
          <wd-text :text="'急速回收价格 ' + item.fastConsignPrice || 0" size="16px" color="#F95133" bold></wd-text>
        </view>
    </view>

    <!-- state 为 error 加载错误时，点击文案触发 reload 事件 -->
    <wd-loadmore :state="state" @reload="onReTry" />

    <footer-tool-bar :safe-area-inset-bottom="true">
      <!-- consignment bar -->
      <consignment-bar
        :is-all-selected="isAllSelected"
        :total-amount="totalAmount"
        :total-goods-num="selectedGoodsCount"
        @handleToConsignment="onToConsignmentHandle"
        @handleSelectAll="onSelectAll"
      />
    </footer-tool-bar>
  </view>
</template>

<style lang="scss" scoped>
.wrapper {
  background: #f5f5f5;
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
}

.number-input{
  // border: 1px solid #f00;
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
