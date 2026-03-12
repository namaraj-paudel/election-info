// ─── ELECTION CONFIG ──────────────────────────────────────────────────────────
const CONFIG = {
    totalSeats: 275, // कुल प्रतिनिधिसभा सिट
    fptp: 165, // प्रत्यक्ष (FPTP) सिट
    prSeats: 110, // समानुपातिक (PR) सिट
    thresholdPct: 3, // PR थ्रेसहोल्ड (%)
    electionYear: "२०८२", // निर्वाचन वर्ष (string)
};

// ─── PARTIES ──────────────────────────────────────────────────────────────────
// name      : दलको पूरा नाम
// nameShort : (optional) लामो नाम भएमा table मा छोटो नाम देखाउन
// symbol    : Image नभएमा badge मा देखिने text (१–४ अक्षर, fallback)
// image     : (optional) चुनाव चिन्हको image path
// color     : दलको रंग (hex) — badge border र parliament bar मा प्रयोग हुन्छ
// prVotes   : PR मा प्राप्त सदर मत (संख्या)
// fptp      : प्रत्यक्ष निर्वाचनमा जितेका सिट (संख्या)

const PARTIES = [
    {
        name: "राष्ट्रिय स्वतन्त्र पार्टी",
        symbol: "रास्वपा",
        image: "images/ghanti.jpg",
        color: "#2980b9",
        prVotes: 5183493,
        fptp: 125,
    },
    {
        name: "नेपाली काँग्रेस",
        symbol: "काँग्रेस",
        image: "images/rukh.jpg",
        color: "#27ae60",
        prVotes: 1759172,
        fptp: 18,
    },
    {
        name: "नेपाल कम्युनिष्ट पार्टी (एमाले)",
        symbol: "एमाले",
        image: "images/surya.jpg",
        color: "#e74c3c",
        prVotes: 1455885,
        fptp: 9,
    },
    {
        name: "नेपाली कम्युनिष्ट पार्टी",
        symbol: "नेकपा",
        image: "images/tara.jpg",
        color: "#8b1a1a",
        prVotes: 811577,
        fptp: 8,
    },
    {
        name: "श्रम संस्कृति पार्टी",
        symbol: "श्रम",
        image: "images/mato.jpg",
        color: "#7f8c8d",
        prVotes: 385856,
        fptp: 3,
    },
    {
        name: "राष्ट्रिय प्रजातन्त्र पार्टी",
        symbol: "राप्रपा",
        image: "images/halo.jpg",
        color: "#c9a800",
        prVotes: 330684,
        fptp: 1,
    },
    {
        name: "जनता समाजवादी पार्टी, नेपाल",
        symbol: "जसपा",
        image: "images/chhata.jpg",
        color: "#16a085",
        prVotes: 182285,
        fptp: 0,
    },
    {
        name: "राष्ट्रिय परिवर्तन पार्टी",
        symbol: "रापपा",
        image: "images/basuri.jpg",
        color: "#d35400",
        prVotes: 172493,
        fptp: 0,
    },
    {
        name: "जनमत पार्टी",
        symbol: "जपा",
        image: "images/mic.png",
        color: "#8e44ad",
        prVotes: 79435,
        fptp: 0,
    },
    {
        name: "एकल चिन्ह चकिया (जाँतो) (राष्ट्रिय मुक्ति पार्टी नेपाल/जनता समाजवादी पार्टी/नागरिक उन्मुक्ति पार्टी, नेपाल)",
        symbol: "जाँतो",
        image: "images/jato.jpg",
        color: "#999",
        prVotes: 62069,
        fptp: 0,
    },
    {
        name: "नेपाल मजदुर किसान पार्टी",
        symbol: "नेमकिपा",
        image: "images/madal.png",
        color: "#bbb",
        prVotes: 42301,
        fptp: 0,
    },
    {
        name: "राष्ट्र निर्माण दल नेपाल",
        symbol: "रानिदाने",
        image: "images/bottle.jpg",
        color: "#ccc",
        prVotes: 39577,
        fptp: 0,
    },
    {
        name: "राष्ट्रिय जनमोर्चा",
        symbol: "राज",
        image: "images/gilas.png",
        color: "#ccc",
        prVotes: 29455,
        fptp: 0,
    },
    {
        name: "एकल चिन्ह बस (नेपाल संघीय समाजवादी पार्टी/बहुजन एकता पार्टी नेपाल/नेपाल जनजागृति पार्टी)",
        symbol: "बस",
        image: "images/bus.jpg",
        color: "#ccc",
        prVotes: 29436,
        fptp: 0,
    },
    {
        name: "नेपाल जनता संरक्षण पार्टी",
        symbol: "नेजसपा",
        image: "images/doko.jpg",
        color: "#ccc",
        prVotes: 28424,
        fptp: 0,
    },
    {
        name: "प्रगतिशील लोकतान्त्रिक पार्टी",
        symbol: "प्रलोपा",
        image: "images/aankha.jpg",
        color: "#ccc",
        prVotes: 24675,
        fptp: 0,
    },
    {
        name: "नेपाल कम्युनिस्ट पार्टी (माओवादी)",
        symbol: "माओवादी",
        image: "images/gulab.jpg",
        color: "#ccc",
        prVotes: 23864,
        fptp: 0,
    },
    {
        name: "अन्य",
        symbol: "अन्य",
        image: "images/swostik.jpg",
        color: "#ccc",
        prVotes: 194346,
        fptp: 0,
    },
    {
        name: "स्वतन्त्र",
        symbol: "स्वतन्त्र",
        image: "images/tribhuj.jpg",
        color: "#636e72",
        prVotes: 0,
        fptp: 1,
    },
];

// ─── END CONFIG ───────────────────────────────────────────────────────────────