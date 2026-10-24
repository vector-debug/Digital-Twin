# GlycoTwin India — Patient Portal

A patient-facing health portal prototype for people with Type 2 diabetes, built on synthetic wearable and glucose data. It shows a patient's vitals, activity, medications, risks and care plan, and includes a guided meditation page.

> **Prototype only.** All data is 100% synthetic and not clinically validated. Do not use it for diagnosis or treatment decisions.

---

## 1. Team Details

| Name              | Role        | Contact                  |
| ----------------- | ----------- | ------------------------ |
| Vishwas Rajawat   | Team Leader | v.rajawat@iitg.ac.in     |
| Yashvardhan Swami | Member      | s.yashvardhan@iitg.ac.in |

## 2. College / Incubator Information

- **College** : Indian Institute of Technology (IIT), Guwahati
## 3. Project Title

**GlycoTwin India — Patient Portal**

## 4. Problem Statement

Traditional healthcare systems primarily rely on periodic checkups and reactive treatments, often failing to identify health risks before complications arise. This is particularly concerning for patients with chronic conditions such as Type 2 Diabetes. The challenge is to develop an AI-powered Digital Twin that integrates historical medical records with real-time wearable sensor data to create a dynamic virtual representation of a patient. The system should predict potential health risks, provide personalized insights, and help doctors make proactive, data-driven decisions, shifting healthcare from reactive treatment to preventive care.

People with Type 2 diabetes in India often take medicines (such as sulfonylureas) whose low-blood-sugar risk peaks at night, and irregular dinner timings and reduced kidney clearance raise that risk further. Patients see their readings only in separate apps, and clinicians see them only at visits. This makes it hard to spot a developing night-time low or to act early.

## 5. Healthcare Use Case

- Show a patient their glucose, heart rate, heart rate variability, steps and sleep from a wearable and continuous glucose monitor in one place.
- Tell the patient plainly what their risk is (for example "High Risk - Nocturnal Hypoglycemia Cascade") and when to book a visit, call the care team or call 112.
- Show a body map of the pancreas, kidneys, heart, brain and eyes. An organ turns red and pulses when the patient's data crosses a standard diabetes target, and selecting it shows the readings behind it and what to do.
- Keep a medication schedule with each medicine's low-sugar risk, so dinner-time doses are visible.
- Offer a guided meditation timer with a session history, since stress affects blood sugar and heart rate.

Three virtual patients are included, from high risk to low risk (see [Data](#data)).

Body map rules (standard diabetes targets, to be confirmed by a clinician before real use):

| Organ | Red when |
|---|---|
| Pancreas | HbA1c 7% or more, or lowest glucose under 70 mg/dL |
| Kidneys | eGFR under 60 or UACR 30 or more |
| Heart | Average heart rate outside 60–100 bpm |
| Brain | One or more severe low-sugar episodes on record |
| Eyes | Diabetes for 5 or more years (no eye data, so this is duration only) |

## 6. Technical Stack

| Layer | Technology |
|---|---|
| UI | HTML, CSS and vanilla JavaScript (no build step, no framework) |
| Templating | A small custom runtime, `portal/support.js` (about 100 lines), that fills `{{holes}}`, `<sc-for>` / `<sc-if>` blocks and event handlers in the `*.dc.html` pages |
| Charts | Inline SVG, drawn from the telemetry in JavaScript |
| Body map | Inline SVG of the body and organs, trimmed from the [shinybody](https://github.com/robert-norberg/shinybody) project (MIT). Organ colours are computed in `Main.dc.html` |
| Meditation bell | Web Audio API (synthesised bell, no audio file) |
| Session history | Browser `localStorage`, per patient |
| Fonts | Geist, Geist Mono and Merriweather via Google Fonts |
| Data | Synthetic JSON and CSV in `Data/` (5-minute telemetry over 24 hours for 3 patients) |
| Local server | Any static file server, for example `python -m http.server` |


## 7. Open-source License Details

This project is distributed under the [MIT License](https://github.com/vector-debug/Digital-Twin/blob/main/LICENSE).

**Copyright:** (c) 2026 Yashvardhan Swami

**Third-party:** the body and organ drawing on the Overview page comes from [shinybody](https://github.com/robert-norberg/shinybody), MIT License, (c) 2024 Moffitt Cancer Center.

---

## Pages

| Page | What it shows |
|---|---|
| Overview | Health summary, vitals cards, interactive body map (organs flagged red when they need attention), 24-hour heart-rate chart, today's medications, activity, when to contact a doctor |
| Vitals | Heart rate, HRV and glucose charts with 6, 12 and 24-hour windows and hover values, plus a readings table |
| Activity | Steps through the day, heart-rate ranges, sleep stages, meals and doses with glucose before and after |
| Medications | Today's schedule with mark-as-taken, next dose, prescription cards, 30-day calendar (green = all doses taken, red = missed) |
| Risks & care plan | Escalation ladder, current risks and lab results |
| Meditate | Timer (5, 10, 15 or 20 min), bell at start and end, breathing guide over a calming scene, history and streak |
| Profile | Patient details, care team, connected devices |
