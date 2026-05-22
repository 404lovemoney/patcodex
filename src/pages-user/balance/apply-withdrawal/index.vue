<route lang="jsonc" type="page">
    {
      "layout": "tabbar",
      "style": {
        "navigationStyle": "custom",
        "navigationBarTitleText": "申请提现"
      }
    }
 </route>

<script setup lang="ts">

defineOptions({
  name: 'Points',
})
import { getApplyWithdrawal } from '@/api/auth'

// pinia
import { useUserStore } from '@/store'
const userStore = useUserStore()

// 注册一个回调函数，在组件挂载完成后执行。
onMounted(async () => {
  // 拉取用户信息
  await userStore.getUserInfo()
})

import { useToast } from 'wot-design-uni'

const { success: showSuccess } = useToast()

const payTypeList = ref<any[]>([
  {
    value: 1,
    label: '支付宝'
  }
])

const model = reactive<{
  realName: string
  amount: string
  payAccount: string
  payType: number
}>({
  realName: '',
  amount: '',
  payAccount: '',
  payType: 1
})

const form = ref()

const handleSubmit = () => {
  form.value
    .validate()
    .then(({ valid, errors }) => {
      if (valid) {
        console.log('校验通过')
        getApplyWithdrawalHandle()
      }
    })
    .catch((error) => {
      console.log(error, 'error')
    })
}

/** 申请提现 */
const getApplyWithdrawalHandle = async () => {
  try {
    const res = await getApplyWithdrawal({
      realName: model.realName,
      amount: model.amount,
      payAccount: model.payAccount,
      payType: model.payType
    })
    console.log('res', res)
    uni.showToast({
      title: '提现申请已提交',
      icon: 'success'
    })

    // 前往提现记录页
    uni.redirectTo({
      url: '/pages-user/balance/withdrawal-list/index'
    })
  }
  catch (err) {
  }
}

// 去首页
const toHomeHandle = () => {
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/home/home',
      success(res) {
        console.log('跳转成功')
      }
    })
  }, 300)
}
</script>

<template>
  <view class="wrapper">
    <!-- 自定义顶部标题栏 -->
    <custom-nav-bar
      :title="'申请提现'"
      page-name="applyWithdrawal"
      :show-icon="true"
      :bg-color="'#fff'"
    >
    </custom-nav-bar>
    <view class="user-balance pos-relative">
      <view class="balance-item">
        <view class="label">可提现余额</view>
        <view class="num">{{ userStore.userInfo.balance }}</view>
      </view>
      <view class="pos-absolute bottom-30rpx right-35rpx">
          <navigator
            url="/pages-user/balance/withdrawal-list/index"
            open-type="navigate"
          >
            <text class="color-#23C2E6 font-size-30rpx fw-bold decoration-underline">提现记录</text>  
          </navigator>
        </view>
    </view>

    <view class="content">
      <wd-form ref="form" :model="model">
        <wd-cell-group border>
          <wd-input
            label="收款人"
            label-width="100px"
            prop="realName"
            clearable
            v-model="model.realName"
            placeholder="请填写收款人姓名"
            :rules="[{ required: true, message: '请填写收款人姓名' }]"
          />
          <wd-picker
            required
            label="支付类型"
            placeholder="请选择支付类型"
            label-width="100px"
            prop="payType"
            v-model="model.payType"
            :columns="payTypeList"
          />
          <wd-input
            label="收款账号"
            label-width="100px"
            prop="payAccount"
            clearable
            v-model="model.payAccount"
            placeholder="请填写收款账号"
            :rules="[{ required: true, message: '请填写收款账号' }]"
          />
          <wd-input
            label="提现数额"
            label-width="100px"
            prop="amount"
            clearable
            v-model="model.amount"
            placeholder="请填写提现金额"
            :rules="[{ required: true, message: '请填写提现金额' }]"
          />
        </wd-cell-group>
      </wd-form>
    </view>

    <footer-tool-bar>
      <view class="operation bg-#fff">
        <view class="pos-relative flex justify-center items-center h-100rpx">
          <view @click="handleSubmit" class="operation-btn">
            <text class="">申请提现</text>
          </view>
        </view>
      </view>
    </footer-tool-bar>
  </view>
</template>

<style lang="scss" scoped>
.wrapper {
  box-sizing: border-box;
  padding-top: 6rpx;
  background: #E6E6E6;
  display: flex;
  flex-direction: column;
  // 计算页面视口最大高度
  height: calc(100vh - var(--window-top) - var(--window-bottom));
}
.content{
  flex: 1;
}

.user-balance{
  box-sizing: border-box;
  height: 180rpx;
  margin-bottom: 6rpx;
  display: flex;
  justify-content: center;
  background: #fff;
  color: #141414;
  padding-top: 25rpx;
  .balance-item{
    flex: 1;
    text-align: center;
    position: relative;
    &::before {
      content: "";
      background-color: #EEEEEE;
      width: 2rpx;
      height: 76rpx;
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }
    &:first-child:before {
      display: none;
    }
  }
  .label {
    margin-bottom: 25rpx;
    font-size: 32rpx;
  }
  .num{
    font-size: 38rpx;
    font-weight: bold;
    color: #000000;
  }
}
:deep(.wd-tabs) {
  background-color: transparent;
}
:deep(.wd-tabs__nav-item) {
  font-size: 28rpx;
  font-weight: bold;
  background-color: #E6E6E6;
  color: #262626;
}
:deep(.wd-tabs__nav-item.is-active) {
  color: #27BAAC;
}
:deep(.wd-tabs__line) {
  background-color: #27BAAC;
}
.point-item{
  background: #fff;
  margin-bottom: 5px;
  padding: 5px;
  font-size: 16px;
  
}
.point-intro {
  font-size: 14px;
  margin: 10px 10px;
  display: flex;
  justify-content: space-between;
}
.time{
  padding: 5px 10px;
  border-bottom: 1px solid #ccc;
}

.price{
  color: #27BCAF;
  font-weight: bold;
  font-size: 28rpx;
}

.operation-btn{
  text-align: center;
  line-height: 80rpx;
  width: 180rpx;
  height: 80rpx;
  background: #F7E344;
  font-size: 28rpx;
  color: #262626;
  border-radius: 40rpx;
  font-weight: bold;
}

</style>
