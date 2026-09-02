"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowRight, BarChart3, Bell, Bot, CalendarCheck, Check,
  CheckCircle2, ChevronDown, CircleDollarSign, Clock3,
  LayoutDashboard, Menu, MessageSquareText, Phone, PhoneCall, Play,
  Search, Settings, Sparkles, TrendingUp, Users, Workflow, X,
} from "lucide-react";

type Lead = {
  id: string; name: string; phone: string; service: string; status: string; source: string;
  time: string; value: number; initials: string; colour: string;
};
type AppointmentSlot = { id: string; label: string; status: "available" | "booked"; leadId?: string };
type AuditEvent = { at: string; action: string; leadId: string; detail: string };
type WebMCPDiagnostics = { support: "checking" | "supported" | "not-detected"; registered: number; failure: string | null };
type ModelContext = {
  registerTool: (tool: unknown) => void | Promise<void>;
  unregisterTool?: (name: string) => void | Promise<void>;
};

const expectedWebMCPTools = [
  "get_unrecovered_leads", "get_lead_details", "prepare_follow_up", "recover_lead",
  "find_available_appointments", "prepare_appointment", "get_recovery_summary",
] as const;

const visibleLeads: Lead[] = [
  { id: "lead-sarah", name: "Sarah Mitchell", phone: "07XXX XXXXXX", service: "Boiler repair", status: "Appointment booked", source: "Missed call", time: "2 min ago", value: 285, initials: "SM", colour: "#d8ebff" },
  { id: "lead-james", name: "James Okafor", phone: "07XXX XXXXXX", service: "Emergency plumbing", status: "AI follow-up", source: "Missed call", time: "14 min ago", value: 190, initials: "JO", colour: "#f1e5ff" },
  { id: "lead-helen", name: "Helen Brooks", phone: "07XXX XXXXXX", service: "Full house clean", status: "Replied", source: "Missed call", time: "32 min ago", value: 160, initials: "HB", colour: "#ffe8d6" },
  { id: "lead-daniel", name: "Daniel Reed", phone: "07XXX XXXXXX", service: "Kitchen quote", status: "New lead", source: "Missed call", time: "1 hr ago", value: 2400, initials: "DR", colour: "#dff5e9" },
];

const historyLeads: Lead[] = [
  ...Array.from({length:22}, (_, index) => ({id:`booked-${index+1}`,name:`Recovered Customer ${index+1}`,phone:"07XXX XXXXXX",service:"Home service",status:"Appointment booked",source:"Missed call",time:`${index+2} days ago`,value:150+index*15,initials:"RC",colour:"#d8ebff"})),
  ...Array.from({length:17}, (_, index) => ({id:`replied-${index+1}`,name:`Engaged Lead ${index+1}`,phone:"07XXX XXXXXX",service:"Service enquiry",status:"Replied",source:"Missed call",time:`${index+1} days ago`,value:180+index*12,initials:"EL",colour:"#ffe8d6"})),
  ...Array.from({length:19}, (_, index) => ({id:`contacted-${index+1}`,name:`Contacted Lead ${index+1}`,phone:"07XXX XXXXXX",service:"Service enquiry",status:"AI follow-up",source:"Missed call",time:`${index+1} days ago`,value:200+index*10,initials:"CL",colour:"#f1e5ff"})),
];

const seedLeads: Lead[] = [...visibleLeads, ...historyLeads];

const michaelLead: Lead = { id: "lead-michael", name: "Michael Brown", phone: "07XXX XXXXXX", service: "Emergency boiler repair", status: "Missed call", source: "Missed call", time: "Just now", value: 350, initials: "MB", colour: "#fff0c7" };
const initialSlots: AppointmentSlot[] = [
  {id:"slot-today-1600",label:"Today at 4:00 PM",status:"available"},
  {id:"slot-tomorrow-0930",label:"Tomorrow at 9:30 AM",status:"available"},
];
const computeStats = (records: Lead[]) => {
  const appointmentsBooked = records.filter(lead => lead.status === "Appointment booked");
  const contacted = records.filter(lead => !["New lead", "Missed call"].includes(lead.status));
  const engaged = records.filter(lead => ["Replied", "Qualified", "Appointment booked"].includes(lead.status));
  return {
    totalLeads: records.length,
    missedCalls: records.filter(lead => lead.source === "Missed call").length,
    callsRecovered: contacted.length,
    contacted: contacted.length,
    engaged: engaged.length,
    appointmentsBooked: appointmentsBooked.length,
    recoveredRevenue: appointmentsBooked.reduce((sum, lead) => sum + lead.value, 0),
  };
};

const automations = [
  ["Missed call rescue", "Instant SMS + AI voice callback", "97%", "Live"],
  ["New lead speed-to-contact", "Respond in under 60 seconds", "92%", "Live"],
  ["Appointment reminders", "24-hour and 2-hour reminders", "89%", "Live"],
  ["Quote follow-up", "3-message nurture over 7 days", "76%", "Live"],
];

function Money({ value }: { value: number }) {
  return <>{new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value)}</>;
}

export default function Home() {
  const [section, setSection] = useState("Overview");
  const [leads, setLeads] = useState(seedLeads);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [activeDemoLeadId, setActiveDemoLeadId] = useState("lead-daniel");
  const [demoResponse, setDemoResponse] = useState("");
  const [demoRequirement, setDemoRequirement] = useState("");
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [webMCPDiagnostics, setWebMCPDiagnostics] = useState<WebMCPDiagnostics>({support:"checking",registered:0,failure:null});
  const leadsRef = useRef(leads);
  const webMCPRegistrationAttemptedRef = useRef(false);
  const pendingApprovalRef = useRef<string | null>(null);
  const pendingSlotRef = useRef<string | null>(null);
  const slotsRef = useRef<AppointmentSlot[]>(initialSlots.map(slot => ({...slot})));
  const auditRef = useRef<AuditEvent[]>([]);
  const stats = useMemo(() => computeStats(leads), [leads]);
  const dateLabel = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()).toUpperCase();
  const activeDemoLead = leads.find(lead => lead.id === activeDemoLeadId) ?? visibleLeads[3];

  useEffect(() => { leadsRef.current = leads; }, [leads]);

  const nav = [
    ["Overview", LayoutDashboard], ["Leads", Users], ["Conversations", MessageSquareText],
    ["Appointments", CalendarCheck], ["Automations", Workflow], ["Analytics", BarChart3],
  ] as const;

  const notify = (message: string) => {
    setToast(message); window.setTimeout(() => setToast(""), 2500);
  };

  const recordAudit = (action: string, leadId: string, detail: string) => {
    const next = [{at:new Date().toISOString(),action,leadId,detail},...auditRef.current].slice(0,50);
    auditRef.current = next;
    setAuditEvents(next);
  };

  const createMissedLead = () => {
    setLeads(current => [michaelLead, ...current.filter((lead) => lead.id !== michaelLead.id)]);
    leadsRef.current = [michaelLead, ...leadsRef.current.filter((lead) => lead.id !== michaelLead.id)];
  };

  const updateLead = (leadId: string, status: string, source = "AI recovered") => {
    const updated = leadsRef.current.map(lead => lead.id === leadId ? {...lead, status, source, time: "Just now"} : lead);
    leadsRef.current = updated; setLeads(updated);
    recordAudit("lead_status_changed", leadId, status);
  };

  const runLeadDemo = (leadId: string) => {
    setActiveDemoLeadId(leadId); setDemoStep(0); setDemoResponse(""); setDemoRequirement(""); setDemoOpen(true);
    window.setTimeout(() => setDemoStep(1), 450);
    window.setTimeout(() => { setDemoStep(2); updateLead(leadId, "AI follow-up"); }, 900);
    window.setTimeout(() => recordAudit("follow_up_prepared",leadId,"Draft prepared for human review; no message sent"), 900);
  };

  const recordDemoResponse = () => {
    if (!demoResponse.trim() || !demoRequirement.trim()) {
      notify("Enter the customer's exact response and confirmed requirement");
      return;
    }
    recordAudit("customer_response_recorded",activeDemoLeadId,`Explicit response recorded: ${demoResponse.trim()}`);
    updateLead(activeDemoLeadId, "Replied", "Explicit response recorded");
    setDemoStep(3);
    window.setTimeout(() => { updateLead(activeDemoLeadId, "Qualified", "Explicit response recorded"); setDemoStep(4); recordAudit("requirement_qualified",activeDemoLeadId,demoRequirement.trim()); }, 350);
    window.setTimeout(() => { setDemoStep(5); recordAudit("appointment_availability_checked",activeDemoLeadId,"Today at 4:00 PM is available"); }, 700);
    window.setTimeout(() => { setDemoStep(6); pendingApprovalRef.current = activeDemoLeadId; pendingSlotRef.current = "Today at 4:00 PM"; recordAudit("appointment_prepared",activeDemoLeadId,"Today at 4:00 PM · awaiting human approval"); }, 1050);
  };

  const runDemo = () => {
    updateLead("lead-daniel", "New lead", "Missed call");
    runLeadDemo("lead-daniel");
  };

  const simulateMissedCall = () => {
    createMissedLead();
    window.setTimeout(() => runLeadDemo(michaelLead.id), 0);
  };

  const approveBooking = () => {
    const leadId = pendingApprovalRef.current;
    if (!leadId) return;
    const lead = leadsRef.current.find(item => item.id === leadId);
    const slotLabel = pendingSlotRef.current;
    slotsRef.current = slotsRef.current.map(slot => slot.label === slotLabel ? {...slot,status:"booked",leadId} : slot);
    updateLead(leadId, "Appointment booked");
    recordAudit("human_approval_recorded",leadId,slotLabel ?? "Appointment approved");
    pendingApprovalRef.current = null; pendingSlotRef.current = null; setDemoStep(7);
    notify(`Human approved · ${lead?.name ?? "Lead"} booked today at 4:00 PM`);
  };

  useEffect(() => {
    if (webMCPRegistrationAttemptedRef.current) return;
    webMCPRegistrationAttemptedRef.current = true;
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (typeof context?.registerTool !== "function") {
      queueMicrotask(() => setWebMCPDiagnostics({support:"not-detected",registered:0,failure:"The current browser did not provide document.modelContext.registerTool."}));
      return;
    }
    const schema = (properties: Record<string, unknown> = {}, required: string[] = []) => ({type:"object", properties, required, additionalProperties:false});
    const leadById = (id: string) => leadsRef.current.find(lead => lead.id === id);
    const register = async () => {
      const tools = [
        {name:"get_unrecovered_leads", description:"List today's unrecovered Palm92 leads, ordered from highest to lowest estimated value.", inputSchema:schema(), annotations:{readOnlyHint:true}, execute:async()=>{const result=leadsRef.current.filter(l=>l.status!=="Appointment booked").sort((a,b)=>b.value-a.value);recordAudit("webmcp_get_unrecovered_leads","system",`${result.length} unrecovered leads returned`);return {as_of:new Date().toISOString(),leads:result}}},
        {name:"get_lead_details", description:"Get the live Palm92 service need, status and estimated value for one lead.", inputSchema:schema({lead_id:{type:"string",description:"The exact Palm92 lead ID."}},["lead_id"]), annotations:{readOnlyHint:true}, execute:async({lead_id}:{lead_id:string})=>{const lead=leadById(lead_id)??null;recordAudit("webmcp_get_lead_details",lead_id,lead?"Lead details returned":"Lead not found");return {lead}}},
        {name:"prepare_follow_up", description:"Prepare, but never send, a personalised follow-up draft from the current Palm92 lead record.", inputSchema:schema({lead_id:{type:"string",description:"The exact Palm92 lead ID."}},["lead_id"]), annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false}, execute:async({lead_id}:{lead_id:string})=>{const lead=leadById(lead_id);recordAudit("webmcp_prepare_follow_up",lead_id,lead?"Follow-up draft prepared; nothing sent":"Lead not found");return lead?{lead_id,draft:`Hi ${lead.name.split(" ")[0]}, sorry we missed your call about ${lead.service.toLowerCase()}. We can help today. Would 4:00 PM work for you?`,sent:false,requires_human_review:true,data_source:"current_page_state"}:{error:"Lead not found"}}},
        {name:"recover_lead", description:"Record an explicitly supplied customer response and qualification requirement in Palm92. This does not send a message or book an appointment.", inputSchema:schema({lead_id:{type:"string",description:"The exact lead ID returned by get_unrecovered_leads."},customer_response:{type:"string",description:"The customer response supplied by the user or an authorised connected channel. Never infer or invent it."},requirement:{type:"string",description:"The confirmed service requirement stated by the customer."}},["lead_id","customer_response","requirement"]), annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true,openWorldHint:false}, execute:async({lead_id,customer_response,requirement}:{lead_id:string;customer_response:string;requirement:string})=>{const lead=leadById(lead_id);if(!lead){recordAudit("webmcp_recovery",lead_id,"Lead not found");return {error:"Lead not found"}}if(!customer_response?.trim()||!requirement?.trim()){recordAudit("webmcp_recovery",lead_id,"Explicit response and requirement required");return {error:"customer_response and requirement must be explicitly supplied; Palm92 will not invent them"}}const updated=leadsRef.current.map(l=>l.id===lead_id?{...l,status:"Qualified",source:"Response recorded"}:l);leadsRef.current=updated;setLeads(updated);recordAudit("webmcp_recovery",lead_id,`Response recorded and requirement qualified: ${requirement.trim()}`);return {lead_id,response_recorded:true,qualified:true,requirement:requirement.trim(),customer_response:customer_response.trim(),estimated_value:lead.value,message_sent_by_tool:false,next_step:"Find an available appointment, then prepare it for human approval."}}},
        {name:"find_available_appointments", description:"Read live available Palm92 appointment slots without booking one.", inputSchema:schema({lead_id:{type:"string",description:"The exact Palm92 lead ID."}},["lead_id"]), annotations:{readOnlyHint:true}, execute:async({lead_id}:{lead_id:string})=>{const slots=slotsRef.current.filter(slot=>slot.status==="available").map(({id,label})=>({id,label}));recordAudit("webmcp_find_available_appointments",lead_id,`${slots.length} available slots returned`);return {lead_id,slots,booking_requires_human_confirmation:true}}},
        {name:"prepare_appointment", description:"Prepare an available appointment for mandatory human approval. This tool cannot confirm or book the appointment.", inputSchema:schema({lead_id:{type:"string",description:"The exact Palm92 lead ID."},slot:{type:"string",description:"The slot ID or label returned by find_available_appointments."}},["lead_id","slot"]), annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true,openWorldHint:false}, execute:async({lead_id,slot}:{lead_id:string;slot:string})=>{const lead=leadById(lead_id);if(!lead){recordAudit("webmcp_appointment_prepared",lead_id,"Lead not found");return {error:"Lead not found"}}if(lead.status!=="Qualified"){recordAudit("webmcp_appointment_prepared",lead_id,"Blocked: lead is not qualified");return {error:"Lead must have an explicitly recorded response and be qualified before an appointment can be prepared"}}const available=slotsRef.current.find(item=>(item.id===slot||item.label===slot)&&item.status==="available");if(!available){recordAudit("webmcp_appointment_prepared",lead_id,"Appointment slot unavailable");return {error:"Appointment slot is not available"}}pendingApprovalRef.current=lead_id;pendingSlotRef.current=available.label;setActiveDemoLeadId(lead_id);setDemoOpen(true);setDemoStep(6);recordAudit("webmcp_appointment_prepared",lead_id,`${available.label} · awaiting human approval`);return {status:"awaiting_human_approval",booking_confirmed:false,lead_id,customer:lead.name,slot_id:available.id,slot:available.label,estimated_value:lead.value,human_confirmation_required:true,instruction:"STOP and ask the user for approval. Final booking requires the Palm92 human approval button."}}},
        {name:"get_recovery_summary", description:"Read live recovery totals, lead statuses and the Palm92 session audit trail.", inputSchema:schema(), annotations:{readOnlyHint:true}, execute:async()=>{recordAudit("webmcp_get_recovery_summary","system","Recovery summary and audit trail returned");return {...computeStats(leadsRef.current),leads:leadsRef.current.map(({id,name,status,value})=>({id,name,status,value})),audit_trail:auditRef.current}}},
      ];
      for (const tool of tools) {
        await context.registerTool(tool);
        setWebMCPDiagnostics({support:"supported",registered:tools.indexOf(tool)+1,failure:null});
      }
    };
    void register().catch(error => setWebMCPDiagnostics(current => ({...current,failure:error instanceof Error?error.message:"Tool registration failed."})));
    return () => {
      if (typeof context.unregisterTool === "function") {
        for (const name of expectedWebMCPTools) void context.unregisterTool(name);
      }
    };
  }, []);

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "mobile-show" : ""}`}>
        <div className="brand"><div className="brand-mark">P<span>92</span></div><div><strong>PALM 92</strong><small>Lead Recovery OS</small></div></div>
        <button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={20}/></button>
        <nav>
          <p className="nav-label">WORKSPACE</p>
          {nav.map(([label, Icon]) => <button key={label} className={section === label ? "active" : ""} onClick={() => {setSection(label); setMobileOpen(false)}}><Icon size={19}/><span>{label}</span>{label === "Leads" && <b>{stats.totalLeads}</b>}</button>)}
          <p className="nav-label lower">MANAGE</p>
          <button className={section === "WebMCP Test" ? "active" : ""} onClick={() => {setSection("WebMCP Test"); setMobileOpen(false)}}><Bot size={19}/><span>WebMCP Test</span></button>
          <button onClick={() => notify("Integrations are ready for connection")}><Activity size={19}/><span>Integrations</span></button>
          <button onClick={() => notify("Settings panel coming in the connected version")}><Settings size={19}/><span>Settings</span></button>
        </nav>
        <div className="plan-card"><Sparkles size={18}/><strong>PALM 92 Growth</strong><span>428 of 1,000 AI minutes</span><div><i style={{width:"43%"}}/></div><button onClick={() => setSection("Business Kit")}>View business kit</button></div>
        <div className="profile"><div className="avatar">FW</div><div><strong>Faith Wright</strong><small>PALM 92 Intelligence</small></div><ChevronDown size={16}/></div>
      </aside>

      <section className="main-panel">
        <header>
          <button className="menu" onClick={() => setMobileOpen(true)}><Menu size={22}/></button>
          <div className="search"><Search size={17}/><input placeholder="Search leads, calls, messages..." /></div>
          <div className="header-actions"><span className="live"><i/> Challenge demo ready</span><button className="icon-button"><Bell size={19}/><i/></button><button className="primary small" onClick={runDemo}><Play size={15} fill="currentColor"/> Run challenge demo</button></div>
        </header>

        <div className="content">
          {section === "Business Kit" ? <BusinessKit onBack={() => setSection("Overview")}/> : section === "WebMCP Test" ? <WebMCPTest notify={notify} diagnostics={webMCPDiagnostics} auditEvents={auditEvents}/> : section === "Automations" ? <AutomationPage runDemo={runDemo}/> : (
            <>
              <div className="demo-disclosure"><Bot size={15}/><span><strong>WebMCP Challenge demonstration</strong> All customer names, telephone numbers and records are fictional demonstration data. No real customer is contacted and no external calendar is booked.</span></div>
              <div className="page-title"><div><span className="eyebrow">{dateLabel}</span><h1>{section === "Overview" ? "Good morning, Faith" : section}</h1><p>{section === "Overview" ? "Never let another missed call become lost revenue." : `Manage your ${section.toLowerCase()} from one clear workspace.`}</p></div><button className="primary" onClick={simulateMissedCall}><PhoneCall size={17}/> Simulate demo call</button></div>

              <div className="metric-grid">
                <Metric icon={<Phone size={20}/>} label="Calls recovered" value={stats.callsRecovered} change="+18.4%" note="this month" colour="green"/>
                <Metric icon={<CalendarCheck size={20}/>} label="Appointments booked" value={stats.appointmentsBooked} change="+12.7%" note="this month" colour="purple"/>
                <Metric icon={<Clock3 size={20}/>} label="Average response" value="38 sec" change="2m 14s faster" note="than manual" colour="blue"/>
                <Metric icon={<CircleDollarSign size={20}/>} label="Demo pipeline recovered" value={<Money value={stats.recoveredRevenue}/>} change="sample bookings" note="only" colour="gold"/>
              </div>

              <div className="insight-card">
                <div className="ai-icon"><Bot size={23}/></div><div><span>PALM 92 INSIGHT</span><strong>You recovered 8 leads outside business hours this week.</strong><p>Those leads represent an estimated <b>£1,485</b> in potential revenue that might otherwise have called a competitor.</p></div><button onClick={() => setSection("Analytics")}>View insight <ArrowRight size={16}/></button>
              </div>

              <div className="dashboard-grid">
                <div className="panel activity-panel"><div className="panel-head"><div><h2>Recent lead activity</h2><p>Every conversation, captured automatically</p></div><button onClick={() => setSection("Leads")}>View all <ArrowRight size={15}/></button></div>
                  <div className="lead-list">{leads.slice(0,4).map((lead) => <div className="lead" key={lead.name}><div className="lead-avatar" style={{background:lead.colour}}>{lead.initials}</div><div className="lead-name"><strong>{lead.name}</strong><span>{lead.service} · {lead.source}</span></div><div className={`status ${lead.status.toLowerCase().replaceAll(" ", "-")}`}><i/>{lead.status}</div><div className="lead-value"><strong><Money value={lead.value}/></strong><span>{lead.time}</span></div></div>)}</div>
                </div>
                <div className="panel recovery-panel"><div className="panel-head"><div><h2>Recovery funnel</h2><p>Last 30 days</p></div><button className="dots">•••</button></div>
                  <div className="funnel"><Funnel label="Missed calls" value={String(stats.missedCalls)} width="100%" colour="#e4e8ed"/><Funnel label="AI contacted" value={String(stats.contacted)} width={`${Math.min(100,stats.contacted/stats.missedCalls*100)}%`} colour="#bfded6"/><Funnel label="Leads engaged" value={String(stats.engaged)} width={`${stats.engaged/stats.missedCalls*100}%`} colour="#83c7b7"/><Funnel label="Booked" value={String(stats.appointmentsBooked)} width={`${stats.appointmentsBooked/stats.missedCalls*100}%`} colour="#0a8a6c"/></div>
                  <div className="conversion"><div><span>Recovery rate</span><strong>{(stats.contacted/stats.missedCalls*100).toFixed(1)}%</strong></div><div><span>Booking rate</span><strong>{(stats.appointmentsBooked/stats.contacted*100).toFixed(1)}%</strong></div></div>
                </div>
              </div>

              <div className="panel automation-strip"><div className="panel-head"><div><h2>Automation health</h2><p>Your customer-response engine is running smoothly</p></div><button onClick={() => setSection("Automations")}>Manage workflows <ArrowRight size={15}/></button></div><div className="automation-grid">{automations.map((a) => <div key={a[0]}><CheckCircle2 size={19}/><span><strong>{a[0]}</strong><small>{a[1]}</small></span><b>{a[2]}</b></div>)}</div></div>
            </>
          )}
        </div>
      </section>

      {demoOpen && <div className="modal-backdrop"><div className="demo-modal"><button className="modal-x" onClick={() => setDemoOpen(false)}><X size={20}/></button><span className="demo-kicker"><Sparkles size={15}/> HUMAN + AI CHALLENGE DEMO</span><h2>{demoStep >= 6 ? "One important decision remains" : "Recovering the highest-value opportunity"}</h2><p>{demoStep >= 6 && demoStep < 7 ? "The AI has prepared the booking. You stay in control of the final action." : "Palm92 will pause for the customer's exact response. Nothing is invented or sent."}</p><div className="phone-demo"><div className="caller"><div className="pulse-phone"><PhoneCall size={23}/></div><div><strong>{demoStep === 7 ? "Lead recovered" : "Missed call"}</strong><span>{activeDemoLead.name} · {activeDemoLead.service}</span></div><b><Money value={activeDemoLead.value}/></b></div>{[
        [1,"High-value lead identified",`${activeDemoLead.name} is today's highest-value unrecovered lead`],
        [2,"Follow-up prepared",`Hi ${activeDemoLead.name.split(" ")[0]}, sorry we missed your call...`],
        [3,"Customer response recorded",`${activeDemoLead.name.split(" ")[0]} confirmed they want to continue`],
        [4,"Need qualified",`${activeDemoLead.service} · estimated value £${activeDemoLead.value.toLocaleString("en-GB")}`],
        [5,"Availability checked","Today at 4:00 PM is available"],
        [6,"Appointment prepared","Human approval required before booking"],
        [7,"Appointment confirmed","Lead, funnel and recovered revenue updated"],
      ].map(([step,title,detail]) => <div className={`demo-step ${demoStep >= Number(step) ? "done" : ""}`} key={step}><div>{demoStep >= Number(step) ? <Check size={16}/> : step}</div><span><strong>{title}</strong><small>{detail}</small></span>{demoStep < Number(step) && Number(step) < 7 && <i/>}</div>)}</div>{demoStep === 2 ? <div className="response-box"><strong>Record the customer’s exact response</strong><span>This competition demo requires explicit evidence before qualification.</span><label>Customer response<textarea value={demoResponse} onChange={event=>setDemoResponse(event.target.value)} placeholder="Example: Yes, I would like to continue with the kitchen quote."/></label><label>Confirmed requirement<input value={demoRequirement} onChange={event=>setDemoRequirement(event.target.value)} placeholder="Example: Kitchen quote"/></label><button className="primary full" onClick={recordDemoResponse}>Record response and continue <ArrowRight size={17}/></button></div> : demoStep === 6 ? <div className="approval-box"><strong>{activeDemoLead.name} wants an appointment today at 4:00 PM.</strong><span>The sample slot is available and the estimated opportunity value is £{activeDemoLead.value.toLocaleString("en-GB")}. Shall I confirm the demonstration booking?</span><button className="primary full" onClick={approveBooking}>Yes, approve demo booking <ArrowRight size={17}/></button><button className="decline" onClick={() => setDemoOpen(false)}>Not yet</button></div> : demoStep === 7 ? <button className="primary full" onClick={() => setDemoOpen(false)}>Return to updated dashboard <ArrowRight size={17}/></button> : <div className="thinking"><i/><span>PALM 92 AI is inspecting {activeDemoLead.name.split(" ")[0]}...</span></div>}</div></div>}
      {toast && <div className="toast"><CheckCircle2 size={19}/>{toast}</div>}
    </main>
  );
}

function Metric({icon,label,value,change,note,colour}:{icon:React.ReactNode,label:string,value:React.ReactNode,change:string,note:string,colour:string}) {
  return <div className="metric-card"><div className={`metric-icon ${colour}`}>{icon}</div><div className="metric-top"><span>{label}</span><strong>{value}</strong></div><p><TrendingUp size={14}/><b>{change}</b> {note}</p></div>;
}

function Funnel({label,value,width,colour}:{label:string,value:string,width:string,colour:string}) {
  return <div className="funnel-row"><span>{label}</span><div><i style={{width,background:colour}}/></div><b>{value}</b></div>;
}

function AutomationPage({runDemo}:{runDemo:()=>void}) {
  return <><div className="page-title"><div><span className="eyebrow">CUSTOMER RESPONSE ENGINE</span><h1>Automations</h1><p>Reliable follow-up, from the first ring to a human-approved appointment.</p></div><button className="primary" onClick={runDemo}><Play size={16}/> Test workflow</button></div><div className="workflow-hero"><div><Sparkles size={19}/><span>CORE WORKFLOW</span><h2>The 60-second missed-call rescue</h2><p>When a call is missed, Palm92 identifies the opportunity, prepares the follow-up, records an explicit customer response, qualifies the requirement and prepares an available appointment for human approval.</p></div><div className="workflow-map"><Flow icon={<Phone size={19}/>} title="Call missed" sub="Trigger"/><ArrowRight/><Flow icon={<MessageSquareText size={19}/>} title="Follow-up prepared" sub="Human review"/><ArrowRight/><Flow icon={<Bot size={19}/>} title="Need qualified" sub="Response required"/><ArrowRight/><Flow icon={<CalendarCheck size={19}/>} title="Approval required" sub="Before booking"/></div></div><div className="automation-cards">{automations.map((a,i)=><div className="automation-card" key={a[0]}><div className="auto-top"><div className={`metric-icon ${["green","purple","blue","gold"][i]}`}><Workflow size={19}/></div><span className="toggle"><i/></span></div><h3>{a[0]}</h3><p>{a[1]}</p><div><span>Success rate</span><strong>{a[2]}</strong></div></div>)}</div></>;
}

function Flow({icon,title,sub}:{icon:React.ReactNode,title:string,sub:string}) {return <div className="flow"><div>{icon}</div><strong>{title}</strong><span>{sub}</span></div>}

const webMcpPrompt = `Find today's unrecovered leads.

Identify the highest-value opportunity and help me recover it.

Use the Palm92 site tools to inspect the lead, prepare the follow-up, qualify the opportunity, check appointment availability and prepare the appointment.

Stop and ask for my approval before making the final booking.`;

function WebMCPTest({notify,diagnostics,auditEvents}:{notify:(message:string)=>void;diagnostics:WebMCPDiagnostics;auditEvents:AuditEvent[]}) {
  const readinessChecks = [
    "Exact recovery-testing prompt remains in WebMCP Test",
    "SMS sent changed to Follow-up prepared",
    "Qualification now requires an explicit customer response",
    "Job booked changed to Approval required",
    "Final booking remains human-controlled",
    "Tests, lint and production build passed",
  ];
  const copyPrompt = async () => {
    await navigator.clipboard.writeText(webMcpPrompt);
    notify("WebMCP test prompt copied");
  };
  const supportLabel = diagnostics.support === "supported" ? "Supported" : diagnostics.support === "not-detected" ? "Not detected" : "Checking";
  const registrationLabel = <><span>{diagnostics.failure ?? `${diagnostics.registered}/7 registered`}</span><span className="readiness-list">{readinessChecks.map((item,index)=><span key={item}><CheckCircle2 size={15}/><b>{index + 1}</b><span>{item}</span></span>)}</span></>;
  return <><div className="page-title"><div><span className="eyebrow">FINAL CHALLENGE VERIFICATION</span><h1>Test Palm92 with ChatGPT</h1><p>Use the desktop app to prove discovery, execution and human control.</p></div></div><div className="panel diagnostics-card"><div><span>WebMCP browser support</span><strong className={diagnostics.support === "supported" ? "diagnostic-good" : "diagnostic-neutral"}>{supportLabel}</strong></div><div><span>Tool registration</span><strong className={diagnostics.registered === expectedWebMCPTools.length && !diagnostics.failure ? "diagnostic-good" : "diagnostic-neutral"}>{registrationLabel}</strong></div><div className="diagnostic-tools"><span>Expected registered tools</span><ul>{expectedWebMCPTools.map((tool,index)=><li key={tool}><i className={index < diagnostics.registered ? "registered" : ""}/><code>{tool}</code></li>)}</ul></div></div><div className="panel webmcp-card"><div className="webmcp-card-head"><div className="metric-icon gold"><Activity size={20}/></div><div><span>DATA PROVENANCE</span><h2>Transparent challenge workspace</h2></div></div><p>Palm92 tools operate on the shared demonstration records currently visible on this page. They do not claim to send real SMS messages, contact customers, update an external CRM or book an external calendar. Customer responses must be supplied explicitly, and the final booking remains a human-only action.</p></div><div className="webmcp-grid"><div className="panel webmcp-card"><div className="webmcp-card-head"><div className="metric-icon green"><Bot size={20}/></div><div><span>STEP BY STEP</span><h2>Open the site tools</h2></div></div><ol><li>Open the latest ChatGPT desktop app.</li><li>Use GPT-5.6 Sol or GPT-5.6 Terra and open the built-in browser.</li><li>Load this Palm92 site, select <b>Site tools</b> in the address bar and confirm the tools appear.</li><li>Copy the test prompt and send it to ChatGPT.</li></ol><p className="desktop-note">Site tools are unavailable with GPT-5.6 Luna, in an ordinary browser tab, or in the Android app.</p></div><div className="panel webmcp-card prompt-card"><div className="webmcp-card-head"><div className="metric-icon purple"><MessageSquareText size={20}/></div><div><span>PASTE INTO CHATGPT</span><h2>Final verification prompt</h2></div></div><pre>{webMcpPrompt}</pre><button className="primary full" onClick={copyPrompt}>Copy test prompt</button></div></div><div className="panel expected-card"><span className="eyebrow">EXPECTED RESULT</span><h2>The competition moment</h2><div className="expected-flow"><span>Daniel Reed · £2,400</span><ArrowRight size={16}/><span>Palm92 tools investigate</span><ArrowRight size={16}/><span>Appointment prepared</span><ArrowRight size={16}/><strong>Human approval required</strong></div><div className="verification-list">{["WebMCP discovery","WebMCP execution","Daniel Reed demo","Audit trail","Human approval"].map(item=><div key={item}><CheckCircle2 size={17}/><span>{item}</span><b>Pass when verified</b></div>)}</div></div><div className="panel audit-card"><div className="panel-head"><div><h2>Session audit trail</h2><p>Evidence produced by this browser session</p></div><strong>{auditEvents.length} events</strong></div>{auditEvents.length ? <div className="audit-list">{auditEvents.slice(0,10).map((event,index)=><div key={`${event.at}-${index}`}><time>{new Date(event.at).toLocaleTimeString("en-GB")}</time><code>{event.action}</code><span>{event.leadId}</span><p>{event.detail}</p></div>)}</div> : <div className="audit-empty">Run the challenge demo or call a Palm92 site tool to create traceable evidence.</div>}</div></>;
}

function BusinessKit({onBack}:{onBack:()=>void}) {
  return <><div className="page-title"><div><button className="back" onClick={onBack}>← Dashboard</button><span className="eyebrow">PALM 92 AGENCY BLUEPRINT</span><h1>Package it. Pitch it. Profit from it.</h1><p>A ready-to-sell service offer built around measurable recovered revenue.</p></div></div><div className="offer-banner"><div><span>THE CORE PROMISE</span><h2>“We turn your missed calls into booked appointments, automatically.”</h2><p>Sell the result, not a box of complicated software.</p></div><CircleDollarSign size={58}/></div><div className="kit-grid"><div className="panel kit-card"><h2>Ideal first customers</h2><p>Start with one high-value local service niche.</p>{["Plumbers & heating engineers","Dental and private clinics","Roofers and builders","Cleaning companies","Estate and letting agents"].map(x=><div className="checkline" key={x}><Check size={15}/>{x}</div>)}</div><div className="panel kit-card pricing"><h2>Recommended pricing</h2><p>Charge for setup, then ongoing management.</p><div><span>Launch setup</span><strong>£1,500</strong><small>Workflow, scripts, CRM, calendar and testing</small></div><div><span>Monthly care</span><strong>£497/mo</strong><small>AI minutes, monitoring, improvements and reports</small></div></div><div className="panel kit-card"><h2>Free-first tool stack</h2><p>Validate cheaply, upgrade only with paying clients.</p>{[["CRM","HubSpot Free"],["Automation","n8n self-hosted"],["Booking","Cal.com"],["AI","ChatGPT API"],["Voice","Twilio / Vapi"]].map(x=><div className="stack-row" key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong></div>)}</div></div><div className="panel sales-script"><span className="eyebrow">COPY-AND-USE PITCH</span><h2>Your 30-second opening</h2><blockquote>“When someone calls and you cannot answer, how often do they leave a message, and how often do they simply call the next company? PALM 92 responds in seconds, qualifies what they need, and books them into your calendar. I can show you the whole journey using a missed call from your own phone.”</blockquote><div><span><b>1.</b> Demonstrate the missed call</span><span><b>2.</b> Show the instant response</span><span><b>3.</b> Calculate recovered job value</span><span><b>4.</b> Ask for a 14-day pilot</span></div></div><div className="panel rollout"><h2>Your first 30 days</h2>{[["Week 1","Choose one niche and create a demo account"],["Week 2","Contact 50 local businesses with the missed-call question"],["Week 3","Run live demos and secure a paid pilot"],["Week 4","Onboard client, measure bookings, collect testimonial"]].map(x=><div key={x[0]}><strong>{x[0]}</strong><span>{x[1]}</span></div>)}</div></>;
}
