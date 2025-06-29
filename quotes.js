// quotes.js - Rotates inspirational quotes on each page
const quotes = [
  "Success is not the key to happiness. Happiness is the key to success.",
  "Great mentors inspire action, not just knowledge.",
  "The best leaders are those most interested in surrounding themselves with assistants and associates smarter than they are.",
  "Empower others and you will empower yourself.",
  "A mentor is someone who allows you to see the hope inside yourself.",
  "Teaching is the greatest act of optimism."
];
function showQuote() {
  const box = document.getElementById('quote-box');
  if(box) {
    box.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    box.style.fontStyle = "italic";
    box.style.color = "#07c24a";
    box.style.marginTop = "25px";
    box.style.textAlign = "center";
  }
}
showQuote();