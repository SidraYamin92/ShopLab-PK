# ShopLab PK

> **Live Study →** [https://SidraYamin92.github.io/ShopLab-PK/](https://SidraYamin92.github.io/ShopLab-PK/)

An immersive, e-commerce-themed research platform built for a between-subjects experiment on AI persuasion susceptibility among Pakistani online shoppers. Participants browse simulated product listings — just like Daraz or Amazon — and rate their purchase intent naturally, without knowing they are in a study about cognitive biases and AI dark patterns.

---

## Research

**Study:** Caught in the Acceptance Paradox: Cognitive Reflection and Technology Acceptance as Opposing Determinants of Dark Pattern Susceptibility in Emerging Digital Markets

**Institution:** NED University of Engineering and Technology, Karachi, Pakistan

**Authors:** Sidra Yamin • Imran Bashir

**Target journal:** Computers in Human Behavior (Elsevier, Q1)

| | |
|---|---|
| Design | Between-subjects experiment (7 scenarios × A/B conditions) |
| Target N | 200 participants |
| Duration | 18–22 minutes |
| Population | Pakistani online shoppers, aged 18–45 |
| Ethics | Anonymous • No PII collected • Informed consent • Full debrief |

### Core Research Questions

- Does **Cognitive Reflection Ability (CRT)** protect users against AI persuasion dark patterns?
- Does **Technology Acceptance (TAM)** paradoxically amplify vulnerability to AI manipulation?
- Does the **CRT × TAM interaction** define a user susceptibility profile?
- Is there a culturally specific **Manipulation Threshold** in the Pakistani digital market where scarcity cues backfire?

---

## How It Works

Participants land on the ShopLab PK platform — styled as a Pakistani e-commerce site — and browse 7 product pages. Each product embeds one cognitive-bias manipulation, randomly assigned to Condition A or B per participant (50/50 split, independent across all 7 scenarios). Purchase intent ratings are collected naturally after each product, embedded as "Rate This Product" feedback rather than explicit survey questions.

After browsing, participants complete validated psychometric scales presented as platform feedback forms, followed by three logic puzzles framed as a reward challenge (the Cognitive Reflection Test).

All data is submitted as a single JSON object to Google Sheets on completion.

---

## File Structure

```
ShopLab-PK/
├── index.html      # Full platform — all sections, scenarios, and scales
├── script.js       # Randomisation, condition assignment, data capture, submission
├── styles.css      # E-commerce UI theme (Daraz-inspired)
└── README.md
```

---

## Deployment

This project is hosted on **GitHub Pages** — no server, no backend, no cost.

**Live URL:**
```
https://SidraYamin92.github.io/ShopLab-PK/
```

To deploy your own fork:
1. Fork this repository
2. Go to **Settings → Pages**
3. Source: **Deploy from branch** → `main` → `/ (root)`
4. Your live URL appears within 2 minutes

---

## Data Collection Setup

Responses are sent to Google Sheets via a Google Form integration in `script.js`. To configure your own:

1. Create a Google Form with a single long-text question
2. Find the form's `action` URL and the `entry.XXXXXXXXX` field name from the form source
3. In `script.js`, replace:

```javascript
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';
const ENTRY_ID = 'entry.YOUR_ENTRY_ID';
```

4. Submit one test response and verify the JSON row appears in your linked Google Sheet

**Backup:** All responses are also saved to the participant's browser localStorage in case of network failure.

---

## Randomisation

On page load, `script.js` independently assigns each of the 7 scenarios to Condition A or B:

```javascript
for (let i = 1; i <= 7; i++) {
    state.scenarioConditions[`scenario${i}`] = Math.random() < 0.5 ? 'A' : 'B';
}
```

Condition assignments are saved with every submission inside `metadata.scenarioConditions`, enabling clean between-subjects analysis.

---

## Ethical Compliance

- No personally identifiable information collected
- Informed consent obtained at the start of every session
- Participants fully debriefed on the purpose and manipulations after completion
- Participation is voluntary; session can be abandoned at any time
- Data stored anonymously in Google Sheets
- Study conducted under NED University ethics guidelines

---

## Citation

```bibtex
@software{yamin2026shoplabpk,
  author    = {Yamin, Sidra and Bashir, Imran},
  title     = {ShopLab PK: E-Commerce Research Simulation Platform},
  year      = {2026},
  publisher = {NED University of Engineering and Technology},
  url       = {https://github.com/SidraYamin92/ShopLab-PK}
}
```

---

## Contact

**Sidra Yamin**  
sidrashahid535@gmail.com  
NED University of Engineering and Technology, Karachi  
ORCID: [0000-0001-5799-9896](https://orcid.org/0000-0001-5799-9896)

