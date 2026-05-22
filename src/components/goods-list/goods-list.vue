<script lang="ts">
</script>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import func from 'vue-temp/vue-editor-bridge'
import { goodsListProps } from './type'

const props = defineProps(goodsListProps)

const emit = defineEmits(['click', 'add-cart'])


const independentID = ref<string>('')

function onClickGoods(index) {
  console.log('goods-list onClickGoods', index);
  emit('click', { goodsId: index });
  uni.navigateTo({
    url: '/pages/goods/detail/index',
  })
}

function onAddCart(index) {
  console.log('goods-list onAddCart', index);
  emit('add-cart', { goodsId: index });
}

onMounted(() => {
})

</script>

<template>
  <view :id="independentID" class="goods-list-wrap">
    <block v-for="(item, index) in goods" :key="index">
      <goods-card
        :id="`${independentID}-gd-${index}`"
        :data="item"
        :currency="item.currency || '¥'"
        :thresholds="thresholds"
        class="goods-card-inside"
        @goods-click="onClickGoods(`${independentID}-gd-${index}`, index)"
        @add-cart="onAddCart(`${independentID}-gd-${index}`, index)"
      />
    </block>
  </view>
</template>

<style lang="scss" scoped>
.goods-list-wrap {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  padding: 0;
  background: #fff;
}
</style>
