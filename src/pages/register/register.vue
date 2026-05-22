<template>
  <view class="register-container">
    <!-- 背景渐变 -->
    <view class="bg-gradient"></view>
    
    <!-- 注册表单 -->
    <view class="register-content">
      <!-- Logo区域 -->
      <view class="logo-section">
        <view class="logo-container">
          <view class="logo-icon">E</view>
        </view>
        <text class="welcome-text">欢迎加入</text>
        <text class="subtitle">请注册您的账户</text>
      </view>

      <!-- 表单区域 -->
      <view class="form-section">
        <!-- 手机号输入框 -->
        <view class="input-group" :class="{ 'focused': phoneFocused }">
          <input 
            type="text"
            class="input-field"
            placeholder="请输入手机号"
            placeholder-class="user-input-placeholder"
            v-model="formData.phone"
            @focus="handleFocus('phone')"
            @blur="handleBlur('phone')"
            @confirm="handleRegister"
          />
          <text class="input-icon">👤</text>
        </view>

        <!-- 密码输入框 -->
        <view class="input-group" :class="{ 'focused': passwordFocused }">
          <input 
            type="password" 
            class="input-field"
            placeholder="请输入密码"
            placeholder-class="user-input-placeholder"
            v-model="formData.password"
            @focus="handleFocus('password')"
            @blur="handleBlur('password')"
            @confirm="handleRegister"
          />
          <text class="input-icon">🔒</text>
        </view>

        <!-- 确认密码输入框 -->
        <!--
        <view class="input-group" :class="{ 'focused': confirmPasswordFocused }">
          <input 
            type="password" 
            class="input-field"
            placeholder="请确认密码"
            v-model="formData.confirmPassword"
            @focus="handleFocus('confirmPassword')"
            @blur="handleBlur('confirmPassword')"
            @confirm="handleRegister"
          />
          <text class="input-icon">🔒</text>
        </view>
        -->

        <!-- 注册按钮 -->
        <button 
          class="register-btn" 
          :class="{ 'loading': isLoading }"
          @click="handleRegister"
          :disabled="isLoading"
        >
          <text v-if="!isLoading">注册</text>
          <text v-else>注册中...</text>
        </button>

        <!-- 已有账号登录 -->
        <view class="login-link-section">
          <text class="login-link" @click="goToLogin">已有账号？立即登录</text>
        </view>

        <!-- 测试账号提示 -->
        <view class="test-account">
          <text class="test-text">注册成功后可直接登录</text>
        </view>
      </view>
    </view>

    <!-- 底部装饰 -->
    <view class="bottom-decoration"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
// import { register } from '@/api/auth'
// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

// 响应式数据
const formData = reactive({
  phone: '',
  password: '',
  code: '',
  phoneCode: ''
})

const phoneFocused = ref(false)
const passwordFocused = ref(false)
const confirmPasswordFocused = ref(false)
const isLoading = ref(false)

// 输入框聚焦处理
const handleFocus = (field: 'phone' | 'password' | 'confirmPassword') => {
  if (field === 'phone') {
    phoneFocused.value = true
  } else if (field === 'password') {
    passwordFocused.value = true
  } else {
    confirmPasswordFocused.value = true
  }
}

// 输入框失焦处理
const handleBlur = (field: 'phone' | 'password' | 'confirmPassword') => {
  if (field === 'phone') {
    phoneFocused.value = false
  } else if (field === 'password') {
    passwordFocused.value = false
  } else {
    confirmPasswordFocused.value = false
  }
}

// 表单验证
const validateForm = () => {
  if (!formData.phone.trim()) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  if (formData.phone.length < 11) {
    uni.showToast({
      title: '手机号格式不正确',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  if (!formData.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  if (formData.password.length < 6) {
    uni.showToast({
      title: '密码至少6个字符',
      icon: 'none',
      duration: 2000
    })
    return false
  }

  // if (!formData.confirmPassword) {
  //   uni.showToast({
  //     title: '请确认密码',
  //     icon: 'none',
  //     duration: 2000
  //   })
  //   return false
  // }

  // if (formData.password !== formData.confirmPassword) {
  //   uni.showToast({
  //     title: '两次密码输入不一致',
  //     icon: 'none',
  //     duration: 2000
  //   })
  //   return false
  // }

  return true
}

// 注册处理
const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  console.log('-----------')

  try {
    // 调用注册API
    // await register({
    //   phone: parseInt(formData.phone),
    //   password: formData.password,
    //   code: Math.random().toString(36).slice(-12)
    // })
    
    // 调用pinia 注册API
    userStore.register({
      phone: parseInt(formData.phone),
      password: formData.password,
      code: Math.random().toString(36).slice(-12)
    })

    // 注册成功提示
    uni.showToast({
      title: '注册成功！',
      icon: 'success',
      duration: 2000
    })

    // 清空表单
    formData.phone = ''
    formData.password = ''

    // 跳转到登录页
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      })
    }, 2000)

  } catch (error: any) {
    uni.showToast({
      title: error.message || '注册失败，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
    isLoading.value = false
  }
}

// 跳转到登录页
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  })
}
</script>

<style scoped>
.register-container {
  min-height: calc(100vh - var(--window-top) - var(--window-bottom));
  position: relative;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 1;
}

.register-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 120rpx 60rpx 80rpx;
  position: relative;
  z-index: 2;
}

/* Logo区域 */
.logo-section {
  text-align: center;
  margin-bottom: 100rpx;
}

.logo-container {
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  margin: 0 auto 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20rpx);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.logo-icon {
  width: 80rpx;
  height: 80rpx;
  background: #fff;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #667eea;
  font-weight: bold;
}

.welcome-text {
  color: #fff;
  font-size: 56rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
  display: block;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 32rpx;
  display: block;
}

/* 表单区域 */
.form-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.input-group {
  width: 90%;
  position: relative;
  transition: all 0.3s ease;
}

.input-group.focused {
  transform: scale(1.02);
}

.input-field {
  width: 100%;
  padding: 36rpx 40rpx;
  border: none;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20rpx);
  color: #fff;
  font-size: 32rpx;
  transition: all 0.3s ease;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
}

.user-input-placeholder,
.input-field::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.input-group.focused .input-field {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-4rpx);
  box-shadow: 0 16rpx 50rpx rgba(0, 0, 0, 0.15);
}

.input-icon {
  position: absolute;
  right: 40rpx;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 36rpx;
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  padding: 36rpx;
  border: none;
  border-radius: 30rpx;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  color: #667eea;
  font-size: 36rpx;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 40rpx;
  box-shadow: 0 16rpx 50rpx rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.register-btn:active {
  transform: translateY(-6rpx);
  box-shadow: 0 24rpx 70rpx rgba(0, 0, 0, 0.2);
}

.register-btn.loading {
  opacity: 0.8;
  pointer-events: none;
}

/* 登录链接 */
.login-link-section {
  text-align: center;
  margin-top: 40rpx;
}

.login-link {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  transition: color 0.3s ease;
}

.login-link:active {
  color: #fff;
}

/* 测试账号提示 */
.test-account {
  text-align: center;
  margin-top: 60rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  backdrop-filter: blur(10rpx);
}

.test-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
}

/* 底部装饰 */
.bottom-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.1), transparent);
  border-radius: 60rpx 60rpx 0 0;
  z-index: 1;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(60rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-section {
  animation: fadeInUp 0.8s ease-out;
}

.input-group:nth-child(1) {
  animation: fadeInUp 0.8s ease-out 0.1s both;
}

.input-group:nth-child(2) {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.input-group:nth-child(3) {
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.register-btn {
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.login-link-section {
  animation: fadeInUp 0.8s ease-out 0.5s both;
}

.test-account {
  animation: fadeInUp 0.8s ease-out 0.6s both;
}
</style> 