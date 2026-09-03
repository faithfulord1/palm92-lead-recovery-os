window.RAILGUARD_DATA = {
  incidents: [
    {id:'RG-2026-0903-001', title:'Signalling failure', corridor:'London commuter', severity:'High', passengers:1240, confidence:92, status:'Awaiting approval', owner:'Network Control', services:14, detected:'08:17'},
    {id:'RG-2026-0903-002', title:'Train fault', corridor:'South East corridor', severity:'Medium', passengers:460, confidence:88, status:'Monitoring', owner:'Fleet Control', services:5, detected:'08:29'},
    {id:'RG-2026-0903-003', title:'Points failure', corridor:'Central interchange', severity:'Critical', passengers:2110, confidence:95, status:'Action approved', owner:'Network Control', services:19, detected:'08:41'},
    {id:'RG-2026-0903-004', title:'Passenger incident', corridor:'Metro corridor', severity:'Medium', passengers:320, confidence:84, status:'Under review', owner:'Station Control', services:4, detected:'08:55'},
    {id:'RG-2026-0903-005', title:'Severe weather risk', corridor:'Coastal corridor', severity:'Low', passengers:180, confidence:76, status:'Monitoring', owner:'Duty Manager', services:3, detected:'09:03'}
  ],
  decisions: [
    {id:'D-001', incidentId:'RG-2026-0903-001', title:'Release passenger recovery plan', priority:'High', rationale:'Passenger impact exceeds escalation threshold. Accessibility support and route alternatives are required.', recommendation:['Issue disruption notice','Prioritise accessible route guidance','Increase monitoring at high-impact interchange points','Reassess every 10 minutes'], status:'Pending'},
    {id:'D-002', incidentId:'RG-2026-0903-004', title:'Escalate station support request', priority:'Medium', rationale:'Passenger incident may create platform crowding risk if service gaps continue.', recommendation:['Notify station duty manager','Prepare crowd-management support','Hold customer-facing ETA until verified'], status:'Pending'},
    {id:'D-003', incidentId:'RG-2026-0903-005', title:'Activate weather monitoring protocol', priority:'Low', rationale:'Forecast risk is elevated but current service impact remains limited.', recommendation:['Increase monitoring cadence','Prepare contingency message','No service intervention at present'], status:'Pending'}
  ],
  evidence: [
    {time:'08:17:04', type:'Detect', title:'Disruption signal correlated', detail:'Operational signals linked to correlation ID RG-2026-0903-001.'},
    {time:'08:17:11', type:'Assess', title:'Passenger impact assessed', detail:'High impact classification generated from simulated service and passenger-volume indicators.'},
    {time:'08:17:18', type:'Recommend', title:'Recovery recommendation generated', detail:'Passenger communication, accessibility support and controller options prepared.'},
    {time:'08:17:19', type:'Control', title:'Execution blocked', detail:'Policy RG-HITL-001 requires human approval before customer-facing action.'},
    {time:'08:41:52', type:'Approve', title:'Separate incident plan approved', detail:'Human controller approved recommendation for RG-2026-0903-003.'}
  ],
  controls: [
    {name:'Human approval gate', score:100, status:'Healthy'},
    {name:'Recommendation rationale', score:98, status:'Healthy'},
    {name:'Audit event completeness', score:94, status:'Healthy'},
    {name:'Passenger-message guardrail', score:91, status:'Healthy'},
    {name:'Model confidence threshold', score:89, status:'Watch'}
  ],
  governance: [
    {title:'Human-in-the-loop', status:'Enforced', detail:'No operational or passenger-facing execution without accountable human approval.'},
    {title:'Explainability', status:'Enabled', detail:'Decision rationale, confidence and source indicators are shown to the reviewer.'},
    {title:'Auditability', status:'Enabled', detail:'Before state, action, approver, after state and verification are retained.'},
    {title:'Data minimisation', status:'Designed', detail:'Prototype uses only the minimum simulated operational context needed for the decision.'},
    {title:'Override & contestability', status:'Enabled', detail:'Human controllers can reject recommendations and request revision.'},
    {title:'Fail-safe behaviour', status:'Enforced', detail:'If evidence or confidence is insufficient, the system defaults to escalation, not automation.'}
  ]
};
