import { services } from "../config/home";

export function Services() {
  return (
    <section id="services">
      <div className="section-inner">
        <div className="section-head">
          <h2>{services.title}</h2>
          <p>{services.copy}</p>
        </div>
        <div className="services-grid">
          {services.items.map((service) => (
            <article className="service" key={service.title}>
              <div className="service-icon" aria-hidden="true">
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p>{service.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
