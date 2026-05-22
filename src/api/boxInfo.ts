// import { get, post } from '@/utils/request'
import { API_DOMAINS, http } from '@/http/request/alova'

export interface boxInfoParams {
  id: string  // 盲盒ID
}

export interface boxInfoResponse {
  boxInfo: {}
  productList: []
}


export interface boxOrderParams {
  id: string  // 盲盒ID
  count: number // 连抽次数
  totalPrice: number // 订单总金额
  cashPrice: number // 现金金额
  balance: number // 余额
  points: number // 积分
  couponAmount: number // 代金券金额
}
export interface createBoxOrderResponse {
  orderNo: string
}


export interface boxOrderPayParams {
  orderNo: string  // 订单ID
}

export interface boxDrawParams {
  orderNo: number  // 订单ID
}

export interface testDrawParams {
  boxId: number  // 订单ID
}

export interface dismantleProductParams{
  id: string  // 主键ID，多个逗号分割
}

export interface cancelConsignmentParams{
  idList: string  // 主键ID，多个逗号分割
}

export interface boxDrawResponse {
  productList: []
}

export interface unOpendBoxListResponse{
  unOpendBoxList: any[]
}

export interface productListResponse{
  productList: any[]
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

export interface noticeDetailParams {
  id: number  // ID
}


// 盲盒详情
export const fetchBoxInfo = async (params: boxInfoParams): Promise<boxInfoResponse> => {
  console.log('fetchBoxInfo-----------')
  console.log('params', params)
  return http.Get<boxInfoResponse>('/productBox/boxInfo', {
    params
  })
}

// 盲盒下单
export const createBoxOrder = async (params: boxOrderParams): Promise<createBoxOrderResponse> => {
  console.log('createBoxOrder-----------')
  console.log('params', params)
  // return http.Post<createBoxOrderResponse>('/productBox/createOrder', params)
  return http.Get<createBoxOrderResponse>('/productBox/createOrder', { params })
}

// 盲盒开奖
export const getBoxDraw = async (params: boxDrawParams): Promise<boxDrawResponse> => {
  console.log('getBoxDraw-----------')
  console.log('params', params)
  return http.Get<boxDrawResponse>('/productBox/boxDraw', {
    params
  })
}

// 盲盒试玩开奖
export const getTestDraw = async (params: testDrawParams): Promise<boxDrawResponse> => {
  console.log('getTestDraw-----------')
  console.log('params', params)
  return http.Get<boxDrawResponse>('/productBox/testDraw', {
    params
  })
}

// 盒柜待领取列表分页参数
export interface unopenedBoxListParams {
  pageSize: number // 每页条数
  page: number // 页码
}

// 盒柜待开盒列表
export const fetchUnopenedBoxList = async (params: unopenedBoxListParams): Promise<any> => {
  console.log('fetchUnOpendBoxList-----------')
  return http.Get<unOpendBoxListResponse>('/order/unOpendBoxList', { params })
}

// 盒柜待领取列表分页参数
export interface productListParams {
  pageSize: number // 每页条数
  page: number // 页码
}

// 盒柜待领取列表
export const fetchProductList = async (params: productListParams): Promise<any> => {
  console.log('fetchProductList-----------')
  return http.Get<any>('/order/productList', { params })
}

// 盒柜寄售中列表
export const fetchMyConsignmentList = async (params: myConsignmentParams): Promise<any> => {
  console.log('fetchMyConsignmentList-----------')
  return http.Get<any>('/order/mySellList', { params })
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

// 盒柜 -> 待领取项 -> 分解
export const GetDismantleProduct = async (params: dismantleProductParams): Promise<any> => {
  console.log('GetDismantleProduct-----------')
  console.log('params', params)
  return http.Get<dismantleProductParams>('/order/dismantleProduct', {
    params
  })
}

// 公告详情
export const fetchNoticeDetail = async (params: noticeDetailParams): Promise<any> => {
  console.log('fetchNoticeDetail-----------')
  console.log('params', params)
  return http.Get('/index/publicDetail', {
    params
  })
}

