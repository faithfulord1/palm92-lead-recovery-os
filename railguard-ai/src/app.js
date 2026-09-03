(() => {
  const D = window.RAILGUARD_DATA;
  const saved = JSON.parse(localStorage.getItem('railguard_state') || '{}');
  const S = { decisions: saved.decisions || D.decisions, evidence: saved.evidence || D.evidence };
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const save = () => localStorage.setItem('railguard_state', JSON.stringify(S));
  const time = () => new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const titles = {command:'Command Centre',incidents:'Incident Queue',decisions:'Decision Queue',comms:'Passenger Communications',evidence:'Evidence Vault',governance:'Governance & Model Risk',scenario:'Scenario Lab'};

  function nav(view){
    $$('.view').forEach(v=>v.classList.remove('active'));
    $('#view-'+view).classList.add('active');
    $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===view));
    $('#pageTitle').textContent=titles[view]; $('#sidebar').classList.remove('open');
    if(view==='incidents') incidents(); if(view==='decisions') decisions(); if(view==='evidence') evidence();
  }
  function kpis(){
    const p=S.decisions.filter(d=>d.status==='Pending').length;
    const x=[['Affected services','14','Primary incident'],['Estimated passengers','1,240','High impact'],['Pending decisions',p,'Human approval'],['Evidence completeness','96%','Audit captured']];
    $('#kpiGrid').innerHTML=x.map(a=>`<div class="kpi"><div class="label">${a[0]}</div><div class="value">${a[1]}</div><div class="delta">${a[2]}</div></div>`).join('');
    $('#decisionBadge').textContent=p;
  }
  function chart(){
    const vals=[68,45,82,38,28],base=[36,32,42,25,22],labs=['London','South East','Central','Metro','Coastal'];
    $('#corridorChart').innerHTML=vals.map((v,i)=>`<div class="bar-wrap"><div class="bar-stage"><div class="bar baseline" style="height:${base[i]}%"></div><div class="bar" style="height:${v}%"></div></div><div class="bar-label">${labs[i]}</div></div>`).join('');
  }
  function controls(target='#controlHealth',list=D.controls){
    $(target).innerHTML=list.map(c=>`<div class="control-row"><div><div class="meta"><span>${esc(c.name)}</span><strong>${c.score}%</strong></div><div class="track"><div class="fill" style="width:${c.score}%"></div></div></div><div class="control-status">${esc(c.status)}</div></div>`).join('');
  }
  function timeline(target,items){
    $(target).innerHTML=items.map(e=>`<div class="timeline-item"><div class="timeline-time">${esc(e.time)}</div><div class="timeline-dot"></div><div><strong>${esc(e.title)}</strong><p>${esc(e.detail)}</p></div></div>`).join('');
  }
  function decisionPreview(){
    $('#decisionPreview').innerHTML=S.decisions.map(d=>`<div class="decision-preview-item"><div><strong>${esc(d.title)}</strong><p>${esc(d.incidentId)} · ${esc(d.status)}</p></div><span class="priority ${d.priority}">${d.priority}</span></div>`).join('');
  }
  function incidents(){
    const q=($('#incidentSearch')?.value||'').toLowerCase(), sev=$('#incidentSeverityFilter')?.value||'all';
    const rows=D.incidents.filter(i=>(sev==='all'||i.severity===sev)&&[i.id,i.title,i.corridor].join(' ').toLowerCase().includes(q));
    $('#incidentTable').innerHTML=rows.map(i=>`<tr><td><strong>${esc(i.title)}</strong><span class="muted">${esc(i.id)} · ${esc(i.corridor)}</span></td><td><span class="severity ${i.severity}">${i.severity}</span></td><td>${i.passengers.toLocaleString()}</td><td>${i.confidence}%</td><td>${esc(i.status)}</td><td>${esc(i.owner)}</td><td><button class="table-action" data-inc="${i.id}">Review</button></td></tr>`).join('');
    $$('[data-inc]').forEach(b=>b.onclick=()=>showIncident(b.dataset.inc));
  }
  function showIncident(id){
    const i=D.incidents.find(x=>x.id===id); if(!i)return;
    $('#modalTitle').textContent=`${i.title} · ${i.id}`;
    $('#modalBody').innerHTML=`<div class="kpi-grid"><div class="kpi"><div class="label">Severity</div><div class="value">${i.severity}</div></div><div class="kpi"><div class="label">Passengers</div><div class="value">${i.passengers.toLocaleString()}</div></div><div class="kpi"><div class="label">Services</div><div class="value">${i.services}</div></div><div class="kpi"><div class="label">Confidence</div><div class="value">${i.confidence}%</div></div></div><p>Accountable owner: <strong>${esc(i.owner)}</strong>. AI may recommend, but human authority remains required.</p>`; openModal();
  }
  function decisions(){
    $('#decisionCards').innerHTML=S.decisions.map(d=>`<article class="decision-card"><div class="panel-head"><div class="eyebrow">${d.incidentId}</div><span class="priority ${d.priority}">${d.priority}</span></div><h3>${esc(d.title)}</h3><p>${esc(d.rationale)}</p><ul>${d.recommendation.map(r=>`<li>${esc(r)}</li>`).join('')}</ul><div class="safe-chip"><span class="status-dot ${d.status==='Pending'?'amber':''}"></span>${esc(d.status)}</div>${d.status==='Pending'?`<div class="actions"><button class="primary-btn" data-a="${d.id}">Review & approve</button><button class="reject-btn" data-r="${d.id}">Reject / revise</button></div>`:''}</article>`).join('');
    $$('[data-a]').forEach(b=>b.onclick=()=>review(b.dataset.a,'Approved'));
    $$('[data-r]').forEach(b=>b.onclick=()=>review(b.dataset.r,'Rejected for revision'));
    kpis(); decisionPreview();
  }
  function review(id,status){
    const d=S.decisions.find(x=>x.id===id); if(!d)return;
    $('#modalTitle').textContent=status==='Approved'?'Approve governed recommendation':'Reject or request revision';
    $('#modalBody').innerHTML=`<p><strong>${esc(d.title)}</strong></p><p>${esc(d.rationale)}</p><ul>${d.recommendation.map(r=>`<li>${esc(r)}</li>`).join('')}</ul><div class="guardrail-note">Decision, timestamp, correlation ID and verification state will be logged.</div><div class="modal-actions"><button class="${status==='Approved'?'primary-btn':'reject-btn'}" id="confirmDecision">Confirm</button><button class="secondary-btn" id="cancelDecision">Cancel</button></div>`; openModal();
    $('#confirmDecision').onclick=()=>commit(d,status); $('#cancelDecision').onclick=closeModal;
  }
  function commit(d,status){
    d.status=status; S.evidence.unshift({time:time(),type:status==='Approved'?'Approve':'Override',title:`Decision ${status.toLowerCase()}`,detail:`${d.incidentId}: ${d.title}. Human controller decision recorded. ${status==='Approved'?'Simulated downstream gate released after approval.':'No execution occurred.'}`});
    if(d.incidentId==='RG-2026-0903-001') $('#primaryStatus').textContent=status; save(); closeModal(); decisions(); timeline('#evidencePreview',S.evidence.slice(0,4)); commChecks();
  }
  function commChecks(){
    const p=S.decisions.find(d=>d.incidentId==='RG-2026-0903-001');
    controls('#commsChecks',[{name:'Human incident approval',score:p?.status==='Approved'?100:45,status:p?.status==='Approved'?'Passed':'Blocked'},{name:'Verified operational facts',score:96,status:'Passed'},{name:'Accessibility guidance',score:100,status:'Passed'},{name:'No unsupported promises',score:100,status:'Passed'}]);
  }
  function evidence(){
    const a=S.decisions.filter(d=>d.status==='Approved').length;
    $('#evidenceSummary').innerHTML=[['Evidence events',S.evidence.length],['Human approvals',a],['Auto-actions','0'],['Correlation coverage','100%']].map(x=>`<div class="panel"><div class="eyebrow">${x[0]}</div><strong>${x[1]}</strong></div>`).join(''); timeline('#fullTimeline',S.evidence);
  }
  function exportJSON(){
    const out={product:'RailGuard AI',portfolioOwner:'Faith Wright',exportedAt:new Date().toISOString(),simulationOnly:true,incidents:D.incidents,decisions:S.decisions,evidence:S.evidence,governance:D.governance};
    const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a'); a.href=u;a.download='railguard-ai-evidence.json';a.click();URL.revokeObjectURL(u);
  }
  function openModal(){ $('#modalBackdrop').hidden=false } function closeModal(){ $('#modalBackdrop').hidden=true }
  function runScenario(){
    const t=$('#scenarioType').value,s=+$('#serviceRange').value,p=+$('#passengerRange').value,a=$('#accessImpact').value;
    const score=Math.round(Math.min(99,35+s*1.1+(p/100)*.7+(a==='High'?18:a==='Medium'?10:3))), band=score>=80?'High':score>=60?'Medium':'Low';
    $('#scenarioResultTitle').textContent=`${band} governed-response priority`; $('#scenarioResult').innerHTML=`<div class="scenario-score">${score}</div><p><strong>${esc(t)}</strong> affecting ${s} services and about ${p.toLocaleString()} passengers.</p><ul class="scenario-recommendations"><li>Prepare explainable incident summary.</li><li>Include accessibility recovery guidance.</li><li>Generate communication from verified facts only.</li><li>Require human approval before simulated execution.</li><li>Retain before state, decision and verification evidence.</li></ul>`;
  }
  function init(){
    $$('.nav-item').forEach(n=>n.onclick=()=>nav(n.dataset.view)); $$('[data-jump]').forEach(n=>n.onclick=()=>nav(n.dataset.jump)); $('#menuBtn').onclick=()=>$('#sidebar').classList.toggle('open'); $('#modalClose').onclick=closeModal; $('#modalBackdrop').onclick=e=>{if(e.target.id==='modalBackdrop')closeModal()};
    $('#incidentSearch').oninput=incidents; $('#incidentSeverityFilter').onchange=incidents; $('#exportAllBtn').onclick=exportJSON; $('#exportEvidenceBtn').onclick=exportJSON;
    $('#regenMessageBtn').onclick=()=>$('#messageDraft').value="We’re sorry, a signalling fault is disrupting some commuter services. Please check station displays and staff guidance before travelling. Alternative routes are being assessed. Passengers requiring assistance should speak to station staff.";
    $('#approveMessageBtn').onclick=()=>{const p=S.decisions.find(d=>d.incidentId==='RG-2026-0903-001'); $('#modalTitle').textContent=p?.status==='Approved'?'Message approved':'Passenger message blocked'; $('#modalBody').innerHTML=p?.status==='Approved'?'<p class="success-text">Human approval gate passed. Message released in simulation and evidence retained.</p>':'<p>Incident recovery decision is not yet approved. RG-HITL-001 blocks release.</p>'; openModal()};
    $('#holdMessageBtn').onclick=()=>{$('#modalTitle').textContent='Message held';$('#modalBody').innerHTML='<p>No passenger message was released.</p>';openModal()};
    $('#serviceRange').oninput=e=>$('#serviceRangeValue').textContent=e.target.value; $('#passengerRange').oninput=e=>$('#passengerRangeValue').textContent=(+e.target.value).toLocaleString(); $('#runScenarioBtn').onclick=runScenario; $('#resetScenarioBtn').onclick=()=>{localStorage.removeItem('railguard_state');location.reload()};
    setInterval(()=>$('#clock').textContent=time(),1000); $('#clock').textContent=time(); $('#regenMessageBtn').click();
    kpis();chart();controls();decisionPreview();timeline('#evidencePreview',S.evidence.slice(0,4));incidents();decisions();commChecks();evidence(); $('#governanceGrid').innerHTML=D.governance.map(g=>`<article class="governance-card"><div class="status">${esc(g.status)}</div><h3>${esc(g.title)}</h3><p>${esc(g.detail)}</p></article>`).join('');
  }
  init();
})();
