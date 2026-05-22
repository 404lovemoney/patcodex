<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "发布寄售"
      }
    }
 </route>

<script setup lang="ts">
defineOptions({
  name: 'CreateConsignMent',
})

import { useToast, useMessage } from 'wot-design-uni'

import {
  getProductFastSell,
  getProductCommonSell,
  fetchCompanyList
} from '@/api/consignment';

import { useUserStore } from '@/store'

// pinia
const userStore = useUserStore()

const { alert, confirm } = useMessage()
const {
  show: showToast,
  loading: showLoading,
  close: hideLoading,
} = useToast()

onLoad(async (options) => {
  console.log("onLoad options", options)
  console.log('options type', options.type)
  tabIndex.value = Number(options.type) || 0
  // 获取路由参数
  if (options.data) {
    const data = JSON.parse(decodeURIComponent(options.data))
    console.log('options data', data)
    // todo 根据参数选择
    // if (options.type === 'fast') {
    //   fastProductList.value = data
    // } else {
    //   commonProductList.value = data
    // }
    productList.value = data
  }
})

onMounted(async () => {
  console.log("onMounted");
  init()
})

onShow(() => {
  console.log("onShow");
  init()
})

// 当前列表项 0-普通寄售 1-急速回收
const tabIndex = ref<Number>(1)

// 快速寄售列表
const productList = ref<any[]>([])

// 选中的列表
const selectedProductList = ref<any[]>([])

// 普通寄售列表
const commonProductList = ref<any[]>([])

// 快速寄售列表
const fastProductList = ref<any[]>([])

// 已选中的普通寄售列表
const selectedCommonProductList = ref<any[]>([])

// 已选中的快速寄售列表
const selectedFastProductList = ref<any[]>([])

// 分解确认弹层显示状态
const consignmentConfirmPopupShow = ref<boolean>(false)

// 底部Bar数据
const consignmentBarData = ref<any | null>(null)
consignmentBarData.value = {
  isAllSelected: false,
  selectedGoodsCount: 0,
  totalAmount: 0
}


// 初始化，请求列表
const init = async ()=> {
}

// 计算选中项的普通寄售价格
const totalCommonAmount = computed(() => {
  return selectedProductList.value.reduce((prev, cur, index, arr) => {
    // console.log(prev, cur, index);
    return prev + parseInt(cur.commonConsignPrice)
  }, 0)
})

// 计算选中项的快速回收价格
const totalFastAmount = computed(() => {
  return selectedProductList.value.reduce((prev, cur, index, arr) => {
    // console.log(prev, cur, index);
    return prev + parseInt(cur.fastConsignPrice)
  }, 0)
})

// 寄售物品总数
const totalTotal = computed(() => selectedProductList.value.length)

// 将选中项的主键ID转换为字符串
const selectedProductIdsString = computed(() => {
  return selectedProductIds.value.join(',')
})
// 筛选出待领取选中项的主键ID
const selectedProductIds = computed(() => {
  return selectedProductList.value.map(item => item.id)
})

// 将待领取选中项的主键ID转换为字符串
const selectedCommonProductIdsString = computed(() => {
  return selectedCommonProductIds.value.join(',')
})

// 筛选出待领取选中项的主键ID
const selectedCommonProductIds = computed(() => {
  return selectedProductList.value.map(item => item.id)
})

// 组合价格列表 盒柜主键id+价格  格式如  "1001:12,1002:13"
const selectedCommonProductPriceList = computed(() => {
  return selectedProductList.value.map(item => {
    return `${item.id}:${item.commonConsignPrice}`
  }).join(',')
})

// 将待领取选中项的主键ID转换为字符串
const selectedFastProductIdsString = computed(() => {
  return selectedProductIds.value.join(',')
})

// 筛选出待领取选中项的主键ID
const selectedFastProductIds = computed(() => {
  return selectedFastProductList.value.map(item => item.id)
})

// 监听普通寄售列表，筛选出选中的项，组成新数组等
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

// 普通寄售Handle
const getCommonConsignmentProductHandle = async () => {
  try {
    // 调用API
    const response = await getProductCommonSell({
      totalPrice: totalCommonAmount.value,
      priceList: selectedCommonProductPriceList.value
    })
    console.log('GetProductCommonSell response', response)

    // 从商品列表中删除已寄售的项
    commonProductList.value = commonProductList.value.filter(item => !selectedCommonProductIds.value.includes(item.id))

    // todo 返回寄售首页
    goToConsignmentPage()

    uni.showToast({
      title: '寄售成功',
      icon: 'success',
      duration: 2000
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

// 快速寄售Handle
const getFastConsignmentProductHandle = async () => {
  try {
    // 调用API
    const response = await getProductFastSell({
      resultIds: selectedFastProductIdsString.value,
      totalPrice: totalFastAmount.value
    })
    console.log('GetProductFastSell response', response)

    // 从商品列表中删除已寄售的项
    fastProductList.value = fastProductList.value.filter(item => !selectedFastProductIds.value.includes(item.id))

    // todo 更新用户余额
    // userStore.increasePoints(response.points)

    // todo 返回寄售首页
    goToConsignmentPage()

    uni.showToast({
      title: '寄售成功',
      icon: 'success',
      duration: 2000
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

// 修改某项选中状态
const itemSelectHandle = (id) => {
  console.log('curerent id', id)
  productList.value.forEach(item => {
    if (item.id === id) {
      item.isSelected = !item.isSelected
    }
  })
}


// 添加物品 - 跳转对应列表页选择
const addConsignmentHandle = () => {
  console.log('tabIndex', tabIndex.value)
  uni.navigateTo({
    url: `/pages-consignment/sell-list/index?type=${tabIndex.value}&products=` + JSON.stringify(selectedProductList.value),
    success: function(res) {
    }
  })
  // if (tabIndex.value === 0) {
  //   uni.navigateTo({
  //     url: '/pages/consignment/common-sell/index?productIds=' + selectedCommonProductIdsString.value,
  //     success: function(res) {
  //     }
  //   })
  // } else {
  //   uni.navigateTo({
  //     url: '/pages/consignment/fast-sell/index?productIds=' + selectedFastProductIdsString.value,
  //     success: function(res) {
  //     }
  //   })
  // }
}

// 发布 -> 快速
const fastSellHandle = () => {
  // 判断是否有选中项
  if (selectedFastProductIdsString.value === '') {
    showToast('请添加寄售物品')
    return false
  }

  // 确认发布
  confirm({
    msg: `是否以这个价格发布 ${'¥' + totalFastAmount.value}`,
    title: '提示',
    confirmButtonText: '确认发布',
    cancelButtonText: '取消'
  })
  .then(() => {
    console.log('点击了确定按钮')
    getFastConsignmentProductHandle()
  })
  .catch(() => {
    console.log('点击了取消按钮')
  })
}

// 发布 -> 普通
const commonSellHandle = () => {
  // 判断是否有选中项
  if (selectedCommonProductIdsString.value === '') {
    showToast('请添加寄售物品')
    return false
  }

  // 确认发布
  confirm({
    msg: `是否以这个价格发布 ${'¥' + totalCommonAmount.value}`,
    title: '提示',
    confirmButtonText: '确认发布',
    cancelButtonText: '取消'
  })
  .then(() => {
    console.log('点击了确定按钮')
    getCommonConsignmentProductHandle()
  })
  .catch(() => {
    console.log('点击了取消按钮')
  })
}

// 选中项寄售操作
const onToConsignmentHandle = () => {
  if ( tabIndex.value === 1) {
    fastSellHandle()
  }
  if ( tabIndex.value === 0) {
    commonSellHandle()
  }
}

// 切换列表
const switchTabHandle = (idx) => {
  tabIndex.value = idx
}

// 跳转至寄售首页
const goToConsignmentPage = () => {
  uni.navigateTo({
    url: '/pages-consignment/index/index',
    success: function(res) {
    }
  })
}

// 商家弹层
const businessPopupShow = ref(false)
// 商家列表
const companyList = ref<any[]>([])

const showBusinessHandle = () => {
  getBusinessHandle()
  businessPopupShow.value = true
}

// 快速寄售Handle
const getBusinessHandle = async () => {
  try {
    // 调用API
    const res = await fetchCompanyList()
    companyList.value = res
    console.log('companyList', res)
  } catch (error: any) {
    uni.showToast({
      title: error.message || '出错了，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
  }
}

</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="'发布寄售'"
      page-name="createSell"
      :show-icon="true"
      :color="'#fff'"
    >
    </custom-nav-bar>
    <view class="tabs flex items-center">
      <view class="label">寄售方式</view>
      <view 
        :class="[tabIndex === 0 ? 'current-item' : '']"
        @click="switchTabHandle(0)"
        class="tab-item flex items-center justify-center"
      >
        <view class="type-icon"></view>
        <text>普通寄售</text>
      </view>
      <view 
        :class="[tabIndex === 1 ? 'current-item' : '']"
        @click="switchTabHandle(1)"
        class="tab-item flex items-center justify-center"
      >
        <view class="type-icon"></view>
        <text>急速回收</text>
      </view>
    </view>

    <view class="fast-tips" v-show="tabIndex === 1">
      <text class="">**急速回收由寄售平台合作的第三方商家提供服务支持。</text>
      <text class="shop" @click="showBusinessHandle">商家列表</text>
    </view>

    <!-- 寄售 -->
    <view class="content">
      <view class="select-product flex justify-between items-center">
        <view class="add-product-btn flex justify-center items-center" @click="addConsignmentHandle">
          <wd-icon name="add" size="30rpx"></wd-icon>
          添加待寄售物品
        </view>
        <text>{{ totalTotal }}个物品</text>
      </view>

      <!-- 寄售物品列表 -->
      <scroll-view scroll-y class="h-520rpx">
        <view class="lists" v-if="productList.length">
            <view class="blind-box-item flex items-center" v-for="item in productList" :key="item.id">
                <view class="check-icon">
                  <wd-icon
                    size="40rpx"
                    :color="item.isSelected ? '#FA4126' : '#BBBBBB'"
                    :name="item.isSelected ? 'check-rectangle-filled' : 'rectangle'"
                    @click="itemSelectHandle(item.id)"
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

      <view class="total-price">
        <text class="label">寄售商品总价</text>
        <view class="price flex justify-center items-center" v-show="tabIndex === 0">{{ '￥' + totalCommonAmount }}</view>
        <view class="price flex justify-center items-center" v-show="tabIndex === 1">{{ '￥' + totalFastAmount }}</view>
      </view>

      <view class="rules">
        <view class="paragraph">**普通寄售可根据第三方商家提供的推荐价格自定调整。</view>
        <view class="paragraph">**商品的评估价格与寄售时长均由第三方商家提供数据支持。</view>
        <view class="paragraph">**寄售订单在付款后所有物品将立刻成交，请务必对商品数量与价格进行认真核对。</view>
        <view class="paragraph">**普通寄售支持修改推荐价格，最低报价为1元</view>
        <view class="paragraph">**商品寄售由xxxxxx平台提供技术支持**</view>
        <view class="paragraph">**急速回收由寄售平台合作的第三方商家提供服务支持。</view>
      </view>
    </view>

    <!-- consignment bar -->
    <footer-tool-bar :safe-area-inset-bottom="true">
      <view class="flex justify-center items-center h-100rpx">
        <view @click="onToConsignmentHandle" class="operation-btn">
          <text class="">发布寄售</text>
        </view>
      </view>
    </footer-tool-bar>

    <!-- 优惠券弹出层 -->
    <wd-popup v-model="businessPopupShow" position="bottom" :safe-area-inset-bottom="true" custom-style="border-radius:32rpx;" @close="businessPopupShow = !businessPopupShow">
      <view class="business-popup">
        <view class="business-popup-title">
          <wd-text class="flex-1 text-align-center" text="寄售服务商家" size="36rpx" color="#000"></wd-text>
          <wd-icon class="back-btn" name="arrow-down" size="22px" color="#000" @click="businessPopupShow = !businessPopupShow"></wd-icon>
        </view>
        <view class="business-popup-body">
          <view class="business-item" v-for="item in companyList" :key="item.id">
            {{ item.name }}
          </view>
        </view>
        <view class="business-popup-footer">
          <view class="confirm-btn" @click="businessPopupShow = !businessPopupShow">
            知道了
          </view>
        </view>
      </view>
    </wd-popup>

  </view>
</template>

<style lang="scss">
.wrapper {
  background: #ededed;
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
}
.tabs{
  padding: 0 0 0 72rpx;
  height:102rpx;
  border-top: 1rpx solid #ccc;
  border-bottom: 1rpx solid #ccc;
  background: #fff;
  .label{
    margin-right: 20rpx;
    font-size: 30rpx;
    width: 120rpx;
  }
  .tab-item{
    margin: 0 20rpx;
    width: 220rpx;
    height: 56rpx;
    border: 1rpx solid #000;
    border-radius: 28rpx;
    font-size: 32rpx;
  }
  .current-item{
    background: #B8F209;
  }
  .type-icon{
    margin-right: 10rpx;
    width: 46rpx;
    height: 46rpx;
    background: url(https://img.niantu.cn/spark-mall/static/consignment/type-icon.png) no-repeat 0 0;
    background-size: 100%;
  }
}
.fast-tips{
  padding: 10rpx 30rpx;
  line-height: 40rpx;
  background: #fff;
  border-bottom: 1rpx solid #ccc;
  font-size: 22rpx;
  color: #390405;
  .shop{
    margin-left: 20rpx;
    color: #42C2D3;
    text-decoration-line: underline;
  }
}
.content{
  background: #fff;

}
.select-product{
  padding: 25rpx 30rpx 0;
  color: #757575;
}
.add-product-btn{
  width: 560rpx;
  height: 62rpx;
  background: #F0A638;
  border-radius: 30rpx;
  font-size: 30rpx;
  color: #fff;
}

.lists{
  padding: 0 15rpx 15rpx;
  display: grid;
  justify-content: space-between;
  grid-template-columns: repeat(3, 1fr);
  gap: 15rpx; // grid-gap属性是grid-column-gap和grid-row-gap的合并简写形式 如果grid-gap省略了第二个值，浏览器认为第二个值等于第一个值。
  .blind-box-item{
    position: relative;
    width: 100%;
    height: 244rpx;
    .thumbnail{
      width: 100%;
      height: 222rpx;
    }
    .check-icon{
      position: absolute;
      width: 40rpx;
      height: 40rpx;
      top: 20rpx;
      left: 10rpx;
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

.total-price{
  display: flex;
  padding: 30rpx 0 30rpx 30rpx;
  .label{
    font-size: 36rpx;
    font-weight: bold;
    color: #070707;
  }
  .price{
    margin-left: 20rpx;
    width: 342rpx;
    height: 56rpx;
    border: 1px solid #000;
    background: #F0F0F0;
    border-radius: 14rpx;
    color: #ADADAD;
    font-size: 32rpx;
  }
}
.rules{
  padding: 20rpx 40rpx;
  background: #EDEDED;
  color: #7B7B7B;
  .paragraph{
    margin: 20rpx 0;
  }
}
.operation-btn{
  text-align: center;
  line-height: 60rpx;
  width: 380rpx;
  height: 60rpx;
  background: #F0A637;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  border-radius: 30rpx;
  font-weight: bold;
}

.business-popup{
  position: relative;
  height: 490rpx;
  background-color: #FFFFFF;
  .business-popup-title{
    padding: 45rpx;
    position: relative;
    height: 42rpx;
    text-align: left;
    background: #FFFFFF;
    .back-btn{
      position: absolute;
      top: 45rpx;
      right: 45rpx;
    }
  }
  .business-popup-body{
    padding: 20rpx 60rpx;

    .business-item{
      margin-bottom: 24rpx;
      color: #7D7D7D;
      font-size: 32rpx;
    }
  }
  .business-popup-footer{
    position: absolute;
    bottom: 30rpx;
    left: 0;
    right: 0;
    .confirm-btn{
      margin: 0 auto;
      border-radius: 10rpx;
      width: 620rpx;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      background: #000;
      color: #fff;
      font-size: 32rpx;
    }
  }
}

</style>
