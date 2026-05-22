import { cdnBase, config } from '../../config/index'
import { genSwiperImageList } from '../../model/swiper'
import { delay } from '../_utils/delay'

/** 获取首页数据 */
function mockFetchHome(): Promise<any> {
  return delay().then(() => {
    return {
      swiper: genSwiperImageList(),
      tabList: [
        {
          label: '数码3C',
          value: 1,
        },
        {
          label: 'OV专区',
          value: 2,
        },
        {
          label: '华为专区',
          value: 3,
        },
        {
          label: '品牌家电',
          value: 4,
        },
        {
          label: '小米专区',
          value: 5,
        },
      ],
      activityImg: `${cdnBase}/activity/banner.png`,
    }
  })
}

/** 获取首页数据 */
export function fetchHome(): Promise<any> {
  if (config.useMock) {
    return mockFetchHome()
  }
  return new Promise((resolve) => {
    resolve('real api')
  })
}
