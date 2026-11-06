/* =====================================================
   MI ENTRENAMIENTO - JS MÓVIL (PARTE 1)
===================================================== */

const APP_VERSION = "1.3";

let contenido = null;
let misEjercicios = [];
let rutinas = [];
let historial = [];
let ejerciciosOcultos = [];
let medidasCuerpo = [];
let notasDias = {};
let carreras = [];
let listasMusica = []; // Listas locales
let videosGuardados = [];
let coloresMenu = {};
let colorMenuGlobal = "";
let menuSeleccionado = "todos";
let tipoCardio = "correr";
let vozCorrer = true;
let alturaCm = 0;
let temaActual = "oscuro";
let letraActual = "mediana";
let colorActual = "#2196F3";
let grupoActual = "";

const botonesMenu = [
    ["inicio", "Inicio"], ["ejercicios", "Ejercicios"], ["rutinas", "Rutinas"],
    ["progreso", "Progreso"], ["cronometro", "Cronómetro"], ["calendario", "Calendario"],
    ["correr", "Cardio"], ["tiempo", "Tiempo"], ["musica", "Música"], ["video", "Vídeos"]
];

let metricaActual = "peso";
let periodoActual = 0;
let cuerpoEditandoId = null;

let cronoIntervalo = null;
let cronoModo = "parado";
let cronoMs = 0;
let cronoInicio = 0;
let cronoFin = 0;
let cronoColor = "";

let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();
let diaSeleccionado = null;
let notaEditandoId = null;

let correr = nuevoEstadoCorrer();
let origenCarrera = "correr";

let videoEditandoId = null;

document.addEventListener("DOMContentLoaded", function() {
    contenido = document.getElementById("contenido");

    misEjercicios = cargarDatos("misEjercicios", []);
    rutinas = cargarDatos("misRutinas", []);
    historial = cargarDatos("historialEntrenamientos", []);
    ejerciciosOcultos = cargarDatos("ejerciciosOcultos", []);
    medidasCuerpo = cargarDatos("medidasCuerpo", []);
    notasDias = cargarDatos("notasDias", {});
    carreras = cargarDatos("carreras", []);
    listasMusica = cargarDatos("listasMusica", []);
    videosGuardados = cargarDatos("videosGuardados", []);
    coloresMenu = cargarDatos("coloresMenu", {});
    colorMenuGlobal = leerTexto("colorMenuGlobal", "");
    vozCorrer = leerTexto("vozCorrer", "1") !== "0";
    alturaCm = parseFloat(leerTexto("alturaCm", "0")) || 0;

    if (!Array.isArray(listasMusica)) listasMusica = [];
    if (!Array.isArray(videosGuardados)) videosGuardados = [];
    if (!notasDias || typeof notasDias !== "object" || Array.isArray(notasDias)) notasDias = {};
    if (!coloresMenu || typeof coloresMenu !== "object" || Array.isArray(coloresMenu)) coloresMenu = {};
    if (!/^#[0-9a-f]{6}$/i.test(colorMenuGlobal)) colorMenuGlobal = "";

    temaActual = leerTexto("temaApp", "oscuro");
    letraActual = leerTexto("tamanioLetraApp", "mediana");
    colorActual = leerTexto("colorApp", "#2196F3");

        aplicarPreferencias();
    mostrarPanelPrincipal();
    procesarEnlaceCompartido(); // <--- AÑADE ESTA LÍNEA AQUÍ
});

function cargarDatos(clave, valorInicial) {
    try { const d = localStorage.getItem(clave); return d ? JSON.parse(d) : valorInicial; } catch (e) { return valorInicial; }
}
function leerTexto(clave, valorInicial) {
    try { const d = localStorage.getItem(clave); return d ? d.replace(/"/g, "") : valorInicial; } catch (e) { return valorInicial; }
}
function guardarDatos() {
    try {
        localStorage.setItem("misEjercicios", JSON.stringify(misEjercicios));
        localStorage.setItem("misRutinas", JSON.stringify(rutinas));
        localStorage.setItem("historialEntrenamientos", JSON.stringify(historial));
        localStorage.setItem("ejerciciosOcultos", JSON.stringify(ejerciciosOcultos));
        localStorage.setItem("medidasCuerpo", JSON.stringify(medidasCuerpo));
        localStorage.setItem("notasDias", JSON.stringify(notasDias));
        localStorage.setItem("carreras", JSON.stringify(carreras));
        localStorage.setItem("listasMusica", JSON.stringify(listasMusica));
        localStorage.setItem("videosGuardados", JSON.stringify(videosGuardados));
        localStorage.setItem("coloresMenu", JSON.stringify(coloresMenu));
        localStorage.setItem("colorMenuGlobal", colorMenuGlobal);
        localStorage.setItem("vozCorrer", vozCorrer ? "1" : "0");
        localStorage.setItem("alturaCm", String(alturaCm));
        localStorage.setItem("temaApp", temaActual);
        localStorage.setItem("tamanioLetraApp", letraActual);
        localStorage.setItem("colorApp", colorActual);
    } catch (e) { aviso("⚠️ No se pudieron guardar los datos."); }
}

function colorDeBoton(clave) { return coloresMenu[clave] || colorMenuGlobal || colorActual; }

function aplicarPreferencias() {
    document.body.classList.remove("tema-oled", "tema-claro", "letra-pequenia", "letra-mediana", "letra-grande");
    if (temaActual === "oled") document.body.classList.add("tema-oled");
    if (temaActual === "claro") document.body.classList.add("tema-claro");
    document.body.classList.add("letra-" + letraActual);
    document.documentElement.style.setProperty("--accent", colorActual);
    botonesMenu.forEach(function(b) {
        const boton = document.querySelector(`.menu button[onclick="mostrar('${b[0]}')"]`);
        if (boton) boton.style.background = colorDeBoton(b[0]);
    });
}

function generarId() { return "id_" + Date.now() + "_" + Math.floor(Math.random() * 10000); }
function escaparHTML(texto) { return String(texto ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

function fechaATexto(fecha) { return `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,"0")}-${String(fecha.getDate()).padStart(2,"0")}`; }
function textoAFecha(texto) { const p = String(texto).split("-"); return new Date(Number(p[0]), Number(p[1])-1, Number(p[2])); }
function obtenerFechaActual() { return fechaATexto(new Date()); }
function formatearFecha(fecha) { const p = String(fecha).split("-"); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : String(fecha); }
function formatearFechaCorta(fecha) { const p = String(fecha).split("-"); return p.length === 3 ? `${p[2]}/${p[1]}` : String(fecha); }
function formatoNum(n, d = 1) { const f = Math.pow(10, d); return String(Math.round(n * f) / f).replace(".", ","); }

let avisoTimeout = null;
function aviso(texto) {
    const caja = document.getElementById("aviso");
    if (!caja) return;
    caja.textContent = texto; caja.classList.add("visible");
    clearTimeout(avisoTimeout);
    avisoTimeout = setTimeout(() => caja.classList.remove("visible"), 2800);
}
window.alert = function(t) { aviso(t); };

function confirmar(texto, alAceptar) {
    const fondo = document.createElement("div");
    fondo.className = "modal-fondo";
    fondo.innerHTML = `<div class="modal-caja"><p>${escaparHTML(texto)}</p><div class="modal-botones"><button class="boton-si">Sí</button><button class="boton-no">No</button></div></div>`;
    document.body.appendChild(fondo);
    fondo.querySelector(".boton-si").onclick = () => { fondo.remove(); alAceptar(); };
    fondo.querySelector(".boton-no").onclick = () => fondo.remove();
}

function informar(texto) {
    const fondo = document.createElement("div");
    fondo.className = "modal-fondo";
    fondo.innerHTML = `<div class="modal-caja"><p>${escaparHTML(texto)}</p><div class="modal-botones" style="grid-template-columns: 1fr;"><button class="boton-si">Entendido</button></div></div>`;
    document.body.appendChild(fondo);
    fondo.querySelector("button").onclick = () => fondo.remove();
}

function abrirEnlace(url) {
    const a = document.createElement("a"); a.href = url; a.target = "_blank"; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
}

function mostrarPanelPrincipal() {
    if (!contenido) contenido = document.getElementById("contenido");
    if (!contenido) return;
    contenido.innerHTML = `<div style="text-align: center; padding: 40px 20px; opacity: 0.8;"><h3>💪 Panel Principal</h3><p>Selecciona una opción en el menú superior.</p></div>`;
}

function mostrar(apartado) {
    if (!contenido) contenido = document.getElementById("contenido");
    if (!contenido) return;
    if (contenido.querySelector(`[data-vista="${apartado}"]`)) { mostrarPanelPrincipal(); return; }

    const vistas = {
        inicio: mostrarInicio, ejercicios: mostrarEjercicios, rutinas: mostrarRutinas,
        progreso: mostrarProgreso, cronometro: mostrarCronometro, calendario: mostrarCalendario,
        correr: mostrarCorrer, musica: mostrarMusica, video: mostrarVideos,
        tiempo: mostrarTiempo, ajustes: mostrarAjustes
    };

    if (!vistas[apartado]) return;
    vistas[apartado]();
    if (!contenido.querySelector(`[data-vista="${apartado}"]`)) contenido.insertAdjacentHTML("afterbegin", `<span data-vista="${apartado}" hidden></span>`);
    contenido.scrollIntoView({ behavior: "smooth", block: "start" });
}

function mostrarInicio() {
    const ultimo = obtenerUltimoPeso();
    contenido.innerHTML = `
        <span data-vista="inicio" hidden></span>
        <h2>Inicio</h2>
        <p>¿Qué vamos a entrenar hoy?</p>
        <div class="tarjeta-rutina"><h3>Mis rutinas</h3><p>Tienes ${rutinas.length} rutinas creadas.</p><button onclick="mostrar('rutinas')">Ver mis rutinas</button></div>
        <div class="tarjeta-rutina"><h3>Biblioteca de ejercicios</h3><p>Tienes ${obtenerEjercicios().length} ejercicios disponibles.</p><button onclick="mostrar('ejercicios')">Ver ejercicios</button></div>
        <div class="tarjeta-rutina"><h3>Entrenamientos realizados</h3><p>Has registrado ${historial.length} entrenamientos y ${carreras.length} carreras.</p><button onclick="mostrar('calendario')">Ver calendario</button></div>
        <div class="tarjeta-rutina"><h3>Control corporal</h3><p>${ultimo ? `Último peso: ${formatoNum(ultimo.valor)} kg (${formatearFecha(ultimo.fecha)}).` : "Aún no has registrado tu peso."}</p><button onclick="mostrar('progreso')">Ver progreso</button></div>
    `;
}

const URL_IMG = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
function ex(id, nombre, grupo, equipo, compuesto, descripcion, img) { return { id, nombre, grupo, equipo, compuesto, descripcion, img: img || "" }; }

const ejerciciosBase = [
    ex("e1", "Press de banca con mancuernas", "Pecho", "Pesas", true, "1. Túmbate con una mancuerna en cada mano.\n2. Empuja hacia arriba.\n3. Baja despacio.", "Dumbbell_Bench_Press"),
    ex("e19", "Press de banca con barra", "Pecho", "Pesas", true, "1. Agarra la barra.\n2. Bájala al pecho.\n3. Empuja.", "Barbell_Bench_Press_-_Medium_Grip"),
    ex("e20", "Press inclinado con mancuernas", "Pecho", "Pesas", true, "1. Banco a 45 grados.\n2. Empuja.\n3. Baja.", "Incline_Dumbbell_Press"),
    ex("e2", "Aperturas con mancuernas", "Pecho", "Pesas", false, "1. Abre los brazos en arco.\n2. Vuelve a juntar.", "Dumbbell_Flyes"),
    ex("e3", "Flexiones", "Pecho", "Peso corporal", true, "1. Cuerpo recto.\n2. Baja el pecho.\n3. Empuja.", "Pushups"),
    ex("e44", "Press de pecho con goma", "Pecho", "Gomas", true, "1. Pasa la goma por la espalda.\n2. Empuja al frente."),
    ex("e4", "Remo con mancuerna", "Espalda", "Pesas", true, "1. Apoya una rodilla.\n2. Tira hacia la cadera.", "One-Arm_Dumbbell_Row"),
    ex("e25", "Remo con barra", "Espalda", "Pesas", true, "1. Inclina el torso.\n2. Tira de la barra al abdomen.", "Bent_Over_Barbell_Row"),
    ex("e5", "Peso muerto con mancuernas", "Espalda", "Pesas", true, "1. Cadera atrás.\n2. Baja pegado a las piernas.", "Stiff-Legged_Dumbbell_Deadlift"),
    ex("e15", "Peso muerto convencional", "Espalda", "Pesas", true, "1. Barra en el suelo.\n2. Sube estirando cadera.", "Barbell_Deadlift"),
    ex("e17", "Dominadas", "Espalda", "Peso corporal", true, "1. Cuélgate.\n2. Tira hasta pasar la barbilla.", "Pullups"),
    ex("e26", "Jalón al pecho", "Espalda", "Pesas", true, "1. Polea alta.\n2. Tira al pecho.", "Wide-Grip_Lat_Pulldown"),
    ex("e37", "Remo invertido", "Espalda", "Peso corporal", true, "1. Barra baja.\n2. Tira del pecho.", "Inverted_Row"),
    ex("e45", "Remo con goma", "Espalda", "Gomas", true, "1. Goma en los pies.\n2. Tira al abdomen."),
    ex("e53", "Jalón con goma", "Espalda", "Gomas", false, "1. Goma arriba.\n2. Tira al pecho."),
    ex("e43", "Superman", "Espalda", "Peso corporal", false, "1. Boca abajo.\n2. Eleva brazos y piernas.", "Superman"),
    ex("e6", "Curl de bíceps", "Bíceps", "Pesas", false, "1. Codos pegados.\n2. Sube las mancuernas.", "Dumbbell_Bicep_Curl"),
    ex("e7", "Curl martillo", "Bíceps", "Pesas", false, "1. Palmas al centro.\n2. Sube.", "Hammer_Curls"),
    ex("e27", "Curl con barra", "Bíceps", "Pesas", false, "1. Agarre supino.\n2. Sube la barra.", "Barbell_Curl"),
    ex("e47", "Curl de bíceps con goma", "Bíceps", "Gomas", false, "1. Pisa la goma.\n2. Flexiona codos."),
    ex("e8", "Extensión de tríceps", "Tríceps", "Pesas", false, "1. Mancuerna arriba.\n2. Baja detrás de la nuca.", "Standing_Dumbbell_Triceps_Extension"),
    ex("e9", "Patada de tríceps", "Tríceps", "Pesas", false, "1. Codo pegado.\n2. Extiende atrás.", "Tricep_Dumbbell_Kickback"),
    ex("e18", "Fondos en paralelas", "Tríceps", "Peso corporal", true, "1. Paralelas.\n2. Baja y sube.", "Dips_-_Triceps_Version"),
    ex("e21", "Fondos en banco", "Tríceps", "Peso corporal", false, "1. Manos en banco.\n2. Baja y sube.", "Bench_Dips"),
    ex("e38", "Flexiones diamante", "Tríceps", "Peso corporal", true, "1. Manos juntas.\n2. Baja y sube.", "Push-Ups_-_Close_Triceps_Position"),
    ex("e28", "Press francés", "Tríceps", "Pesas", false, "1. Tumbado.\n2. Baja a la frente."),
    ex("e48", "Extensión de tríceps con goma", "Tríceps", "Gomas", false, "1. Goma alta.\n2. Empuja abajo."),
    ex("e10", "Press de hombros", "Hombros", "Pesas", true, "1. Mancuernas a hombros.\n2. Empuja arriba.", "Dumbbell_Shoulder_Press"),
    ex("e16", "Press militar de pie", "Hombros", "Pesas", true, "1. Barra al pecho.\n2. Empuja arriba.", "Standing_Military_Press"),
    ex("e11", "Elevaciones laterales", "Hombros", "Pesas", false, "1. Brazos a los lados.\n2. Eleva.", "Side_Lateral_Raise"),
    ex("e29", "Elevaciones frontales", "Hombros", "Pesas", false, "1. Eleva al frente.", "Front_Dumbbell_Raise"),
    ex("e30", "Pájaros", "Hombros", "Pesas", false, "1. Inclinado.\n2. Abre brazos."),
    ex("e31", "Encogimientos de hombros", "Hombros", "Pesas", false, "1. Sube hombros.", "Dumbbell_Shrug"),
    ex("e46", "Apertura con goma", "Hombros", "Gomas", false, "1. Separa la goma."),
    ex("e52", "Press de hombros con goma", "Hombros", "Gomas", true, "1. Pisa goma.\n2. Empuja arriba."),
    ex("e12", "Sentadillas", "Piernas", "Peso corporal", true, "1. Baja cadera atrás.\n2. Sube.", "Bodyweight_Squat"),
    ex("e35", "Sentadilla tempo lento", "Piernas", "Peso corporal", true, "1. Baja en 3 seg.\n2. Sube.", "Bodyweight_Squat"),
    ex("e22", "Sentadilla con barra", "Piernas", "Pesas", true, "1. Barra en hombros.\n2. Baja y sube.", "Barbell_Full_Squat"),
    ex("e32", "Sentadilla goblet", "Piernas", "Pesas", true, "1. Mancuerna al pecho.\n2. Baja y sube.", "Goblet_Squat"),
    ex("e49", "Sentadilla con goma", "Piernas", "Gomas", true, "1. Pisa goma.\n2. Baja y sube."),
    ex("e13", "Zancadas", "Piernas", "Peso corporal", true, "1. Paso largo.\n2. Baja.", "Dumbbell_Lunges"),
    ex("e33", "Zancada búlgara", "Piernas", "Pesas", true, "1. Pie en banco.\n2. Baja."),
    ex("e23", "Peso muerto rumano", "Piernas", "Pesas", true, "1. Cadera atrás.\n2. Baja barra.", "Romanian_Deadlift"),
    ex("e24", "Hip thrust", "Piernas", "Pesas", true, "1. Espalda en banco.\n2. Sube cadera.", "Barbell_Hip_Thrust"),
    ex("e36", "Puente de glúteos", "Piernas", "Peso corporal", false, "1. Sube cadera.", "Butt_Lift_Bridge"),
    ex("e50", "Puente con goma", "Piernas", "Gomas", false, "1. Goma en rodillas.\n2. Sube cadera."),
    ex("e51", "Caminata lateral goma", "Piernas", "Gomas", false, "1. Pasos laterales."),
    ex("e34", "Elevación de talones", "Piernas", "Peso corporal", false, "1. Sube puntas.", "Standing_Calf_Raises"),
    ex("e14", "Plancha abdominal", "Abdominales", "Peso corporal", false, "1. Aguanta recto.", "Plank"),
    ex("e39", "Crunch abdominal", "Abdominales", "Peso corporal", false, "1. Sube hombros.", "Crunches"),
    ex("e40", "Elevación de piernas", "Abdominales", "Peso corporal", false, "1. Sube piernas.", "Flat_Bench_Lying_Leg_Raise"),
    ex("e41", "Plancha lateral", "Abdominales", "Peso corporal", false, "1. De lado.", "Side_Bridge"),
    ex("e42", "Mountain climbers", "Abdominales", "Peso corporal", true, "1. Rodillas al pecho rápido.", "Mountain_Climbers"),
    // COMPUESTOS REALES (2+ músculos)
    ex("e54", "Thruster con mancuernas (Sentadilla + Press)", "Compuestos", "Pesas", true, "1. Sentadilla.\n2. Al subir, empuja mancuernas arriba."),
    ex("e55", "Burpees (Flexión + Salto)", "Compuestos", "Peso corporal", true, "1. Flexión.\n2. Salto."),
    ex("e56", "Clean and Press (Cargada + Press)", "Compuestos", "Pesas", true, "1. Sube la barra al pecho.\n2. Empuja arriba."),
    ex("e57", "Zancada con curl (Pierna + Bíceps)", "Compuestos", "Pesas", true, "1. Zancada.\n2. Curl bíceps.")
];

function obtenerEjercicios() {
    const base = ejerciciosBase.filter(e => !ejerciciosOcultos.includes(e.id));
    return [...base, ...misEjercicios];
}

function htmlImagenesEjercicio(e) {
    if (!e.img) return "";
    return `<div class="imagenes-ejercicio" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:15px 0;"><figure><img src="${URL_IMG}${e.img}/images/0.jpg" style="width:100%;border-radius:12px;" loading="lazy" onerror="this.parentElement.style.display='none'"><figcaption style="font-size:13px;text-align:center;">Inicio</figcaption></figure><figure><img src="${URL_IMG}${e.img}/images/1.jpg" style="width:100%;border-radius:12px;" loading="lazy" onerror="this.parentElement.style.display='none'"><figcaption style="font-size:13px;text-align:center;">Final</figcaption></figure></div>`;
}

const GRUPOS_EJERCICIO = [
    { nombre: "Todos", color: "#2196F3", filtro: "Todos" },
    { nombre: "Compuestos", color: "#7E57C2", filtro: "Compuestos" },
    { nombre: "Pecho", color: "#C62828", filtro: "Pecho" },
    { nombre: "Espalda", color: "#1565C0", filtro: "Espalda" },
    { nombre: "Bíceps", color: "#AD1457", filtro: "Bíceps" },
    { nombre: "Tríceps", color: "#E65100", filtro: "Tríceps" },
    { nombre: "Hombros", color: "#D9A514", filtro: "Hombros" },
    { nombre: "Piernas", color: "#27864A", filtro: "Piernas" },
    { nombre: "Abdominales", color: "#00897B", filtro: "Abdominales" },
    { nombre: "Con pesas", color: "#6D4C41", filtro: "eq:Pesas" },
    { nombre: "Con gomas", color: "#E91E63", filtro: "eq:Gomas" },
    { nombre: "Peso corporal", color: "#03A9F4", filtro: "eq:Peso corporal" }
];

function mostrarEjercicios() {
    contenido.innerHTML = `
        <span data-vista="ejercicios" hidden></span>
        <h2>Biblioteca de ejercicios</h2>
        <div class="filtros-letras">${GRUPOS_EJERCICIO.map(g => `<button class="chip-ejercicio" style="border-color:${g.color}; color:${g.color};" onclick="filtrarGrupo('${g.filtro}')">${g.nombre}</button>`).join("")}</div>
        <button class="boton-crear-ejercicio" onclick="mostrarFormularioEjercicio()" style="margin-top:10px;width:100%;">+ Crear ejercicio</button>
        <div id="listaEjercicios" style="margin-top:15px;"><div style="text-align:center;padding:20px;opacity:0.7;"><p>Pulsa un grupo para ver los ejercicios.</p></div></div>
    `;
    grupoActual = "";
}

function filtrarGrupo(grupo) {
    grupoActual = grupo;
    document.querySelectorAll(".chip-ejercicio").forEach(b => b.classList.remove("activo"));
    const activo = document.querySelector(`.chip-ejercicio[onclick*="'${grupo}'"]`);
    if (activo) activo.classList.add("activo");
    filtrarBiblioteca();
    const lista = document.getElementById("listaEjercicios");
    if (lista) lista.scrollIntoView({ behavior: "smooth", block: "start" });
}

function coincideFiltro(ejercicio) {
    if (grupoActual === "" || grupoActual === "Todos") return true;
    if (grupoActual === "Compuestos") return ejercicio.grupo === "Compuestos";
    if (grupoActual.indexOf("eq:") === 0) return ejercicio.equipo === grupoActual.slice(3);
    return ejercicio.grupo === grupoActual;
}

function filtrarBiblioteca() {
    const lista = document.getElementById("listaEjercicios");
    if (!lista) return;
    if (grupoActual === "") { lista.innerHTML = `<div style="text-align:center;padding:20px;opacity:0.7;"><p>Selecciona un grupo.</p></div>`; return; }
    const ejercicios = obtenerEjercicios().filter(coincideFiltro);
    if (ejercicios.length === 0) { lista.innerHTML = "<p>No hay ejercicios en esta categoría.</p>"; return; }
    lista.innerHTML = ejercicios.map(e => `
        <div class="tarjeta-ejercicio">
            <h3>${escaparHTML(e.nombre)}</h3>
            <div class="etiquetas-ejercicio" style="display:flex;gap:6px;margin:8px 0;flex-wrap:wrap;">
                <span class="etiqueta" style="background:var(--bg-box);padding:3px 10px;border-radius:14px;font-size:13px;">${escaparHTML(e.grupo)}</span>
                ${e.equipo ? `<span class="etiqueta" style="background:var(--bg-box);padding:3px 10px;border-radius:14px;font-size:13px;">${escaparHTML(e.equipo)}</span>` : ""}
                ${e.compuesto ? `<span class="etiqueta" style="background:var(--bg-box);padding:3px 10px;border-radius:14px;font-size:13px;">Compuesto</span>` : ""}
            </div>
            <button class="boton-texto" onclick="verDetalleEjercicio('${e.id}')">Ver ejercicio</button>
            <button class="boton-texto" onclick="elegirRutinaParaEjercicio('${e.id}')">Añadir a rutina</button>
        </div>
    `).join("");
}

function verDetalleEjercicio(id) {
    const e = obtenerEjercicios().find(x => x.id === id);
    if (!e) return;
    contenido.innerHTML = `
        <h2>${escaparHTML(e.nombre)}</h2>
        <div class="etiquetas-ejercicio" style="display:flex;gap:6px;margin:8px 0;flex-wrap:wrap;">
            <span class="etiqueta" style="background:var(--bg-box);padding:3px 10px;border-radius:14px;font-size:13px;">${escaparHTML(e.grupo)}</span>
            ${e.equipo ? `<span class="etiqueta" style="background:var(--bg-box);padding:3px 10px;border-radius:14px;font-size:13px;">${escaparHTML(e.equipo)}</span>` : ""}
        </div>
        ${htmlImagenesEjercicio(e)}
        <h3>Cómo se hace</h3>
        <p style="white-space:pre-line;color:var(--text-main);">${escaparHTML(e.descripcion || "Sin descripción.")}</p>
        <button class="boton-texto" onclick="elegirRutinaParaEjercicio('${e.id}')">Añadir a rutina</button>
        <button class="boton-texto texto-rojo" onclick="eliminarEjercicio('${e.id}')">🗑 Eliminar ejercicio</button>
        <button class="boton-texto texto-volver" onclick="mostrarEjercicios()">◀ Volver</button>
    `;
}

function mostrarFormularioEjercicio() {
    contenido.innerHTML = `
        <h2>Crear ejercicio</h2>
        <label>Nombre</label><input type="text" id="nuevoNombre" placeholder="Nombre">
        <label>Grupo muscular</label>
        <select id="nuevoGrupo"><option value="Compuestos">Compuestos</option><option value="Pecho">Pecho</option><option value="Espalda">Espalda</option><option value="Bíceps">Bíceps</option><option value="Tríceps">Tríceps</option><option value="Hombros">Hombros</option><option value="Piernas">Piernas</option><option value="Abdominales">Abdominales</option></select>
        <label>Material</label>
        <select id="nuevoEquipo"><option value="Pesas">Pesas</option><option value="Gomas">Gomas</option><option value="Peso corporal">Peso corporal</option></select>
        <label>Cómo se hace</label><textarea id="nuevaDescripcion" placeholder="Descripción..."></textarea>
        <button onclick="guardarNuevoEjercicio()" style="width:100%;margin-top:10px;">Guardar</button>
        <button class="boton-texto texto-volver" onclick="mostrarEjercicios()" style="width:100%;margin-top:10px;">Cancelar</button>
    `;
}

function guardarNuevoEjercicio() {
    const nombre = document.getElementById("nuevoNombre").value.trim();
    const grupo = document.getElementById("nuevoGrupo").value;
    const equipo = document.getElementById("nuevoEquipo").value;
    const descripcion = document.getElementById("nuevaDescripcion").value.trim();
    if (!nombre) { alert("Escribe el nombre."); return; }
    misEjercicios.push({ id: generarId(), nombre, grupo, equipo, compuesto: grupo === "Compuestos", descripcion, img: "" });
    guardarDatos(); alert("Ejercicio guardado."); mostrarEjercicios();
}

function eliminarEjercicio(id, indiceRutina) {
    const ejercicio = obtenerEjercicios().find(e => e.id === id);
    if (!ejercicio) return;
    const esPropio = misEjercicios.some(e => e.id === id);
    const enRutinas = rutinas.filter(r => r.ejercicios.some(item => item.ejercicioId === id)).length;
    let mensaje = `¿Eliminar "${ejercicio.nombre}"?`;
    if (enRutinas > 0) mensaje += `\n\nTambién se quitará de ${enRutinas} rutina(s).`;
    confirmar(mensaje, function() {
        if (esPropio) misEjercicios = misEjercicios.filter(e => e.id !== id);
        else if (!ejerciciosOcultos.includes(id)) ejerciciosOcultos.push(id);
        rutinas.forEach(r => { r.ejercicios = r.ejercicios.filter(item => item.ejercicioId !== id); });
        guardarDatos(); aviso("Ejercicio eliminado.");
        if (indiceRutina !== undefined) mostrarSelectorEjercicios(indiceRutina); else mostrarEjercicios();
    });
}

function restaurarEjerciciosBase() {
    if (ejerciciosOcultos.length === 0) { aviso("No hay eliminados."); return; }
    confirmar(`Se recuperarán ${ejerciciosOcultos.length} ejercicio(s). ¿Continuar?`, function() {
        ejerciciosOcultos = []; guardarDatos(); mostrarAjustes(); aviso("Recuperados.");
    });
}

/* =====================================================
   RUTINAS, PROGRESO, CRONÓMETRO Y CALENDARIO
===================================================== */

const plantillasRutinas = [
    { nombre: "Fuerza", descripcion: "Carga alta y pocas repeticiones.", ejercicios: [["e15", 5, 5], ["e22", 5, 5], ["e19", 5, 5], ["e16", 5, 5], ["e25", 5, 5]] },
    { nombre: "Volumen", descripcion: "Hipertrofia.", ejercicios: [["e1", 4, 10], ["e4", 4, 10], ["e10", 4, 10], ["e12", 4, 10], ["e6", 3, 12], ["e8", 3, 12]] },
    { nombre: "Definición", descripcion: "Altas repeticiones.", ejercicios: [["e32", 3, 15], ["e3", 3, 15], ["e13", 3, 15], ["e4", 3, 15], ["e11", 3, 15], ["e39", 3, 20]] },
    { nombre: "Empuje", descripcion: "Pecho, hombro, tríceps.", ejercicios: [["e19", 4, 8], ["e20", 3, 10], ["e10", 4, 10], ["e11", 3, 15], ["e8", 3, 12]] },
    { nombre: "Tirón", descripcion: "Espalda y bíceps.", ejercicios: [["e25", 4, 8], ["e26", 4, 10], ["e4", 3, 10], ["e6", 3, 12], ["e7", 3, 12]] },
    { nombre: "Pierna", descripcion: "Pierna y glúteo.", ejercicios: [["e22", 4, 8], ["e23", 3, 10], ["e13", 3, 12], ["e24", 3, 10], ["e34", 4, 15]] }
];

function mostrarRutinas() {
    contenido.innerHTML = `
        <span data-vista="rutinas" hidden></span>
        <h2>Mis rutinas</h2>
        <button onclick="mostrarFormularioRutina()" style="width:100%;">+ Crear rutina</button>
        <button onclick="mostrarPlantillas()" style="width:100%; margin-top:10px; background:#D9A514;">📋 Plantillas</button>
        <div id="listaRutinas" style="margin-top: 10px;"></div>
    `;
    actualizarListaRutinas();
}

function mostrarPlantillas() {
    contenido.innerHTML = `<h2>Plantillas</h2><p>Elige una.</p>${plantillasRutinas.map((p, i) => `<button class="tarjeta-rutina" style="width:100%; text-align:left; display:flex; justify-content:space-between;" onclick="elegirPlantilla(${i})"><strong>${escaparHTML(p.nombre)}</strong><span>${p.ejercicios.length} ej.</span></button>`).join("")}<button class="boton-texto texto-volver" onclick="mostrarRutinas()" style="width:100%; margin-top:15px;">◀ Volver</button>`;
}

function ejerciciosDePlantilla(p) {
    const disponibles = obtenerEjercicios();
    return p.ejercicios.map(x => ({ ejercicio: disponibles.find(e => e.id === x[0]), series: x[1], reps: x[2] })).filter(x => x.ejercicio);
}

function elegirPlantilla(i) {
    const p = plantillasRutinas[i]; if (!p) return;
    const lista = ejerciciosDePlantilla(p);
    contenido.innerHTML = `
        <h2>${escaparHTML(p.nombre)}</h2><label>Nombre</label><input type="text" id="plNombre" value="${escaparHTML(p.nombre)}">
        ${lista.map((x, k) => `<div class="tarjeta-ejercicio"><h3>${escaparHTML(x.ejercicio.nombre)}</h3><label>Series</label><input type="number" id="plS_${k}" value="${x.series}"><label>Reps</label><input type="number" id="plR_${k}" value="${x.reps}"></div>`).join("")}
        <button onclick="guardarPlantilla(${i})" style="width:100%; margin-top:15px;">Guardar rutina</button>
        <button class="boton-texto texto-volver" onclick="mostrarPlantillas()" style="width:100%; margin-top:10px;">Cancelar</button>
    `;
}

function guardarPlantilla(i) {
    const p = plantillasRutinas[i]; const nombre = document.getElementById("plNombre").value.trim();
    if (!nombre) { aviso("Escribe un nombre."); return; }
    const lista = ejerciciosDePlantilla(p); const ejercicios = [];
    for (let k = 0; k < lista.length; k++) {
        const s = parseInt(document.getElementById("plS_" + k).value); const r = parseInt(document.getElementById("plR_" + k).value);
        if (!s || !r) { aviso("Revisa series y reps."); return; }
        ejercicios.push({ ejercicioId: lista[k].ejercicio.id, series: s, repeticiones: r });
    }
    rutinas.push({ id: generarId(), nombre, ejercicios }); guardarDatos(); aviso("Rutina creada."); mostrarRutinas();
}

function actualizarListaRutinas() {
    const lista = document.getElementById("listaRutinas"); if (!lista) return;
    if (rutinas.length === 0) { lista.innerHTML = "<p>No tienes rutinas creadas.</p>"; return; }
    lista.innerHTML = rutinas.map((r, i) => `<button class="tarjeta-rutina" style="width:100%; text-align:left; display:flex; justify-content:space-between;" onclick="verRutina(${i})"><strong>${escaparHTML(r.nombre)}</strong><span>${r.ejercicios.length} ej.</span></button>`).join("");
}

function mostrarFormularioRutina() {
    contenido.innerHTML = `<h2>Crear rutina</h2><label>Nombre</label><input type="text" id="nombreRutina" placeholder="Ej: Pecho y Tríceps"><button onclick="crearRutina()" style="width:100%;margin-top:10px;">Guardar</button><button class="boton-texto texto-volver" onclick="mostrarRutinas()" style="width:100%;margin-top:10px;">Cancelar</button>`;
}

function crearRutina() {
    const n = document.getElementById("nombreRutina").value.trim(); if (!n) { alert("Escribe un nombre."); return; }
    rutinas.push({ id: generarId(), nombre: n, ejercicios: [] }); guardarDatos(); mostrarRutinas();
}

function eliminarRutina(i) {
    confirmar("¿Eliminar esta rutina?", function() { rutinas.splice(i, 1); guardarDatos(); aviso("Eliminada."); mostrarRutinas(); });
}

function verRutina(i) {
    const r = rutinas[i]; if (!r) return;
    let html = `<h2>${escaparHTML(r.nombre)}</h2><label>Nombre</label><input type="text" id="rutNombre" value="${escaparHTML(r.nombre)}"><div id="ejerciciosDeRutina">`;
    if (r.ejercicios.length === 0) html += "<p>Sin ejercicios.</p>";
    else r.ejercicios.forEach((item, pos) => {
        const e = obtenerEjercicios().find(x => x.id === item.ejercicioId); if (!e) return;
        html += `<div class="tarjeta-ejercicio"><h3>${escaparHTML(e.nombre)}</h3><label>Series</label><input type="number" id="rutS_${pos}" value="${item.series}"><label>Reps</label><input type="number" id="rutR_${pos}" value="${item.repeticiones}"><button class="boton-borrar" style="margin-top:10px;" onclick="eliminarEjercicioRutina(${i}, ${pos})">🗑 Quitar</button></div>`;
    });
    html += `</div><button style="width:100%;margin-top:15px;" onclick="guardarEdicionRutina(${i}, 'selector')">+ Añadir ejercicio</button>
        <button style="width:100%;margin-top:10px;background:#27864A;" onclick="guardarEdicionRutina(${i}, 'lista')">💾 Guardar</button>
        <button style="width:100%;margin-top:10px;background:#28a745;color:#fff;" onclick="guardarEdicionRutina(${i}, 'entrenar')">▶ ENTRENAR</button>
        <button class="boton-borrar" style="width:100%;margin-top:10px;" onclick="eliminarRutina(${i})">🗑 Eliminar rutina</button>
        <button class="boton-texto texto-volver" onclick="mostrarRutinas()" style="width:100%;margin-top:10px;">◀ Volver</button>`;
    contenido.innerHTML = html;
}

function leerEdicionRutina(i) {
    const r = rutinas[i]; const c = document.getElementById("rutNombre"); if (!r || !c) return false;
    const n = c.value.trim(); if (!n) { aviso("Escribe nombre."); return false; }
    const cambios = [];
    for (let p = 0; p < r.ejercicios.length; p++) {
        const s = document.getElementById("rutS_" + p); const rp = document.getElementById("rutR_" + p); if (!s || !rp) continue;
        const sv = parseInt(s.value); const rv = parseInt(rp.value); if (!(sv > 0) || !(rv > 0)) { aviso("Revisa series/reps."); return false; }
        cambios.push([p, sv, rv]);
    }
    r.nombre = n; cambios.forEach(x => { r.ejercicios[x[0]].series = x[1]; r.ejercicios[x[0]].repeticiones = x[2]; }); return true;
}

function guardarEdicionRutina(i, destino) {
    if (!leerEdicionRutina(i)) return; guardarDatos();
    if (destino === "selector") mostrarSelectorEjercicios(i);
    else if (destino === "entrenar") iniciarEntrenamientoEnVivo(i);
    else { aviso("Guardado."); mostrarRutinas(); }
}

function mostrarSelectorEjercicios(i) {
    contenido.innerHTML = `<h2>Añadir ejercicio</h2><input type="text" id="buscadorRutina" placeholder="Buscar..." oninput="filtrarEjerciciosParaRutina(${i})"><div id="selectorEjercicios"></div><button class="boton-texto texto-volver" onclick="verRutina(${i})" style="width:100%;margin-top:15px;">◀ Volver</button>`;
    filtrarEjerciciosParaRutina(i);
}

function filtrarEjerciciosParaRutina(i) {
    const l = document.getElementById("selectorEjercicios"); if (!l) return;
    const t = document.getElementById("buscadorRutina").value.toLowerCase();
    const e = obtenerEjercicios().filter(x => x.nombre.toLowerCase().includes(t));
    l.innerHTML = e.length === 0 ? "<p>No encontrado.</p>" : e.map(x => `<div class="tarjeta-ejercicio"><h3>${escaparHTML(x.nombre)}</h3><p>${escaparHTML(x.grupo)}</p><button class="boton-texto" onclick="mostrarFormularioSeries(${i}, '${x.id}')">Seleccionar</button></div>`).join("");
}

function elegirRutinaParaEjercicio(idE) {
    if (rutinas.length === 0) { alert("Crea una rutina primero."); mostrarRutinas(); return; }
    contenido.innerHTML = `<h2>Seleccionar rutina</h2><div id="selectorRutinas"></div><button class="boton-texto texto-volver" onclick="mostrarEjercicios()" style="width:100%;margin-top:15px;">Cancelar</button>`;
    document.getElementById("selectorRutinas").innerHTML = rutinas.map((r, i) => `<button class="tarjeta-rutina" style="width:100%; text-align:left;" onclick="mostrarFormularioSeries(${i}, '${idE}')"><strong>${escaparHTML(r.nombre)}</strong></button>`).join("");
}

function mostrarFormularioSeries(i, idE) {
    const e = obtenerEjercicios().find(x => x.id === idE); if (!e) return;
    contenido.innerHTML = `<h2>${escaparHTML(e.nombre)}</h2><label>Series</label><input type="number" id="seriesEjercicio" min="1" value="3"><label>Reps</label><input type="number" id="repeticionesEjercicio" min="1" value="12"><button onclick="confirmarAñadirEjercicio(${i}, '${idE}')" style="width:100%;margin-top:10px;">Guardar</button><button class="boton-texto texto-volver" onclick="verRutina(${i})" style="width:100%;margin-top:10px;">Cancelar</button>`;
}

function confirmarAñadirEjercicio(i, idE) {
    const s = parseInt(document.getElementById("seriesEjercicio").value); const r = parseInt(document.getElementById("repeticionesEjercicio").value);
    if (!s || !r) { alert("Valores inválidos."); return; }
    rutinas[i].ejercicios.push({ ejercicioId: idE, series: s, repeticiones: r }); guardarDatos(); verRutina(i);
}

function eliminarEjercicioRutina(i, pos) {
    confirmar("¿Quitar este ejercicio?", function() { leerEdicionRutina(i); rutinas[i].ejercicios.splice(pos, 1); guardarDatos(); verRutina(i); });
}

function iniciarEntrenamientoEnVivo(i) {
    const r = rutinas[i]; if (!r || r.ejercicios.length === 0) { aviso("Añade ejercicios."); return; }
    let html = `<h2>${escaparHTML(r.nombre)}</h2><p>Ajusta las reps.</p><div class="reloj reloj-compacto"><div id="tiempo">00:00</div><div class="grid-opciones-descanso"><button onclick="cronoDescanso(60)">60s</button><button onclick="cronoDescanso(90)">90s</button><button class="boton-pausar" onclick="cronoParar()">Parar</button></div></div>`;
    r.ejercicios.forEach((item, idx) => {
        const e = obtenerEjercicios().find(x => x.id === item.ejercicioId); if (!e) return;
        html += `<div class="tarjeta-ejercicio"><h3>${escaparHTML(e.nombre)}</h3><table style="width:100%; text-align:center; margin-top:10px;"><tr><th>Serie</th><th>Reps</th></tr>`;
        for (let s = 1; s <= item.series; s++) html += `<tr><td>#${s}</td><td><input type="number" id="reps_${idx}_${s}" value="${item.repeticiones}" style="width:70px; text-align:center;"></td></tr>`;
        html += `</table></div>`;
    });
    html += `<button style="width:100%;margin-top:20px;min-height:55px;background:#28a745;color:#fff;" onclick="finalizarEntrenamientoEnVivo(${i})">✔ Finalizar</button><button class="boton-texto texto-volver" onclick="verRutina(${i})" style="width:100%;margin-top:10px;">Cancelar</button>`;
    contenido.innerHTML = html; actualizarVistaCronometro();
}

function finalizarEntrenamientoEnVivo(i) {
    const r = rutinas[i]; if (!r) return;
    const detalle = []; let tS = 0, tR = 0;
    r.ejercicios.forEach((item, idx) => {
        const e = obtenerEjercicios().find(x => x.id === item.ejercicioId); if (!e) return;
        const series = [];
        for (let s = 1; s <= item.series; s++) {
            const inp = document.getElementById(`reps_${idx}_${s}`);
            const reps = parseInt(inp ? inp.value : 0) || 0;
            series.push({ reps }); tS++; tR += reps;
        }
        detalle.push({ ejercicioId: item.ejercicioId, nombre: e.nombre, series });
    });
    historial.push({ id: generarId(), fecha: obtenerFechaActual(), rutina: r.nombre, ejercicios: detalle.length, series: tS, repeticiones: tR, detalle });
    guardarDatos(); cronoReiniciar(); aviso(`¡Guardado! ${tS} series · ${tR} reps`); abrirDia(obtenerFechaActual());
}

/* ============ PROGRESO CORPORAL ============ */
const camposCuerpo = [{ clave: "peso", nombre: "Peso", unidad: "kg" }, { clave: "cintura", nombre: "Cintura", unidad: "cm" }, { clave: "pecho", nombre: "Pecho", unidad: "cm" }, { clave: "cadera", nombre: "Cadera", unidad: "cm" }];
const metricasGrafica = [camposCuerpo[0], { clave: "imc", nombre: "IMC", unidad: "" }, ...camposCuerpo.slice(1)];

function calcularIMC(p) { if (!alturaCm || !p) return null; const m = alturaCm / 100; return p / (m * m); }
function categoriaIMC(i) { if (i < 18.5) return "Bajo peso"; if (i < 25) return "Peso normal"; if (i < 30) return "Sobrepeso"; return "Obesidad"; }
function registrosOrdenados() { return medidasCuerpo.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)); }
function valorMetrica(r, c) { if (c === "imc") return calcularIMC(r.peso); const v = r[c]; return (typeof v === "number" && v > 0) ? v : null; }
function serieMetrica(c) { return registrosOrdenados().map(r => ({ fecha: r.fecha, valor: valorMetrica(r, c) })).filter(p => p.valor !== null); }
function obtenerUltimoPeso() { const s = serieMetrica("peso"); return s.length ? s[s.length - 1] : null; }
function cambioMetrica(c) { const s = serieMetrica(c); if (s.length < 2) return null; return { primero: s[0], ultimo: s[s.length - 1], cambio: s[s.length - 1].valor - s[0].valor }; }

function mostrarProgreso() {
    const pesos = serieMetrica("peso"); const uP = pesos.length ? pesos[pesos.length - 1] : null;
    const imc = uP ? calcularIMC(uP.valor) : null; const cinturas = serieMetrica("cintura"); const uC = cinturas.length ? cinturas[cinturas.length - 1] : null;
    const ica = (uC && alturaCm) ? uC.valor / alturaCm : null;
    contenido.innerHTML = `
        <span data-vista="progreso" hidden></span><h2>Progreso</h2>
        <button onclick="mostrarFormularioCuerpo()" style="width:100%;">+ Añadir registro</button>
        <div class="resumen-progreso">
            <div class="dato-resumen"><strong>${uP ? formatoNum(uP.valor) : "–"}</strong><span>Peso (kg)</span></div>
            <div class="dato-resumen"><strong>${imc ? formatoNum(imc) : "–"}</strong><span>${imc ? "IMC · " + categoriaIMC(imc) : "IMC"}</span></div>
            <div class="dato-resumen"><strong>${uC ? formatoNum(uC.valor) : "–"}</strong><span>Cintura (cm)</span></div>
            <div class="dato-resumen"><strong>${ica ? formatoNum(ica, 2) : "–"}</strong><span>Cintura/altura</span></div>
            <button class="dato-resumen dato-boton" onclick="mostrarFormularioAltura()" style="grid-column:1/-1;background:var(--bg-card);color:var(--text-main);"><strong>${alturaCm ? formatoNum(alturaCm) : "–"}</strong><span>Altura (cm)</span></button>
        </div>
        <h3>📈 Evolución</h3><div id="zonaGrafica">${htmlZonaGrafica()}</div>
        <h3>Registros</h3>${htmlRegistrosCuerpo()}
    `;
}

function htmlZonaGrafica() {
    const periodos = [[30, "1 mes"], [90, "3 meses"], [180, "6 meses"], [0, "Todo"]];
    return `<p class="titulo-chips">⏱ Periodo</p><div class="selector-chips">${periodos.map(p => `<button class="chip chip-tiempo ${p[0] === periodoActual ? "activo" : ""}" onclick="elegirPeriodo(${p[0]})">${p[1]}</button>`).join("")}</div><p class="titulo-chips">📏 Medida</p><div class="selector-chips">${metricasGrafica.map(m => `<button class="chip chip-medida ${m.clave === metricaActual ? "activo" : ""}" onclick="elegirMetrica('${m.clave}')">${m.nombre}</button>`).join("")}</div>${htmlGrafica()}`;
}

function elegirPeriodo(d) { periodoActual = d; actualizarGrafica(); }
function elegirMetrica(c) { metricaActual = c; actualizarGrafica(); }
function actualizarGrafica() { const z = document.getElementById("zonaGrafica"); if (z) z.innerHTML = htmlZonaGrafica(); }

function htmlGrafica() {
    const m = metricasGrafica.find(x => x.clave === metricaActual) || metricasGrafica[0];
    let p = serieMetrica(m.clave);
    if (periodoActual > 0) { const l = new Date(); l.setDate(l.getDate() - periodoActual); p = p.filter(x => x.fecha >= fechaATexto(l)); }
    if (p.length === 0) return `<div class="caja-grafica"><p>Sin registros.</p></div>`;
    const W = 320, H = 210, izq = 40, der = 14, arr = 18, aba = 30;
    const v = p.map(x => x.valor); let min = Math.min(...v); let max = Math.max(...v);
    if (min === max) { min -= 1; max += 1; }
    const marg = (max - min) * 0.15; min -= marg; max += marg;
    const t0 = textoAFecha(p[0].fecha).getTime(); const t1 = textoAFecha(p[p.length - 1].fecha).getTime();
    const xD = f => p.length === 1 || t1 === t0 ? izq + (W - izq - der) / 2 : izq + ((textoAFecha(f).getTime() - t0) / (t1 - t0)) * (W - izq - der);
    const yD = val => arr + (1 - (val - min) / (max - min)) * (H - arr - aba);
    let rej = "";
    for (let i = 0; i <= 3; i++) {
        const val = min + ((max - min) * i) / 3; const y = yD(val);
        rej += `<line class="grafica-rejilla" x1="${izq}" y1="${y.toFixed(1)}" x2="${W - der}" y2="${y.toFixed(1)}"/>`;
        rej += `<text class="grafica-texto" x="${izq - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end">${formatoNum(val, (max - min) > 10 ? 0 : 1)}</text>`;
    }
    const coords = p.map(x => ({ x: xD(x.fecha), y: yD(x.valor), valor: x.valor, fecha: x.fecha }));
    const line = coords.length > 1 ? `<polyline class="grafica-linea" points="${coords.map(c => c.x.toFixed(1) + "," + c.y.toFixed(1)).join(" ")}"/>` : "";
    const circ = coords.map(c => `<circle class="grafica-punto" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="4"/>`).join("");
    const eX = coords.length > 1 ? [coords[0], coords[coords.length - 1]] : [coords[0]];
    const eF = eX.map(c => `<text class="grafica-texto" x="${c.x.toFixed(1)}" y="${H - 8}" text-anchor="middle">${formatearFechaCorta(c.fecha)}</text>`).join("");
    return `<div class="caja-grafica"><svg class="grafica" viewBox="0 0 ${W} ${H}">${rej}${line}${circ}${eF}</svg></div>`;
}

function htmlRegistrosCuerpo() {
    const l = registrosOrdenados().reverse();
    if (l.length === 0) return "<p>No hay registros.</p>";
    return l.map(r => {
        const d = camposCuerpo.filter(c => typeof r[c.clave] === "number" && r[c.clave] > 0).map(c => `${c.nombre}: ${formatoNum(r[c.clave])} ${c.unidad}`).join(" · ");
        return `<div class="tarjeta-rutina"><h3>${formatearFecha(r.fecha)}</h3><p>${escaparHTML(d)}</p><button class="boton-texto" onclick="mostrarFormularioCuerpo('${r.id}')">Editar</button></div>`;
    }).join("");
}

function mostrarFormularioCuerpo(id) {
    cuerpoEditandoId = id || null; const r = id ? medidasCuerpo.find(x => x.id === id) : null; const f = r ? r.fecha : obtenerFechaActual();
    const c = camposCuerpo.map(x => { const s = serieMetrica(x.clave); const u = s.length ? s[s.length - 1].valor : null; return `<label>${x.nombre} (${x.unidad})</label><input type="number" step="0.1" id="cuerpo_${x.clave}" placeholder="${u ? "Último: " + formatoNum(u) : "Opcional"}" value="${(r && r[x.clave]) ? r[x.clave] : ""}">`; }).join("");
    contenido.innerHTML = `<h2>${r ? "Editar" : "Nuevo"} registro</h2><label>Fecha</label><input type="date" id="cuerpo_fecha" value="${f}">${c}<button onclick="guardarRegistroCuerpo()" style="width:100%;margin-top:10px;">Guardar</button><button class="boton-texto texto-volver" onclick="mostrarProgreso()" style="width:100%;margin-top:10px;">Cancelar</button>`;
}

function guardarRegistroCuerpo() {
    const f = document.getElementById("cuerpo_fecha").value; if (!f) { aviso("Elige fecha."); return; }
    const v = {}; let a = false; camposCuerpo.forEach(c => { const n = parseFloat(String(document.getElementById("cuerpo_" + c.clave).value).replace(",", ".")); if (n > 0 && n < 1000) { v[c.clave] = n; a = true; } });
    if (!a) { aviso("Rellena algo."); return; }
    const ex = medidasCuerpo.find(r => r.fecha === f && r.id !== cuerpoEditandoId);
    if (cuerpoEditandoId) { if (ex) { aviso("Fecha ocupada."); return; } const i = medidasCuerpo.findIndex(r => r.id === cuerpoEditandoId); if (i >= 0) medidasCuerpo[i] = Object.assign({ id: cuerpoEditandoId, fecha: f }, v); }
    else if (ex) Object.assign(ex, v); else medidasCuerpo.push(Object.assign({ id: generarId(), fecha: f }, v));
    cuerpoEditandoId = null; guardarDatos(); aviso("Guardado."); mostrarProgreso();
}

function mostrarFormularioAltura() {
    contenido.innerHTML = `<h2>Altura</h2><input type="number" id="inputAltura" placeholder="Ej: 175" value="${alturaCm || ""}"><button onclick="guardarAltura()" style="width:100%;margin-top:10px;">Guardar</button><button class="boton-texto texto-volver" onclick="mostrarProgreso()" style="width:100%;margin-top:10px;">Cancelar</button>`;
}

function guardarAltura() { const v = parseFloat(document.getElementById("inputAltura").value); if (!(v >= 100 && v <= 250)) { aviso("Entre 100 y 250 cm."); return; } alturaCm = v; guardarDatos(); mostrarProgreso(); }

/* =====================================================
   CRONÓMETRO, CALENDARIO, AJUSTES, TIEMPO, CARDIO, MÚSICA Y VÍDEO
===================================================== */

function mostrarCronometro() {
    contenido.innerHTML = `
        <span data-vista="cronometro" hidden></span><h2>Cronómetro</h2>
        <div class="reloj" id="relojNormal">
            <p id="etiquetaCrono">Parado</p><div id="tiempo">00:00</div>
            <div class="botones-reloj"><button class="boton-iniciar" onclick="cronoIniciar()">Iniciar</button><button class="boton-pausar" onclick="cronoParar()">Parar</button><button onclick="cronoReiniciar()">Reiniciar</button></div>
            <div class="seccion-descanso"><h3>Descanso</h3><div class="grid-opciones-descanso"><button onclick="cronoDescanso(30)">30s</button><button onclick="cronoDescanso(45)">45s</button><button onclick="cronoDescanso(60)">60s</button><button onclick="cronoDescanso(90)">90s</button></div></div>
        </div>
        <div class="reloj" id="relojCircuito" style="margin-top:20px;">
            <h3>⏱️ Circuito (HIIT / EMOM)</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
                <div><label>Trabajo (seg)</label><input type="number" id="circTrabajo" value="40" style="width:100%;padding:8px;"></div>
                <div><label>Descanso (seg)</label><input type="number" id="circDescanso" value="20" style="width:100%;padding:8px;"></div>
                <div style="grid-column:1/-1;"><label>Rondas</label><input type="number" id="circRondas" value="5" style="width:100%;padding:8px;"></div>
            </div>
            <button id="btnCircuito" class="boton-iniciar" onclick="iniciarCircuito()" style="margin-top:10px;width:100%;">▶ Iniciar Circuito</button>
            <div id="circDisplay" style="display:none;text-align:center;margin-top:15px;padding:15px;background:var(--bg-box);border-radius:10px;"><span id="circFase" style="font-size:18px;font-weight:bold;"></span><br><span id="circTiempo" style="font-size:48px;font-weight:bold;font-family:monospace;"></span></div>
        </div>
    `;
    actualizarVistaCronometro();
}

function cronoMsActual() { return cronoModo === "subida" ? cronoMs + (Date.now() - cronoInicio) : cronoMs; }
function cronoIniciar() { if (cronoModo === "subida") return; clearInterval(cronoIntervalo); if (cronoModo === "bajada") cronoMs = 0; cronoModo = "subida"; cronoColor = "verde"; cronoInicio = Date.now(); cronoIntervalo = setInterval(actualizarVistaCronometro, 250); actualizarVistaCronometro(); }
function cronoParar() { if (cronoModo === "subida") cronoMs += Date.now() - cronoInicio; else if (cronoModo === "bajada") cronoMs = 0; cronoModo = "parado"; cronoColor = "rojo"; clearInterval(cronoIntervalo); actualizarVistaCronometro(); }
function cronoReiniciar() { clearInterval(cronoIntervalo); cronoModo = "parado"; cronoColor = ""; cronoMs = 0; actualizarVistaCronometro(); }
function cronoDescanso(s) { clearInterval(cronoIntervalo); cronoMs = 0; cronoModo = "bajada"; cronoColor = "naranja"; cronoFin = Date.now() + s * 1000; cronoIntervalo = setInterval(actualizarVistaCronometro, 250); actualizarVistaCronometro(); }
function finDescanso() { clearInterval(cronoIntervalo); cronoModo = "parado"; cronoColor = ""; cronoMs = 0; actualizarVistaCronometro(); if (navigator.vibrate) navigator.vibrate([300, 150, 300]); aviso("⏱ ¡Descanso terminado!"); }
function actualizarVistaCronometro() {
    document.querySelectorAll(".reloj").forEach(c => { c.classList.remove("brillo-verde", "brillo-rojo", "brillo-naranja"); if (cronoColor && c.id !== "relojCircuito") c.classList.add("brillo-" + cronoColor); });
    let s; if (cronoModo === "bajada") { const r = Math.ceil((cronoFin - Date.now()) / 1000); if (r <= 0) { finDescanso(); return; } s = r; } else s = Math.floor(cronoMsActual() / 1000);
    const t = document.getElementById("tiempo"); if (t) t.innerText = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    const e = document.getElementById("etiquetaCrono"); if (e) e.innerText = cronoModo === "bajada" ? "Descansando…" : (cronoModo === "subida" ? "En marcha" : "Parado");
}

/* --- CIRCUITO --- */
let circIntervalo = null, circConfig = { trabajo: 40, descanso: 20, rondas: 5 }, circEstado = { ronda: 1, fase: 'trabajo', tiempo: 0 }, circPausado = false;

function iniciarCircuito() {
    const btn = document.getElementById("btnCircuito"), reloj = document.getElementById("relojCircuito");
    if (circIntervalo && !circPausado) { clearInterval(circIntervalo); circIntervalo = null; circPausado = true; btn.innerText = "▶ Reanudar Circuito"; btn.style.background = "#27864A"; reloj.className = "reloj brillo-naranja"; return; }
    if (circPausado) { circPausado = false; btn.innerText = "⏸ Pausar Circuito"; btn.style.background = "#E65100"; iniciarIntervaloCircuito(); return; }
    circConfig.trabajo = parseInt(document.getElementById('circTrabajo').value) || 40; circConfig.descanso = parseInt(document.getElementById('circDescanso').value) || 20; circConfig.rondas = parseInt(document.getElementById('circRondas').value) || 5;
    circEstado = { ronda: 1, fase: 'trabajo', tiempo: circConfig.trabajo };
    document.getElementById('circDisplay').style.display = 'block'; btn.innerText = "⏸ Pausar Circuito"; btn.style.background = "#E65100"; reloj.className = "reloj brillo-verde";
    actualizarVistaCircuito(); hablar("Circuito iniciado. Ronda 1."); if (navigator.vibrate) navigator.vibrate(500); iniciarIntervaloCircuito();
}

function iniciarIntervaloCircuito() {
    clearInterval(circIntervalo);
    circIntervalo = setInterval(() => {
        circEstado.tiempo--;
        if (circEstado.tiempo <= 0) {
            if (circEstado.fase === 'trabajo') {
                if (circEstado.ronda >= circConfig.rondas) {
                    clearInterval(circIntervalo); circIntervalo = null; document.getElementById('circFase').innerText = "¡Terminado!"; document.getElementById('circTiempo').innerText = "🎉";
                    document.getElementById('btnCircuito').innerText = "▶ Iniciar Circuito"; document.getElementById('btnCircuito').style.background = "#27864A"; document.getElementById('relojCircuito').className = "reloj"; hablar("¡Terminado!"); if (navigator.vibrate) navigator.vibrate([500, 200, 500]); return;
                }
                circEstado.fase = 'descanso'; circEstado.tiempo = circConfig.descanso; document.getElementById('relojCircuito').className = "reloj brillo-naranja"; hablar("Descanso."); if (navigator.vibrate) navigator.vibrate([300]);
            } else {
                circEstado.ronda++; circEstado.fase = 'trabajo'; circEstado.tiempo = circConfig.trabajo; document.getElementById('relojCircuito').className = "reloj brillo-verde"; hablar("Ronda " + circEstado.ronda + "."); if (navigator.vibrate) navigator.vibrate([500]);
            }
        }
        actualizarVistaCircuito();
    }, 1000);
}

function actualizarVistaCircuito() {
    const f = document.getElementById('circFase'), t = document.getElementById('circTiempo'); if (!f || !t) return;
    f.innerText = `Ronda ${circEstado.ronda}/${circConfig.rondas} · ${circEstado.fase === 'trabajo' ? 'TRABAJO' : 'DESCANSO'}`;
    f.style.color = circEstado.fase === 'trabajo' ? '#2ECC71' : '#FF9500'; t.innerText = formatoTiempo(circEstado.tiempo);
}

/* ============ CALENDARIO ============ */
const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const nombresDias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const leyendaCalendario = '<span class="leyenda" style="display:flex;flex-wrap:wrap;gap:8px 16px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:10px;margin-top:10px;"><span class="ley" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;"><i style="width:14px;height:14px;border-radius:4px;background:#2196F3;display:inline-block;"></i>Hoy</span><span class="ley" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;"><i style="width:18px;height:4px;border-radius:2px;background:#D9A514;display:inline-block;"></i>Entrenamiento</span><span class="ley" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;"><i style="width:18px;height:4px;border-radius:2px;background:#4FC3F7;display:inline-block;"></i>Anotación</span><span class="ley" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;"><i style="width:18px;height:4px;border-radius:2px;background:#E65100;display:inline-block;"></i>Cardio</span></span>';

function hayEntreno(f) { return historial.some(i => i.fecha === f); }
function hayNotas(f) { return Array.isArray(notasDias[f]) && notasDias[f].length > 0; }
function hayCarrera(f) { return carreras.some(c => c.fecha === f); }
function subirAlContenido() { if (contenido) contenido.scrollIntoView({ behavior: "smooth", block: "start" }); }

function mostrarCalendario() { anioActual = new Date().getFullYear(); mesActual = new Date().getMonth(); diaSeleccionado = null; verAnio(); }

function verAnio() {
    const hoy = new Date(); let meses = "";
    for (let m = 0; m < 12; m++) {
        const esActual = (m === hoy.getMonth() && anioActual === hoy.getFullYear());
        meses += `<button class="mini-mes ${esActual ? "mini-mes-actual" : ""}" onclick="verMes(${m})"><span class="mini-mes-titulo">${nombresMeses[m]}</span><span class="mini-mes-dias">${htmlMiniMes(anioActual, m)}</span></button>`;
    }
    contenido.innerHTML = `<span data-vista="calendario" hidden></span><h2>Calendario</h2><div class="navegacion-calendario" style="display:flex;justify-content:space-between;align-items:center;"><button class="boton-calendario-nav" style="background:#C62828;" onclick="cambiarAnio(-1)">◀</button><h3>${anioActual}</h3><button class="boton-calendario-nav" style="background:#C62828;" onclick="cambiarAnio(1)">▶</button></div><div class="anio-grid">${meses}</div><p class="texto-ultima">Toca un mes. ${leyendaCalendario}</p>`;
    subirAlContenido();
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

function verMes(m) { mesActual = m; diaSeleccionado = null; mostrarMes(); }

function mostrarMes() {
    contenido.innerHTML = `<button class="boton-volver-cal" onclick="verAnio()" style="background:var(--bg-card);color:var(--accent);border:1px solid var(--border-color);margin-bottom:12px;">◀ ${anioActual}</button><div class="navegacion-calendario" style="display:flex;justify-content:space-between;align-items:center;"><button class="boton-calendario-nav" style="background:#C62828;" onclick="cambiarMes(-1)">◀</button><h3>${nombresMeses[mesActual]} ${anioActual}</h3><button class="boton-calendario-nav" style="background:#C62828;" onclick="cambiarMes(1)">▶</button></div><div class="dias-semana" style="display:grid;grid-template-columns:repeat(7,1fr);text-align:center;margin:20px 0 10px;color:var(--accent);font-weight:bold;"><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div><div id="rejillaCalendario" style="display:grid;grid-template-columns:repeat(7,1fr);gap:7px;"></div><p class="texto-ultima" style="margin-top:15px;">${leyendaCalendario} Toca un día.</p>`;
    generarRejillaCalendario(); subirAlContenido();
}

function cambiarMes(d) { mesActual += d; if (mesActual > 11) { mesActual = 0; anioActual++; } if (mesActual < 0) { mesActual = 11; anioActual--; } mostrarMes(); }

function generarRejillaCalendario() {
    const r = document.getElementById("rejillaCalendario"); if (!r) return;
    const p = new Date(anioActual, mesActual, 1).getDay(); const tot = new Date(anioActual, mesActual + 1, 0).getDate(); const des = p === 0 ? 6 : p - 1; const hoy = obtenerFechaActual();
    let html = ""; for (let i = 0; i < des; i++) html += `<div class="dia-vacio" style="aspect-ratio:1/1;"></div>`;
    for (let d = 1; d <= tot; d++) {
        const f = fechaATexto(new Date(anioActual, mesActual, d)); let c = "dia-calendario"; if (f === hoy) c += " dia-hoy";
        let b = ""; if (hayEntreno(f)) b += '<span class="barra-entreno"></span>'; if (hayNotas(f)) b += '<span class="barra-nota"></span>'; if (hayCarrera(f)) b += '<span class="barra-carrera"></span>';
        html += `<button class="${c}" onclick="abrirDia('${f}')">${d}${b ? `<span class="barras-dia">${b}</span>` : ""}</button>`;
    }
    r.innerHTML = html;
}

function abrirDia(f) { const d = textoAFecha(f); anioActual = d.getFullYear(); mesActual = d.getMonth(); diaSeleccionado = f; notaEditandoId = null; mostrarDia(); subirAlContenido(); }
function cambiarDia(d) { const f = textoAFecha(diaSeleccionado); f.setDate(f.getDate() + d); abrirDia(fechaATexto(f)); }
function resumenEntreno(i) { let t = `${i.ejercicios} ejercicios`; const s = i.series ?? (i.detalle ? i.detalle.reduce((a, d) => a + d.series.length, 0) : null); if (s) t += ` · ${s} series`; return t; }
function htmlSeriesPlano(i) { if (!i.detalle || i.detalle.length === 0) return ""; return i.detalle.map(d => `<p><strong>${escaparHTML(d.nombre)}</strong><br>${d.series.map((s, x) => `Serie ${x + 1}: ${s.reps} reps`).join(" · ")}</p>`).join(""); }

function mostrarDia() {
    const f = diaSeleccionado; const d = textoAFecha(f); const e = historial.filter(i => i.fecha === f); const c = carreras.filter(x => x.fecha === f); const n = notasDias[f] || []; const ed = notaEditandoId ? n.find(x => x.id === notaEditandoId) : null;
    const hE = e.length === 0 ? "<p>No hay entrenamientos.</p>" : e.map(i => `<details class="tarjeta-rutina desplegable"><summary style="cursor:pointer;color:var(--text-main);"><strong>${escaparHTML(i.rutina)}</strong><br><span style="color:var(--text-muted);font-size:14px;">${resumenEntreno(i)}</span></summary>${htmlSeriesPlano(i)}<button class="boton-borrar" style="margin-top:10px;" onclick="eliminarHistorial('${i.id}')">🗑 Eliminar</button></details>`).join("");
    const hC = c.length === 0 ? "" : `<h3 style="margin-top:25px;">🏃 Carreras</h3>${c.map(x => `<div class="tarjeta-rutina"><p>${resumenCarrera(x)}</p><button class="boton-texto" onclick="verCarrera('${x.id}', 'dia')">Ver</button></div>`).join("")}`;
    const hN = n.length === 0 ? "<p>No hay anotaciones.</p>" : n.map(x => `<div class="nota-dia" onclick="editarNota('${x.id}')"><div class="nota-texto">${escaparHTML(x.texto)}</div><span style="opacity:0.7;">✏️</span></div>`).join("");
    contenido.innerHTML = `<button class="boton-volver-cal" onclick="mostrarMes()" style="background:var(--bg-card);color:var(--accent);border:1px solid var(--border-color);margin-bottom:12px;">◀ ${nombresMeses[mesActual]}</button><div class="navegacion-calendario" style="display:flex;justify-content:space-between;align-items:center;"><button class="boton-calendario-nav" style="background:#C62828;" onclick="cambiarDia(-1)">◀</button><div class="titulo-dia" style="text-align:center;"><h3 style="margin:0;">${d.getDate()} de ${nombresMeses[d.getMonth()].toLowerCase()}</h3><p style="margin:2px 0 0;">${nombresDias[d.getDay()]} ${d.getFullYear()}</p></div><button class="boton-calendario-nav" style="background:#C62828;" onclick="cambiarDia(1)">▶</button></div><h3 style="margin-top:20px;">🏋️ Entrenamientos</h3>${hE}${hC}<h3 style="margin-top:25px;">📝 Anotaciones</h3>${hN}<div class="tarjeta-rutina"><h3>${ed ? "Editar" : "Nueva"} anotación</h3><textarea id="notaTexto" placeholder="Ej: Dolor de hombro...">${ed ? escaparHTML(ed.texto) : ""}</textarea><button onclick="guardarNota()" style="width:100%;">${ed ? "Guardar" : "+ Añadir"}</button>${ed ? `<button class="boton-texto texto-volver" onclick="cancelarEdicionNota()" style="width:100%;margin-top:10px;">Cancelar</button><button class="boton-borrar" onclick="eliminarNota('${ed.id}')" style="width:100%;margin-top:10px;">🗑 Eliminar</button>` : ""}</div>`;
}

function guardarNota() { const t = document.getElementById("notaTexto").value.trim(); if (!t) { aviso("Escribe algo."); return; } if (!notasDias[diaSeleccionado]) notasDias[diaSeleccionado] = []; if (notaEditandoId) { const n = notasDias[diaSeleccionado].find(x => x.id === notaEditandoId); if (n) n.texto = t; } else notasDias[diaSeleccionado].push({ id: generarId(), texto: t }); notaEditandoId = null; guardarDatos(); aviso("Guardado."); mostrarDia(); }
function editarNota(id) { notaEditandoId = id; mostrarDia(); const c = document.getElementById("notaTexto"); if (c) { c.scrollIntoView({ behavior: "smooth", block: "center" }); c.focus(); } }
function cancelarEdicionNota() { notaEditandoId = null; mostrarDia(); }
function eliminarNota(id) { confirmar("¿Eliminar anotación?", function() { notasDias[diaSeleccionado] = (notasDias[diaSeleccionado] || []).filter(n => n.id !== id); if (notasDias[diaSeleccionado].length === 0) delete notasDias[diaSeleccionado]; notaEditandoId = null; guardarDatos(); aviso("Eliminada."); mostrarDia(); }); }
function eliminarHistorial(id) { confirmar("¿Eliminar entrenamiento?", function() { historial = historial.filter(i => i.id !== id); guardarDatos(); aviso("Eliminado."); if (diaSeleccionado) mostrarDia(); else verAnio(); }); }

/* ============ TIEMPO (WEATHER) ============ */
function mostrarTiempo() {
    contenido.innerHTML = `<span data-vista="tiempo" hidden></span><h2>El Tiempo 🌤️</h2><p>Consulta el clima antes de salir.</p><button onclick="pedirTiempoActual()" style="width:100%;background:#03A9F4;margin-bottom:15px;min-height:55px;font-size:16px;">📍 Consultar en mi ubicación</button><div id="resultadoTiempo" style="display:none;"></div>`;
}

function pedirTiempoActual() {
    const c = document.getElementById("resultadoTiempo"); if (!navigator.geolocation) { aviso("No hay GPS."); return; }
    c.style.display = "block"; c.innerHTML = `<p style="text-align:center;">Buscando...</p>`;
    navigator.geolocation.getCurrentPosition(function(pos) {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true`).then(r => r.json()).then(d => {
            const t = d.current_weather.temperature, v = d.current_weather.windspeed, cod = d.current_weather.weathercode;
            let i = "🌤️", txt = "Despejado";
            if ([0, 1].includes(cod)) { i = "☀️"; txt = "Soleado"; } else if ([2, 3].includes(cod)) { i = "☁️"; txt = "Nublado"; } else if ([45, 48].includes(cod)) { i = "🌫️"; txt = "Niebla"; } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(cod)) { i = "🌧️"; txt = "Lluvia"; } else if ([71, 73, 75, 77, 85, 86].includes(cod)) { i = "❄️"; txt = "Nieve"; } else if ([95, 96, 99].includes(cod)) { i = "⛈️"; txt = "Tormenta"; }
            let col = "#27864A", cons = "Buen tiempo para entrenar.";
            if (t < 10) { col = "#1565C0"; cons = "Hace frío. Abrígate."; } else if (t > 25) { col = "#E65100"; cons = "Hace calor. Lleva agua."; }
            c.innerHTML = `<div class="tarjeta-rutina" style="text-align:center;border-left:5px solid ${col};"><div style="font-size:60px;margin:10px 0;">${i}</div><h3 style="font-size:32px;margin:0;color:var(--text-main);">${t}°C</h3><p style="font-size:18px;color:var(--text-muted);margin:5px 0;">${txt}</p><p style="font-size:16px;color:var(--text-muted);">💨 Viento: ${v} km/h</p><hr style="border-color:var(--border-color);margin:15px 0;"><p style="font-weight:bold;color:${col};font-size:16px;">${cons}</p></div>`;
        }).catch(() => { c.innerHTML = `<p style="text-align:center;color:red;">No se pudo obtener el tiempo.</p>`; });
    }, function() { c.innerHTML = `<p style="text-align:center;color:red;">Activa la ubicación.</p>`; });
}

/* ============ CARDIO ============ */
const tiposCardio = {
    correr: { nombre: "Correr", icono: "🏃", gps: true, ritmo: true }, caminar: { nombre: "Caminar", icono: "🚶", gps: true, ritmo: true }, senderismo: { nombre: "Senderismo", icono: "🥾", gps: true, ritmo: true }, bicicleta: { nombre: "Bicicleta", icono: "🚴", gps: true, ritmo: false }, estatica: { nombre: "Bici estática", icono: "🚲", gps: false, ritmo: false, met: 7 }, eliptica: { nombre: "Elíptica", icono: "🏋️", gps: false, ritmo: false, met: 5 }, remo: { nombre: "Remo", icono: "🚣", gps: false, ritmo: false, met: 7 }, comba: { nombre: "Comba", icono: "🤸", gps: false, ritmo: false, met: 11 }, natacion: { nombre: "Natación", icono: "🏊", gps: false, ritmo: false, met: 8 }
};

function tipoDe(c) { return tiposCardio[c.tipo] ? c.tipo : "correr"; }
function pesoCalorias() { const u = obtenerUltimoPeso(); return u ? u.valor : 70; }
function velocidadKmh(s, d) { return (s > 0 && d > 0) ? (d / 1000) / (s / 3600) : 0; }
function metCardio(t, v) { if (t === "correr") return v > 0 ? Math.max(6, Math.min(18, v)) : 9.8; if (t === "caminar") return v <= 0 ? 3.5 : v < 4.5 ? 3.0 : v < 5.2 ? 3.5 : v < 6 ? 4.3 : 5.0; if (t === "senderismo") return 6.0; if (t === "bicicleta") return v <= 0 ? 8.0 : v < 16 ? 4.0 : v < 19 ? 6.8 : v < 22 ? 8.0 : v < 25 ? 10.0 : v < 30 ? 12.0 : 15.8; return tiposCardio[t].met || 6; }
function calcularCalorias(t, s, d, p) { return Math.round(metCardio(t, velocidadKmh(s, d)) * p * (s / 3600)); }
function caloriasDe(c) { return typeof c.calorias === "number" ? c.calorias : calcularCalorias(tipoDe(c), c.duracion || 0, c.distancia || 0, pesoCalorias()); }

function nuevoEstadoCorrer() { return { estado: "parado", tipo: "correr", inicio: 0, acumMs: 0, distM: 0, puntos: [], parciales: [], ultimoKm: 0, watchId: null, intervalo: null, ultimaPos: null, precision: null, gps: "", avisoDenegado: false, wakeLock: null }; }
function haversine(a, b) { const R = 6371000, r = Math.PI / 180; const dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r; const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
function formatoTiempo(s) { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}`; }
function formatoRitmo(s) { if (!isFinite(s) || s <= 0 || s > 3600) return "–"; const t = Math.round(s); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; }
function formatoKm(k) { return k.toFixed(2).replace(".", ","); }
function tiempoCorrerMs() { return correr.estado === "corriendo" ? correr.acumMs + (Date.now() - correr.inicio) : correr.acumMs; }

function textoPermisoGps() { return "La ubicación está bloqueada.\n\n1. Chrome: ⋮ › Configuración › Configuración del sitio › Ubicación.\n2. Ajustes del móvil › Ubicación: actívala.\n3. Ajustes › Aplicaciones › Chrome › Permisos › Ubicación.\n\nVuelve y pulsa «Comprobar GPS»."; }
function textoGps() { if (correr.estado === "parado") return "El GPS se activa al empezar."; if (correr.estado === "pausado") return "En pausa."; if (correr.gps === "sinGps") return "Sin GPS: se mide tiempo y calorías."; if (correr.gps === "no") return "Este navegador no tiene GPS."; if (correr.gps === "denegado") return "🚫 Ubicación bloqueada. Pulsa «Comprobar GPS»."; if (correr.gps === "debil") return `Señal débil${correr.precision ? " (±" + Math.round(correr.precision) + " m)" : ""}.`; if (correr.gps === "ok") return `GPS activo · ±${Math.round(correr.precision || 0)} m`; return "Buscando GPS…"; }

async function comprobarGps() {
    if (!navigator.geolocation) { informar("No hay GPS."); return; } if (!window.isSecureContext) { informar("Necesita https."); return; }
    try { if (navigator.permissions && navigator.permissions.query) { const p = await navigator.permissions.query({ name: "geolocation" }); if (p.state === "denied") { informar(textoPermisoGps()); return; } } } catch (e) {}
    aviso("Buscando GPS…");
    navigator.geolocation.getCurrentPosition(function(pos) {
        aviso(`✅ GPS OK. Precisión: ±${Math.round(pos.coords.accuracy)} m.`);
        if (correr.estado === "corriendo" && correr.gps === "denegado") { detenerGps(); correr.avisoDenegado = false; iniciarGps(); aviso("GPS reactivado."); }
    }, function(e) { if (e.code === 1) informar(textoPermisoGps()); else if (e.code === 2) informar("No hay señal GPS. Sal al exterior."); else informar("Tarda demasiado."); }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
}

function elegirTipoCardio(c) { tipoCardio = c; mostrarCorrer(); }

function mostrarCorrer() {
    const total = carreras.reduce((t, c) => t + (c.distancia || 0), 0) / 1000; const kcal = carreras.reduce((t, c) => t + caloriasDe(c), 0); const tipo = correr.estado === "parado" ? tipoCardio : correr.tipo; const t = tiposCardio[tipo];
    let b = correr.estado === "parado" ? `<button class="boton-iniciar ancho-completo" onclick="empezarCorrer()">▶ Empezar</button>` : correr.estado === "corriendo" ? `<button style="background:#E65100;" onclick="pausarCorrer()">⏸ Pausar</button><button class="boton-pausar" onclick="terminarCorrer()">⏹ Terminar</button>` : `<button class="boton-iniciar" onclick="continuarCorrer()">▶ Continuar</button><button class="boton-pausar" onclick="terminarCorrer()">⏹ Terminar</button>`;
    const sel = correr.estado === "parado" ? `<div class="selector-chips">${Object.keys(tiposCardio).map(k => `<button class="chip ${k === tipoCardio ? "activo" : ""}" onclick="elegirTipoCardio('${k}')">${tiposCardio[k].icono} ${tiposCardio[k].nombre}</button>`).join("")}</div>` : `<h3>${t.icono} ${t.nombre}</h3>`;
    const cG = t.gps ? `<div><strong id="correrDist">0,00</strong><span>km</span></div><div><strong id="correrRitmo">–</strong><span>${t.ritmo ? "min/km" : "km/h"}</span></div>` : "";
    contenido.innerHTML = `<span data-vista="correr" hidden></span><h2>Cardio 🏃</h2><div class="panel-correr">${sel}<p id="correrGps" class="texto-ultima"></p><div class="correr-grande" id="correrTiempo">00:00</div><div class="correr-datos">${cG}<div class="ancho"><strong id="correrKcal">0</strong><span>kcal</span></div></div><div class="botones-correr">${b}</div>${t.gps ? `<button class="boton-texto" style="margin-top:8px;" onclick="comprobarGps()">📡 Comprobar GPS</button>` : ""}<label class="fila-check"><input type="checkbox" ${vozCorrer ? "checked" : ""} onchange="cambiarVoz(this.checked)">Avisar por voz cada km</label><p class="texto-ultima">Calorías calculadas con ${obtenerUltimoPeso() ? formatoNum(pesoCalorias()) + " kg" : "70 kg"}.</p></div><button onclick="mostrarFormularioCarrera()" style="width:100%;">+ Añadir actividad manual</button><div class="resumen-progreso"><div class="dato-resumen"><strong>${carreras.length}</strong><span>Actividades</span></div><div class="dato-resumen"><strong>${formatoKm(total)}</strong><span>Km</span></div><div class="dato-resumen" style="grid-column:1/-1;"><strong>${kcal}</strong><span>kcal totales</span></div></div><h3>Mis actividades</h3>${htmlListaCarreras()}`;
    actualizarVistaCorrer();
}

function cambiarVoz(a) { vozCorrer = a; guardarDatos(); }
function actualizarVistaCorrer() { const t = document.getElementById("correrTiempo"); if (!t) return; const tipo = correr.estado === "parado" ? tipoCardio : correr.tipo; const tp = tiposCardio[tipo]; const s = Math.floor(tiempoCorrerMs() / 1000); const km = correr.distM / 1000; t.innerText = formatoTiempo(s); const d = document.getElementById("correrDist"); if (d) d.innerText = formatoKm(km); const r = document.getElementById("correrRitmo"); if (r) r.innerText = km <= 0.05 ? "–" : tp.ritmo ? formatoRitmo(s / km) : formatoNum(km / (s / 3600)); const k = document.getElementById("correrKcal"); if (k) k.innerText = calcularCalorias(tipo, s, correr.distM, pesoCalorias()); const g = document.getElementById("correrGps"); if (g) g.innerText = textoGps(); }

function iniciarTickCorrer() { clearInterval(correr.intervalo); correr.intervalo = setInterval(actualizarVistaCorrer, 1000); }
function iniciarGps() { if (!tiposCardio[correr.tipo].gps) { correr.gps = "sinGps"; return; } if (!navigator.geolocation) { correr.gps = "no"; return; } correr.gps = "buscando"; correr.ultimaPos = null; correr.watchId = navigator.geolocation.watchPosition(posicionCorrer, errorGps, { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 }); }
function detenerGps() { if (correr.watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(correr.watchId); correr.watchId = null; }
function errorGps(e) { if (e && e.code === 1) { correr.gps = "denegado"; if (!correr.avisoDenegado) { correr.avisoDenegado = true; informar(textoPermisoGps()); } } else correr.gps = "debil"; actualizarVistaCorrer(); }

function posicionCorrer(p) {
    if (correr.estado !== "corriendo") return;
    correr.precision = p.coords.accuracy;
    if (p.coords.accuracy > 35) { correr.gps = "debil"; actualizarVistaCorrer(); return; }
    correr.gps = "ok"; const act = [p.coords.latitude, p.coords.longitude];
    if (!correr.ultimaPos) { correr.ultimaPos = { p: act, t: p.timestamp }; correr.puntos.push(act); actualizarVistaCorrer(); return; }
    const d = haversine(correr.ultimaPos.p, act); const dt = (p.timestamp - correr.ultimaPos.t) / 1000; const vM = correr.tipo === "bicicleta" ? 25 : 12;
    if (d < 4 || (dt > 0 && d / dt > vM)) { actualizarVistaCorrer(); return; }
    correr.distM += d; correr.puntos.push(act); correr.ultimaPos = { p: act, t: p.timestamp }; comprobarKm(); actualizarVistaCorrer();
}

function comprobarKm() { const km = Math.floor(correr.distM / 1000); while (correr.ultimoKm < km) { correr.ultimoKm++; const s = Math.round(tiempoCorrerMs() / 1000); correr.parciales.push(s); hablar(`Kilómetro ${correr.ultimoKm}. Tiempo ${textoHablado(s)}.`); } }
function textoHablado(s) { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h > 0 ? `${h} hora${h > 1 ? "s" : ""} ${m} minutos` : `${m} minutos ${x} segundos`; }
function hablar(t) { if (!vozCorrer || !window.speechSynthesis) return; try { const f = new SpeechSynthesisUtterance(t); f.lang = "es-ES"; window.speechSynthesis.cancel(); window.speechSynthesis.speak(f); } catch (e) {} }
async function pedirPantallaActiva() { try { if ("wakeLock" in navigator) correr.wakeLock = await navigator.wakeLock.request("screen"); } catch (e) {} }
function liberarPantalla() { try { if (correr.wakeLock) { correr.wakeLock.release(); correr.wakeLock = null; } } catch (e) {} }
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && correr.estado === "corriendo") pedirPantallaActiva(); });

function empezarCorrer() { const t = tipoCardio; correr = nuevoEstadoCorrer(); correr.tipo = t; correr.estado = "corriendo"; correr.inicio = Date.now(); iniciarGps(); iniciarTickCorrer(); pedirPantallaActiva(); hablar(tiposCardio[t].nombre + " iniciado."); mostrarCorrer(); }
function pausarCorrer() { if (correr.estado !== "corriendo") return; correr.acumMs += Date.now() - correr.inicio; correr.estado = "pausado"; detenerGps(); clearInterval(correr.intervalo); liberarPantalla(); mostrarCorrer(); }
function continuarCorrer() { if (correr.estado !== "pausado") return; correr.estado = "corriendo"; correr.inicio = Date.now(); correr.ultimaPos = null; iniciarGps(); iniciarTickCorrer(); pedirPantallaActiva(); mostrarCorrer(); }
function simplificarRuta(p) { const max = 500, paso = Math.max(1, Math.ceil(p.length / max)), r = []; for (let i = 0; i < p.length; i += paso) r.push([Math.round(p[i][0] * 100000) / 100000, Math.round(p[i][1] * 100000) / 100000]); const u = p[p.length - 1]; if (u && p.length > 1 && (p.length - 1) % paso !== 0) r.push([Math.round(u[0] * 100000) / 100000, Math.round(u[1] * 100000) / 100000]); return r; }

function terminarCorrer() { if (correr.estado === "parado") return; const d = Math.round(tiempoCorrerMs() / 1000); confirmar("¿Terminar y guardar?", () => guardarCarreraTerminada(d)); }

function guardarCarreraTerminada(d) {
    detenerGps(); clearInterval(correr.intervalo); liberarPantalla();
    if (d < 10) { correr = nuevoEstadoCorrer(); aviso("Actividad muy corta."); mostrarCorrer(); return; }
    const c = { id: generarId(), tipo: correr.tipo, fecha: obtenerFechaActual(), duracion: d, distancia: Math.round(correr.distM), calorias: calcularCalorias(correr.tipo, d, correr.distM, pesoCalorias()), ruta: simplificarRuta(correr.puntos), parciales: correr.parciales, origen: tiposCardio[correr.tipo].gps ? "gps" : "tiempo" };
    carreras.push(c); guardarDatos(); correr = nuevoEstadoCorrer(); hablar("Actividad terminada."); aviso("¡Guardada!"); verCarrera(c.id, "correr");
}

function resumenCarrera(c) { const t = tiposCardio[tipoDe(c)]; const km = (c.distancia || 0) / 1000; const p = [`${t.icono} ${t.nombre}`]; if (km > 0) p.push(formatoKm(km) + " km"); p.push(formatoTiempo(c.duracion)); if (km > 0) p.push(t.ritmo ? formatoRitmo(c.duracion / km) + " min/km" : formatoNum(velocidadKmh(c.duracion, c.distancia)) + " km/h"); p.push(caloriasDe(c) + " kcal"); return p.join(" · "); }

function htmlListaCarreras() { const l = carreras.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)); return l.length === 0 ? "<p>No hay actividades.</p>" : l.map(c => `<div class="tarjeta-rutina"><h3>${formatearFecha(c.fecha)}</h3><p>${resumenCarrera(c)}</p><button class="boton-texto" onclick="verCarrera('${c.id}', 'correr')">Ver</button></div>`).join(""); }

function htmlRuta(r) {
    if (!r || r.length < 2) return `<p class="texto-ultima">No hay ruta GPS.</p>`;
    const W = 320, H = 240, pad = 22; const la = r.map(p => p[0]), lo = r.map(p => p[1]);
    const miLa = Math.min(...la), maLa = Math.max(...la), miLo = Math.min(...lo), maLo = Math.max(...lo); const cos = Math.cos(((miLa + maLa) / 2) * Math.PI / 180);
    const w = (maLo - miLo) * cos || 0.00001, h = (maLa - miLa) || 0.00001; const esc = Math.min((W - 2 * pad) / w, (H - 2 * pad) / h);
    const oX = (W - w * esc) / 2, oY = (H - h * esc) / 2; const pt = p => [oX + (p[1] - miLo) * cos * esc, oY + (maLa - p[0]) * esc];
    const p = r.map(x => pt(x).map(v => v.toFixed(1)).join(",")).join(" "); const ini = pt(r[0]), fin = pt(r[r.length - 1]);
    return `<div class="caja-grafica"><svg class="grafica" viewBox="0 0 ${W} ${H}"><polyline class="ruta-linea" points="${p}"/><circle class="ruta-inicio" cx="${ini[0].toFixed(1)}" cy="${ini[1].toFixed(1)}" r="6"/><circle class="ruta-fin" cx="${fin[0].toFixed(1)}" cy="${fin[1].toFixed(1)}" r="6"/></svg></div>`;
}

function verCarrera(id, origen) {
    origenCarrera = origen || "correr"; const c = carreras.find(x => x.id === id); if (!c) { mostrarCorrer(); return; }
    const t = tiposCardio[tipoDe(c)]; const km = (c.distancia || 0) / 1000; const cel = [];
    if (km > 0) cel.push(`<div class="dato-resumen"><strong>${formatoKm(km)}</strong><span>Km</span></div>`);
    cel.push(`<div class="dato-resumen"><strong>${formatoTiempo(c.duracion)}</strong><span>Tiempo</span></div>`);
    if (km > 0) cel.push(`<div class="dato-resumen"><strong>${t.ritmo ? formatoRitmo(c.duracion / km) : formatoNum(velocidadKmh(c.duracion, c.distancia))}</strong><span>${t.ritmo ? "min/km" : "km/h"}</span></div>`);
    cel.push(`<div class="dato-resumen"><strong>${caloriasDe(c)}</strong><span>kcal</span></div>`);
    const parc = (c.parciales && c.parciales.length > 0) ? `<h3>Tiempo por km</h3>` + c.parciales.map((s, i) => `<p>Km ${i + 1}: <strong>${formatoTiempo(s - (i > 0 ? c.parciales[i - 1] : 0))}</strong></p>`).join("") : "";
    contenido.innerHTML = `<button class="boton-volver-cal" onclick="volverDeCarrera()" style="background:var(--bg-card);color:var(--accent);border:1px solid var(--border-color);margin-bottom:12px;">◀ Volver</button><h2>${t.icono} ${t.nombre} · ${formatearFecha(c.fecha)}</h2><div class="resumen-progreso">${cel.join("")}</div>${t.gps ? htmlRuta(c.ruta) : ""}${parc}<button class="boton-texto texto-rojo" style="margin-top:20px;" onclick="eliminarCarrera('${c.id}')">🗑 Eliminar actividad</button>`;
    subirAlContenido();
}

function volverDeCarrera() { if (origenCarrera === "dia" && diaSeleccionado) mostrarDia(); else mostrarCorrer(); }
function eliminarCarrera(id) { confirmar("¿Eliminar actividad?", () => { carreras = carreras.filter(c => c.id !== id); guardarDatos(); aviso("Eliminada."); volverDeCarrera(); }); }

function mostrarFormularioCarrera() {
    contenido.innerHTML = `<h2>Actividad manual</h2><label>Actividad</label><select id="carTipo">${Object.keys(tiposCardio).map(k => `<option value="${k}" ${k === tipoCardio ? "selected" : ""}>${tiposCardio[k].icono} ${tiposCardio[k].nombre}</option>`).join("")}</select><label>Fecha</label><input type="date" id="carFecha" value="${obtenerFechaActual()}"><label>Km</label><input type="number" step="0.01" id="carKm" placeholder="Ej: 5,2"><label>Horas</label><input type="number" id="carH" value="0"><label>Minutos</label><input type="number" id="carM" value="0"><label>Segundos</label><input type="number" id="carS" value="0"><button onclick="guardarCarreraManual()" style="width:100%;margin-top:10px;">Guardar</button><button class="boton-texto texto-volver" onclick="mostrarCorrer()" style="width:100%;margin-top:10px;">Cancelar</button>`;
}

function guardarCarreraManual() {
    const t = document.getElementById("carTipo").value, f = document.getElementById("carFecha").value, km = parseFloat(String(document.getElementById("carKm").value).replace(",", ".")) || 0;
    const h = parseInt(document.getElementById("carH").value) || 0, m = parseInt(document.getElementById("carM").value) || 0, s = parseInt(document.getElementById("carS").value) || 0;
    const d = h * 3600 + m * 60 + s, dist = Math.round(km * 1000);
    if (!f || f > obtenerFechaActual()) { aviso("Fecha inválida."); return; }
    if (tiposCardio[t].gps && km <= 0) { aviso("Falta distancia."); return; }
    if (d <= 0) { aviso("Falta tiempo."); return; }
    carreras.push({ id: generarId(), tipo: t, fecha: f, duracion: d, distancia: dist, calorias: calcularCalorias(t, d, dist, pesoCalorias()), ruta: [], parciales: [], origen: "manual" }); guardarDatos(); aviso("Guardada."); mostrarCorrer();
}

/* ============ MÚSICA Y PODCASTS (LOCAL) ============ */
let dbAudio;
function initAudioDB(cb) {
    if (dbAudio) { cb(); return; }
    const r = indexedDB.open("EntrenamientoAudioDB", 1);
    r.onupgradeneeded = e => { dbAudio = e.target.result; if (!dbAudio.objectStoreNames.contains("audios")) dbAudio.createObjectStore("audios", { keyPath: "id" }); };
    r.onsuccess = e => { dbAudio = e.target.result; cb(); };
    r.onerror = () => aviso("Error al iniciar audio.");
}

function mostrarMusica(pestanaActiva) {
    pestanaActiva = pestanaActiva || "musica"; const esP = pestanaActiva === "podcasts";
    const filt = listasMusica.filter(l => l.categoria === pestanaActiva);
    
    const tarjetas = filt.length === 0 
        ? `<p style="text-align:center;">No hay listas guardadas.</p>` 
        : filt.map(l => `
            <div class="tarjeta-rutina" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="verListaLocal('${l.id}', '${pestanaActiva}')">
                <h3 style="margin: 0;">${esP ? "🎙" : "🎵"} ${escaparHTML(l.nombre)}</h3>
                <span style="color: var(--accent); font-size: 24px; font-weight: bold;">▸</span>
            </div>
        `).join("");

    contenido.innerHTML = `
        <span data-vista="musica" hidden></span>
        <h2>${esP ? "Podcasts" : "Música"} 🎵</h2>
        <div class="filtros-ejercicios" style="margin-bottom:15px;">
            // En la función mostrarMusica, busca esto:
${esP 
    ? `<button onclick="abrirEnlace('https://www.ivoox.com')" style="width:100%; background:#E65100; margin-top:10px; min-height:50px;">▶ Abrir iVoox</button>`
    : `<button onclick="abrirEnlace('https://music.youtube.com')" style="width:100%; background:#27864A; margin-top:10px; min-height:50px;">▶ Abrir Música</button>`
}
        </div>
        <button onclick="crearListaLocal('${pestanaActiva}')" style="width:100%;background:#27864A;margin-bottom:15px;min-height:50px;">+ Crear lista de ${esP ? "podcasts" : "música"}</button>
        <h3>Mis listas</h3>
        ${tarjetas}
    `;
}

function crearListaLocal(cat) { const n = prompt("Nombre de la lista:"); if (!n || !n.trim()) return; listasMusica.push({ id: "lista_" + Date.now(), nombre: n.trim(), categoria: cat }); guardarDatos(); mostrarMusica(cat); }

function eliminarListaLocal(id, cat) {
    confirmar("¿Eliminar esta lista?", () => {
        listasMusica = listasMusica.filter(l => l.id !== id);
        initAudioDB(() => {
            const tx = dbAudio.transaction("audios", "readwrite"), st = tx.objectStore("audios"), rq = st.getAll();
            rq.onsuccess = () => { rq.result.forEach(a => { if (a.listaId === id) st.delete(a.id); }); };
        });
        guardarDatos(); mostrarMusica(cat);
    });
}

function verListaLocal(id, cat) {
    const l = listasMusica.find(x => x.id === id); if (!l) return;
    initAudioDB(() => {
        const rq = dbAudio.transaction("audios", "readonly").objectStore("audios").getAll();
        rq.onsuccess = () => {
            const auds = rq.result.filter(a => a.listaId === id);
            const h = auds.length === 0 ? `<p>Lista vacía.</p>` : auds.map(a => `
                <div class="enlace-lista">
                    <strong>${escaparHTML(a.nombre)}</strong>
                    <button class="btn-mini" onclick="reproducirLocal('${a.id}')" style="background:var(--accent);">▶</button>
                    <button class="btn-mini" onclick="borrarAudioLocal('${a.id}', '${id}', '${cat}')" style="background:#C62828;">🗑</button>
                </div>
            `).join("");

            // AQUÍ: Hemos añadido el botón de "Eliminar esta lista" al final de todo
            contenido.innerHTML = `
                <button class="boton-texto texto-volver" onclick="mostrarMusica('${cat}')">◀ Volver</button>
                <h2>${escaparHTML(l.nombre)}</h2>
                <button onclick="añadirAudiosALista('${id}', '${cat}')" style="width:100%;background:#27864A;margin-bottom:15px;">+ Añadir archivos</button>
                
                <div class="tarjeta-rutina" style="margin-bottom:15px;display:none;" id="cajaReproductorLista">
                    <audio id="playerLista" controls autoplay style="width:100%;"></audio>
                </div>
                
                <div class="tarjeta-rutina">${h}</div>
                
                <button class="boton-borrar" onclick="eliminarListaLocal('${id}', '${cat}')" style="width:100%; margin-top:20px; min-height:50px;">
                    🗑 Eliminar esta lista entera
                </button>
            `;
        };
    });
}

function añadirAudiosALista(idL, cat) {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = "audio/*"; inp.multiple = true;
    inp.onchange = () => {
        const fs = Array.from(inp.files); if (fs.length === 0) return;
        initAudioDB(() => {
            const tx = dbAudio.transaction("audios", "readwrite"), st = tx.objectStore("audios");
            fs.forEach(f => st.put({ id: "audio_" + Date.now() + "_" + Math.floor(Math.random() * 1000), listaId: idL, nombre: f.name, blob: f }));
            tx.oncomplete = () => { aviso("✅ Añadidos."); verListaLocal(idL, cat); };
        });
    }; inp.click();
}

function reproducirLocal(idA) {
    initAudioDB(() => {
        const rq = dbAudio.transaction("audios", "readonly").objectStore("audios").get(idA);
        rq.onsuccess = () => {
            const a = rq.result; if (!a) return;
            const c = document.getElementById("cajaReproductorLista"), p = document.getElementById("playerLista");
            p.src = URL.createObjectURL(a.blob); c.style.display = "block"; p.play();
        };
    });
}

function borrarAudioLocal(idA, idL, cat) {
    confirmar("¿Quitar esta canción?", () => {
        initAudioDB(() => {
            const tx = dbAudio.transaction("audios", "readwrite"); tx.objectStore("audios").delete(idA);
            tx.oncomplete = () => { aviso("Eliminada."); verListaLocal(idL, cat); };
        });
    });
}

/* ============ VÍDEOS (YOUTUBE MINI-PLAYER) ============ */
function detectarTipoVideo(url) {
    let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    return m ? { tipo: "youtube", id: m[1] } : { tipo: "desconocido", src: url };
}

function mostrarVideos() {
    const listaGuardados = videosGuardados.length === 0 
        ? `<p>No hay vídeos guardados.</p>` 
        : videosGuardados.map(v => `
            <div class="tarjeta-rutina">
                <h3>🎥 ${escaparHTML(v.nombre)}</h3>
                <button class="boton-texto" onclick="reproducirGuardado('${v.id}')">▶ Reproducir aquí</button>
                <button class="boton-texto texto-rojo" onclick="eliminarVideo('${v.id}')">🗑 Eliminar</button>
            </div>
        `).join("");

    contenido.innerHTML = `
        <span data-vista="video" hidden></span>
        <h2>Vídeos 🎥</h2>
        
        <div class="tarjeta-rutina">
            <h3>Mini Reproductor Integrado</h3>
            <p>Pega el enlace de un vídeo de YouTube para verlo aquí mismo.</p>
            <input type="text" id="busquedaYT" placeholder="Pega el enlace de YouTube aquí..." style="width:100%; padding:12px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-box); color:var(--text-main); margin-bottom:10px;">
            <button onclick="buscarVideoIntegrado()" style="width:100%; background:#FF0000;">▶ Reproducir enlace</button>
            
            <div id="zonaReproductor" style="margin-top:20px; display:none;">
                <iframe id="iframeVideo" width="100%" height="240" src="" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen frameborder="0" style="border-radius:12px;"></iframe>
                <button class="boton-texto texto-volver" style="margin-top:10px;" onclick="document.getElementById('zonaReproductor').style.display='none'">✕ Cerrar reproductor</button>
            </div>
            
            <hr style="border-color:var(--border-color); margin:20px 0;">
            <button onclick="abrirEnlace('https://m.youtube.com/results?search_query=rutina+entrenamiento')" style="width:100%; background:#C62828; min-height:50px;">🔍 Buscar vídeos en YouTube</button>
        </div>

        <h3>Mis vídeos guardados</h3>
        ${listaGuardados}
        <button onclick="mostrarFormularioVideo()" style="width:100%; margin-top:15px;">+ Añadir vídeo por enlace</button>
    `;
}

function buscarVideoIntegrado() {
    const query = document.getElementById("busquedaYT").value.trim();
    if (!query) { alert("Pega un enlace primero."); return; }
    
    const info = detectarTipoVideo(query);
    
    if (info.tipo === "youtube") {
        document.getElementById("zonaReproductor").style.display = "block";
        document.getElementById("iframeVideo").src = `https://www.youtube.com/embed/${info.id}?autoplay=1`;
    } else {
        // Si no es un enlace válido, abrimos YouTube con la búsqueda
        abrirEnlace('https://m.youtube.com/results?search_query=' + encodeURIComponent(query));
    }
}

function buscarVideoIntegrado() {
    const query = document.getElementById("busquedaYT").value.trim();
    if (!query) { alert("Pega un enlace primero."); return; }
    
    const info = detectarTipoVideo(query);
    
    if (info.tipo === "youtube") {
        document.getElementById("zonaReproductor").style.display = "block";
        document.getElementById("iframeVideo").src = `https://www.youtube.com/embed/${info.id}?autoplay=1`;
    } else {
        // Si no es un enlace válido, abrimos YouTube con la búsqueda
        abrirEnlace('https://m.youtube.com/results?search_query=' + encodeURIComponent(query));
    }
}

// Función para buscar y reproducir en el mini-reproductor
function buscarVideoIntegrado() {
    const query = document.getElementById("busquedaYT").value.trim();
    if (!query) { alert("Escribe qué quieres buscar."); return; }
    
    // Como no podemos extraer un ID exacto de una búsqueda, abrimos YouTube integrado con la búsqueda
    // o abrimos la app nativa. El iframe de YouTube no permite búsquedas, solo IDs exactos.
    // Para hacerlo mágico, lo que hacemos es mandar al usuario a buscar, pero como quieres verlo aquí:
    
    const zona = document.getElementById("zonaReproductor");
    const iframe = document.getElementById("iframeVideo");
    
    // Buscaremos en un canal o usaremos la búsqueda general (YouTube no deja incrustar búsquedas, solo vídeos)
    // Así que esto abrirá el vídeo si es un enlace o te llevará a YouTube si es texto.
    // TRUCO: En vez de hacer un buscador complejo, si pegas un enlace lo saca, si no, abre la app.
    const info = detectarTipoVideo(query);
    
    if (info.tipo === "youtube") {
        iframe.src = `https://www.youtube.com/embed/${info.id}?autoplay=1`;
        zona.style.display = "block";
    } else {
        // Si es texto, abrimos la app de YouTube con la búsqueda
        const busquedaUrl = encodeURIComponent(query);
        abrirApp(`vnd.youtube://results?search_query=${busquedaUrl}`, `https://m.youtube.com/results?search_query=${busquedaUrl}`);
    }
}

function reproducirVideo(v) {
    const z = document.getElementById("zonaReproductor"); if (!z) return;
    const html = v.tipo === "youtube" ? `<iframe width="100%" height="240" src="https://www.youtube.com/embed/${v.id}?autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen frameborder="0" style="border-radius:12px;"></iframe>` : `<p>Enlace no válido.</p>`;
    z.innerHTML = `<div class="tarjeta-rutina"><h3>▶ ${escaparHTML(v.nombre)}</h3>${html}<button class="boton-texto texto-volver" style="margin-top:10px;" onclick="document.getElementById('zonaReproductor').innerHTML=''">✕ Cerrar</button></div>`;
    z.scrollIntoView({ behavior: "smooth", block: "start" });
}

function reproducirGuardado(id) { const v = videosGuardados.find(x => x.id === id); if (!v) return; reproducirVideo({ nombre: v.nombre, ...detectarTipoVideo(v.url) }); }

function mostrarFormularioVideo(id, prefillUrl) {
    videoEditandoId = id || null; 
    const v = id ? videosGuardados.find(x => x.id === id) : null;
    const urlValue = prefillUrl || (v ? v.url : "");
    const nombreValue = v ? v.nombre : (prefillUrl ? "Vídeo compartido" : "");

    contenido.innerHTML = `
        <h2>${v ? "Editar" : "Nuevo"} vídeo</h2>
        <label>Nombre</label>
        <input type="text" id="videoNombre" placeholder="Ej: Rutina de piernas" value="${escaparHTML(nombreValue)}">
        <label>Enlace de YouTube</label>
        <input type="url" id="videoUrl" placeholder="https://www.youtube.com/watch?v=..." value="${escaparHTML(urlValue)}">
        <div style="display:flex;gap:10px;margin-top:15px;">
            <button onclick="guardarVideo()" style="flex:1;">Guardar</button>
            <button class="boton-texto texto-volver" onclick="mostrarVideos()" style="flex:1;">Cancelar</button>
        </div>
    `;
}

function guardarVideo() {
    const n = document.getElementById("videoNombre").value.trim(), u = document.getElementById("videoUrl").value.trim();
    if (!n || !u) { alert("Pon nombre y enlace."); return; }
    if (videoEditandoId) { const v = videosGuardados.find(x => x.id === videoEditandoId); if (v) { v.nombre = n; v.url = u; } } else videosGuardados.push({ id: "video_" + Date.now(), nombre: n, url: u });
    guardarDatos(); videoEditandoId = null; mostrarVideos();
}

function eliminarVideo(id) { confirmar("¿Eliminar vídeo?", () => { videosGuardados = videosGuardados.filter(x => x.id !== id); guardarDatos(); mostrarVideos(); }); }

/* ============ AJUSTES Y ACTUALIZACIONES ============ */
let ajusteAbierto = "";
const paletaColores = [
    ["#2196F3","Azul"], ["#1565C0","Azul oscuro"], ["#03A9F4","Celeste"], ["#00BCD4","Turquesa"],
    ["#40C4FF","Azul cielo"], ["#6200EA","Violeta oscuro"], ["#B388FF","Violeta claro"],
    ["#00897B","Verde azulado"], ["#27864A","Verde"], ["#7CB342","Lima"],
    ["#00E676","Verde neón"], ["#69F0AE","Menta"], ["#18FFFF","Cian"],
    ["#D9A514","Amarillo"], ["#FFA000","Ámbar"], ["#FFEA00","Amarillo neón"],
    ["#E65100","Naranja"], ["#FF7043","Coral"], ["#FF6E40","Naranja neón"],
    ["#C62828","Rojo"], ["#E91E63","Rosa"], ["#F50057","Fucsia"], ["#880E4F","Granate"],
    ["#7E57C2","Morado"], ["#512DA8","Violeta"], ["#3F51B5","Índigo"],
    ["#607D8B","Gris azulado"], ["#795548","Marrón"], ["#000000","Negro"],
    ["#FFFFFF","Blanco"], ["#9E9E9E","Gris"]
];

function htmlPaleta(actual, funcion) {
    return `<div class="grupo-colores">${paletaColores.map(c => `<button class="muestra-color ${actual && c[0].toLowerCase() === actual.toLowerCase() ? "activo" : ""}" style="background:${c[0]};" onclick="${funcion}('${c[0]}')"></button>`).join("")}</div><label>Otro color</label><input type="color" value="${actual || "#2196F3"}" onchange="${funcion}(this.value)">`;
}

function mostrarAjustes() {
    const t = [["oscuro", "Oscuro"], ["oled", "Negro OLED"], ["claro", "Claro"]], l = [["pequenia", "Pequeña"], ["mediana", "Normal"], ["grande", "Grande"]];
    const nT = t.find(x => x[0] === temaActual)[1], nL = l.find(x => x[0] === letraActual)[1];
    const nC = (paletaColores.find(c => c[0].toLowerCase() === colorActual.toLowerCase()) || ["", "Personalizado"])[1];
    const hM = colorMenuGlobal !== "" || Object.keys(coloresMenu).length > 0, cO = menuSeleccionado === "todos" ? (colorMenuGlobal || colorActual) : colorDeBoton(menuSeleccionado);
    const btnO = (v, tx, ac, fn) => `<button class="boton-tema ${v === ac ? "activo" : ""}" onclick="${fn}('${v}')" style="background:var(--bg-card);border:2px solid ${v === ac ? "var(--accent)" : "var(--border-color)"};color:var(--text-main);padding:12px;border-radius:10px;width:100%;text-align:left;margin-top:10px;">${tx}</button>`;
    const aj = (k, ti, va, cu) => `<details class="ajuste" ${ajusteAbierto === k ? "open" : ""} ontoggle="if(this.open){ajusteAbierto='${k}'}else if(ajusteAbierto==='${k}'){ajusteAbierto=''}"><summary>${ti}<small>${va}</small></summary>${cu}</details>`;
    const chM = [["todos", "Todos"]].concat(botonesMenu).map(b => `<button class="chip chip-medida ${b[0] === menuSeleccionado ? "activo" : ""}" onclick="elegirBotonMenu('${b[0]}')">${b[1]}</button>`).join("");
    contenido.innerHTML = `<span data-vista="ajustes" hidden></span><h2>Ajustes</h2>
        ${aj("tema", "Tema visual", nT, `<div class="grupo-botones-temas">${t.map(x => btnO(x[0], x[1], temaActual, "cambiarTemaApp")).join("")}</div>`)}
        ${aj("letra", "Tamaño de letra", nL, `<div class="grupo-botones-temas">${l.map(x => btnO(x[0], x[1], letraActual, "cambiarTamanioLetra")).join("")}</div>`)}
        ${aj("color", "Color de diseño", nC, htmlPaleta(colorActual, "cambiarColorPrincipal"))}
        ${aj("menu", "Color de botones", hM ? "Personalizado" : "Como el diseño", `<p>Elige qué botón cambiar, o «Todos».</p><div class="selector-chips">${chM}</div><p>Cambiando: <strong>${menuSeleccionado === "todos" ? "todos" : botonesMenu.find(b => b[0] === menuSeleccionado)[1]}</strong></p>${htmlPaleta(cO, "cambiarColorBoton")}<button onclick="restaurarColoresMenu()" style="width:100%;margin-top:12px;">Usar color del diseño</button>`)}
        ${aj("base", "Ejercicios base", ejerciciosOcultos.length === 0 ? "Todos" : ejerciciosOcultos.length + " eliminados", `<p>${ejerciciosOcultos.length === 0 ? "Tienes todos." : `Has eliminado ${ejerciciosOcultos.length}.`}</p><button onclick="restaurarEjerciciosBase()" style="width:100%;">Recuperar eliminados</button>`)}
        ${aj("version", "Actualizaciones", "v" + APP_VERSION, `<p>Versión: <strong>${APP_VERSION}</strong></p><button onclick="buscarActualizaciones()" style="width:100%;background:#27864A;">🔄 Buscar actualizaciones</button>`)}
        ${aj("copia", "Copia de seguridad", "", `<p>Guarda tus datos.</p><div class="grupo-botones-temas"><button onclick="exportarDatos()">Descargar copia</button><button onclick="copiarDatos()">Copiar al portapapeles</button></div><label>Importar archivo</label><input type="file" accept=".json" onchange="importarArchivo(event)"><label>O pega aquí</label><textarea id="textoImportar"></textarea><button onclick="importarTexto()" style="width:100%;">Importar texto</button>`)}
    `;
}

function cambiarTemaApp(t) { temaActual = t; aplicarPreferencias(); guardarDatos(); mostrarAjustes(); }
function cambiarTamanioLetra(t) { letraActual = t; aplicarPreferencias(); guardarDatos(); mostrarAjustes(); }
function cambiarColorPrincipal(c) { if (!/^#[0-9a-f]{6}$/i.test(c)) return; colorActual = c; aplicarPreferencias(); guardarDatos(); ajusteAbierto = "color"; mostrarAjustes(); }
function elegirBotonMenu(c) { menuSeleccionado = c; ajusteAbierto = "menu"; mostrarAjustes(); }
function cambiarColorBoton(c) { if (!/^#[0-9a-f]{6}$/i.test(c)) return; if (menuSeleccionado === "todos") { colorMenuGlobal = c; coloresMenu = {}; } else coloresMenu[menuSeleccionado] = c; aplicarPreferencias(); guardarDatos(); ajusteAbierto = "menu"; mostrarAjustes(); }
function restaurarColoresMenu() { colorMenuGlobal = ""; coloresMenu = {}; menuSeleccionado = "todos"; aplicarPreferencias(); guardarDatos(); ajusteAbierto = "menu"; mostrarAjustes(); aviso("Botones con color del diseño."); }

async function buscarActualizaciones() {
    if (!navigator.onLine) { aviso("Sin conexión."); return; } aviso("Buscando…");
    try { const r = await fetch("script.js?ts=" + Date.now(), { cache: "no-store" }); const t = await r.text(); const m = t.match(/const APP_VERSION = "([^"]+)"/); if (!m) { aviso("No se pudo leer."); return; } if (m[1] !== APP_VERSION) confirmar(`Hay versión nueva (${m[1]}). ¿Actualizar?`, actualizarApp); else aviso("✅ Ya tienes la última."); } catch (e) { aviso("No se pudo comprobar."); }
}

async function actualizarApp() {
    try { if ("serviceWorker" in navigator) { const r = await navigator.serviceWorker.getRegistration(); if (r) { if (r.waiting) r.waiting.postMessage("SKIP_WAITING"); await r.update(); } } if (window.caches) { const k = await caches.keys(); await Promise.all(k.map(x => caches.delete(x))); } } catch (e) {}
    location.reload();
}

function crearCopia() { return JSON.stringify({ app: "mi-entrenamiento", version: 5, fecha: new Date().toISOString(), misEjercicios, rutinas, historial, ejerciciosOcultos, medidasCuerpo, notasDias, carreras, listasMusica, videosGuardados, coloresMenu, colorMenuGlobal, alturaCm, tema: temaActual, letra: letraActual, color: colorActual }, null, 2); }
function exportarDatos() { try { const b = new Blob([crearCopia()], { type: "application/json" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `mi-entrenamiento-${obtenerFechaActual()}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000); aviso("Copia descargada."); } catch (e) { aviso("Error."); } }
function copiarDatos() { if (navigator.clipboard) navigator.clipboard.writeText(crearCopia()).then(() => aviso("Copiado."), () => aviso("Error.")); else aviso("No soportado."); }

function aplicarCopia(t) {
    let d; try { d = JSON.parse(t); } catch (e) { aviso("Copia no válida."); return; }
    if (!d || !Array.isArray(d.misEjercicios) || !Array.isArray(d.rutinas) || !Array.isArray(d.historial)) { aviso("Formato incorrecto."); return; }
    confirmar("Esto reemplazará tus datos. ¿Continuar?", () => {
        misEjercicios = d.misEjercicios; rutinas = d.rutinas; historial = d.historial; ejerciciosOcultos = Array.isArray(d.ejerciciosOcultos) ? d.ejerciciosOcultos : [];
        if (Array.isArray(d.medidasCuerpo)) medidasCuerpo = d.medidasCuerpo; if (Array.isArray(d.carreras)) carreras = d.carreras; if (Array.isArray(d.listasMusica)) listasMusica = d.listasMusica; if (Array.isArray(d.videosGuardados)) videosGuardados = d.videosGuardados; if (d.notasDias && !Array.isArray(d.notasDias)) notasDias = d.notasDias; if (d.coloresMenu && !Array.isArray(d.coloresMenu)) coloresMenu = d.coloresMenu; if (/^#[0-9a-f]{6}$/i.test(d.colorMenuGlobal || "")) colorMenuGlobal = d.colorMenuGlobal; if (parseFloat(d.alturaCm) > 0) alturaCm = parseFloat(d.alturaCm); if (["oscuro", "oled", "claro"].includes(d.tema)) temaActual = d.tema; if (["pequenia", "mediana", "grande"].includes(d.letra)) letraActual = d.letra; if (/^#[0-9a-f]{6}$/i.test(d.color || "")) colorActual = d.color;
        guardarDatos(); aplicarPreferencias(); mostrarAjustes(); aviso("Importado.");
    });
}

function importarArchivo(e) { const f = e.target.files[0]; if (!f) return; const l = new FileReader(); l.onload = () => aplicarCopia(l.result); l.readAsText(f); }
function importarTexto() { const c = document.getElementById("textoImportar"); if (!c || !c.value.trim()) { aviso("Pega texto."); return; } aplicarCopia(c.value); }

function procesarEnlaceCompartido() {
    const params = new URLSearchParams(window.location.search);
    const sharedText = params.get('text') || params.get('url') || "";
    
    if (!sharedText) return;

    // Buscar si hay un enlace web dentro del texto compartido
    const match = sharedText.match(/https?:\/\/[^\s]+/);
    if (!match) return;
    
    const enlace = match[0];

    // Limpiamos la URL para que no se quede en la barra de direcciones
    window.history.replaceState({}, document.title, window.location.pathname);

    // Si es un vídeo de YouTube, abrimos el formulario de vídeo (que sí existe)
    if (enlace.includes("youtube.com") || enlace.includes("youtu.be") || enlace.includes("vimeo.com")) {
        confirmar("Has compartido un vídeo. ¿Quieres guardarlo en la app?", function() {
            mostrarFormularioVideo(null, enlace);
        });
    } else {
        // Si es un podcast o audio, te preguntamos si quieres abrirlo directamente
        confirmar("Has compartido un enlace de audio/podcast. ¿Quieres abrirlo ahora?", function() {
            abrirEnlace(enlace); // Lo abre con tu app nativa (iVoox, Spotify, etc.)
            aviso("Enlace abierto en tu app externa.");
        });
    }
             }
