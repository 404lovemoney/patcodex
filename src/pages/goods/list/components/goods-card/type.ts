export const goodsCardProps = {
  id: {
    type: String,
    default: '',
  },
  data: {
    type: Object as PropType<any>,
  },
  currency: {
    type: String,
    default: '¥',
  },
  thresholds: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
}
