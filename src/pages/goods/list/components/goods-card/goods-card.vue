<script lang="ts">
</script>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { goodsCardProps } from './type'

const props = defineProps(goodsCardProps)

const emit = defineEmits(['goods-click', 'thumb', 'add-cart', 'ob'])

const independentID = ref<string>('')
const goods = ref<any>({ id: '' })
const isValidityLinePrice = ref<boolean>(false)

watch(
  () => props.id,
  (newValue) => {
    genIndependentID(newValue)
    if (props.thresholds?.length) {
      createIntersectionObserverHandle()
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => props.data,
  (newValue) => {
    if (!newValue) {
      return
    }
    if (newValue.originPrice && newValue.price && newValue.originPrice < newValue.price) {
      isValidityLinePrice.value = false
    }
    else {
      isValidityLinePrice.value = true
    }
    goods.value = newValue
  },
  { deep: true, immediate: true },
)

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  clear()
})

let intersectionObserverContext: UniApp.IntersectionObserver | null = null

function clickHandle() {
  console.log('clickHandle', goods.value);
  emit('goods-click', goods.value.id)
}

function clickThumbHandle() {
  emit('thumb', { goods: goods.value })
}

function addCartHandle(e) {
  const { id } = e.currentTarget
  const { id: cardID } = e.currentTarget.dataset
  emit('add-cart', {
    ...e.detail,
    id,
    cardID,
    goods: goods.value,
  })
}

function genIndependentID(id) {
  if (id) {
    independentID.value = id
  }
  else {
    independentID.value = `goods-card-${~~(Math.random() * 10 ** 8)}`
  }
}

function init() {
  const { thresholds, id } = props
  genIndependentID(id)
  if (thresholds && thresholds.length) {
    createIntersectionObserverHandle()
  }
}

function clear() {
  clearIntersectionObserverHandle()
}

function createIntersectionObserverHandle() {
  if (intersectionObserverContext || !independentID.value) {
    return
  }
  intersectionObserverContext = uni
    .createIntersectionObserver({
      thresholds: props.thresholds,
    })
    .relativeToViewport()

  intersectionObserverContext.observe(`#${independentID.value}`, (res) => {
    intersectionObserverCB()
  })
}

function intersectionObserverCB() {
  emit('ob', {
    goods: goods.value,
    context: intersectionObserverContext,
  })
}

function clearIntersectionObserverHandle() {
  if (intersectionObserverContext) {
    try {
      intersectionObserverContext.disconnect()
    }
    catch (e) {
      console.log(e)
    }
    intersectionObserverContext = null
  }
}
</script>

<template>
  <view class="goods-card" @click="clickHandle">

    <view class="goods-card__thumb">
      <wd-img 
        :lazy-load="true"
        width="100%"
        :src="goods.storePageIcon"
        :mode="'widthFix'"
      />
    </view>
    <view class="pt-20rpx pb-10rpx">
        <view class="font-size-24rpx overflow-hidden text-ellipsis whitespace-nowrap">
          {{ goods.productName }}
        </view>

        <view class="mt-10rpx font-size-30rpx fw-bold color-#212121">
          {{ '￥' + goods.premium }}
        </view>

        <view class="mt-10rpx flex items-center">
          <view class="points-icon mr-6rpx"></view>
          <view class="font-size-24rpx color-#efb106 fw-bold">
            {{ goods.exchangePrice }}
          </view>
        </view>
    </view>    

  </view>
</template>

<style lang="scss" scoped>
.goods-card {
  position: relative;
  padding: 0;
  width: 360rpx;
  height: 520rpx;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
  background: #fff;
  padding: 10rpx 0 0 10rpx;
  box-sizing: border-box;
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
</style>
