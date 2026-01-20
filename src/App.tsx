import { ChatWidget } from './ChatWidget';

function App() {
  return (
    <div className="app">
      <div className="shell">
        <header className="hero">
          <span className="eyebrow">Org Design Studio</span>
          <h1>Build clear org structures that grow with your HR tech business.</h1>
          <p>
            Use the assistant to draft roles, reporting lines, and rollout plans.
            Designed for fast iteration with guided prompts and interactive widgets.
          </p>
          <div className="pill-row">
            <span className="pill">15-120 headcount</span>
            <span className="pill">Sales, Ops, HR, Finance</span>
            <span className="pill">Multi-entity ready</span>
          </div>
        </header>
        <section className="insights">
          <article className="insight-card">
            <h3>Start with the motion</h3>
            <p>Pick PLG, Sales-led, or Services to shape the right structure.</p>
          </article>
          <article className="insight-card">
            <h3>Keep spans realistic</h3>
            <p>Balance workload across teams with clear reporting lines.</p>
          </article>
          <article className="insight-card">
            <h3>Move fast, document later</h3>
            <p>Use the output as a draft for your next org review.</p>
          </article>
        </section>
        <section className="chat-area">
          <ChatWidget />
        </section>
      </div>
    </div>
  );
}

export default App;
