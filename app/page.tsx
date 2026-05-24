"use client";

import { FormEvent, useEffect, useState } from "react";

const slides = [
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
];

export default function Home() {
  const [active, setActive] = useState(0);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [bookingMessage, setBookingMessage] = useState("");

  const showSlide = (index: number) => {
    setActive((index + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setBookingStatus("submitting");
    setBookingMessage("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          email: formData.get("email"),
          pet: formData.get("pet"),
          service: formData.get("service"),
          appointmentDate: formData.get("appointmentDate"),
          appointmentTime: formData.get("appointmentTime"),
          message: formData.get("message"),
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "预约提交失败，请稍后再试");
      }

      form.reset();
      setBookingStatus("success");
      setBookingMessage("预约已提交，门店会尽快联系您确认到店时间。");
    } catch (error) {
      setBookingStatus("error");
      setBookingMessage(error instanceof Error ? error.message : "预约提交失败，请稍后再试");
    }
  };

  return (
    <>
      <header className="site-header">
        <nav className="nav" aria-label="主导航">
          <a className="brand" href="#top" aria-label="沐绒宠物洗护首页">
            <span className="brand-mark" aria-hidden="true">
              ⌁
            </span>
            <span>沐绒宠物洗护</span>
          </a>
          <div className="nav-links">
            <a href="#services">服务</a>
            <a href="#environment">环境</a>
            <a href="#process">流程</a>
            <a href="#pricing">套餐</a>
            <a href="#booking">预约</a>
          </div>
          <a className="btn secondary" href="#booking">
            立即预约
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-label="沐绒宠物洗护首屏">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">温柔洗护 · 精细护理 · 可视化服务</p>
              <h1>把毛孩子洗得干净，也照顾得安心。</h1>
              <p>
                沐绒为猫狗提供洗澡、修剪、皮毛护理和基础健康观察。每只宠物独立建档，洗护过程透明记录，给敏感、胆小、长毛宠物更细致的照看。
              </p>
              <div className="hero-actions">
                <a className="btn secondary" href="#pricing">
                  查看套餐
                </a>
                <a className="btn" href="tel:400-836-8899">
                  电话咨询
                </a>
              </div>
              <div className="hero-facts" aria-label="服务亮点">
                <div className="fact">
                  <strong>1:1</strong>
                  <span>专属护理师</span>
                </div>
                <div className="fact">
                  <strong>6步</strong>
                  <span>标准洗护流程</span>
                </div>
                <div className="fact">
                  <strong>30+</strong>
                  <span>皮毛状态记录项</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services">
          <div className="section-inner">
            <div className="section-head">
              <h2>常用服务</h2>
              <p>从日常清洁到造型护理，按宠物体型、毛量和状态安排时长，避免赶工式洗护。</p>
            </div>
            <div className="services-grid">
              <article className="service">
                <div className="service-icon" aria-hidden="true">
                  ⌘
                </div>
                <h3>基础洗护</h3>
                <p>温和清洁、吹干梳毛、耳眼清洁、脚底护理和肛门腺检查，适合日常养护。</p>
              </article>
              <article className="service">
                <div className="service-icon" aria-hidden="true">
                  ✦
                </div>
                <h3>精修造型</h3>
                <p>根据品种、脸型和生活习惯设计造型，包含细节修剪、轮廓整理和毛发蓬松处理。</p>
              </article>
              <article className="service">
                <div className="service-icon" aria-hidden="true">
                  ◎
                </div>
                <h3>皮毛养护</h3>
                <p>针对掉毛、打结、干燥或敏感状态，提供深层梳理、护毛素和舒缓洗护建议。</p>
              </article>
            </div>
          </div>
        </section>

        <section className="environment" id="environment" aria-label="店内环境">
          <div className="section-inner">
            <div className="section-head">
              <h2>西湖店环境</h2>
              <p>以中式雅致、温润木石和西湖意境打造接待、洗护、造型休息三类空间，让宠物和主人都能放松停留。</p>
            </div>
            <div className="environment-carousel">
              <div
                className="environment-track"
                style={{ transform: `translateX(-${active * 100}%)` }}
              >
                {slides.map((slide) => (
                  <figure className="environment-slide" key={slide.src}>
                    <img src={slide.src} alt={slide.alt} />
                    <figcaption>
                      <div>
                        <h3>{slide.title}</h3>
                        <p>{slide.copy}</p>
                      </div>
                      <span className="environment-tag">{slide.tag}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
              <button
                className="carousel-control prev"
                type="button"
                aria-label="上一张店内环境图"
                onClick={() => showSlide(active - 1)}
              >
                ‹
              </button>
              <button
                className="carousel-control next"
                type="button"
                aria-label="下一张店内环境图"
                onClick={() => showSlide(active + 1)}
              >
                ›
              </button>
              <div className="carousel-dots" aria-label="店内环境轮播分页">
                {slides.map((slide, index) => (
                  <button
                    className={index === active ? "is-active" : undefined}
                    type="button"
                    aria-label={slide.label}
                    key={slide.label}
                    onClick={() => showSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="process" id="process">
          <div className="section-inner">
            <div className="section-head">
              <h2>洗护流程</h2>
              <p>每一步都记录宠物状态，遇到皮肤红点、耳道异味、异常掉毛会及时提醒主人。</p>
            </div>
            <div className="steps">
              <article className="step">
                <span className="step-num">01</span>
                <h3>到店评估</h3>
                <p>确认体重、性格、皮肤和毛结情况，制定护理时长。</p>
              </article>
              <article className="step">
                <span className="step-num">02</span>
                <h3>温和清洁</h3>
                <p>按毛质选择洗护产品，重点处理爪缝、腹部和尾根。</p>
              </article>
              <article className="step">
                <span className="step-num">03</span>
                <h3>低压吹护</h3>
                <p>分段吹干和梳理，减少噪音刺激，降低皮肤潮湿风险。</p>
              </article>
              <article className="step">
                <span className="step-num">04</span>
                <h3>交付反馈</h3>
                <p>提供洗护记录、注意事项和下一次护理建议。</p>
              </article>
            </div>
          </div>
        </section>

        <section id="pricing">
          <div className="section-inner">
            <div className="section-head">
              <h2>护理套餐</h2>
              <p>价格按宠物体型和毛量微调，到店评估后确认；会员可预约固定护理师。</p>
            </div>
            <div className="pricing-grid">
              <article className="price-card">
                <h3>轻盈洗护</h3>
                <p>适合短毛、小体型和常规清洁。</p>
                <div className="price">
                  <small>￥</small>
                  <strong>99</strong>
                  <small>起</small>
                </div>
                <ul className="features">
                  <li>基础沐浴和吹干</li>
                  <li>耳眼清洁</li>
                  <li>脚底毛和指甲修护</li>
                </ul>
                <a className="btn" href="#booking">
                  选择套餐
                </a>
              </article>
              <article className="price-card featured">
                <span className="tag">热门</span>
                <h3>精致全护</h3>
                <p>适合中长毛、换毛季和造型前护理。</p>
                <div className="price">
                  <small>￥</small>
                  <strong>169</strong>
                  <small>起</small>
                </div>
                <ul className="features">
                  <li>全套洗护流程</li>
                  <li>深层梳毛去浮毛</li>
                  <li>皮毛状态记录</li>
                </ul>
                <a className="btn secondary" href="#booking">
                  选择套餐
                </a>
              </article>
              <article className="price-card">
                <h3>造型养护</h3>
                <p>适合需要修剪、造型或打结处理的宠物。</p>
                <div className="price">
                  <small>￥</small>
                  <strong>259</strong>
                  <small>起</small>
                </div>
                <ul className="features">
                  <li>造型设计和精修</li>
                  <li>打结评估与处理</li>
                  <li>护理师一对一沟通</li>
                </ul>
                <a className="btn" href="#booking">
                  选择套餐
                </a>
              </article>
            </div>
          </div>
        </section>

        <section className="booking" id="booking">
          <div className="section-inner booking-layout">
            <aside className="contact-panel">
              <p className="eyebrow">预约到店</p>
              <h2>给宠物安排一次放松的洗护。</h2>
              <p>提交预约后，门店会在营业时间内联系确认宠物信息、护理师档期和到店时间。</p>
              <div className="contact-list">
                <div>
                  <span>营业时间</span>
                  <strong>周一至周日 10:00 - 21:00</strong>
                </div>
                <div>
                  <span>门店地址</span>
                  <strong>上海市普陀区宜川路街道陕西北路 1620 号</strong>
                </div>
                <div>
                  <span>预约电话</span>
                  <strong>400-836-8899</strong>
                </div>
              </div>
            </aside>
            <form className="booking-form" onSubmit={submitBooking}>
              <div className="field">
                <label htmlFor="name">您的称呼</label>
                <input id="name" name="name" type="text" placeholder="例如：林小姐" required />
              </div>
              <div className="field">
                <label htmlFor="phone">联系电话</label>
                <input id="phone" name="phone" type="tel" placeholder="用于确认预约" required />
              </div>
              <div className="field">
                <label htmlFor="email">电子邮箱</label>
                <input id="email" name="email" type="email" placeholder="可选，用于接收确认信息" />
              </div>
              <div className="field">
                <label htmlFor="pet">宠物类型</label>
                <select id="pet" name="pet">
                  <option>小型犬</option>
                  <option>中大型犬</option>
                  <option>猫咪</option>
                  <option>其他宠物</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="service">预约服务</label>
                <select id="service" name="service">
                  <option>精致全护</option>
                  <option>轻盈洗护</option>
                  <option>造型养护</option>
                  <option>到店评估</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="appointmentDate">期望日期</label>
                <input id="appointmentDate" name="appointmentDate" type="date" />
              </div>
              <div className="field">
                <label htmlFor="appointmentTime">期望时间</label>
                <input id="appointmentTime" name="appointmentTime" type="time" />
              </div>
              <div className="field full">
                <label htmlFor="message">宠物情况</label>
                <textarea id="message" name="message" placeholder="例如：泰迪，5kg，有轻微打结，比较怕吹风" />
              </div>
              <div className="field full">
                <button className="btn secondary" type="submit" disabled={bookingStatus === "submitting"}>
                  {bookingStatus === "submitting" ? "提交中..." : "提交预约"}
                </button>
                {bookingMessage ? (
                  <p className={`form-message ${bookingStatus === "error" ? "is-error" : "is-success"}`} role="status">
                    {bookingMessage}
                  </p>
                ) : null}
              </div>
            </form>
            <div className="store-map" aria-label="沐绒宠物洗护门店地图">
              <div className="map-copy">
                <p className="eyebrow">门店位置</p>
                <h3>陕西北路 1620 号，带毛孩子来这里。</h3>
                <p>清爽薄荷色的手绘地图标出了门店所在位置，到店前可直接打开地图搜索导航。</p>
                <div className="map-address">
                  <span>沐绒宠物洗护</span>
                  <strong>上海市普陀区宜川路街道陕西北路 1620 号</strong>
                </div>
                <a
                  className="btn secondary"
                  href="https://uri.amap.com/marker?markers=121.4396,31.2449,%E6%B2%90%E7%BB%92%20Pet%20Spa%EF%BC%88%E9%99%95%E8%A5%BF%E5%8C%97%E8%B7%AF1620%E5%8F%B7%EF%BC%89&src=murong-pet-care&callnative=1"
                  target="_blank"
                  rel="noopener"
                >
                  打开高德地图
                </a>
              </div>
              <div className="illustrated-map location-map-frame">
                <img
                  className="location-map-image"
                  src="/assets/pet-spa-location-map.png"
                  alt="清新可爱的沐绒 Pet Spa 来店地图，门店位于长寿健康主题公园北侧、陕西北路附近"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>© 2026 沐绒宠物洗护</span>
          <span>清洁、护理、造型与宠物状态记录</span>
        </div>
      </footer>
    </>
  );
}
