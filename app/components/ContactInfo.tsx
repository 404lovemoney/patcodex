import { contactInfo } from "../config/home";

export function ContactInfo() {
  return (
    <aside className="contact-panel">
      <p className="eyebrow">{contactInfo.eyebrow}</p>
      <h2>{contactInfo.title}</h2>
      <p>{contactInfo.copy}</p>
      <div className="contact-list">
        {contactInfo.details.map((detail) => (
          <div key={detail.label}>
            <span>{detail.label}</span>
            <strong>{detail.value}</strong>
          </div>
        ))}
      </div>
    </aside>
  );
}
