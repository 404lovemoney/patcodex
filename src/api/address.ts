import type { addressItem, createAddressParams, delAddressParams, modifyAddressParams, setDefaultAddressParams } from '@/api/types/address'
import { http } from '@/http/request/alova'

/**
 * 获取收货地址列表
 */
export const fetchUserAddressList = () => {
  return http.Get<addressItem[]>('/user/address/list', {})
}


/**
 * 添加收货地址
 * @param data 请求参数
 */
export const addUserAddress = (params: createAddressParams) => {
  console.log('createAddressParams', params);
  return http.Get<createAddressParams>('/user/address/create', { params })
}


/**
 * 编辑收货地址
 * @param data 请求参数
 */
export const updateUserAddress = (params: modifyAddressParams) => {
  console.log('modifyAddressParams', params);
  return http.Get<modifyAddressParams>('/user/address/update', { params })
}


/**
 * 删除收货地址
 * @param data 请求参数
 */
export const deleteUserAddress = (params: delAddressParams) => {
  return http.Get('/user/address/delete', { params })
}

/**
 * 设置默认收货地址
 * @param data 请求参数
 */
export const setDefaultAddress = (params: setDefaultAddressParams) => {
  return http.Get('/user/address/setDefault', { params })
}


