/** 收货地址项 */
export type addressItem = {
  /** 收货人姓名 */
  contactName: string
  /** 联系方式 */
  contactPhone: string
  /** 省份编码 */
  province: string
  /** 城市编码 */
  city: string
  /** 区/县编码 */
  district: string
  /** 详细地址 */
  detailAddress: string
  /** 默认地址，1为是，0为否 */
  isDefault: number
  /** 用户 id */
  userId: number
  /** 收货地址 id */
  id: number
  /** 省市区编码 */
  areaValues: string
}

/** 添加收货地址: 请求参数 */
export type createAddressParams = {
  /** 收货人姓名 */
  contactName: string
  /** 联系方式 */
  contactPhone: string
  /** 省份编码 */
  province: string
  /** 城市编码 */
  city: string
  /** 区/县编码 */
  district: string
  /** 详细地址 */
  detailAddress: string
  /** 默认地址，1为是，0为否 */
  isDefault: number
  /** 省市区编码 */
  areaValues: string
}

/** 删除收货地址: 请求参数 */
export type delAddressParams = {
  /** 主键id */
  id: number
}

/** 设置默认收货地址: 请求参数 */
export type setDefaultAddressParams = {
  /** 主键id */
  id: number
}

/** 编辑收货地址: 请求参数 */
export type modifyAddressParams = {
  /** 主键id */
  id: number
  /** 用户id */
  userId: number
  /** 收货人姓名 */
  contactName: string
  /** 联系方式 */
  contactPhone: string
  /** 省份编码 */
  province: string
  /** 城市编码 */
  city: string
  /** 区/县编码 */
  district: string
  /** 详细地址 */
  detailAddress: string
  /** 默认地址，1为是，0为否 */
  isDefault: number
  /** 省市区编码 */
  areaValues: string
}

