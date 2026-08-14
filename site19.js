
const S19 = {
  key: "site19_state_v1",
  defaults: {
    clearance: 0,
    emergency: "NORMAL",
    alerts: [],
    personnel: null
  },

  load() {
    try {
      return Object.assign({}, this.defaults, JSON.parse(localStorage.getItem(this.key) || "{}"));
    } catch {
      return { ...this.defaults };
    }
  },

  save(state) {
    localStorage.setItem(this.key, JSON.stringify(state));
    window.dispatchEvent(new Event("site19state"));
  },

  get() { return this.load(); },

  set(key, value) {
    const state = this.load();
    state[key] = value;
    this.save(state);
    return state;
  },

  alert(msg, severity = "INFO") {
    const state = this.load();
    state.alerts = Array.isArray(state.alerts) ? state.alerts : [];
    state.alerts.unshift({
      time: new Date().toISOString(),
      msg,
      severity
    });
    state.alerts = state.alerts.slice(0, 60);
    this.save(state);
  },

  clearanceName(level) {
    level = Number(level) || 0;
    if (level >= 5) return "O5";
    if (level <= 0) return "GUEST";
    return "LEVEL " + level;
  },

  clearanceNumber(text) {
    const value = String(text || "").trim().toUpperCase();
    if (value === "O5" || value === "05" || value.includes("O5")) return 5;
    const match = value.match(/([1-4])/);
    return match ? Number(match[1]) : 0;
  },

  startSession(personnel) {
    const state = this.load();
    state.personnel = personnel;
    state.clearance = Number(personnel.clearanceLevel) || 0;
    state.alerts = Array.isArray(state.alerts) ? state.alerts : [];
    state.alerts.unshift({
      time: new Date().toISOString(),
      msg: `Personnel authenticated locally: ${personnel.name} // ${this.clearanceName(personnel.clearanceLevel)}`,
      severity: "SECURITY"
    });
    state.alerts = state.alerts.slice(0, 60);
    this.save(state);
  },

  endSession() {
    const state = this.load();
    state.personnel = null;
    state.clearance = 0;
    this.save(state);
  },

  clearAlerts() {
    const state = this.load();
    state.alerts = [];
    this.save(state);
  }
};

function bindGlobalStatus() {
  const paint = () => {
    const state = S19.get();

    document.querySelectorAll("[data-clearance]").forEach(el => {
      el.textContent = S19.clearanceName(state.clearance);
    });

    document.querySelectorAll("[data-emergency]").forEach(el => {
      el.textContent = state.emergency || "NORMAL";
      el.classList.toggle("bad", state.emergency && state.emergency !== "NORMAL");
    });

    document.querySelectorAll("[data-personnel]").forEach(el => {
      el.textContent = state.personnel?.name || "UNAUTHENTICATED";
    });

    document.querySelectorAll("[data-division]").forEach(el => {
      el.textContent = state.personnel?.division || "PUBLIC ACCESS";
    });
  };

  paint();
  window.addEventListener("site19state", paint);
  window.addEventListener("storage", paint);
}
