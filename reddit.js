const localRecords = [
  { type: 'post', title: 'The quiet infrastructure shift happening in climate tech', body: 'A useful breakdown of the less visible systems and supply chains getting rebuilt around energy, data, and resilience.', subreddit: 'technology', author: 'civic_signal', created: '2026-09-26', score: 1842, comments: 326, source: 'Arctic Shift', url: 'https://www.reddit.com/r/technology/' },
  { type: 'comment', title: 'Re: What a ransomware crew infrastructure tells us', body: 'The hosting pattern is the strongest signal here. Payment addresses alone are too easy to rotate, but the infrastructure overlap is much harder to hide.', subreddit: 'cybersecurity', author: 'civic_signal', created: '2026-09-17', score: 418, comments: 0, source: 'PullPush', url: 'https://www.reddit.com/r/cybersecurity/' },
  { type: 'post', title: 'Open source tools for building your own research workflow', body: 'A practical list of lightweight tools for collecting, checking, and connecting public information without a large budget.', subreddit: 'technology', author: 'civic_signal', created: '2026-08-14', score: 742, comments: 88, source: 'Arctic Shift', url: 'https://www.reddit.com/r/technology/' },
  { type: 'comment', title: 'Re: Satellite imagery shows the fastest-changing urban corridors', body: 'The comparison from 2019 to now is doing more work than the headline. Look at road geometry first, then the building footprint changes.', subreddit: 'worldnews', author: 'civic_signal', created: '2026-07-29', score: 199, comments: 0, source: 'PullPush', url: 'https://www.reddit.com/r/worldnews/' },
  { type: 'post', title: 'A field guide to reading public satellite imagery', body: 'Notes on provenance, shadow length, image metadata, and the common visual traps that make a plausible image look like evidence.', subreddit: 'science', author: 'civic_signal', created: '2026-05-21', score: 1240, comments: 147, source: 'Arctic Shift', url: 'https://www.reddit.com/r/science/' },
  { type: 'comment', title: 'Re: The next launch window is open', body: 'The weather constraint is easy to overlook because the forecast is fine at the pad. Upper-level winds are the interesting part this time.', subreddit: 'space', author: 'civic_signal', created: '2026-04-09', score: 86, comments: 0, source: 'PullPush', url: 'https://www.reddit.com/r/space/' },
  { type: 'post', title: 'How to keep an OSINT notebook auditable', body: 'A simple structure for source links, capture timestamps, confidence levels, and observations that are still waiting for corroboration.', subreddit: 'technology', author: 'civic_signal', created: '2026-02-12', score: 509, comments: 61, source: 'Arctic Shift', url: 'https://www.reddit.com/r/technology/' },
  { type: 'comment', title: 'Re: Researchers publish a new map of the deep ocean carbon cycle', body: 'The useful distinction is between where carbon is stored and where it is moving. Those maps answer different questions.', subreddit: 'science', author: 'civic_signal', created: '2025-11-03', score: 61, comments: 0, source: 'PullPush', url: 'https://www.reddit.com/r/science/' }
];

const input = document.querySelector('#searchInput');
const form = document.querySelector('#searchForm');
const list = document.querySelector('#resultsList');
const count = document.querySelector('#resultCount');
const totalCount = document.querySelector('#totalCount');
const showingCount = document.querySelector('#showingCount');
const queryLabel = document.querySelector('#resultQuery');
const subredditFilter = document.querySelector('#subredditFilter');
const sortFilter = document.querySelector('#sortFilter');
const afterDate = document.querySelector('#afterDate');
const beforeDate = document.querySelector('#beforeDate');
const includeNsfw = document.querySelector('#includeNsfw');
const emptyState = document.querySelector('#emptyState');
const redditLink = document.querySelector('#redditLink');
const archiveStatus = document.querySelector('#archiveStatus');
const activityText = document.querySelector('#activityText');
const weatherText = document.querySelector('#weather');
let activeTab = 'all';
let activeRange = 'all';
let records = [...localRecords];
let searchSequence = 0;
let activityIndex = 0;
const activityMessages = ['ARCHIVE PIPELINES STANDING BY', 'SCANNING PUBLIC SIGNALS', 'INDEXES READY FOR QUERY'];

function formatNumber(value) { return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value); }
function formatDate(value) { return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`)); }
function matchesRange(record) {
  if (activeRange === 'all') return true;
  const age = (Date.now() - new Date(`${record.created}T12:00:00`).getTime()) / 86400000;
  return age <= ({ week: 7, month: 31, year: 365 }[activeRange] || Infinity);
}
function render() {
  const username = input.value.trim().replace(/^u\//i, '').toLowerCase();
  let results = records.filter(record => {
    const inDateWindow = (!afterDate.value || record.created >= afterDate.value) && (!beforeDate.value || record.created <= beforeDate.value);
    return (!username || record.author.toLowerCase().includes(username)) && (activeTab === 'all' || record.type === activeTab) && (subredditFilter.value === 'all' || record.subreddit === subredditFilter.value) && (!record.nsfw || includeNsfw.checked) && inDateWindow && matchesRange(record);
  });
  if (sortFilter.value === 'oldest') results.sort((a, b) => a.created.localeCompare(b.created));
  if (sortFilter.value === 'engagement') results.sort((a, b) => b.score - a.score);
  if (sortFilter.value === 'newest') results.sort((a, b) => b.created.localeCompare(a.created));
  list.innerHTML = results.map((record, index) => `<article class="result-card" style="animation-delay: ${index * 45}ms"><div class="result-index">${String(index + 1).padStart(2, '0')}</div><div class="result-main"><div class="record-type ${record.type}">${record.type === 'post' ? 'POST' : 'COMMENT'} <span>•</span> ${record.source}</div><h2><a href="${record.url}" target="_blank" rel="noreferrer">${record.title}</a></h2><p class="result-excerpt">${record.body}</p><div class="result-meta"><span class="subreddit">r/${record.subreddit}</span><span>u/${record.author}</span><span>${formatDate(record.created)}</span></div></div><div class="result-stats"><span><strong>${formatNumber(record.score)}</strong> score</span>${record.comments ? `<span><strong>${formatNumber(record.comments)}</strong> replies</span>` : '<span>archived comment</span>'}</div></article>`).join('');
  const displayCount = String(results.length).padStart(2, '0');
  count.textContent = displayCount; totalCount.textContent = displayCount; showingCount.textContent = displayCount;
  queryLabel.textContent = username ? `for u/${username}` : 'enter a username to begin';
  redditLink.href = username ? `https://www.reddit.com/user/${encodeURIComponent(username)}/` : 'https://www.reddit.com/search/';
  emptyState.hidden = results.length > 0; list.hidden = results.length === 0;
  document.querySelector('#allTabCount').textContent = records.length.toString().padStart(2, '0');
  document.querySelector('#postTabCount').textContent = records.filter(record => record.type === 'post').length.toString().padStart(2, '0');
  document.querySelector('#commentTabCount').textContent = records.filter(record => record.type === 'comment').length.toString().padStart(2, '0');
}
async function queryArchives(username) {
  const sequence = ++searchSequence;
  if (!username) { records = [...localRecords]; archiveStatus.textContent = 'LOCAL DEMO INDEX'; if (activityText) activityText.textContent = activityMessages[0]; render(); return; }
  archiveStatus.textContent = 'QUERYING ARCHIVES...';
  if (activityText) activityText.textContent = 'QUERYING ARCHIVE SOURCES';
  records = await RedditApi.search(username);
  if (sequence !== searchSequence) return;
  if (records.length) archiveStatus.textContent = `${records.length} ARCHIVED RECORDS`;
  else { records = localRecords.filter(record => record.author.toLowerCase() === username); archiveStatus.textContent = records.length ? 'LOCAL FALLBACK INDEX' : 'NO ARCHIVE MATCH'; }
  if (activityText) activityText.textContent = records.length ? 'SIGNALS MAPPED / READY' : 'NO SIGNALS IN CURRENT INDEX';
  render();
}
form.addEventListener('submit', event => { event.preventDefault(); queryArchives(input.value.trim().replace(/^u\//i, '')); document.querySelector('.workspace').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
[subredditFilter, sortFilter, afterDate, beforeDate, includeNsfw].forEach(control => control.addEventListener('input', render));
input.addEventListener('input', () => { if (!input.value.trim()) { searchSequence += 1; records = [...localRecords]; archiveStatus.textContent = 'LOCAL DEMO INDEX'; if (activityText) activityText.textContent = activityMessages[0]; render(); } });
document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => { input.value = button.dataset.query; queryArchives(input.value); }));
document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => { document.querySelector('.result-tab.active').classList.remove('active'); button.classList.add('active'); activeTab = button.dataset.tab; render(); }));
document.querySelectorAll('.range-option').forEach(button => button.addEventListener('click', () => { document.querySelector('.range-option.active').classList.remove('active'); button.classList.add('active'); activeRange = button.dataset.range; render(); }));
document.querySelector('#resetButton').addEventListener('click', () => { input.value = ''; subredditFilter.value = 'all'; afterDate.value = ''; beforeDate.value = ''; includeNsfw.checked = false; activeTab = 'all'; activeRange = 'all'; records = [...localRecords]; document.querySelector('.result-tab.active').classList.remove('active'); document.querySelector('[data-tab="all"]').classList.add('active'); document.querySelector('.range-option.active').classList.remove('active'); document.querySelector('[data-range="all"]').classList.add('active'); archiveStatus.textContent = 'LOCAL DEMO INDEX'; render(); });
function updateClock() { const clock = document.querySelector('#clock'); if (clock) clock.textContent = new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()); }
const weatherDescriptions = { 0: 'CLEAR', 1: 'MAINLY CLEAR', 2: 'PARTLY CLOUDY', 3: 'OVERCAST', 45: 'FOG', 48: 'RIME FOG', 51: 'DRIZZLE', 53: 'DRIZZLE', 55: 'DRIZZLE', 61: 'RAIN', 63: 'RAIN', 65: 'HEAVY RAIN', 71: 'SNOW', 73: 'SNOW', 75: 'HEAVY SNOW', 80: 'SHOWERS', 81: 'SHOWERS', 82: 'HEAVY SHOWERS', 95: 'STORM', 96: 'STORM', 99: 'STORM' };
function getPosition() { return new Promise((resolve, reject) => { if (!navigator.geolocation) return reject(new Error('location unavailable')); const timeout = setTimeout(() => reject(new Error('location timeout')), 4000); navigator.geolocation.getCurrentPosition(position => { clearTimeout(timeout); resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude, label: 'LOCAL' }); }, error => { clearTimeout(timeout); reject(error); }, { enableHighAccuracy: false, timeout: 3500, maximumAge: 900000 }); }); }
async function loadWeather() { if (!weatherText) return; try { let location; try { location = await getPosition(); } catch { const ipResponse = await fetch('https://ipapi.co/json/'); if (!ipResponse.ok) throw new Error('location unavailable'); const ip = await ipResponse.json(); location = { latitude: ip.latitude, longitude: ip.longitude, label: ip.city || 'LOCAL' }; } const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`); if (!weatherResponse.ok) throw new Error('weather unavailable'); const weather = await weatherResponse.json(); const current = weather.current; const description = weatherDescriptions[current.weather_code] || 'CONDITIONS'; weatherText.textContent = `${location.label.toUpperCase()} ${Math.round(current.temperature_2m)}°C / ${description}`; } catch { weatherText.textContent = 'WEATHER UNAVAILABLE'; } }
function rotateActivityText() { if (!activityText || document.activeElement === input) return; activityIndex = (activityIndex + 1) % activityMessages.length; activityText.classList.remove('activity-swap'); void activityText.offsetWidth; activityText.textContent = activityMessages[activityIndex]; activityText.classList.add('activity-swap'); }
updateClock(); setInterval(updateClock, 1000); setInterval(rotateActivityText, 3200); loadWeather(); render();
