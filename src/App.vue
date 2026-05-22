<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { usePageAuth } from '@/hooks/usePageAuth'
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'

usePageAuth()
let bgm: UniApp.InnerAudioContext | null = null

const playBackgroundMusic = () => {
  if (bgm && bgm.paused === false) return

  if (!bgm) {
    bgm = uni.createInnerAudioContext()
    bgm.src = '/static/audio/base.mp3'
    bgm.loop = true
    bgm.autoplay = true
    bgm.onError((err) => console.error('音乐播放失败:', err))
  }

  bgm.play()
  uni.setStorageSync('bgmPlaying', true)
}

const pauseBackgroundMusic = () => {
  if (bgm) {
    bgm.pause()
    uni.setStorageSync('bgmPlaying', false)
  }
}

onLaunch(() => {
  console.log('App Launch --------')
  // uni.loadFontFace({
  //   family: 'fzhzgb',
  //   source: 'url("https://huohua.daoyinshu.com/huohuayouxuan/font/fzhzgb.ttf")',
  //   global: true, // 设置为true 全局生效
  //   success() {
  //     console.log('success')
  //   }
  // })
  const isPlaying = uni.getStorageSync('bgmPlaying')
  if (isPlaying) playBackgroundMusic()
})
onShow(() => {
  console.log('App Show')
   const isPlaying = uni.getStorageSync('bgmPlaying')
  if (isPlaying || isPlaying === '') playBackgroundMusic()
})
onHide(() => {
  console.log('App Hide')
})

</script>

<style lang="scss">
// @import './style/iconfont.css';
@import './pages-order/source/fz.css';

// @font-face {
//   font-family: 'fzhzgb';
//   src: url('./pages-order/source/fzhzgb.ttf');
// }

body {
  font-family: 'Microsoft YaHei', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif';
  font-size: 16rpx;
  color: #333;
}
swiper,
scroll-view {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

image {
  width: 100%;
  height: 100%;
  vertical-align: middle;
}

/* 解决小程序和app滚动条的问题 */
/* #ifdef MP-WEIXIN || APP-PLUS */
  ::-webkit-scrollbar {
    display: none;
    width: 0 !important;
    height: 0 !important;
    -webkit-appearance: none;
    background: transparent;
    color: transparent;
  }
/* #endif */

/* 解决H5的问题 */
/* #ifdef H5 */
  uni-scroll-view .uni-scroll-view::-webkit-scrollbar {
    display: none;
    width: 0 !important;
    height: 0 !important;
    -webkit-appearance: none;
    background: transparent;
    color: transparent;
  }
/*#endif */
</style>
