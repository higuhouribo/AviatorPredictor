// PMT Trading Solutions - All-in-One Business-Style App

// --- Branding and Quotes (loaded from quotes.json if available) ---
const BRANDING = {
  title: "PMT TRADING SOLUTIONS",
  owner: "Lil Jee-FX",
  contactEmail: "pmtservices123@gmail.com",
  contactPhone: "083 479 7921"
};

let QUOTES = [
  "Plan your trade, trade your plan.",
  "Risk management is your real edge.",
  "Losses are tuition – learn and adapt.",
  "Discipline beats motivation.",
  "Trade what you see, not what you feel."
];
try {
  fetch('quotes.json').then(r=>r.json()).then(q=>QUOTES=q);
} catch {}

function showQuote() {
  const pick = QUOTES[Math.floor(Math.random()*QUOTES.length)];
  return `<div class="quotes-box">${pick}</div>`;
}

const VALID_MEMBER_IDS = [
  "PMT-865-543", "PMT-854-432", "PMT-099-112", "PMT-097-776", "PMT-355-887"
];
let memberId = localStorage.getItem("pmt_member_id") || "";

// --- Lessons, Strategies, Quizzes, Setups, News ---
const LESSONS = [
  {
    id:1, title:"Support & Resistance Zones", summary:"Find the key turning points in any market.",
    img:"https://www.babypips.com/assets/forex-support-and-resistance-1-9c7d302a20e2a5c5f3c8e2e3d3d3c3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d.png",
    content:`
    <b>What is Support?</b> <br>
    A price level where the market tends to bounce upward. Think of it as the “floor” for price.
    <ul>
      <li>Look for multiple touches and wicks at the same area.</li>
      <li>Volume spikes at support can mean strong buying interest.</li>
      <li>Support zones are more effective than single lines.</li>
    </ul>
    <b>What is Resistance?</b> <br>
    A price level where the market tends to bounce downward. This is the “ceiling” for price.
    <ul>
      <li>Look for failed breakouts and rejections at resistance.</li>
      <li>Combine with chart patterns for higher probability.</li>
    </ul>
    <b>How to Use:</b>
    <ul>
      <li>Buy near support, sell near resistance.</li>
      <li>Wait for confirmation: candles, volume, divergence.</li>
      <li>Combine with trend and structure for best results.</li>
    </ul>
    <b>Pro Tip:</b> Mark zones on higher timeframes for best accuracy.
    `
  },
  {
    id:2, title:"Market Structure: HH, HL, LH, LL", summary:"Decode trend with highs and lows.",
    img:"https://www.tradingwithrayner.com/wp-content/uploads/2020/09/market-structure.png",
    content:`
    <b>Basic Structure:</b>
    <ul>
      <li>Uptrend: Higher Highs (HH) and Higher Lows (HL)</li>
      <li>Downtrend: Lower Highs (LH) and Lower Lows (LL)</li>
    </ul>
    <b>How to Trade:</b>
    <ul>
      <li>Buy on HL in uptrend, sell on LH in downtrend.</li>
      <li>Use structure breaks as reversal signals.</li>
    </ul>
    <b>Advanced:</b>
    <ul>
      <li>Combine structure with S/R and volume for more powerful setups.</li>
    </ul>
    `
  },
  {
    id:3, title:"Candlestick Mastery", summary:"Spot reversals and continuations with candlesticks.",
    img:"https://www.tradingwithrayner.com/wp-content/uploads/2020/09/candlestick-patterns-bullish-engulfing.png",
    content:`
    <b>Key Candles:</b>
    <ul>
      <li><b>Bullish Engulfing</b>: Strong buy reversal</li>
      <li><b>Bearish Engulfing</b>: Strong sell reversal</li>
      <li><b>Hammer / Pin Bar</b>: Wick rejection, reversal</li>
      <li><b>Doji</b>: Indecision, possible reversal</li>
    </ul>
    <b>Using Candlesticks:</b>
    <ul>
      <li>Always confirm with key zones for best results.</li>
      <li>Use on 15m, 1H, 4H and Daily for reliability.</li>
      <li>Look for patterns in context (trend, zone, volume).</li>
      <li>Multi-bar patterns (Morning Star, Evening Star, Three Soldiers, Three Crows) can signal strong reversals.</li>
    </ul>
    `
  },
  {
    id:4, title:"Order Blocks (SMC)", summary:"Institutional footprints on the chart.",
    img:"https://cdn.babypips.com/media/order-blocks.png",
    content:`
    <b>What is an Order Block?</b><br>
    Zones where big players accumulate orders before a sharp move.
    <ul>
      <li>Usually found before major breakouts or trend reversals.</li>
      <li>Mark as zones, not single lines.</li>
      <li>Combine with S/R & confirmation candle for entries.</li>
      <li>Order block + liquidity grab is a powerful confluence.</li>
      <li>Look for breaker blocks after a failed move.</li>
    </ul>
    `
  },
  {
    id:5, title:"Liquidity Grabs & Stop Hunts", summary:"Spot stophunt moves before reversals.",
    img:"https://www.learntotradethemarket.com/wp-content/uploads/2018/12/liquidity-forex.png",
    content:`
    <b>What is a Liquidity Grab?</b><br>
    When price spikes beyond a key level to trigger stops and then reverses sharply.
    <ul>
      <li>Fake breakouts often happen before real moves.</li>
      <li>Watch for long wicks above resistance or below support.</li>
      <li>Works best when followed by an engulfing or pin bar candle.</li>
    </ul>
    <b>How to Trade:</b>
    <ul>
      <li>Wait for the spike, then enter on reversal confirmation.</li>
    </ul>
    `
  },
  {
    id:6, title:"Fibonacci Retracement & Extensions", summary:"Measure pullbacks and targets using Fibs.",
    img:"https://www.tradingwithrayner.com/wp-content/uploads/2020/09/fibonacci.png",
    content:`
    <b>Fibonacci Retracement:</b>
    <ul>
      <li>Used to measure how far a trend will pull back before resuming.</li>
      <li>Key levels: 38.2%, 50%, 61.8%.</li>
      <li>Combine with S/R, structure, or candle pattern at the level for entry.</li>
    </ul>
    <b>Fibonacci Extension:</b>
    <ul>
      <li>Projects move targets (TP areas) beyond current price.</li>
      <li>Common targets: 127.2%, 161.8%, 200%.</li>
    </ul>
    <b>Pro Tip:</b> Use Fibs only in clear trends and with confluence!
    `
  },
  {
    id:7, title:"Moving Averages (MA)", summary:"Spot trend, dynamic S/R, and entries with MAs.",
    img:"https://www.tradingwithrayner.com/wp-content/uploads/2020/09/ma-pullback.png",
    content:`
    <b>Types:</b>
    <ul>
      <li><b>SMA</b>: Simple, smooths price. <b>EMA</b>: Exponential, reacts faster.</li>
    </ul>
    <b>How to Use:</b>
    <ul>
      <li>20/50 EMA for trend direction and pullback entries (intraday/scalp).</li>
      <li>100/200 EMA for big trend, swing S/R.</li>
      <li>Crossovers (fast MA above slow MA = uptrend, vice versa).</li>
      <li>Wait for price action at MA: rejection, bounce, or cross.</li>
    </ul>
    `
  },
  {
    id:8, title:"RSI, MACD, & Momentum", summary:"Identify overbought/oversold and trend shifts.",
    img:"https://www.tradingwithrayner.com/wp-content/uploads/2020/09/rsi.png",
    content:`
    <b>RSI (Relative Strength Index):</b>
    <ul>
      <li>Above 70: Overbought. Below 30: Oversold.</li>
      <li>Look for divergence between RSI and price for reversals.</li>
      <li>Combine with S/R and price action for best results.</li>
    </ul>
    <b>MACD:</b>
    <ul>
      <li>Shows momentum and crossovers (bullish/bearish).</li>
      <li>Histogram above 0 = bullish, below 0 = bearish.</li>
    </ul>
    <b>Stochastic:</b>
    <ul>
      <li>Like RSI, but more sensitive. 80/20 key levels.</li>
    </ul>
    `
  },
  {
    id:9, title:"Chart Patterns", summary:"Triangles, Head & Shoulders, Double Tops/Bottoms, and more.",
    img:"https://www.tradingwithrayner.com/wp-content/uploads/2020/09/chart-patterns.png",
    content:`
    <b>Common Patterns:</b>
    <ul>
      <li><b>Double Top/Bottom</b>: Reversal pattern, M or W shape.</li>
      <li><b>Head & Shoulders</b>: Reversal, signals trend change.</li>
      <li><b>Ascending/Descending Triangle</b>: Continuation/breakout pattern.</li>
      <li><b>Flags & Pennants</b>: Continuation after strong trend move.</li>
    </ul>
    <b>How to Use:</b>
    <ul>
      <li>Wait for breakout with volume.</li>
      <li>Set SL below/above pattern, TP at measured move.</li>
    </ul>
    `
  },
  {
    id:10, title:"Trading Psychology & Risk", summary:"Master your mind and your risk.",
    img:"https://www.babypips.com/assets/psychology.png",
    content:`
    <b>Discipline:</b> <br>
    <ul>
      <li>Follow your plan, even after a string of losses or wins.</li>
      <li>Never revenge trade.</li>
    </ul>
    <b>Risk Management:</b>
    <ul>
      <li>Risk 1-2% per trade. Use stop loss, never move it further from entry.</li>
      <li>Accept losses as part of the game. Consistency is key.</li>
    </ul>
    <b>Mindset:</b>
    <ul>
      <li>Review and journal your trades. Learn from both wins and losses.</li>
      <li>Keep emotions in check. Practice gratitude and patience.</li>
    </ul>
    `
  }
];

// --- STRATEGIES, QUIZZES, SETUPS, NEWS_EVENTS (as in previous code, but expand as needed) ---

// (rest of app.js unchanged, as in previous file: navigation, rendering, event handlers, etc.)