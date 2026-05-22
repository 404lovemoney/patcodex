import type { IUserInfo, IUserLogin, IUserAddress } from '@/api/types/login'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import Big from 'big.js';

import { 
  login as _login,
  register as _register,
  getUserProfile as _getUserInfo,
  getUserAddressList as _getUserAddressList,
  getWechatPhoneLogin as _getWechatPhoneLogin,
  getWechatLoginByCode as _getWechatLoginByCode,
} from '@/api/auth'

import { toast } from '@/utils/toast'

// 初始化状态
const userInfoState: IUserInfo = {
  isAgent: 0, // 是否代理 0 否 1 是
  id: '0',
  open_id: '',
  username: '',
  phone: '',
  balance: 0,
  points: 0,
  sex: '',
  avatar: '',
  token: '',
  openId: '',
}

const userAddressState: IUserAddress = {
  id: 0,
  userId: 0,
  contactName: '',
  contactPhone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: 0
}

// 确保输入值合法
const safeBig = (val: any): Big => {
  const num = Number(String(val).trim()) // 这里有个知识点，Number不会抛错，只会返回NaN
  return isFinite(num) ? new Big(num) : new Big(0)
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 定义用户信息
    const userInfo = ref<IUserInfo>({ ...userInfoState })

    // 定义地址信息
    const userAddress = ref<IUserAddress>({ ...userAddressState })

    // 设置用户token
    const setUserToken = (val: IUserLogin) => {
      console.log('设置token', val)
      uni.setStorageSync('token', val.token)
      userInfo.value.token = val.token
    }

    // 设置用户OpenId
    const setUserOpenId = (val) => {
      console.log('设置openId', val)
      uni.setStorageSync('openId', val.openId)
      userInfo.value.openId = val.openId
    }

    // 设置用户信息
    const setUserInfo = (val: IUserInfo) => {
      console.log('设置用户信息------', val)
      // 若头像为空 则使用默认头像
      if (val.avatar) {
        val.avatar = val.avatar
      }
      else {
        val.avatar = 'https://img.niantu.cn/spark-mall/static/images/default-avatar.png'
      }
      userInfo.value = val
      // userInfo.value.points = val.points
      // userInfo.value.balance = val.balance
    }

    // 设置用户地址
    const setUserAddress = (val: IUserAddress) => {
      console.log('设置用户地址', val)
      userAddress.value = val
    }

    // 增加用户积分
    const increasePoints = (val) => {
      console.log('增加用户积分', val)
      userInfo.value.points = userInfo.value.points + val
    }
    // 减少用户积分
    const deductingPoints = (val) => {
      console.log('减少用户余额', val)
      userInfo.value.points = userInfo.value.points - val
    }

    // 减少用户余额
    const deductingBalance = (val) => {
      console.log('减少用户余额', val)
      let userBalance = safeBig(userInfo.value.balance).round(2, 1)
      let minusBalance = safeBig(val).round(2, 1)
      let difference = userBalance.minus(minusBalance) // Big 减法
      userInfo.value.balance = difference.toNumber()
    }

    // 设置用户头像
    const setUserAvatar = (avatar: string) => {
      userInfo.value.avatar = avatar
      console.log('设置用户头像', avatar)
      console.log('userInfo', userInfo.value)
    }

    // 删除用户信息
    const removeUserInfo = () => {
      console.log('removeUserInfo')
      userInfo.value = { ...userInfoState }
      userAddress.value = { ...userAddressState }
      uni.removeStorageSync('token')
      uni.removeStorageSync('openId')
    }

    // 清除地址信息
    const removeUserAddress = () => {
      userAddress.value = { ...userAddressState }
    }

    /**
     * 获取用户信息
     */
    const getUserInfo = async () => {
      const res = await _getUserInfo()
      console.log('pinia getUserInfo', res)
      let userInfo = res
      userInfo.token = uni.getStorageSync('token')
      setUserInfo(userInfo)
      // uni.setStorageSync('userInfo', userInfo)
      // TODO 这里可以增加获取用户路由的方法 根据用户的角色动态生成路由
      return res
    }

    /**
     * 获取用户地址
     */
    const getUserAddressList = async () => {
      const res = await _getUserAddressList()
      if (res.length) {
        let isDefaultAddress = res.some(item => item.isDefault === 1)
        let defaultAddress
        if (isDefaultAddress) {
          defaultAddress = res.filter(item => item.isDefault === 1)[0]
        } else {
          defaultAddress = res[0]
        }
        console.log('defaultAddress', defaultAddress)
        setUserAddress(defaultAddress)
      }
      console.log('pinia getUserAddressList', res)
      return res
    }

    /**
     * 用户登录
     * @param LoginParams 登录参数
     * @returns R<LoginResponse>
     */
    const login = async (LoginParams: {
      phone: number
      password: string
      code: number
      type: number
    }) => {
      const res = await _login(LoginParams)
      console.log('登录信息', res)
      toast.success('登录成功')
      uni.setStorageSync('token', res.token)
      await getUserInfo() // 获取用户信息
      return res
    }
    /**
     * 用户注册
     * @param credentials 登录参数
     * @returns R<IUserRegister>
     */
    const register = async (credentials: {
      phone: number
      password: string
      code: string
    }) => {
      const res = await _register(credentials)
      console.log('注册信息', res)
      toast.success('注册成功')
      // uni.setStorageSync('token', res.token)
      // await getUserInfo()
      return res
    }

    /**
     * 退出登录 并 删除用户信息
     */
    const logout = async () => {
      await removeUserInfo()
    }
    /**
     * 微信code获取OpenId
     */
    const wxOpenId = async () => {
      // 获取微信小程序登录的code
        //调用微信登录接口获取临时code 
        const loginInfo = await uni.login({ provider: "weixin" });
        if (loginInfo) {
         // 登录临时code
          const { code } =  loginInfo;
          console.log('微信登录code', code)
          const res = await _getWechatLoginByCode({
            code
          })
          console.log('_getWechatLoginByCode res', res)
          setUserOpenId(res)
        }
    }

    /**
     * 手机号快速验证登录
     * @param LoginParams 登录参数
     * @returns R<LoginResponse>
     */
    const wxPhoneLogin = async (LoginParams: {
      openId: string,
      code: string
    }) => {
      try {
        const res = await _getWechatPhoneLogin(LoginParams)
        console.log('登录信息', res)
        toast.success('登录成功')
        uni.setStorageSync('token', res.token)
        await getUserInfo() // 获取用户信息
        return res
      } catch (error) {
        console.error(error);
        // 处理异常
      }
    }

     /**
     * 是否已登录
     */   
    const isLoggedIn = ()=> {
      return userInfo.value.token !== ''
    }

     /**
     * 是否有首选地址
     */   
     const isFirstAddress = ()=> {
      return userAddress.value.id !== 0
    }

    return {
      userInfo,
      userAddress,
      login,
      register,
      isLoggedIn,
      isFirstAddress,
      wxOpenId,
      wxPhoneLogin,
      getUserInfo,
      getUserAddressList,
      setUserAvatar,
      setUserToken,
      setUserInfo,
      setUserAddress,
      increasePoints,
      deductingPoints,
      deductingBalance,
      logout,
      removeUserAddress,
    }
  },
  {
    persist: true, // 如果需要持久化就写 true, 不需要持久化就写 false（或者去掉这个配置项）
  },
)
