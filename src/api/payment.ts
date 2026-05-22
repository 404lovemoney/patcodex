// import { get, post } from '@/utils/request'
import { API_DOMAINS, http } from '@/http/request/alova'

export interface orderPayParams {
  orderNo: number  // 订单ID
}

// 订单支付接口
// export const orderPay = async (params: orderPayParams): Promise<void> => {
//   console.log('orderPay-----------')
//   console.log('params', params)
//   return http.Post('/order/pay', params)
// }

// 通用支付接口
export const commonOrderPay = async (params: orderPayParams): Promise<void> => {
  console.log('commonOrderPay-----------')
  console.log('params', params)
  // return http.Post('/order/pay', params)
  return http.Get('/order/pay', { params })
}

// 微信小程序支付
export const wxOrderPay = async (params: wxOrderPayParams): Promise<any> => {
  console.log('wxOrderPay-----------')
  console.log('params', params)
  return http.Get('/order/wechatMiniAppPay', { params })
}