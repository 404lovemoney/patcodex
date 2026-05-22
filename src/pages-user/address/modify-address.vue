<route lang="jsonc" type="page">
  {
    "layout": "default",
    "style": {
      "navigationBarTitleText": "修改地址"
    }
  }
</route>

<script lang="ts" setup>
defineOptions({
  name: 'Modify Address',
})

import { isArray } from 'wot-design-uni/components/common/util'
import { FormRules } from 'wot-design-uni/components/wd-form/types'
import { useToast, useMessage } from 'wot-design-uni'
import { reactive, ref } from 'vue'

import { updateUserAddress } from '@/api/address';

// useColPickerData可以参考本章节顶部的介绍
// 导入路径根据自己实际情况调整，万不可一贴了之
import { useColPickerData } from '@/hooks/useColPickerData'
const { colPickerData, findChildrenByCode } = useColPickerData()


onLoad(async (option) => {
  // 获取路由参数
  const data = JSON.parse(decodeURIComponent(option.data));
  console.log('options data', data);
  if (data.id) {
    model.id = data.id
    model.userId = data.userId
    model.contactName = data.contactName
    model.contactPhone = data.contactPhone
    model.province = data.province
    model.city = data.city
    model.district = data.district
    model.detailAddress = data.detailAddress
    model.switchVal = data.isDefault === 1 ? true : false
    model.areaValues = data.areaValues

    model.address = data.areaValues.split(',')
    
    console.log('address', model.address, model.address.length);

    init()
  }
})


onMounted(async () => {
  console.log('address', model.address);
  area.value = [
    colPickerData.map((item) => {
      return {
        value: item.value,
        label: item.text
      }
    }),
    findChildrenByCode(colPickerData, model['address'][0])!.map((item) => {
      return {
        value: item.value,
        label: item.text
      }
    }),
    findChildrenByCode(colPickerData, model['address'][1])!.map((item) => {
      return {
        value: item.value,
        label: item.text
      }
    })
  ]
})


const model = reactive<{
  id: number,
  userId: number,
  contactName: string
  contactPhone: string
  province: string,
  city: string,
  district: string,
  detailAddress: string,
  address: string[],
  areaValues: string,
  switchVal: boolean
}>({
  id: null,
  userId: null,
  contactName: '',
  contactPhone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  address: [],
  areaValues: '',
  switchVal: false
})

const rules: FormRules = {
  contactName: [
    {
      required: true,
      message: '请输入收件人姓名',
      validator: (value) => {
        if (value) {
          return Promise.resolve()
        } else {
          return Promise.reject('请输入收件人姓名')
        }
      }
    }
  ],
  contactPhone: [
    {
      required: true,
      message: '请填写手机号',
      validator: (value) => {
        if (value && value.length === 11) {
          return Promise.resolve()
        } else {
          return Promise.reject('请填写正确的手机号')
        }
      }
    }
  ],
  address: [
    {
      required: true,
      message: '请选择地址',
      validator: (value) => {
        if (isArray(value) && value.length) {
          return Promise.resolve()
        } else {
          return Promise.reject('请选择地址')
        }
      }
    }
  ],
  detailAddress: [
    {
      required: true,
      message: '请输入详细地址',
      validator: (value) => {
        if (value) {
          return Promise.resolve()
        } else {
          return Promise.reject()
        }
      }
    }
  ],
}

const init = () => {
  console.log('init----------------');
  console.log(model['address'][0], model['address'][1])
  console.log(typeof model['address'][0])

}

const area = ref<any[]>([])

const ColPickerColumnChange = ({ selectedItem, resolve, finish }) => {
  const areaData = findChildrenByCode(colPickerData, selectedItem.value)
  if (areaData && areaData.length) {
    resolve(
      areaData.map((item) => {
        return {
          value: item.value,
          label: item.text
        }
      })
    )
  } else {
    finish()
  }
}

const form = ref()


function handleSubmit() {
  form.value
    .validate()
    .then(({ valid, errors }) => {
      console.log(valid)
      console.log(errors)
      console.log('model',model)
      // 校验通过，调用接口
      if (valid && errors.length < 1) {
        updateUserAddressApi()
      }
    })
    .catch((error) => {
      console.log(error, 'error')
    })
}


// 调用创建地址接口
const updateUserAddressApi = async ()=> {
  const res = await updateUserAddress({
    id: model.id,
    userId: model.userId,
    contactName: model.contactName,
    contactPhone: model.contactPhone,
    province: model.province,
    city: model.city,
    district: model.district,
    detailAddress: model.detailAddress,
    isDefault: model.switchVal ? 1: 0,
    areaValues: model.areaValues
  })

  uni.showToast({
    title: '修改成功'
  })

  // 返回地址列表页
  uni.navigateTo({
    url: `/pages-user/address/list`,
  })
}

// 填充省市区的名字
function handleConfirm({ value, selectedItems }) {
  console.log(value, selectedItems)
  model.province = selectedItems[0].label
  model.city = selectedItems[1].label
  model.district = selectedItems[2].label
  console.log('province', model.province);
  console.log('city', model.city);
  console.log('district', model.district);
  model.areaValues = value.join()
  console.log('areaValues', model.areaValues)
}

</script>

<template>
  <view class="content">

    <wd-form ref="form" :model="model" :rules="rules">
      <wd-cell-group custom-class="group" border>
        <wd-input
          label="收件人"
          label-width="100px"
          prop="contactName"
          required
          clearable
          v-model="model.contactName"
          placeholder="请输入收件人"
        />
      </wd-cell-group>
      <wd-cell-group custom-class="group" border>  
        <wd-input
          label="手机号"
          label-width="100px"
          prop="contactPhone"
          required
          clearable
          v-model="model.contactPhone"
          placeholder="请输入手机号"
        />
      </wd-cell-group>
      <wd-cell-group custom-class="group" border>
        <wd-col-picker
          v-if="area.length === 3"
          label="所在地区"
          placeholder="点击选择地址"
          label-width="100px"
          prop="address"
          v-model="model.address"
          :columns="area"
          :column-change="ColPickerColumnChange"
          @confirm="handleConfirm"
        />

        <wd-input
          label="详细地址"
          label-width="100px"
          prop="detailAddress"
          required
          clearable
          v-model="model.detailAddress"
          placeholder="详细的地址，如道路、小区、门牌号等"
        />
        <wd-cell title="默认地址" title-width="100px" prop="switchVal" center>
          <view style="text-align: left">
            <wd-switch v-model="model.switchVal" />
          </view>
        </wd-cell>
      </wd-cell-group>
      <view class="footer">
        <wd-button type="primary" size="large" @click="handleSubmit" block>保存地址</wd-button>
      </view>
    </wd-form>

  </view>
</template>

<style lang="scss">
// 深度选择器修改 uni-data-picker 组件样式
// :deep(.selected-area) {
//   flex: 0 1 auto;
//   height: auto;
// }

page {
  background-color: #f4f4f4;
}

.content {
  margin: 20rpx 20rpx 0;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;
}

</style>
