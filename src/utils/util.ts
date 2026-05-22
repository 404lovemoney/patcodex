import dayjs from 'dayjs'



const formatTime = (date, template) => dayjs(date).format(template)

// 使用 duration 格式化时间差
const timeDuration = (date) => dayjs.duration(date)

// 计算当前时间到指定时间的毫秒数
const diffInMilliseconds = (date) => dayjs(date).diff(dayjs())

// 计算相差天数
// const diffTime = (date) => dayjs().diff(date)

/**
 * 格式化价格数额为字符串
 * 可对小数部分进行填充，默认不填充
 * @param price 价格数额，以分为单位!
 * @param fill 是否填充小数部分 0-不填充 1-填充第一位小数 2-填充两位小数
 */
function priceFormat(price, fill = 0) {
  if (isNaN(price) || price === null || price === Infinity) {
    return price
  }

  let priceFormatValue: string | number = Math.round(Number.parseFloat(`${price}`) * 10 ** 8) / 10 ** 8 // 恢复精度丢失
  priceFormatValue = `${Math.ceil(priceFormatValue) / 100}` // 向上取整，单位转换为元，转换为字符串
  if (fill > 0) {
    // 补充小数位数
    if (!priceFormatValue.includes('.')) {
      priceFormatValue = `${priceFormatValue}.`
    }
    const n = fill - priceFormatValue.split('.')[1]?.length
    for (let i = 0; i < n; i++) {
      priceFormatValue = `${priceFormatValue}0`
    }
  }
  return priceFormatValue
}

/**
 * 获取cdn裁剪后链接
 *
 * @param {string} url 基础链接
 * @param {number} width 宽度，单位px
 * @param {number} [height] 可选，高度，不填时与width同值
 */
function cosThumb(url, width, height = width) {
  if (url.includes('?')) {
    return url
  }

  if (url.indexOf('http://') === 0) {
    url = url.replace('http://', 'https://')
  }

  return `${url}?imageMogr2/thumbnail/${~~width}x${~~height}`
}

function get(source, paths, defaultValue) {
  if (typeof paths === 'string') {
    paths = paths.replace(/\[/g, '.').replace(/\]/g, '').split('.').filter(Boolean)
  }
  const { length } = paths
  let index = 0
  while (source != null && index < length) {
    source = source[paths[index++]]
  }
  return source === undefined || index === 0 ? defaultValue : source
}
let systemWidth = 0
/** 获取系统宽度，为了减少启动消耗所以在函数里边做初始化 */
export function loadSystemWidth() {
  if (systemWidth) {
    return systemWidth
  }

  try {
    systemWidth = uni.getSystemInfoSync().screenWidth
  }
  catch (e) {
    systemWidth = 0
  }
  return systemWidth
}

/**
 * 转换rpx为px
 *
 * @description
 * 什么时候用？
 * - 布局(width: 172rpx)已经写好, 某些组件只接受px作为style或者prop指定
 *
 */
function rpx2px(rpx, round = false) {
  loadSystemWidth()

  // px / systemWidth = rpx / 750
  const result = (rpx * systemWidth) / 750

  if (round) {
    return Math.floor(result)
  }

  return result
}

/**
 * 手机号码*加密函数
 * @param {string} phone 电话号
 * @returns
 */
function phoneEncryption(phone) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}


// 补零
function formatNumberToZeroString(num, decimalPlaces) {
  // 将数字转换为字符串
  let numStr = num.toString();
  // 检查小数点位置
  let decimalIndex = numStr.indexOf('.');
  // 如果没有小数点，添加小数点和相应数量的0
  if (decimalIndex === -1) {
      numStr += '.' + '0'.repeat(decimalPlaces);
  } else {
      // 如果小数位数不足，补充0
      let decimalLength = numStr.length - decimalIndex - 1;
      if (decimalLength < decimalPlaces) {
          numStr += '0'.repeat(decimalPlaces - decimalLength);
      }
  }
  return numStr;
}


// 内置手机号正则字符串
const innerPhoneReg = '^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$'

/**
 * 手机号正则校验
 * @param phone 手机号
 * @param phoneReg 正则字符串
 * @returns true - 校验通过 false - 校验失败
 */
function phoneRegCheck(phone) {
  const phoneRegExp = new RegExp(innerPhoneReg)
  return phoneRegExp.test(phone)
}

// 记录当前路由地址
const setPreviousPage = () => {
  let routes = getCurrentPages(); // 获取当前打开过的页面路由数组
  let curRoute = routes[routes.length - 1].route //获取当前页面路由
  let curParam = routes[routes.length - 1].options; //获取路由参数
  // 拼接参数
  let param = ''
  for (let key in curParam) {
    if (!param) {
      param += key + '=' + curParam[key]
    } else {
      param += '&' + key + '=' + curParam[key]
    }
  }
  uni.setStorageSync('pageUrl', param ? `/${curRoute}?${param}` : `/${curRoute}`)
}

// 删除当前路由地址
const removePreviousPage = () => {
  uni.removeStorageSync('pageUrl')
}


export { 
  cosThumb,
  formatTime,
  diffInMilliseconds,
  formatNumberToZeroString,
  timeDuration,
  get,
  phoneEncryption,
  phoneRegCheck,
  priceFormat,
  rpx2px,
  setPreviousPage,
  removePreviousPage
}
