import React from 'react';

export const Contact: React.FC = () => (
  <section className="section" id="contact">
    <div className="container grid two">
      <div className="reveal">
        <h2>Contact</h2>
        <p>Have a project in mind or just want to say hi? My inbox is open.</p>
        <div className="contact-cards">
          <a className="card link-card" href="mailto:prasannakulal18@gmail.com">
            <div>
              <h3>Email</h3>
              <p>prasannakulal18@gmail.com</p>
            </div>
            <span className="icon">→</span>
          </a>
          <a className="card link-card" href="https://www.linkedin.com/in/prasanna-kulal-1887b329a/" target="_blank" rel="noopener">
            <div>
              <h3>LinkedIn</h3>
              <p>Connect professionally</p>
            </div>
            <span className="icon">↗</span>
          </a>
          <a className="card link-card" href="https://github.com/Prasannakulal" target="_blank" rel="noopener">
            <div>
              <h3>GitHub</h3>
              <p>Explore my code</p>
            </div>
            <span className="icon">↗</span>
          </a>
        </div>
      </div>
      <div className="reveal">
        <ContactForm />
      </div>
    </div>
  </section>
);

const ContactForm: React.FC = () => {
  const [state, setState] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    setState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed');
      setState('sent');
      form.reset();
    } catch (err) {
      setState('error');
    }
  };
  return (
    <form className="card contact-form" onSubmit={onSubmit}>
      <label>
        <span>Name</span>
        <input type="text" name="name" placeholder="Your name" required />
      </label>
      <label>
        <span>Email</span>
        <input type="email" name="email" placeholder="you@example.com" required />
      </label>
      <label>
        <span>Message</span>
        <textarea name="message" rows={5} placeholder="How can I help?" required />
      </label>
      <button className="btn primary" type="submit" disabled={state==='sending'}>
        {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Sent ✓' : 'Send'}
      </button>
      {state === 'error' && <p style={{ color: '#f87171', marginTop: 8 }}>Could not send. Please email me directly.</p>}
    </form>
  );
};


