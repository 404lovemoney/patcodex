<script setup lang="ts">

// 是否适配底部安全区域
defineProps<{
  safeAreaInsetBottom?: boolean
}>()

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

</script>

<template>

  <view class="toolbar" :style="{ paddingBottom: safeAreaInsetBottom ? safeAreaInsets?.bottom + 'px' : 0 }">
    <slot />
  </view>
  <!-- 底部占位空盒子 -->
  <view class="toolbar-height"></view>

</template>

<style lang="scss">
// 吸底工具栏
.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(var(--window-bottom));
  z-index: 1;
  min-height: 80rpx;
}
// 底部占位空盒子
.toolbar-height {
  min-height: 80rpx;
}
</style>