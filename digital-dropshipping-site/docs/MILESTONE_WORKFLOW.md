# Milestone Workflow Best Practices

## Overview
This document outlines the recommended milestone-based project management workflow for Unitiv, based on industry best practices.

## Why Milestones Win

* **Risk Control (Both Sides):** Client funds each chunk in escrow; freelancer doesn't work unpaid; if something goes wrong, exposure is limited to the current milestone.
* **Momentum & Clarity:** A deliverable + review every 1–3 weeks keeps scope honest and feedback tight.
* **Cash Flow:** Freelancers get paid regularly instead of waiting to the end.
* **Change Handling:** Scope shifts get priced into the *next* milestone instead of renegotiating a whole contract.
* **Trust:** New clients are far more willing to start with a smaller funded step.

## Milestone Status Workflow

### Status Flow
```
pending → funded → in_progress → submitted → approved → released
                                    ↓
                                 rejected (can be resubmitted)
```

### Status Definitions

1. **pending** - Milestone created but not yet funded
2. **funded** - Client has pre-funded milestone into escrow
3. **in_progress** - Freelancer has started work (only after funding confirmed)
4. **submitted** - Freelancer has submitted deliverable for review
5. **approved** - Client has approved the milestone
6. **released** - Funds have been released to freelancer (auto after approval)
7. **rejected** - Client rejected the submission (can be resubmitted)

## Funding & Payout Rules

### Client Actions
* **Pre-fund milestone:** Client funds the next milestone into escrow before work begins
* **Review window:** Client has **5 business days** to approve or request changes after submission
* **Auto-approval:** If client doesn't respond within 5 business days, milestone auto-approves
* **Auto-release:** On approval, funds automatically release to freelancer

### Freelancer Actions
* **Start work:** Freelancer can only start work after milestone is `funded`
* **Submit deliverable:** Freelancer submits work, milestone status → `submitted`
* **Receive payment:** Funds auto-release when milestone is `approved`

## Recommended Milestone Structure

### For $10,000 Project
1. **Milestone 0 – Discovery/Spec (15%)** - $1,500
   - Scope finalization, success metrics, timelines, wireframe/plan
2. **Milestone 1 – Foundations (25%)** - $2,500
   - Architecture, design system, base components, core flows
3. **Milestone 2 – Feature Pack 1 (25%)** - $2,500
   - First major feature set with demo + acceptance
4. **Milestone 3 – Feature Pack 2 (20%)** - $2,000
   - Additional features/modules
5. **Milestone Final – Handover/Launch (15%)** - $1,500
   - QA, documentation, deployment, knowledge transfer, 7–14 days warranty

### For $3,000 Project
1. **Milestone 1 (30%)** - $900
2. **Milestone 2 (40%)** - $1,200
3. **Milestone 3 (30%)** - $900

## Project Status Updates

### Automatic Status Transitions

When milestone status changes, project status updates automatically:

* **First milestone `submitted` or `approved`:** Project → `in_progress`
* **All milestones `approved` or `released`:** Project → `delivered`
* **Project `delivered`:** Sets `completed_at` timestamp

### Progress Bar Calculation

```
Progress = (Approved + Released milestones) / Total milestones × 100
```

## Edge Cases

### Hourly Work
* Use weekly "time blocks" as milestones
* Pre-fund estimate, reconcile on approval

### Fixed-Price but Super Short (< 1-2 weeks, <$1-2k)
* Take full payment upfront or 50/50 (upfront + on delivery)

### High-Risk Clients / New Relationships
* Start with a paid discovery milestone before committing to the big build

## Terms & Conditions Policy

Add to your T&Cs:

> "Work begins once the current milestone is funded in escrow. Approval window: 5 business days. Lack of response auto-approves and releases funds. Change requests are scoped into a new milestone."

## Implementation Notes

### Auto-Approval Logic
- Milestones in `submitted` status for > 5 business days automatically transition to `approved`
- This prevents clients from holding up payments indefinitely
- Business days exclude weekends and holidays

### Workflow Enforcement
- Freelancers cannot start work (`in_progress`) until milestone is `funded`
- Clients cannot approve until milestone is `submitted`
- System enforces proper status transitions

### Escrow Tracking
- Funds in `funded` status are tracked as "In Escrow"
- Funds in `approved` status are queued for release
- Funds in `released` status have been paid out

