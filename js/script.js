
// ── Number → Nepali digits (single reliable function for all rendering) ───────
// Converts any number to Nepali numeral string.
// decimals=0 means integer (rounds), decimals>0 keeps that many decimal places.
const ND = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
function ne(n, decimals) {
    if (n == null || isNaN(n)) return "—";
    const d = decimals !== undefined ? decimals : 0;
    // Format with commas in Indian style, then convert digits to Nepali
    if (d === 0) {
        // Use toLocaleString for comma formatting, then swap digits
        return Math.round(n)
            .toLocaleString("en-IN")
            .replace(/[0-9]/g, (c) => ND[+c]);
    } else {
        // For decimals (e.g. divisor ratio): no commas needed
        return n.toFixed(d).replace(/[0-9]/g, (c) => ND[+c]);
    }
}
// Percentage with 2 decimal places in Nepali
const nePct = (p) => ne(p, 2) + "%";

const sn = (p) => p.nameShort || p.name;
const NE = ["१", "२", "३", "४", "५", "६", "७", "८", "९", "१०"];

// Party cell: image if p.image set, else colored circle with symbol text
function partyCell(p) {
    let inner;
    if (p.image) {
        inner = `<img src="${p.image}" alt="${sn(p)}"
               onerror="this.outerHTML='<span style=\\'font-size:0.65rem;font-weight:700;\\'>${p.symbol}</span>'">`;
    } else {
        inner = `<span style="font-size:0.65rem;font-weight:700;">${p.symbol}</span>`;
    }
    return `<div class="party-cell">
    <span class="symbol-badge" style="background:${p.color};${p.image ? "padding:0;" : ""}">${inner}</span>
    ${sn(p)}
  </div>`;
}

// ── Calculations ──────────────────────────────────────────────────────────────
const totalSeats = CONFIG.totalSeats;
const simpleMaj = Math.floor(totalSeats / 2) + 1;
const twoThirds = Math.ceil((totalSeats * 2) / 3);
const totalPR = CONFIG.prSeats;
const thresh = CONFIG.thresholdPct;

const totalPRvotes = PARTIES.reduce((s, p) => s + p.prVotes, 0);
const threshVotes = (totalPRvotes * thresh) / 100;

PARTIES.forEach((p) => {
    p.pct = totalPRvotes > 0 ? (p.prVotes / totalPRvotes) * 100 : 0;
    p.passes = p.prVotes > 0 && p.pct >= thresh;
});

const eligible = PARTIES.filter((p) => p.passes);
const validVotes = eligible.reduce((s, p) => s + p.prVotes, 0);
const divisor = validVotes / totalPR;

eligible.forEach((p) => {
    const raw = p.prVotes / divisor;
    p.prFirst = Math.floor(raw);
    p.remainder = p.prVotes - p.prFirst * divisor;
    p.prSeats = p.prFirst;
});

PARTIES.filter((p) => !p.passes).forEach((p) => {
    p.prFirst = 0;
    p.remainder = 0;
    p.prSeats = 0;
});

const firstAlloc = eligible.reduce((s, p) => s + p.prFirst, 0);
const remaining = totalPR - firstAlloc;
const byRemainder = [...eligible].sort(
    (a, b) => b.remainder - a.remainder,
);
byRemainder.forEach((p, i) => {
    if (i < remaining) p.prSeats += 1;
});

PARTIES.forEach((p) => {
    p.totalSeats = p.prSeats + p.fptp;
});
const grandTotal = PARTIES.reduce((s, p) => s + p.totalSeats, 0);
const sorted = [...PARTIES].sort((a, b) => b.totalSeats - a.totalSeats);
const topParty = sorted[0];
const eligSorted = [...eligible].sort((a, b) => b.prVotes - a.prVotes);
const prRawSorted = [...PARTIES].filter((p) => p.prVotes > 0);
const ineligibleCount = PARTIES.filter(
    (p) => p.prVotes > 0 && !p.passes,
).length;

// ── §0 Header ─────────────────────────────────────────────────────────────────
document.getElementById("h-year").textContent =
    CONFIG.electionYear + " को निर्वाचन";
document.getElementById("footer-txt").innerHTML =
    `<div style="margin-bottom:6px;color:#bbb;font-size:0.68rem;letter-spacing:0.5px;">नेपाल संसद निर्वाचन सिट विवरण — ${CONFIG.electionYear} &nbsp;|&nbsp; FPTP + PR मिश्रित प्रणाली</div>` +
    `<div style="font-size:0.72rem;color:#a09880;margin-bottom:8px;">📊 तथ्यांक स्रोत: <strong style="color:#b8860b;">निर्वाचन आयोग, नेपाल</strong></div>` +
    `<div style="font-size:0.63rem;color:#bbb;border-top:1px solid #e0d8cc;padding-top:8px;margin-top:4px;">© ${new Date().getFullYear()} Namaraj Paudel &nbsp;—&nbsp; All Rights Reserved</div>`;

// ── §1 Basic info ─────────────────────────────────────────────────────────────
document.getElementById("stat-grid").innerHTML = `
  <div class="stat-card red">
    <div class="stat-num">${ne(totalSeats)}</div>
    <div class="stat-label">कुल प्रतिनिधिसभा सिट</div>
    <div class="stat-sub">House of Representatives</div>
  </div>
  <div class="stat-card blue">
    <div class="stat-num">${ne(CONFIG.fptp)}</div>
    <div class="stat-label">प्रत्यक्ष सिट (FPTP)</div>
    <div class="stat-sub">First-Past-The-Post</div>
  </div>
  <div class="stat-card gold">
    <div class="stat-num">${ne(totalPR)}</div>
    <div class="stat-label">समानुपातिक सिट (PR)</div>
    <div class="stat-sub">Proportional Representation</div>
  </div>
  <div class="stat-card green">
    <div class="stat-num">${ne(thresh)}%</div>
    <div class="stat-label">PR थ्रेसहोल्ड</div>
    <div class="stat-sub">न्यूनतम मत प्रतिशत</div>
  </div>`;

document.getElementById("basic-info-rows").innerHTML = `
  <div class="info-row">
    <span class="key">साधारण बहुमत चाहिने</span>
    <span class="val blue">${ne(simpleMaj)} सिट &nbsp;(⌊${ne(totalSeats)}÷२⌋ + १)</span>
  </div>
  <div class="info-row">
    <span class="key">दुई तिहाइ बहुमत चाहिने</span>
    <span class="val red">${ne(twoThirds)} सिट &nbsp;(⌈${ne(totalSeats)} × २/३⌉)</span>
  </div>
  <div class="info-row">
    <span class="key">कुल PR मत गणना (सदर)</span>
    <span class="val">${ne(totalPRvotes)}</span>
  </div>
  <div class="info-row">
    <span class="key">PR थ्रेसहोल्ड मत (${ne(thresh)}%)</span>
    <span class="val gold">${ne(threshVotes)} मत</span>
  </div>
  <div class="info-row">
    <span class="key">निर्वाचन प्रणाली</span>
    <span class="val">मिश्रित प्रणाली (FPTP + PR)</span>
  </div>`;

// ── §2 FPTP ───────────────────────────────────────────────────────────────────
const fptpRows = PARTIES.filter((p) => p.fptp > 0).sort(
    (a, b) => b.fptp - a.fptp,
);
const fptpTotal = fptpRows.reduce((s, p) => s + p.fptp, 0);

document.getElementById("fptp-block").innerHTML = `
  <div class="fptp-explainer">
    <h4>📍 एक क्षेत्र — एक विजेता</h4>
    <p>
      नेपाललाई <strong>${ne(CONFIG.fptp)} निर्वाचन क्षेत्र</strong>मा विभाजन गरिएको छ।
      प्रत्येक क्षेत्रमा उम्मेदवारहरूले प्रतिस्पर्धा गर्छन्।
      जुन उम्मेदवारले <strong>सबैभन्दा बढी मत</strong> पाउँछ — उही जित्छ।
      बहुमत चाहिँदैन, मात्र अरू सबैभन्दा बढी मत पाए पुग्छ।
      यसलाई अंग्रेजीमा <strong>First-Past-The-Post (FPTP)</strong> भनिन्छ।
    </p>
  </div>
  <p style="font-size:0.88rem;color:var(--muted);margin-bottom:18px;line-height:1.75;">
    यस प्रणालीमा मतदाताले <strong>आफ्नो क्षेत्रको उम्मेदवारलाई</strong> मत दिन्छन् —
    दलको चिन्ह होइन, व्यक्तिलाई।
    विजयी उम्मेदवारले त्यो क्षेत्रको प्रत्यक्ष सिट जित्छन्।
  </p>
  <div class="section-label" style="margin-bottom:12px;">प्रत्यक्ष निर्वाचन नतिजा</div>
  <div class="table-wrap">
  <table class="data-table">
    <thead><tr><th>दल</th><th class="r">प्रत्यक्ष सिट</th></tr></thead>
    <tbody>
      ${fptpRows
        .map(
            (p) => `
        <tr>
          <td>${partyCell(p)}</td>
          <td class="r c-blue" style="font-weight:700">${ne(p.fptp)}</td>
        </tr>`,
        )
        .join("")}
      <tr class="total-row">
        <td>जम्मा</td>
        <td class="r c-red">${ne(fptpTotal)}</td>
      </tr>
    </tbody>
  </table>
  </div>`;

// ── §3 PR raw votes ───────────────────────────────────────────────────────────
document.getElementById("pr-votes-block").innerHTML = `
  <div class="highlight-card">
    <div class="hc-num">${ne(totalPRvotes)}</div>
    <div>
      <div class="hc-label">कुल PR मत गणना (सदर)</div>
      <div class="hc-sub">समानुपातिक मतमा परेका सबै सदर मतहरूको जोड</div>
    </div>
  </div>
  <div class="section-label" style="margin-bottom:12px;">PR मतदानको नतिजा</div>
  <div class="table-wrap">
  <table class="data-table">
    <thead><tr><th>दल</th><th class="r">प्राप्त मत</th></tr></thead>
    <tbody>
      ${prRawSorted
        .map(
            (p) => `
        <tr>
          <td>${partyCell(p)}</td>
          <td class="r">${ne(p.prVotes)}</td>
        </tr>`,
        )
        .join("")}
      <tr class="total-row">
        <td>जम्मा</td>
        <td class="r">${ne(totalPRvotes)}</td>
      </tr>
    </tbody>
  </table>
  </div>`;

// ── §3 Steps ──────────────────────────────────────────────────────────────────

const step1Body = `
  <div class="formula-box">
    <div class="f-tbl">
      <div class="f-row"><div class="f-lhs">थ्रेसहोल्ड मत</div><div class="f-op">=</div><div class="f-rhs">कुल मत × ${ne(thresh)}%</div></div>
      <div class="f-row"><div class="f-lhs"></div><div class="f-op">=</div><div class="f-rhs">${ne(totalPRvotes)} × ${ne(thresh)}%</div></div>
      <div class="f-row"><div class="f-lhs"></div><div class="f-op">=</div><div class="f-rhs"><strong>${ne(threshVotes)} मत</strong></div></div>
    </div>
    <span class="comment">— यो भन्दा कम मत पाएका दलले PR सिट पाउँदैनन्</span>
  </div>
  <div class="table-wrap wide">
  <table class="data-table">
    <thead><tr>
      <th>दल</th>
      <th class="r">प्राप्त मत</th>
      <th class="r">% (कुल मतको)</th>
      <th class="r">थ्रेसहोल्ड (${ne(thresh)}%)</th>
    </tr></thead>
    <tbody>
      ${prRawSorted
        .map(
            (p) => `
        <tr>
          <td>${partyCell(p)}</td>
          <td class="r">${ne(p.prVotes)}</td>
          <td class="r ${p.passes ? "c-green" : "c-red"}">${nePct(p.pct)}</td>
          <td class="r">
            <span class="pass-badge ${p.passes ? "yes" : "no"}">${p.passes ? "✓ पास" : "✗ फेल"}</span>
          </td>
        </tr>`,
        )
        .join("")}
    </tbody>
  </table>
  </div>
  <div class="note-box">
    ✅ थ्रेसहोल्ड पार गर्ने: <strong>${ne(eligible.length)} दल</strong> &nbsp;|&nbsp;
    ❌ बाहिरिएका: <strong>${ne(ineligibleCount)} दल + अन्य(साना दलहरू)</strong>
    — तिनले कुनै PR सिट पाउँदैनन्
  </div>`;

const step2Body = `
  <div class="formula-box">
    <div class="f-tbl">
      <div class="f-row"><div class="f-lhs">प्रभावी मत</div><div class="f-op">=</div><div class="f-rhs">थ्रेसहोल्ड पार गर्ने दलहरूको मतको जोड</div></div>
      <div class="f-row"><div class="f-lhs"></div><div class="f-op">=</div><div class="f-rhs">${ne(validVotes)}</div></div>
    </div>
    <br>
    <div class="f-tbl">
      <div class="f-row"><div class="f-lhs">भाजक</div><div class="f-op">=</div><div class="f-rhs">प्रभावी मत ÷ कुल PR सिट</div></div>
      <div class="f-row"><div class="f-lhs"></div><div class="f-op">=</div><div class="f-rhs">${ne(validVotes)} ÷ ${ne(totalPR)}</div></div>
      <div class="f-row"><div class="f-lhs"></div><div class="f-op">=</div><div class="f-rhs"><strong>${ne(divisor)} मत प्रति सिट</strong></div></div>
    </div>
    <span class="comment">— अर्थात् एउटा PR सिट जित्न लगभग यति मत चाहिन्छ</span>
  </div>
  <div class="note-box">
    💡 भाजक ठूलो भयो भने थोरै सिट बाँडिन्छ, सानो भयो भने बढी बाँडिन्छ।
    कुल ${ne(totalPR)} सिट नै रहने गरी भाजक निकालिन्छ।
  </div>`;

const step3Body = `
  <div class="formula-box">
    <div class="f-tbl">
      <div class="f-row"><div class="f-lhs">दलको पहिलो सिट</div><div class="f-op">=</div><div class="f-rhs">⌊ दलको मत ÷ भाजक ⌋</div></div>
    </div>
    <span class="comment">दशमलव काटेर पूर्णांक मात्र लिन्छौं</span>
  </div>
  <div class="table-wrap wide">
  <table class="data-table">
    <thead><tr>
      <th>दल</th>
      <th class="r">मत</th>
      <th class="r">÷ भाजक</th>
      <th class="r">पहिलो सिट</th>
      <th class="r">बाँकी मत</th>
    </tr></thead>
    <tbody>
      ${eligSorted
        .map((p) => {
            const raw = p.prVotes / divisor;
            return `<tr>
          <td>${partyCell(p)}</td>
          <td class="r">${ne(p.prVotes)}</td>
          <td class="r c-muted">${ne(raw, 3)}</td>
          <td class="r c-blue" style="font-weight:700">${ne(p.prFirst)}</td>
          <td class="r">${ne(p.remainder)}</td>
        </tr>`;
        })
        .join("")}
      <tr class="total-row">
        <td>जम्मा</td><td class="r">—</td><td class="r">—</td>
        <td class="r c-blue">${ne(firstAlloc)}</td>
        <td class="r c-red" style="font-size:0.78rem">${ne(remaining)} सिट बाँकी</td>
      </tr>
    </tbody>
  </table>
  </div>
  <div class="note-box">
    पहिलो चरणमा <strong>${ne(firstAlloc)} सिट</strong> बाँडियो।
    कुल ${ne(totalPR)} मध्ये अझै <strong>${ne(remaining)} सिट बाँकी</strong> छ।
  </div>`;

const step4Body = `
  <div class="formula-box">
    <div class="f-tbl">
      <div class="f-row"><div class="f-lhs">बाँकी मत</div><div class="f-op">=</div><div class="f-rhs">दलको मत − (पहिलो सिट × भाजक)</div></div>
    </div>
    <span class="comment">बाँकी मत घट्दो क्रममा राखी माथिबाट ${ne(remaining)} दललाई एक-एक सिट थपिन्छ</span>
  </div>
  <div class="table-wrap">
  <table class="data-table">
    <thead><tr>
      <th>क्रम</th><th>दल</th>
      <th class="r">बाँकी मत</th>
      <th class="r">थपिने सिट</th>
    </tr></thead>
    <tbody>
      ${byRemainder
        .map(
            (p, i) => `
        <tr>
          <td class="c-muted" style="font-family:'IBM Plex Mono',monospace;font-size:0.8rem">${ne(i + 1)}</td>
          <td>${partyCell(p)}</td>
          <td class="r">${ne(p.remainder)}</td>
          <td class="r">${i < remaining
                    ? '<span class="c-green"><strong>+१ ✓</strong></span>'
                    : '<span class="c-muted">—</span>'
                }</td>
        </tr>`,
        )
        .join("")}
    </tbody>
  </table>
  </div>
  <div class="note-box">
    बाँकी ${ne(remaining)} सिट → ${byRemainder
        .slice(0, remaining)
        .map((p) => `<strong>${sn(p)}</strong>`)
        .join(", ")}ले पाए।
  </div>`;

const step5Body = `
  <div class="table-wrap">
  <table class="data-table">
    <thead><tr>
      <th>दल</th>
      <th class="r">पहिलो चरण</th>
      <th class="r">बाँकीबाट</th>
      <th class="r">कुल PR सिट</th>
    </tr></thead>
    <tbody>
      ${eligSorted
        .map((p) => {
            const extra = p.prSeats - p.prFirst;
            return `<tr>
          <td>${partyCell(p)}</td>
          <td class="r">${ne(p.prFirst)}</td>
          <td class="r ${extra > 0 ? "c-green" : "c-muted"}">${extra > 0 ? "+" + ne(extra) + " ✓" : "—"}</td>
          <td class="r c-blue" style="font-weight:700">${ne(p.prSeats)}</td>
        </tr>`;
        })
        .join("")}
      <tr class="total-row">
        <td>जम्मा</td>
        <td class="r">${ne(firstAlloc)}</td>
        <td class="r c-green">+${ne(remaining)}</td>
        <td class="r c-red">${ne(totalPR)}</td>
      </tr>
    </tbody>
  </table>
  </div>`;

const STEPS = [
    {
        title: "थ्रेसहोल्ड जाँच — कुन दल योग्य छ?",
        desc: `PR सिट पाउन दलले कुल सदर मतको <strong>कम्तीमा ${ne(thresh)}%</strong> पाउनैपर्छ।
            यो न्यूनतम सीमा पार नगरेका दलहरू PR बाट <strong>स्वतः बाहिर</strong> हुन्छन्
            — चाहे तिनले प्रत्यक्षमा जितेका भए पनि।`,
        body: step1Body,
    },
    {
        title: "प्रभावी मत र भाजक निकाल्ने",
        desc: `थ्रेसहोल्ड पार गर्ने दलहरूको मात्र मत जोड्छौं — यही हो <strong>प्रभावी मत</strong>।
            त्यसपछि यो प्रभावी मतलाई कुल PR सिट (${ne(totalPR)}) ले भाग गरेर <strong>भाजक</strong> निकाल्छौं।
            भाजकले बताउँछ — एउटा PR सिट जित्न कति मत चाहिन्छ।`,
        body: step2Body,
    },
    {
        title: "पहिलो चरणको सिट बाँडफाँट",
        desc: `प्रत्येक दलको मतलाई भाजकले भाग गर्छौं।
            आउने संख्याको <strong>पूर्णांक मात्र</strong> लिन्छौं (दशमलव फाल्छौं)।
            यो हो पहिलो चरणको सिट।`,
        body: step3Body,
    },
    {
        title: 'बाँकी सिट — "सबैभन्दा ठूलो बाँकी मत" विधि',
        desc: `पहिलो चरणमा दशमलव काटिएर केही मत बाँकी रह्यो।
            बाँकी सिट त्यही <strong>"बाँकी मत" (remainder)</strong>को आधारमा दिइन्छ —
            जसको बाँकी मत सबैभन्दा बढी, उसले पहिले पाउँछ।`,
        body: step4Body,
    },
    {
        title: "अन्तिम PR सिट सारांश",
        desc: `पहिलो चरण + बाँकी सिट जोड्दा प्रत्येक दलको कुल PR सिट निस्कन्छ।`,
        body: step5Body,
    },
];

document.getElementById("pr-steps").innerHTML = STEPS.map(
    (s, i) => `
  <div class="step">
    <div class="step-left">
      <div class="step-num">${NE[i]}</div>
      <div class="step-line"></div>
    </div>
    <div class="step-body">
      <div class="step-title">${s.title}</div>
      <div class="step-desc">${s.desc}</div>
      ${s.body}
    </div>
  </div>`,
).join("");

// ── §4 Parliament bar ─────────────────────────────────────────────────────────
const barSegs = sorted
    .filter((p) => p.totalSeats > 0)
    .map(
        (p) =>
            `<div class="bar-seg" style="flex:${p.totalSeats};background:${p.color}"
    title="${sn(p)}: ${ne(p.totalSeats)} सिट"></div>`,
    )
    .join("");

const simplePct = ((simpleMaj / grandTotal) * 100).toFixed(4);
const twoThrdPct = ((twoThirds / grandTotal) * 100).toFixed(4);

document.getElementById("parl-bar-block").innerHTML = `
  <div class="section-label" style="margin-bottom:10px;">संसदको दृश्य चित्र (${ne(grandTotal)} सिट)</div>
  <div class="parl-bar">${barSegs}</div>
  <div class="majority-lines">
    <div class="maj-line" style="left:${simplePct}%;background:var(--blue)"></div>
    <div class="maj-line-label" style="left:${simplePct}%;color:var(--blue)">↑ साधारण (${ne(simpleMaj)})</div>
    <div class="maj-line" style="left:${twoThrdPct}%;background:var(--red)"></div>
    <div class="maj-line-label" style="left:${twoThrdPct}%;color:var(--red)">↑ दुईतिहाइ (${ne(twoThirds)})</div>
  </div>
  <div class="parl-legend">
    ${sorted
        .filter((p) => p.totalSeats > 0)
        .map(
            (p) =>
                `<div class="legend-item">
         <div class="legend-dot" style="background:${p.color}"></div>
         ${sn(p)} (${ne(p.totalSeats)})
       </div>`,
        )
        .join("")}
  </div>`;

// ── §4 Final table + majority result ─────────────────────────────────────────
const hasTwoThirds = topParty.totalSeats >= twoThirds;
const hasMajority = topParty.totalSeats >= simpleMaj;
const majClass = hasTwoThirds ? "ok" : hasMajority ? "warn" : "none";
const majIcon = hasTwoThirds ? "🏆" : hasMajority ? "⚡" : "⚠️";
const majText = hasTwoThirds
    ? `<strong>${sn(topParty)}सँग दुई तिहाइ बहुमत!</strong>
     ${ne(topParty.totalSeats)} सिट प्राप्त — दुई तिहाइका लागि चाहिने ${ne(twoThirds)} भन्दा
     ${ne(topParty.totalSeats - twoThirds)} सिट बढी। एक्लैले सरकार बनाउन सक्छ।`
    : hasMajority
        ? `<strong>${sn(topParty)}ले ${ne(topParty.totalSeats)} सिट प्राप्त गरि साधारण बहुमत पाएको छ।</strong>
      दुई तिहाइका लागि ${ne(twoThirds - topParty.totalSeats)} सिटले पुगेन।`
        : `<strong>कुनै पनि दलसँग स्पष्ट बहुमत छैन।</strong>
     सबैभन्दा ठूलो: ${sn(topParty)} (${ne(topParty.totalSeats)} सिट)।
     साधारण बहुमत चाहिने: ${ne(simpleMaj)} सिट।`;

document.getElementById("final-block").innerHTML = `
  <div class="table-wrap wide">
  <table class="data-table">
    <thead><tr>
      <th>दल</th>
      <th class="r">प्रत्यक्ष (FPTP)</th>
      <th class="r">समानुपातिक (PR)</th>
      <th class="r">कुल सिट</th>
    </tr></thead>
    <tbody>
      ${sorted
        .filter((p) => p.totalSeats > 0)
        .map(
            (p) => `
        <tr>
          <td>${partyCell(p)}</td>
          <td class="r">${p.fptp > 0 ? ne(p.fptp) : "—"}</td>
          <td class="r">${p.prSeats > 0 ? ne(p.prSeats) : "—"}</td>
          <td class="r c-blue" style="font-weight:700">${ne(p.totalSeats)}</td>
        </tr>`,
        )
        .join("")}
      <tr class="total-row">
        <td>जम्मा</td>
        <td class="r">${ne(CONFIG.fptp)}</td>
        <td class="r">${ne(totalPR)}</td>
        <td class="r c-red">${ne(grandTotal)}</td>
      </tr>
    </tbody>
  </table>
  </div>
  <div class="majority-box ${majClass}">
    <div class="mj-icon">${majIcon}</div>
    <div class="mj-text">${majText}</div>
  </div>`;