// app.js — Lógica del calendario del Mundial FIFA 2026

// ── Estado de la aplicación ──────────────────────────────────────────────────
let activeGroup = "all";

// ── Inicialización ───────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setupFilters();
  renderCalendar();
});

// ── Filtros ──────────────────────────────────────────────────────────────────
function setupFilters() {
  const container = document.getElementById("filterButtons");
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    // Actualizar estado activo
    container.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    activeGroup = btn.dataset.group;
    renderCalendar();
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function isMexMatch(match) {
  return match.home === "México" || match.away === "México";
}

function getFilteredMatches() {
  if (activeGroup === "all") return MATCHES;
  if (activeGroup === "MEX") return MATCHES.filter(isMexMatch);
  return MATCHES.filter((m) => m.group === activeGroup);
}

function groupByDay(matchList) {
  const map = new Map();
  matchList.forEach((m) => {
    if (!map.has(m.day)) map.set(m.day, []);
    map.get(m.day).push(m);
  });
  return map;
}

// ── Render principal ─────────────────────────────────────────────────────────
function renderCalendar() {
  const calendar = document.getElementById("calendar");
  const filtered = getFilteredMatches();

  if (filtered.length === 0) {
    calendar.innerHTML = `
      <div class="empty-state">
        <p>No hay partidos para este filtro.</p>
      </div>`;
    return;
  }

  const byDay = groupByDay(filtered);
  const fragments = [];

  byDay.forEach((dayMatches, day) => {
    fragments.push(buildDayBlock(day, dayMatches));
  });

  calendar.innerHTML = fragments.join("");
}

// ── Construir bloque de un día ───────────────────────────────────────────────
function buildDayBlock(day, dayMatches) {
  const count = dayMatches.length;
  const rows = dayMatches.map(buildMatchRow).join("");

  return `
    <div class="day-block">
      <div class="day-header">
        <span>${day.toUpperCase()}</span>
        <span class="day-count">${count} partido${count > 1 ? "s" : ""}</span>
      </div>
      <table class="match-table" aria-label="Partidos del ${day}">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Equipos</th>
            <th>Sede</th>
            <th>Grupo</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
}

// ── Construir fila de un partido ─────────────────────────────────────────────
function buildMatchRow(match) {
  const mex = isMexMatch(match);
  const rowClass = mex ? "mex-match" : "";
  const homeClass = match.home === "México" ? "team-home is-mex" : "team-home";
  const awayClass = match.away === "México" ? "team-away is-mex" : "team-away";

  return `
    <tr class="${rowClass}">
      <td class="col-time">${match.time}</td>
      <td class="col-teams">
        <span class="${homeClass}">${escapeHtml(match.home)}</span>
        <span class="team-vs">vs</span>
        <span class="${awayClass}">${escapeHtml(match.away)}</span>
      </td>
      <td class="col-venue">📍 ${escapeHtml(match.venue)}</td>
      <td class="col-group">
        <span class="group-badge group-${match.group}">Gr. ${match.group}</span>
      </td>
    </tr>`;
}

// ── Utilidad: escapar HTML para evitar XSS ───────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
