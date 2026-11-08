
const paletaColores = [["#FF6B6B","Coral"], ["#2196F3","Azul"], ["#10B981","Verde"], ["#F59E0B","Amarillo"], ["#8B5CF6","Morado"], ["#EF4444","Rojo"], ["#EC4899","Rosa"], ["#14B8A6","Turquesa"], ["#F97316","Naranja"], ["#0F172A","Oscuro"], ["#FFFFFF","Blanco"]];
const botonesMenu = [["ejercicios", "Ejercicios"], ["rutinas", "Rutinas"], ["progreso", "Progreso"], ["cronometro", "Cronómetro"], ["correr", "Cardio"], ["calendario", "Calendario"], ["tiempo", "Tiempo"], ["musica", "Música"], ["video", "Vídeos"]];
let colorBicolorFondo = "#1E293B"; 
let colorBicolorAcento = "#3B82F6";
let contenido = null;
let misEjercicios = [], rutinas = [], historial = [], ejerciciosOcultos = [], medidasCuerpo = [], notasDias = {}, carreras = [], listasMusica = [], videosGuardados = [], podcastsGuardados = [];
let coloresMenu = {}, colorMenuGlobal = "", menuSeleccionado = "todos";
let tipoCardio = "correr", vozCorrer = true, alturaCm = 0, temaActual = "claro", letraActual = "mediana", colorActual = "#3B82F6", grupoActual = "";
let origenCarrera = "correr";
let formaBotones = "redondeado", opacidadColor = 1;

let metricaActual = "peso", periodoActual = 0;
let cronoIntervalo = null, cronoModo = "parado", cronoMs = 0, cronoInicio = 0, cronoFin = 0, cronoColor = "";
let mesActual = new Date().getMonth(), anioActual = new Date().getFullYear(), diaSeleccionado = null;
let correr = nuevoEstadoCorrer();

let playlistActual = [], indiceCancion = 0;
let audioGlobal = null, floatingPlayer = null;
let posicionScroll = 0;

function guardarScroll() { 
    posicionScroll = window.scrollY; 
}

function restaurarScroll() { 
    window.scrollTo(0, posicionScroll);
    setTimeout(() => { window.scrollTo(0, posicionScroll); }, 10);
    setTimeout(() => { window.scrollTo(0, posicionScroll); }, 50);
    setTimeout(() => { window.scrollTo(0, posicionScroll); }, 100);
}

document.addEventListener("DOMContentLoaded", function() {
    contenido = document.getElementById("contenido");
    audioGlobal = document.getElementById("global-audio");
    floatingPlayer = document.getElementById("floating-player");

    misEjercicios = cargarDatos("misEjercicios", []);
    rutinas = cargarDatos("misRutinas", []);
    historial = cargarDatos("historialEntrenamientos", []);
    ejerciciosOcultos = cargarDatos("ejerciciosOcultos", []);
    medidasCuerpo = cargarDatos("medidasCuerpo", []);
    notasDias = cargarDatos("notasDias", {});
    carreras = cargarDatos("carreras", []);
    listasMusica = cargarDatos("listasMusica", []);
    videosGuardados = cargarDatos("videosGuardados", []);
    podcastsGuardados = cargarDatos("podcastsGuardados", []);
    coloresMenu = cargarDatos("coloresMenu", {});
    colorMenuGlobal = leerTexto("colorMenuGlobal", "");
    vozCorrer = leerTexto("vozCorrer", "1") !== "0";
    alturaCm = parseFloat(leerTexto("alturaCm", "0")) || 0;
    
    temaActual = leerTexto("temaApp", "oscuro");
    letraActual = leerTexto("tamanioLetraApp", "mediana");
    colorActual = leerTexto("colorApp", "#3B82F6");
    formaBotones = leerTexto("formaBotonesApp", "redondeado");
    opacidadColor = parseFloat(leerTexto("opacidadColorApp", "1"));

    if (!Array.isArray(listasMusica)) listasMusica = [];
    if (!Array.isArray(videosGuardados)) videosGuardados = [];
    if (!Array.isArray(podcastsGuardados)) podcastsGuardados = [];
    if (!coloresMenu || typeof coloresMenu !== "object" || Array.isArray(coloresMenu)) coloresMenu = {};
    if (!/^#[0-9a-f]{6}$/i.test(colorMenuGlobal)) colorMenuGlobal = "";

    aplicarPreferencias();
    const vistaGuardada = sessionStorage.getItem("vistaActual");
if (vistaGuardada && vistaGuardada !== "inicio") {
    setTimeout(() => { mostrar(vistaGuardada); }, 50);
} else {
    mostrarInicio();
}
    procesarEnlaceCompartido();

    if(audioGlobal) audioGlobal.addEventListener('ended', nextSong);
});

function cargarDatos(c, v) { try { const d = localStorage.getItem(c); return d ? JSON.parse(d) : v; } catch (e) { return v; } }
function leerTexto(c, v) { try { const d = localStorage.getItem(c); return d ? d.replace(/"/g, "") : v; } catch (e) { return v; } }
function guardarDatos() {
    try {
        localStorage.setItem("misEjercicios", JSON.stringify(misEjercicios)); localStorage.setItem("misRutinas", JSON.stringify(rutinas));
        localStorage.setItem("historialEntrenamientos", JSON.stringify(historial)); localStorage.setItem("ejerciciosOcultos", JSON.stringify(ejerciciosOcultos));
        localStorage.setItem("medidasCuerpo", JSON.stringify(medidasCuerpo)); localStorage.setItem("notasDias", JSON.stringify(notasDias));
        localStorage.setItem("carreras", JSON.stringify(carreras)); localStorage.setItem("listasMusica", JSON.stringify(listasMusica));
        localStorage.setItem("videosGuardados", JSON.stringify(videosGuardados)); localStorage.setItem("podcastsGuardados", JSON.stringify(podcastsGuardados));
        localStorage.setItem("coloresMenu", JSON.stringify(coloresMenu)); localStorage.setItem("colorMenuGlobal", colorMenuGlobal);
        localStorage.setItem("vozCorrer", vozCorrer ? "1" : "0"); localStorage.setItem("alturaCm", String(alturaCm));
        localStorage.setItem("temaApp", temaActual); localStorage.setItem("tamanioLetraApp", letraActual); localStorage.setItem("colorApp", colorActual);
        localStorage.setItem("formaBotonesApp", formaBotones); localStorage.setItem("opacidadColorApp", String(opacidadColor));
      localStorage.setItem("colorBicolorFondo", colorBicolorFondo);
localStorage.setItem("colorBicolorAcento", colorBicolorAcento);
    } catch (e) { aviso("Error al guardar"); }
}

function hexToRgba(hex, alpha) {
    if (hex.length !== 7) return hex;
    let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function colorDeBoton(clave) {
    if (coloresMenu[clave]) return coloresMenu[clave];
    if (colorMenuGlobal) return colorMenuGlobal;
    if (temaActual === "bicolor") return localStorage.getItem("colorBicolorAcento") || "#3B82F6";
    return colorActual;
}

function esColorClaro(hex) {
    if (!hex || hex.length !== 7) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function aplicarPreferencias() {
    document.body.style.overflowAnchor = "none";
    document.body.className = "";
    if (temaActual === "oscuro") document.body.classList.add("tema-oscuro");
    if (temaActual === "oled") document.body.classList.add("tema-oled");
    if (temaActual === "claro") document.body.classList.add("tema-claro");
    if (temaActual === "bicolor") document.body.classList.add("tema-bicolor");
    document.body.classList.add("letra-" + letraActual);

    if (temaActual === "bicolor") {
        let fondo = localStorage.getItem("colorBicolorFondo") || "#1E293B";
        let acento = localStorage.getItem("colorBicolorAcento") || "#3B82F6";
        
        // Forzamos el color de fondo con !important para que el CSS no lo bloquee
        document.body.style.setProperty("background-color", fondo, "important");
        document.documentElement.style.setProperty("--bg-main", fondo, "important");
        document.documentElement.style.setProperty("--text-main", esColorClaro(fondo) ? "#0F172A" : "#F8FAFC", "important");
        
        const colorFinal = opacidadColor >= 1 ? acento : hexToRgba(acento, opacidadColor);
        document.documentElement.style.setProperty("--accent", colorFinal, "important");
    } else {
        // Si no es bicolor, limpiamos los estilos forzados
        document.body.style.removeProperty("background-color");
        document.documentElement.style.removeProperty("--bg-main");
        document.documentElement.style.removeProperty("--text-main");
        const colorFinal = opacidadColor >= 1 ? colorActual : hexToRgba(colorActual, opacidadColor);
        document.documentElement.style.setProperty("--accent", colorFinal);
    }

    const formas = { "recto": "4px", "redondeado": "14px", "pastilla": "40px", "circulo": "50%" };
    const radioFinal = formas[formaBotones] || "40px";
    document.documentElement.style.setProperty("--radio", radioFinal);

    document.querySelectorAll('.menu button').forEach(function(boton) {
        const onclick = boton.getAttribute('onclick') || '';
        const m = onclick.match(/mostrar\(\s*['"]([^'"]+)['"]\s*\)/);
        if (!m) return;
        const clave = m[1];
        const cBtn = colorDeBoton(clave);
        const colorStr = opacidadColor >= 1 ? cBtn : hexToRgba(cBtn, opacidadColor);
        boton.style.setProperty('background', colorStr, 'important');
        boton.style.setProperty('color', '#ffffff', 'important');
        boton.style.setProperty('border-radius', radioFinal, 'important');
    });
}

function generarId() { return "id_" + Date.now() + "_" + Math.floor(Math.random() * 1000); }
function escaparHTML(t) { return String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function fechaATexto(f) { return `${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,"0")}-${String(f.getDate()).padStart(2,"0")}`; }
function textoAFecha(t) { const p = String(t).split("-"); return new Date(p[0], p[1]-1, p[2]); }
function obtenerFechaActual() { return fechaATexto(new Date()); }
function formatearFecha(f) { const p = f.split("-"); return `${p[2]}/${p[1]}/${p[0]}`; }
function formatoNum(n, d = 1) { const f = Math.pow(10, d); return String(Math.round(n * f) / f).replace(".", ","); }

let avisoTimeout = null;
function aviso(t) { const c = document.getElementById("aviso"); if(!c) return; c.textContent = t; c.classList.add("visible"); clearTimeout(avisoTimeout); avisoTimeout = setTimeout(() => c.classList.remove("visible"), 2800); }
window.alert = (t) => aviso(t);

function confirmar(texto, alAceptar) {
    // Borramos cualquier ventana que haya abierta antes
    const anterior = document.getElementById("modal-flotante");
    if (anterior) anterior.remove();

    const f = document.createElement("div");
    f.id = "modal-flotante";
    // Fondo oscuro que cubre toda la pantalla
    f.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 20px; box-sizing: border-box;";
    
    // La caja central con los botones
    f.innerHTML = `
        <div style="background: var(--bg-main); padding: 20px; border-radius: var(--radio); width: 100%; max-width: 320px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.5); border: 1px solid var(--border-color);">
            <p style="margin: 0 0 20px 0; color: var(--text-main); font-size: 16px; font-weight: bold;">${escaparHTML(texto)}</p>
            <div style="display: flex; gap: 10px;">
                <button class="boton-si" style="background:#10B981; color:white; flex:1; padding:12px; font-size:14px; border-radius:8px; border:none; font-weight:bold; cursor:pointer;">Sí</button>
                <button class="boton-no" style="background:#EF4444; color:white; flex:1; padding:12px; font-size:14px; border-radius:8px; border:none; font-weight:bold; cursor:pointer;">No</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(f);
    
    f.querySelector(".boton-si").onclick = () => { f.remove(); alAceptar(); };
    f.querySelector(".boton-no").onclick = () => f.remove();
}

function abrirEnlace(url) { 
    const a = document.createElement("a"); 
    a.href = url; 
    a.target = "_blank"; 
    a.rel = "noopener"; 
    document.body.appendChild(a); 
    a.click(); 
    a.remove(); 
}

function mostrar(apartado) {
    const cont = document.getElementById("contenido");
    const panelInicio = document.getElementById("inicio-panel");
    const btn = document.querySelector(`.menu button[onclick="mostrar('${apartado}')"]`);
    
    sessionStorage.setItem("vistaActual", apartado); // <--- GUARDA LA VISTA

    if(panelInicio) panelInicio.style.display = "none";

    if (cont.style.display === "block" && cont.dataset.vistaActual === apartado) {
        cont.style.display = "none";
        cont.dataset.vistaActual = "";
        sessionStorage.removeItem("vistaActual"); // <--- BORRA SI SE CIERRA
        if(panelInicio) panelInicio.style.display = "block";
        return;
    }

    if (btn) {
        btn.parentNode.insertBefore(cont, btn.nextSibling);
    }

    cont.style.display = "block";
    cont.dataset.vistaActual = apartado;
    
    const v = { inicio: mostrarInicio, ejercicios: mostrarEjercicios, rutinas: mostrarRutinas, progreso: mostrarProgreso, cronometro: mostrarCronometro, calendario: mostrarCalendario, correr: mostrarCorrer, musica: mostrarMusica, video: mostrarVideos, tiempo: mostrarTiempo, ajustes: mostrarAjustes, podcasts: mostrarPodcasts };
    if (v[apartado]) v[apartado]();
}

function mostrarInicio() {
    const cont = document.getElementById("contenido");
    cont.style.display = "none";
    const panel = document.getElementById("inicio-panel");
    panel.style.display = "block";

    const uP = obtenerUltimoPeso();
    
    panel.innerHTML = `
        <div class="inicio-grid">
            <div class="tarjeta-inicio" onclick="this.classList.toggle('expandida')">
                <div class="icono-grande">💪</div>
                <h3>Rutinas</h3>
                <p>${rutinas.length} creadas</p>
            </div>
            
            <div class="tarjeta-inicio" onclick="this.classList.toggle('expandida')">
                <div class="icono-grande">📅</div>
                <h3>Entrenos</h3>
                <p>${historial.length} hechos</p>
            </div>

            <div class="tarjeta-inicio" style="grid-column: 1 / -1;" id="inicioTiempoCard">
                <h3>🌤️ El Tiempo</h3>
                <div id="tiempoInicioContenido"><p>Buscando...</p></div>
            </div>

            <div class="tarjeta-inicio" style="grid-column: 1 / -1;" onclick="this.classList.toggle('expandida')">
                <h3>📈 Evolución Peso</h3>
                ${uP ? `<p>Último: ${formatoNum(uP.valor)} kg</p>` : "<p>Sin registros</p>"}
                <div id="graficaInicio" style="width:100%; margin-top:10px;"></div>
            </div>
        </div>
    `;

    const registrosPeso = medidasCuerpo.filter(r => r.peso).sort((a,b) => a.fecha.localeCompare(b.fecha)).slice(-7);
    if (registrosPeso.length >= 2) {
        const max = Math.max(...registrosPeso.map(r => r.peso)) + 2;
        const min = Math.min(...registrosPeso.map(r => r.peso)) - 2;
        let polyline = "", circulos = "";
        registrosPeso.forEach((r, i) => {
            const x = (i / (registrosPeso.length - 1)) * 100;
            const y = 100 - ((r.peso - min) / (max - min)) * 100;
            polyline += `${x},${y} `;
            circulos += `<circle cx="${x}" cy="${y}" r="2" fill="var(--accent)" />`;
        });
        document.getElementById("graficaInicio").innerHTML = `<svg viewBox="0 -5 100 110" style="width:100%; height:60px; overflow:visible;"><polyline points="${polyline}" fill="none" stroke="var(--accent)" stroke-width="2" />${circulos}</svg>`;
    }

    const cacheClima = localStorage.getItem("climaCache");
    const horaClima = localStorage.getItem("climaCacheHora");
    if (cacheClima && horaClima && (Date.now() - parseInt(horaClima)) < 10800000) {
        document.getElementById("tiempoInicioContenido").innerHTML = cacheClima;
    } else {
        cargarTiempoInicio();
    }
}

function cargarTiempoInicio() {
    const c = document.getElementById("tiempoInicioContenido");
    if (!c || !navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(function(pos) {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true`)
        .then(r => r.json())
        .then(d => {
            const t = d.current_weather.temperature, cod = d.current_weather.weathercode;
            let i = "🌤️", txt = "Despejado";
            if ([0, 1].includes(cod)) { i = "☀️"; txt = "Soleado"; } else if ([2, 3].includes(cod)) { i = "☁️"; txt = "Nublado"; } else if (cod >= 50) { i = "🌧️"; txt = "Lluvia"; }
            
            const htmlClima = `
                <div style="text-align:center; padding:10px;">
                    <div style="font-size:40px; line-height:1;">${i}</div>
                    <h3 style="font-size:28px; margin:5px 0; color:var(--text-main);">${t}°C</h3>
                    <p style="font-size:12px;">${txt}</p>
                </div>
            `;
            c.innerHTML = htmlClima;
            localStorage.setItem("climaCache", htmlClima);
            localStorage.setItem("climaCacheHora", Date.now());
        }).catch(() => { c.innerHTML = "<p>Error al cargar el tiempo.</p>"; });
    });
}

/* =====================================================
   EJERCICIOS
===================================================== */
const URL_IMG = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
function ex(id, nombre, grupo, equipo, compuesto, descripcion, img) { return { id, nombre, grupo, equipo, compuesto, descripcion, img: img || "" }; }

const ejerciciosBase = [
    ex("e1", "Press de banca con barra", "Pecho", "Pesas", true, "Tumbado en el banco, baja la barra al pecho y empuja hacia arriba.", "Barbell_Bench_Press_-_Medium_Grip"),
    ex("e2", "Press de banca con mancuernas", "Pecho", "Pesas", true, "Tumbado, baja las mancuernas a los lados del pecho y empuja.", "Dumbbell_Bench_Press"),
    ex("e3", "Press inclinado con mancuernas", "Pecho", "Pesas", true, "Banco a 30-45 grados. Empuja las mancuernas hacia arriba.", "Incline_Dumbbell_Press"),
    ex("e4", "Press declinado con barra", "Pecho", "Pesas", true, "Banco declinado. Baja la barra al pecho y empuja.", "Decline_Barbell_Bench_Press"),
    ex("e5", "Aperturas con mancuernas", "Pecho", "Pesas", false, "Tumbado, abre los brazos en arco con codos ligeramente flexionados.", "Dumbbell_Flyes"),
    ex("e6", "Aperturas en polea", "Pecho", "Polea", false, "De pie entre poleas, junta las manos al frente.", "Cable_Crossover"),
    ex("e7", "Flexiones", "Pecho", "Peso corporal", true, "Cuerpo recto, baja el pecho al suelo y empuja.", "Pushups"),
    ex("e8", "Flexiones diamante", "Pecho", "Peso corporal", true, "Manos juntas formando un rombo. Baja y empuja.", "Push-Ups_-_Close_Triceps_Position"),
    ex("e9", "Fondos en paralelas (pecho)", "Pecho", "Peso corporal", true, "Inclina el torso hacia adelante y baja flexionando los codos.", "Dips_-_Chest_Version"),
    ex("e10", "Press de pecho con goma", "Pecho", "Gomas", true, "Goma por la espalda, sujeta los extremos y empuja al frente.", "Band_Press"),
    ex("e11", "Aperturas con goma", "Pecho", "Gomas", false, "Goma por la espalda, abre los brazos en arco.", "Band_Chest_Fly"),
    ex("e12", "Dominadas", "Espalda", "Peso corporal", true, "Cuélgate de la barra y tira hasta pasar la barbilla.", "Pullups"),
    ex("e13", "Jalón al pecho en polea", "Espalda", "Polea", true, "Sentado, tira de la barra hacia la parte alta del pecho.", "Wide-Grip_Lat_Pulldown"),
    ex("e14", "Remo con barra", "Espalda", "Pesas", true, "Torso inclinado, tira de la barra hacia el abdomen.", "Bent_Over_Barbell_Row"),
    ex("e15", "Remo con mancuerna a una mano", "Espalda", "Pesas", true, "Apoya rodilla y mano en banco. Tira de la mancuerna a la cadera.", "One-Arm_Dumbbell_Row"),
    ex("e16", "Remo en polea baja", "Espalda", "Polea", true, "Sentado, tira del agarre hacia el abdomen.", "Seated_Cable_Rows"),
    ex("e17", "Remo en máquina T", "Espalda", "Pesas", true, "Torso inclinado sobre el soporte, tira de las asas.", "T-Bar_Row_with_Handle"),
    ex("e18", "Peso muerto convencional", "Espalda", "Pesas", true, "Barra en el suelo, espalda recta. Sube estirando cadera y rodillas.", "Barbell_Deadlift"),
    ex("e19", "Peso muerto rumano", "Espalda", "Pesas", true, "Piernas semirrígidas, baja la barra pegada a las piernas.", "Romanian_Deadlift"),
    ex("e20", "Pull-over con mancuerna", "Espalda", "Pesas", false, "Tumbado, lleva la mancuerna desde arriba de la cabeza al pecho.", "Bent-Arm_Dumbbell_Pullover"),
    ex("e21", "Remo invertido", "Espalda", "Peso corporal", true, "Cuerpo recto bajo una barra baja, tira del pecho a la barra.", "Inverted_Row"),
    ex("e22", "Superman", "Espalda", "Peso corporal", false, "Boca abajo, eleva brazos y piernas simultáneamente.", "Superman"),
    ex("e23", "Remo con goma", "Espalda", "Gomas", true, "Goma en los pies, tira de los extremos hacia el abdomen.", "Seated_Band_Row"),
    ex("e24", "Jalón con goma", "Espalda", "Gomas", false, "Goma fijada en alto, tira hacia el pecho.", "Band_Pulldown"),
    ex("e25", "Sentadilla con barra (trasera)", "Piernas", "Pesas", true, "Barra en trapecios. Baja la cadera como si te sentaras.", "Barbell_Squat"),
    ex("e26", "Sentadilla frontal con barra", "Piernas", "Pesas", true, "Barra apoyada en la parte delantera de los hombros.", "Front_Barbell_Squat"),
    ex("e27", "Sentadilla goblet", "Piernas", "Pesas", true, "Sujeta una mancuerna o kettlebell contra el pecho.", "Goblet_Squat"),
    ex("e28", "Sentadilla búlgara", "Piernas", "Pesas", true, "Pie trasero elevado en un banco. Baja flexionando la pierna delantera.", "Bulgarian_Split_Squat"),
    ex("e29", "Zancadas caminando", "Piernas", "Peso corporal", true, "Da pasos largos y baja flexionando las rodillas.", "Dumbbell_Lunges"),
    ex("e30", "Prensa de piernas", "Piernas", "Máquina", true, "Empuja la plataforma con los pies.", "Leg_Press"),
    ex("e31", "Hip thrust con barra", "Piernas", "Pesas", true, "Espalda alta en banco, sube la cadera con la barra.", "Barbell_Hip_Thrust"),
    ex("e32", "Puente de glúteos", "Piernas", "Peso corporal", false, "Tumbado boca arriba, sube la cadera apretando glúteos.", "Butt_Lift_Bridge"),
    ex("e33", "Curl femoral en máquina", "Piernas", "Máquina", false, "Tumbado o sentado, flexiona las rodillas.", "Lying_Leg_Curls"),
    ex("e34", "Extensión de cuádriceps en máquina", "Piernas", "Máquina", false, "Sentado, extiende las piernas.", "Leg_Extensions"),
    ex("e35", "Elevación de talones de pie", "Piernas", "Peso corporal", false, "Sube sobre las puntas de los pies.", "Standing_Calf_Raises"),
    ex("e36", "Peso muerto a una pierna", "Piernas", "Pesas", true, "A una pierna, baja el torso y la mancuerna manteniendo el equilibrio.", "Single_Leg_Romanian_Deadlift"),
    ex("e37", "Sentadilla con goma", "Piernas", "Gomas", true, "Pisa la goma y sujeta los extremos en los hombros.", "Band_Squat"),
    ex("e38", "Patada de glúteo en polea", "Piernas", "Polea", false, "Patea hacia atrás con la pierna, apretando el glúteo.", "Glute_Kickback"),
    ex("e39", "Step-up con mancuernas", "Piernas", "Pesas", true, "Sube a un cajón o banco, una pierna a la vez.", "Dumbbell_Step_Ups"),
    ex("e40", "Press militar con barra", "Hombros", "Pesas", true, "De pie o sentado, empuja la barra por encima de la cabeza.", "Standing_Military_Press"),
    ex("e41", "Press de hombros con mancuernas", "Hombros", "Pesas", true, "Sentado, empuja las mancuernas hacia arriba.", "Dumbbell_Shoulder_Press"),
    ex("e42", "Arnold press", "Hombros", "Pesas", true, "Empieza con mancuernas frente al pecho, gira y empuja.", "Arnold_Dumbbell_Press"),
    ex("e43", "Elevaciones laterales", "Hombros", "Pesas", false, "Eleva los brazos hacia los lados hasta la altura de los hombros.", "Side_Lateral_Raise"),
    ex("e44", "Elevaciones frontales", "Hombros", "Pesas", false, "Eleva una mancuerna al frente hasta la altura del hombro.", "Front_Dumbbell_Raise"),
    ex("e45", "Pájaros (deltoide posterior)", "Hombros", "Pesas", false, "Inclinado, abre los brazos hacia los lados.", "Seated_Bent-Over_Rear_Delt_Raise"),
    ex("e46", "Face pull en polea", "Hombros", "Polea", false, "Tira de la cuerda hacia la cara, separando las manos.", "Face_Pull"),
    ex("e47", "Elevaciones laterales con goma", "Hombros", "Gomas", false, "Pisa la goma y eleva los brazos a los lados.", "Band_Lateral_Raise"),
    ex("e48", "Press de hombros con goma", "Hombros", "Gomas", true, "Pisa la goma y empuja los extremos hacia arriba.", "Band_Shoulder_Press"),
    ex("e49", "Encogimientos de hombros (trapecio)", "Hombros", "Pesas", false, "Sube los hombros hacia las orejas con mancuernas o barra.", "Dumbbell_Shrug"),
    ex("e50", "Curl de bíceps con barra", "Bíceps", "Pesas", false, "De pie, sube la barra flexionando los codos.", "Barbell_Curl"),
    ex("e51", "Curl de bíceps con mancuernas", "Bíceps", "Pesas", false, "Sube las mancuernas alternando o a la vez.", "Dumbbell_Bicep_Curl"),
    ex("e52", "Curl martillo", "Bíceps", "Pesas", false, "Palmas enfrentadas, sube las mancuernas.", "Hammer_Curls"),
    ex("e53", "Curl en banco Scott", "Bíceps", "Pesas", false, "Brazos apoyados en el banco Scott, flexiona los codos.", "Preacher_Curl"),
    ex("e54", "Curl concentrado", "Bíceps", "Pesas", false, "Sentado, codo apoyado en el muslo, sube la mancuerna.", "Concentration_Curls"),
    ex("e55", "Curl en polea", "Bíceps", "Polea", false, "De pie frente a la polea baja, flexiona los codos.", "Standing_Bicep_Cable_Curl"),
    ex("e56", "Curl con goma", "Bíceps", "Gomas", false, "Pisa la goma y flexiona los codos.", "Standing_Bicep_Cable_Curl"),
    ex("e57", "Extensión de tríceps en polea", "Tríceps", "Polea", false, "Empuja la cuerda o barra hacia abajo.", "Triceps_Pushdown"),
    ex("e58", "Extensión de tríceps sobre la cabeza", "Tríceps", "Pesas", false, "Sujeta una mancuerna con ambas manos y baja detrás de la nuca.", "Standing_Dumbbell_Triceps_Extension"),
    ex("e59", "Press francés", "Tríceps", "Pesas", false, "Tumbado, baja la barra hacia la frente.", "EZ-Bar_Skullcrusher"),
    ex("e60", "Patada de tríceps", "Tríceps", "Pesas", false, "Torso inclinado, extiende el brazo hacia atrás.", "Tricep_Dumbbell_Kickback"),
    ex("e61", "Fondos en banco", "Tríceps", "Peso corporal", false, "Manos en el banco, baja el cuerpo flexionando los codos.", "Bench_Dips"),
    ex("e62", "Fondos en paralelas (tríceps)", "Tríceps", "Peso corporal", true, "Cuerpo recto, baja flexionando los codos.", "Dips_-_Triceps_Version"),
    ex("e63", "Extensión de tríceps con goma", "Tríceps", "Gomas", false, "Goma fijada en alto, empuja hacia abajo.", "Band_Triceps_Extension"),
    ex("e64", "Plancha frontal", "Abdominales", "Peso corporal", false, "Apoya antebrazos y puntas de pies, mantén el cuerpo recto.", "Plank"),
    ex("e65", "Plancha lateral", "Abdominales", "Peso corporal", false, "De lado, apoya antebrazo y mantén la cadera elevada.", "Side_Bridge"),
    ex("e66", "Crunch abdominal", "Abdominales", "Peso corporal", false, "Tumbado, sube los hombros del suelo.", "Crunches"),
    ex("e67", "Elevación de piernas", "Abdominales", "Peso corporal", false, "Tumbado, sube las piernas rectas.", "Flat_Bench_Lying_Leg_Raise"),
    ex("e68", "Mountain climbers", "Abdominales", "Peso corporal", true, "En plancha, lleva las rodillas al pecho alternando rápido.", "Mountain_Climbers"),
    ex("e69", "Russian twist", "Abdominales", "Peso corporal", false, "Sentado, gira el torso de lado a lado.", "Russian_Twist"),
    ex("e70", "Dead bug", "Abdominales", "Peso corporal", false, "Tumbado, extiende brazo y pierna opuestos.", "Dead_Bug"),
    ex("e71", "Rueda abdominal", "Abdominales", "Pesas", false, "De rodillas, rueda hacia adelante y vuelve.", "Ab_Roller"),
    ex("e72", "Crunch en polea alta", "Abdominales", "Polea", false, "De rodillas, flexiona el torso hacia abajo.", "Cable_Crunch"),
    ex("e73", "Thruster (Sentadilla + Press)", "Compuestos", "Pesas", true, "Sentadilla y al subir empuja las mancuernas sobre la cabeza."),
    ex("e74", "Burpees", "Compuestos", "Peso corporal", true, "Flexión, salto y palmada arriba."),
    ex("e75", "Clean and Press", "Compuestos", "Pesas", true, "Sube la barra al pecho y luego empújala arriba."),
    ex("e76", "Snatch con mancuerna", "Compuestos", "Pesas", true, "Levanta la mancuerna del suelo a la cabeza en un solo movimiento."),
    ex("e77", "Kettlebell Swing", "Compuestos", "Pesas", true, "Balancea la pesa rusa entre las piernas y arriba."),
    ex("e78", "Man Maker", "Compuestos", "Pesas", true, "Flexión, remo, cargada y press con mancuernas."),
    ex("e79", "Zancada con curl", "Compuestos", "Pesas", true, "Zancada y al subir haz un curl de bíceps."),
    ex("e80", "Renegade Row", "Compuestos", "Pesas", true, "En plancha con mancuernas, rema alternando brazos."),
    ex("e81", "Bear Crawl", "Compuestos", "Peso corporal", true, "Gatea manteniendo las rodillas cerca del suelo."),
    ex("e82", "Wall Balls", "Compuestos", "Pesas", true, "Sentadilla y lanza un balón medicinal a la pared."),
    ex("e83", "Jumping Jacks", "Cardio", "Peso corporal", false, "Salta abriendo piernas y brazos."),
    ex("e84", "High Knees", "Cardio", "Peso corporal", false, "Corre en el sitio elevando las rodillas."),
    ex("e85", "Jump Squats", "Cardio", "Peso corporal", true, "Sentadilla y salto explosivo."),
    ex("e86", "Box Jumps", "Cardio", "Peso corporal", true, "Salta sobre un cajón."),
    ex("e87", "Saltar la cuerda", "Cardio", "Peso corporal", false, "Salta la cuerda a ritmo."),
    ex("e88", "Battle Ropes", "Cardio", "Pesas", false, "Ondula las cuerdas rápidamente."),
    ex("e89", "Sentadilla con goma", "Piernas", "Gomas", true, "Pisa la goma y sube contra resistencia."),
    ex("e90", "Peso muerto con goma", "Piernas", "Gomas", true, "Pisa la goma y estira la cadera."),
    ex("e91", "Press de pecho con goma", "Pecho", "Gomas", true, "Goma por la espalda, empuja al frente."),
    ex("e92", "Remo con goma", "Espalda", "Gomas", true, "Goma en los pies, tira al abdomen."),
    ex("e93", "Jalón con goma", "Espalda", "Gomas", false, "Goma arriba, tira al pecho."),
    ex("e94", "Elevaciones laterales con goma", "Hombros", "Gomas", false, "Pisa la goma y eleva los brazos."),
    ex("e95", "Curl de bíceps con goma", "Bíceps", "Gomas", false, "Pisa la goma y flexiona los codos."),
    ex("e96", "Extensión de tríceps con goma", "Tríceps", "Gomas", false, "Goma alta, empuja hacia abajo."),
    ex("e97", "Patada de glúteo con goma", "Piernas", "Gomas", false, "Goma en los tobillos, patea hacia atrás."),
    ex("e98", "Abducción de cadera con goma", "Piernas", "Gomas", false, "Goma en los muslos, abre las piernas.")
];

function obtenerEjercicios() { return [...ejerciciosBase.filter(e => !ejerciciosOcultos.includes(e.id)), ...misEjercicios]; }
const GRUPOS_EJERCICIO = [
    { nombre: "Compuestos", color: "#8B5CF6", filtro: "Compuestos" },
    { nombre: "Pecho", color: "#EF4444", filtro: "Pecho" }, 
    { nombre: "Espalda", color: "#3B82F6", filtro: "Espalda" },
    { nombre: "Bíceps", color: "#EC4899", filtro: "Bíceps" }, 
    { nombre: "Tríceps", color: "#F97316", filtro: "Tríceps" },
    { nombre: "Hombros", color: "#F59E0B", filtro: "Hombros" }, 
    { nombre: "Piernas", color: "#10B981", filtro: "Piernas" },
    { nombre: "Abdominales", color: "#14B8A6", filtro: "Abdominales" }
];

function mostrarEjercicios(grupoAbierto) {
    contenido.innerHTML = `
        <h2>Biblioteca de ejercicios</h2>
        <button class="boton-crear-ejercicio" onclick="mostrarFormularioEjercicio()" style="width:100%;background:#10B981;color:white;margin-bottom:15px;">+ Crear ejercicio</button>
        <div id="acordeonEjercicios">
            ${GRUPOS_EJERCICIO.map(g => `
                <div style="margin-bottom:8px;">
                    <button class="chip-ejercicio" style="width:100%; text-align:left; border-color:${g.color}; color:${g.color}; padding:12px; border-radius:10px; display:flex; justify-content:space-between; background:var(--bg-main);" onclick="toggleGrupoEjercicio('${g.filtro}', this)">
                        ${g.nombre} <span>▸</span>
                    </button>
                    <div id="grupo-${g.filtro}" style="display:none; margin-top:10px; padding-left:10px; border-left:2px solid ${g.color};"></div>
                </div>
            `).join("")}
        </div>
    `;
    
    if (grupoAbierto) {
        const btn = document.querySelector(`button[onclick*="'${grupoAbierto}'"]`);
        if (btn) toggleGrupoEjercicio(grupoAbierto, btn);
    }
}

function toggleGrupoEjercicio(grupo, btn) {
    const div = document.getElementById(`grupo-${grupo}`);
    if (!div) return;
    
    if (div.style.display === "block") {
        div.style.display = "none";
        btn.innerHTML = `${btn.innerText.replace('▾', '').trim()} <span>▸</span>`;
    } else {
        div.style.display = "block";
        btn.innerHTML = `${btn.innerText.replace('▸', '').trim()} <span>▾</span>`;
        
        const ejercicios = obtenerEjercicios().filter(x => grupo === "Compuestos" ? x.grupo === "Compuestos" : (grupo.indexOf("eq:") === 0 ? x.equipo === grupo.slice(3) : x.grupo === grupo));
        
        div.innerHTML = ejercicios.length === 0 ? "<p>No hay ejercicios.</p>" : ejercicios.map(x => `
            <div class="tarjeta-ejercicio" style="cursor:pointer; padding:10px; margin-bottom:5px; border:none; background:var(--bg-main);" onclick="verDetalleEjercicio('${x.id}', '${grupo}')">
                <h3 style="font-size:14px; margin:0;">${escaparHTML(x.nombre)}</h3>
            </div>
        `).join("");
    }
}

function verDetalleEjercicio(id, grupo) {
    guardarScroll();
    const e = obtenerEjercicios().find(x => x.id === id); if (!e) return;
    let htmlImg = e.img ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:15px 0;"><img src="${URL_IMG}${e.img}/images/0.jpg" style="width:100%;border-radius:12px;" loading="lazy"><img src="${URL_IMG}${e.img}/images/1.jpg" style="width:100%;border-radius:12px;" loading="lazy"></div>` : "";
    
    contenido.innerHTML = `
        <button class="boton-texto" onclick="mostrarEjercicios('${grupo}')" style="color: var(--accent); font-size: 16px; margin-bottom: 20px; display: inline-block; font-weight: bold; padding: 0;">◀ Volver</button>
        <h2>${escaparHTML(e.nombre)}</h2>
        <div style="margin-bottom:10px;"><span class="etiqueta">${e.grupo}</span></div>
        ${htmlImg}
        <div class="tarjeta-rutina" style="white-space:pre-line;">${escaparHTML(e.descripcion)}</div>
        ${!ejerciciosBase.some(b => b.id === e.id) ? `<button class="boton-texto texto-rojo" onclick="eliminarEjercicio('${e.id}')">🗑 Eliminar</button>` : ''}
    `;
}

function filtrarGrupo(grupo) {
    grupoActual = grupo; document.querySelectorAll(".chip-ejercicio").forEach(b => b.classList.remove("activo"));
    const activo = document.querySelector(`.chip-ejercicio[onclick*="'${grupo}'"]`); if (activo) activo.classList.add("activo");
    filtrarBiblioteca();
}
function filtrarBiblioteca() {
    const lista = document.getElementById("listaEjercicios"); if (!lista) return;
    if (grupoActual === "") { lista.innerHTML = `<div style="text-align:center;padding:20px;opacity:0.7;"><p>Selecciona un grupo.</p></div>`; return; }
    const e = obtenerEjercicios().filter(x => grupoActual === "Todos" ? true : (grupoActual === "Compuestos" ? x.grupo === "Compuestos" : x.grupo === grupoActual));
    lista.innerHTML = e.length === 0 ? "<p>No hay ejercicios.</p>" : e.map(x => `
        <div class="tarjeta-ejercicio" style="cursor:pointer;" onclick="verDetalleEjercicio('${x.id}')">
            <h3>${escaparHTML(x.nombre)}</h3>
            <div style="display:flex;gap:6px;margin-top:8px;"><span class="etiqueta">${x.grupo}</span><span class="etiqueta">${x.equipo}</span></div>
        </div>
    `).join("");
}

function mostrarFormularioEjercicio() { 
    guardarScroll();
    contenido.innerHTML = `<button class="boton-texto texto-volver" onclick="mostrarEjercicios('${grupoActual}')">◀ Volver</button><h2>Crear ejercicio</h2><label>Nombre</label><input type="text" id="nuevoNombre"><label>Grupo</label><select id="nuevoGrupo"><option value="Compuestos">Compuestos</option><option value="Pecho">Pecho</option><option value="Espalda">Espalda</option><option value="Bíceps">Bíceps</option><option value="Tríceps">Tríceps</option><option value="Hombros">Hombros</option><option value="Piernas">Piernas</option><option value="Abdominales">Abdominales</option></select><label>Equipo</label><select id="nuevoEquipo"><option value="Pesas">Pesas</option><option value="Gomas">Gomas</option><option value="Peso corporal">Peso corporal</option></select><label>Descripción</label><textarea id="nuevaDescripcion"></textarea><button onclick="guardarNuevoEjercicio()" style="width:100%;margin-top:10px;background:#10B981;">Guardar</button>`; 
}
function guardarNuevoEjercicio() { const n = document.getElementById("nuevoNombre").value.trim(); if (!n) { alert("Falta nombre."); return; } misEjercicios.push({ id: generarId(), nombre: n, grupo: document.getElementById("nuevoGrupo").value, equipo: document.getElementById("nuevoEquipo").value, descripcion: document.getElementById("nuevaDescripcion").value.trim(), img: "" }); guardarDatos(); mostrarEjercicios(grupoActual); }
function eliminarEjercicio(id) { confirmar("¿Eliminar este ejercicio?", () => { misEjercicios = misEjercicios.filter(e => e.id !== id); guardarDatos(); mostrarEjercicios(grupoActual); }); }

/* =====================================================
   RUTINAS Y PLANTILLAS
===================================================== */
const plantillasRutinas = [
    { nombre: "Fuerza", descripcion: "Carga alta y pocas repeticiones.", ejercicios: [["e18", 5, 5], ["e25", 5, 5], ["e1", 5, 5], ["e40", 5, 5], ["e12", 3, 8]] },
    { nombre: "Volumen", descripcion: "Hipertrofia.", ejercicios: [["e2", 4, 10], ["e14", 4, 10], ["e41", 4, 10], ["e25", 4, 10], ["e50", 3, 12]] },
    { nombre: "Definición", descripcion: "Altas repeticiones.", ejercicios: [["e25", 3, 15], ["e7", 3, 15], ["e29", 3, 15], ["e43", 3, 15], ["e64", 3, 20]] },
    { nombre: "Empuje", descripcion: "Pecho, hombro, tríceps.", ejercicios: [["e1", 4, 8], ["e3", 3, 10], ["e40", 4, 10], ["e43", 3, 15], ["e57", 3, 12]] },
    { nombre: "Tirón", descripcion: "Espalda y bíceps.", ejercicios: [["e14", 4, 8], ["e13", 4, 10], ["e15", 3, 10], ["e50", 3, 12], ["e52", 3, 12]] },
    { nombre: "Pierna", descripcion: "Pierna y glúteo.", ejercicios: [["e25", 4, 8], ["e29", 3, 12], ["e31", 3, 10], ["e35", 4, 15]] }
];

function mostrarRutinas() {
    contenido.innerHTML = `<h2>Mis rutinas</h2><button onclick="mostrarFormularioRutina()" style="width:100%;">+ Crear rutina</button><button onclick="mostrarPlantillas()" style="width:100%; margin-top:10px; background:#F59E0B;">📋 Plantillas</button><div id="listaRutinas" style="margin-top: 15px;">${rutinas.length === 0 ? "<p>No hay rutinas.</p>" : rutinas.map((r, i) => `<div class="tarjeta-rutina" style="cursor:pointer; display:flex; justify-content:space-between;" onclick="verRutina(${i})"><h3 style="margin:0;">${escaparHTML(r.nombre)}</h3><span>▸</span></div>`).join("")}</div>`;
    restaurarScroll();
}
function mostrarPlantillas() {
    guardarScroll();
    contenido.innerHTML = `<button class="boton-texto texto-volver" onclick="mostrarRutinas()">◀ Volver</button><h2>Plantillas</h2><p>Elige una y ajusta series/reps.</p>${plantillasRutinas.map((p, i) => `<div class="tarjeta-rutina" style="cursor:pointer; display:flex; justify-content:space-between;" onclick="elegirPlantilla(${i})"><div><h3 style="margin:0;">${escaparHTML(p.nombre)}</h3><p style="margin:5px 0 0 0; font-size:12px;">${escaparHTML(p.descripcion)}</p></div><span>${p.ejercicios.length} ej. ▸</span></div>`).join("")}`;
}
function elegirPlantilla(i) {
    const p = plantillasRutinas[i]; if (!p) return;
    let ejercicios = p.ejercicios.map(x => { const e = obtenerEjercicios().find(y => y.id === x[0]); return e ? { ejercicioId: e.id, series: x[1], repeticiones: x[2] } : null; }).filter(x => x !== null);
    rutinas.push({ id: generarId(), nombre: p.nombre, ejercicios: ejercicios });
    guardarDatos(); aviso("Rutina creada desde plantilla."); mostrarRutinas();
}
function mostrarFormularioRutina() { 
    guardarScroll();
    contenido.innerHTML = `<button class="boton-texto texto-volver" onclick="mostrarRutinas()">◀ Volver</button><h2>Crear rutina</h2><label>Nombre</label><input type="text" id="nombreRutina"><button onclick="crearRutina()" style="width:100%;margin-top:10px;background:#10B981;">Guardar</button>`; 
}
function crearRutina() { const n = document.getElementById("nombreRutina").value.trim(); if (!n) return; rutinas.push({ id: generarId(), nombre: n, ejercicios: [] }); guardarDatos(); mostrarRutinas(); }
function verRutina(i) {
    guardarScroll();
    const r = rutinas[i]; if (!r) return;
    let html = `<button class="boton-texto" onclick="mostrarRutinas()" style="color: var(--accent); font-size: 16px; margin-bottom: 15px; display: inline-block; font-weight: bold; padding: 0;">◀ Volver</button><h2>${escaparHTML(r.nombre)}</h2><label>Nombre</label><input type="text" id="rutNombre" value="${escaparHTML(r.nombre)}"><div id="ejerciciosDeRutina" style="margin-top:15px;">`;
    
    if (r.ejercicios.length === 0) {
        html += "<p>Sin ejercicios.</p>";
    } else {
        r.ejercicios.forEach((item, pos) => {
            const e = obtenerEjercicios().find(x => x.id === item.ejercicioId); 
            if (!e) return;
            
            html += `
                <div class="tarjeta-rutina" style="padding: 10px; margin-top: 8px; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box;">
                    
                    <!-- FILA 1: NOMBRE Y PAPELERA -->
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%;">
                        <!-- Aquí está el truco para que el nombre ocupe 1 sola línea -->
                        <h3 style="font-size: 14px; margin: 0; font-weight: bold; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${escaparHTML(e.nombre)}</h3>
                        <button class="boton-texto texto-rojo" onclick="eliminarEjercicioRutina(${i}, ${pos})" style="padding: 0; width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 16px; background: transparent; border: none; cursor: pointer; border-radius: 50%;">🗑</button>
                    </div>
                    
                    <!-- FILA 2: SERIES Y REPETICIONES -->
                    <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-main); padding: 8px; border-radius: 8px; border: 1px solid var(--border-color); width: 100%; box-sizing: border-box;">
                        <span style="font-size: 12px; color: var(--text-muted); font-weight: bold;">Series x Reps</span>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <input type="number" id="rutS_${pos}" value="${item.series}" style="width: 45px; padding: 6px 0; text-align: center; margin: 0; font-size: 14px; border-radius: 6px; border: none; background: rgba(0,0,0,0.2); color: var(--accent); font-weight: bold;">
                            <span style="color: var(--text-muted); font-size: 14px;">x</span>
                            <input type="number" id="rutR_${pos}" value="${item.repeticiones}" style="width: 45px; padding: 6px 0; text-align: center; margin: 0; font-size: 14px; border-radius: 6px; border: none; background: rgba(0,0,0,0.2); color: var(--accent); font-weight: bold;">
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    html += `</div>
        <button style="width:100%;margin-top:15px;background:#3B82F6;color:white;border:none;padding:12px;border-radius:var(--radio);font-weight:bold;" onclick="guardarEdicionRutina(${i}, 'selector')">+ Añadir ejercicio</button>
        <button style="width:100%;margin-top:10px;background:#10B981;color:white;border:none;padding:12px;border-radius:var(--radio);font-weight:bold;" onclick="guardarEdicionRutina(${i}, 'lista')">💾 Guardar</button>
        <button style="width:100%;margin-top:10px;background:#FF6B6B;color:white;border:none;padding:12px;border-radius:var(--radio);font-weight:bold;" onclick="guardarEdicionRutina(${i}, 'entrenar')">▶ ENTRENAR</button>
        <button class="boton-texto texto-rojo" style="width:100%;margin-top:15px;font-size:13px;" onclick="eliminarRutina(${i})">🗑 Eliminar rutina</button>`;
        
    contenido.innerHTML = html;
}

function guardarEdicionRutina(i, destino) {
    const r = rutinas[i]; const c = document.getElementById("rutNombre"); if (!r || !c) return;
    r.nombre = c.value.trim() || r.nombre;
    for (let p = 0; p < r.ejercicios.length; p++) { const s = document.getElementById("rutS_" + p); const rp = document.getElementById("rutR_" + p); if (s && rp) { r.ejercicios[p].series = parseInt(s.value) || 1; r.ejercicios[p].repeticiones = parseInt(rp.value) || 1; } }
    guardarDatos();
    if (destino === "selector") mostrarSelectorEjercicios(i); else if (destino === "entrenar") iniciarEntrenamientoEnVivo(i); else mostrarRutinas();
}
function mostrarSelectorEjercicios(i) { 
    guardarScroll();
    contenido.innerHTML = `<button class="boton-texto texto-volver" onclick="verRutina(${i})">◀ Volver</button><h2>Añadir ejercicio</h2><input type="text" id="buscadorRutina" placeholder="Buscar..." oninput="filtrarEjerciciosParaRutina(${i})"><div id="selectorEjercicios"></div>`; 
    filtrarEjerciciosParaRutina(i); 
}
function filtrarEjerciciosParaRutina(i) { const l = document.getElementById("selectorEjercicios"); if (!l) return; const t = document.getElementById("buscadorRutina").value.toLowerCase(); l.innerHTML = obtenerEjercicios().filter(x => x.nombre.toLowerCase().includes(t)).map(x => `<div class="tarjeta-rutina" style="cursor:pointer;" onclick="añadirEjercicioARutina(${i}, '${x.id}')"><h3>${escaparHTML(x.nombre)}</h3></div>`).join(""); }
function añadirEjercicioARutina(i, idE) { rutinas[i].ejercicios.push({ ejercicioId: idE, series: 3, repeticiones: 10 }); guardarDatos(); verRutina(i); }
function eliminarEjercicioRutina(i, pos) { rutinas[i].ejercicios.splice(pos, 1); guardarDatos(); verRutina(i); }
function eliminarRutina(i) { confirmar("¿Eliminar rutina?", () => { rutinas.splice(i, 1); guardarDatos(); mostrarRutinas(); }); }

function iniciarEntrenamientoEnVivo(i) {
    const r = rutinas[i]; if (!r) return;
    let html = `
        <h2>${escaparHTML(r.nombre)}</h2>
        <div class="reloj reloj-compacto" style="padding: 12px; margin-bottom: 12px;">
            <div id="tiempo" style="font-size:36px; margin: 5px 0;">00:00</div>
            <div class="grid-opciones-descanso" style="grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px;">
                <button onclick="cronoDescanso(30)">30s</button>
                <button onclick="cronoDescanso(45)">45s</button>
                <button onclick="cronoDescanso(60)">60s</button>
                <button onclick="cronoDescanso(90)">90s</button>
            </div>
        </div>
    `;
    
    r.ejercicios.forEach((item, idx) => {
        const e = obtenerEjercicios().find(x => x.id === item.ejercicioId); if (!e) return;
        
        let inputsSeries = "";
        for (let s = 1; s <= item.series; s++) {
            inputsSeries += `
                <div style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 4px 8px; display: flex; align-items: center; gap: 5px;">
                    <span style="font-size: 11px; color: var(--text-muted);">#${s}</span>
                    <input type="number" id="reps_${idx}_${s}" value="${item.repeticiones}" style="width: 40px; padding: 2px; margin: 0; text-align: center; font-size: 13px; border: none; background: transparent;">
                </div>
            `;
        }

        html += `
            <div class="tarjeta-rutina" style="padding: 10px 12px; margin-top: 8px;">
                <h3 style="font-size: 14px; margin: 0 0 8px 0;">${escaparHTML(e.nombre)}</h3>
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${inputsSeries}
                </div>
            </div>
        `;
    });
    
    html += `<button style="width:100%;margin-top:15px;min-height:50px;background:#10B981;color:#fff;" onclick="finalizarEntrenamientoEnVivo(${i})">✔ Finalizar y Guardar</button>`;
    contenido.innerHTML = html;
    actualizarVistaCronometro();
}

function finalizarEntrenamientoEnVivo(i) {
    const r = rutinas[i]; const detalle = []; let tS = 0, tR = 0;
    r.ejercicios.forEach((item, idx) => { 
        const e = obtenerEjercicios().find(x => x.id === item.ejercicioId); if (!e) return; 
        const series = []; 
        for (let s = 1; s <= item.series; s++) { 
            const inp = document.getElementById(`reps_${idx}_${s}`); 
            const reps = parseInt(inp ? inp.value : 0) || 0; 
            series.push({ reps }); 
            tS++; 
            tR += reps; 
        } 
        detalle.push({ ejercicioId: item.ejercicioId, nombre: e.nombre, series }); 
    });
    
    historial.push({ id: generarId(), fecha: obtenerFechaActual(), rutina: r.nombre, ejercicios: detalle.length, series: tS, repeticiones: tR, detalle });
    guardarDatos(); 
    aviso(`¡Guardado!`); 
    
    // AQUÍ ESTÁ EL CAMBIO: Vuelve a la lista de rutinas
    mostrarRutinas(); 
}

/* =====================================================
   PROGRESO CORPORAL
===================================================== */
const camposCuerpo = [{ clave: "peso", nombre: "Peso", unidad: "kg" }];
function calcularIMC(p) { if (!alturaCm || !p) return null; return p / Math.pow(alturaCm / 100, 2); }
function obtenerUltimoPeso() { const s = medidasCuerpo.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)); for (let i = s.length - 1; i >= 0; i--) { if (s[i].peso) return { valor: s[i].peso, fecha: s[i].fecha }; } return null; }

function mostrarProgreso() {
    const uP = obtenerUltimoPeso(); 
    const imc = uP ? calcularIMC(uP.valor) : null;

    const selMetricas = `<button class="chip chip-medida activo">Peso</button>`;

    let serie = medidasCuerpo.map(r => ({ fecha: r.fecha, valor: r.peso })).filter(p => p.valor).sort((a,b) => a.fecha.localeCompare(b.fecha));
    let graficaHTML = "<p>Sin registros.</p>";
    
    if (serie.length >= 2) {
        const W = 320, H = 150, izq = 30, der = 10, arr = 20, aba = 20;
        let min = Math.min(...serie.map(v => v.valor)); let max = Math.max(...serie.map(v => v.valor));
        if (min === max) { min -= 1; max += 1; }
        const marg = (max - min) * 0.2; min -= marg; max += marg;
        const t0 = textoAFecha(serie[0].fecha).getTime(); const t1 = textoAFecha(serie[serie.length - 1].fecha).getTime();
        const xD = f => serie.length === 1 || t1 === t0 ? izq + (W - izq - der) / 2 : izq + ((textoAFecha(f).getTime() - t0) / (t1 - t0)) * (W - izq - der);
        const yD = val => arr + (1 - (val - min) / (max - min)) * (H - arr - aba);
        
        let line = "", circ = "";
        const coords = serie.map(x => ({ x: xD(x.fecha), y: yD(x.valor), valor: x.valor }));
        line = `<polyline points="${coords.map(c => c.x.toFixed(1) + "," + c.y.toFixed(1)).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="3"/>`;
        circ = coords.map(c => `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="4" fill="var(--accent)"/><text x="${c.x.toFixed(1)}" y="${(c.y - 8).toFixed(1)}" font-size="10" fill="var(--text-main)" text-anchor="middle">${formatoNum(c.valor)}</text>`).join("");
        
        graficaHTML = `<div class="caja-grafica" style="padding:10px 0;"><svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto;">${line}${circ}</svg></div>`;
    }

    contenido.innerHTML = `
        <h2>Progreso</h2>
        <button onclick="mostrarFormularioCuerpo()" style="width:100%; background:var(--accent); color:white; margin-bottom:15px; border:none;">+ Añadir registro</button>
        
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:15px;">
            <div class="tarjeta-rutina" style="text-align:center; margin:0; padding:10px;"><h3 style="font-size:20px; color:var(--accent); margin:0;">${uP ? formatoNum(uP.valor) : "-"}</h3><span style="font-size:11px;">Peso (kg)</span></div>
            <div class="tarjeta-rutina" style="text-align:center; margin:0; padding:10px;"><h3 style="font-size:20px; color:var(--accent); margin:0;">${imc ? formatoNum(imc) : "-"}</h3><span style="font-size:11px;">IMC</span></div>
            <div class="tarjeta-rutina" style="text-align:center; margin:0; padding:10px; cursor:pointer;" onclick="mostrarFormularioAltura()"><h3 style="font-size:20px; color:var(--accent); margin:0;">${alturaCm ? formatoNum(alturaCm) : "-"}</h3><span style="font-size:11px;">Altura (cm)</span></div>
        </div>

        <h3>📈 Evolución</h3>
        <div class="selector-chips">${selMetricas}</div>
        ${graficaHTML}

               <h3 style="margin-top:20px;">Registros</h3>
        <div style="display:flex; flex-direction:column; gap:6px;">
            ${medidasCuerpo.slice().reverse().map(r => `
                <div class="item-mini" style="padding:10px 15px; margin-bottom:0; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:13px; color:var(--text-muted);">${formatearFecha(r.fecha)}</span>
                    <strong style="font-size:14px; color:var(--text-main);">${formatoNum(r.peso)} kg</strong>
                    <button class="btn-mini-accion" style="color:#EF4444; padding:4px 8px;" onclick="eliminarRegistroCuerpo('${r.id}')">🗑</button>
                </div>
            `).join("")}
        </div>
    `;
    restaurarScroll();
}

function elegirMetrica(c) { metricaActual = c; mostrarProgreso(); }
function mostrarFormularioCuerpo() { 
    guardarScroll();
    const c = camposCuerpo.map(x => `<label>${x.nombre} (${x.unidad})</label><input type="number" step="0.1" id="cuerpo_${x.clave}">`).join(""); 
    contenido.innerHTML = `<button class="boton-texto texto-volver" onclick="mostrarProgreso()">◀ Volver</button><h2>Nuevo registro</h2><label>Fecha</label><input type="date" id="cuerpo_fecha" value="${obtenerFechaActual()}">${c}<button onclick="guardarRegistroCuerpo()" style="width:100%;margin-top:10px;background:#10B981;">Guardar</button>`; 
}
function guardarRegistroCuerpo() { const f = document.getElementById("cuerpo_fecha").value; const v = {}; let a = false; camposCuerpo.forEach(c => { const n = parseFloat(document.getElementById("cuerpo_" + c.clave).value); if (n > 0) { v[c.clave] = n; a = true; } }); if (!a) { alert("Rellena algo."); return; } const ex = medidasCuerpo.find(r => r.fecha === f); if (ex) Object.assign(ex, v); else medidasCuerpo.push(Object.assign({ id: generarId(), fecha: f }, v)); guardarDatos(); mostrarProgreso(); }
function eliminarRegistroCuerpo(id) { confirmar("¿Eliminar?", () => { medidasCuerpo = medidasCuerpo.filter(r => r.id !== id); guardarDatos(); mostrarProgreso(); }); }
function mostrarFormularioAltura() { 
    guardarScroll();
    contenido.innerHTML = `<button class="boton-texto texto-volver" onclick="mostrarProgreso()">◀ Volver</button><h2>Altura</h2><label>Altura en cm</label><input type="number" id="inputAltura" value="${alturaCm || ""}"><button onclick="guardarAltura()" style="width:100%;margin-top:10px;background:#10B981;">Guardar</button>`; 
}
function guardarAltura() { const v = parseFloat(document.getElementById("inputAltura").value); if (!(v >= 100 && v <= 250)) { aviso("Entre 100 y 250 cm."); return; } alturaCm = v; guardarDatos(); mostrarProgreso(); }

/* =====================================================
   CRONÓMETRO Y CIRCUITO
===================================================== */
function mostrarCronometro() {
    contenido.innerHTML = `
        <h2>Cronómetro</h2>
        <div class="selector-chips" style="margin-bottom:15px;">
            <button class="chip activo" onclick="cambiarModoCrono('normal', this)">Normal</button>
            <button class="chip" onclick="cambiarModoCrono('circuito', this)">Circuito (HIIT)</button>
        </div>
        
        <div id="cronoNormal" class="reloj" style="padding: 15px;">
            <p id="etiquetaCrono" style="margin:0 0 5px 0; font-size:14px;">Parado</p>
            <div id="tiempo" style="margin: 5px 0;">00:00</div>
            <div class="botones-reloj" style="gap:6px; margin-top:10px;">
                <button class="boton-iniciar" onclick="cronoIniciar()">Iniciar</button>
                <button class="boton-pausar" onclick="cronoParar()">Parar</button>
                <button onclick="cronoReiniciar()" style="grid-column:1/-1;">Reiniciar</button>
            </div>
            <div style="margin-top:15px;">
                <h3 style="font-size:14px; margin-bottom:8px;">Descanso</h3>
                <div class="grid-opciones-descanso" style="gap:6px;">
                    <button onclick="cronoDescanso(30)">30s</button>
                    <button onclick="cronoDescanso(45)">45s</button>
                    <button onclick="cronoDescanso(60)">60s</button>
                    <button onclick="cronoDescanso(90)">90s</button>
                </div>
            </div>
        </div>

        <div id="cronoCircuito" class="reloj" style="display:none; padding: 15px;">
            <h3>⏱️ Configurar Circuito</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">
                <div><label>Trabajo (s)</label><input type="number" id="circTrabajo" value="40"></div>
                <div><label>Descanso (s)</label><input type="number" id="circDescanso" value="20"></div>
                <div style="grid-column:1/-1;"><label>Rondas</label><input type="number" id="circRondas" value="5"></div>
            </div>
            <div id="circBotones"><button id="btnCircuito" class="boton-iniciar" onclick="iniciarCircuito()" style="margin-top:15px;width:100%;">▶ Iniciar Circuito</button></div>
            <div id="circDisplay" style="display:none;text-align:center;margin-top:15px;padding:15px;background:var(--bg-main);border-radius:15px;"><span id="circFase" style="font-size:16px;font-weight:bold;"></span><br><span id="circTiempo" style="font-size:40px;font-weight:800;font-family:monospace;"></span></div>
        </div>
    `;
    actualizarVistaCronometro();
}

function cambiarModoCrono(modo, btn) {
    document.querySelectorAll('.selector-chips button').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    if(modo === 'normal') {
        document.getElementById('cronoNormal').style.display = 'block';
        document.getElementById('cronoCircuito').style.display = 'none';
    } else {
        document.getElementById('cronoNormal').style.display = 'none';
        document.getElementById('cronoCircuito').style.display = 'block';
    }
}

function cronoMsActual() { return cronoModo === "subida" ? cronoMs + (Date.now() - cronoInicio) : cronoMs; }
function cronoIniciar() { if (cronoModo === "subida") return; clearInterval(cronoIntervalo); if (cronoModo === "bajada") cronoMs = 0; cronoModo = "subida"; cronoColor = "verde"; cronoInicio = Date.now(); cronoIntervalo = setInterval(actualizarVistaCronometro, 250); actualizarVistaCronometro(); }
function cronoParar() { if (cronoModo === "subida") cronoMs += Date.now() - cronoInicio; else if (cronoModo === "bajada") cronoMs = 0; cronoModo = "parado"; cronoColor = "rojo"; clearInterval(cronoIntervalo); actualizarVistaCronometro(); }
function cronoReiniciar() { clearInterval(cronoIntervalo); cronoModo = "parado"; cronoColor = ""; cronoMs = 0; actualizarVistaCronometro(); }
function cronoDescanso(s) { clearInterval(cronoIntervalo); cronoMs = 0; cronoModo = "bajada"; cronoColor = "azul"; cronoFin = Date.now() + s * 1000; cronoIntervalo = setInterval(actualizarVistaCronometro, 250); actualizarVistaCronometro(); }
function finDescanso() { clearInterval(cronoIntervalo); cronoModo = "parado"; cronoColor = ""; cronoMs = 0; actualizarVistaCronometro(); if (navigator.vibrate) navigator.vibrate([300, 150, 300]); aviso("⏱ ¡Descanso terminado!"); }
function actualizarVistaCronometro() {
    document.querySelectorAll(".reloj").forEach(c => { c.classList.remove("brillo-verde", "brillo-rojo", "brillo-azul"); if (cronoColor && c.id !== "relojCircuito") c.classList.add("brillo-" + cronoColor); });
    let s; if (cronoModo === "bajada") { const r = Math.ceil((cronoFin - Date.now()) / 1000); if (r <= 0) { finDescanso(); return; } s = r; } else s = Math.floor(cronoMsActual() / 1000);
    const t = document.getElementById("tiempo"); if (t) t.innerText = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    const e = document.getElementById("etiquetaCrono"); if (e) e.innerText = cronoModo === "bajada" ? "Descansando…" : (cronoModo === "subida" ? "En marcha" : "Parado");
}

let circIntervalo = null, circConfig = { trabajo: 40, descanso: 20, rondas: 5 }, circEstado = { ronda: 1, fase: 'trabajo', tiempo: 0 }, circPausado = false;
function iniciarCircuito() {
    const reloj = document.getElementById("cronoCircuito");
    const divBotones = document.getElementById("circBotones");
    if (circIntervalo && !circPausado) { 
        clearInterval(circIntervalo); circIntervalo = null; circPausado = true; 
        divBotones.innerHTML = `<button class="boton-iniciar" onclick="iniciarCircuito()" style="margin-top:15px;width:48%;">▶ Reanudar</button><button class="boton-pausar" onclick="detenerCircuito()" style="margin-top:15px;width:48%; float:right;">⏹ Terminar</button>`;
        reloj.className = "reloj brillo-azul"; return; 
    }
    if (circPausado) { 
        circPausado = false; divBotones.innerHTML = `<button id="btnCircuito" class="boton-pausar" onclick="iniciarCircuito()" style="margin-top:15px;width:100%;">⏸ Pausar</button>`;
        iniciarIntervaloCircuito(); return; 
    }
    circConfig.trabajo = parseInt(document.getElementById('circTrabajo').value) || 40; circConfig.descanso = parseInt(document.getElementById('circDescanso').value) || 20; circConfig.rondas = parseInt(document.getElementById('circRondas').value) || 5;
    circEstado = { ronda: 1, fase: 'trabajo', tiempo: circConfig.trabajo };
    document.getElementById('circDisplay').style.display = 'block'; 
    divBotones.innerHTML = `<button id="btnCircuito" class="boton-pausar" onclick="iniciarCircuito()" style="margin-top:15px;width:100%;">⏸ Pausar</button>`;
    reloj.className = "reloj brillo-verde"; actualizarVistaCircuito(); iniciarIntervaloCircuito();
}
function detenerCircuito() {
    clearInterval(circIntervalo); circIntervalo = null; circPausado = false;
    document.getElementById('circDisplay').style.display = 'none';
    document.getElementById('circBotones').innerHTML = `<button id="btnCircuito" class="boton-iniciar" onclick="iniciarCircuito()" style="margin-top:15px;width:100%;">▶ Iniciar Circuito</button>`;
    document.getElementById('cronoCircuito').className = "reloj";
}
function iniciarIntervaloCircuito() {
    clearInterval(circIntervalo);
    circIntervalo = setInterval(() => {
        circEstado.tiempo--;
        if (circEstado.tiempo <= 0) {
            if (circEstado.fase === 'trabajo') {
                if (circEstado.ronda >= circConfig.rondas) { detenerCircuito(); aviso("¡Circuito terminado!"); return; }
                circEstado.fase = 'descanso'; circEstado.tiempo = circConfig.descanso; document.getElementById('cronoCircuito').className = "reloj brillo-azul"; if (navigator.vibrate) navigator.vibrate([300]);
            } else {
                circEstado.ronda++; circEstado.fase = 'trabajo'; circEstado.tiempo = circConfig.trabajo; document.getElementById('cronoCircuito').className = "reloj brillo-verde"; if (navigator.vibrate) navigator.vibrate([500]);
            }
        }
        actualizarVistaCircuito();
    }, 1000);
}
function actualizarVistaCircuito() {
    const f = document.getElementById('circFase'), t = document.getElementById('circTiempo'); if (!f || !t) return;
    f.innerText = `Ronda ${circEstado.ronda}/${circConfig.rondas} · ${circEstado.fase === 'trabajo' ? 'TRABAJO' : 'DESCANSO'}`; f.style.color = circEstado.fase === 'trabajo' ? '#10B981' : '#3B82F6';
    t.innerText = formatoTiempo(circEstado.tiempo);
}

/* =====================================================
   CALENDARIO
===================================================== */
const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
function hayEntreno(f) { return historial.some(i => i.fecha === f); }
function hayNotas(f) { return Array.isArray(notasDias[f]) && notasDias[f].length > 0; }
function hayCarrera(f) { return carreras.some(c => c.fecha === f); }
function mostrarCalendario() { anioActual = new Date().getFullYear(); mesActual = new Date().getMonth(); verAnio(); }
function verAnio() {
    const hoy = new Date(); let meses = "";
    for (let m = 0; m < 12; m++) {
        const esActual = (m === hoy.getMonth() && anioActual === hoy.getFullYear());
        meses += `<button class="mini-mes ${esActual ? "mini-mes-actual" : ""}" onclick="verMes(${m})"><span class="mini-mes-titulo">${nombresMeses[m]}</span><span class="mini-mes-dias">${htmlMiniMes(anioActual, m)}</span></button>`;
    }
    contenido.innerHTML = `<h2>Calendario</h2><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <button onclick="cambiarAnio(-1)" style="background:transparent; border:none; color:#EF4444; font-size:28px; padding:0 10px; box-shadow:none;">◀</button>
        <h3 style="margin:0;">${anioActual}</h3>
        <button onclick="cambiarAnio(1)" style="background:transparent; border:none; color:#EF4444; font-size:28px; padding:0 10px; box-shadow:none;">▶</button>
    </div><div class="anio-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">${meses}</div>`;
    restaurarScroll();
}
function cambiarAnio(d) { anioActual += d; verAnio(); }
function htmlMiniMes(anio, mes) {
    const p = new Date(anio, mes, 1).getDay(); const des = p === 0 ? 6 : p - 1; const tot = new Date(anio, mes + 1, 0).getDate(); const hoy = obtenerFechaActual();
    let html = ""; for (let i = 0; i < des; i++) html += `<span class="mini-dia"></span>`;
    for (let d = 1; d <= tot; d++) {
        const f = fechaATexto(new Date(anio, mes, d)); let c = "mini-dia"; if (f === hoy) c += " mini-hoy";
        const s = []; if (hayEntreno(f)) s.push("inset 0 -2px 0 #D9A514"); if (hayNotas(f)) s.push("inset 0 -4px 0 #4FC3F7"); if (hayCarrera(f)) s.push("inset 0 -6px 0 #E65100");
        html += `<span class="${c}"${s.length ? ` style="box-shadow:${s.join(",")}"` : ""}>${d}</span>`;
    }
    return html;
}
function verMes(m) {
    mesActual = m;
    const p = new Date(anioActual, mesActual, 1).getDay(); const tot = new Date(anioActual, mesActual + 1, 0).getDate(); const des = p === 0 ? 6 : p - 1; const hoy = obtenerFechaActual();
    let html = `<button class="boton-texto texto-volver" onclick="verAnio()">◀ ${anioActual}</button><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
        <button onclick="cambiarMes(-1)" style="background:transparent; border:none; color:#EF4444; font-size:28px; padding:0 10px; box-shadow:none;">◀</button>
        <h3 style="margin:0;">${nombresMeses[mesActual]} ${anioActual}</h3>
        <button onclick="cambiarMes(1)" style="background:transparent; border:none; color:#EF4444; font-size:28px; padding:0 10px; box-shadow:none;">▶</button>
    </div><div class="calendario-grid">`;
    for (let i = 0; i < des; i++) html += `<div></div>`;
    for (let d = 1; d <= tot; d++) {
        const f = fechaATexto(new Date(anioActual, mesActual, d)); let c = "dia-calendario"; if (f === hoy) c += " dia-hoy";
        let b = ""; if (hayEntreno(f)) b += '<span class="barra-entreno"></span>'; if (hayNotas(f)) b += '<span class="barra-nota"></span>'; if (hayCarrera(f)) b += '<span class="barra-carrera"></span>';
        html += `<button class="${c}" onclick="abrirDia('${f}')">${d}${b ? `<span class="barras-dia">${b}</span>` : ""}</button>`;
    }
    html += `</div>`;
    contenido.innerHTML = html;
    restaurarScroll();
}
function cambiarMes(d) { mesActual += d; if (mesActual > 11) { mesActual = 0; anioActual++; } if (mesActual < 0) { mesActual = 11; anioActual--; } verMes(mesActual); }
function abrirDia(f) {
    guardarScroll();
    const e = historial.filter(i => i.fecha === f); const c = carreras.filter(x => x.fecha === f); const n = notasDias[f] || [];
    const hE = e.length === 0 ? "<p>No hay entrenamientos.</p>" : e.map(i => `<div class="tarjeta-rutina"><h3>${escaparHTML(i.rutina)}</h3><p>${i.series} series</p><button class="boton-texto texto-rojo" onclick="eliminarHistorial('${i.id}')">🗑 Eliminar</button></div>`).join("");
    const hC = c.length === 0 ? "" : `<h3>🏃 Cardio</h3>${c.map(x => `<div class="tarjeta-rutina"><p>${resumenCarrera(x)}</p></div>`).join("")}`;
    const hN = n.length === 0 ? "<p>No hay anotaciones.</p>" : n.map(x => `<div class="tarjeta-rutina" style="display:flex; justify-content:space-between;"><span>${escaparHTML(x.texto)}</span><button class="boton-texto texto-rojo" onclick="eliminarNota('${f}','${x.id}')">🗑</button></div>`).join("");
    contenido.innerHTML = `<button class="boton-texto" onclick="verMes(${mesActual})" style="color: #3B82F6; font-size: 16px; margin-bottom: 20px; display: inline-block; font-weight: bold; padding: 0;">◀ Volver</button><h2>${formatearFecha(f)}</h2><h3>🏋️ Entrenamientos</h3>${hE}${hC}<h3>📝 Anotaciones</h3>${hN}<div class="tarjeta-rutina"><h3>Nueva anotación</h3><textarea id="notaTexto" placeholder="Escribe aquí..."></textarea><button onclick="guardarNota('${f}')" style="width:100%;">Añadir</button></div>`;
}
function guardarNota(f) { const t = document.getElementById("notaTexto").value.trim(); if (!t) return; if (!notasDias[f]) notasDias[f] = []; notasDias[f].push({ id: generarId(), texto: t }); guardarDatos(); abrirDia(f); }
function eliminarNota(f, id) { notasDias[f] = notasDias[f].filter(n => n.id !== id); if (notasDias[f].length === 0) delete notasDias[f]; guardarDatos(); abrirDia(f); }
function eliminarHistorial(id) { historial = historial.filter(i => i.id !== id); guardarDatos(); mostrarCalendario(); }

/* =====================================================
   TIEMPO (CON RADAR)
===================================================== */
function mostrarTiempo() {
    contenido.innerHTML = `
        <h2>El Tiempo 🌤️</h2>
        <div id="resultadoTiempo"></div>
        <button onclick="forzarActualizacionTiempo()" class="boton-mini" style="margin-top:20px; width:100%; background:var(--bg-box);">🔄 Actualizar</button>
    `;
    
    const cache = localStorage.getItem("climaCache");
    const hora = localStorage.getItem("climaCacheHora");
    const c = document.getElementById("resultadoTiempo");

    if (cache) {
        c.innerHTML = cache;
        if (hora && (Date.now() - parseInt(hora)) > 7200000) actualizarTiempoSilencioso();
    } else {
        c.innerHTML = `<p style="text-align:center;">Buscando el tiempo...</p>`;
        actualizarTiempoSilencioso();
    }
    restaurarScroll();
}

function forzarActualizacionTiempo() {
    const c = document.getElementById("resultadoTiempo");
    c.innerHTML = `<p style="text-align:center;">Buscando...</p>`;
    actualizarTiempoSilencioso();
}

function actualizarTiempoSilencioso() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(function(pos) {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true&hourly=temperature_2m,weathercode`)
        .then(r => r.json())
        .then(d => {
            const t = d.current_weather.temperature, v = d.current_weather.windspeed, cod = d.current_weather.weathercode;
            let i = "🌤️", txt = "Despejado";
            if ([0, 1].includes(cod)) { i = "☀️"; txt = "Soleado"; } 
            else if ([2, 3].includes(cod)) { i = "☁️"; txt = "Nublado"; } 
            else if (cod >= 50) { i = "🌧️"; txt = "Lluvia"; }

            const porcentaje = Math.min(Math.max(t / 50, 0), 1);
            const dashArray = 2 * Math.PI * 45;
            const dashOffset = dashArray - (porcentaje * dashArray);

            let horasHTML = ""; const ahora = new Date().getHours();
            for (let h = ahora; h <= ahora + 4; h++) { 
                if(!d.hourly.time[h]) break; 
                const hs = d.hourly.time[h].split("T")[1]; 
                const th = Math.round(d.hourly.temperature_2m[h]); 
                let ih = "🌤️"; if ([0, 1].includes(d.hourly.weathercode[h])) ih = "☀️"; else if ([2, 3].includes(d.hourly.weathercode[h])) ih = "☁️"; else if (d.hourly.weathercode[h] >= 50) ih = "🌧️"; 
                horasHTML += `<div class="clima-hora"><span>${hs}</span><strong>${ih}</strong><span>${th}°C</span></div>`; 
            }

            const htmlClima = `
                <div style="text-align:center; padding:20px; background:var(--bg-main); border-radius:16px;">
                    <div class="radar-tiempo">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-box)" stroke-width="8" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" stroke-width="8"
                                stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}" stroke-linecap="round" />
                        </svg>
                        <div class="temperatura-texto">${t}°C</div>
                    </div>
                    <h3 style="margin:10px 0 5px 0;">${i} ${txt}</h3>
                    <p style="color:var(--text-muted); font-size:14px;">💨 Viento: ${v} km/h</p>
                </div>
                <h4 style="margin-left:10px; margin-top:20px;">Próximas horas</h4>
                <div class="clima-horas">${horasHTML}</div>
            `;
            
            const c = document.getElementById("resultadoTiempo");
            if (c) c.innerHTML = htmlClima;
            
            const htmlClimaInicio = `
                <div style="text-align:center; padding:10px;">
                    <div style="font-size:40px; line-height:1;">${i}</div>
                    <h3 style="font-size:28px; margin:5px 0; color:var(--text-main);">${t}°C</h3>
                    <p style="font-size:12px;">${txt}</p>
                </div>
            `;
            localStorage.setItem("climaCache", htmlClimaInicio);
            localStorage.setItem("climaCacheHora", Date.now());
        });
    });
}

/* =====================================================
   CARDIO (CON MAPA)
===================================================== */
const tiposCardio = { 
    correr: { nombre: "Correr", icono: "🏃", gps: true, ritmo: true, met: 9.8 }, 
    caminar: { nombre: "Caminar", icono: "🚶", gps: true, ritmo: true, met: 3.5 }, 
    bicicleta: { nombre: "Bicicleta", icono: "🚴", gps: true, ritmo: false, met: 8.0 }, 
    comba: { nombre: "Salto comba", icono: "🪢", gps: false, ritmo: false, met: 11.0 } 
};
function tipoDe(c) { return tiposCardio[c.tipo] ? c.tipo : "correr"; }
function pesoCalorias() { const u = obtenerUltimoPeso(); return u ? u.valor : 70; }
function calcularCalorias(t, s, d, p) { return Math.round(tiposCardio[t].met * p * (s / 3600)); }
function caloriasDe(c) { return typeof c.calorias === "number" ? c.calorias : calcularCalorias(tipoDe(c), c.duracion || 0, c.distancia || 0, pesoCalorias()); }
function nuevoEstadoCorrer() { return { estado: "parado", tipo: "correr", inicio: 0, acumMs: 0, distM: 0, puntos: [], watchId: null, intervalo: null, ultimaPos: null, gps: "", precision: null }; }
function haversine(a, b) { const R = 6371000, r = Math.PI / 180; const dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r; const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
function formatoTiempo(s) { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}`; }
function formatoRitmo(s) { if (!isFinite(s) || s <= 0 || s > 3600) return "–"; const t = Math.round(s); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; }
function formatoKm(k) { return k.toFixed(2).replace(".", ","); }
function tiempoCorrerMs() { return correr.estado === "corriendo" ? correr.acumMs + (Date.now() - correr.inicio) : correr.acumMs; }
function elegirTipoCardio(c) { tipoCardio = c; mostrarCorrer(); }

function mostrarCorrer() {
    guardarScroll();
    const tipo = correr.estado === "parado" ? tipoCardio : correr.tipo; 
    const t = tiposCardio[tipo];
    
    let b = correr.estado === "parado" 
        ? `<button class="boton-iniciar ancho-completo" style="grid-column:1/-1;" onclick="empezarCorrer()">▶ Empezar</button>` 
        : correr.estado === "corriendo" 
        ? `<button style="background:#F59E0B; color:white;" onclick="pausarCorrer()">⏸ Pausar</button><button class="boton-pausar" onclick="terminarCorrer(event)">⏹ Terminar</button>` 
        : `<button class="boton-iniciar" onclick="continuarCorrer()">▶ Continuar</button><button class="boton-pausar" onclick="terminarCorrer(event)">⏹ Terminar</button>`;
        
    const sel = correr.estado === "parado" 
        ? `<div class="selector-chips">${Object.keys(tiposCardio).map(k => `<button class="chip ${k === tipoCardio ? "activo" : ""}" onclick="elegirTipoCardio('${k}')">${tiposCardio[k].icono} ${tiposCardio[k].nombre}</button>`).join("")}</div>` 
        : `<h3>${t.icono} ${t.nombre}</h3>`;
        
    const cG = t.gps ? `<div class="dato-resumen"><strong id="correrDist">0,00</strong><span>km</span></div><div class="dato-resumen"><strong id="correrRitmo">–</strong><span>${t.ritmo ? "min/km" : "km/h"}</span></div>` : "";
    
    const historialHTML = carreras.slice().reverse().map(c => {
        const info = tiposCardio[tipoDe(c)];
        return `
        <div class="item-mini" onclick="verCarrera('${c.id}', 'correr')" style="cursor:pointer; margin-bottom: 8px; padding: 12px 15px;">
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:20px;">${info.icono}</span>
                <div>
                    <strong style="font-size:14px; color:var(--text-main);">${info.nombre}</strong><br>
                    <span style="font-size:12px; color:var(--text-muted);">${formatearFecha(c.fecha)}</span>
                </div>
            </div>
            <span style="color:var(--text-muted); font-size: 18px;">▸</span>
        </div>
    `}).join("");

    // NUEVO: Contenedor del mapa en vivo
    const mapaVivoDiv = `<div id="liveMap" style="height: 220px; width: 100%; border-radius: 12px; margin-bottom: 15px; display: none; z-index: 1;"></div>`;

    contenido.innerHTML = `
        <h2>Cardio 🏃</h2>
        ${mapaVivoDiv}
        <div class="panel-correr" style="padding:15px;">
            ${sel}<p id="correrGps" style="font-size:12px; color:var(--text-muted); text-align:center;"></p>
            <div style="font-size:52px; font-weight:800; text-align:center; font-family:monospace;" id="correrTiempo">00:00</div>
            <div class="resumen-progreso">${cG}<div class="dato-resumen" style="grid-column:1/-1;"><strong id="correrKcal">0</strong><span>kcal</span></div></div>
            <div class="botones-correr">${b}</div>
        </div>
        
        <h3 style="margin-top:20px;">Historial</h3>
        ${historialHTML}
    `;

    // Si estamos corriendo, inicializamos el mapa en vivo
    if (correr.estado === "corriendo" && t.gps) {
        document.getElementById("liveMap").style.display = "block";
        initLiveMap();
    }

    actualizarVistaCorrer();
    restaurarScroll();
}

function toggleConfirmacionCarrera(id) {
    const div = document.getElementById(`confirm_c_${id}`);
    if (div) div.style.display = div.style.display === 'none' ? 'block' : 'none';
}
function eliminarCarreraDirecto(id) {
    carreras = carreras.filter(c => c.id !== id);
    guardarDatos();
    mostrarCorrer();
    aviso("🗑 Actividad eliminada.");
}
function actualizarVistaCorrer() { const t = document.getElementById("correrTiempo"); if (!t) return; const tipo = correr.estado === "parado" ? tipoCardio : correr.tipo; const tp = tiposCardio[tipo]; const s = Math.floor(tiempoCorrerMs() / 1000); const km = correr.distM / 1000; t.innerText = formatoTiempo(s); const d = document.getElementById("correrDist"); if (d) d.innerText = formatoKm(km); const r = document.getElementById("correrRitmo"); if (r) r.innerText = km <= 0.05 ? "–" : tp.ritmo ? formatoRitmo(s / km) : formatoNum(km / (s / 3600)); const k = document.getElementById("correrKcal"); if (k) k.innerText = calcularCalorias(tipo, s, correr.distM, pesoCalorias()); const g = document.getElementById("correrGps"); if (g) g.innerText = correr.gps === "ok" ? `GPS activo (±${Math.round(correr.precision || 0)} m)` : "Buscando GPS..."; }
function iniciarTickCorrer() { clearInterval(correr.intervalo); correr.intervalo = setInterval(actualizarVistaCorrer, 1000); }
function iniciarGps() { if (!tiposCardio[correr.tipo].gps) return; if (!navigator.geolocation) return; correr.gps = "buscando"; correr.ultimaPos = null; correr.watchId = navigator.geolocation.watchPosition(posicionCorrer, () => { correr.gps = "error"; }, { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 }); }
function detenerGps() { if (correr.watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(correr.watchId); correr.watchId = null; }
function posicionCorrer(p) { if (correr.estado !== "corriendo") return; correr.precision = p.coords.accuracy; if (p.coords.accuracy > 35) return; correr.gps = "ok"; const act = [p.coords.latitude, p.coords.longitude]; if (!correr.ultimaPos) { correr.ultimaPos = { p: act, t: p.timestamp }; correr.puntos.push(act); actualizarVistaCorrer(); return; } const d = haversine(correr.ultimaPos.p, act); const dt = (p.timestamp - correr.ultimaPos.t) / 1000; if (d < 4 || (dt > 0 && d / dt > 25)) return; correr.distM += d; correr.puntos.push(act); correr.ultimaPos = { p: act, t: p.timestamp }; actualizarVistaCorrer(); }

function empezarCorrer() { const t = tipoCardio; correr = nuevoEstadoCorrer(); correr.tipo = t; correr.estado = "corriendo"; correr.inicio = Date.now(); iniciarGps(); iniciarTickCorrer(); mostrarCorrer(); }
function pausarCorrer() { if (correr.estado !== "corriendo") return; correr.acumMs += Date.now() - correr.inicio; correr.estado = "pausado"; detenerGps(); clearInterval(correr.intervalo); mostrarCorrer(); }
function continuarCorrer() { if (correr.estado !== "pausado") return; correr.estado = "corriendo"; correr.inicio = Date.now(); correr.ultimaPos = null; iniciarGps(); iniciarTickCorrer(); mostrarCorrer(); }

function terminarCorrer(evento) { 
    if (correr.estado === "parado") return; 
    const d = Math.round(tiempoCorrerMs() / 1000); 
    
    confirmar("¿Terminar y guardar?", () => { 
        detenerGps(); 
        clearInterval(correr.intervalo); 
        
        if (d < 10) { 
            correr = nuevoEstadoCorrer(); 
            mostrarCorrer(); 
            return; 
        } 
        
        const c = { 
            id: generarId(), 
            tipo: correr.tipo, 
            fecha: obtenerFechaActual(), 
            duracion: d, 
            distancia: Math.round(correr.distM), 
            calorias: calcularCalorias(correr.tipo, d, correr.distM, pesoCalorias()), 
            ruta: correr.puntos 
        }; 
        
        carreras.push(c); 
        guardarDatos(); 
        correr = nuevoEstadoCorrer(); 
        aviso("¡Guardada!"); 
        
        // ESTA ES LA LÍNEA QUE HACE QUE SE ABRA EL CUADRO AL GUARDAR
        verCarrera(c.id, "correr"); 
        
    }, evento ? evento.target : null); 
}

function resumenCarrera(c) { const t = tiposCardio[tipoDe(c)]; const km = (c.distancia || 0) / 1000; return `${t.icono} ${formatoKm(km)} km · ${formatoTiempo(c.duracion)} · ${caloriasDe(c)} kcal`; }
function velocidadKmh(seg, metros) {
    return seg > 0 ? (metros / 1000) / (seg / 3600) : 0;
}

function eliminarCarrera(id, evento) {
    confirmar("¿Eliminar esta actividad?", () => {
        carreras = carreras.filter(c => c.id !== id);
        guardarDatos();
        aviso("🗑 Actividad eliminada.");
        mostrarCorrer();
    }, evento ? evento.target : null);
}

function htmlRuta(ruta) {
    if (!ruta || ruta.length < 2) return "";
    const W = 320, H = 240, pad = 22;
    const lats = ruta.map(p => p[0]); const lons = ruta.map(p => p[1]);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats); const minLon = Math.min(...lons), maxLon = Math.max(...lons);
    const cos = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);
    const w = (maxLon - minLon) * cos || 0.00001; const h = (maxLat - minLat) || 0.00001;
    const esc = Math.min((W - 2 * pad) / w, (H - 2 * pad) / h);
    const oX = (W - w * esc) / 2; const oY = (H - h * esc) / 2;
    const pt = p => [oX + (p[1] - minLon) * cos * esc, oY + (maxLat - p[0]) * esc];
    
    const p = ruta.map(x => pt(x).map(v => v.toFixed(1)).join(",")).join(" "); 
    const ini = pt(ruta[0]), fin = pt(ruta[ruta.length - 1]);
    
    return `
        <h3 style="margin-top:20px;">Recorrido</h3>
        <div class="caja-grafica" style="padding:0; overflow:hidden; background:#1E293B; border: 1px solid var(--border-color);">
            <svg viewBox="0 0 ${W} ${H}" style="width:100%; display:block; background:#111827;">
                ${[50,100,150,200,250].map(y => `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#374151" stroke-width="1" stroke-dasharray="4"/>`).join("")}
                ${[50,100,150,200,250].map(x => `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#374151" stroke-width="1" stroke-dasharray="4"/>`).join("")}
                <polyline points="${p}" fill="none" stroke="#3B82F6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="${ini[0].toFixed(1)}" cy="${ini[1].toFixed(1)}" r="6" fill="#10B981" stroke="#fff" stroke-width="2"/>
                <circle cx="${fin[0].toFixed(1)}" cy="${fin[1].toFixed(1)}" r="6" fill="#EF4444" stroke="#fff" stroke-width="2"/>
            </svg>
            <div style="padding:10px; text-align:center; font-size:12px; color:var(--text-muted);">🟢 Inicio · 🔴 Fin</div>
        </div>
    `;
}

function initLiveMap() {
    if (liveMap) { liveMap.remove(); } 
    
    liveMap = L.map('liveMap').setView([40.4168, -3.7038], 15);
    
    // Mapa gratuito de OpenStreetMap
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(liveMap);

    livePolyline = L.polyline([], { color: '#3B82F6', weight: 5, opacity: 0.8 }).addTo(liveMap);
    liveMarker = L.circleMarker([40.4168, -3.7038], { radius: 7, fillColor: '#3B82F6', fillOpacity: 1, color: '#fff', weight: 2 }).addTo(liveMap);
}

function initSummaryMap(ruta) {
    const map = L.map('summaryMap');
    
    // Mapa gratuito de OpenStreetMap
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    const latlngs = ruta.map(p => [p[0], p[1]]);
    const polyline = L.polyline(latlngs, { color: '#3B82F6', weight: 5 }).addTo(map);

    L.circleMarker(latlngs[0], { radius: 8, fillColor: '#10B981', fillOpacity: 1, color: '#fff', weight: 2 }).addTo(map).bindPopup("Inicio");
    L.circleMarker(latlngs[latlngs.length - 1], { radius: 8, fillColor: '#EF4444', fillOpacity: 1, color: '#fff', weight: 2 }).addTo(map).bindPopup("Fin");

    map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
}

/* =====================================================
   MÚSICA, PODCASTS Y VÍDEOS (ESTILO MINIMALISTA)
===================================================== */
let dbAudio;
function initAudioDB(cb) { if (dbAudio) { cb(); return; } const r = indexedDB.open("EntrenamientoAudioDB", 1); r.onupgradeneeded = e => { dbAudio = e.target.result; if (!dbAudio.objectStoreNames.contains("audios")) dbAudio.createObjectStore("audios", { keyPath: "id" }); }; r.onsuccess = e => { dbAudio = e.target.result; cb(); }; }

function mostrarMusica(pestanaActiva) {
    pestanaActiva = pestanaActiva || "musica";
    const esP = pestanaActiva === "podcasts";
    const filt = listasMusica.filter(l => l.categoria === pestanaActiva);

    let tarjetas = "";
    if (filt.length === 0) {
        tarjetas = `<p style="text-align:center;">No hay listas guardadas.</p>`;
    } else {
        tarjetas = filt.map(l => `
            <div class="item-mini" onclick="verListaLocal('${l.id}', '${pestanaActiva}')" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:14px; color:var(--text-main);">${esP ? "🎙" : "🎵"} ${escaparHTML(l.nombre)}</span>
                <button onclick="event.stopPropagation(); reproducirListaEntera('${l.id}')" style="background:transparent; border:none; font-size:20px; width:40px; height:40px; padding:0; flex-shrink:0; cursor:pointer; color:var(--accent);">▶</button>
            </div>`).join("");
    }

    let botonExterno = esP ? '<button onclick="abrirEnlace(\'https://www.ivoox.com\')" style="background:#E65100; width: 70%; margin: 10px auto; display: block; padding: 6px 12px; font-size: 13px; border-radius: 20px; font-weight: normal; color: white;">▶ Abrir iVoox</button>' : '<button onclick="abrirEnlace(\'https://music.youtube.com\')" style="background:#EF4444; width: 70%; margin: 10px auto; display: block; padding: 6px 12px; font-size: 13px; border-radius: 20px; font-weight: normal; color: white;">▶ Abrir YouTube Music</button>';

    contenido.innerHTML = `
        <h2>Música y Podcasts 🎵</h2>
        <div style="display:flex; gap:10px; margin-bottom:15px;">
            <button class="chip ${!esP ? 'activo' : ''}" style="flex:1; padding: 10px; font-size: 14px; font-weight:bold; border-radius: 20px; ${!esP ? 'background:var(--accent); color:white;' : ''}" onclick="mostrarMusica('musica')">🎵 Música</button>
            <button class="chip ${esP ? 'activo' : ''}" style="flex:1; padding: 10px; font-size: 14px; font-weight:bold; border-radius: 20px; ${esP ? 'background:var(--accent); color:white;' : ''}" onclick="mostrarMusica('podcasts')">🎙 Podcasts</button>
        </div>
        <div class="tarjeta-rutina" style="text-align:center; padding:15px 10px; margin-bottom:15px;">
            <p style="margin:0 0 10px 0; font-size:13px;">Abre tu app externa si lo prefieres.</p>
            ${botonExterno}
        </div>
        <button onclick="crearListaLocal('${pestanaActiva}')" class="boton-mini" style="background:#3B82F6; color:white; width:70%; margin: 0 auto 15px auto; display:block; padding:8px; font-size:13px;">+ Crear lista de ${esP ? 'podcasts' : 'música'}</button>
        <h3>Mis listas</h3>
        ${tarjetas}`;
    restaurarScroll();
}

function crearListaLocal(cat) { const n = prompt("Nombre:"); if (!n || !n.trim()) return; listasMusica.push({ id: "lista_" + Date.now(), nombre: n.trim(), categoria: cat }); guardarDatos(); mostrarMusica(cat); }
function eliminarListaLocal(id, cat) { confirmar("¿Eliminar lista?", () => { listasMusica = listasMusica.filter(l => l.id !== id); guardarDatos(); mostrarMusica(cat); }); }

function verListaLocal(id, cat) {
    guardarScroll();
    const l = listasMusica.find(x => x.id === id); if (!l) return;
    initAudioDB(() => {
        const rq = dbAudio.transaction("audios", "readonly").objectStore("audios").getAll();
        rq.onsuccess = () => {
            const auds = rq.result.filter(a => a.listaId === id);
            
            const h = auds.length === 0 ? `<p>Lista vacía.</p>` : auds.map(a => `
                <div class="item-mini" style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:14px; font-weight:bold; color:var(--text-main); flex:1; padding-right:10px;">${escaparHTML(a.nombre)}</span>
                    <div style="display:flex; gap:8px;">
                        <button onclick="editarNombreAudio('${a.id}', '${id}', '${cat}')" style="background:transparent; border:none; width:36px; height:36px; flex:0 0 36px; display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer;">✏️</button>
                        <!-- La papelera ahora llama directamente a eliminarAudioDirecto -->
                        <button onclick="eliminarAudioDirecto('${a.id}', '${id}', '${cat}')" style="background:transparent; border:none; color:#EF4444; width:36px; height:36px; flex:0 0 36px; display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer;">🗑</button>
                    </div>
                </div>`).join("");

            contenido.innerHTML = `
                <button class="boton-texto" onclick="mostrarMusica('${cat}')" style="color: var(--accent); font-size: 14px; margin-bottom: 15px; font-weight: bold; padding: 0;">◀ Volver</button>
                <h2>${escaparHTML(l.nombre)}</h2>
                
                <div class="tarjeta-rutina" style="flex-direction:column; align-items:stretch; gap:15px; margin-bottom:15px; padding:15px;">
                    <div>
                        <label style="margin:0; font-size:12px; color:var(--text-muted); font-weight:bold;">Añadir archivo</label>
                        <button onclick="añadirAudiosALista('${id}', '${cat}')" style="background:#10B981; color:white; width:100%; padding:10px; font-size:13px; margin-top:5px; border-radius:8px; border:none; font-weight:bold; cursor:pointer;">+ Subir audio</button>
                    </div>
                    <div>
                        <label style="margin:0; font-size:12px; color:var(--text-muted); font-weight:bold;">O pegar enlace (.mp3)</label>
                        <input type="url" id="urlAudio_${id}" placeholder="Pega el enlace aquí..." style="width:100%; box-sizing:border-box; padding:10px; font-size:13px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-main); color:var(--text-main); margin-top:5px; margin-bottom:8px; outline:none;">
                        <button onclick="añadirEnlaceAudio('${id}', '${cat}')" style="background:#3B82F6; color:white; width:100%; padding:10px; font-size:13px; border-radius:8px; border:none; font-weight:bold; cursor:pointer;">Añadir enlace</button>
                    </div>
                </div>

                <button onclick="reproducirListaEntera('${id}')" style="background:#3B82F6; color:white; width:100%; padding:10px; font-size:14px; border-radius:8px; margin-bottom:15px; border:none; font-weight:bold; cursor:pointer;">▶ Reproducir todo</button>
                
                <div>${h}</div>
                
                <button class="boton-texto texto-rojo" onclick="eliminarListaLocal('${id}', '${cat}')" style="width:100%; margin-top:20px; font-size:13px;">🗑 Eliminar lista entera</button>`;
        };
    });
}

// Actualizamos esta función para que use el cuadro flotante
function eliminarAudioDirecto(idA, idL, cat) { 
    confirmar("¿Eliminar esta canción?", () => {
        initAudioDB(() => { 
            const tx = dbAudio.transaction("audios", "readwrite"); 
            tx.objectStore("audios").delete(idA); 
            tx.oncomplete = () => { 
                aviso("🗑 Canción eliminada."); 
                verListaLocal(idL, cat); 
            }; 
        }); 
    });
}

function añadirAudiosALista(idL, cat) { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "audio/*"; inp.multiple = true; inp.onchange = () => { const fs = Array.from(inp.files); if (fs.length === 0) return; initAudioDB(() => { const tx = dbAudio.transaction("audios", "readwrite"), st = tx.objectStore("audios"); fs.forEach(f => st.put({ id: "audio_" + Date.now() + "_" + Math.floor(Math.random() * 1000), listaId: idL, nombre: f.name, blob: f })); tx.oncomplete = () => { aviso("✅ Añadidos."); verListaLocal(idL, cat); }; }); }; inp.click(); }

function añadirEnlaceAudio(idL, cat) { const url = document.getElementById(`urlAudio_${idL}`).value.trim(); if (!url) return; const nombre = prompt("Ponle un nombre a este audio:", "Nuevo audio"); if (nombre === null) return; const nombreFinal = nombre.trim() || "Audio sin nombre"; initAudioDB(() => { const tx = dbAudio.transaction("audios", "readwrite"), st = tx.objectStore("audios"); st.put({ id: "audio_" + Date.now(), listaId: idL, nombre: nombreFinal, url }); tx.oncomplete = () => { aviso("✅ Enlace añadido."); verListaLocal(idL, cat); }; }); }

function editarNombreAudio(idA, idL, cat) { initAudioDB(() => { const tx = dbAudio.transaction("audios", "readwrite"); const st = tx.objectStore("audios"); const req = st.get(idA); req.onsuccess = () => { const audio = req.result; if (!audio) return; const nuevoNombre = prompt("Nuevo nombre para este audio:", audio.nombre); if (nuevoNombre !== null && nuevoNombre.trim() !== "") { audio.nombre = nuevoNombre.trim(); st.put(audio); tx.oncomplete = () => { aviso("✅ Nombre actualizado."); verListaLocal(idL, cat); }; } }; }); }

function toggleConfirmacionAudio(id) { const div = document.getElementById(`confirm_audio_${id}`); if (div) div.style.display = div.style.display === 'none' ? 'block' : 'none'; }

function eliminarAudioDirecto(idA, idL, cat) { initAudioDB(() => { const tx = dbAudio.transaction("audios", "readwrite"); tx.objectStore("audios").delete(idA); tx.oncomplete = () => { aviso("🗑 Canción eliminada."); verListaLocal(idL, cat); }; }); }
function reproducirListaEntera(idLista) { initAudioDB(() => { const rq = dbAudio.transaction("audios", "readonly").objectStore("audios").getAll(); rq.onsuccess = () => { playlistActual = rq.result.filter(a => a.listaId === idLista); if (playlistActual.length === 0) { alert("Lista vacía."); return; } indiceCancion = 0; cargarCancionActual(); }; }); }
function cargarCancionActual() { if (playlistActual.length === 0) return; const a = playlistActual[indiceCancion]; if (a.blob) audioGlobal.src = URL.createObjectURL(a.blob); else if (a.url) audioGlobal.src = a.url; audioGlobal.play(); document.getElementById('player-titulo').innerText = a.nombre; document.getElementById('btn-play-pause').innerText = "⏸"; floatingPlayer.style.display = "flex"; }
function togglePlay() { if (audioGlobal.paused) { audioGlobal.play(); document.getElementById('btn-play-pause').innerText = "⏸"; } else { audioGlobal.pause(); document.getElementById('btn-play-pause').innerText = "▶"; } }
function nextSong() { if(playlistActual.length===0) return; indiceCancion = (indiceCancion + 1) % playlistActual.length; cargarCancionActual(); }
function prevSong() { if(playlistActual.length===0) return; indiceCancion = (indiceCancion - 1 + playlistActual.length) % playlistActual.length; cargarCancionActual(); }
function cerrarReproductor() { if(audioGlobal) { audioGlobal.pause(); audioGlobal.src = ""; } floatingPlayer.style.display = "none"; }

/* --- PODCASTS Y VÍDEOS --- */
function detectarTipoVideo(url) { let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/); return m ? { tipo: "youtube", id: m[1] } : { tipo: "desconocido", src: url }; }

function mostrarPodcasts() {
    guardarScroll();
    const l = podcastsGuardados.length === 0 ? `<p style="text-align:center;">No hay podcasts guardados.</p>` : podcastsGuardados.map(p => `
        <div class="item-mini">
            <span style="font-size:14px; color:var(--text-main);">🎙 ${escaparHTML(p.nombre)}</span>
            <div style="display:flex; gap:5px;">
                <button class="btn-mini-accion" style="color:var(--accent);" onclick="reproducirPodcast('${p.url}')">▶</button>
                <button class="btn-mini-accion" style="color:#EF4444;" onclick="eliminarPodcast('${p.id}')">🗑</button>
            </div>
        </div>
    `).join("");
    contenido.innerHTML = `<h2>Podcasts Guardados</h2><button onclick="mostrarFormularioPodcast()" class="boton-mini" style="background:#3B82F6; color:white; width:70%; margin: 0 auto 15px auto; display:block; padding:8px; font-size:13px;">+ Añadir podcast</button>${l}`;
    restaurarScroll();
}
function mostrarFormularioPodcast() { 
    guardarScroll();
    contenido.innerHTML = `<button class="boton-texto" onclick="mostrarPodcasts()" style="color: #3B82F6; font-size: 16px; margin-bottom: 20px; display: inline-block; font-weight: bold; padding: 0;">◀ Volver</button><h2>Nuevo Podcast</h2><label>Nombre</label><input type="text" id="podNombre"><label>Enlace directo (.mp3)</label><input type="url" id="podUrl" placeholder="https://ejemplo.com/audio.mp3"><button onclick="guardarPodcast()" class="boton-mini" style="margin-top:20px; background:#10B981; color:white;">Guardar podcast</button>`; 
}
function guardarPodcast() { const n = document.getElementById("podNombre").value.trim(), u = document.getElementById("podUrl").value.trim(); if (!n || !u) { alert("Pon nombre y enlace."); return; } podcastsGuardados.push({ id: generarId(), nombre: n, url: u }); guardarDatos(); mostrarPodcasts(); }
function reproducirPodcast(url) { audioGlobal.src = url; audioGlobal.play(); document.getElementById('player-titulo').innerText = "Podcast"; document.getElementById('btn-play-pause').innerText = "⏸"; floatingPlayer.style.display = "flex"; }
function eliminarPodcast(id) { confirmar("¿Eliminar?", () => { podcastsGuardados = podcastsGuardados.filter(x => x.id !== id); guardarDatos(); mostrarPodcasts(); }); }

function mostrarVideos() {
    guardarScroll();
    
    const l = videosGuardados.length === 0 ? `<p style="text-align:center;">No hay vídeos guardados.</p>` : videosGuardados.map(v => `
        <div class="item-mini" onclick="reproducirVideoEnLista('${v.id}', '${v.url}')" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:14px; color:var(--text-main);">🎥 ${escaparHTML(v.nombre)}</span>
            <!-- La papelera ahora llama directamente a eliminarVideoDirecto -->
            <button onclick="event.stopPropagation(); eliminarVideoDirecto('${v.id}')" style="background:transparent; border:none; color:#EF4444; font-size:18px; width:36px; height:36px; flex:0 0 36px; display:flex; align-items:center; justify-content:center; cursor:pointer;">🗑</button>
        </div>
        <div id="player_${v.id}" style="margin-bottom:15px;"></div>
    `).join("");

    contenido.innerHTML = `
        <h2>Vídeos Guardados</h2>
        
        <div class="tarjeta-rutina" style="text-align:center; padding:15px 10px; margin-bottom:15px;">
            <p style="margin:0 0 10px 0; font-size:13px;">Abre la app de YouTube si lo prefieres.</p>
            <button onclick="abrirEnlace('https://www.youtube.com')" style="background:#EF4444; width: 70%; margin: 0 auto; display: block; padding: 8px 12px; font-size: 13px; border-radius: 20px; font-weight: bold; color: white; border: none; cursor: pointer;">▶ Abrir YouTube</button>
        </div>

        <button onclick="mostrarFormularioVideo()" style="background:#3B82F6; width: 70%; margin: 0 auto 15px auto; display: block; padding: 8px; font-size: 13px; border-radius: 20px; font-weight: bold; color: white; border: none; cursor:pointer;">+ Añadir vídeo</button>
        
        ${l}
    `;
    restaurarScroll();
}

// Actualizamos esta función para que use el cuadro flotante
function eliminarVideoDirecto(id) { 
    confirmar("¿Eliminar este vídeo?", () => {
        videosGuardados = videosGuardados.filter(x => x.id !== id); 
        guardarDatos(); 
        mostrarVideos(); 
        aviso("🗑 Vídeo eliminado."); 
    });
}

function toggleConfirmacionVideo(id) { const div = document.getElementById(`confirm_${id}`); if (div) div.style.display = div.style.display === 'none' ? 'block' : 'none'; }
function eliminarVideoDirecto(id) { videosGuardados = videosGuardados.filter(x => x.id !== id); guardarDatos(); mostrarVideos(); aviso("🗑 Vídeo eliminado."); }
function reproducirVideoEnLista(id, url) { const info = detectarTipoVideo(url); const div = document.getElementById(`player_${id}`); if (!div) return; if (div.innerHTML !== "") { div.innerHTML = ""; return; } if (info.tipo === "youtube") { div.innerHTML = `<iframe width="100%" height="220" src="https://www.youtube.com/embed/${info.id}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen frameborder="0" style="border-radius:12px; margin-top:10px;"></iframe>`; } else { div.innerHTML = `<p>Enlace no válido.</p>`; } }
function mostrarFormularioVideo() { 
    guardarScroll();
    contenido.innerHTML = `<button class="boton-texto" onclick="mostrarVideos()" style="color: #3B82F6; font-size: 16px; margin-bottom: 20px; display: inline-block; font-weight: bold; padding: 0;">◀ Volver</button><h2>Nuevo vídeo</h2><label>Nombre</label><input type="text" id="videoNombre"><label>Enlace de YouTube</label><input type="url" id="videoUrl"><button onclick="guardarVideo()" class="boton-mini" style="margin-top:20px; background:#10B981; color:white;">Guardar vídeo</button>`; 
}
function guardarVideo() { const n = document.getElementById("videoNombre").value.trim(), u = document.getElementById("videoUrl").value.trim(); if (!n || !u) { alert("Pon nombre y enlace."); return; } videosGuardados.push({ id: "video_" + Date.now(), nombre: n, url: u }); guardarDatos(); mostrarVideos(); }

/* =====================================================
   AJUSTES (CORREGIDO)
===================================================== */
let ajustesAbiertos = [];

function mostrarAjustes() {
    guardarScroll();
    const t = [["claro", "Claro"], ["oscuro", "Oscuro"], ["oled", "Negro"], ["bicolor", "Bicolor"]];
    const l = [["pequenia", "Pequeña"], ["mediana", "Normal"], ["grande", "Grande"]];
    const f = [["recto", "Recto"], ["redondeado", "Redondeado"], ["pastilla", "Pastilla"], ["circulo", "Círculo"]];
    const hayMenuPersonal = colorMenuGlobal !== "" || Object.keys(coloresMenu).length > 0;

    const colorObjetivo = menuSeleccionado === "todos"
        ? (colorMenuGlobal || colorActual)
        : (coloresMenu[menuSeleccionado] || colorActual);

    const aj = (k, ti, va, cu) => `<details class="ajuste" ${ajustesAbiertos.includes(k) ? "open" : ""} ontoggle="if(this.open){if(!ajustesAbiertos.includes('${k}')) ajustesAbiertos.push('${k}')}else{ajustesAbiertos=ajustesAbiertos.filter(x=>x!=='${k}')}"><summary>${ti}<small>${va}</small></summary><div style="padding:10px;">${cu}</div></details>`;
    
    const btnO = (v, tx, ac, fn) => `<button onclick="${fn}('${v}')" style="background:${v === ac ? 'var(--accent)' : 'var(--bg-main)'}; color:${v === ac ? 'white' : 'var(--text-main)'}; border:1px solid var(--border-color); padding:12px; border-radius:var(--radio); width:100%; margin-top:10px; text-align:left;">${tx}</button>`;

    const htmlPaleta = (actual, funcion) => `<div class="grupo-colores">${paletaColores.map(c => `<button class="muestra-color ${actual && actual.toLowerCase() === c[0].toLowerCase() ? 'activo' : ''}" style="background:${c[0]};" onclick="${funcion}('${c[0]}')"></button>`).join("")}</div><label>Otro color</label><input type="color" value="${actual || '#FF6B6B'}" onchange="${funcion}(this.value)">`;

    const chipsMenu = [["todos", "Todos"]].concat(botonesMenu).map(b => {
        const activo = b[0] === menuSeleccionado;
        return `<button style="background:${activo ? 'var(--accent)' : 'var(--bg-main)'}; color:${activo ? 'white' : 'var(--text-main)'}; border:1px solid var(--border-color); padding:10px 4px; border-radius:8px; font-size:12px; font-weight:bold; cursor:pointer; text-align:center;" onclick="elegirBotonMenu('${b[0]}')">${b[1]}</button>`;
    }).join("");

    const botonSel = botonesMenu.find(b => b[0] === menuSeleccionado);
    const textoCambiando = menuSeleccionado === "todos" ? "todos los botones" : (botonSel ? botonSel[1] : "botón seleccionado");

    const extraBicolor = temaActual === "bicolor" ? `
        <div style="margin-top:15px; padding-top:15px; border-top:1px solid var(--border-color);">
            <label style="font-weight:bold; color:var(--text-main); font-size:14px; margin-bottom:5px; display:block;">Color de Fondo (Bicolor)</label>
            ${htmlPaleta(localStorage.getItem("colorBicolorFondo") || "#1E293B", "cambiarColorBicolorFondo")}
            
            <label style="font-weight:bold; color:var(--text-main); font-size:14px; margin-top:15px; margin-bottom:5px; display:block;">Color de Acento (Bicolor)</label>
            ${htmlPaleta(localStorage.getItem("colorBicolorAcento") || "#3B82F6", "cambiarColorBicolorAcento")}
        </div>` : "";

    contenido.innerHTML = `<h2>Ajustes y personalización</h2>
        ${aj("tema", "Tema visual", temaActual, t.map(x => btnO(x[0], x[1], temaActual, "cambiarTemaApp")).join("") + extraBicolor)}
        ${aj("letra", "Tamaño de letra", letraActual, l.map(x => btnO(x[0], x[1], letraActual, "cambiarTamanioLetra")).join(""))}
        ${aj("forma", "Forma de los botones", formaBotones, f.map(x => btnO(x[0], x[1], formaBotones, "cambiarFormaBotones")).join(""))}
        ${aj("opacidad", "Opacidad del color", Math.round(opacidadColor * 100) + "%", `<p style="margin-bottom:10px;">Ajusta la transparencia de los colores.</p><input type="range" min="10" max="100" value="${opacidadColor * 100}" oninput="cambiarOpacidad(this.value)" style="width:100%; accent-color: var(--accent);">`)}
        ${aj("color", "Color de diseño", "Elegido", htmlPaleta(colorActual, "cambiarColorPrincipal"))}
        ${aj("menu", "Color de botones", hayMenuPersonal ? "Personalizado" : "Como el diseño", `<p>Elige qué botón quieres cambiar, o «Todos».</p><div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(85px, 1fr)); gap:6px; margin-bottom:15px;">${chipsMenu}</div><p class="texto-ultima">Cambiando: <strong>${textoCambiando}</strong></p>${htmlPaleta(colorObjetivo, "cambiarColorBoton")}<button onclick="restaurarColoresMenu()" style="width:100%; margin-top:12px; background:#3B82F6;">Usar color del diseño en todos</button>`)}
        ${aj("version", "Actualizaciones", "v15", `<button onclick="buscarActualizaciones()" style="width:100%;background:#10B981;">🔄 Buscar actualizaciones</button>`)}
        ${aj("copia", "Copia de seguridad", "", `<p style="margin-bottom:10px;">Guarda tus datos.</p><button onclick="exportarDatos()" style="width:100%;">📥 Descargar copia</button><button onclick="importarDatos()" style="width:100%;margin-top:10px;">📤 Importar copia</button>`)}`;
    
    restaurarScroll();
}

// Función para saber qué versión está activa ahora mismo
async function obtenerVersionInstalada() {
    const el = document.getElementById("versionInstaladaTexto");
    if (!el) return;
    
    try {
        if ('caches' in window) {
            const claves = await caches.keys();
            const cacheEntrenamiento = claves.find(k => k.startsWith('entrenamiento-'));
            if (cacheEntrenamiento) {
                el.innerText = cacheEntrenamiento.replace('entrenamiento-', ''); // Muestra "v11"
                return;
            }
        }
        el.innerText = "Desconocida";
    } catch (e) {
        el.innerText = "Error";
    }
}

async function buscarActualizaciones() {
    if (!navigator.onLine) { aviso("Sin conexión a internet."); return; }
    aviso("Buscando actualizaciones...");
    
    try {
        let versionActual = "Desconocida";
        if ('caches' in window) {
            const claves = await caches.keys();
            const cache = claves.find(k => k.startsWith('entrenamiento-'));
            if (cache) versionActual = cache.replace('entrenamiento-', '');
        }

        const r = await fetch("sw.js?ts=" + Date.now(), { cache: "no-store" });
        const texto = await r.text();
        const match = texto.match(/CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
        
        if (!match) { aviso("No se pudo leer la versión nueva."); return; }
        let versionNueva = match[1].replace('entrenamiento-', '');

        if (versionNueva !== versionActual) {
            confirmar(`Hay una versión nueva (${versionNueva}).\nTú tienes la (${versionActual}).\n\n¿Quieres actualizar y reiniciar?`, () => {
                actualizarApp();
            });
        } else {
            aviso(`✅ Ya tienes la última versión (${versionActual}).`);
        }
    } catch (e) {
        aviso("Error al comprobar. Revisa tu conexión.");
    }
}

async function actualizarApp() {
    aviso("Instalando...");
    try {
        if ("serviceWorker" in navigator) {
            const registros = await navigator.serviceWorker.getRegistrations();
            for (let r of registros) { await r.unregister(); }
        }
        if (window.caches) {
            const claves = await caches.keys();
            await Promise.all(claves.map(k => caches.delete(k)));
        }
    } catch (e) {}
    
    setTimeout(() => { window.location.reload(true); }, 800);
}

function cambiarTemaApp(t) { guardarScroll(); temaActual = t; aplicarPreferencias(); guardarDatos(); mostrarAjustes(); }
function cambiarTamanioLetra(t) { guardarScroll(); letraActual = t; aplicarPreferencias(); guardarDatos(); mostrarAjustes(); }
function cambiarFormaBotones(f) { guardarScroll(); formaBotones = f; aplicarPreferencias(); guardarDatos(); mostrarAjustes(); }
function cambiarOpacidad(valor) { opacidadColor = valor / 100; aplicarPreferencias(); guardarDatos(); const summary = document.querySelector(`details.ajuste[open] summary small`); if (summary) summary.innerText = valor + "%"; }
function cambiarColorBicolorFondo(c) { 
    guardarScroll(); 
    if (!/^#[0-9a-f]{6}$/i.test(c)) return; 
    localStorage.setItem("colorBicolorFondo", c.toLowerCase()); 
    aplicarPreferencias(); 
    mostrarAjustes(); 
}

function cambiarColorBicolorAcento(c) { 
    guardarScroll(); 
    if (!/^#[0-9a-f]{6}$/i.test(c)) return; 
    localStorage.setItem("colorBicolorAcento", c.toLowerCase()); 
    aplicarPreferencias(); 
    mostrarAjustes(); 
}
function cambiarColorPrincipal(c) { guardarScroll(); if (!/^#[0-9a-f]{6}$/i.test(c)) return; colorActual = c.toLowerCase(); aplicarPreferencias(); guardarDatos(); mostrarAjustes(); }
function elegirBotonMenu(c) { guardarScroll(); menuSeleccionado = c; mostrarAjustes(); }

function cambiarColorBoton(c) {
    guardarScroll();
    if (!/^#[0-9a-f]{6}$/i.test(c)) return;
    let colorSeguro = c.toLowerCase();
    if (menuSeleccionado === "todos") { colorMenuGlobal = colorSeguro; coloresMenu = {}; }
    else { coloresMenu[menuSeleccionado] = colorSeguro; }
    aplicarPreferencias();
    guardarDatos();
    mostrarAjustes();
}

function restaurarColoresMenu() { guardarScroll(); colorMenuGlobal = ""; coloresMenu = {}; menuSeleccionado = "todos"; aplicarPreferencias(); guardarDatos(); mostrarAjustes(); aviso("Botones con color del diseño."); }
function restaurarEjerciciosBase() { if (ejerciciosOcultos.length === 0) { aviso("No hay ejercicios eliminados."); return; } confirmar(`Se recuperarán ${ejerciciosOcultos.length} ejercicio(s). ¿Continuar?`, function() { ejerciciosOcultos = []; guardarDatos(); mostrarAjustes(); aviso("Recuperados."); }); }


function exportarDatos() { try { const b = new Blob([JSON.stringify({ misEjercicios, rutinas, historial, medidasCuerpo, notasDias, carreras, listasMusica, videosGuardados, podcastsGuardados, coloresMenu, colorMenuGlobal }, null, 2)], { type: "application/json" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `copia.json`; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); } catch (e) { aviso("Error"); } }
function importarDatos() { const t = prompt("Pega el texto de la copia:"); if (!t) return; try { const d = JSON.parse(t); if (d.misEjercicios) misEjercicios = d.misEjercicios; if (d.rutinas) rutinas = d.rutinas; if (d.historial) historial = d.historial; if (d.carreras) carreras = d.carreras; guardarDatos(); aviso("Importado."); mostrarAjustes(); } catch (e) { aviso("Copia no válida."); } }

/* =====================================================
   COMPARTIR ENLACES
===================================================== */
function procesarEnlaceCompartido() {
    const params = new URLSearchParams(window.location.search);
    const sharedText = params.get('text') || params.get('url') || "";
    if (!sharedText) return;
    const match = sharedText.match(/https?:\/\/[^\s]+/);
    if (!match) return;
    const enlace = match[0];
    window.history.replaceState({}, document.title, window.location.pathname);

    if (enlace.includes("youtube.com") || enlace.includes("youtu.be")) {
        confirmar("Has compartido un vídeo. ¿Quieres guardarlo?", () => { mostrarFormularioVideo(); document.getElementById("videoUrl").value = enlace; });
    } else if (enlace.includes("ivoox.com") || enlace.includes(".mp3")) {
        confirmar("Has compartido un audio. ¿Quieres guardarlo en Podcasts?", () => { mostrarFormularioPodcast(); document.getElementById("podUrl").value = enlace; });
    } else {
        confirmar("Has compartido un enlace. ¿Quieres abrirlo?", () => { abrirEnlace(enlace); });
    }
}

let liveMap = null;
let livePolyline = null;
let liveMarker = null;



function actualizarMapaEnVivo(lat, lon) {
    if (!liveMap || !livePolyline || !liveMarker) return;
    liveMarker.setLatLng([lat, lon]);
    livePolyline.addLatLng([lat, lon]);
    liveMap.setView([lat, lon]);
}

function posicionCorrer(p) { 
    if (correr.estado !== "corriendo") return; 
    correr.precision = p.coords.accuracy; 
    if (p.coords.accuracy > 35) return; 
    correr.gps = "ok"; 
    const act = [p.coords.latitude, p.coords.longitude]; 
    
    actualizarMapaEnVivo(act[0], act[1]);

    if (!correr.ultimaPos) { correr.ultimaPos = { p: act, t: p.timestamp }; correr.puntos.push(act); actualizarVistaCorrer(); return; } 
    const d = haversine(correr.ultimaPos.p, act); 
    const dt = (p.timestamp - correr.ultimaPos.t) / 1000; 
    if (d < 4 || (dt > 0 && d / dt > 25)) return; 
    correr.distM += d; 
    correr.puntos.push(act); 
    correr.ultimaPos = { p: act, t: p.timestamp }; 
    actualizarVistaCorrer(); 
}

function verCarrera(id, origen) { 
    guardarScroll();
    origenCarrera = origen || "correr";
    const c = carreras.find(x => x.id === id); if (!c) return; 
    const t = tiposCardio[tipoDe(c)];
    const km = (c.distancia || 0) / 1000;
    
    contenido.innerHTML = `
        <button class="boton-texto" onclick="mostrarCorrer()" style="color:var(--accent); font-size:16px; margin-bottom:15px; font-weight:bold; padding:0;">◀ Volver</button>
        <div style="text-align:center; margin-bottom:20px;">
            <h2 style="margin:0;">${t.icono} ${t.nombre}</h2>
            <p style="margin:5px 0 0 0;">${formatearFecha(c.fecha)}</p>
        </div>
        
        <div class="tarjeta-rutina" style="text-align:center; padding:20px;">
            <div style="display:flex; justify-content:space-around; margin-bottom:20px;">
                <div><h3 style="font-size:28px; margin:0;">${formatoKm(km)}</h3><span style="font-size:12px; color:var(--text-muted);">Distancia (km)</span></div>
                <div><h3 style="font-size:28px; margin:0;">${formatoTiempo(c.duracion)}</h3><span style="font-size:12px; color:var(--text-muted);">Tiempo</span></div>
                <div><h3 style="font-size:28px; margin:0;">${caloriasDe(c)}</h3><span style="font-size:12px; color:var(--text-muted);">Kcal</span></div>
            </div>
            
            ${km > 0 ? `<div style="display:flex; justify-content:space-around; border-top:1px solid var(--border-color); padding-top:15px;">
                <div><h4 style="margin:0;">${t.ritmo ? formatoRitmo(c.duracion / km) : formatoNum(velocidadKmh(c.duracion, c.distancia))}</h4><span style="font-size:12px; color:var(--text-muted);">${t.ritmo ? 'Ritmo Medio' : 'Vel. Media'}</span></div>
            </div>` : ""}
        </div>
        
        ${t.gps && c.ruta && c.ruta.length > 1 ? `<div id="summaryMap" style="height: 300px; width: 100%; border-radius: 12px; margin-top: 20px; z-index: 1;"></div>` : ""}
        
        <button onclick="eliminarCarrera('${c.id}', event)" style="width:100%; margin-top:30px; background:#EF4444; color:white; border:none; border-radius:var(--radio); padding:12px; font-weight:bold; cursor:pointer;">🗑 Eliminar actividad</button>
    `;

    if (t.gps && c.ruta && c.ruta.length > 1) {
        setTimeout(() => { initSummaryMap(c.ruta); }, 100); 
    }
    restaurarScroll();
}

