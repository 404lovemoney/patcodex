export const navLinks = [
  { href: "#services", label: "服务" },
  { href: "#environment", label: "环境" },
  { href: "#process", label: "流程" },
  { href: "#pricing", label: "套餐" },
  { href: "#testimonials", label: "评价" },
  { href: "#booking", label: "预约" },
];

export const hero = {
  eyebrow: "温柔洗护 · 精细护理 · 可视化服务",
  title: "把毛孩子洗得干净，也照顾得安心。",
  copy: "沐绒为猫狗提供洗澡、修剪、皮毛护理和基础健康观察。每只宠物独立建档，洗护过程透明记录，给敏感、胆小、长毛宠物更细致的照看。",
  primaryAction: { href: "#pricing", label: "查看套餐" },
  secondaryAction: { href: "tel:400-836-8899", label: "电话咨询" },
  image: {
    src: "/assets/pet-spa-hero.png",
  },
  facts: [
    { value: "1:1", label: "专属护理师" },
    { value: "6步", label: "标准洗护流程" },
    { value: "30+", label: "皮毛状态记录项" },
  ],
};

export const services = {
  title: "常用服务",
  copy: "从日常清洁到造型护理，按宠物体型、毛量和状态安排时长，避免赶工式洗护。",
  items: [
    {
      icon: "⌘",
      title: "基础洗护",
      copy: "温和清洁、吹干梳毛、耳眼清洁、脚底护理和肛门腺检查，适合日常养护。",
    },
    {
      icon: "✦",
      title: "精修造型",
      copy: "根据品种、脸型和生活习惯设计造型，包含细节修剪、轮廓整理和毛发蓬松处理。",
    },
    {
      icon: "◎",
      title: "皮毛养护",
      copy: "针对掉毛、打结、干燥或敏感状态，提供深层梳理、护毛素和舒缓洗护建议。",
    },
  ],
};

export const environment = {
  title: "店内环境",
  copy: "以中式雅致、温润木石和西湖意境打造接待、洗护、造型休息三类空间，让宠物和主人都能放松停留。",
  slides: [
    {
      src: "/assets/store-environment-reception.png",
      alt: "中国高端宠物西湖店接待与零售休息区",
      title: "接待与零售休息区",
      copy: "弧形前台、温润木作与西湖山水墙面，搭配护理产品陈列和主人等候区。",
      tag: "Reception Lounge",
      label: "查看接待与零售休息区",
    },
    {
      src: "/assets/store-environment-spa.png",
      alt: "中国高端宠物西湖店洗护水疗区",
      title: "洗护水疗区",
      copy: "独立玻璃隔断、浅石材洗护台和低刺激照明，保持洁净、安静和可视化护理。",
      tag: "Hydro Spa Room",
      label: "查看洗护水疗区",
    },
    {
      src: "/assets/store-environment-styling.png",
      alt: "中国高端宠物西湖店造型与宠物休息区",
      title: "造型与宠物休息区",
      copy: "专业美容台衔接临窗休息榻，完成护理后可在柔软坐垫区短暂安抚与等待。",
      tag: "Styling Studio",
      label: "查看造型与宠物休息区",
    },
  ],
};

export const process = {
  title: "洗护流程",
  copy: "每一步都记录宠物状态，遇到皮肤红点、耳道异味、异常掉毛会及时提醒主人。",
  steps: [
    { number: "01", title: "到店评估", copy: "确认体重、性格、皮肤和毛结情况，制定护理时长。" },
    { number: "02", title: "温和清洁", copy: "按毛质选择洗护产品，重点处理爪缝、腹部和尾根。" },
    { number: "03", title: "低压吹护", copy: "分段吹干和梳理，减少噪音刺激，降低皮肤潮湿风险。" },
    { number: "04", title: "交付反馈", copy: "提供洗护记录、注意事项和下一次护理建议。" },
  ],
};

export const pricing = {
  title: "护理套餐",
  copy: "价格按宠物体型和毛量微调，到店评估后确认；会员可预约固定护理师。",
  plans: [
    {
      title: "轻盈洗护",
      copy: "适合短毛、小体型和常规清洁。",
      price: "99",
      featured: false,
      features: ["基础沐浴和吹干", "耳眼清洁", "脚底毛和指甲修护"],
    },
    {
      title: "精致全护",
      copy: "适合中长毛、换毛季和造型前护理。",
      price: "169",
      featured: true,
      badge: "热门",
      features: ["全套洗护流程", "深层梳毛去浮毛", "皮毛状态记录"],
    },
    {
      title: "造型养护",
      copy: "适合需要修剪、造型或打结处理的宠物。",
      price: "259",
      featured: false,
      features: ["造型设计和精修", "打结评估与处理", "护理师一对一沟通"],
    },
  ],
};

export const contactInfo = {
  eyebrow: "预约到店",
  title: "给宠物安排一次放松的洗护。",
  copy: "提交预约后，门店会在营业时间内联系确认宠物信息、护理师档期和到店时间。",
  details: [
    { label: "营业时间", value: "周一至周日 10:00 - 21:00" },
    { label: "门店地址", value: "上海市普陀区宜川路街道陕西北路 1620 号" },
    { label: "预约电话", value: "400-836-8899" },
  ],
};

export const testimonials = {
  title: "到店后的细节反馈",
  copy: "这些是基于门店服务场景整理的体验关键词，帮助第一次预约的主人快速了解护理过程。",
  items: [
    {
      keyword: "胆小犬友好",
      title: "先让宠物熟悉环境，再开始洗护。",
      quote:
        "到店后没有马上进洗护区，护理师先花了几分钟让狗狗闻一闻环境。整个过程节奏比较慢，吹风时也会分段停下来安抚。",
      author: "小型犬主人",
      tag: "基础洗护",
    },
    {
      keyword: "洗后不炸毛",
      title: "吹干和梳理做得更细，毛发不会蓬乱打结。",
      quote:
        "洗完后毛是蓬松的，但不是那种很炸的状态。耳后和腿侧这些容易打结的位置有单独梳开，回家后也比较好打理。",
      author: "长毛犬主人",
      tag: "皮毛养护",
    },
    {
      keyword: "透明记录",
      title: "能看到洗护中发现的小问题。",
      quote:
        "交付时会说清楚耳朵、脚底、皮肤和毛结的情况，不只是告诉我洗好了。下次需要注意哪里，也会写得比较具体。",
      author: "中型犬主人",
      tag: "状态记录",
    },
    {
      keyword: "猫咪低刺激",
      title: "减少噪音和等待，猫咪状态更稳定。",
      quote:
        "猫咪比较怕陌生环境，这次等待时间不长，吹干时声音控制得比较柔和。回家后没有一直躲起来，状态比预想稳定。",
      author: "长毛猫主人",
      tag: "猫咪护理",
    },
    {
      keyword: "造型自然",
      title: "修剪后保留宠物原本的脸型和习惯。",
      quote:
        "没有修成很夸张的样子，护理师会先问平时怎么遛、毛容易脏在哪里。最后造型比较清爽，也方便日常维护。",
      author: "泰迪主人",
      tag: "精修造型",
    },
    {
      keyword: "到店省心",
      title: "地址和预约确认都比较清楚。",
      quote:
        "预约后会确认到店时间和宠物情况，地图位置也好找。第一次去不用反复沟通，带宠物过去的压力小很多。",
      author: "首次到店主人",
      tag: "预约体验",
    },
  ],
};

export const storeMap = {
  title: "陕西北路 1620 号，带毛孩子来这里。",
  copy: "清爽薄荷色的手绘地图标出了门店所在位置，到店前可直接打开地图搜索导航。",
  name: "沐绒宠物洗护",
  address: "上海市普陀区宜川路街道陕西北路 1620 号",
  mapUrl:
    "https://uri.amap.com/marker?markers=121.4396,31.2449,%E6%B2%90%E7%BB%92%20Pet%20Spa%EF%BC%88%E9%99%95%E8%A5%BF%E5%8C%97%E8%B7%AF1620%E5%8F%B7%EF%BC%89&src=murong-pet-care&callnative=1",
  image: {
    src: "/assets/pet-spa-location-map.png",
    alt: "清新可爱的沐绒 Pet Spa 来店地图，门店位于长寿健康主题公园北侧、陕西北路附近",
    previewAlt: "清新可爱的沐绒 Pet Spa 来店地图大图",
    width: 1254,
    height: 1254,
  },
};
