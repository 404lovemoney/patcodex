/**
 * 用户信息
 */
export interface IUserInfo {
  id: string
  open_id?: string 
  username: string // 用户名
  avatar: string // 头像
  phone: string // 手机号
  balance: number // 账户余额
  points: number // 积分数
  sex: string
  isAgent?: number // 是否代理
  createTime?: string
  nickName?: string // 昵称
  token?: string
  openId?: string
  totalInvitCount?: number // 下级人数
  totalCommission?: string // 推广分成
  withdrawalAmount?: string // 已提现余额
  processAmount?: string // 审核中余额
}

/**
 * 地址信息
 */
export interface IUserAddress {
  id: number // 主键id
  userId: number // 用户id
  contactName: string // 联系人姓名
  contactPhone: string // 联系人 手机号
  province: string // 省份
  city: string // 城市
  district: string // 区县
  detailAddress: string // 详细地址
  isDefault: number // 是否默认值 0否 1是
}

/**
 * 登录返回的信息
 */
export interface IUserLogin {
  token: string
}

/**
 * 注册返回的信息
 */
export interface IUserRegister {
  token: string
}


/**
 * 获取验证码
 */
export interface ICaptcha {
  captchaEnabled: boolean
  uuid: string
  image: string
}
/**
 * 上传成功的信息
 */
export interface IUploadSuccessInfo {
  fileId: number
  originalName: string
  fileName: string
  storagePath: string
  fileHash: string
  fileType: string
  fileBusinessType: string
  fileSize: number
}
/**
 * 更新用户信息
 */
export interface IUpdateInfo {
  id: number
  name: string
  sex: string
}
/**
 * 更新用户信息
 */
export interface IUpdatePassword {
  id: number
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
