import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

describe("PALM 92 missed-call recovery experiment", () => {
  afterEach(() => vi.useRealTimers());

  it("turns Daniel's high-value missed call into a human-approved appointment with consistent metrics", () => {
    vi.useFakeTimers();
    const { container } = render(<Home />);

    expect(screen.getByText("Good morning, Faith")).toBeTruthy();
    expect(screen.getAllByText("23")).toHaveLength(2);
    expect(screen.getByText("£7,050")).toBeTruthy();
    expect(screen.getAllByText("62")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: /run challenge demo/i }));

    expect(screen.getAllByText("Missed call").length).toBeGreaterThan(0);
    expect(screen.getByText("Daniel Reed · Kitchen quote")).toBeTruthy();

    act(() => vi.advanceTimersByTime(1000));

    fireEvent.change(screen.getByLabelText("Customer response"), { target: { value: "Yes, I would like to continue with the kitchen quote." } });
    fireEvent.change(screen.getByLabelText("Confirmed requirement"), { target: { value: "Kitchen quote" } });
    fireEvent.click(screen.getByRole("button", { name: /record response and continue/i }));
    act(() => vi.advanceTimersByTime(1100));

    expect(container.querySelectorAll(".demo-step.done")).toHaveLength(6);
    expect(screen.getByText("High-value lead identified")).toBeTruthy();
    expect(screen.getByText("Customer response recorded")).toBeTruthy();
    expect(screen.getByText("Availability checked")).toBeTruthy();
    expect(screen.getByText(/shall I confirm the demonstration booking/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /yes, approve demo booking/i }));

    expect(container.querySelectorAll(".demo-step.done")).toHaveLength(7);
    expect(screen.getByText("Human approved · Daniel Reed booked today at 4:00 PM")).toBeTruthy();
    expect(screen.getAllByText("24")).toHaveLength(2);
    expect(screen.getByText("£9,450")).toBeTruthy();
  });

  it("registers seven genuine WebMCP tools that operate on live application state", async () => {
    vi.useRealTimers();
    const tools: Array<{name:string;description:string;inputSchema:{type:string;additionalProperties:boolean};execute:(input:Record<string,string>)=>Promise<Record<string,unknown>>}> = [];
    Object.defineProperty(document, "modelContext", { configurable: true, value: { registerTool: vi.fn(async (tool) => { tools.push(tool); }), unregisterTool: vi.fn() } });
    render(<Home />);

    await waitFor(() => expect(tools).toHaveLength(7));
    expect(tools.map(tool => tool.name)).toEqual([
      "get_unrecovered_leads", "get_lead_details", "prepare_follow_up", "recover_lead",
      "find_available_appointments", "prepare_appointment", "get_recovery_summary",
    ]);
    expect(tools.every(tool => tool.description.length > 20)).toBe(true);
    expect(tools.every(tool => tool.inputSchema.type === "object" && tool.inputSchema.additionalProperties === false)).toBe(true);
    const listResult = await tools.find(tool => tool.name === "get_unrecovered_leads")!.execute({});
    const unrecovered = listResult.leads as LeadResult[];
    expect(unrecovered[0]).toMatchObject({id:"lead-daniel", value:2400});
    let recovery: Record<string,unknown> = {};
    const draft = await tools.find(tool => tool.name === "prepare_follow_up")!.execute({lead_id:"lead-daniel"});
    expect(draft).toMatchObject({sent:false, requires_human_review:true, data_source:"current_page_state"});
    await act(async () => { recovery = await tools.find(tool => tool.name === "recover_lead")!.execute({lead_id:"lead-daniel",customer_response:"Yes, I would like to continue.",requirement:"Kitchen quote"}); });
    expect(recovery).toMatchObject({qualified:true, response_recorded:true, message_sent_by_tool:false, estimated_value:2400});
    const availability = await tools.find(tool => tool.name === "find_available_appointments")!.execute({lead_id:"lead-daniel"});
    expect(availability.slots).toEqual([{id:"slot-today-1600",label:"Today at 4:00 PM"},{id:"slot-tomorrow-0930",label:"Tomorrow at 9:30 AM"}]);
    let booking: Record<string,unknown> = {};
    await act(async () => { booking = await tools.find(tool => tool.name === "prepare_appointment")!.execute({lead_id:"lead-daniel",slot:"Today at 4:00 PM"}); });
    expect(booking).toMatchObject({status:"awaiting_human_approval", estimated_value:2400});
    expect(screen.getByText(/shall I confirm the demonstration booking/i)).toBeTruthy();
    const summary = await tools.find(tool => tool.name === "get_recovery_summary")!.execute({});
    expect(summary).toMatchObject({totalLeads:62,appointmentsBooked:23,recoveredRevenue:7050});
    expect((summary.audit_trail as Array<unknown>).length).toBeGreaterThan(0);
  });
});

type LeadResult = { id: string; value: number };
