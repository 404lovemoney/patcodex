import { process } from "../config/home";

export function Process() {
  return (
    <section className="process" id="process">
      <div className="section-inner">
        <div className="section-head">
          <h2>{process.title}</h2>
          <p>{process.copy}</p>
        </div>
        <div className="steps">
          {process.steps.map((step) => (
            <article className="step" key={step.number}>
              <span className="step-num">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
