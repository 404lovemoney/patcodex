import { BookingForm } from "./components/BookingForm";
import { ContactInfo } from "./components/ContactInfo";
import { EnvironmentCarousel } from "./components/EnvironmentCarousel";
import { Hero } from "./components/Hero";
import { MapLightbox } from "./components/MapLightbox";
import { Pricing } from "./components/Pricing";
import { Process } from "./components/Process";
import { Services } from "./components/Services";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { environment, navLinks, storeMap } from "./config/home";

export default function Home() {
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
            {navLinks.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <a className="btn secondary" href="#booking">
            立即预约
          </a>
          <ThemeSwitcher />
        </nav>
      </header>

      <main id="top">
        <Hero />

        <Services />

        <section className="environment" id="environment" aria-label="店内环境">
          <div className="section-inner">
            <div className="section-head">
              <h2>{environment.title}</h2>
              <p>{environment.copy}</p>
            </div>
            <EnvironmentCarousel slides={environment.slides} />
          </div>
        </section>

        <Process />

        <Pricing />

        <section className="booking" id="booking">
          <div className="section-inner booking-layout">
            <ContactInfo />
            <BookingForm />
            <div className="store-map" aria-label="沐绒宠物洗护门店地图">
              <div className="map-copy">
                <p className="eyebrow">门店位置</p>
                <h3>{storeMap.title}</h3>
                <p>{storeMap.copy}</p>
                <div className="map-address">
                  <span>{storeMap.name}</span>
                  <strong>{storeMap.address}</strong>
                </div>
                <a className="btn secondary" href={storeMap.mapUrl} target="_blank" rel="noopener">
                  打开高德地图
                </a>
              </div>
              <MapLightbox />
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
