// import { get, post } from '@/utils/request'
import { API_DOMAINS, http } from '@/http/request/alova'

export interface orderListParams {
  status?: number  // 订单状态 0 未支付 1待发货 2 已发货 3 已完成  4 已取消 ，不传为所有
  pageSize: number // 每页条数
  page: number // 页码
}


export interface orderPayParams {
  orderNo: string  // 订单ID
}

export interface orderDetailParams {
  orderNo: string  // 订单ID
}

// 订单列表
export const fetchOrderList = async (params: orderListParams): Promise<any> => {
  console.log('fetchOrderList-----------')
  console.log('params', params)
  return http.Get('/order/orderList', {
    params
  })
}

// 订单详情
export const fetchOrderDetail = async (params: orderDetailParams): Promise<any> => {
  console.log('fetchOrderDetail-----------')
  console.log('params', params)
  return http.Get('/order/orderDetail', {
    params
  })
}

// 订单确认收货
export const getOrderReceipt = async (params: orderPayParams): Promise<void> => {
  console.log('getOrderReceipt-----------')
  console.log('params', params)
  return http.Get('/order/confirmReceipt', { params })
}




