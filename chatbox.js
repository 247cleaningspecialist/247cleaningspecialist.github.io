(function() {
'use strict';

const CONFIG = {
  businessName: '24/7 Cleaning Specialist',
  agentName: 'Helen',
  phone: '0403 423 348',
  email: 'sales@247cleaningspecialist.com.au',
  color: '#c8922a',
  colorDark: '#0f1e26',
  colorGreen: '#1a7a4a',
  greeting: "Hi! I'm Helen from 24/7 Cleaning Specialist 👋\n\nHow can I help you today?",
  offlineMsg: "We're not online right now but leave your details and we'll call you back within 2 hours.",
};

const FAQS = [
  {
    triggers: ['same day','today','urgent','emergency','asap','quickly','now'],
    answer: "Yes! We offer same-day cleaning. Call us before 12pm on **0403 423 348** and we'll do everything we can to clean your property today. No extra charge for same-day. 🚀"
  },
  {
    triggers: ['price','cost','how much','pricing','rate','charge','fee','quote'],
    answer: "Here are our standard rates:\n\n🏠 **End of Lease:**\n• Studio/1 Bed — from $245\n• 2 Bedroom — from $320\n• 3 Bedroom — from $420\n• + Carpet Steam Clean — +$80\n\n💼 **Commercial:** Free site inspection + fixed quote\n\n📋 **$30 booking fee** secures your appointment. Want a quote for your property?"
  },
  {
    triggers: ['bond','guarantee','bond back','refund','return','agent'],
    answer: "We offer a **30-Day Agent Satisfaction Guarantee** ✅\n\nIf your agent emails us about any cleaning issue within 30 days, we return and fix it free of charge. No arguments, no delays.\n\nWe've returned 1,713+ bonds successfully. Your bond is safe with us. 💪"
  },
  {
    triggers: ['include','included','what do you clean','checklist','oven','carpet','bathroom','kitchen'],
    answer: "Our end of lease clean includes everything on the REIV checklist:\n\n✓ Kitchen — oven, rangehood, cupboards, surfaces\n✓ Bathrooms — tiles, toilet, shower, mirrors\n✓ All bedrooms — wardrobes, skirting boards\n✓ Living areas — floors, windows internal\n✓ Full vacuuming and mopping\n✓ Digital receipt for your agent\n\nCarpet steam clean is an optional add-on (+$80). Want to book?"
  },
  {
    triggers: ['commercial','office','business','company','strata','facilities'],
    answer: "We specialise in commercial cleaning across Melbourne! 🏢\n\nFor commercial clients we offer:\n✓ Free site inspection — no obligation\n✓ Fixed itemised quote within 24 hours\n✓ Net 14 day invoicing — no upfront deposit\n✓ Same dedicated team every visit\n✓ 30-day exit clause\n\nShall I arrange a free site inspection for you?"
  },
  {
    triggers: ['government','council','tender','brimbank','maribyrnong','melton','procurement'],
    answer: "We're fully tender-ready for government and council contracts 🏛\n\n✓ ABN 98 672 172 226 (GST registered)\n✓ $20M public liability insurance\n✓ WHS compliant — SWMS available\n✓ Registered on eProcure\n✓ Net 30 day government invoicing\n\nFor tender enquiries contact Helen Cornelius directly on **0403 423 348** or email sales@247cleaningspecialist.com.au"
  },
  {
    triggers: ['review','rating','stars','airtasker','reputation','trusted'],
    answer: "We have over **2,000 five-star reviews** with a 100% completion rate ⭐\n\n\"Cleaner now than when I moved in.\" — Tyler G.\n\"Real estate agent commented how clean everything was.\" — Tayt B.\n\"Hands down best end of lease clean ever.\" — Solomon G.\n\nOur clients speak for us. Ready to book?"
  },
  {
    triggers: ['pay','payment','how do i pay','payid','card','invoice'],
    answer: "We accept:\n\n💳 **Card payments** — Visa, Mastercard, Amex\n📱 **PayID** — 0403 423 348 (instant, free)\n📄 **Invoice** — for commercial clients (Net 14/30 days)\n\nA $30 booking fee secures your appointment. Full payment is due when our team arrives for residential cleans."
  },
  {
    triggers: ['suburb','area','location','where','travel','cover','service'],
    answer: "We service **all of Greater Melbourne** 📍\n\nWestern suburbs, CBD, northern, eastern and bayside areas. If you're in Melbourne we can come to you.\n\nWhat suburb is your property in? I can confirm availability."
  }
];

const QUICK_REPLIES = [
  { label: '💰 Get a Price', msg: 'How much does it cost?' },
  { label: '⚡ Same-Day Clean', msg: 'Can you clean today?' },
  { label: '🛡 Bond Guarantee', msg: 'What is your bond back guarantee?' },
  { label: '🏢 Commercial Quote', msg: 'I need commercial cleaning' },
];

const CAPTURE_FLOW = [
  { id: 'name', question: "Great! To get back to you quickly, what's your first name?", field: 'name' },
  { id: 'phone', question: "Thanks {name}! What's the best number to reach you on?", field: 'phone' },
  { id: 'service', question: "Perfect. What service do you need?\n\n1. End of lease clean\n2. Steam/carpet clean\n3. Commercial cleaning\n4. Government/tender enquiry\n5. Other", field: 'service' },
  { id: 'done', question: "Brilliant, {name}! We'll call you back on {phone} within 2 hours. Our team will confirm your booking and answer any questions. Talk soon! 😊", field: null }
];

// STATE
let isOpen = false;
let messages = [];
let captureStep = -1;
let captureData = {};
let hasGreeted = false;
let typingTimer = null;

// STYLES
const style = document.createElement('style');
style.textContent = `
  #cb-widget { position: fixed; bottom: 24px; left: 24px; z-index: 99998; font-family: 'Outfit', system-ui, sans-serif; }
  #cb-btn {
    width: 56px; height: 56px; border-radius: 50%; background: ${CONFIG.color};
    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; box-shadow: 0 8px 32px rgba(200,146,42,0.5);
    animation: cb-pulse 2.5s ease infinite; transition: transform 0.2s;
    position: relative;
  }
  #cb-btn:hover { transform: scale(1.08); }
  @keyframes cb-pulse { 0%,100%{box-shadow:0 8px 32px rgba(200,146,42,0.4)} 50%{box-shadow:0 8px 48px rgba(200,146,42,0.7)} }
  #cb-badge {
    position: absolute; top: -4px; right: -4px; background: #e74c3c;
    width: 18px; height: 18px; border-radius: 50%; font-size: 0.65rem;
    font-weight: 700; color: #fff; display: flex; align-items: center; justify-content: center;
    animation: cb-bounce 1s ease infinite;
  }
  @keyframes cb-bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
  #cb-window {
    position: absolute; bottom: 70px; left: 0;
    width: 340px; max-height: 520px;
    background: #0b1418; border: 1px solid rgba(200,146,42,0.25);
    border-radius: 8px; overflow: hidden;
    display: none; flex-direction: column;
    box-shadow: 0 24px 64px rgba(0,0,0,0.6);
    animation: cb-slideup 0.3s ease;
  }
  @keyframes cb-slideup { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  #cb-window.open { display: flex; }
  #cb-header {
    background: ${CONFIG.colorDark}; border-bottom: 1px solid rgba(200,146,42,0.2);
    padding: 14px 16px; display: flex; align-items: center; gap: 10px;
  }
  #cb-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, ${CONFIG.color}, #b8821a);
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0; position: relative;
  }
  #cb-online {
    position: absolute; bottom: 1px; right: 1px;
    width: 9px; height: 9px; background: #4caf7d; border-radius: 50%;
    border: 2px solid ${CONFIG.colorDark};
  }
  #cb-header-info { flex: 1; }
  #cb-header-name { font-size: 0.84rem; font-weight: 600; color: #fff; }
  #cb-header-status { font-size: 0.68rem; color: #4caf7d; }
  #cb-close {
    background: none; border: none; color: #8aa8b8; cursor: pointer;
    font-size: 1rem; padding: 4px; transition: color 0.2s;
  }
  #cb-close:hover { color: #fff; }
  #cb-messages {
    flex: 1; overflow-y: auto; padding: 16px; display: flex;
    flex-direction: column; gap: 10px; scroll-behavior: smooth;
  }
  #cb-messages::-webkit-scrollbar { width: 3px; }
  #cb-messages::-webkit-scrollbar-thumb { background: rgba(200,146,42,0.3); border-radius: 2px; }
  .cb-msg { display: flex; gap: 8px; max-width: 90%; animation: cb-msgin 0.3s ease; }
  @keyframes cb-msgin { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .cb-msg.user { align-self: flex-end; flex-direction: row-reverse; }
  .cb-msg-av {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, ${CONFIG.color}, #b8821a);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; align-self: flex-end;
  }
  .cb-msg.user .cb-msg-av { background: linear-gradient(135deg, #2a5068, #1a3040); }
  .cb-bubble {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
    padding: 10px 13px; border-radius: 12px 12px 12px 2px;
    font-size: 0.81rem; color: #f0f4f6; line-height: 1.6; white-space: pre-wrap;
  }
  .cb-msg.user .cb-bubble {
    background: rgba(200,146,42,0.15); border-color: rgba(200,146,42,0.25);
    border-radius: 12px 12px 2px 12px; color: #fff;
  }
  .cb-bubble strong { color: ${CONFIG.color}; font-weight: 600; }
  .cb-bubble a { color: ${CONFIG.color}; text-decoration: none; }
  #cb-typing { display: none; align-items: center; gap: 8px; padding: 4px 0; }
  #cb-typing.show { display: flex; }
  .cb-typing-dots { display: flex; gap: 4px; }
  .cb-typing-dots span {
    width: 7px; height: 7px; background: rgba(200,146,42,0.5); border-radius: 50%;
    animation: cb-dot 1.2s ease infinite;
  }
  .cb-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .cb-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes cb-dot { 0%,60%,100%{transform:scale(1);opacity:0.5} 30%{transform:scale(1.3);opacity:1} }
  #cb-quick { padding: 10px 12px 0; display: flex; gap: 6px; flex-wrap: wrap; }
  .cb-qr {
    background: rgba(200,146,42,0.1); border: 1px solid rgba(200,146,42,0.25);
    color: ${CONFIG.color}; padding: 5px 10px; border-radius: 14px;
    font-size: 0.71rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    white-space: nowrap;
  }
  .cb-qr:hover { background: rgba(200,146,42,0.2); border-color: rgba(200,146,42,0.5); }
  #cb-input-row {
    border-top: 1px solid rgba(255,255,255,0.07);
    padding: 10px 12px; display: flex; gap: 8px; align-items: center;
    background: rgba(255,255,255,0.02);
  }
  #cb-input {
    flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px; padding: 8px 14px; font-family: inherit;
    font-size: 0.81rem; color: #fff; outline: none; transition: border-color 0.2s;
  }
  #cb-input:focus { border-color: rgba(200,146,42,0.4); }
  #cb-input::placeholder { color: #8aa8b8; }
  #cb-send {
    width: 34px; height: 34px; border-radius: 50%; background: ${CONFIG.color};
    border: none; cursor: pointer; display: flex; align-items: center;
    justify-content: center; font-size: 0.85rem; flex-shrink: 0;
    transition: all 0.2s; color: #0f1e26;
  }
  #cb-send:hover { background: #e8b84b; transform: scale(1.05); }
  #cb-call-bar {
    background: rgba(26,122,74,0.15); border-top: 1px solid rgba(26,122,74,0.25);
    padding: 8px 12px; display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  #cb-call-bar a {
    font-size: 0.74rem; font-weight: 700; color: #4caf7d; text-decoration: none;
    letter-spacing: 0.05em;
  }
  #cb-call-bar span { font-size: 0.72rem; color: #8aa8b8; }
  @media(max-width:400px) { #cb-window { width: 300px; } }
`;
document.head.appendChild(style);

// HTML
const widget = document.createElement('div');
widget.id = 'cb-widget';
widget.innerHTML = `
  <div id="cb-window">
    <div id="cb-header">
      <div id="cb-avatar">👩‍💼<div id="cb-online"></div></div>
      <div id="cb-header-info">
        <div id="cb-header-name">Helen — 24/7 Cleaning</div>
        <div id="cb-header-status">● Online now · replies instantly</div>
      </div>
      <button id="cb-close" onclick="cbClose()">✕</button>
    </div>
    <div id="cb-messages">
      <div id="cb-typing">
        <div class="cb-msg-av">👩‍💼</div>
        <div class="cb-typing-dots"><span></span><span></span><span></span></div>
      </div>
    </div>
    <div id="cb-quick"></div>
    <div id="cb-input-row">
      <input id="cb-input" type="text" placeholder="Type your message..." autocomplete="off">
      <button id="cb-send">➤</button>
    </div>
    <div id="cb-call-bar">
      <span>Prefer to call?</span>
      <a href="tel:0403423348">📞 0403 423 348</a>
    </div>
  </div>
  <button id="cb-btn" onclick="cbToggle()">
    💬
    <div id="cb-badge">1</div>
  </button>
`;
document.body.appendChild(widget);

// HELPERS
function formatMsg(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function addMessage(text, isUser = false, delay = 0) {
  setTimeout(() => {
    const msgs = document.getElementById('cb-messages');
    const typing = document.getElementById('cb-typing');
    const div = document.createElement('div');
    div.className = 'cb-msg' + (isUser ? ' user' : '');
    div.innerHTML = `
      <div class="cb-msg-av">${isUser ? '👤' : '👩‍💼'}</div>
      <div class="cb-bubble">${formatMsg(text)}</div>
    `;
    msgs.insertBefore(div, typing);
    msgs.scrollTop = msgs.scrollHeight;
  }, delay);
}

function showTyping(duration = 1200) {
  const typing = document.getElementById('cb-typing');
  typing.classList.add('show');
  setTimeout(() => {
    typing.classList.remove('show');
  }, duration);
}

function botReply(text, delay = 1200) {
  showTyping(delay - 200);
  addMessage(text, false, delay);
}

function showQuickReplies() {
  const qr = document.getElementById('cb-quick');
  qr.innerHTML = '';
  QUICK_REPLIES.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'cb-qr';
    btn.textContent = r.label;
    btn.onclick = () => handleInput(r.msg);
    qr.appendChild(btn);
  });
}

function hideQuickReplies() {
  document.getElementById('cb-quick').innerHTML = '';
}

function findFAQ(input) {
  const lower = input.toLowerCase();
  for (const faq of FAQS) {
    if (faq.triggers.some(t => lower.includes(t))) {
      return faq.answer;
    }
  }
  return null;
}

function handleCapture(input) {
  const step = CAPTURE_FLOW[captureStep];
  if (!step) return false;

  if (step.field) {
    captureData[step.field] = input;
  }

  captureStep++;
  const next = CAPTURE_FLOW[captureStep];

  if (next) {
    let q = next.question;
    q = q.replace('{name}', captureData.name || '');
    q = q.replace('{phone}', captureData.phone || '');
    botReply(q);

    if (!next.field) {
      // Done — show quick replies again after
      setTimeout(() => {
        botReply("Is there anything else I can help you with? 😊", 2000);
        setTimeout(showQuickReplies, 3500);
        captureStep = -1;
        captureData = {};
      }, 1500);
    }
  }
  return true;
}

function handleInput(text) {
  if (!text.trim()) return;

  addMessage(text, true);
  document.getElementById('cb-input').value = '';
  hideQuickReplies();

  // Check capture flow
  if (captureStep >= 0) {
    handleCapture(text);
    return;
  }

  // Check for booking intent
  const bookTriggers = ['book','booking','appointment','schedule','reserve','yes','sure','please','ok','okay','yep','yeah'];
  const lower = text.toLowerCase();
  const wantsBook = bookTriggers.some(t => lower.includes(t)) && lower.length < 40;

  // Check FAQ
  const faqAnswer = findFAQ(text);

  if (faqAnswer) {
    botReply(faqAnswer);
    setTimeout(() => {
      botReply("Can I help you book a clean or get a quote? Just say yes and I'll take your details. 😊", 2500);
      showQuickReplies();
    }, 3000);
  } else if (wantsBook && Object.keys(captureData).length === 0) {
    captureStep = 0;
    botReply(CAPTURE_FLOW[0].question);
  } else {
    // Fallback
    const fallbacks = [
      "I want to make sure I give you the right information! Could you tell me a bit more about what you need? Or choose one of the options below 👇",
      "Thanks for reaching out! For the quickest response, call us directly on **0403 423 348** — or choose what you need below and I can help right away.",
      "Let me connect you with the right information. What type of clean are you looking for? 😊"
    ];
    botReply(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    setTimeout(showQuickReplies, 1800);
  }
}

// OPEN / CLOSE
window.cbToggle = function() {
  isOpen ? cbClose() : cbOpen();
};

window.cbClose = function() {
  isOpen = false;
  document.getElementById('cb-window').classList.remove('open');
  document.getElementById('cb-btn').innerHTML = '💬<div id="cb-badge" style="display:none">1</div>';
};

function cbOpen() {
  isOpen = true;
  document.getElementById('cb-window').classList.add('open');
  document.getElementById('cb-badge').style.display = 'none';

  if (!hasGreeted) {
    hasGreeted = true;
    showTyping(1500);
    addMessage(CONFIG.greeting, false, 1500);
    setTimeout(showQuickReplies, 2500);
  }

  setTimeout(() => document.getElementById('cb-input').focus(), 300);
}

// INPUT EVENTS
document.getElementById('cb-send').addEventListener('click', () => {
  handleInput(document.getElementById('cb-input').value);
});

document.getElementById('cb-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleInput(e.target.value);
});

// AUTO OPEN after 25 seconds if not interacted
setTimeout(() => {
  if (!isOpen && !hasGreeted) {
    cbOpen();
  }
}, 25000);

})();
