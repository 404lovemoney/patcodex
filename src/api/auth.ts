// import { get, post } from '@/utils/request'
import { API_DOMAINS, http } from '@/http/request/alova'
import type { addressItem } from '@/api/types/address'
// 认证相关接口类型
export interface LoginParams {
  phone: number  // 手机号
  password: string // 密码
  code?: number // 验证码
  type: number // 登录类型 1 验证码 2 密码
}

export interface RegisterParams {
  phone: number // 手机号
  password?: string // 密码
  code: string // 微信授权code
  phoneCode?: number // 验证码 与密码 二选1
}
export interface dateStatsResponse {
  totalInvitCount: number
  dataList: []
}

export interface myInviteListResponse {
  userList: [],
  pagination: {}
}

export interface UserPointsListResponse {
  recordList: [],
  pagination: {}
}

export interface UserBalanceListResponse {
  recordList: [],
  pagination: {
    total: number,
    pageSize: number,
    currentPage: number,
    lastPage: number
  }
}

export interface getWithdrawalListResponse {
  recordList: [],
  pagination: {
    total: number,
    pageSize: number,
    currentPage: number,
    lastPage: number
  }
}

export interface LoginResponse {
  token: string
}

// 用户登录
export const login = async (params: LoginParams): Promise<LoginResponse> => {
  return http.Post<LoginResponse>('/user/login', params)
}

// 用户注册
export const register = async (params: RegisterParams): Promise<void> => {
  return http.Post<void>('/user/register', params)
}

// 获取用户信息
export const getUserProfile = async (): Promise<any> => {
  return http.Get('/user/info')
}

// 获取用户地址列表
export const getUserAddressList = async () => {
  return http.Get<addressItem[]>('/user/address/list', {})
}

// 获取用户积分信息
export const getUserPointsChangeList = async (params): Promise<UserPointsListResponse> => {
  return http.Get<UserPointsListResponse>('/user/pointsChangeList', {
    params
  })
}

// 获取用户余额变动记录
export const getUserBalanceChangeList = async (params): Promise<UserBalanceListResponse> => {
  return http.Get<UserBalanceListResponse>('/user/balanceChangeList', {
    params
  })
}

// 获取用户提现记录
export const getWithdrawalList = async (params): Promise<getWithdrawalListResponse> => {
  return http.Get<getWithdrawalListResponse>('/withdrawal/getApplyList', {
    params
  })
}

// 申请提现
export const getApplyWithdrawal = async (params): Promise<any> => {
  return http.Get('/withdrawal/submitApply', {
    params
  })
}


// 获取代理账号邀请信息
export const getDateStats = async (params): Promise<dateStatsResponse> => {
  return http.Get('/user/dateStats', {
    params
  })
}

// 获取代理账号邀请列表
export const getMyInviteList = async (params): Promise<myInviteListResponse> => {
  return http.Get('/user/myInviteList', {
    params
  })
}

// 获取代理账号佣金明细列表
export const getCommissionList = async (params): Promise<any> => {
  return http.Get('/user/commissionList', {
    params
  })
}

// 获取手机号生成code登录
export const getWechatPhoneLogin = async (params): Promise<any> => {
  return http.Get('/user/wechatPhoneLogin', {
    params
  })
}

// 获取手机号生成code登录
export const getWechatLoginByCode = async (params): Promise<any> => {
  return http.Get('/user/loginByCode', {
    params
  })
}

// 设置昵称
export const setUserNickName = async (params): Promise<any> => {
  return http.Get('/user/setNickName', {
    params
  })
}


