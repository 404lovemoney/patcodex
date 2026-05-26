import { pricing } from "../config/home";

export function Pricing() {
  return (
    <section id="pricing">
      <div className="section-inner">
        <div className="section-head">
          <h2>{pricing.title}</h2>
          <p>{pricing.copy}</p>
        </div>
        <div className="pricing-grid">
          {pricing.plans.map((plan) => (
            <article className={`price-card ${plan.featured ? "featured" : ""}`} key={plan.title}>
              {plan.badge ? <span className="tag">{plan.badge}</span> : null}
              <h3>{plan.title}</h3>
              <p>{plan.copy}</p>
              <div className="price">
                <small>￥</small>
                <strong>{plan.price}</strong>
                <small>起</small>
              </div>
              <ul className="features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <a className={`btn ${plan.featured ? "secondary" : ""}`} href="#booking">
                选择套餐
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
