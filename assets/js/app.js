(function () {
  "use strict";

  var KEY = "mm.app.v1";
  var CENTER = { lat: -15.7938, lng: -47.8828, name: "Rodoviária do Plano Piloto", addr: "Eixo Monumental, Brasília - DF" };

  var PLACES = [
    { name: "Aeroporto de Brasília (BSB)", addr: "Lago Sul, Brasília - DF", lat: -15.8711, lng: -47.9186 },
    { name: "Rodoviária do Plano Piloto", addr: "Eixo Monumental, Brasília - DF", lat: -15.7938, lng: -47.8828 },
    { name: "Esplanada dos Ministérios", addr: "Brasília - DF", lat: -15.7997, lng: -47.8645 },
    { name: "Congresso Nacional", addr: "Praça dos Três Poderes", lat: -15.7996, lng: -47.8640 },
    { name: "Catedral de Brasília", addr: "Esplanada, Brasília - DF", lat: -15.7983, lng: -47.8756 },
    { name: "Conjunto Nacional", addr: "SDN, Brasília - DF", lat: -15.7904, lng: -47.8911 },
    { name: "ParkShopping Brasília", addr: "Guará, Brasília - DF", lat: -15.8336, lng: -47.9544 },
    { name: "Pontão do Lago Sul", addr: "Lago Sul, Brasília - DF", lat: -15.8323, lng: -47.8708 },
    { name: "UnB - Darcy Ribeiro", addr: "Asa Norte, Brasília - DF", lat: -15.7631, lng: -47.8708 },
    { name: "Estádio Mané Garrincha", addr: "SRPN, Brasília - DF", lat: -15.7835, lng: -47.8992 },
    { name: "Hospital de Base", addr: "Asa Sul, Brasília - DF", lat: -15.8003, lng: -47.8978 },
    { name: "Taguatinga Shopping", addr: "Taguatinga - DF", lat: -15.8339, lng: -48.0573 },
    { name: "Ceilândia Centro", addr: "Ceilândia - DF", lat: -15.8179, lng: -48.1047 },
    { name: "SIA Trecho 3", addr: "SIA, Brasília - DF", lat: -15.8006, lng: -47.9567 },
    { name: "JK Shopping", addr: "SIA, Brasília - DF", lat: -15.7918, lng: -47.9540 },
    { name: "Águas Claras", addr: "Águas Claras - DF", lat: -15.8345, lng: -48.0256 },
    { name: "Sudoeste / Octogonal", addr: "Sudoeste, Brasília - DF", lat: -15.7947, lng: -47.9215 },
    { name: "W3 Sul", addr: "Asa Sul, Brasília - DF", lat: -15.8151, lng: -47.8942 },
    { name: "W3 Norte", addr: "Asa Norte, Brasília - DF", lat: -15.7627, lng: -47.8896 },
    { name: "Torre de TV", addr: "Eixo Monumental, Brasília - DF", lat: -15.7905, lng: -47.8929 },
    { name: "Shopping Iguatemi Brasília", addr: "Lago Norte, Brasília - DF", lat: -15.7206, lng: -47.8827 },
    { name: "Feira da Ceilândia", addr: "Ceilândia - DF", lat: -15.8092, lng: -48.1201 },
    { name: "Terminal Gama", addr: "Gama - DF", lat: -16.0198, lng: -48.0653 },
    { name: "Sobradinho Centro", addr: "Sobradinho - DF", lat: -15.653, lng: -47.787 }
  ];

  var FLEET = [
    { name: "Carlos Mendes", rating: 4.92, trips: 340, vehicle: "Onix Plus Branco", plate: "PDT-4A21" },
    { name: "Juliana Rocha", rating: 4.97, trips: 512, vehicle: "HB20 Prata", plate: "JLR-8C19" },
    { name: "Pedro Alves", rating: 4.85, trips: 198, vehicle: "Gol Branco", plate: "PRA-2B33" },
    { name: "Fernanda Dias", rating: 4.99, trips: 701, vehicle: "Civic Preto", plate: "FND-9E01" },
    { name: "Ricardo Souza", rating: 4.88, trips: 276, vehicle: "Strada Branca", plate: "RCS-5T18" },
    { name: "Luciana Pinto", rating: 4.94, trips: 430, vehicle: "Fiorino Branca", plate: "LCP-7D44" },
    { name: "Rafael Nunes", rating: 4.80, trips: 154, vehicle: "Saveiro Prata", plate: "RFN-1C09" },
    { name: "Camila Freitas", rating: 4.96, trips: 388, vehicle: "Kicks Preto", plate: "CFR-3A77" }
  ];

  var COLORS = ["#c6f135", "#64d2ff", "#ffd60a", "#ff9f0a", "#bf5af2", "#32d74b", "#ff6482"];
  var SVC_LABEL = { ride: "Corrida", delivery: "Entrega rápida", freight: "Corrida + Frete" };
  var SVC_ICON = { ride: "🚗", delivery: "📦", freight: "🛻" };

  var db, map, tiles, originMarker, destMarker, routeLine, carMarkers = [];
  var watchId = null, timers = [];

  var state = {
    screen: "splash",
    tab: "home",
    authMode: "login",
    regRole: "passenger",
    service: "ride",
    extra: "padrao",
    origin: null,
    dest: null,
    destQuery: "",
    originQuery: "",
    route: null,
    priceMode: "auto",
    payment: "pix",
    paymentStatus: null,
    offered: 0,
    recommended: 0,
    current: null,
    offers: [],
    online: false,
    pickOnMap: false,
    rating: 5,
    form: { name: "", phone: "", password: "" },
    dialog: null,
    chatOpen: false,
    chatDraft: ""
  };

  function uid(p) { return (p || "id") + "-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }
  function now() { return Date.now(); }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function fmtDate(ts) {
    var d = new Date(ts);
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  function brl(n) { return "R$ " + (Number(n) || 0).toFixed(2).replace(".", ","); }
  function payLabel(v) { return { cash: "Dinheiro", card: "Cartão", pix: "Pix" }[v] || v; }
  function digits(s) { return String(s || "").replace(/\D/g, ""); }
  function maskPhone(s) {
    var d = digits(s).slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }
  function initials(name) {
    return String(name || "?").split(" ").filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }
  function colorFor(name) { var n = 0; for (var i = 0; i < (name || "").length; i++) n += name.charCodeAt(i); return COLORS[n % COLORS.length]; }
  function haversine(a, b) {
    var R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  }
  function toast(msg) {
    var box = document.getElementById("toasts");
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () { el.remove(); }, 2800);
    try { navigator.vibrate && navigator.vibrate(12); } catch (e) {}
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
  function session(user) {
    if (user) localStorage.setItem(KEY + ".sid", user.id);
    else localStorage.removeItem(KEY + ".sid");
  }
  function currentUser() {
    var id = localStorage.getItem(KEY + ".sid");
    if (!id) return null;
    return db.users.filter(function (u) { return u.id === id; })[0] || null;
  }

  function seed() {
    return {
      pricing: {
        ride: { base: 6, perKm: 2.10, perMin: 0.30 },
        delivery: { base: 8, perKm: 2.50, perMin: 0.25 },
        freight: { base: 25, perKm: 4.50, perMin: 0.50 },
        commission: 0.10
      },
      users: [
        { id: "u-marcelo", name: "Marcelo Monteiro", phone: "61988887777", password: "1234", role: "driver", isAdmin: true, isPartner: false, rating: 5, trips: 1284, vehicle: "T-Cross Preto", plate: "MM-0001", earnings: 18450.40, commissionPaid: 0 },
        { id: "u-ana", name: "Ana Souza", phone: "61981111111", password: "1234", role: "passenger", isAdmin: false, isPartner: false, rating: 4.9, trips: 56 },
        { id: "u-carlos", name: "Carlos Mendes", phone: "61982222222", password: "1234", role: "driver", isAdmin: false, isPartner: true, rating: 4.92, trips: 340, vehicle: "Onix Plus Branco", plate: "PDT-4A21", earnings: 4320.80, commissionPaid: 480.09 }
      ],
      rides: [
        { id: "r-demo1", type: "ride", passengerId: "u-ana", passengerName: "Ana Souza", driverId: "u-carlos", driverName: "Carlos Mendes", origin: { name: "Conjunto Nacional", addr: "SDN", lat: -15.7904, lng: -47.8911 }, dest: { name: "ParkShopping Brasília", addr: "Guará", lat: -15.8336, lng: -47.9544 }, km: 9.4, min: 18, price: 28.5, offered: 28.5, commission: 2.85, net: 25.65, status: "completed", createdAt: now() - 86400000 * 2, finishedAt: now() - 86400000 * 2 + 20 * 60000, extra: "padrao" },
        { id: "r-demo2", type: "delivery", passengerId: "u-ana", passengerName: "Ana Souza", driverId: "u-marcelo", driverName: "Marcelo Monteiro", origin: { name: "Asa Norte W3", addr: "Asa Norte", lat: -15.7627, lng: -47.8896 }, dest: { name: "Águas Claras", addr: "Águas Claras", lat: -15.8345, lng: -48.0256 }, km: 16.2, min: 28, price: 52, offered: 52, commission: 0, net: 52, status: "completed", createdAt: now() - 86400000, finishedAt: now() - 86400000 + 30 * 60000, extra: "caixa" }
      ]
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { db = JSON.parse(raw); if (!db.pricing || !db.users) db = seed(); }
      else db = seed();
    } catch (e) { db = seed(); }
    save();
  }

  function calcPrice(service, km, min, extra) {
    var p = db.pricing[service] || db.pricing.ride;
    var v = Number(p.base) + Number(km) * Number(p.perKm) + Number(min) * Number(p.perMin);
    if (service === "freight" && extra === "reboque") v *= 1.35;
    if (service === "freight" && extra === "utilitario") v *= 1.15;
    if (service === "delivery" && extra === "caixa") v *= 1.15;
    if (service === "delivery" && extra === "grande") v *= 1.35;
    if (service === "ride" && extra === "conforto") v *= 1.25;
    v = Math.max(Number(p.base), Math.round(v * 2) / 2);
    return v;
  }

  function clearTimers() { timers.forEach(function (t) { clearTimeout(t); }); timers = []; }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }

  function pulseIcon() {
    return L.divIcon({ className: "mm-pulse", html: '<div class="pulse-wrap"><div class="pulse-ring"></div><div class="pulse-dot"></div></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
  }
  function pinIcon() {
    return L.divIcon({ className: "mm-pin", html: '<div class="pin"></div>', iconSize: [28, 28], iconAnchor: [14, 26] });
  }
  function carIcon() {
    return L.divIcon({ className: "mm-car", html: '<div class="car-ic">🚕</div>', iconSize: [32, 32], iconAnchor: [16, 16] });
  }

  function ensureMap() {
    if (map) { setTimeout(function () { map.invalidateSize(); }, 200); return; }
    map = L.map("map", { zoomControl: false, attributionControl: true }).setView([CENTER.lat, CENTER.lng], 13);
    tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap contributors" }).addTo(map);
    map.on("click", function (e) {
      if (!state.pickOnMap || state.screen !== "app") return;
      var p = { lat: e.latlng.lat, lng: e.latlng.lng, name: "Ponto no mapa", addr: e.latlng.lat.toFixed(5) + ", " + e.latlng.lng.toFixed(5) };
      var near = nearestPlace(p);
      if (near && haversine(p, near) < 0.8) { p.name = near.name; p.addr = near.addr; }
      state.dest = p;
      state.destQuery = p.name;
      drawPins();
      if (state.origin) computeRoute();
      render();
    });
  }

  function nearestPlace(p) {
    var best = null, d = 1e9;
    PLACES.forEach(function (x) { var k = haversine(p, x); if (k < d) { d = k; best = x; } });
    return best;
  }

  function setOriginMarker(o) {
    if (!map || !o) return;
    if (originMarker) originMarker.setLatLng([o.lat, o.lng]);
    else originMarker = L.marker([o.lat, o.lng], { icon: pulseIcon() }).addTo(map);
  }
  function setDestMarker(d) {
    if (!map) return;
    if (!d) { if (destMarker) { map.removeLayer(destMarker); destMarker = null; } return; }
    if (destMarker) destMarker.setLatLng([d.lat, d.lng]);
    else destMarker = L.marker([d.lat, d.lng], { icon: pinIcon() }).addTo(map);
  }
  function drawPins() {
    setOriginMarker(state.origin);
    setDestMarker(state.dest);
  }
  function clearCars() {
    carMarkers.forEach(function (m) { map.removeLayer(m); });
    carMarkers = [];
  }
  function spawnCars(around, n) {
    clearCars();
    if (!map || !around) return;
    for (var i = 0; i < n; i++) {
      var dlat = (Math.random() - 0.5) * 0.04, dlng = (Math.random() - 0.5) * 0.04;
      carMarkers.push(L.marker([around.lat + dlat, around.lng + dlng], { icon: carIcon() }).addTo(map));
    }
  }

  function fitRoute() {
    if (!map || !state.origin) return;
    if (state.dest) {
      var b = L.latLngBounds([[state.origin.lat, state.origin.lng], [state.dest.lat, state.dest.lng]]);
      map.fitBounds(b.pad(0.35));
    } else map.setView([state.origin.lat, state.origin.lng], 14);
  }

  function fallbackRoute(o, d) {
    var km = haversine(o, d) * 1.28;
    var min = Math.max(6, km / 0.38);
    var steps = 18, coords = [];
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var lat = o.lat + (d.lat - o.lat) * t + Math.sin(t * Math.PI) * 0.004;
      var lng = o.lng + (d.lng - o.lng) * t + Math.sin(t * Math.PI * 0.7) * 0.003;
      coords.push([lat, lng]);
    }
    return { coords: coords, km: km, min: min };
  }

  function applyRoute(r) {
    state.route = r;
    if (routeLine) map.removeLayer(routeLine);
    routeLine = L.polyline(r.coords, { color: "#c6f135", weight: 5, opacity: 0.9 }).addTo(map);
    state.recommended = calcPrice(state.service, r.km, r.min, state.extra);
    if (state.priceMode === "auto") state.offered = state.recommended;
    else if (!state.offered) state.offered = state.recommended;
    fitRoute();
    render();
  }

  function computeRoute() {
    var o = state.origin, d = state.dest;
    if (!o || !d) return;
    var url = "https://router.project-osrm.org/route/v1/driving/" + o.lng + "," + o.lat + ";" + d.lng + "," + d.lat + "?overview=full&geometries=geojson";
    fetch(url).then(function (res) { return res.json(); }).then(function (j) {
      if (!j.routes || !j.routes[0]) throw new Error("no route");
      var rt = j.routes[0];
      var coords = rt.geometry.coordinates.map(function (c) { return [c[1], c[0]]; });
      applyRoute({ coords: coords, km: rt.distance / 1000, min: rt.duration / 60 });
    }).catch(function () {
      applyRoute(fallbackRoute(o, d));
    });
  }

  function locate(cb) {
    var done = false;
    function finish(o) { if (done) return; done = true; state.origin = o; setOriginMarker(o); if (map) map.setView([o.lat, o.lng], 14); if (cb) cb(o); render(); }
    if (!navigator.geolocation) return finish(Object.assign({}, CENTER));
    navigator.geolocation.getCurrentPosition(function (pos) {
      var p = { lat: pos.coords.latitude, lng: pos.coords.longitude, name: "Sua localização", addr: "GPS atual" };
      var n = nearestPlace(p);
      if (n && haversine(p, n) < 1.2) { p.name = "Próximo a " + n.name; p.addr = n.addr; }
      finish(p);
    }, function () { toast("GPS indisponível. Verifique se a localização está ligada e permitida para o Combinar Car."); finish(Object.assign({}, CENTER)); }, { enableHighAccuracy: true, timeout: 7000, maximumAge: 30000 });
    later(function () { if (!done) toast("GPS demorou a responder. Verifique se a localização está ligada e permitida para o Combinar Car."); finish(Object.assign({}, CENTER)); }, 7500);
  }

  function filterPlaces(q) {
    q = (q || "").toLowerCase().trim();
    if (!q) return PLACES.slice(0, 8);
    return PLACES.filter(function (p) { return (p.name + " " + p.addr).toLowerCase().indexOf(q) >= 0; }).slice(0, 8);
  }

  function userRides(u) {
    return db.rides.filter(function (r) {
      return r.passengerId === u.id || r.driverId === u.id || (u.isAdmin && state.tab === "admin");
    }).sort(function (a, b) { return b.createdAt - a.createdAt; });
  }

  function pendingForDriver() {
    return db.rides.filter(function (r) { return r.status === "pending"; }).sort(function (a, b) { return b.createdAt - a.createdAt; });
  }


  function navWazeWebUrl(d) { return "https://www.waze.com/ul?ll=" + d.lat + "," + d.lng + "&navigate=yes"; }
  function navGoogleUrl(o, d) {
    var u = "https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=" + encodeURIComponent(d.lat + "," + d.lng);
    if (o) u += "&origin=" + encodeURIComponent(o.lat + "," + o.lng);
    return u;
  }
  function openExternal(url) {
    var a = document.createElement("a");
    a.href = url; a.target = "_self";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
  function openNav(provider) {
    var r = state.current; if (!r || !r.dest) return toast("Defina o destino primeiro");
    var isWaze = provider === "waze";
    var url = isWaze ? navWazeWebUrl(r.dest) : navGoogleUrl(r.origin, r.dest);
    toast(isWaze ? "Abrindo no Waze." : "Abrindo no Google Maps.");
    openExternal(url);
  }
  function chatMessages() {
    var r = state.current; if (!r) return [];
    if (!r.messages) r.messages = [];
    return r.messages;
  }
  function sendChat() {
    var inp = document.getElementById("chat-in"); if (!inp) return;
    var text = String(inp.value || "").trim(); if (!text) return;
    var u = currentUser(); var r = state.current; if (!r) return;
    var msgs = chatMessages();
    msgs.push({ from: (u ? u.name : "Você"), mine: true, text: text, ts: now() });
    inp.value = ""; state.chatDraft = "";
    var other = r.driverName || "Motorista";
    later(function () {
      if (!state.current || state.current.id !== r.id) return;
      chatMessages().push({ from: other, mine: false, text: "Recebido. Estou a caminho e acompanho a rota.", ts: now() });
      save(); render();
    }, 1400);
    save(); render();
  }
  function viewChat() {
    var r = state.current; if (!r) return "";
    var msgs = chatMessages();
    var html = '<div class="sheet chat-sheet hit"><div class="handle"></div>';
    html += '<div class="chat-head"><div><b>Conversa da corrida</b><div class="tiny muted">' + esc(r.driverName || "Motorista") + " · " + esc(r.origin.name) + " → " + esc(r.dest.name) + "</div></div>";
    html += '<button class="ico-btn" data-act="close-chat">✕</button></div>';
    html += '<div class="chat-msgs">';
    if (!msgs.length) html += '<div class="chat-empty">Envie a primeira mensagem. O motorista responde nesta demonstração.</div>';
    msgs.forEach(function (m) {
      html += '<div class="msg ' + (m.mine ? "mine" : "theirs") + '"><div class="msg-text">' + esc(m.text) + '</div><div class="msg-time">' + fmtDate(m.ts) + (m.mine ? " ✓✓" : "") + "</div></div>";
    });
    html += '</div>';
    html += '<div class="chat-input"><input id="chat-in" placeholder="Digite uma mensagem" value=""><button class="btn btn-lime chat-send" data-act="send-chat">Enviar</button></div>';
    html += "</div>";
    return html;
  }

  /* ---------------- views ---------------- */

  function viewSplash() {
    return '<div class="cover splash hit"><div class="logo-lg"><img src="img/app-icon.png" alt="logo"></div>' +
      "<h1 class='brand'>Combinar Car</h1><p class='tag'>Mobilidade & Entregas</p>" +
      "<div class='bar'><i></i></div></div>";
  }

  function viewAuth() {
    var m = state.authMode;
    var f = state.form;
    var html = '<div class="cover auth hit">';
    html += '<div class="auth-hero"><img src="img/app-icon.png" alt=""><div><h1>Combinar Car</h1><p>Mobilidade & Entregas</p></div></div>';
    html += '<div class="seg"><button class="' + (m === "login" ? "on" : "") + '" data-act="auth-mode" data-v="login">Entrar</button>';
    html += '<button class="' + (m === "register" ? "on" : "") + '" data-act="auth-mode" data-v="register">Criar conta</button></div>';
    if (m === "register") {
      html += '<div class="field"><label>Nome completo</label><input id="f-name" value="' + esc(f.name) + '" placeholder="Seu nome"></div>';
    }
    html += '<div class="field"><label>Telefone</label><input id="f-phone" inputmode="tel" value="' + esc(maskPhone(f.phone)) + '" placeholder="(61) 90000-0000"></div>';
    html += '<div class="field"><label>Senha</label><input id="f-pass" type="password" value="' + esc(f.password) + '" placeholder="••••"></div>';
    if (m === "register") {
      html += '<label class="muted tiny">Como você vai usar o app?</label><div class="roles">';
      html += '<button class="role ' + (state.regRole === "passenger" ? "on" : "") + '" data-act="reg-role" data-v="passenger"><b>Passageiro</b><span>Corridas, entregas e fretes</span></button>';
      html += '<button class="role ' + (state.regRole === "driver" ? "on" : "") + '" data-act="reg-role" data-v="driver"><b>Motorista</b><span>Aceite corridas e ganhe</span></button></div>';
    }
    html += '<button class="btn btn-lime" data-act="submit-auth">' + (m === "login" ? "Entrar" : "Cadastrar") + "</button>";
    html += '<div class="demo"><h4>Contas de demonstração</h4><div class="chips">';
    html += '<button class="chip" data-act="demo" data-phone="61981111111"><b>Passageiro</b> · Ana Souza · (61) 98111-1111 · senha 1234</button>';
    html += '<button class="chip" data-act="demo" data-phone="61982222222"><b>Motorista parceiro</b> · Carlos Mendes · (61) 98222-2222 · senha 1234</button>';
    html += '<button class="chip" data-act="demo" data-phone="61988887777"><b>Admin</b> · Marcelo Monteiro · (61) 98888-7777 · senha 1234</button>';
    html += "</div></div></div>";
    return html;
  }

  function navHtml(u) {
    var t = state.tab;
    var items = [{ id: "home", label: "Início", path: "M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2z" }];
    items.push({ id: "activity", label: "Atividade", path: "M4 6h16M4 12h16M4 18h10" });
    if (u.role === "driver") items.push({ id: "earnings", label: "Ganhos", path: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" });
    if (u.isAdmin) items.push({ id: "admin", label: "Admin", path: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.2a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.2a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.2a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 110 4h-.2a1.7 1.7 0 00-1.5 1z" });
    items.push({ id: "account", label: "Conta", path: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z" });
    var h = '<nav class="nav hit">';
    items.forEach(function (it) {
      h += '<button class="' + (t === it.id ? "on" : "") + '" data-act="tab" data-v="' + it.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="' + it.path + '"></path></svg>' + it.label + "</button>";
    });
    return h + "</nav>";
  }

  function viewHomePassenger(u) {
    var o = state.origin || CENTER;
    var html = "";
    html += '<div class="top hit"><div class="pill grow"><div><div class="ttl">Combinar Car</div><div class="sub">' + esc(o.name) + "</div></div></div>";
    html += '<button class="ico-btn gps-btn" data-act="locate" title="Minha localização">◎ GPS</button></div>';
    html += '<div class="svc-dock hit">';
    ["ride", "delivery", "freight"].forEach(function (s) {
      html += '<button class="svc ' + (state.service === s ? "on" : "") + '" data-act="service" data-v="' + s + '"><span class="em">' + SVC_ICON[s] + "</span><b>" + (s === "ride" ? "Corrida" : s === "delivery" ? "Entrega" : "Frete") + "</b></button>";
    });
    html += "</div>";
    html += '<button class="where hit" data-act="open-dest"><div class="dot"></div><div class="lab"><small>' + SVC_LABEL[state.service] + '</small><b>Para onde vamos?</b></div><span>➤</span></button>';
    html += navHtml(u);
    return html;
  }

  function extrasHtml() {
    var opts = [];
    if (state.service === "ride") opts = [["padrao", "Padrão"], ["conforto", "Conforto"]];
    if (state.service === "delivery") opts = [["envelope", "Envelope"], ["caixa", "Caixa"], ["grande", "Volume grande"]];
    if (state.service === "freight") opts = [["carrocinha", "Carrocinha"], ["reboque", "Reboque"], ["utilitario", "Utilitário"]];
    var h = '<div class="extras">';
    opts.forEach(function (o) {
      h += '<button class="' + (state.extra === o[0] ? "on" : "") + '" data-act="extra" data-v="' + o[0] + '">' + o[1] + "</button>";
    });
    return h + "</div>";
  }

  function viewSheetDest() {
    var results = filterPlaces(state.destQuery);
    var html = '<div class="sheet hit"><div class="handle"></div><h2>Definir rota</h2>';
    html += extrasHtml();
    html += '<div class="loc"><div class="rail"><div class="o"></div><div class="line"></div><div class="d"></div></div><div class="way">';
    html += '<input id="origin-in" value="' + esc((state.origin && state.origin.name) || "") + '" placeholder="Origem">';
    html += '<input id="dest-in" value="' + esc(state.destQuery) + '" placeholder="Destino — busque um local">';
    html += "</div></div>";
    html += '<p class="hint">Toque no mapa para escolher o destino ou selecione um local em Brasília.</p>';
    html += '<div class="results">';
    results.forEach(function (p) {
      html += '<button class="result" data-act="pick-dest" data-lat="' + p.lat + '" data-lng="' + p.lng + '" data-name="' + esc(p.name) + '" data-addr="' + esc(p.addr) + '"><div class="mark">📍</div><div><b>' + esc(p.name) + "</b><span>" + esc(p.addr) + "</span></div></button>";
    });
    html += "</div>";
    html += '<div class="flex"><button class="btn btn-ghost" data-act="close-sheet">Cancelar</button>';
    html += '<button class="btn btn-lime" data-act="confirm-route" ' + (state.dest ? "" : "disabled") + ">Continuar</button></div></div>";
    return html;
  }

  function viewSheetPrice() {
    var r = state.route;
    var html = '<div class="sheet hit"><div class="handle"></div><h2>Ofereça seu preço</h2>';
    html += '<p class="hint">' + esc(state.origin.name) + " → " + esc(state.dest.name) + "</p>";
    if (r) {
      html += '<div class="route-meta"><div class="statp"><small>Distância</small><b>' + r.km.toFixed(1) + " km</b></div>";
      html += '<div class="statp"><small>Tempo</small><b>' + Math.round(r.min) + " min</b></div>";
      html += '<div class="statp"><small>Serviço</small><b>' + SVC_LABEL[state.service] + "</b></div></div>";
    }
    html += '<div class="price-box"><div class="k">Sua oferta</div><div class="price-row">';
    html += '<button class="step" data-act="price-d">−</button><div class="price-num">' + brl(state.offered) + "</div>";
    html += '<button class="step" data-act="price-u">+</button></div>';
    html += '<div class="modes"><button class="' + (state.priceMode === "auto" ? "on" : "") + '" data-act="pmode" data-v="auto">Taxa automática</button>';
    html += '<button class="' + (state.priceMode === "custom" ? "on" : "") + '" data-act="pmode" data-v="custom">Taxa personalizada</button></div>';
    if (r) {
      var p = db.pricing[state.service];
      html += '<p class="break">Bandeirada ' + brl(p.base) + " + " + brl(p.perKm) + "/km + " + brl(p.perMin) + "/min";
      html += " · recomendado " + brl(state.recommended) + "</p>";
    }
    html += "</div>";
    html += '<div class="pay-box"><div class="k">Forma de pagamento</div><div class="modes">';
    [["cash", "Dinheiro"], ["card", "Cartão"], ["pix", "Pix"]].forEach(function (m) {
      html += '<button class="' + (state.payment === m[0] ? "on" : "") + '" data-act="payment" data-v="' + m[0] + '">' + m[1] + "</button>";
    });
    html += '</div><p class="tiny muted" style="margin-top:8px">No modelo inDrive, o valor é pago diretamente ao motorista. Simulação no protótipo, sem movimentação real.</p></div>';
    html += '<p class="note">Os motoristas podem aceitar ou enviar uma contra-proposta. Comissão de ' + Math.round(db.pricing.commission * 100) + "% para parceiros na finalização.</p>";
    html += '<button class="btn btn-lime mt" data-act="search">Buscar motoristas</button>';
    html += '<button class="btn btn-ghost mt" data-act="back-dest">Voltar</button></div>';
    return html;
  }

  function viewSheetSearch() {
    var html = '<div class="sheet hit"><div class="handle"></div><div class="searching"><div class="spin"></div>';
    html += "<h3>Negociando sua " + SVC_LABEL[state.service].toLowerCase() + "</h3>";
    html += '<p class="hint">Sua oferta: <b style="color:var(--lime)">' + brl(state.offered) + "</b> · " + (state.offers.length ? state.offers.length + " proposta(s)" : "aguardando motoristas") + "</p></div>";
    state.offers.forEach(function (o) {
      html += '<div class="offer"><div class="av" style="background:' + colorFor(o.name) + '">' + initials(o.name) + "</div>";
      html += '<div class="mid"><b>' + esc(o.name) + '</b><span>★ ' + o.rating.toFixed(2) + " · " + o.vehicle + " · " + o.plate + "</span>";
      html += "<span>" + o.eta + " min de distância</span></div>";
      html += '<div class="val"><b>' + brl(o.price) + '</b><button class="btn btn-lime go" data-act="accept-offer" data-id="' + o.id + '">Aceitar</button></div></div>';
    });
    html += '<button class="btn btn-danger mt" data-act="cancel-search">Cancelar busca</button></div>';
    return html;
  }

  function viewSheetTrack() {
    var r = state.current;
    if (!r) return "";
    var step = r.status === "accepted" ? 1 : r.status === "arriving" ? 2 : r.status === "ongoing" ? 3 : 4;
    var titles = { accepted: "Motorista a caminho", arriving: "Motorista chegou", ongoing: "Em viagem", completed: "Chegamos" };
    var html = '<div class="sheet hit"><div class="handle"></div>';
    html += '<div class="eta"><div><div class="muted tiny">Status</div><b>' + (titles[r.status] || r.status) + "</b></div>";
    html += "<div><div class='muted tiny'>Valor</div><b>" + brl(r.price) + "</b></div></div>";
    html += '<div class="steps"><i class="' + (step >= 1 ? "on" : "") + '"></i><i class="' + (step >= 2 ? "on" : "") + '"></i><i class="' + (step >= 3 ? "on" : "") + '"></i><i class="' + (step >= 4 ? "on" : "") + '"></i></div>';
    html += '<div class="drv"><div class="av" style="background:' + colorFor(r.driverName) + '">' + initials(r.driverName) + "</div>";
    html += "<div class='mid'><b>" + esc(r.driverName) + "</b><span>★ " + (r.driverRating || 4.9) + " · " + esc(r.vehicle || "") + " · " + esc(r.plate || "") + "</span></div></div>";
    html += '<p class="note">' + esc(r.origin.name) + " → " + esc(r.dest.name) + " · " + r.km.toFixed(1) + " km</p>";
    html += '<p class="note">Pagamento: <b>' + payLabel(r.payment || state.payment) + "</b> · pago diretamente ao motorista</p>";
    html += '<div class="nav-row"><button class="btn btn-line" data-act="nav-waze">Navegar no Waze</button><button class="btn btn-line" data-act="nav-google">Navegar no Google Maps</button></div>';
    html += '<button class="btn btn-ghost mt" data-act="open-chat">Conversar com o motorista</button>';
    if (r.status === "accepted" || r.status === "arriving") {
      html += '<button class="btn btn-lime mt" data-act="board">' + (state.service === "delivery" ? "Encomenda coletada" : state.service === "freight" ? "Carga embarcada" : "Embarquei") + "</button>";
      html += '<button class="btn btn-danger mt" data-act="cancel-ride">Cancelar</button>';
    } else if (r.status === "ongoing") {
      html += '<button class="btn btn-lime mt" data-act="finish">Cheguei no destino</button>';
    }
    html += "</div>";
    return html;
  }

  function viewComplete() {
    var r = state.current;
    if (!r) return "";
    var html = '<div class="cover hit" style="padding:24px;justify-content:center">';
    html += '<div class="center"><div class="logo-lg" style="margin:0 auto 12px;width:84px;height:84px"><img src="img/app-icon.png"></div>';
    html += "<h2>Corrida finalizada</h2><p class='muted'>" + SVC_LABEL[r.type] + " · " + brl(r.price) + "</p>";
    html += '<p class="note">' + esc(r.origin.name) + " → " + esc(r.dest.name) + "</p>";
    if (r.commission > 0) html += '<p class="note">Comissão da plataforma (' + Math.round(db.pricing.commission * 100) + "%): " + brl(r.commission) + " · motorista recebeu " + brl(r.net) + "</p>";
    html += '<div class="pay-box"><div class="k">Pagamento estilo inDrive</div><p class="note" style="margin:0">' + payLabel(r.payment || state.payment) + " · " + brl(r.price) + " · pago diretamente ao motorista</p>";
    if (r.commission > 0) html += '<p class="note" style="margin:6px 0 0">Motorista filiado: plataforma 10% = ' + brl(r.commission) + " · motorista recebe " + brl(r.net) + "</p>";
    else html += '<p class="note" style="margin:6px 0 0">Sem comissão de plataforma para esta conta.</p>';
    if (r.paymentStatus === "paid") html += '<p class="note" style="color:var(--ok)">Pagamento simulado confirmado.</p>';
    else html += '<button class="btn btn-lime mt" data-act="confirm-payment">Confirmar pagamento simulado</button>';
    html += "</div>";
    html += "<p>Como foi a experiência?</p><div class='rate'>";
    for (var i = 1; i <= 5; i++) html += '<button class="' + (state.rating >= i ? "on" : "") + '" data-act="rate" data-v="' + i + '">★</button>';
    html += '</div><button class="btn btn-lime" data-act="close-complete">Concluir</button></div></div>';
    return html;
  }

  function viewActivity(u) {
    var list = db.rides.filter(function (r) { return r.passengerId === u.id || r.driverId === u.id; }).sort(function (a, b) { return b.createdAt - a.createdAt; });
    var html = '<div class="page hit"><h1>Atividade</h1>';
    if (!list.length) html += '<div class="empty">Nenhuma corrida ainda.<br>Peça sua primeira rota no Início.</div>';
    list.forEach(function (r) {
      html += '<div class="list-ride"><div class="row"><b>' + SVC_ICON[r.type] + " " + SVC_LABEL[r.type] + '</b><span class="badge">' + statusLabel(r.status) + "</span></div>";
      html += '<div class="tiny muted">' + fmtDate(r.createdAt) + "</div>";
      html += "<div style='margin-top:6px'>" + esc(r.origin.name) + " → " + esc(r.dest.name) + "</div>";
      html += '<div class="row mt"><span class="tiny muted">' + r.km.toFixed(1) + " km</span><b>" + brl(r.price) + "</b></div></div>";
    });
    html += navHtml(u) + "</div>";
    return html;
  }

  function statusLabel(s) {
    return { pending: "Pendente", accepted: "Aceita", arriving: "A caminho", ongoing: "Em viagem", completed: "Concluída", cancelled: "Cancelada" }[s] || s;
  }

  function viewAccount(u) {
    var html = '<div class="page hit"><h1>Conta</h1>';
    html += '<div class="card"><div class="row"><div class="av" style="background:' + colorFor(u.name) + '">' + initials(u.name) + "</div>";
    html += "<div style='flex:1;margin-left:10px'><b>" + esc(u.name) + "</b><div class='tiny muted'>" + maskPhone(u.phone) + "</div>";
    html += '<div class="tiny">' + (u.isAdmin ? "Administrador · Motorista" : (u.role === "driver" ? "Motorista" : "Passageiro")) + (u.isPartner ? " parceiro" : "") + "</div></div>";
    html += '<span class="stars">★ ' + Number(u.rating || 5).toFixed(2) + "</span></div>";
    html += '<div class="hr"></div><div class="row"><span class="muted">Corridas</span><b>' + (u.trips || 0) + "</b></div></div>";
    if (u.role === "driver") {
      html += '<div class="card"><div class="row"><span>Veículo</span><b>' + esc(u.vehicle || "—") + "</b></div>";
      html += '<div class="row mt"><span>Placa</span><b>' + esc(u.plate || "—") + "</b></div></div>";
    }
    html += '<div class="card note">Autenticação por telefone e senha. Dados ficam neste aparelho (modo demonstração offline-first).</div>';
    html += '<button class="btn btn-ghost mt" data-act="reset-demo">Restaurar dados de demo</button>';
    html += '<button class="btn btn-danger mt" data-act="logout">Sair</button>';
    html += navHtml(u) + "</div>";
    return html;
  }

  function viewEarnings(u) {
    var mine = db.rides.filter(function (r) { return r.driverId === u.id && r.status === "completed"; });
    var gross = mine.reduce(function (s, r) { return s + r.price; }, 0);
    var comm = mine.reduce(function (s, r) { return s + (r.commission || 0); }, 0);
    var html = '<div class="page hit"><h1>Ganhos</h1>';
    html += '<div class="online"><div><b>' + (state.online ? "Você está online" : "Você está offline") + "</b>";
    html += '<div class="tiny muted">' + (state.online ? "Recebendo solicitações" : "Fique online para receber corridas") + "</div></div>";
    html += '<button class="switch ' + (state.online ? "on" : "") + '" data-act="toggle-online"><i></i></button></div>';
    html += '<div class="grid2"><div class="kpi"><small>Líquido</small><b>' + brl(gross - comm) + "</b></div>";
    html += '<div class="kpi"><small>Comissão 10%</small><b>' + brl(comm) + "</b></div></div><div class='space'></div>";
    html += '<div class="grid2"><div class="kpi"><small>Bruto</small><b>' + brl(gross) + "</b></div>";
    html += '<div class="kpi"><small>Corridas</small><b>' + mine.length + "</b></div></div>";
    if (u.isPartner) html += '<p class="note mt">Motorista parceiro: 10% de cada corrida finalizada é descontado automaticamente para a plataforma Combinar Car.</p>';
    else if (u.isAdmin) html += '<p class="note mt">Conta do titular: sem desconto de comissão nas suas corridas.</p>';
    var pend = pendingForDriver();
    html += "<h3 class='mt'>Solicitações</h3>";
    if (!state.online) html += '<div class="empty">Fique online para ver pedidos próximos.</div>';
    else if (!pend.length) html += '<div class="empty">Nenhuma solicitação no momento.</div>';
    pend.forEach(function (r) {
      html += '<div class="card"><div class="row"><b>' + SVC_ICON[r.type] + " " + SVC_LABEL[r.type] + '</b><b style="color:var(--lime)">' + brl(r.offered) + "</b></div>";
      html += '<div class="tiny muted">' + esc(r.passengerName) + " · " + r.km.toFixed(1) + " km · " + Math.round(r.min) + " min</div>";
      html += "<div class='mt tiny'>" + esc(r.origin.name) + " → " + esc(r.dest.name) + "</div>";
      html += '<div class="flex mt"><button class="btn btn-ghost" data-act="counter" data-id="' + r.id + '">Contra-proposta</button>';
      html += '<button class="btn btn-lime" data-act="driver-accept" data-id="' + r.id + '">Aceitar</button></div></div>';
    });
    html += navHtml(u) + "</div>";
    return html;
  }

  function viewAdmin(u) {
    var p = db.pricing;
    var done = db.rides.filter(function (r) { return r.status === "completed"; });
    var fat = done.reduce(function (s, r) { return s + r.price; }, 0);
    var comm = done.reduce(function (s, r) { return s + (r.commission || 0); }, 0);
    var html = '<div class="page hit"><h1>Admin</h1>';
    html += '<div class="admin-warn">Visão especial de Combinar Car — taxas, comissão e operação.</div>';
    html += '<div class="grid2"><div class="kpi"><small>Faturamento</small><b>' + brl(fat) + "</b></div>";
    html += '<div class="kpi"><small>Comissões</small><b>' + brl(comm) + "</b></div></div><div class='space'></div>";
    html += '<div class="grid2"><div class="kpi"><small>Corridas</small><b>' + db.rides.length + "</b></div>";
    html += '<div class="kpi"><small>Motoristas</small><b>' + db.users.filter(function (x) { return x.role === "driver"; }).length + "</b></div></div>";
    html += "<h3 class='mt'>Taxas automáticas</h3><p class='note'>Preço = bandeirada + (km × R$/km) + (min × R$/min). Editável.</p>";
    ["ride", "delivery", "freight"].forEach(function (s) {
      var x = p[s];
      html += '<div class="card"><b>' + SVC_ICON[s] + " " + SVC_LABEL[s] + "</b>";
      html += '<div class="grid2 mt"><div class="field"><label>Bandeirada</label><input data-pr="' + s + '" data-k="base" type="number" step="0.1" value="' + x.base + '"></div>';
      html += '<div class="field"><label>R$ / km</label><input data-pr="' + s + '" data-k="perKm" type="number" step="0.1" value="' + x.perKm + '"></div></div>';
      html += '<div class="field"><label>R$ / min</label><input data-pr="' + s + '" data-k="perMin" type="number" step="0.05" value="' + x.perMin + '"></div></div>';
    });
    html += '<div class="card"><b>Comissão de parceiros</b><div class="field mt"><label>Percentual (0.10 = 10%)</label>';
    html += '<input data-pr="commission" type="number" step="0.01" value="' + p.commission + '"></div>';
    html += '<button class="btn btn-lime" data-act="save-pricing">Salvar taxas</button></div>';
    html += "<h3>Motoristas</h3>";
    db.users.filter(function (x) { return x.role === "driver"; }).forEach(function (d) {
      html += '<div class="card"><div class="row"><div><b>' + esc(d.name) + "</b><div class='tiny muted'>" + maskPhone(d.phone) + " · " + esc(d.vehicle || "") + "</div></div>";
      html += '<button class="badge ' + (d.isPartner ? "" : "blue") + '" data-act="toggle-partner" data-id="' + d.id + '">' + (d.isPartner ? "Parceiro 10%" : "Sem comissão") + "</button></div></div>";
    });
    html += "<h3>Todas as corridas</h3>";
    db.rides.slice().sort(function (a, b) { return b.createdAt - a.createdAt; }).forEach(function (r) {
      html += '<div class="list-ride"><div class="row"><b>' + SVC_LABEL[r.type] + "</b><span>" + brl(r.price) + "</span></div>";
      html += '<div class="tiny muted">' + esc(r.passengerName) + " → " + esc(r.driverName || "—") + " · " + statusLabel(r.status) + " · comissão " + brl(r.commission || 0) + "</div></div>";
    });
    html += navHtml(u) + "</div>";
    return html;
  }

  function viewApp() {
    var u = currentUser();
    if (!u) return viewAuth();
    if (state.tab === "activity") return viewActivity(u);
    if (state.tab === "account") return viewAccount(u);
    if (state.tab === "earnings") return viewEarnings(u);
    if (state.tab === "admin") return viewAdmin(u);
    var html = u.role === "driver" && state.tab === "home" && !state.sheet ? viewHomeDriver(u) : viewHomePassenger(u);
    if (state.sheet === "dest") html += viewSheetDest();
    if (state.sheet === "price") html += viewSheetPrice();
    if (state.sheet === "search") html += viewSheetSearch();
    if (state.sheet === "track") html += viewSheetTrack();
    if (state.chatOpen && state.current) html += viewChat();
    if (state.pickOnMap && state.sheet === "dest") html += '<div class="map-hint hit">Toque no mapa para o destino</div>';
    if (state.dialog) {
      html += '<div class="cover hit" style="background:rgba(0,0,0,.55);justify-content:flex-end">';
      html += '<div class="sheet" style="position:relative"><h3>' + esc(state.dialog.title) + "</h3>";
      html += '<div class="field"><input id="dlg-in" inputmode="decimal" value="' + esc(state.dialog.value) + '"></div>';
      html += '<div class="flex"><button class="btn btn-ghost" data-act="dlg-cancel">Cancelar</button>';
      html += '<button class="btn btn-lime" data-act="dlg-ok">Enviar</button></div></div></div>';
    }
    return html;
  }

  function viewHomeDriver(u) {
    var o = state.origin || CENTER;
    var html = '<div class="top hit"><div class="pill grow"><div><div class="ttl">' + (u.isAdmin ? "Marcelo · Admin" : "Motorista") + "</div>";
    html += '<div class="sub">' + (state.online ? "Online · recebendo" : "Offline") + " · " + esc(o.name) + "</div></div></div>";
    html += '<button class="ico-btn" data-act="toggle-online">' + (state.online ? "●" : "○") + "</button></div>";
    html += '<div class="where hit" data-act="tab" data-v="earnings"><div class="dot"></div><div class="lab"><small>Painel do motorista</small><b>' + (state.online ? "Aguardando chamadas" : "Fique online para receber") + "</b></div></div>";
    html += navHtml(u);
    return html;
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; });
  }

  function render() {
    var ui = document.getElementById("ui");
    if (state.screen === "splash") ui.innerHTML = viewSplash();
    else if (state.screen === "auth") ui.innerHTML = viewAuth();
    else if (state.screen === "complete") ui.innerHTML = viewComplete();
    else ui.innerHTML = viewApp();
    bindDynamic();
    if (state.screen === "app") ensureMap();
  }

  function bindDynamic() {
    var phone = document.getElementById("f-phone");
    if (phone) phone.addEventListener("input", function () {
      state.form.phone = digits(phone.value);
      phone.value = maskPhone(phone.value);
    });
    var name = document.getElementById("f-name");
    if (name) name.addEventListener("input", function () { state.form.name = name.value; });
    var pass = document.getElementById("f-pass");
    if (pass) pass.addEventListener("input", function () { state.form.password = pass.value; });
    var dest = document.getElementById("dest-in");
    if (dest) {
      dest.addEventListener("input", function () { state.destQuery = dest.value; render(); var el = document.getElementById("dest-in"); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } });
    }
    var ori = document.getElementById("origin-in");
    if (ori) ori.addEventListener("change", function () {
      var q = ori.value.toLowerCase();
      var p = PLACES.filter(function (x) { return x.name.toLowerCase().indexOf(q) >= 0; })[0];
      if (p) { state.origin = p; drawPins(); }
    });
  }

  function readAuthFields() {
    var n = document.getElementById("f-name");
    var p = document.getElementById("f-phone");
    var s = document.getElementById("f-pass");
    if (n) state.form.name = n.value;
    if (p) state.form.phone = digits(p.value);
    if (s) state.form.password = s.value;
  }

  function login(phone, password) {
    phone = digits(phone); password = String(password || "");
    var u = db.users.filter(function (x) { return x.phone === phone && x.password === password; })[0];
    if (!u) { toast("Telefone ou senha inválidos"); return; }
    session(u);
    state.screen = "app";
    state.tab = "home";
    state.sheet = null;
    toast("Olá, " + u.name.split(" ")[0]);
    render();
    locate();
    if (u.role === "driver") spawnCars(state.origin || CENTER, 5);
  }

  function register() {
    readAuthFields();
    var f = state.form;
    if (!f.name || f.name.trim().length < 3) return toast("Informe seu nome");
    if (digits(f.phone).length < 10) return toast("Telefone inválido");
    if (!f.password || f.password.length < 4) return toast("Senha mínima de 4 dígitos");
    if (db.users.some(function (u) { return u.phone === digits(f.phone); })) return toast("Telefone já cadastrado");
    var u = { id: uid("u"), name: f.name.trim(), phone: digits(f.phone), password: f.password, role: state.regRole, isAdmin: false, isPartner: state.regRole === "driver", rating: 5, trips: 0, vehicle: state.regRole === "driver" ? "Veículo a informar" : "", plate: "", earnings: 0, commissionPaid: 0 };
    db.users.push(u); save();
    session(u);
    state.screen = "app"; state.tab = "home"; state.sheet = null;
    toast("Conta criada");
    render(); locate();
  }

  function startSearch() {
    if (!state.origin || !state.dest || !state.route) return toast("Defina a rota");
    var u = currentUser();
    var ride = {
      id: uid("r"), type: state.service, extra: state.extra,
      passengerId: u.id, passengerName: u.name, driverId: null, driverName: null,
      origin: state.origin, dest: state.dest, km: state.route.km, min: state.route.min,
      price: state.offered, offered: state.offered, commission: 0, net: state.offered,
      status: "pending", createdAt: now(), priceMode: state.priceMode, payment: state.payment, paymentStatus: null
    };
    db.rides.push(ride); save();
    state.current = ride;
    state.offers = [];
    state.sheet = "search";
    spawnCars(state.origin, 6);
    render();
    toast("Procurando motoristas próximos");
    FLEET.slice(0, 4).forEach(function (d, i) {
      later(function () {
        if (state.sheet !== "search") return;
        var delta = (Math.random() * 0.28) - 0.08;
        var price = Math.max(db.pricing[state.service].base, Math.round((state.offered * (1 + delta)) * 2) / 2);
        state.offers.push({ id: uid("o"), name: d.name, rating: d.rating, trips: d.trips, vehicle: d.vehicle, plate: d.plate, price: price, eta: 3 + i * 2 });
        render();
        toast(d.name.split(" ")[0] + " enviou uma proposta");
      }, 1200 + i * 1600);
    });
  }

  function acceptOffer(id) {
    var o = state.offers.filter(function (x) { return x.id === id; })[0];
    if (!o || !state.current) return;
    var r = db.rides.filter(function (x) { return x.id === state.current.id; })[0];
    r.status = "accepted"; r.driverName = o.name; r.price = o.price; r.vehicle = o.vehicle; r.plate = o.plate; r.driverRating = o.rating;
    var partner = db.users.filter(function (u) { return u.name === o.name; })[0];
    if (partner) r.driverId = partner.id;
    state.current = r; save();
    state.sheet = "track";
    state.offers = [];
    clearTimers();
    spawnCars(r.origin, 1);
    render();
    toast("Corrida aceita · " + o.name.split(" ")[0] + " está a caminho");
    later(function () {
      if (!state.current || state.current.id !== r.id) return;
      r.status = "arriving"; state.current = r; save(); render();
      toast("Motorista no ponto de embarque");
    }, 7000);
  }

  function board() {
    var r = state.current; if (!r) return;
    r.status = "ongoing"; save(); render();
    toast("Boa viagem");
    if (state.route && state.route.coords && map) {
      map.fitBounds(L.latLngBounds(state.route.coords).pad(0.2));
    }
  }

  function finishRide() {
    var r = state.current; if (!r) return;
    var drv = r.driverId ? db.users.filter(function (u) { return u.id === r.driverId; })[0] : null;
    var isPartner = drv ? !!drv.isPartner : true;
    var rate = Number(db.pricing.commission) || 0.1;
    r.commission = isPartner ? Math.round(r.price * rate * 100) / 100 : 0;
    r.net = Math.round((r.price - r.commission) * 100) / 100;
    r.status = "completed"; r.finishedAt = now();
    var pax = db.users.filter(function (u) { return u.id === r.passengerId; })[0];
    if (pax) pax.trips = (pax.trips || 0) + 1;
    if (drv) { drv.trips = (drv.trips || 0) + 1; drv.earnings = (drv.earnings || 0) + r.net; drv.commissionPaid = (drv.commissionPaid || 0) + r.commission; }
    save();
    state.screen = "complete";
    render();
  }

  function cancelRide(asSearch) {
    clearTimers();
    if (state.current) {
      var r = db.rides.filter(function (x) { return x.id === state.current.id; })[0];
      if (r && r.status !== "completed") r.status = "cancelled";
      save();
    }
    state.current = null; state.offers = []; state.sheet = null;
    if (routeLine && map) { map.removeLayer(routeLine); routeLine = null; }
    setDestMarker(null); state.dest = null; state.destQuery = ""; state.route = null;
    clearCars();
    render();
    toast(asSearch ? "Busca cancelada" : "Corrida cancelada");
  }

  function driverAccept(id) {
    var u = currentUser();
    var r = db.rides.filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    r.status = "accepted"; r.driverId = u.id; r.driverName = u.name; r.vehicle = u.vehicle; r.plate = u.plate; r.price = r.offered;
    save();
    state.current = r; state.tab = "home"; state.sheet = "track";
    state.origin = r.origin; state.dest = r.dest; state.service = r.type;
    drawPins();
    applyRoute(fallbackRoute(r.origin, r.dest));
    toast("Você aceitou a corrida");
    render();
  }

  function savePricing() {
    document.querySelectorAll("[data-pr]").forEach(function (inp) {
      var s = inp.getAttribute("data-pr");
      var k = inp.getAttribute("data-k");
      var v = parseFloat(inp.value);
      if (s === "commission") db.pricing.commission = isFinite(v) ? v : 0.1;
      else if (db.pricing[s] && k) db.pricing[s][k] = isFinite(v) ? v : db.pricing[s][k];
    });
    save();
    toast("Taxas atualizadas");
    render();
  }

  function onAct(act, el, e) {
    var v = el && el.getAttribute("data-v");
    if (act === "auth-mode") { readAuthFields(); state.authMode = v; render(); }
    else if (act === "reg-role") { state.regRole = v; render(); }
    else if (act === "demo") { state.authMode = "login"; state.form.phone = el.getAttribute("data-phone"); state.form.password = "1234"; render(); login(state.form.phone, "1234"); }
    else if (act === "submit-auth") { readAuthFields(); if (state.authMode === "login") login(state.form.phone, state.form.password); else register(); }
    else if (act === "tab") { state.tab = v; state.sheet = null; state.pickOnMap = false; render(); }
    else if (act === "service") { state.service = v; state.extra = v === "freight" ? "carrocinha" : v === "delivery" ? "envelope" : "padrao"; if (state.route) { state.recommended = calcPrice(v, state.route.km, state.route.min, state.extra); if (state.priceMode === "auto") state.offered = state.recommended; } render(); }
    else if (act === "open-dest") { state.sheet = "dest"; state.pickOnMap = true; state.tab = "home"; render(); }
    else if (act === "close-sheet") { state.sheet = null; state.pickOnMap = false; render(); }
    else if (act === "locate") { locate(); toast("Centralizando no GPS"); }
    else if (act === "pick-dest") {
      state.dest = { lat: parseFloat(el.getAttribute("data-lat")), lng: parseFloat(el.getAttribute("data-lng")), name: el.getAttribute("data-name"), addr: el.getAttribute("data-addr") };
      state.destQuery = state.dest.name; drawPins(); computeRoute(); state.sheet = "price"; state.pickOnMap = false; render();
    }
    else if (act === "confirm-route") {
      if (!state.dest) return toast("Escolha um destino");
      if (!state.route) computeRoute();
      state.sheet = "price"; state.pickOnMap = false; render();
    }
    else if (act === "extra") {
      state.extra = v;
      if (state.route) { state.recommended = calcPrice(state.service, state.route.km, state.route.min, state.extra); if (state.priceMode === "auto") state.offered = state.recommended; }
      render();
    }
    else if (act === "pmode") { state.priceMode = v; if (v === "auto") state.offered = state.recommended; render(); }
    else if (act === "price-u") { state.priceMode = "custom"; state.offered = Math.round((state.offered + 1) * 2) / 2; render(); }
    else if (act === "price-d") { state.priceMode = "custom"; state.offered = Math.max(5, Math.round((state.offered - 1) * 2) / 2); render(); }
    else if (act === "back-dest") { state.sheet = "dest"; state.pickOnMap = true; render(); }
    else if (act === "search") startSearch();
    else if (act === "accept-offer") acceptOffer(el.getAttribute("data-id"));
    else if (act === "cancel-search") cancelRide(true);
    else if (act === "cancel-ride") cancelRide(false);
    else if (act === "board") board();
    else if (act === "finish") finishRide();
    else if (act === "rate") { state.rating = parseInt(v, 10); render(); }
    else if (act === "close-complete") {
      state.screen = "app"; state.sheet = null; state.current = null; state.dest = null; state.route = null; state.destQuery = "";
      if (routeLine && map) { map.removeLayer(routeLine); routeLine = null; }
      setDestMarker(null); clearCars(); fitRoute(); render();
    }
    else if (act === "open-chat") { state.chatOpen = true; render(); }
    else if (act === "close-chat") { state.chatOpen = false; render(); }
    else if (act === "send-chat") { sendChat(); }
    else if (act === "nav-waze") { openNav("waze"); }
    else if (act === "nav-google") { openNav("google"); }
    else if (act === "payment") { state.payment = v; render(); }
    else if (act === "confirm-payment") { if (state.current) { state.current.paymentStatus = "paid"; var rr = db.rides.filter(function (x) { return x.id === state.current.id; })[0]; if (rr) rr.paymentStatus = "paid"; save(); } toast("Pagamento simulado confirmado"); render(); }
    else if (act === "logout") { session(null); state.screen = "auth"; state.online = false; clearTimers(); toast("Sessão encerrada"); render(); }
    else if (act === "reset-demo") { localStorage.removeItem(KEY); load(); toast("Dados restaurados"); render(); }
    else if (act === "toggle-online") { state.online = !state.online; toast(state.online ? "Você está online" : "Você está offline"); render(); }
    else if (act === "driver-accept") driverAccept(el.getAttribute("data-id"));
    else if (act === "counter") {
      var id = el.getAttribute("data-id");
      var r = db.rides.filter(function (x) { return x.id === id; })[0];
      if (!r) return;
      state.dialog = { title: "Contra-proposta (R$)", value: String(Math.round((r.offered + 5) * 2) / 2), rideId: id };
      render();
    }
    else if (act === "dlg-cancel") { state.dialog = null; render(); }
    else if (act === "dlg-ok") {
      var inp = document.getElementById("dlg-in");
      var val = parseFloat(String(inp ? inp.value : "").replace(",", "."));
      var rid = state.dialog && state.dialog.rideId;
      state.dialog = null;
      var rr = db.rides.filter(function (x) { return x.id === rid; })[0];
      if (!rr || !isFinite(val)) { render(); return; }
      rr.offered = val; rr.price = val; save();
      toast("Contra-proposta enviada: " + brl(val));
      render();
    }
    else if (act === "save-pricing") savePricing();
    else if (act === "toggle-partner") {
      var d = db.users.filter(function (x) { return x.id === el.getAttribute("data-id"); })[0];
      if (!d || d.isAdmin) { toast("Titular não entra na regra de parceiro"); return; }
      d.isPartner = !d.isPartner; save(); render();
    }
  }

  document.getElementById("ui").addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]");
    if (!el) return;
    e.preventDefault();
    onAct(el.getAttribute("data-act"), el, e);
  });

  window.handleAppBack = function () {
    if (state.chatOpen) { state.chatOpen = false; render(); return true; }
    if (state.dialog) { state.dialog = null; render(); return true; }
    if (state.screen === "complete") { onAct("close-complete", document.body); return true; }
    if (state.sheet === "search") { return true; }
    if (state.sheet === "track") { return true; }
    if (state.sheet === "price") { state.sheet = "dest"; state.pickOnMap = true; render(); return true; }
    if (state.sheet === "dest") { state.sheet = null; state.pickOnMap = false; render(); return true; }
    if (state.tab && state.tab !== "home") { state.tab = "home"; render(); return true; }
    return false;
  };

  function boot() {
    load();
    var u = currentUser();
    render();
    later(function () {
      if (u) { state.screen = "app"; render(); locate(); }
      else { state.screen = "auth"; render(); }
    }, 1600);
  }

  boot();
})();
