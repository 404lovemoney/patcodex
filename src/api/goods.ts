// import { get, post } from '@/utils/request'
import { API_DOMAINS, http } from '@/http/request/alova'

export interface goodsInfoParams {
  id: string  // 商品ID
}

export interface goodsInfoResponse {
  id: number, // 商品id
  productName: string, // 名称
  productGrade: string, // 等级
  premium: string, // 商品溢价（售价）
  exchangePrice: string, // 兑换价（积分）
  dismantlePrice: string, // 分解价格（积分）
  storePageIcon: string, // 图标
  productDetailAdImage: string // 广告介绍图
  productDetailImages: string, // 商品介绍图
  shippingFee: string // 运费
}


export interface goodsListParams {
  id?: number  // 商品分类ID
  page: number // 页数
  pageSize: number // 每页条数
  sort?: number // 排序字段
  order?: string // 排序方式 asc 升序 desc 降序 默认 desc
  showStore?: number // 商城商品 ：1是 2否  0或不传 返回全部
}


export interface createGoodsParams {
  id: number  // 商品ID
  addressId: number // 地址id
  payType: number // 支付类型 1 现金 2积分
  couponId?: string // 代金券id
  couponAmount?: string // 代金券金额
  balance?: number // 余额支付数
  count: number // 数量
  totalPrice: number // 订单总金额
  points?: number // 积分
}

export interface createGoodsOrderResponse {
  orderNo: string
}


export interface exchangeProductParams {
  id: number  // 商品ID
  addressId: number // 地址id
  count: number // 数量
  balance?: number // 余额支付数
  points?: number // 积分
  resultIds: string // 盒柜商品主键id，多个id 以逗号分隔
  shippingFee: number // 运费
}

export interface exchangeProductResponse {
  orderNo: string
}

export interface goodsOrderPayParams {
  orderNo: number  // 订单ID
}

export interface wxOrderPayParams {
  orderNo: number  // 订单ID
  openId: string // 微信openID
}

export interface getCollectProductsParams {
  id: string  // 待提货列表，多个id 以逗号分隔
  addressId: number // 收货地址id
  shippingFee: string // 运费
  balance: number // 余额
}

export interface getCollectProductsResponse {
  orderNo: string
}


// 商品详情
export const fetchGoodsInfo = async (params: goodsInfoParams): Promise<goodsInfoResponse> => {
  console.log('fetchGoodsInfo-----------')
  console.log('params', params)
  return http.Get<goodsInfoResponse>('/product/productInfo', {
    params
  })
}

// 商品列表
export const fetchGoodsList = async (params: goodsListParams): Promise<any> => {
  console.log('fetchGoodsList-----------')
  console.log('params', params)
  return http.Get('/product/list', {
    params
  })
}

// 商品分类列表
export const fetchGoodsCategory = async (): Promise<any> => {
  console.log('fetchGoodsCategory-----------')
  return http.Get('/product/cateList')
}


// 商品下单
export const createGoodsOrder = async (params: createGoodsParams): Promise<createGoodsOrderResponse> => {
  console.log('createGoodsOrder-----------')
  console.log('params', params)
  return http.Get<createGoodsOrderResponse>('/product/createOrder', { params })
}

// 兑换升级商品
export const getExchangeProduct = async (params: exchangeProductParams): Promise<exchangeProductResponse> => {
  console.log('exchangeProduct-----------')
  console.log('params', params)
  return http.Get<exchangeProductResponse>('/product/exchangeProduct', { params })
}

// 批量提货下单
export const getCollectProducts = async (params: getCollectProductsParams): Promise<getCollectProductsResponse> => {
  console.log('getCollectProducts-----------')
  console.log('params', params)
  return http.Get<getCollectProductsResponse>('/order/collectProducts', { params })
}
