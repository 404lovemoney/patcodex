<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationBarTitleText": "盒柜",
        "navigationStyle": "custom"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'Box',
})

import { 
  fetchUnopenedBoxList, 
  fetchProductList,
  fetchMyConsignmentList,
  getCancelConsignment,
  GetDismantleProduct
} from '@/api/boxInfo';
import { getBoxDraw } from '@/api/boxInfo';

import { formatTime } from '@/utils/util'
import { useToast, useMessage } from 'wot-design-uni'
const { alert, confirm } = useMessage()
const toast = useToast()

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

import customNavBar from "@/components/custom-nav-bar/custom-nav-bar.vue";

import openBar from "../components/open-bar/index.vue";
import receiveBar from "../components/receive-bar/index.vue";
import consignmentBar from "../components/consignment-bar/index.vue";

onLoad(async (options) => {
  console.log("onLoad options", options);
  init()
})


onMounted(async () => {
  console.log("onMounted")

})

onShow(() => {
  console.log("onShow")
  init()
})

// 初始化，请求列表
const init = async ()=> {

  if (userStore.isLoggedIn()) {
    console.log('已登录')
    // await Promise.all([  
    //   fetchProductListHandle(),
    //   fetchUnOpendBoxListHandle(),
    //   fetchMyConsignmentListHandle()
    // ])
    // 页码重置
    listPagination.page = 1
    // 滚动条重置
    uni.pageScrollTo({
      scrollTop: 0,
    })
    // 列表状态加载状态重置
    listLoadStatus.value = 0
    await fetchProductListHandle(true)
  } else {
    console.log('未登录')
  }
}

const tab = ref<number>(0)

const tabList = [
  {
    type: '1',
    label: "待领取",
  },
  {
    type: '2',
    label: "寄售中",
  },
  {
    type: '3',
    label: "待开盒",
  },
]
// 高亮的下标
const activeIndex = ref(0)
// 当前下拉刷新状态
const isTriggered = ref(false)

// 待领取列表
const productList = ref<any>([])
// 寄售中列表
const consignmentList = ref<any>([])
// 待开盒列表
const unopendBoxList = ref<any>([])

// 已选中的待领取列表
const selectedProductList = ref<any>([])
// 已选中的待开盒列表
const selectedUnopendBoxList = ref<any>([])
// 已选中的寄售中列表
const selectedConsignmentList = ref<any>([])

// 待领取底部Bar数据
const receiveGroupData = ref<any | null>(null);
receiveGroupData.value = {
  isAllSelected: false,
}

// 待开盒底部Bar数据 
const consignmentGroupData = ref<any | null>(null);
consignmentGroupData.value = {
  isAllSelected: false
}

// 待开盒底部Bar数据 
const openGroupData = ref<any | null>(null);
openGroupData.value = {
  isAllSelected: false
}

// 待领取选中项的id数组字符串
const selectedProductIdsString = computed(() => {
  return selectedProductIds.value.join(',')
})

// 待领取选中项的id组成数组
const selectedProductIds = computed(() => {
  return selectedProductList.value.map(item => item.id)
})


// 筛选出寄售中选中项的订单号
const selectedConsignmentIdsString = computed(() => {
  return selectedConsignmentIds.value.join(',')
})

// 筛选出寄售中选中项的订单号id数组
const selectedConsignmentIds = computed(() => {
  return selectedConsignmentList.value.map(item => item.id)
})

// 筛选出待开盒选中项的订单号
const selectedUnopendBoxOrderNoListString = computed(() => {
  return selectedUnopendBoxOrderNoList.value.join(',')
})

// 筛选出待开盒选中项的数组
const selectedUnopendBoxOrderNoList = computed(() => {
  return selectedUnopendBoxList.value.map(item => item.orderNo)
})

// 监听待领取列表，筛选出选中的项
watch(
  () => productList.value,
  (newValue) => {
    console.log('watch productList', selectedProductList.value.length)
    selectedProductList.value = newValue.filter((item) => {
      return item.isSelected === true
    })
    // 商品项都选中时，设置底部导航全选框状态为选中
    // 商品项没有全选时（含选中项为空）设置底部导航全选框状态为未选中
    if ((selectedProductList.value.length === productList.value.length) && productList.value.length) {
      receiveGroupData.value.isAllSelected = true
    } else {
      receiveGroupData.value.isAllSelected = false
    }
    console.log('watch productList', selectedProductList.value.length)
    console.log('watch selectedProductList', selectedProductList.value)

  },
  {
    deep: true,
    immediate: true
  }
)

// 监听寄售中列表，筛选出选中的项
watch(
  () => consignmentList.value,
  (newValue) => {
    console.log('watch', newValue)
    selectedConsignmentList.value = newValue.filter((item) => {
      return item.isSelected === true
    })
    // 商品项都选中时，设置底部导航全选框状态为选中
    // 商品项没有全选时（含选中项为空）设置底部导航全选框状态为未选中
    if ((selectedConsignmentList.value.length == consignmentList.value.length) && consignmentList.value.length) {
      consignmentGroupData.value.isAllSelected = true
    } else {
      consignmentGroupData.value.isAllSelected = false
    }
    console.log('watch selectedConsignment', selectedConsignmentList.value)
  },
  {
    deep: true,
    immediate: true
  }
)

// 监听待开盒列表，筛选出选中的项
watch(
  () => unopendBoxList.value,
  (newValue) => {
    console.log('watch', newValue)
    selectedUnopendBoxList.value = newValue.filter((item) => {
      return item.isSelected === true
    })
    // 商品项都选中时，设置底部导航全选框状态为选中
    // 商品项没有全选时（含选中项为空）设置底部导航全选框状态为未选中
    if ((selectedUnopendBoxList.value.length == unopendBoxList.value.length) && unopendBoxList.value.length) {
      openGroupData.value.isAllSelected = true
    } else {
      openGroupData.value.isAllSelected = false
    }
    console.log('watch selectedUnopendBoxList', selectedUnopendBoxList.value)
  },
  {
    deep: true,
    immediate: true
  }
)

// 切换选项卡
const changeTabHandle = async (e) => {
  console.log(e)
  activeIndex.value = e.index
  // 页码重置
  listPagination.page = 1
  // 滚动条重置
  uni.pageScrollTo({
    scrollTop: 0,
  })
  // 列表状态加载状态重置
  listLoadStatus.value = 0
  // 获取当前选项
  console.log(activeIndex.value)
  switch (activeIndex.value) {
    case 0:
      console.log("待领取");
      await fetchProductListHandle(true)
      break;
    case 1:
      await fetchMyConsignmentListHandle(true)
      console.log("寄售中");
      break;
    case 2:
      await fetchUnopendBoxListHandle(true)
      console.log("带开盒");
      break;
    default:
      console.log(`${activeIndex.value}`);
  }
}

// 列表加载中标记 0-否 1-是
const listLoadStatus = ref<number>(0)

// 加载更多 根据state 展示不同的文案
const state = ref<any>('loading')

// 分页数据
const listPagination = reactive({
  page: 1,
  pageSize: 10,
})

// 滚动触底
const onScrolltolower = async () => {
  console.log('onScrolltolower ----------')
  if (listLoadStatus.value === 0) {
    // 获取当前选项
    console.log(activeIndex.value)
    switch (activeIndex.value) {
      case 0:
        console.log("待领取");
        await fetchProductListHandle()
        break;
      case 1:
        await fetchMyConsignmentListHandle()
        console.log("寄售中");
        break;
      case 2:
        await fetchUnopendBoxListHandle()
        console.log("带开盒");
        break;
      default:
        console.log(`${activeIndex.value}`);
    }
  }
}

// 加载待领取列表
const fetchProductListHandle = async (fresh = false) => {
  try {
    // 调用API
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

    // productList.value.forEach((item => {
    //   item.isSelected = false
    // }))

    productList.value.forEach((item) => {
      if (selectedProductIds.value.includes(item.id)) {
        item.isSelected = true
      } else {
        item.isSelected = false
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

// 加载寄售中列表
const fetchMyConsignmentListHandle = async (fresh = false) => {
  try {
    // 调用API
    const res = await fetchMyConsignmentList({
      status: 0, // 寄售状态 0 发售中 1 已出售 2 全部
      page: listPagination.page,
      pageSize: listPagination.pageSize
    })
 
    if (fresh) {
      consignmentList.value = res.productList
    }
    else {
      consignmentList.value = consignmentList.value.concat(res.productList)
    }

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

    consignmentList.value.forEach((item => {
      if (selectedConsignmentIds.value.includes(item.id)) {
        item.isSelected = true
      } else {
        item.isSelected = false
      }
    }))

  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

// 加载待开盒列表
const fetchUnopendBoxListHandle = async (fresh = false) => {
  try {
    // 调用API
    const res = await fetchUnopenedBoxList({
      page: listPagination.page,
      pageSize: listPagination.pageSize
    })

    if (fresh) {
      unopendBoxList.value = res.boxList
    }
    else {
      unopendBoxList.value = unopendBoxList.value.concat(res.boxList)
    }

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

    unopendBoxList.value.forEach((item => {
      if (selectedUnopendBoxOrderNoList.value.includes(item.orderNo)) {
        item.isSelected = true
      } else {
        item.isSelected = false
      }
    }))  


  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}


/*---------------------------
        待领取列表操作
--------------------------*/

// 待领取底部Bar全选操作
function onReceiveSelectAll(event) {
  console.log('event', event)
  receiveGroupData.value.isAllSelected = !event.isAllSelected
  // 调用接口改变全选
  if (receiveGroupData.value.isAllSelected) {
    checkAllProductListHandle()
  } else {
    removeAllProductListHandle()
  }
}

// 待领取列表全选
const checkAllProductListHandle = () => {
  productList.value.forEach(item => {
      item.isSelected = true
  })
}

// 待领取列表取消全选
const removeAllProductListHandle = () => {
  productList.value.forEach(item => {
      item.isSelected = false
  })
}

// 修改待领取某项选中状态
const receiveItemSelectHandle = (id) => {
  console.log('curerent id', id)
  productList.value.forEach(item => {
    if (item.id === id) {
      item.isSelected = !item.isSelected
    }
  })
}

// 待领取项分解操作
const goToDismantlePage = () => {
  // 跳转至可分解商品列表，并传递已选中的项
  console.log('selectedProductList', selectedProductList.value)

  uni.navigateTo({
    url: '/pages/box/dismantle/index?data=' + encodeURIComponent(JSON.stringify(selectedProductList.value)),
    success: function(res) {
      // 通过 eventChannel 向被打开页面传送数据
      res.eventChannel.emit('acceptDataFromPrevPage', { data: 'data from prev page' })
    }
  })
  // GetDismantleProductHandle()
}

// 分解商品Handle
const GetDismantleProductHandle = async () => {
  try {
    // 调用API
    const response = await GetDismantleProduct({
      id: selectedProductIdsString.value
    })
    console.log('fetchProductList response', response)
    uni.showToast({
      title: '分解成功',
      icon: 'success',
      duration: 2000
    })
    console.log('new selected', productList.value);

  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

// 待领取项提货操作
const goToDeliveryPage = () => {
  // 跳转至可提货商品列表，并传递已选中的项
  console.log('selectedProductList', selectedProductList.value)
  if (selectedProductList.value.length > 1) {
    uni.navigateTo({
      url: '/pages/box/delivery/index?data=' + encodeURIComponent(JSON.stringify(selectedProductList.value)),
      success: function(res) {
    }
  })
  } else {
    toast.show({
      msg: '请选择商品',
      position: 'middle',
    })
  }
}

// 待领取项寄售操作
const goToConsignmentPage = () => {
  // 跳转发布寄售 -> 快速回收
  console.log('selectedProductList', selectedProductList.value)
  if (selectedProductList.value.length > 1) {
    uni.navigateTo({
      url: '/pages-consignment/create/index?type=fast&data=' + encodeURIComponent(JSON.stringify(selectedProductList.value)),
      success: function(res) {
      }
    })
  } else {
    toast.show({
      msg: '请选择商品',
      position: 'middle',
    })
  }
}


/*---------------------------
        寄售中列表操作
--------------------------*/

// 寄售中底部Bar全选操作
function onConsignmentSelectAll(event) {
  console.log('onConsignmentSelectAll event', event)
  consignmentGroupData.value.isAllSelected = !event.isAllSelected
  // 调用接口改变全选
  if (consignmentGroupData.value.isAllSelected) {
    checkAllConsignmentListHandle()
  } else {
    removeAllConsignmentListHandle()
  }
}

// 寄售中列表全选
const checkAllConsignmentListHandle = () => {
  consignmentList.value.forEach(item => {
      item.isSelected = true
  })
}

// 寄售中列表取消全选
const removeAllConsignmentListHandle = () => {
  consignmentList.value.forEach(item => {
      item.isSelected = false
  })
}

// 修改寄售中某项选中状态
const consignmentItemSelectHandle = (id) => {
  console.log('curerent id', id)
  consignmentList.value.forEach(item => {
    if (item.id === id) {
      item.isSelected = !item.isSelected
    }
  })
}

// 取消寄售handle
const cancelConsignmentHandle = () => {
  console.log('cancelConsignmentHandle', selectedConsignmentIdsString.value);
  if (selectedConsignmentIdsString.value) {
    cancelConfirm()
  } else {
    toast.show({
      msg: '请选择商品',
      position: 'middle',
    })
  }
}

// 取消寄售确认框
const cancelConfirm = () => {
  confirm({
    msg: `是否取消所选物品的寄售`,
    title: '提示',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  })
  .then(() => {
    console.log('点击了确定按钮')
    getCancelConsignmentHandle()
  })
  .catch(() => {
    console.log('点击了取消按钮')
  })
}


// 取消寄售 
const getCancelConsignmentHandle = async () => {
  console.log('cancelConsignmentHandle', selectedConsignmentIdsString.value);

  // todo 调用取消寄售接口API
  const response = await getCancelConsignment({
    idList: selectedConsignmentIdsString.value
  })
  // 从列表中删除已分解的项
  consignmentList.value = consignmentList.value.filter(item => !selectedConsignmentIds.value.includes(item.id))
  toast.show({
    iconSize: 24,
    iconClass: 'check1',
    msg: '已取消寄售',
    position: 'middle',
  })
}


/*---------------------------
        待开盒列表操作
--------------------------*/

// 待开盒底部Bar全选操作
function onOpenSelectAll(event) {
  console.log('onOpenSelectAll event', event)
  openGroupData.value.isAllSelected = !event.isAllSelected
  // 调用接口改变全选
  if (openGroupData.value.isAllSelected) {
    checkAllUnopendBoxListHandle()
  } else {
    removeAllUnopendBoxListHandle()
  }
}

// 待开盒列表全选
const checkAllUnopendBoxListHandle = () => {
  unopendBoxList.value.forEach(item => {
      item.isSelected = true
  })
}

// 待开盒列表取消全选
const removeAllUnopendBoxListHandle = () => {
  unopendBoxList.value.forEach(item => {
      item.isSelected = false
  })
}

// 修改待开盒某项选中状态
const openItemSelectHandle = (id) => {
  console.log('curerent id', id)
  unopendBoxList.value.forEach(item => {
    if (item.id === id) {
      item.isSelected = !item.isSelected
    }
  })
}

// 待开盒项开盒操作
const handleToBoxDraw = async () => {
  console.log('handleToBoxDraw', selectedUnopendBoxOrderNoListString.value);
  if (selectedUnopendBoxOrderNoListString.value) {
    // 前往中奖结果页开奖
    uni.navigateTo({
      url: '/pages/blindbox/winner/index?orderNo=' + selectedUnopendBoxOrderNoListString.value,
    })
    
    // await getBoxDrawHandle()

  } else {
    uni.showToast({
      title: '盲盒ID不存在',
      icon: 'error'
    })
    // uni.navigateBack()
  }
}

// 盲盒开奖
const getBoxDrawHandle = async () => {
  try {
    // 调用API
    const response = await getBoxDraw({
      orderNo: selectedUnopendBoxOrderNoListString.value
    })

    // boxInfo.value = response.boxInfo
    // productList.value = response.productList

    
    productList.value = response.productList

    console.log('productList', productList.value)

    let pointsSum = productList.value.reduce((prev, curr) => prev + parseInt(curr.exchangePrice), 0)
    console.log('pointsSum', pointsSum);

    uni.showToast({
      title: '开盒成功',
      icon: 'success'
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

// 跳转到首页商城页面
const goToMallPage = () => {
  console.log('go home')
  // switchTab 必须写完整路径
  uni.switchTab({
    url: '/pages/home/home',
    success(res) {
    }
  })
}

// 去登录
const toLoginHandle = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  })
}

</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题蓝 -->
    <custom-nav-bar
      title="盒柜"
      titlePosition="left"
      :show-icon="false"
      color="#fff"
    >
    </custom-nav-bar>

    <template v-if="userStore.isLoggedIn()">
      <wd-tabs 
        v-model="tab"
        @click="changeTabHandle"
        auto-line-width
        color="#EF8105"
        inactiveColor="#929292"
      >
        <wd-tab v-for="(tab, index) in tabList" :key="index" :title="tab.label">
          <!-- <view class="content">
          </view> -->
        </wd-tab>
      </wd-tabs>
      <!-- {{ selectedProductIds}} -->
      <!-- 推荐列表 -->
      <scroll-view
        enable-back-to-top
        v-for="(item, index) in tabList"
        :key="item.type"
        v-show="activeIndex === index"
        scroll-y
        class="scroll-view"
        @scrolltolower="onScrolltolower"
      >
          <!-- 待领取列表 -->
          <template v-if="index == 0">
            <view class="box-item flex items-center" v-for="item in productList" :key="item.id">
                <view class="mr-2">
                  <wd-icon
                    size="32rpx"
                    :color="item.isSelected ? '#ff0000' : '#c4c4c4'"
                    :name="item.isSelected ? 'check-circle-filled' : 'circle'"
                    class="cart-store__check"
                    @click="receiveItemSelectHandle(item.id)"
                  />
                </view>
                <view class="thumbnail">
                  <wd-img
                    width="90%"
                    height="90%"
                    :src="item.icon"
                  />
                </view>
                <view class="box-main">
                  <view class="title pb-5">{{ item.name }}</view>
                  <wd-text :text="'积分: ' + item.exchangePrice || 0" size="24rpx" color="#F95133" bold></wd-text>
                </view>
            </view>
            
            <footer-tool-bar>
              <!-- 分解、提货按钮 -->
              <receive-bar
                :is-all-selected="receiveGroupData.isAllSelected"
                :total-amount="receiveGroupData.totalAmount"
                :total-goods-num="receiveGroupData.selectedGoodsCount"
                :total-discount-amount="receiveGroupData.totalDiscountAmount"
                @handleToDismantlePage="goToDismantlePage"
                @handleToDeliveryPage="goToDeliveryPage"
                @handleToMallPage="goToMallPage"
                @handleSelectAll="onReceiveSelectAll"
                @handleToConsignmentPage="goToConsignmentPage"
              />
            </footer-tool-bar>
          </template>

          <!-- 寄售中列表 -->
          <template v-if="index == 1">
            <view class="box-item flex items-center" v-for="item in consignmentList" :key="item.id">
                <view class="mr-2">
                  <wd-icon
                    size="32rpx"
                    :color="item.isSelected ? '#ff0000' : '#c5c5c5'"
                    :name="item.isSelected ? 'check-circle-filled' : 'circle'"
                    class="cart-store__check"
                    @click="consignmentItemSelectHandle(item.id)"
                  />
                </view>
                <view class="thumbnail">
                  <wd-img
                    width="90%"
                    height="90%"
                    :src="item.storePageIcon"
                  />
                </view>
                <view class="box-main">
                  <view class="title pb-2 font-size-24rpx">{{ item.productName }}</view>
                  <wd-text :text="'寄售价格 ' + item.consignPrice || 0" size="28rpx" color="#FF0000" bold></wd-text>
                  <view class="font-size-18rpx color-#8d8d8d">寄售时间：{{ formatTime(item.created_at, 'YYYY-MM-DD HH:mm:ss') }}</view>
                </view>
            </view>

            <footer-tool-bar :safe-area-inset-bottom="false">
              <!-- 取消寄售 -->
              <consignment-bar
                :is-all-selected="consignmentGroupData.isAllSelected"
                @handleToCancelConsignment="cancelConsignmentHandle"
                @handleSelectAll="onConsignmentSelectAll"
              />
            </footer-tool-bar>
          </template>

          <!-- 待开盒列表 -->
          <template v-if="index == 2">
            <view class="box-item flex items-center" v-for="item in unopendBoxList" :key="item.id">
                <view class="mr-2">
                  <wd-icon
                    size="32rpx"
                    :color="item.isSelected ? '#ff0000' : '#c5c5c5'"
                    :name="item.isSelected ? 'check-circle-filled' : 'circle'"
                    class="cart-store__check"
                    @click="openItemSelectHandle(item.id)"
                  />
                </view>
                <view class="unopend-thumbnail">
                  <wd-img
                    width="90%"
                    height="90%"
                    :src="item.icon"
                  />
                </view>
                <view class="box-main">
                  <view class="title pb-5 font-size-32rpx">{{ item.name }}</view>
                  <wd-text text="待开" size="28rpx" color="#ff0000" bold></wd-text>
                </view>
            </view>

            <footer-tool-bar :safe-area-inset-bottom="false">
              <!-- 开盒按钮 -->
              <open-bar
                :is-all-selected="openGroupData.isAllSelected"
                :fixed="true"
                :bottomHeight="0"
                @handleToBoxDraw="handleToBoxDraw"
                @handleSelectAll="onOpenSelectAll"
              />
            </footer-tool-bar>
          </template>
      </scroll-view>
    </template>
    <template v-else>
      <view class="pt-30 no-login-info">
        <view class="no-login-default"></view>
        <view class="tips text-align-center mb-10">登录后才可以查看信息哦</view>
        <view class="text-align-center">
          <wd-button @click="toLoginHandle">去登录</wd-button>
        </view>
      </view>
    </template>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  background-color: #f8f8f8;
}
.wrapper {
  display: flex;
  flex-direction: column;
  // 计算页面视口最大高度
  height: calc(100vh - var(--window-top) - var(--window-bottom));
  position: relative;
  // background: #f00;
}
.scroll-view {
  flex: 1;
}
:deep(.wd-tabs) {
  background-color: #f8f8f8;
}
:deep(.wd-tabs__nav-item) {
  background-color: #f8f8f8;
}
:deep(.wd-tabs__line) {
  background-color: #EF8105;
}
.no-login-default{
  margin: 0 auto;
  width: 396px;
  height: 246px;
  background: url(https://img.niantu.cn/spark-mall/static/no-login.png) no-repeat center center;
  background-size: 100% 100%;
}
.content{
  background: #F5F5F5;
}
.box-item {
  box-sizing: border-box;
  margin: 10rpx 10rpx;
  padding: 10rpx;
  width: 730rpx;
  height: 180rpx;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  background: #fff;
  border-radius: 10rpx;
}
.thumbnail{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150rpx;
  height: 150rpx;
  border-radius: 20rpx;
  background: #f8f8f8;
}
.unopend-thumbnail{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150rpx;
  height: 150rpx;
}
.box-main {
  flex: 1;
  margin-left: 10px;
  .title {
    margin-bottom: 10px;
  }
  .price{
    color: #f00;
    font-weight: bold;
    font-size: 24rpx;
  }
}
.total {
  .txt {
    text-align: right;
  }
}
</style>
