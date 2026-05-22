<script lang="ts">
</script>

<script lang="ts" setup>
import type { ConfigProviderThemeVars } from 'wot-design-uni'

const themeVars = reactive<ConfigProviderThemeVars>({
  colorTheme: '#fa4126',
  tabsNavLineBgColor: 'red',
})
</script>

<template>
  <wd-config-provider :theme-vars="themeVars">
    <!-- Notify 消息通知 用于在页面顶部展示通知信息。 -->
    <wd-notify />
    <!-- Toast 轻提示组件 用于消息通知、加载提示、操作结果提示等场景，支持函数式调用。 -->
    <wd-toast />
    <!-- MessageBox 弹出对话框，常用于消息提示、消息确认等，支持函数调用。 -->
    <wd-message-box />
    <!-- 用户隐私保护提示 -->
    <!-- <privacy-popup /> -->
    <slot />
  </wd-config-provider>
</template>

<style lang="scss" scoped></style>
