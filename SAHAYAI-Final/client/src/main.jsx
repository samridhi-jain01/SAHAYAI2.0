import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, BadgeCheck, Bell, Building2, Camera, CheckCircle2,
  ChevronDown, CircleDollarSign, Clock3, FileText, Filter, Globe2, Headphones,
  Home, Languages, LocateFixed, Map, Menu, Mic, MoreHorizontal, Navigation,
  Phone, Plus, Radio, Search, Send, ShieldCheck, Sparkles, Star, Store,
  TrendingUp, UserRound, Users, Wrench, X, Zap
} from "lucide-react";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const seed = {
  user: { name: "Aarav Kumar", credits: 430, trust: 91 },
  reports: [
    { id:"INC-1024", title:"Broken streetlight near primary school", category:"Electricity", severity:"High", confidence:94, status:"Assigned", location:"Ward 3 • Village Centre", age:"2h", reports:6, department:"Electricity Department", asset:"Pole #27" },
    { id:"INC-1021", title:"Water pipeline leakage", category:"Water", severity:"Medium", confidence:88, status:"In Progress", location:"Ward 1 • Main Road", age:"1d", reports:3, department:"Water Supply", asset:"Pipe #12" }
  ],
  workers: [
    { id:"W-01", name:"Raj Kumar", skill:"Electrician", rating:4.8, jobs:182, distance:1.8, available:true, price:"₹350–₹650", response:"18 min", reliability:96 },
    { id:"W-02", name:"Amit Sharma", skill:"Plumber", rating:4.7, jobs:126, distance:2.4, available:true, price:"₹300–₹700", response:"24 min", reliability:94 },
    { id:"W-03", name:"Suresh Pal", skill:"Mason", rating:4.9, jobs:203, distance:3.1, available:false, price:"₹500–₹1,200", response:"31 min", reliability:98 }
  ],
  jobs: [
    { id:"JOB-501", title:"Kitchen pipe leakage", skill:"Plumber", distance:1.4, price:"₹400–₹700", status:"Open", source:"Commercial" },
    { id:"JOB-502", title:"Streetlight inspection", skill:"Electrician", distance:2.2, price:"Government work", status:"Open", source:"Government" }
  ]
};

function loadState() {
  try { return JSON.parse(localStorage.getItem("sahayai-state")) || seed; } catch { return seed; }
}
function saveState(s) { localStorage.setItem("sahayai-state", JSON.stringify(s)); }

async function api(path, options={}) {
  try {
    const r = await fetch(API + path, { headers:{"Content-Type":"application/json"}, ...options });
    if (!r.ok) throw new Error("API");
    return await r.json();
  } catch {
    return null;
  }
}

function App() {
  const [state, setState] = useState(loadState);
  const [role, setRole] = useState("citizen");
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [nav, setNav] = useState({citizen:"Dashboard",government:"Command Centre",worker:"Worker Home"});

  useEffect(() => saveState(state), [state]);
  useEffect(() => {
    if (!toast) return;
    const t=setTimeout(()=>setToast(""), 3000); return ()=>clearTimeout(t);
  }, [toast]);

  const notify = msg => setToast(msg);
  const navigate = item => { setNav(n => ({...n, [role]: item})); setMobileNav(false); const ids={"My Reports":"my-reports","Find Workers":"find-workers","Digital Twin":"digital-twin","Incidents":"priority-incidents","Workforce Pool":"workforce-pool","Analytics":"analytics","Nearby Jobs":"nearby-jobs","Government Jobs":"government-jobs","My Work":"my-work","Profile":"worker-profile"}; const id=ids[item]; if(id) setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"}),60); };

  const addReport = async report => {
    setState(s => ({...s, reports:[report, ...s.reports]}));
    await api("/incidents",{method:"POST",body:JSON.stringify(report)});
    notify("Report submitted and sent to the SAHAYAI AI Village Brain.");
  };

  const updateReport = async (id, patch) => {
    setState(s => ({...s, reports:s.reports.map(r=>r.id===id?{...r,...patch}:r)}));
    await api(`/reports/${id}/status`,{method:"POST",body:JSON.stringify(patch)});
  };

  const addJob = job => setState(s => ({...s, jobs:[job,...s.jobs]}));

  return (
    <div className="app-shell">
      <Topbar role={role} setRole={setRole} onMenu={()=>setMobileNav(v=>!v)} notify={notify} />
      <div className="layout">
        <Sidebar role={role} open={mobileNav} onClose={()=>setMobileNav(false)} nav={nav[role]} onNavigate={navigate} />
        <main className="main">
          {role==="citizen" && <Citizen state={state} addReport={addReport} updateReport={updateReport} notify={notify} nav={nav.citizen} onNavigate={item=>navigate(item)} />}
          {role==="government" && <Government state={state} updateReport={updateReport} notify={notify} nav={nav.government} onNavigate={item=>navigate(item)} />}
          {role==="worker" && <Worker state={state} setState={setState} notify={notify} nav={nav.worker} onNavigate={item=>navigate(item)} />}
        </main>
      </div>
      {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
    </div>
  );
}

function Topbar({role,setRole,onMenu,notify}) {
  return <header className="topbar">
    <button className="icon-btn mobile-only" onClick={onMenu}><Menu/></button>
    <div className="brand">
      <div className="brand-mark"><span>G</span></div>
      <div><b>SAHAYAI <em>AI</em></b><small>AI Assisted Household & Skilled Worker Platform</small></div>
    </div>
    <div className="top-actions">
      <div className="role-switch">
        {["citizen","government","worker"].map(r=>
          <button className={role===r?"active":""} onClick={()=>setRole(r)} key={r}>
            {r==="citizen"?<UserRound size={15}/>:r==="government"?<Building2 size={15}/>:<Wrench size={15}/>}
            {r[0].toUpperCase()+r.slice(1)}
          </button>
        )}
      </div>
      <button className="icon-btn" title="Notifications" onClick={()=>notify("No new notifications. All systems are up to date.")}><Bell size={19}/><i></i></button>
      <button className="avatar" title="Profile" onClick={()=>notify("Profile: Aarav Kumar • Trust score 91/100")}>AK</button>
    </div>
  </header>
}

function Sidebar({role,open,onClose,nav,onNavigate}) {
  const items = role==="citizen"
    ? [["Dashboard",Home],["Report Issue",Plus],["My Reports",FileText],["Find Workers",Users],["Digital Twin",Map]]
    : role==="government"
    ? [["Command Centre",Home],["Incidents",AlertTriangle],["Workforce Pool",Users],["Digital Twin",Map],["Analytics",TrendingUp]]
    : [["Worker Home",Home],["Nearby Jobs",Wrench],["Government Jobs",Building2],["My Work",FileText],["Profile",UserRound]];
  return <aside className={"sidebar "+(open?"open":"")}>
    <div className="side-close mobile-only" onClick={onClose}><X/></div>
    <div className="side-label">WORKSPACE</div>
    {items.map(([name,Icon],i)=><button className={"side-item "+(nav===name?"selected":"")} onClick={()=>onNavigate(name)} key={name}>
      <Icon size={18}/><span>{name}</span>{i===1 && <span className="count">3</span>}
    </button>)}
    <div className="side-label lower">AI TOOLS</div>
    <button className={"side-item "+(nav==="Report Issue"?"selected":"")} onClick={()=>onNavigate(role==="worker"?"Worker Home":"Report Issue")}><Mic size={18}/><span>Voice Assistant</span></button>
    <button className={"side-item "+(nav==="Village Brain"?"selected":"")} onClick={()=>onNavigate(role==="government"?"Command Centre":"Report Issue")}><Sparkles size={18}/><span>Village Brain</span></button>
    <div className="side-card">
      <ShieldCheck size={21}/>
      <b>Trust & Safety</b>
      <span>Human review is used for sensitive decisions.</span>
    </div>
  </aside>
}

function PageHeader({eyebrow,title,sub,actions}) {
  return <div className="page-head">
    <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{sub&&<p>{sub}</p>}</div>
    <div className="head-actions">{actions}</div>
  </div>
}

function Stat({label,value,change,icon:Icon, tone=""}) {
  return <div className={"stat "+tone}><div className="stat-icon"><Icon size={19}/></div><div><span>{label}</span><strong>{value}</strong>{change&&<small>{change}</small>}</div></div>
}

function Citizen({state,addReport,updateReport,notify,nav,onNavigate}) {
  const [tab,setTab]=useState("home");
  const [reportOpen,setReportOpen]=useState(false);
  const [selected,setSelected]=useState(null);
  const [booking,setBooking]=useState(null);
  const [jobType,setJobType]=useState("Plumber");

  useEffect(()=>{
    if(nav==="Report Issue") setReportOpen(true);
  },[nav]);

  return <div>
    <PageHeader eyebrow="CITIZEN SPACE" title="Good morning, Aarav 👋" sub="Your village, connected to action."
      actions={<button className="primary" onClick={()=>{setReportOpen(true);onNavigate("Report Issue")}}><Plus size={18}/> Report an issue</button>} />
    <div className="hero-grid">
      <div className="hero-card">
        <div><span className="pill green"><Radio size={13}/> Live Village Status</span><h2>See it. Report it. <em>Get it solved.</em></h2>
        <p>Use photo, text or voice. SAHAYAI AI verifies the issue, finds the right department or worker, and keeps you updated.</p>
        <div className="hero-actions"><button className="primary" onClick={()=>setReportOpen(true)}>Report with AI <ArrowRight size={16}/></button><button className="secondary" onClick={()=>setTab("workers")}><Users size={16}/> Find a worker</button></div></div>
        <div className="hero-art"><div className="map-ring"></div><div className="hero-pin"><LocateFixed/></div><span className="float-tag one">AI Verified</span><span className="float-tag two">2.1 km</span></div>
      </div>
    </div>
    <div className="quick-nav"><button onClick={()=>onNavigate("My Reports")}><FileText size={15}/> My Reports</button><button onClick={()=>onNavigate("Find Workers")}><Users size={15}/> Find Workers</button><button onClick={()=>onNavigate("Digital Twin")}><Map size={15}/> Digital Twin</button></div>
    <div className="stats-grid">
      <Stat label="My active reports" value={state.reports.length} change="1 needs attention" icon={FileText}/>
      <Stat label="Trust score" value={state.user.trust+"/100"} change="+4 this month" icon={ShieldCheck} tone="green"/>
      <Stat label="Reward credits" value={state.user.credits} change="from verified reports" icon={CircleDollarSign} tone="gold"/>
      <Stat label="Nearby workers" value={state.workers.filter(w=>w.available).length} change="available now" icon={Users} tone="blue"/>
    </div>
    <div className="content-grid">
      <section className="panel">
        <div className="panel-head"><div><h3>My reports</h3><span>Track every issue end-to-end</span></div><button className="text-btn" onClick={()=>onNavigate("My Reports")}>View all <ArrowRight size={15}/></button></div>
        <div className="report-list">{state.reports.map(r=><ReportRow key={r.id} r={r} onClick={()=>setSelected(r)}/>)}</div>
      </section>
      <section className="panel">
        <div className="panel-head"><div><h3>Nearby services</h3><span>Trusted workers around you</span></div><button className="text-btn" onClick={()=>onNavigate("Find Workers")}>Explore <ArrowRight size={15}/></button></div>
        {state.workers.slice(0,3).map(w=><WorkerMini w={w} key={w.id} onSelect={()=>setBooking(w)}/>)}
      </section>
    </div>
    <section className="panel twin-panel" id="digital-twin">
      <div className="panel-head"><div><h3>Village Digital Twin</h3><span>Live infrastructure intelligence</span></div><span className="live-dot"><i/> Live</span></div>
      <div className="twin">
        <div className="twin-map">
          <div className="road r1"></div><div className="road r2"></div><div className="water"></div>
          <AssetPin x="23%" y="28%" type="⚡" danger/><AssetPin x="63%" y="38%" type="💧"/><AssetPin x="48%" y="72%" type="🛣️"/><AssetPin x="78%" y="68%" type="💡"/>
          <div className="house h1"></div><div className="house h2"></div><div className="house h3"></div>
        </div>
        <div className="twin-side"><div className="risk-card high"><span>Infrastructure risk</span><b>High</b><small>Pole #27 • predicted failure</small></div><div className="risk-card"><span>Open community incidents</span><b>6</b><small>3 clustered near Ward 3</small></div><button className="secondary full" onClick={()=>onNavigate("Digital Twin")}><Map size={16}/> Explore Digital Twin</button></div>
      </div>
    </section>
    {reportOpen&&<ReportModal onClose={()=>setReportOpen(false)} onSubmit={addReport} notify={notify}/>}
    {selected&&<IncidentModal r={selected} onClose={()=>setSelected(null)} onUpdate={(p)=>{updateReport(selected.id,p);setSelected({...selected,...p})}}/>}
    {booking&&<BookingModal worker={booking} onClose={()=>setBooking(null)} notify={notify}/>}
  </div>
}

function ReportRow({r,onClick}) {
  return <button className="report-row" onClick={onClick}><div className={"severity-dot "+r.severity.toLowerCase()}></div><div className="report-main"><b>{r.title}</b><span>{r.location} • {r.id}</span></div><div className="report-status"><span className={"status "+r.status.toLowerCase().replace(" ","-")}>{r.status}</span><small>{r.age}</small></div><ArrowRight size={16}/></button>
}

function WorkerMini({w,onSelect}) {
  return <div className="worker-mini"><div className="worker-avatar">{w.name.split(" ").map(x=>x[0]).join("")}</div><div className="worker-info"><b>{w.name} <BadgeCheck size={13}/></b><span>{w.skill} • {w.distance} km</span><div className="rating"><Star size={13} fill="currentColor"/>{w.rating} <small>({w.jobs})</small></div></div><button className="outline-btn" onClick={onSelect}>View</button></div>
}

function AssetPin({x,y,type,danger}) { return <div className={"asset-pin "+(danger?"danger":"")} style={{left:x,top:y}}>{type}</div> }

function ReportModal({onClose,onSubmit,notify}) {
  const [input,setInput]=useState("");
  const [file,setFile]=useState(null);
  const [imageData,setImageData]=useState(null);
  const [listening,setListening]=useState(false);
  const [analyzing,setAnalyzing]=useState(false);
  const [analysis,setAnalysis]=useState(null);
  const [aiStatus,setAiStatus]=useState(null);

  useEffect(()=>{
    api("/ai/status").then(setAiStatus);
  },[]);

  const speak=()=>{
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      notify("Voice recognition is not supported in this browser.");
      return;
    }
    const R=window.SpeechRecognition||window.webkitSpeechRecognition;
    const rec=new R(); rec.lang="hi-IN"; rec.interimResults=false;
    setListening(true);
    rec.onresult=e=>{setInput(e.results[0][0].transcript);setListening(false)};
    rec.onerror=()=>setListening(false); rec.onend=()=>setListening(false); rec.start();
  };
  const analyze=async()=>{
    setAnalyzing(true);
    const result=await api("/ai/analyze",{method:"POST",body:JSON.stringify({text:input,hasImage:!!file,imageData})});
    const fallback=localAnalyze(input,file);
    setAnalysis(result||fallback);
    setAnalyzing(false);
  };
  const submit=()=>{
    const a=analysis||localAnalyze(input,file);
    onSubmit({id:"INC-"+Math.floor(1000+Math.random()*8999),title:a.title,category:a.category,severity:a.severity,confidence:a.confidence,status:"Submitted",location:"Current location • Ward 3",age:"now",reports:1,department:a.department,asset:a.asset||"Unmapped asset"});
    onClose();
  };
  return <Modal title="Report an issue" onClose={onClose} wide>
    <div className="modal-grid">
      <div>
        <label className="label">Describe the problem</label>
        <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="e.g. Street light is not working near the school..."/>
        <div className="input-tools"><button className={listening?"recording":""} onClick={speak}><Mic size={17}/>{listening?"Listening…":"Speak"}</button><label><Camera size={17}/> Upload image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async e=>{const f=e.target.files?.[0]||null;setFile(f);if(f && f.type.startsWith("image/")){const reader=new FileReader();reader.onload=()=>setImageData(reader.result);reader.readAsDataURL(f)}else setImageData(null)}}/></label></div>
        {file&&<div className="image-preview">{file.type.startsWith("image/") ? <img src={imageData||""} alt="Citizen evidence preview"/> : <video src={URL.createObjectURL(file)} controls muted playsInline/>}<div><div className="file-chip"><Camera size={15}/>{file.name}</div><small>{file.type.startsWith("image/") ? "Photo will be sent to the live multimodal AI model when configured." : "Video evidence is attached for the workflow; live semantic video analysis can be added as a future model upgrade."}</small></div></div>}
        <div className="voice-note"><Headphones size={17}/><span>Voice assistant Hindi mode: aap Hindi mein bolkar problem report kar sakte hain.</span><button onClick={()=>{if("speechSynthesis" in window){speechSynthesis.speak(new SpeechSynthesisUtterance("कृपया अपनी समस्या हिंदी में बताइए।"))}}}>Hear</button></div>
      </div>
      <div className="analysis-box">
        {!analysis?<><div className="ai-orb"><Sparkles/></div><div className="ai-mode-badge">{aiStatus?.configured?<><span className="live-dot"><i/> Live</span> Vision + Text AI</>:<>Demo AI fallback • add API key for live Vision AI</>}</div><h3>AI Village Brain</h3><p>Analyze text and the actual photo to identify the issue, severity, department, safety risk and recommended action.</p><button className="primary full" disabled={(!input&&!file)||analyzing} onClick={analyze}>{analyzing?<><span className="spinner"></span> Analyzing…</>:<><Sparkles size={17}/> Analyze with AI</>}</button></>:<AnalysisCard a={analysis} onSubmit={submit}/>}
      </div>
    </div>
  </Modal>
}

function localAnalyze(text,file) {
  const t=(text||"").toLowerCase();
  if(t.includes("light")||t.includes("electric")||t.includes("wire")||t.includes("bijli")||t.includes("बिजली")||t.includes("लाइट")||t.includes("तार")) return {title:"Streetlight / electrical issue",category:"Electricity",severity:"High",confidence:94,department:"Electricity Department",asset:"Pole #27",safe:false,price:"₹500–₹1,500"};
  if(t.includes("water")||t.includes("pipe")||t.includes("leak")||t.includes("pani")||t.includes("पानी")||t.includes("पाइप")||t.includes("लीक")) return {title:"Water pipeline leakage",category:"Water",severity:"Medium",confidence:89,department:"Water Supply",asset:"Pipe #12",safe:true,price:"₹300–₹900"};
  if(t.includes("road")||t.includes("pothole")||t.includes("sadak")||t.includes("सड़क")||t.includes("गड्ढा")) return {title:"Road damage / pothole",category:"Roads",severity:"Medium",confidence:91,department:"Public Works",asset:"Road Segment #08",safe:false,price:"₹1,000–₹4,000"};
  return {title:"General civic/service issue",category:"Other",severity:"Medium",confidence:file?84:72,department:"Local Administration",asset:"Unmapped",safe:true,price:"₹300–₹1,000"};
}

function AnalysisCard({a,onSubmit}) {
  return <div className="analysis-result"><div className="ai-result-head"><span className={"pill "+(a.aiMode==="live"?"green":"blue")}><Sparkles size={13}/> {a.aiMode==="live"?"Live AI analysis":"Demo AI analysis"}</span><b>{a.confidence}% confidence</b></div><h3>{a.title}</h3>{a.description&&<p className="ai-description">{a.description}</p>}<div className="analysis-grid"><div><span>Category</span><b>{a.category}</b></div><div><span>Severity</span><b className={"severity-text "+a.severity.toLowerCase()}>{a.severity}</b></div><div><span>Department</span><b>{a.department}</b></div><div><span>Estimated range</span><b>{a.price}</b></div></div>{a.evidence?.length>0&&<div className="evidence"><span>AI evidence</span>{a.evidence.map((x,i)=><small key={i}>• {x}</small>)}</div>}<div className={"safe-box "+(a.safe?"safe":"danger")}>{a.safe?<ShieldCheck size={18}/>:<AlertTriangle size={18}/>}<span>{a.safe?"Low-risk guidance may be available.":"Safety risk detected — professional inspection recommended."}</span></div>{a.recommendedAction&&<div className="recommendation compact"><Sparkles size={16}/><div><b>Recommended action</b><span>{a.recommendedAction}</span></div></div>}<button className="primary full" onClick={onSubmit}><Send size={16}/> Submit verified report</button></div>
}

function IncidentModal({r,onClose,onUpdate}) {
  return <Modal title={r.id+" • Incident details"} onClose={onClose}>
    <div className="incident-detail"><div className="incident-banner"><span className={"severity-pill "+r.severity.toLowerCase()}>{r.severity} priority</span><b>{r.title}</b><small>{r.location}</small></div><div className="timeline">{["Submitted","AI Verified","Department Identified","Officer Assigned","Resolution Verification"].map((x,i)=><div className={"timeline-item "+(i<(r.status==="Resolved"?5:r.status==="In Progress"?4:3)?"done":"")} key={x}><i></i><div><b>{x}</b><small>{i===0?"Today, 10:12 AM":"System event"}</small></div></div>)}</div><div className="modal-actions"><button className="secondary" onClick={()=>onUpdate({status:"In Progress"})}>Mark in progress</button><button className="primary" onClick={()=>onUpdate({status:"Resolved"})}>Mark resolved</button></div></div>
  </Modal>
}

function BookingModal({worker,onClose,notify}) {
  return <Modal title="Confirm service" onClose={onClose}><div className="booking"><WorkerMini w={worker}/><div className="quote-box"><span>AI fair-price range</span><strong>{worker.price}</strong><small>Final quote is agreed with the worker before service.</small></div><div className="booking-row"><LocateFixed size={17}/> {worker.distance} km away <Clock3 size={17}/> ETA ~{worker.response}</div><button className="primary full" onClick={async()=>{await api("/bookings",{method:"POST",body:JSON.stringify({workerId:worker.id})});notify("Booking confirmed with "+worker.name);onClose()}}><CheckCircle2 size={17}/> Confirm booking</button></div></Modal>
}

function Government({state,updateReport,notify,nav,onNavigate}) {
  const [selected,setSelected]=useState(state.reports[0]);
  const [filter,setFilter]=useState("All");
  const filtered=state.reports.filter(r=>filter==="All"||r.severity===filter);
  return <div>
    <PageHeader eyebrow="GOVERNMENT COMMAND CENTRE" title="Village response dashboard" sub="Evidence-led incident management and workforce discovery."
      actions={<button className="secondary" onClick={()=>exportReport(state)}><DownloadIcon/> Export report</button>} />
    <div className="stats-grid">
      <Stat label="Open incidents" value={state.reports.length+4} change="+2 today" icon={AlertTriangle} tone="red"/>
      <Stat label="High priority" value={state.reports.filter(r=>r.severity==="High").length+2} change="needs attention" icon={Zap} tone="gold"/>
      <Stat label="Resolved this week" value="28" change="92% verified" icon={CheckCircle2} tone="green"/>
      <Stat label="Available workers" value={state.workers.filter(w=>w.available).length+9} change="across 4 skills" icon={Users}/>
    </div>
    <div className="gov-grid">
      <section className="panel" id="priority-incidents">
        <div className="panel-head"><div><h3>Priority incidents</h3><span>AI-assisted triage • human decision</span></div><div className="filters">{["All","High","Medium"].map(f=><button className={filter===f?"active":""} onClick={()=>setFilter(f)} key={f}>{f}</button>)}</div></div>
        <div className="incident-table"><div className="table-head"><span>Incident</span><span>Severity</span><span>Confidence</span><span>Status</span></div>{filtered.map(r=><button className={"table-row "+(selected?.id===r.id?"selected":"")} onClick={()=>setSelected(r)} key={r.id}><span><b>{r.title}</b><small>{r.id} • {r.location}</small></span><span className={"severity-text "+r.severity.toLowerCase()}>{r.severity}</span><span>{r.confidence}%</span><span className="status assigned">{r.status}</span></button>)}</div>
      </section>
      <section className="panel">
        <div className="panel-head"><div><h3>Incident intelligence</h3><span>Selected case</span></div><button className="icon-btn" onClick={()=>notify("Incident actions: assign officer, verify resolution, export evidence.")}><MoreHorizontal/></button></div>
        {selected&&<GovIncident r={selected} onUpdate={p=>{updateReport(selected.id,p);setSelected({...selected,...p});notify("Incident updated.")}}/>}
      </section>
    </div>
    <section className="panel" id="workforce-pool">
      <div className="panel-head"><div><h3>Government workforce pool</h3><span>Registered nearby skills • previous work • rating • availability</span></div><button className="secondary" onClick={()=>notify("Worker pool filtered to nearby verified skills.")}><Search size={16}/> Find worker</button></div>
      <div className="worker-grid">{state.workers.map(w=><WorkerCard w={w} key={w.id} government/>)}</div>
    </section>
    <section className="panel twin-panel" id="digital-twin">
      <div className="panel-head"><div><h3>Village Digital Twin</h3><span>Infrastructure condition and predicted risk</span></div><span className="live-dot"><i/> Live</span></div>
      <div className="twin"><div className="twin-map large"><div className="road r1"></div><div className="road r2"></div><div className="water"></div><AssetPin x="23%" y="28%" type="⚡" danger/><AssetPin x="63%" y="38%" type="💧"/><AssetPin x="48%" y="72%" type="🛣️"/><AssetPin x="78%" y="68%" type="💡"/></div><div className="twin-side"><div className="risk-card high"><span>Predicted failure risk</span><b>HIGH</b><small>Pole #27 • 11 years • 4 past faults</small></div><div className="risk-card"><span>Cost of delay</span><b>₹1.5k–₹2.2k</b><small>vs ₹500–₹700 if repaired now</small></div><div className="risk-card"><span>Community cluster</span><b>6 reports</b><small>Same infrastructure location</small></div></div></div>
    </section>
  </div>
}

function GovIncident({r,onUpdate}) {
  return <div className="gov-incident"><div className="case-head"><div className={"big-severity "+r.severity.toLowerCase()}>{r.severity[0]}</div><div><h3>{r.title}</h3><span>{r.id} • {r.department}</span></div></div><div className="confidence"><span>AI confidence</span><strong>{r.confidence}%</strong><div><i style={{width:r.confidence+"%"}}/></div></div><div className="case-facts"><div><span>Reports clustered</span><b>{r.reports}</b></div><div><span>Location</span><b>{r.location}</b></div><div><span>Asset</span><b>{r.asset}</b></div></div><div className="recommendation"><Sparkles size={17}/><div><b>AI recommended action</b><span>Inspect immediately and update the public resolution status after field verification.</span></div></div><div className="modal-actions"><button className="secondary" onClick={()=>onUpdate({status:"In Progress"})}>Assign officer</button><button className="primary" onClick={()=>onUpdate({status:"Resolved"})}>Verify resolution</button></div></div>
}

function Worker({state,setState,notify,nav,onNavigate}) {
  const [available,setAvailable]=useState(true);
  const [tab,setTab]=useState("jobs");
  const jobs=state.jobs.filter(j=>j.status==="Open");
  const accept=async id=>{setState(s=>({...s,jobs:s.jobs.map(j=>j.id===id?{...j,status:"Accepted"}:j)})); await api(`/jobs/${id}/accept`,{method:"POST",body:JSON.stringify({worker:"Raj Kumar"})}); notify("Job accepted. Location and job details are now available.");};
  const speak=()=>{if("speechSynthesis" in window) speechSynthesis.speak(new SpeechSynthesisUtterance("आपके पास एक नज़दीकी प्लंबिंग जॉब है। अनुमानित भुगतान चार सौ से सात सौ रुपये है। क्या आप यह काम लेना चाहेंगे?"))};
  return <div>
    <PageHeader eyebrow="WORKER SPACE" title="Namaste, Raj 👷" sub="Your opportunities, in one simple voice-first workspace."
      actions={<div className="availability"><i className={available?"on":""}></i> Available <button onClick={()=>setAvailable(v=>!v)}>{available?"ON":"OFF"}</button></div>} />
    <div className="worker-hero"><div><span className="pill green"><CheckCircle2 size={13}/> {available?"Available for work":"Not available"}</span><h2>Nearby work, <em>without the paperwork.</em></h2><p>Get simple voice notifications for jobs that match your skill, location and availability.</p><button className="secondary" onClick={speak}><Headphones size={16}/> Hear an opportunity</button></div><div className="worker-hero-stat"><span>Rating</span><b>4.8 <Star size={18} fill="currentColor"/></b><small>182 completed jobs</small></div></div>
    <div className="quick-nav"><button onClick={()=>onNavigate("Nearby Jobs")}><Wrench size={15}/> Nearby Jobs</button><button onClick={()=>onNavigate("Government Jobs")}><Building2 size={15}/> Government Jobs</button><button onClick={()=>onNavigate("My Work")}><FileText size={15}/> My Work</button><button onClick={()=>onNavigate("Profile")}><UserRound size={15}/> Profile</button></div>
    <div className="stats-grid"><Stat label="Open nearby jobs" value={jobs.length} change="matched to your skills" icon={Wrench}/><Stat label="This month" value="₹28.4k" change="+12% vs last month" icon={CircleDollarSign} tone="green"/><Stat label="Reliability" value="96%" change="verified performance" icon={ShieldCheck}/><Stat label="Work history" value="182" change="completed jobs" icon={FileText}/></div>
    <section className="panel" id="nearby-jobs"><div className="panel-head"><div><h3>Job opportunities</h3><span>Commercial + government work</span></div><div className="filters"><button className="active" onClick={()=>notify("Showing jobs nearest to your current service area.")}>Nearby</button><button onClick={()=>notify("Best-match sorting uses skill, distance, rating and availability.")}>Best match</button></div></div>{jobs.map(j=><JobCard j={j} key={j.id} onAccept={()=>accept(j.id)} onSpeak={speak}/>)}</section>
    <section className="panel" id="worker-profile"><div className="panel-head"><div><h3>Government workforce profile</h3><span>Visible to authorized departments</span></div><span className="pill blue"><ShieldCheck size={13}/> Verified</span></div><div className="profile-grid"><div><span>Skills</span><b>Electrician • Wiring • Streetlights</b></div><div><span>Location</span><b>Ward 3 • 2.4 km radius</b></div><div><span>Previous work</span><b>Streetlights 38 • Wiring 71</b></div><div><span>Rating</span><b>4.8 ⭐ • 182 reviews</b></div></div></section>
  </div>
}

function JobCard({j,onAccept,onSpeak}) {
  return <div className="job-card"><div className="job-icon">{j.source==="Government"?<Building2/>:<Wrench/>}</div><div className="job-body"><div className="job-top"><span className="pill blue">{j.source}</span><span>{j.distance} km away</span></div><h3>{j.title}</h3><p>Required: <b>{j.skill}</b> • Estimated: <b>{j.price}</b></p><small><Clock3 size={14}/> Posted 12 min ago</small></div><div className="job-actions"><button className="voice-btn" onClick={onSpeak}><Mic size={16}/> Hear</button><button className="primary" onClick={onAccept}>Yes, I want this <ArrowRight size={16}/></button></div></div>
}

function WorkerCard({w,government}) {
  return <div className="worker-card"><div className="worker-card-top"><div className="worker-avatar big">{w.name.split(" ").map(x=>x[0]).join("")}</div><span className={"availability-dot "+(w.available?"on":"")}>{w.available?"Available":"Busy"}</span></div><h3>{w.name} <BadgeCheck size={15}/></h3><p>{w.skill} • {w.distance} km</p><div className="rating"><Star size={14} fill="currentColor"/>{w.rating}<small>({w.jobs} jobs)</small></div><div className="worker-metrics"><span><b>{w.reliability}%</b> reliability</span><span><b>{w.response}</b> response</span></div>{government?<div className="previous">Previous work: <b>Verified</b><br/>History and ratings visible to authorized officials.</div>:<button className="outline-btn full" onClick={()=>notify(`Opening ${w.name} profile • ${w.rating} rating • ${w.jobs} completed jobs`)}>View profile</button>}</div>
}

function Modal({title,onClose,children,wide}) { return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className={"modal "+(wide?"wide":"")}><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}><X/></button></div>{children}</div></div> }
function exportReport(state){
  const rows=[["ID","Title","Category","Severity","Confidence","Status","Department","Location"],...state.reports.map(r=>[r.id,r.title,r.category,r.severity,r.confidence,r.status,r.department,r.location])];
  const csv=rows.map(row=>row.map(v=>`"${String(v??"").replaceAll("\"","\"\"")}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="sahayai-incidents.csv"; a.click(); URL.revokeObjectURL(url);
}
function DownloadIcon(){return <FileText size={16}/>}

createRoot(document.getElementById("root")).render(<BrowserRouter><App/></BrowserRouter>);
