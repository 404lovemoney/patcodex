// import { get, post } from '@/utils/request'
import { API_DOMAINS, http } from '@/http/request/alova'

export interface messageDetailParams {
  id: number  // ID
}

export interface messageListParams {
    pageSize: number // 每页条数
    page: number // 页码
  }

// 站内信列表
export const fetchMessageList = async (params: messageListParams): Promise<any> => {
  console.log('fetchMessageList-----------')
  return http.Get('/message/list', { params })
}

// 站内信详情
export const fetchMessageDetail = async (params: messageDetailParams): Promise<any> => {
  console.log('fetchMessageDetail-----------')
  console.log('params', params)
  return http.Get('/message/detail', {
    params
  })
}




