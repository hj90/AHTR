import { Check } from 'lucide-react';

interface LandingPageProps { onEnterApp: () => void; }

const steps = [
  ['01', 'Paste the note', 'Drop in your consult note, or start from a blank form. AHTR reads subjective, objective, plan and goals the way you wrote them.'],
  ['02', 'Check the answers', "Every field is shown with where it came from. Anything your note didn't cover stays blank — nothing is invented for you."],
  ['03', 'Download and sign', "You get the scheme's own PDF, filled and mapped to the current form version, ready to sign and send to the insurer."],
];
const sources = [
  ['From my consult notes', 'Paste the note you already wrote for the file.'],
  ['From Cliniko', 'Pull the patient, claim and latest note for one appointment.'],
  ['Blank form', "Guided fields only, when there's no note to work from."],
];
const trust = [
  ['Nothing invented', "If a field isn't in your note, it stays empty for you to answer. No filled-in guesses on a clinical document."],
  ['You review before it commits', "The completed PDF is written only after you've seen and approved every mapped answer."],
  ['Read-only integrations', 'Cliniko is read-only — AHTR never writes back into your practice management software.'],
  ['Kept to the request', 'Notes are used to fill the form in front of you, not to train anything or build a patient database.'],
];
const compliance = [
  ['Privacy law', ['Compliant with the Privacy Act 1988 and the Australian Privacy Principles.', "Retention and deletion schedules mapped to each state's health records law — NSW HRIPA, Victoria's Health Records Act, Queensland's IP Act.", 'A documented breach response under the OAIC Notifiable Data Breaches scheme.', 'A data processing agreement your privacy officer can review before you sign up.']],
  ['Security', ['Independently audited against ISO 27001 controls.', 'Patient data is stored and processed in Australia — never sent offshore.', 'Encrypted in transit and at rest, with role-based access for multi-practitioner clinics.', 'Penetration tested on a fixed schedule, with summaries available on request.']],
  ['Clinical control', ['You remain the author and signer of every request — AHTR fills, you approve.', 'A per-request audit trail: what was mapped, from which note, approved by whom and when.', 'Practice software integrations are read-only — nothing is written back.']],
] as const;

export function LandingPage({ onEnterApp }: LandingPageProps) {
  return <div className="marketing-page">
    <header className="marketing-header">
      <a className="marketing-wordmark" href="#top">AHTR <span>Assist</span></a>
      <nav aria-label="Website navigation"><a href="#how">How it works</a><a href="#cliniko">Cliniko</a><a href="#drafts">Drafts</a><a href="#trust">Your data</a><a href="#compliance">Compliance</a></nav>
      <div className="marketing-actions"><button className="marketing-secondary" type="button" onClick={onEnterApp}>Log in</button><a className="marketing-primary" href="#start">Start free</a></div>
    </header>

    <main id="top">
      <section className="marketing-hero">
        <div><p className="marketing-kicker">Allied health treatment requests</p><h1>Get your weekends back from insurer paperwork.</h1><p className="marketing-lead">AHTR Assist helps physiotherapists and chiropractors turn their consult notes into completed treatment requests in seconds. Review and edit every answer, then generate a signed-ready PDF. No more catching up on forms at 9pm.</p>
          <div className="marketing-hero-actions"><a className="marketing-primary marketing-primary--large" href="#start">Start free</a><a className="marketing-secondary marketing-secondary--large" href="#how">See how it works</a></div>
          <div className="scheme-badges" aria-label="Supported schemes">{['SIRA NSW','icare NSW','WorkSafe Victoria','WorkCover Queensland','ReturnToWork SA','WorkCover WA','WorkSafe Tasmania','NT WorkSafe'].map(x=><span key={x}>{x}</span>)}</div>
        </div>
        <figure className="workflow-figure" aria-label="Consult note to completed PDF workflow">
          <div className="workflow-panel"><b><em>01</em>Your note</b><div className="note-lines">{[92,74,84,58,80,66].map((w,i)=><i key={w} className={i===1||i===3?'is-highlighted':''} style={{width:`${w}%`,animationDelay:`${i*.15+.1}s`}} />)}</div></div>
          <div className="workflow-panel"><b><em>02</em>Mapped answers</b>{['Diagnosis','Treatment to date','Sessions requested'].map((x,i)=><div className="mapped-field" key={x}><span>{x}</span><i><u style={{animationDelay:`${i*.4+1.2}s`}} /></i></div>)}</div>
          <div className="workflow-panel"><b><em>03</em>Completed PDF</b><div className="mini-pdf"><i/><i/><i/><i/></div><span className="ready-chip"><Check size={12}/>Ready to sign</span></div>
        </figure>
      </section>

      <section className="marketing-section" id="how"><p className="marketing-kicker">How it works</p><h2>Note in, form out</h2><p className="section-intro">Paste your notes, check the answers, generate the form. What used to cost you twenty minutes of retyping per request now takes one read-through and a click. You still sign off on every word.</p><div className="marketing-card-grid">{steps.map(([n,t,b])=><article className="marketing-card" key={n}><strong>{n}</strong><h3>{t}</h3><p>{b}</p></article>)}</div></section>

      <section className="marketing-section marketing-split" id="cliniko"><div><p className="marketing-kicker">Cliniko</p><h2>Or skip the paste entirely</h2><p className="section-intro">Connect Cliniko and AHTR Assist pulls the patient, the claim details and the latest consult note for an appointment you choose. Nothing is written back to your practice software, and you can start from a pasted note or a blank form whenever you'd rather.</p></div><div className="start-options"><h3>Three ways to start a request</h3>{sources.map(([t,b])=><div key={t}><i/><span><b>{t}</b><small>{b}</small></span></div>)}</div></section>

      <section className="marketing-section" id="drafts"><h2>Finish it between patients</h2><p className="section-intro">Requests save as you go, so if you can't finish everything in one sitting, you can pick up exactly where you left off, with your notes, answers and claim details still there.</p><div className="draft-heading"><b>Waiting for you</b><span>4 open</span></div><div className="draft-example-grid">{[['A. Whitfield','WS-204418','WorkSafe VIC','Step 4 of 9'],['R. Okonjo','RTW-482011','ReturnToWork SA','Ready to sign'],['M. Delaney','SIRA-88120','SIRA NSW','Step 2 of 9'],['J. Baptiste','WC-551903','WorkCover QLD','Step 7 of 9']].map(([n,c,s,p],i)=><div className={i===0?'is-active':''} key={c}><b>{n}</b><code>{c}</code><span>{s}</span><small>{p}</small></div>)}</div></section>

      <section className="marketing-section" id="trust"><p className="marketing-kicker">Your data</p><h2>Patient information stays where it belongs</h2><p className="section-intro">Handling clinical notes is the whole job, so here is exactly how AHTR treats them.</p><div className="marketing-card-grid trust-grid">{trust.map(([t,b])=><article className="marketing-card" key={t}><h3>{t}</h3><p>{b}</p></article>)}</div></section>

      <section className="marketing-section" id="compliance"><p className="marketing-kicker">Compliance</p><h2>Australian health-data compliance, in full</h2><p className="section-intro compliance-intro">AHTR Assist handles clinical notes, so it is held to the same rules as the rest of your record keeping — privacy law, state health records acts, breach notification and independent security certification. Here is exactly what that means for your practice.</p><div className="compliance-grid">{compliance.map(([title,items])=><article className="compliance-card" key={title}><h3>{title}</h3><div>{items.map(item=><p key={item}><i/>{item}</p>)}</div></article>)}</div></section>

      <section className="marketing-start" id="start"><div className="marketing-cta"><div><h2>Try it on your next request</h2><p>Seven days free, no card required. Bring one real note and see the completed form for yourself.</p></div><form onSubmit={e=>e.preventDefault()}><label htmlFor="w-email">Work email</label><input id="w-email" type="email" placeholder="you@yourclinic.com.au"/><label htmlFor="w-state">Where do you practise?</label><select id="w-state" defaultValue="New South Wales"><option>New South Wales</option><option>Victoria</option><option>Queensland</option><option>Commonwealth (Comcare)</option><option>Somewhere else</option></select><button type="submit">Start 7-day free trial</button></form></div></section>
    </main>

    <footer className="marketing-footer"><div><span className="marketing-wordmark">AHTR <span>Assist</span></span><p>Treatment request paperwork for allied health practitioners in Australia.</p></div><div><b>Product</b><a href="#how">How it works</a><a href="#cliniko">Cliniko connection</a><a href="#drafts">Saved drafts</a><a href="#start">Start free trial</a></div><div><b>Contact</b><a href="mailto:hello@ahtrassist.com.au">hello@ahtrassist.com.au</a><a href="mailto:support@ahtrassist.com.au">support@ahtrassist.com.au</a><a href="tel:+61421736714">0421 736 714</a><span>Replies within one business day</span></div><div><b>Legal</b><a href="#trust">Your data</a><a href="#compliance">Compliance</a></div><p>© 2026 AHTR Assist</p></footer>
  </div>;
}
