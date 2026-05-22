<script lang="ts">
</script>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { goodsCardProps } from './type'

const props = defineProps(goodsCardProps)

const emit = defineEmits(['goods-click'])

const goods = ref<any>({ id: '' })


onMounted(() => {
})

onBeforeUnmount(() => {
})


function clickHandle(id) {
  console.log('clickHandle', id)
  emit('goods-click', id)
}


</script>

<template>
  <view class="goods-card" @click="clickHandle(data.id)">
    <view class="goods-card__thumb">
      <wd-img 
        :lazy-load="true"
        width="100%"
        :src="data.storePageIcon"
        :mode="'widthFix'"
      />
    </view>
    <view class="pt-20rpx pb-10rpx">
        <view class="font-size-24rpx overflow-hidden text-ellipsis whitespace-nowrap">
          {{ data.productName }}
        </view>

        <view class="mt-10rpx font-size-30rpx fw-bold color-#212121">
          {{ '￥' + data.premium }}
        </view>

        <view class="mt-10rpx flex items-center">
          <view class="points-icon mr-6rpx"></view>
          <view class="font-size-24rpx color-#efb106 fw-bold">
            {{ data.exchangePrice }}
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
