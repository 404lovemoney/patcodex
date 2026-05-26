import { hero, services, storeMap } from "./home";

export const siteSeo = {
  name: "沐绒宠物洗护",
  title: "沐绒宠物洗护｜上海普陀宠物洗澡、美容造型与护理预约",
  description: "沐绒宠物洗护提供猫狗洗澡、精修造型、皮毛养护和可视化护理记录，门店位于上海市普陀区陕西北路 1620 号。",
  locale: "zh_CN",
  ogImage: {
    src: hero.image.src,
    width: 1718,
    height: 916,
    alt: "沐绒宠物洗护门店首屏图",
  },
};

export const localBusiness = {
  name: siteSeo.name,
  telephone: "400-836-8899",
  priceRange: "￥￥",
  address: {
    streetAddress: "陕西北路 1620 号",
    addressLocality: "上海市",
    addressRegion: "上海市",
    addressCountry: "CN",
  },
  openingHours: ["Mo-Su 10:00-21:00"],
  areaServed: ["上海市普陀区", "宜川路街道", "长寿路周边社区", "陕西北路周边社区"],
  services: services.items.map((service) => service.title),
  mapUrl: storeMap.mapUrl,
};
