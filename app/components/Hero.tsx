import Image from "next/image";
import { hero } from "../config/home";

export function Hero() {
  return (
    <section className="hero" aria-label="沐绒宠物洗护首屏">
      <Image
        className="hero-media"
        src={hero.image.src}
        alt=""
        fill
        priority
        sizes="100vw"
        aria-hidden="true"
      />
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>{hero.title}</h1>
          <p>{hero.copy}</p>
          <div className="hero-actions">
            <a className="btn secondary" href={hero.primaryAction.href}>
              {hero.primaryAction.label}
            </a>
            <a className="btn" href={hero.secondaryAction.href}>
              {hero.secondaryAction.label}
            </a>
          </div>
          <div className="hero-facts" aria-label="服务亮点">
            {hero.facts.map((fact) => (
              <div className="fact" key={fact.label}>
                <strong>{fact.value}</strong>
                <span>{fact.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
