import { useState } from "react";
 
// ── Types ──────────────────────────────────────────────────────────────────
interface Agent {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  systemPrompt: string;
}
 
interface JobLead {
  company: string;
  role: string;
  key_skills: string[];
  visa_sponsorship: string;
  seniority: string;
  priority_score: number;
  priority_reason: string;
  ideal_candidate: string;
  pain_signal: string;
}
 
interface Candidate {
  name: string;
  match_score: number;
  match_label: string;
  strengths: string[];
  gaps: string[];
  visa_ok: boolean;
  positioning_tip: string;
}
 
interface MatcherData {
  job_summary: string;
  candidates: Candidate[];
  top_pick: string;
  top_pick_reason: string;
  objection_prep: string[];
}
 
interface OutreachData {
  channel: string;
  subject_line: string | null;
  message: string;
  word_count: number;
  opening_hook: string;
  cta: string;
}
 
interface FollowUpData {
  follow_up_message: string;
  word_count: number;
  new_angle_used: string;
  tone: string;
  tip: string;
}
 
interface ObjectionHandler {
  objection: string;
  response: string;
}
 
interface ConversionData {
  candidate_prep_email: { subject: string; body: string };
  hiring_manager_message: { body: string };
  objection_handlers: ObjectionHandler[];
  next_steps_checklist: string[];
  placement_probability: string;
  placement_tip: string;
}
 
// ── Agent definitions ──────────────────────────────────────────────────────
const AGENTS: Agent[] = [
  {
    id: "job-finder",
    number: "01",
    name: "Job Finder",
    subtitle: "Finds & qualifies open roles",
    icon: "🔍",
    color: "#00D4AA",
    description: "Paste job postings and get a qualified lead table with priority scores, visa flags, and ideal candidate profiles.",
    inputLabel: "Paste Job Postings Here",
    inputPlaceholder: `Paste one or more job descriptions here. Example:
 
Senior Software Engineer – Stripe (San Francisco, CA)
We're looking for a backend engineer with 5+ years experience in Python/Go, distributed systems, and API design. Must have authorization to work in the US. H1B sponsorship available for exceptional candidates.
---
ML Engineer – Scale AI (Remote, US)
3+ years ML engineering, PyTorch, data pipelines. US citizens and green card holders only.`,
    systemPrompt: `You are a corporate partnership assistant at Interview Kickstart (IK), a US-based tech career accelerator. The user will paste one or more job postings. For each job, extract and return a structured analysis.
 
Return ONLY a JSON array (no markdown, no explanation) with this structure:
[
  {
    "company": "Company Name",
    "role": "Role Title",
    "key_skills": ["skill1", "skill2", "skill3"],
    "visa_sponsorship": "Yes / No / Not Mentioned",
    "seniority": "Junior / Mid / Senior / Staff / Not Specified",
    "priority_score": 8,
    "priority_reason": "Why this score (1 sentence)",
    "ideal_candidate": "2-sentence description of the perfect candidate for this role",
    "pain_signal": "Any signal that company is struggling to hire (e.g., role posted 60+ days, multiple similar openings)"
  }
]
 
Priority score logic: 10 = visa sponsorship confirmed + role open 30+ days + high-growth company. 1 = no sponsorship + just posted + unclear fit. Be realistic and specific.`
  },
  {
    id: "candidate-matcher",
    number: "02",
    name: "Candidate Matcher",
    subtitle: "Matches candidates to roles",
    icon: "🎯",
    color: "#FF6B6B",
    description: "Input a job description and your candidate profiles. Get match scores, fit analysis, and positioning advice.",
    inputLabel: "Job Description + Candidate Profiles",
    inputPlaceholder: `Format your input like this:
 
JOB:
Senior Backend Engineer at Stripe. Requires Python, Go, distributed systems, 5+ years. H1B sponsorship available.
 
CANDIDATES:
1. Rahul Sharma – 6 years Python/Django, AWS, Redis. Green Card holder. Previously at Flipkart (500K users). IK grad, placed mock interviews at Amazon level.
 
2. Sneha Patel – 4 years Node.js, MongoDB, Docker. Needs H1B. Strong system design fundamentals. IK grad, 3 months program.
 
3. Alex Chen – 7 years Go, Kubernetes, microservices. US Citizen. Ex-startup CTO. Strong communicator.`,
    systemPrompt: `You are a candidate matching expert at Interview Kickstart (IK). Analyze the job and candidates provided.
 
Return ONLY a JSON object (no markdown, no explanation):
{
  "job_summary": "1-sentence summary of what this company needs most",
  "candidates": [
    {
      "name": "Candidate Name",
      "match_score": 8.5,
      "match_label": "Strong Fit / Good Fit / Possible Fit / Weak Fit",
      "strengths": ["strength 1", "strength 2"],
      "gaps": ["gap 1"],
      "visa_ok": true,
      "positioning_tip": "How to position this candidate to the hiring manager in 1 sentence"
    }
  ],
  "top_pick": "Name of best candidate",
  "top_pick_reason": "2-sentence explanation of why they're the best pick",
  "objection_prep": ["Potential objection 1 and how to handle it", "Potential objection 2 and how to handle it"]
}`
  },
  {
    id: "outreach",
    number: "03",
    name: "Outreach Writer",
    subtitle: "Writes personalized messages",
    icon: "✉️",
    color: "#A78BFA",
    description: "Generate highly personalized LinkedIn messages or emails to hiring managers. Never generic, always specific.",
    inputLabel: "Fill in the Outreach Details",
    inputPlaceholder: `Hiring Manager Name: Sarah Chen
Company: Stripe
Role They're Hiring: Senior Backend Engineer
Channel: LinkedIn message (or Email)
 
About Their Company/Role (pick one signal):
Their job posting has been live for 52 days with no update
 
Candidate to Propose:
Rahul Sharma – 6 years Python/Django, AWS. Green Card holder. Previously scaled backend at Flipkart to 500K users. IK grad.
 
Your Name: [Your Name]`,
    systemPrompt: `You are an expert outreach copywriter for Interview Kickstart (IK), a US tech career accelerator. Write a personalized outreach message from the IK Corporate Partnership Manager to a hiring manager.
 
STRICT RULES:
- LinkedIn: under 120 words. Email: under 200 words + subject line.
- NEVER say: "I hope this finds you well", "I wanted to reach out", "I have a great candidate for you", "staffing agency", "placement fee"
- Open with something SPECIFIC to their situation (the pain signal provided)
- Frame IK as a career accelerator, not a recruiter
- We charge NOTHING to the company — mention this naturally
- Reference ONE specific thing about the candidate that maps to the role
- End with ONE low-friction ask: 15-min call or "can I send you their profile?"
- Sound like a smart human, not a sales bot
 
Return ONLY a JSON object (no markdown):
{
  "channel": "LinkedIn or Email",
  "subject_line": "Email subject (null if LinkedIn)",
  "message": "The full message text",
  "word_count": 95,
  "opening_hook": "What makes this opener specific and strong",
  "cta": "The call to action used"
}`
  },
  {
    id: "followup",
    number: "04",
    name: "Follow-Up Agent",
    subtitle: "Tracks & writes follow-ups",
    icon: "🔄",
    color: "#FBBF24",
    description: "Generate contextual follow-up messages for non-responders. Different angle each time, never desperate.",
    inputLabel: "Follow-Up Details",
    inputPlaceholder: `Original Message Sent:
Hi Sarah, noticed Stripe's backend engineer role has been open 52 days — I work with Interview Kickstart and have a candidate (Rahul, 6 yrs Python, Green Card) who scaled backend systems at Flipkart. We place candidates at zero cost to companies. Worth a 15-min call?
 
Days Since Sent: 6
Follow-Up Number: 1st follow-up
 
New Value to Add (choose one):
- New candidate with different skills
- IK placement story at a similar company
- Insight about the hiring market for this role
 
Your choice: IK recently placed a backend engineer at a Series B fintech — similar stack to Stripe`,
    systemPrompt: `You are a follow-up message expert for Interview Kickstart (IK). Write a follow-up message for a non-responding hiring manager.
 
STRICT RULES:
- Under 80 words always
- Do NOT repeat what the original message said
- Add NEW value or a NEW angle — never re-pitch the same thing
- No apologetic tone ("sorry to bother you"), no desperate tone ("just checking in")
- End with a simple, easy question or offer
- If 2nd follow-up: make it a graceful final message that leaves the door open
 
Return ONLY a JSON object (no markdown):
{
  "follow_up_message": "The complete follow-up message",
  "word_count": 72,
  "new_angle_used": "What new value or angle this message adds",
  "tone": "Confident / Helpful / Graceful exit",
  "tip": "One coaching note on why this follow-up will work"
}`
  },
  {
    id: "conversion",
    number: "05",
    name: "Conversion Agent",
    subtitle: "Closes interviews & offers",
    icon: "🏆",
    color: "#34D399",
    description: "Once a hiring manager is interested, get candidate prep emails, scheduling messages, and objection-handling scripts.",
    inputLabel: "Conversion Context",
    inputPlaceholder: `Company: Stripe
Hiring Manager: Sarah Chen, Engineering Manager
Role: Senior Backend Engineer
Candidate: Rahul Sharma
 
Candidate Profile:
6 years Python/Django, AWS, Redis. Green Card. Scaled Flipkart backend to 500K users. Strong system design. Slightly weak on Go (role mentions it as preferred).
 
Known Fit Gap:
Role asks for Go experience, Rahul primarily uses Python/Django
 
Interview Stage:
Hiring manager agreed to a screening call next week
 
Your Name: [Your Name]`,
    systemPrompt: `You are a placement conversion specialist at Interview Kickstart (IK). A hiring manager is now interested in a candidate. Generate a complete conversion package.
 
Return ONLY a JSON object (no markdown):
{
  "candidate_prep_email": {
    "subject": "Email subject for candidate",
    "body": "Full prep email to the candidate — include company context, what to emphasize, 3 likely interview topics, and encouragement"
  },
  "hiring_manager_message": {
    "body": "Short confirmation message to hiring manager proposing 2 scheduling options and expressing enthusiasm"
  },
  "objection_handlers": [
    {
      "objection": "Potential objection from hiring manager",
      "response": "Confident, natural response you can use"
    },
    {
      "objection": "Second potential objection",
      "response": "Confident, natural response"
    }
  ],
  "next_steps_checklist": ["Action 1", "Action 2", "Action 3", "Action 4"],
  "placement_probability": "High / Medium / Low",
  "placement_tip": "One key thing to do to maximize chances of placement"
}`
  }
];
 
// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#94a3b8" }}>
      <div style={{
        width: 20, height: 20, border: "2px solid #334155",
        borderTop: "2px solid #00D4AA", borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
      <span style={{ fontSize: 14 }}>Agent is thinking...</span>
    </div>
  );
}
 
// ── Result renderers ───────────────────────────────────────────────────────
function JobFinderResult({ data }: { data: JobLead[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {data.map((job: JobLead, i: number) => (
        <div key={i} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{job.company}</div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{job.role} · {job.seniority}</div>
            </div>
            <div style={{
              background: job.priority_score >= 7 ? "#064e3b" : job.priority_score >= 4 ? "#451a03" : "#1e1b4b",
              color: job.priority_score >= 7 ? "#34d399" : job.priority_score >= 4 ? "#fbbf24" : "#a78bfa",
              padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700
            }}>
              Priority: {job.priority_score}/10
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {job.key_skills.map((s: string, j: number) => (
              <span key={j} style={{ background: "#1e293b", color: "#cbd5e1", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>{s}</span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 12px" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>VISA SPONSORSHIP</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: job.visa_sponsorship === "Yes" ? "#34d399" : job.visa_sponsorship === "No" ? "#f87171" : "#fbbf24" }}>
                {job.visa_sponsorship}
              </div>
            </div>
            <div style={{ background: "#1e293b", borderRadius: 8, padding: "8px 12px" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>PAIN SIGNAL</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{job.pain_signal || "None detected"}</div>
            </div>
          </div>
          <div style={{ background: "#1e293b", borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>IDEAL CANDIDATE</div>
            <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>{job.ideal_candidate}</div>
          </div>
          <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>📊 {job.priority_reason}</div>
        </div>
      ))}
    </div>
  );
}
 
function CandidateMatcherResult({ data }: { data: MatcherData }) {
  const scoreColor = (s: number) => s >= 8 ? "#34d399" : s >= 6 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#0f172a", border: "1px solid #00D4AA33", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 11, color: "#00D4AA", marginBottom: 6, letterSpacing: 1 }}>JOB SUMMARY</div>
        <div style={{ fontSize: 14, color: "#f1f5f9" }}>{data.job_summary}</div>
      </div>
      {[...data.candidates].sort((a: Candidate, b: Candidate) => b.match_score - a.match_score).map((c: Candidate, i: number) => (
        <div key={i} style={{ background: "#0f172a", border: `1px solid ${c.name === data.top_pick ? "#00D4AA44" : "#1e293b"}`, borderRadius: 12, padding: 16 }}>
          {c.name === data.top_pick && (
            <div style={{ background: "#00D4AA22", color: "#00D4AA", fontSize: 11, padding: "3px 10px", borderRadius: 20, display: "inline-block", marginBottom: 10, letterSpacing: 1 }}>⭐ TOP PICK</div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>{c.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: c.visa_ok ? "#34d399" : "#f87171", fontSize: 12 }}>{c.visa_ok ? "✓ Visa OK" : "⚠ Visa Check"}</span>
              <div style={{ background: `${scoreColor(c.match_score)}22`, color: scoreColor(c.match_score), padding: "4px 12px", borderRadius: 20, fontSize: 14, fontWeight: 700 }}>
                {c.match_score}/10 · {c.match_label}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ background: "#064e3b22", border: "1px solid #064e3b", borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 11, color: "#34d399", marginBottom: 6 }}>STRENGTHS</div>
              {c.strengths.map((s: string, j: number) => <div key={j} style={{ fontSize: 12, color: "#94a3b8", marginBottom: 3 }}>✓ {s}</div>)}
            </div>
            <div style={{ background: "#7f1d1d22", border: "1px solid #7f1d1d", borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 11, color: "#f87171", marginBottom: 6 }}>GAPS</div>
              {c.gaps.map((g: string, j: number) => <div key={j} style={{ fontSize: 12, color: "#94a3b8", marginBottom: 3 }}>△ {g}</div>)}
            </div>
          </div>
          <div style={{ background: "#1e293b", borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>POSITIONING TIP</div>
            <div style={{ fontSize: 13, color: "#cbd5e1", fontStyle: "italic" }}>"{c.positioning_tip}"</div>
          </div>
        </div>
      ))}
      {data.objection_prep && (
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: "#fbbf24", marginBottom: 12, letterSpacing: 1 }}>OBJECTION PREP</div>
          {data.objection_prep.map((obj: string, i: number) => (
            <div key={i} style={{ background: "#1e293b", borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{obj}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
function OutreachResult({ data }: { data: OutreachData }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const text = data.subject_line ? `Subject: ${data.subject_line}\n\n${data.message}` : data.message;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {data.subject_line && (
        <div style={{ background: "#1e293b", borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>EMAIL SUBJECT</div>
          <div style={{ fontSize: 14, color: "#f1f5f9", fontWeight: 600 }}>{data.subject_line}</div>
        </div>
      )}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#A78BFA", letterSpacing: 1 }}>
            {data.channel?.toUpperCase()} MESSAGE · {data.word_count} WORDS
          </div>
          <button onClick={copy} style={{ background: copied ? "#064e3b" : "#1e293b", color: copied ? "#34d399" : "#94a3b8", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
            {copied ? "✓ Copied!" : "Copy Message"}
          </button>
        </div>
        <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>{data.message}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#1e293b", borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>OPENING HOOK</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{data.opening_hook}</div>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>CALL TO ACTION</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{data.cta}</div>
        </div>
      </div>
    </div>
  );
}
 
function FollowUpResult({ data }: { data: FollowUpData }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#FBBF24", letterSpacing: 1 }}>
            FOLLOW-UP MESSAGE · {data.word_count} WORDS · {data.tone}
          </div>
          <button onClick={() => { navigator.clipboard.writeText(data.follow_up_message); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ background: copied ? "#064e3b" : "#1e293b", color: copied ? "#34d399" : "#94a3b8", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>
        <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>{data.follow_up_message}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#1e293b", borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>NEW ANGLE USED</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{data.new_angle_used}</div>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>WHY IT WORKS</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{data.tip}</div>
        </div>
      </div>
    </div>
  );
}
 
function ConversionResult({ data }: { data: ConversionData }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };
  const probColor = data.placement_probability === "High" ? "#34d399" : data.placement_probability === "Medium" ? "#fbbf24" : "#f87171";
  const msgItems = [
    { key: "candidate_email", label: "CANDIDATE PREP EMAIL", color: "#34D399", icon: "📩", subject: data.candidate_prep_email?.subject, text: data.candidate_prep_email?.body },
    { key: "hm_message", label: "MESSAGE TO HIRING MANAGER", color: "#A78BFA", icon: "💬", subject: null as string | null, text: data.hiring_manager_message?.body }
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: `${probColor}11`, border: `1px solid ${probColor}33`, borderRadius: 10, padding: "10px 16px" }}>
        <div style={{ fontSize: 20 }}>🏆</div>
        <div>
          <div style={{ fontSize: 11, color: "#64748b" }}>PLACEMENT PROBABILITY</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: probColor }}>{data.placement_probability}</div>
        </div>
        <div style={{ flex: 1, fontSize: 13, color: "#94a3b8", marginLeft: 10 }}>{data.placement_tip}</div>
      </div>
      {msgItems.map(item => (
        <div key={item.key} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: item.color, letterSpacing: 1 }}>{item.icon} {item.label}</div>
            <button onClick={() => copy(item.subject ? `Subject: ${item.subject}\n\n${item.text}` : item.text, item.key)}
              style={{ background: copiedKey === item.key ? "#064e3b" : "#1e293b", color: copiedKey === item.key ? "#34d399" : "#94a3b8", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>
              {copiedKey === item.key ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          {item.subject && <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Subject: <span style={{ color: "#f1f5f9" }}>{item.subject}</span></div>}
          <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>{item.text}</div>
        </div>
      ))}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 11, color: "#FBBF24", letterSpacing: 1, marginBottom: 12 }}>⚠ OBJECTION HANDLERS</div>
        {data.objection_handlers?.map((o: ObjectionHandler, i: number) => (
          <div key={i} style={{ background: "#1e293b", borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#f87171", marginBottom: 6 }}>If they say: "{o.objection}"</div>
            <div style={{ fontSize: 13, color: "#cbd5e1" }}>→ {o.response}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 11, color: "#00D4AA", letterSpacing: 1, marginBottom: 12 }}>✅ NEXT STEPS CHECKLIST</div>
        {data.next_steps_checklist?.map((step: string, i: number) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 20, height: 20, border: "2px solid #334155", borderRadius: 4, flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: "#cbd5e1" }}>{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
 
// ── AgentPanel ─────────────────────────────────────────────────────────────
function AgentPanel({ agent }: { agent: Agent }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
 
  const run = async () => {
    if (!input.trim()) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: agent.systemPrompt,
          messages: [{ role: "user", content: input }]
        })
      });
      const data = await res.json();
      const text: string = (data.content as Array<{ text?: string }>)?.map((b) => b.text ?? "").join("").trim();
      const clean = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch {
      setError("Something went wrong. Make sure your input is filled in and try again.");
    }
    setLoading(false);
  };
 
  const renderResult = () => {
    if (!result) return null;
    switch (agent.id) {
      case "job-finder": return <JobFinderResult data={result as JobLead[]} />;
      case "candidate-matcher": return <CandidateMatcherResult data={result as MatcherData} />;
      case "outreach": return <OutreachResult data={result as OutreachData} />;
      case "followup": return <FollowUpResult data={result as FollowUpData} />;
      case "conversion": return <ConversionResult data={result as ConversionData} />;
      default: return <pre style={{ color: "#94a3b8", fontSize: 12 }}>{JSON.stringify(result, null, 2)}</pre>;
    }
  };
 
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, letterSpacing: 1 }}>{agent.inputLabel?.toUpperCase()}</div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={agent.inputPlaceholder}
          style={{ width: "100%", minHeight: 200, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, color: "#cbd5e1", fontSize: 13, padding: 14, fontFamily: "monospace", resize: "vertical", lineHeight: 1.6, outline: "none", boxSizing: "border-box" }}
          onFocus={(e) => (e.target.style.borderColor = agent.color)}
          onBlur={(e) => (e.target.style.borderColor = "#1e293b")}
        />
      </div>
      <button onClick={run} disabled={loading || !input.trim()} style={{ background: loading ? "#1e293b" : `linear-gradient(135deg, ${agent.color}, ${agent.color}99)`, color: loading ? "#64748b" : "#0f172a", border: "none", borderRadius: 10, padding: "14px 28px", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", alignSelf: "flex-start" }}>
        {loading ? "Running Agent..." : `Run ${agent.name} Agent →`}
      </button>
      {loading && <Spinner />}
      {error && <div style={{ background: "#7f1d1d22", border: "1px solid #7f1d1d", borderRadius: 10, padding: 14, color: "#f87171", fontSize: 13 }}>{error}</div>}
      {result && <div><div style={{ fontSize: 11, color: "#64748b", marginBottom: 12, letterSpacing: 1 }}>AGENT OUTPUT</div>{renderResult()}</div>}
    </div>
  );
}
 
// ── Main App ───────────────────────────────────────────────────────────────
export default function IKPlacementOS() {
  const [activeAgent, setActiveAgent] = useState(0);
 
  return (
    <div style={{ minHeight: "100vh", background: "#020817", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#f1f5f9" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        textarea::placeholder { color: #334155; }
      `}</style>
 
      {/* Header */}
      <div style={{ borderBottom: "1px solid #0f172a", background: "linear-gradient(180deg, #0a0f1e 0%, #020817 100%)", padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #00D4AA, #00D4AA44)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>IK Placement OS</div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 1 }}>Interview Kickstart · Corporate Partnership Suite</div>
          </div>
        </div>
        <div style={{ background: "#064e3b33", border: "1px solid #064e3b", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "#34d399", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, background: "#34d399", borderRadius: "50%" }} />
          5 AI Agents Active
        </div>
      </div>
 
      <div style={{ display: "flex", height: "calc(100vh - 81px)" }}>
        {/* Sidebar */}
        <div style={{ width: 240, flexShrink: 0, borderRight: "1px solid #0f172a", background: "#020817", padding: "20px 12px", overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "#334155", letterSpacing: 2, padding: "0 8px", marginBottom: 12 }}>AGENTS</div>
          {AGENTS.map((agent: Agent, i: number) => (
            <button key={agent.id} onClick={() => setActiveAgent(i)} style={{ width: "100%", textAlign: "left", background: activeAgent === i ? "#0f172a" : "transparent", border: activeAgent === i ? `1px solid ${agent.color}33` : "1px solid transparent", borderRadius: 10, padding: "12px 12px", cursor: "pointer", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: activeAgent === i ? `${agent.color}22` : "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{agent.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: activeAgent === i ? "#f1f5f9" : "#64748b" }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: "#334155", marginTop: 1 }}>{agent.subtitle}</div>
                </div>
              </div>
            </button>
          ))}
          <div style={{ marginTop: 24, padding: "0 8px" }}>
            <div style={{ fontSize: 10, color: "#334155", letterSpacing: 2, marginBottom: 10 }}>QUICK REF</div>
            {[
              { day: "MON", task: "Qualify leads + match candidates" },
              { day: "TUE", task: "Send outreach (5 msgs)" },
              { day: "WED", task: "Send outreach (5 msgs)" },
              { day: "THU", task: "Run follow-ups" },
              { day: "FRI", task: "Pipeline review + referrals" },
            ].map((d: { day: string; task: string }) => (
              <div key={d.day} style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: "#00D4AA", fontWeight: 700, marginRight: 6 }}>{d.day}</span>
                <span style={{ fontSize: 11, color: "#334155" }}>{d.task}</span>
              </div>
            ))}
          </div>
        </div>
 
        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          <div style={{ maxWidth: 760, margin: "0 auto", animation: "fadeIn 0.3s ease" }} key={activeAgent}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 28 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, flexShrink: 0, background: `${AGENTS[activeAgent].color}22`, border: `1px solid ${AGENTS[activeAgent].color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                {AGENTS[activeAgent].icon}
              </div>
              <div>
                <div style={{ fontSize: 11, color: AGENTS[activeAgent].color, letterSpacing: 2 }}>AGENT {AGENTS[activeAgent].number}</div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginTop: 2 }}>{AGENTS[activeAgent].name} Agent</div>
                <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>{AGENTS[activeAgent].description}</div>
              </div>
            </div>
            <div style={{ height: 1, background: "#0f172a", marginBottom: 24 }} />
            <AgentPanel agent={AGENTS[activeAgent]} key={AGENTS[activeAgent].id} />
          </div>
        </div>
 
        {/* Right panel */}
        <div style={{ width: 220, flexShrink: 0, borderLeft: "1px solid #0f172a", background: "#020817", padding: "20px 16px", overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "#334155", letterSpacing: 2, marginBottom: 16 }}>BENCHMARKS</div>
          {[
            { label: "Cold Outreach Response", target: "8–15%", icon: "📤" },
            { label: "Response → Call", target: "40–60%", icon: "📞" },
            { label: "Call → Profile Submit", target: "70%+", icon: "📋" },
            { label: "Profile → Interview", target: "30–50%", icon: "🎙" },
            { label: "Interview → Offer", target: "20–40%", icon: "🤝" },
          ].map((m: { label: string; target: string; icon: string }, i: number) => (
            <div key={i} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
              <div style={{ fontSize: 11, marginBottom: 4 }}>{m.icon} {m.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#00D4AA" }}>{m.target}</div>
            </div>
          ))}
          <div style={{ fontSize: 10, color: "#334155", letterSpacing: 2, margin: "20px 0 12px" }}>WEEKLY TARGETS</div>
          {[
            { label: "Outreach sent", value: "20–25" },
            { label: "Responses", value: "3–4" },
            { label: "Intro calls", value: "2" },
            { label: "Profile submits", value: "1–2" },
            { label: "Interviews started", value: "1–2" },
          ].map((t: { label: string; value: string }, i: number) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#475569" }}>{t.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>{t.value}</div>
            </div>
          ))}
          <div style={{ marginTop: 20, background: "#064e3b22", border: "1px solid #064e3b", borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: "#34d399", marginBottom: 6 }}>🎯 MONTHLY GOAL</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#34d399" }}>5+</div>
            <div style={{ fontSize: 11, color: "#475569" }}>candidate placements</div>
          </div>
        </div>
      </div>
    </div>
  );
}
 