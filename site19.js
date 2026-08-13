
const S19={key:"site19_state_v1",defaults:{clearance:0,emergency:"NORMAL",alerts:[]},
load(){try{return Object.assign({},this.defaults,JSON.parse(localStorage.getItem(this.key)||"{}"))}catch{return {...this.defaults}}},
save(s){localStorage.setItem(this.key,JSON.stringify(s));window.dispatchEvent(new Event("site19state"))},
get(){return this.load()},set(k,v){const s=this.load();s[k]=v;this.save(s);return s},
alert(msg,severity="INFO"){const s=this.load();s.alerts=Array.isArray(s.alerts)?s.alerts:[];s.alerts.unshift({time:new Date().toISOString(),msg,severity});s.alerts=s.alerts.slice(0,60);this.save(s)},
clearanceName(n){if(n>=5)return"O5";if(n<=0)return"GUEST";return"LEVEL "+n},
codes:{"SITE19-L1":1,"SITE19-L2":2,"SITE19-L3":3,"SITE19-L4":4,"SITE19-O5":5},
unlock(code){const n=this.codes[String(code||"").trim().toUpperCase()];if(n===undefined)return false;this.set("clearance",n);this.alert("Clearance changed to "+this.clearanceName(n),"SECURITY");return true},
resetClearance(){this.set("clearance",0)}
};
function bindGlobalStatus(){const p=()=>{const s=S19.get();document.querySelectorAll("[data-clearance]").forEach(e=>e.textContent=S19.clearanceName(s.clearance));document.querySelectorAll("[data-emergency]").forEach(e=>e.textContent=s.emergency)};p();window.addEventListener("site19state",p);window.addEventListener("storage",p)}
