// import { get, post } from '@/utils/request'
import { API_DOMAINS, http } from '@/http/request/alova'

export interface cancelConsignmentParams{
  idList: string  // 主键ID，多个逗号分割
}

export interface myConsignmentListResponse{
  productList: any[]
}

export interface myConsignmentParams {
  status: number  // 寄售状态 0 发售中 1 已出售 2 全部
  page: number,
  pageSize: number // 每页条数
}

export interface consignmentParams {
  page: number,
  pageSize: number // 每页条数
}

export interface consignmentInfoParams {
  id: string  // 寄售物品ID
}

export interface consignmentInfoResponse {
  boxInfo: {}
}

export interface getProductFastSellParams{
  resultIds: string  // 盒柜商品主键id列表 以英文逗号分隔
  totalPrice: number // 商品总价
}

export interface getProductCommonSell{
  priceList: string  // 价格列表 盒柜主键id+价格  格式如  "1001:12,1002:13"
  totalPrice: number // 商品总价
}

// 寄售专区发布中列表
export const fetchConsignmentList = async (params: consignmentParams): Promise<any> => {
  console.log('fetchConsignmentList-----------')
  return http.Get<any>('/order/sellingProductList', { params })
}

// 寄售物品详情
export const fetchConsignmentInfo = async (params: consignmentInfoParams): Promise<any> => {
  console.log('fetchConsignmentInfo-----------')
  console.log('params', params)
  return http.Get('/order/sellingProductInfo', {
    params
  })
}

// 取消寄售
export const getCancelConsignment = async (params: cancelConsignmentParams): Promise<any> => {
  console.log('fetchMyConsignmentList-----------')
  return http.Get('/order/cancelSell', { params })
}


// 寄售专区 -> 快速寄售（回收）
export const getProductFastSell = async (params: getProductFastSellParams): Promise<any> => {
  console.log('GetProductFastSell-----------')
  console.log('params', params)
  return http.Get('/order/productFastSell', {
    params
  })
}

// 寄售专区 -> 普通寄售
export const getProductCommonSell = async (params: getProductCommonSellParams): Promise<any> => {
  console.log('getProductCommonSellParams-----------')
  console.log('params', params)
  return http.Get('/order/productCommonSell', {
    params
  })
}

// 商户列表
export const fetchCompanyList = async (): Promise<any> => {
  console.log('fetchCompanyList-----------')
  return http.Get('/shop/companyList')
}
