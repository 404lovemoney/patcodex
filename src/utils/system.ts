// 同步获取系统信息
const SYSTEM_INFO = uni.getSystemInfoSync()

// 顶部状态栏高度
export const getStatusBarHeight = ()=> SYSTEM_INFO?.statusBarHeight || 0

// 标题栏高度
export const getTitleBarHeight = ()=> {
    if (uni.getMenuButtonBoundingClientRect) {
        let {top, height} = uni.getMenuButtonBoundingClientRect()
        return height + (top - getStatusBarHeight())*2
    } else {
        return 40
    }
}

// 导航栏总高度
export const getNavBarHeight = ()=> getStatusBarHeight() + getTitleBarHeight()


