// import { get, post } from '@/utils/request'
import { API_DOMAINS, http } from '@/http/request/alova'

export interface homeInfoResponse {
}

// 首页数据
export const fetchHomeInfo = async (): Promise<homeInfoResponse> => {
  console.log('fetchHomeInfo-----------')
  return http.Get<homeInfoResponse>('/index/index')
}

