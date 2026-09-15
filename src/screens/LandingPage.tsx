import { Check } from 'lucide-react';

interface LandingPageProps { onEnterApp: () => void; }

const steps = [
  ['01', 'Paste the note', 'Drop in your consult note, or start from a blank form. AHTR reads subjective, objective, plan and goals the way you wrote them.'],
  ['02', 'Check the answers', "Every field is shown for your review. Anything your note didn't cover stays blank — nothing is invented for you."],
  ['03', 'Download and sign', "Get the scheme's own PDF, filled and ready for your final review, signature and submission."],
];
const sources = [
  ['From my consult notes', 'Paste the note you already wrote for the file.'],
  ['From Cliniko', 'Choose a patient appointment and pull the associated consultation notes.'],
  ['Blank form', "Use guided fields when there's no note to work from."],
];
const trust = [
  ['Nothing invented', "If a field isn't in your note, it stays empty for you to answer."],
  ['You review every answer', 'The PDF is generated only after you have checked the mapped information.'],
  ['Read-only Cliniko import', 'The current Cliniko workflow imports information and does not write changes back.'],
  ['Easy to correct', 'Every generated answer remains editable before you create the PDF.'],
];

export function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="marketing-page">
      <header className="marketing-header">
        <a className="marketing-wordmark" href="#top">AHTR <span>Assist</span></a>
        <nav aria-label="Website navigation">
          <a href="#how">How it works</a><a href="#cliniko">Cliniko</a><a href="#drafts">Drafts</a><a href="#trust">Your data</a>
        </nav>
        <div className="marketing-actions">
          <button className="marketing-secondary" type="button" onClick={onEnterApp}>Log in</button>
          <button className="marketing-primary" type="button" onClick={onEnterApp}>Try the demo</button>
        </div>
      </header>

      <main id="top">
        <section className="marketing-hero">
          <div>
            <p className="marketing-kicker">Allied health treatment requests</p>
            <h1>Get your weekends back from insurer paperwork.</h1>
            <p className="marketing-lead">AHTR Assist helps physiotherapists and chiropractors turn consult notes into completed treatment requests. Review and edit every answer, then generate a ready-to-sign PDF.</p>
            <div className="marketing-hero-actions">
              <button className="marketing-primary marketing-primary--large" type="button" onClick={onEnterApp}>Try the demo</button>
              <a className="marketing-secondary marketing-secondary--large" href="#how">See how it works</a>
            </div>
            <div className="scheme-badges" aria-label="Supported schemes">
              {['SIRA NSW', 'WorkSafe Victoria', 'WorkCover Queensland', 'ReturnToWork SA', 'WorkCover WA'].map((badge) => <span key={badge}>{badge}</span>)}
            </div>
          </div>
          <figure className="workflow-figure" aria-label="Consult note to completed PDF workflow">
            <div className="workflow-panel"><b><em>01</em> Your note</b><div className="note-lines">{[92,74,84,58,80,66].map((width, index) => <i key={width} className={index === 1 || index === 3 ? 'is-highlighted' : ''} style={{ width: `${width}%`, animationDelay: `${index * .15 + .1}s` }} />)}</div></div>
            <div className="workflow-panel"><b><em>02</em> Mapped answers</b>{['Diagnosis', 'Treatment to date', 'Sessions requested'].map((label, index) => <div className="mapped-field" key={label}><span>{label}</span><i><u style={{ animationDelay: `${index * .4 + 1.2}s` }} /></i></div>)}</div>
            <div className="workflow-panel"><b><em>03</em> Completed PDF</b><div className="mini-pdf"><i /><i /><i /><i /></div><span className="ready-chip"><Check size={12} /> Ready to sign</span></div>
          </figure>
        </section>

        <section className="marketing-section" id="how">
          <p className="marketing-kicker">How it works</p><h2>Note in, form out</h2>
          <p className="section-intro">Paste your notes, check the answers and generate the form. You still review and sign off on every word.</p>
          <div className="marketing-card-grid">{steps.map(([number, title, body]) => <article className="marketing-card" key={number}><strong>{number}</strong><h3>{title}</h3><p>{body}</p></article>)}</div>
        </section>

        <section className="marketing-section marketing-split" id="cliniko">
          <div><p className="marketing-kicker">Cliniko</p><h2>Or skip the paste entirely</h2><p className="section-intro">Choose a patient and appointment to bring consultation details into the drafting workflow, or use pasted notes and blank forms whenever you prefer.</p></div>
          <div className="start-options"><h3>Three ways to start a request</h3>{sources.map(([title, body]) => <div key={title}><i /><span><b>{title}</b><small>{body}</small></span></div>)}</div>
        </section>

        <section className="marketing-section" id="drafts">
          <h2>Finish it between patients</h2><p className="section-intro">Requests save as you go, so you can pick up where you left off with your answers and claim details still there.</p>
          <div className="draft-heading"><b>Waiting for you</b><span>4 open</span></div>
          <div className="draft-example-grid">{[
            ['A. Whitfield','WS-204418','WorkSafe VIC','Step 4 of 9'],['R. Okonjo','RTW-482011','ReturnToWork SA','Ready to sign'],['M. Delaney','SIRA-88120','SIRA NSW','Step 2 of 9'],['J. Baptiste','WC-551903','WorkCover QLD','Step 7 of 9'],
          ].map(([name, claim, scheme, step], index) => <div className={index === 0 ? 'is-active' : ''} key={claim}><b>{name}</b><code>{claim}</code><span>{scheme}</span><small>{step}</small></div>)}</div>
        </section>

        <section className="marketing-section" id="trust">
          <p className="marketing-kicker">Your data</p><h2>Clinical information stays under your control</h2><p className="section-intro">The demo is designed around a review-first workflow. Here is what that means while you prepare a request.</p>
          <div className="marketing-card-grid trust-grid">{trust.map(([title, body]) => <article className="marketing-card" key={title}><h3>{title}</h3><p>{body}</p></article>)}</div>
        </section>

        <section className="marketing-cta">
          <div><h2>Try it on your next request</h2><p>Open the demo, paste a test note and see the mapped form for yourself.</p></div>
          <button type="button" onClick={onEnterApp}>Open AHTR Assist</button>
        </section>
      </main>

      <footer className="marketing-footer"><div><span className="marketing-wordmark">AHTR <span>Assist</span></span><p>Treatment request paperwork for allied health practitioners in Australia.</p></div><div><b>Product</b><a href="#how">How it works</a><a href="#cliniko">Cliniko connection</a><a href="#drafts">Saved drafts</a></div><div><b>Information</b><a href="#trust">Your data</a><button type="button" onClick={onEnterApp}>Open the demo</button></div><p>© 2026 AHTR Assist</p></footer>
    </div>
  );
}
