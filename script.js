/* =====================================================
   MI ENTRENAMIENTO - JS MÓVIL
===================================================== */

// Súbela cada vez que publiques una versión nueva
const APP_VERSION = "1.2";

let contenido = null;
let misEjercicios = [];
let rutinas = [];
let historial = [];
let ejerciciosOcultos = [];
let medidasCuerpo = [];
let notasDias = {};
let carreras = [];
let listasMusica = [];
let videosGuardados = [];
let coloresMenu = {};
let colorMenuGlobal = "";
let menuSeleccionado = "todos";
let tipoCardio = "correr";
let videoUrlObjeto = null;
let vozCorrer = true;
let alturaCm = 0;
let temaActual = "oscuro";
let letraActual = "mediana";
let colorActual = "#2196F3";
let grupoActual = "";

// Botones del menú que se pueden colorear
const botonesMenu = [
    ["inicio", "Inicio"], ["ejercicios", "Ejercicios"], ["rutinas", "Rutinas"],
    ["progreso", "Progreso"], ["cronometro", "Cronómetro"], ["calendario", "Calendario"],
    ["correr", "Cardio"], ["musica", "Música"], ["video", "Vídeos"]
];

// Progreso corporal
let metricaActual = "peso";
let periodoActual = 0;
let cuerpoEditandoId = null;

// Cronómetro
let cronoIntervalo = null;
let cronoModo = "parado";
let cronoMs = 0;
let cronoInicio = 0;
let cronoFin = 0;
let cronoColor = "";

// Calendario
let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();
let diaSeleccionado = null;
let notaEditandoId = null;

// Cardio
let correr = nuevoEstadoCorrer();
let origenCarrera = "correr";

// Música / Vídeos
let listaEditandoId = null;
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

    if (!Array.isArray(medidasCuerpo)) medidasCuerpo = [];
    if (!Array.isArray(carreras)) carreras = [];
    if (!Array.isArray(listasMusica)) listasMusica = [];
    if (!Array.isArray(videosGuardados)) videosGuardados = [];
    if (!notasDias || typeof notasDias !== "object" || Array.isArray(notasDias)) notasDias = {};
    if (!coloresMenu || typeof coloresMenu !== "object" || Array.isArray(coloresMenu)) coloresMenu = {};
    if (!/^#[0-9a-f]{6}$/i.test(colorMenuGlobal)) colorMenuGlobal = "";

    temaActual = leerTexto("temaApp", "oscuro");
    letraActual = leerTexto("tamanioLetraApp", "mediana");
    colorActual = leerTexto("colorApp", "#2196F3");

    if (!["oscuro", "oled", "claro"].includes(temaActual)) temaActual = "oscuro";
    if (!["pequenia", "mediana", "grande"].includes(letraActual)) letraActual = "mediana";
    if (!/^#[0-9a-f]{6}$/i.test(colorActual)) colorActual = "#2196F3";

    aplicarPreferencias();
    mostrarPanelPrincipal();
});

/* =====================================================
   1. FUNCIONES GENERALES Y TEMAS
===================================================== */

function cargarDatos(clave, valorInicial) {
    try {
        const datos = localStorage.getItem(clave);
        return datos ? JSON.parse(datos) : valorInicial;
    } catch (error) {
        return valorInicial;
    }
}

function leerTexto(clave, valorInicial) {
    try {
        const dato = localStorage.getItem(clave);
        return dato ? dato.replace(/"/g, "") : valorInicial;
    } catch (error) {
        return valorInicial;
    }
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
    } catch (error) {
        aviso("⚠️ No se pudieron guardar los datos.");
    }
}

function colorDeBoton(clave) {
    return coloresMenu[clave] || colorMenuGlobal || colorActual;
}

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

function generarId() {
    return "id_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
}

function escaparHTML(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, function(caracter) {
        const equivalencias = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return equivalencias[caracter];
    });
}

function fechaATexto(fecha) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

function textoAFecha(texto) {
    const p = String(texto).split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

function obtenerFechaActual() {
    return fechaATexto(new Date());
}

function formatearFecha(fecha) {
    const partes = String(fecha).split("-");
    if (partes.length !== 3) return String(fecha);
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearFechaCorta(fecha) {
    const partes = String(fecha).split("-");
    if (partes.length !== 3) return String(fecha);
    return `${partes[2]}/${partes[1]}`;
}

function formatoNum(numero, decimales = 1) {
    const f = Math.pow(10, decimales);
    return String(Math.round(numero * f) / f).replace(".", ",");
}

let avisoTimeout = null;

function aviso(texto) {
    const caja = document.getElementById("aviso");
    if (!caja) return;
    caja.textContent = texto;
    caja.classList.add("visible");
    clearTimeout(avisoTimeout);
    avisoTimeout = setTimeout(function() { caja.classList.remove("visible"); }, 2800);
}

window.alert = function(texto) { aviso(texto); };

function confirmar(texto, alAceptar) {
    const fondo = document.createElement("div");
    fondo.className = "modal-fondo";
    fondo.innerHTML = `
        <div class="modal-caja">
            <p>${escaparHTML(texto)}</p>
            <div class="modal-botones">
                <button class="boton-si">Sí</button>
                <button class="boton-no">No</button>
            </div>
        </div>
    `;
    document.body.appendChild(fondo);
    fondo.querySelector(".boton-si").onclick = function() { fondo.remove(); alAceptar(); };
    fondo.querySelector(".boton-no").onclick = function() { fondo.remove(); };
}

function informar(texto) {
    const fondo = document.createElement("div");
    fondo.className = "modal-fondo";
    fondo.innerHTML = `
        <div class="modal-caja">
            <p>${escaparHTML(texto)}</p>
            <div class="modal-botones" style="grid-template-columns: 1fr;">
                <button class="boton-si">Entendido</button>
            </div>
        </div>
    `;
    document.body.appendChild(fondo);
    fondo.querySelector("button").onclick = function() { fondo.remove(); };
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

/* =====================================================
   2. NAVEGACIÓN Y MENÚ
===================================================== */

function mostrarPanelPrincipal() {
    if (!contenido) contenido = document.getElementById("contenido");
    if (!contenido) return;
    contenido.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; opacity: 0.8;">
            <h3>💪 Panel Principal</h3>
            <p>Selecciona una opción en el menú superior para desplegar su contenido.</p>
        </div>
    `;
}

function mostrar(apartado) {
    if (!contenido) contenido = document.getElementById("contenido");
    if (!contenido) return;

    if (contenido.querySelector(`[data-vista="${apartado}"]`)) {
        mostrarPanelPrincipal();
        return;
    }

    const vistas = {
        inicio: mostrarInicio,
        ejercicios: mostrarEjercicios,
        rutinas: mostrarRutinas,
        progreso: mostrarProgreso,
        cronometro: mostrarCronometro,
        calendario: mostrarCalendario,
        correr: mostrarCorrer,
        musica: mostrarMusica,
        video: mostrarVideos,
        ajustes: mostrarAjustes
    };

    if (!vistas[apartado]) return;
    vistas[apartado]();

    if (!contenido.querySelector(`[data-vista="${apartado}"]`)) {
        contenido.insertAdjacentHTML("afterbegin", `<span data-vista="${apartado}" hidden></span>`);
    }
    contenido.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* =====================================================
   3. INICIO
===================================================== */

function mostrarInicio() {
    const ultimo = obtenerUltimoPeso();

    contenido.innerHTML = `
        <span data-vista="inicio" hidden></span>
        <h2>Inicio</h2>
        <p>¿Qué vamos a entrenar hoy?</p>
        <div class="tarjeta-rutina">
            <h3>Mis rutinas</h3>
            <p>Tienes ${rutinas.length} rutinas creadas.</p>
            <button onclick="mostrar('rutinas')">Ver mis rutinas</button>
        </div>
        <div class="tarjeta-rutina">
            <h3>Biblioteca de ejercicios</h3>
            <p>Tienes ${obtenerEjercicios().length} ejercicios disponibles.</p>
            <button onclick="mostrar('ejercicios')">Ver ejercicios</button>
        </div>
        <div class="tarjeta-rutina">
            <h3>Entrenamientos realizados</h3>
            <p>Has registrado ${historial.length} entrenamientos y ${carreras.length} carreras.</p>
            <button onclick="mostrar('calendario')">Ver calendario</button>
        </div>
        <div class="tarjeta-rutina">
            <h3>Control corporal</h3>
            <p>${ultimo ? `Último peso registrado: ${formatoNum(ultimo.valor)} kg (${formatearFecha(ultimo.fecha)}).` : "Aún no has registrado tu peso ni tus medidas."}</p>
            <button onclick="mostrar('progreso')">Ver progreso corporal</button>
        </div>
    `;
}

/* =====================================================
   4. EJERCICIOS Y BIBLIOTECA
===================================================== */

const URL_IMG = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

function ex(id, nombre, grupo, equipo, compuesto, descripcion, img) {
    return { id: id, nombre: nombre, grupo: grupo, equipo: equipo, compuesto: compuesto, descripcion: descripcion, img: img || "" };
}

const ejerciciosBase = [
    ex("e1", "Press de banca con mancuernas", "Pecho", "Pesas", true,
        "1. Túmbate en un banco con una mancuerna en cada mano a la altura del pecho.\n2. Empuja hacia arriba hasta extender los brazos sin bloquear los codos.\n3. Baja despacio hasta notar el estiramiento del pecho.", "Dumbbell_Bench_Press"),
    ex("e19", "Press de banca con barra", "Pecho", "Pesas", true,
        "1. Túmbate con los ojos bajo la barra, pies firmes en el suelo y omóplatos juntos.\n2. Agarra la barra algo más ancho que los hombros y bájala hasta rozar el pecho.\n3. Empuja hasta extender los brazos.", "Barbell_Bench_Press_-_Medium_Grip"),
    ex("e20", "Press inclinado con mancuernas", "Pecho", "Pesas", true,
        "1. Ajusta el banco a unos 30-45 grados y siéntate con las mancuernas en los hombros.\n2. Empuja hacia arriba y ligeramente juntas.\n3. Baja controlando hasta la altura del pecho.", "Incline_Dumbbell_Press"),
    ex("e2", "Aperturas con mancuernas", "Pecho", "Pesas", false,
        "1. Túmbate con las mancuernas arriba y las palmas enfrentadas.\n2. Abre los brazos en arco con los codos ligeramente flexionados hasta sentir el estiramiento.\n3. Vuelve juntando las mancuernas arriba, como abrazando un árbol.", "Dumbbell_Flyes"),
    ex("e3", "Flexiones", "Pecho", "Peso corporal", true,
        "1. Apoya manos algo más anchas que los hombros y cuerpo recto de cabeza a talones.\n2. Baja el pecho hacia el suelo con los codos a unos 45 grados del cuerpo.\n3. Empuja hasta extender los brazos.", "Pushups"),
    ex("e44", "Press de pecho con goma", "Pecho", "Gomas", true,
        "1. Pasa la goma por la espalda y sujeta los extremos a la altura del pecho.\n2. Empuja hacia delante hasta extender los brazos.\n3. Vuelve despacio sin perder la tensión de la goma."),
    ex("e4", "Remo con mancuerna", "Espalda", "Pesas", true,
        "1. Apoya una mano y una rodilla en un banco, espalda recta.\n2. Tira de la mancuerna hacia la cadera llevando el codo hacia atrás.\n3. Baja despacio hasta estirar el brazo.", "One-Arm_Dumbbell_Row"),
    ex("e25", "Remo con barra", "Espalda", "Pesas", true,
        "1. Inclina el torso casi paralelo al suelo, rodillas flexionadas y espalda recta.\n2. Tira de la barra hacia el abdomen juntando los omóplatos.\n3. Baja controlando.", "Bent_Over_Barbell_Row"),
    ex("e5", "Peso muerto con mancuernas", "Espalda", "Pesas", true,
        "1. De pie con una mancuerna en cada mano delante de los muslos.\n2. Lleva la cadera hacia atrás y baja las mancuernas pegadas a las piernas con la espalda recta.\n3. Sube empujando la cadera hacia delante.", "Stiff-Legged_Dumbbell_Deadlift"),
    ex("e15", "Peso muerto convencional", "Espalda", "Pesas", true,
        "1. Pies a la anchura de la cadera, barra sobre el medio del pie.\n2. Agarra la barra, pecho alto y espalda neutra.\n3. Empuja el suelo con las piernas y estira la cadera hasta quedar erguido.\n4. Baja la barra pegada al cuerpo.", "Barbell_Deadlift"),
    ex("e17", "Dominadas", "Espalda", "Peso corporal", true,
        "1. Cuélgate de una barra con agarre algo más ancho que los hombros.\n2. Tira hasta pasar la barbilla de la barra llevando los codos hacia abajo.\n3. Baja hasta estirar los brazos.", "Pullups"),
    ex("e26", "Jalón al pecho", "Espalda", "Pesas", true,
        "1. Siéntate en la polea y agarra la barra ancha.\n2. Tira hacia la parte alta del pecho sacando el pecho y bajando los codos.\n3. Sube despacio.", "Wide-Grip_Lat_Pulldown"),
    ex("e37", "Remo invertido", "Espalda", "Peso corporal", true,
        "1. Túmbate bajo una barra baja y agárrala con las manos separadas.\n2. Con el cuerpo recto, tira del pecho hacia la barra.\n3. Baja controlando.", "Inverted_Row"),
    ex("e45", "Remo con goma", "Espalda", "Gomas", true,
        "1. Sentado, pasa la goma por los pies y agarra los extremos.\n2. Tira hacia el abdomen juntando los omóplatos.\n3. Vuelve despacio."),
    ex("e53", "Jalón con goma", "Espalda", "Gomas", false,
        "1. Fija la goma en lo alto y agarra los extremos.\n2. Tira hacia el pecho bajando los codos.\n3. Sube controlando."),
    ex("e43", "Superman", "Espalda", "Peso corporal", false,
        "1. Boca abajo con brazos estirados al frente.\n2. Eleva a la vez brazos y piernas del suelo y mantén 1-2 segundos.\n3. Baja despacio.", "Superman"),
    ex("e6", "Curl de bíceps", "Bíceps", "Pesas", false,
        "1. De pie con una mancuerna en cada mano y los codos pegados al cuerpo.\n2. Flexiona los codos subiendo las mancuernas hasta los hombros.\n3. Baja despacio sin balancear.", "Dumbbell_Bicep_Curl"),
    ex("e7", "Curl martillo", "Bíceps", "Pesas", false,
        "1. De pie con las mancuernas y las palmas mirando al cuerpo.\n2. Sube las mancuernas manteniendo esa posición.\n3. Baja controlando.", "Hammer_Curls"),
    ex("e27", "Curl con barra", "Bíceps", "Pesas", false,
        "1. De pie, agarre supino a la anchura de los hombros.\n2. Sube la barra flexionando los codos sin moverlos.\n3. Baja despacio.", "Barbell_Curl"),
    ex("e47", "Curl de bíceps con goma", "Bíceps", "Gomas", false,
        "1. Pisa la goma con ambos pies y agarra los extremos.\n2. Flexiona los codos subiendo las manos a los hombros.\n3. Baja controlando."),
    ex("e8", "Extensión de tríceps", "Tríceps", "Pesas", false,
        "1. Sujeta una mancuerna con ambas manos por encima de la cabeza.\n2. Baja detrás de la nuca flexionando los codos, que no se abren.\n3. Extiende los brazos hacia arriba.", "Standing_Dumbbell_Triceps_Extension"),
    ex("e9", "Patada de tríceps", "Tríceps", "Pesas", false,
        "1. Inclina el torso con el codo pegado al costado y la mancuerna en la mano.\n2. Extiende el antebrazo hacia atrás hasta estirar el brazo.\n3. Vuelve despacio.", "Tricep_Dumbbell_Kickback"),
    ex("e18", "Fondos en paralelas", "Tríceps", "Peso corporal", true,
        "1. Sujétate en las paralelas con los brazos estirados.\n2. Baja flexionando los codos hasta unos 90 grados.\n3. Sube empujando con pecho y tríceps.", "Dips_-_Triceps_Version"),
    ex("e21", "Fondos en banco", "Tríceps", "Peso corporal", false,
        "1. Apoya las manos en un banco detrás de ti con las piernas estiradas.\n2. Baja flexionando los codos hacia atrás.\n3. Sube extendiendo los brazos.", "Bench_Dips"),
    ex("e38", "Flexiones diamante", "Tríceps", "Peso corporal", true,
        "1. Posición de flexión con las manos juntas bajo el pecho formando un rombo.\n2. Baja con los codos pegados al cuerpo.\n3. Empuja hasta estirar.", "Push-Ups_-_Close_Triceps_Position"),
    ex("e28", "Press francés", "Tríceps", "Pesas", false,
        "1. Túmbate con la barra o mancuernas sobre el pecho, brazos estirados.\n2. Flexiona solo los codos llevando el peso hacia la frente.\n3. Extiende de nuevo."),
    ex("e48", "Extensión de tríceps con goma", "Tríceps", "Gomas", false,
        "1. Fija la goma en alto y sujétala con codos pegados al cuerpo.\n2. Empuja hacia abajo hasta extender los brazos.\n3. Sube despacio."),
    ex("e10", "Press de hombros", "Hombros", "Pesas", true,
        "1. Sentado o de pie, mancuernas a la altura de los hombros.\n2. Empuja hacia arriba hasta extender los brazos.\n3. Baja controlando hasta las orejas.", "Dumbbell_Shoulder_Press"),
    ex("e16", "Press militar de pie", "Hombros", "Pesas", true,
        "1. De pie con la barra apoyada en la parte alta del pecho.\n2. Empuja la barra por encima de la cabeza con el abdomen firme.\n3. Baja controlando.", "Standing_Military_Press"),
    ex("e11", "Elevaciones laterales", "Hombros", "Pesas", false,
        "1. De pie con las mancuernas a los lados.\n2. Eleva los brazos hacia los lados hasta la altura de los hombros con los codos ligeramente flexionados.\n3. Baja despacio.", "Side_Lateral_Raise"),
    ex("e29", "Elevaciones frontales", "Hombros", "Pesas", false,
        "1. De pie con las mancuernas delante de los muslos.\n2. Eleva un brazo al frente hasta la altura del hombro.\n3. Baja y alterna.", "Front_Dumbbell_Raise"),
    ex("e30", "Pájaros (deltoide posterior)", "Hombros", "Pesas", false,
        "1. Inclina el torso con la espalda recta y las mancuernas colgando.\n2. Abre los brazos hacia los lados juntando los omóplatos.\n3. Baja despacio."),
    ex("e31", "Encogimientos de hombros", "Hombros", "Pesas", false,
        "1. De pie con una mancuerna en cada mano.\n2. Sube los hombros hacia las orejas sin doblar los codos.\n3. Mantén un segundo y baja.", "Dumbbell_Shrug"),
    ex("e46", "Apertura con goma (pull apart)", "Hombros", "Gomas", false,
        "1. Sujeta la goma con los brazos estirados al frente.\n2. Sepáralos hacia los lados hasta que la goma toque el pecho.\n3. Vuelve controlando."),
    ex("e52", "Press de hombros con goma", "Hombros", "Gomas", true,
        "1. Pisa la goma y sujeta los extremos a la altura de los hombros.\n2. Empuja hacia arriba hasta extender los brazos.\n3. Baja controlando."),
    ex("e12", "Sentadillas", "Piernas", "Peso corporal", true,
        "1. Pies a la anchura de los hombros, puntas ligeramente abiertas.\n2. Lleva la cadera atrás y baja con la espalda recta hasta que los muslos queden paralelos.\n3. Sube empujando con los talones.", "Bodyweight_Squat"),
    ex("e35", "Sentadilla con peso corporal (tempo lento)", "Piernas", "Peso corporal", true,
        "1. Igual que la sentadilla normal, pero baja contando 3 segundos.\n2. Pausa 1 segundo abajo.\n3. Sube de forma explosiva.", "Bodyweight_Squat"),
    ex("e22", "Sentadilla con barra", "Piernas", "Pesas", true,
        "1. Barra sobre los trapecios, pies a la anchura de los hombros.\n2. Baja con la espalda neutra hasta que los muslos queden paralelos.\n3. Sube empujando el suelo.", "Barbell_Full_Squat"),
    ex("e32", "Sentadilla goblet", "Piernas", "Pesas", true,
        "1. Sujeta una mancuerna contra el pecho con ambas manos.\n2. Baja entre las rodillas con el pecho alto.\n3. Sube extendiendo cadera y rodillas.", "Goblet_Squat"),
    ex("e49", "Sentadilla con goma", "Piernas", "Gomas", true,
        "1. Pisa la goma y sujeta los extremos en los hombros.\n2. Haz una sentadilla completa.\n3. Sube contra la resistencia de la goma."),
    ex("e13", "Zancadas", "Piernas", "Peso corporal", true,
        "1. Da un paso largo al frente.\n2. Baja flexionando ambas rodillas hasta unos 90 grados sin que la trasera toque el suelo.\n3. Empuja con la pierna delantera para volver.", "Dumbbell_Lunges"),
    ex("e33", "Zancada búlgara", "Piernas", "Pesas", true,
        "1. Apoya el empeine de una pierna en un banco detrás de ti.\n2. Baja flexionando la rodilla delantera.\n3. Sube empujando con el talón delantero."),
    ex("e23", "Peso muerto rumano", "Piernas", "Pesas", true,
        "1. De pie con la barra delante de los muslos y las rodillas ligeramente flexionadas.\n2. Lleva la cadera atrás bajando la barra pegada a las piernas hasta notar el estiramiento trasero del muslo.\n3. Sube estirando la cadera.", "Romanian_Deadlift"),
    ex("e24", "Hip thrust", "Piernas", "Pesas", true,
        "1. Apoya la parte alta de la espalda en un banco con la barra sobre la cadera.\n2. Empuja la cadera hacia arriba hasta alinear rodillas, cadera y hombros.\n3. Aprieta glúteos y baja controlando.", "Barbell_Hip_Thrust"),
    ex("e36", "Puente de glúteos", "Piernas", "Peso corporal", false,
        "1. Tumbado boca arriba con rodillas flexionadas y pies en el suelo.\n2. Sube la cadera apretando los glúteos.\n3. Baja despacio.", "Butt_Lift_Bridge"),
    ex("e50", "Puente de glúteos con goma", "Piernas", "Gomas", false,
        "1. Goma alrededor de las rodillas, tumbado boca arriba.\n2. Sube la cadera empujando las rodillas hacia fuera.\n3. Baja controlando."),
    ex("e51", "Caminata lateral con goma", "Piernas", "Gomas", false,
        "1. Goma alrededor de rodillas o tobillos, rodillas ligeramente flexionadas.\n2. Da pasos laterales manteniendo tensión.\n3. Repite hacia el otro lado."),
    ex("e34", "Elevación de talones", "Piernas", "Peso corporal", false,
        "1. De pie, con o sin mancuernas, apoya la punta de los pies en un escalón.\n2. Sube sobre las puntas lo máximo posible.\n3. Baja estirando bien los gemelos.", "Standing_Calf_Raises"),
    ex("e14", "Plancha abdominal", "Abdominales", "Peso corporal", false,
        "1. Apoya antebrazos y puntas de los pies en el suelo.\n2. Mantén el cuerpo recto de cabeza a talones con el abdomen firme.\n3. Aguanta el tiempo marcado sin hundir la cadera.", "Plank"),
    ex("e39", "Crunch abdominal", "Abdominales", "Peso corporal", false,
        "1. Tumbado con las rodillas flexionadas y las manos junto a la cabeza.\n2. Sube los hombros del suelo contrayendo el abdomen.\n3. Baja sin relajar del todo.", "Crunches"),
    ex("e40", "Elevación de piernas", "Abdominales", "Peso corporal", false,
        "1. Tumbado con las piernas estiradas.\n2. Sube las piernas juntas hasta formar 90 grados.\n3. Baja despacio sin tocar el suelo.", "Flat_Bench_Lying_Leg_Raise"),
    ex("e41", "Plancha lateral", "Abdominales", "Peso corporal", false,
        "1. Apoya el antebrazo y el costado del pie, cuerpo en línea recta.\n2. Mantén la cadera elevada.\n3. Aguanta y cambia de lado.", "Side_Bridge"),
    ex("e42", "Mountain climbers", "Abdominales", "Peso corporal", true,
        "1. Posición de flexión con los brazos estirados.\n2. Lleva una rodilla al pecho y alterna rápido las piernas.\n3. Mantén la cadera baja.", "Mountain_Climbers"),
    ex("e54", "Thruster con mancuernas", "Compuestos", "Pesas", true,
        "1. De pie con las mancuernas en los hombros.\n2. Haz una sentadilla completa.\n3. Al subir, empuja las mancuernas por encima de la cabeza en un solo movimiento."),
    ex("e55", "Burpees", "Compuestos", "Peso corporal", true,
        "1. De pie, baja las manos al suelo y lanza los pies atrás.\n2. Haz una flexión, vuelve los pies a las manos.\n3. Salta con los brazos arriba.")
];

function obtenerEjercicios() {
    const base = ejerciciosBase.filter(e => !ejerciciosOcultos.includes(e.id));
    return [...base, ...misEjercicios];
}

function htmlImagenesEjercicio(e) {
    if (!e.img) return "";
    return `
        <div class="imagenes-ejercicio">
            <figure><img src="${URL_IMG}${e.img}/images/0.jpg" alt="Inicio del ejercicio" loading="lazy" onerror="this.parentElement.style.display='none'"><figcaption>Inicio</figcaption></figure>
            <figure><img src="${URL_IMG}${e.img}/images/1.jpg" alt="Final del ejercicio" loading="lazy" onerror="this.parentElement.style.display='none'"><figcaption>Final</figcaption></figure>
        </div>
    `;
}

/* --- Letras de grupos musculares (sustituyen botones) --- */
const GRUPOS_EJERCICIO = [
    { letra: "★",  nombre: "Todos",          color: "#2196F3", filtro: "Todos" },
    { letra: "C",  nombre: "Compuestos",     color: "#7E57C2", filtro: "Compuestos" },
    { letra: "P",  nombre: "Pecho",          color: "#C62828", filtro: "Pecho" },
    { letra: "E",  nombre: "Espalda",        color: "#1565C0", filtro: "Espalda" },
    { letra: "B",  nombre: "Bíceps",         color: "#AD1457", filtro: "Bíceps" },
    { letra: "R",  nombre: "Tríceps",        color: "#E65100", filtro: "Tríceps" },
    { letra: "H",  nombre: "Hombros",        color: "#D9A514", filtro: "Hombros" },
    { letra: "L",  nombre: "Piernas",        color: "#27864A", filtro: "Piernas" },
    { letra: "A",  nombre: "Abdominales",    color: "#00897B", filtro: "Abdominales" },
    { letra: "W",  nombre: "Con pesas",      color: "#6D4C41", filtro: "eq:Pesas" },
    { letra: "G",  nombre: "Con gomas",      color: "#E91E63", filtro: "eq:Gomas" },
    { letra: "PC", nombre: "Peso corporal",  color: "#03A9F4", filtro: "eq:Peso corporal" }
];

function mostrarEjercicios() {
    contenido.innerHTML = `
        <span data-vista="ejercicios" hidden></span>
        <h2>Biblioteca de ejercicios</h2>

        <div class="filtros-letras">
            ${GRUPOS_EJERCICIO.map(g => `
                <button class="letra-ejercicio"
                        style="background:${g.color};"
                        title="${g.nombre}"
                        onclick="filtrarGrupo('${g.filtro}')">${g.letra}</button>
            `).join("")}
        </div>

        <button class="boton-crear-ejercicio" onclick="mostrarFormularioEjercicio()"
                style="margin-top: 10px; width: 100%;">+ Crear ejercicio</button>

        <div id="listaEjercicios" style="margin-top: 15px;">
            <div style="text-align: center; padding: 20px; opacity: 0.7;">
                <p>Pulsa una letra para ver los ejercicios.</p>
            </div>
        </div>
    `;
    grupoActual = "";
}

function filtrarGrupo(grupo) {
    grupoActual = grupo;
    document.querySelectorAll(".letra-ejercicio").forEach(b => b.classList.remove("activo"));
    const activo = document.querySelector(`.letra-ejercicio[onclick*="'${grupo}'"]`);
    if (activo) activo.classList.add("activo");
    filtrarBiblioteca();
    const lista = document.getElementById("listaEjercicios");
    if (lista) lista.scrollIntoView({ behavior: "smooth", block: "start" });
}

function coincideFiltro(ejercicio) {
    if (grupoActual === "" || grupoActual === "Todos") return true;
    if (grupoActual === "Compuestos") return ejercicio.grupo === "Compuestos" || ejercicio.compuesto === true;
    if (grupoActual.indexOf("eq:") === 0) return ejercicio.equipo === grupoActual.slice(3);
    return ejercicio.grupo === grupoActual;
}

function filtrarBiblioteca() {
    const lista = document.getElementById("listaEjercicios");
    if (!lista) return;

    if (grupoActual === "") {
        lista.innerHTML = `<div style="text-align: center; padding: 20px; opacity: 0.7;"><p>Selecciona un grupo para ver los ejercicios.</p></div>`;
        return;
    }

    const ejercicios = obtenerEjercicios().filter(coincideFiltro);

    if (ejercicios.length === 0) {
        lista.innerHTML = "<p>No hay ejercicios en esta categoría.</p>";
        return;
    }

    lista.innerHTML = ejercicios.map(e => `
        <div class="tarjeta-ejercicio">
            <h3>${escaparHTML(e.nombre)}</h3>
            <div class="etiquetas-ejercicio">
                <span class="etiqueta">${escaparHTML(e.grupo)}</span>
                ${e.equipo ? `<span class="etiqueta">${escaparHTML(e.equipo)}</span>` : ""}
                ${e.compuesto ? `<span class="etiqueta">Compuesto</span>` : ""}
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
        <div class="etiquetas-ejercicio">
            <span class="etiqueta">${escaparHTML(e.grupo)}</span>
            ${e.equipo ? `<span class="etiqueta">${escaparHTML(e.equipo)}</span>` : ""}
            ${e.compuesto ? `<span class="etiqueta">Compuesto</span>` : ""}
        </div>
        ${htmlImagenesEjercicio(e)}
        <h3>Cómo se hace</h3>
        <p class="pasos-ejercicio">${escaparHTML(e.descripcion || "Sin descripción.")}</p>
        <button class="boton-texto" onclick="elegirRutinaParaEjercicio('${e.id}')">Añadir a rutina</button>
        <button class="boton-texto texto-rojo" onclick="eliminarEjercicio('${e.id}')">🗑 Eliminar ejercicio</button>
        <button class="boton-texto texto-volver" onclick="mostrarEjercicios()">◀ Volver</button>
    `;
}

function mostrarFormularioEjercicio() {
    contenido.innerHTML = `
        <h2>Crear ejercicio</h2>
        <label>Nombre</label>
        <input type="text" id="nuevoNombre" placeholder="Nombre">
        <label>Grupo muscular</label>
        <select id="nuevoGrupo">
            <option value="Compuestos">Compuestos</option>
            <option value="Pecho">Pecho</option>
            <option value="Espalda">Espalda</option>
            <option value="Bíceps">Bíceps</option>
            <option value="Tríceps">Tríceps</option>
            <option value="Hombros">Hombros</option>
            <option value="Piernas">Piernas</option>
            <option value="Abdominales">Abdominales</option>
        </select>
        <label>Material</label>
        <select id="nuevoEquipo">
            <option value="Pesas">Pesas</option>
            <option value="Gomas">Gomas</option>
            <option value="Peso corporal">Peso corporal</option>
        </select>
        <label>Cómo se hace</label>
        <textarea id="nuevaDescripcion" placeholder="Descripción..."></textarea>
        <button onclick="guardarNuevoEjercicio()" style="width:100%; margin-top:10px;">Guardar</button>
        <button class="boton-texto texto-volver" onclick="mostrarEjercicios()" style="width:100%; margin-top:10px;">Cancelar</button>
    `;
}

function guardarNuevoEjercicio() {
    const nombre = document.getElementById("nuevoNombre").value.trim();
    const grupo = document.getElementById("nuevoGrupo").value;
    const equipo = document.getElementById("nuevoEquipo").value;
    const descripcion = document.getElementById("nuevaDescripcion").value.trim();
    if (!nombre) { alert("Escribe el nombre."); return; }
    misEjercicios.push({ id: generarId(), nombre, grupo, equipo, compuesto: grupo === "Compuestos", descripcion, img: "" });
    guardarDatos();
    alert("Ejercicio guardado.");
    mostrarEjercicios();
}

function eliminarEjercicio(id, indiceRutina) {
    const ejercicio = obtenerEjercicios().find(e => e.id === id);
    if (!ejercicio) return;

    const esPropio = misEjercicios.some(e => e.id === id);
    const enRutinas = rutinas.filter(r => r.ejercicios.some(item => item.ejercicioId === id)).length;

    let mensaje = `¿Eliminar "${ejercicio.nombre}"?`;
    if (enRutinas > 0) mensaje += `\n\nTambién se quitará de ${enRutinas} rutina(s).`;
    if (!esPropio) mensaje += `\n\nPodrás recuperarlo en Ajustes.`;

    confirmar(mensaje, function() {
        if (esPropio) {
            misEjercicios = misEjercicios.filter(e => e.id !== id);
        } else if (!ejerciciosOcultos.includes(id)) {
            ejerciciosOcultos.push(id);
        }

        rutinas.forEach(r => {
            r.ejercicios = r.ejercicios.filter(item => item.ejercicioId !== id);
        });

        guardarDatos();
        aviso("Ejercicio eliminado.");

        if (indiceRutina !== undefined) mostrarSelectorEjercicios(indiceRutina);
        else mostrarEjercicios();
    });
}

function restaurarEjerciciosBase() {
    if (ejerciciosOcultos.length === 0) { aviso("No hay ejercicios base eliminados."); return; }
    confirmar(`Se recuperarán ${ejerciciosOcultos.length} ejercicio(s) base eliminados. ¿Continuar?`, function() {
        ejerciciosOcultos = [];
        guardarDatos();
        mostrarAjustes();
        aviso("Ejercicios base recuperados.");
    });
}

/* =====================================================
   5. RUTINAS Y ENTRENAMIENTO EN VIVO
===================================================== */

const plantillasRutinas = [
    { nombre: "Fuerza", descripcion: "Ejercicios básicos con carga alta y pocas repeticiones.",
      ejercicios: [["e15", 5, 5], ["e22", 5, 5], ["e19", 5, 5], ["e16", 5, 5], ["e25", 5, 5]] },
    { nombre: "Volumen", descripcion: "Hipertrofia: más series y repeticiones moderadas.",
      ejercicios: [["e1", 4, 10], ["e4", 4, 10], ["e10", 4, 10], ["e12", 4, 10], ["e6", 3, 12], ["e8", 3, 12]] },
    { nombre: "Definición", descripcion: "Repeticiones altas y poco descanso.",
      ejercicios: [["e32", 3, 15], ["e3", 3, 15], ["e13", 3, 15], ["e4", 3, 15], ["e11", 3, 15], ["e39", 3, 20]] },
    { nombre: "Empuje (pecho, hombro, tríceps)", descripcion: "Todos los músculos que empujan.",
      ejercicios: [["e19", 4, 8], ["e20", 3, 10], ["e10", 4, 10], ["e11", 3, 15], ["e8", 3, 12]] },
    { nombre: "Tirón (espalda y bíceps)", descripcion: "Todos los músculos que tiran.",
      ejercicios: [["e25", 4, 8], ["e26", 4, 10], ["e4", 3, 10], ["e6", 3, 12], ["e7", 3, 12]] },
    { nombre: "Pierna", descripcion: "Pierna y glúteo completos.",
      ejercicios: [["e22", 4, 8], ["e23", 3, 10], ["e13", 3, 12], ["e24", 3, 10], ["e34", 4, 15]] },
    { nombre: "Cuerpo entero sin material", descripcion: "Solo con tu peso corporal.",
      ejercicios: [["e35", 3, 15], ["e3", 3, 12], ["e37", 3, 10], ["e36", 3, 15], ["e39", 3, 20]] },
    { nombre: "Cuerpo entero con gomas", descripcion: "Entrenamiento completo con gomas elásticas.",
      ejercicios: [["e49", 3, 15], ["e44", 3, 15], ["e45", 3, 15], ["e52", 3, 12], ["e47", 3, 15]] }
];

function mostrarRutinas() {
    contenido.innerHTML = `
        <span data-vista="rutinas" hidden></span>
        <h2>Mis rutinas</h2>
        <button onclick="mostrarFormularioRutina()" style="width:100%;">+ Crear mi propia rutina</button>
        <button onclick="mostrarPlantillas()" style="width:100%; margin-top:10px; background:#D9A514;">📋 Rutinas</button>
        <div id="listaRutinas" style="margin-top: 10px;"></div>
    `;
    actualizarListaRutinas();
}

function mostrarPlantillas() {
    contenido.innerHTML = `
        <h2>Rutinas</h2>
        <p>Elige una y solo tendrás que ajustar series y repeticiones.</p>
        ${plantillasRutinas.map((p, i) => `
            <button class="fila-lista" onclick="elegirPlantilla(${i})">
                <span>${escaparHTML(p.nombre)}</span>
                <small>${p.ejercicios.length} ejercicios</small>
            </button>
        `).join("")}
        <button class="boton-texto texto-volver" onclick="mostrarRutinas()" style="width:100%; margin-top:15px;">◀ Volver</button>
    `;
}

function ejerciciosDePlantilla(p) {
    const disponibles = obtenerEjercicios();
    return p.ejercicios
        .map(x => ({ ejercicio: disponibles.find(e => e.id === x[0]), series: x[1], reps: x[2] }))
        .filter(x => x.ejercicio);
}

function elegirPlantilla(i) {
    const p = plantillasRutinas[i];
    if (!p) return;
    const lista = ejerciciosDePlantilla(p);

    contenido.innerHTML = `
        <h2>${escaparHTML(p.nombre)}</h2>
        <p>${escaparHTML(p.descripcion)}</p>
        <label>Nombre de tu rutina</label>
        <input type="text" id="plNombre" value="${escaparHTML(p.nombre)}">
        ${lista.map((x, k) => `
            <div class="tarjeta-ejercicio">
                <h3>${escaparHTML(x.ejercicio.nombre)}</h3>
                <label>Series</label>
                <input type="number" min="1" inputmode="numeric" id="plS_${k}" value="${x.series}">
                <label>Repeticiones</label>
                <input type="number" min="1" inputmode="numeric" id="plR_${k}" value="${x.reps}">
            </div>
        `).join("")}
        <button onclick="guardarPlantilla(${i})" style="width:100%; margin-top:15px;">Guardar rutina</button>
        <button class="boton-texto texto-volver" onclick="mostrarPlantillas()" style="width:100%; margin-top:10px;">Cancelar</button>
    `;
}

function guardarPlantilla(i) {
    const p = plantillasRutinas[i];
    if (!p) return;
    const nombre = document.getElementById("plNombre").value.trim();
    if (!nombre) { aviso("Escribe un nombre."); return; }

    const lista = ejerciciosDePlantilla(p);
    const ejercicios = [];
    for (let k = 0; k < lista.length; k++) {
        const series = parseInt(document.getElementById("plS_" + k).value);
        const repeticiones = parseInt(document.getElementById("plR_" + k).value);
        if (!series || !repeticiones) { aviso("Revisa las series y repeticiones."); return; }
        ejercicios.push({ ejercicioId: lista[k].ejercicio.id, series: series, repeticiones: repeticiones });
    }

    rutinas.push({ id: generarId(), nombre: nombre, ejercicios: ejercicios });
    guardarDatos();
    aviso("Rutina creada.");
    mostrarRutinas();
}

function actualizarListaRutinas() {
    const lista = document.getElementById("listaRutinas");
    if (!lista) return;
    if (rutinas.length === 0) {
        lista.innerHTML = "<p>No tienes rutinas creadas.</p>";
        return;
    }
    lista.innerHTML = rutinas.map((rutina, indice) => `
        <button class="fila-lista" onclick="verRutina(${indice})">
            <span>${escaparHTML(rutina.nombre)}</span>
            <small>${rutina.ejercicios.length} ejercicios</small>
        </button>
    `).join("");
}

function mostrarFormularioRutina() {
    contenido.innerHTML = `
        <h2>Crear rutina</h2>
        <label>Nombre</label>
        <input type="text" id="nombreRutina" placeholder="Ej: Pecho y Tríceps">
        <button onclick="crearRutina()" style="width:100%; margin-top:10px;">Guardar</button>
        <button class="boton-texto texto-volver" onclick="mostrarRutinas()" style="width:100%; margin-top:10px;">Cancelar</button>
    `;
}

function crearRutina() {
    const nombre = document.getElementById("nombreRutina").value.trim();
    if (!nombre) { alert("Escribe un nombre."); return; }
    rutinas.push({ id: generarId(), nombre, ejercicios: [] });
    guardarDatos();
    mostrarRutinas();
}

function eliminarRutina(indice) {
    confirmar("¿Eliminar esta rutina?", function() {
        rutinas.splice(indice, 1);
        guardarDatos();
        aviso("Rutina eliminada.");
        mostrarRutinas();
    });
}

function verRutina(indice) {
    const rutina = rutinas[indice];
    if (!rutina) return;

    let html = `
        <h2>${escaparHTML(rutina.nombre)}</h2>
        <label>Nombre de la rutina</label>
        <input type="text" id="rutNombre" value="${escaparHTML(rutina.nombre)}">
        <div id="ejerciciosDeRutina">
    `;

    if (rutina.ejercicios.length === 0) {
        html += "<p>Sin ejercicios en esta rutina.</p>";
    } else {
        rutina.ejercicios.forEach((item, posicion) => {
            const ejercicio = obtenerEjercicios().find(e => e.id === item.ejercicioId);
            if (!ejercicio) return;
            html += `
                <div class="tarjeta-ejercicio">
                    <h3>${escaparHTML(ejercicio.nombre)}</h3>
                    <label>Series</label>
                    <input type="number" min="1" inputmode="numeric" id="rutS_${posicion}" value="${item.series}">
                    <label>Repeticiones</label>
                    <input type="number" min="1" inputmode="numeric" id="rutR_${posicion}" value="${item.repeticiones}">
                    <button class="boton-borrar" style="margin-top:10px;" onclick="eliminarEjercicioRutina(${indice}, ${posicion})">🗑 Quitar de la rutina</button>
                </div>
            `;
        });
    }

    html += `</div>
        <button style="width:100%; margin-top:15px;" onclick="guardarEdicionRutina(${indice}, 'selector')">+ Añadir ejercicio</button>
        <button style="width:100%; margin-top:10px; background:#27864A;" onclick="guardarEdicionRutina(${indice}, 'lista')">💾 Guardar cambios</button>
        <button style="width:100%; margin-top:10px; min-height:50px; background:#28a745; color:#fff;" onclick="guardarEdicionRutina(${indice}, 'entrenar')">▶ INICIAR ENTRENAMIENTO EN VIVO</button>
        <button class="boton-borrar" style="width:100%; margin-top:10px;" onclick="eliminarRutina(${indice})">🗑 Eliminar rutina</button>
        <button class="boton-texto texto-volver" onclick="mostrarRutinas()" style="width:100%; margin-top:10px;">◀ Volver a rutinas</button>
    `;
    contenido.innerHTML = html;
}

function leerEdicionRutina(indice) {
    const rutina = rutinas[indice];
    const campoNombre = document.getElementById("rutNombre");
    if (!rutina || !campoNombre) return false;

    const nombre = campoNombre.value.trim();
    if (!nombre) { aviso("Escribe un nombre."); return false; }

    const cambios = [];
    for (let pos = 0; pos < rutina.ejercicios.length; pos++) {
        const s = document.getElementById("rutS_" + pos);
        const r = document.getElementById("rutR_" + pos);
        if (!s || !r) continue;
        const series = parseInt(s.value);
        const reps = parseInt(r.value);
        if (!(series > 0) || !(reps > 0)) { aviso("Revisa las series y repeticiones."); return false; }
        cambios.push([pos, series, reps]);
    }

    rutina.nombre = nombre;
    cambios.forEach(c => {
        rutina.ejercicios[c[0]].series = c[1];
        rutina.ejercicios[c[0]].repeticiones = c[2];
    });
    return true;
}

function guardarEdicionRutina(indice, destino) {
    if (!leerEdicionRutina(indice)) return;
    guardarDatos();
    if (destino === "selector") mostrarSelectorEjercicios(indice);
    else if (destino === "entrenar") iniciarEntrenamientoEnVivo(indice);
    else { aviso("Cambios guardados."); mostrarRutinas(); }
}

function mostrarSelectorEjercicios(indiceRutina) {
    contenido.innerHTML = `
        <h2>Añadir ejercicio</h2>
        <input type="text" id="buscadorRutina" placeholder="Buscar..." oninput="filtrarEjerciciosParaRutina(${indiceRutina})">
        <div id="selectorEjercicios"></div>
        <button class="boton-texto texto-volver" onclick="verRutina(${indiceRutina})" style="width:100%; margin-top:15px;">◀ Volver</button>
    `;
    filtrarEjerciciosParaRutina(indiceRutina);
}

function filtrarEjerciciosParaRutina(indiceRutina) {
    const lista = document.getElementById("selectorEjercicios");
    if (!lista) return;
    const texto = document.getElementById("buscadorRutina").value.toLowerCase();
    const ejercicios = obtenerEjercicios().filter(e => e.nombre.toLowerCase().includes(texto));

    lista.innerHTML = ejercicios.length === 0 ? "<p>No encontrado.</p>" : ejercicios.map(e => `
        <div class="tarjeta-ejercicio">
            <h3>${escaparHTML(e.nombre)}</h3>
            <p>${escaparHTML(e.grupo)}${e.equipo ? " · " + escaparHTML(e.equipo) : ""}</p>
            <button class="boton-texto" onclick="mostrarFormularioSeries(${indiceRutina}, '${e.id}')">Seleccionar</button>
        </div>
    `).join("");
}

function elegirRutinaParaEjercicio(idEjercicio) {
    if (rutinas.length === 0) { alert("Crea una rutina primero."); mostrarRutinas(); return; }
    contenido.innerHTML = `
        <h2>Seleccionar rutina</h2>
        <div id="selectorRutinas"></div>
        <button class="boton-texto texto-volver" onclick="mostrarEjercicios()" style="width:100%; margin-top:15px;">Cancelar</button>
    `;
    document.getElementById("selectorRutinas").innerHTML = rutinas.map((r, i) => `
        <button class="fila-lista" onclick="mostrarFormularioSeries(${i}, '${idEjercicio}')">
            <span>${escaparHTML(r.nombre)}</span>
            <small>Añadir aquí</small>
        </button>
    `).join("");
}

function mostrarFormularioSeries(indiceRutina, idEjercicio) {
    const ejercicio = obtenerEjercicios().find(e => e.id === idEjercicio);
    if (!ejercicio) return;
    contenido.innerHTML = `
        <h2>${escaparHTML(ejercicio.nombre)}</h2>
        <label>Número de series</label>
        <input type="number" id="seriesEjercicio" min="1" value="3">
        <label>Repeticiones por serie</label>
        <input type="number" id="repeticionesEjercicio" min="1" value="12">
        <button onclick="confirmarAñadirEjercicio(${indiceRutina}, '${idEjercicio}')" style="width:100%; margin-top:10px;">Guardar</button>
        <button class="boton-texto texto-volver" onclick="verRutina(${indiceRutina})" style="width:100%; margin-top:10px;">Cancelar</button>
    `;
}

function confirmarAñadirEjercicio(indiceRutina, idEjercicio) {
    const series = parseInt(document.getElementById("seriesEjercicio").value);
    const repeticiones = parseInt(document.getElementById("repeticionesEjercicio").value);
    if (!series || !repeticiones) { alert("Introduce valores válidos."); return; }

    rutinas[indiceRutina].ejercicios.push({ ejercicioId: idEjercicio, series, repeticiones });
    guardarDatos();
    verRutina(indiceRutina);
}

function eliminarEjercicioRutina(indiceRutina, posicion) {
    confirmar("¿Quitar este ejercicio de la rutina?", function() {
        leerEdicionRutina(indiceRutina);
        rutinas[indiceRutina].ejercicios.splice(posicion, 1);
        guardarDatos();
        verRutina(indiceRutina);
    });
}

function iniciarEntrenamientoEnVivo(indiceRutina) {
    const rutina = rutinas[indiceRutina];
    if (!rutina || rutina.ejercicios.length === 0) { aviso("Añade ejercicios primero."); return; }

    let html = `
        <h2>Entrenamiento: ${escaparHTML(rutina.nombre)}</h2>
        <p>Ajusta las repeticiones que hagas en cada serie.</p>
        <div class="reloj reloj-compacto">
            <div id="tiempo">00:00</div>
            <div class="grid-opciones-descanso">
                <button onclick="cronoDescanso(60)">Descanso 60s</button>
                <button onclick="cronoDescanso(90)">Descanso 90s</button>
                <button onclick="cronoDescanso(120)">Descanso 2 min</button>
                <button class="boton-pausar" onclick="cronoParar()">Parar</button>
            </div>
        </div>
    `;

    rutina.ejercicios.forEach((item, indexEj) => {
        const ejercicio = obtenerEjercicios().find(e => e.id === item.ejercicioId);
        if (!ejercicio) return;

        html += `
            <div class="tarjeta-ejercicio">
                <h3>${escaparHTML(ejercicio.nombre)}</h3>
                <table class="tabla-series-vivo">
                    <thead><tr><th>Serie</th><th>Reps</th></tr></thead>
                    <tbody>
        `;

        for (let s = 1; s <= item.series; s++) {
            html += `
                <tr>
                    <td>#${s}</td>
                    <td><input type="number" id="reps_${indexEj}_${s}" value="${item.repeticiones}" onfocus="this.select()"></td>
                </tr>
            `;
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;
    });

    html += `
        <button style="width:100%; margin-top:20px; min-height:55px; background:#28a745; color:#fff;" onclick="finalizarEntrenamientoEnVivo(${indiceRutina})">✔ Finalizar y Guardar</button>
        <button class="boton-texto texto-volver" onclick="verRutina(${indiceRutina})" style="width:100%; margin-top:10px;">Cancelar</button>
    `;

    contenido.innerHTML = html;
    actualizarVistaCronometro();
}

function finalizarEntrenamientoEnVivo(indiceRutina) {
    const rutina = rutinas[indiceRutina];
    if (!rutina) return;

    const detalle = [];
    let totalSeries = 0;
    let totalReps = 0;

    rutina.ejercicios.forEach((item, indexEj) => {
        const ejercicio = obtenerEjercicios().find(e => e.id === item.ejercicioId);
        if (!ejercicio) return;

        const series = [];
        for (let s = 1; s <= item.series; s++) {
            const repsInput = document.getElementById(`reps_${indexEj}_${s}`);
            const reps = parseInt(repsInput ? repsInput.value : 0) || 0;
            series.push({ reps });
            totalSeries++;
            totalReps += reps;
        }

        detalle.push({ ejercicioId: item.ejercicioId, nombre: ejercicio.nombre, series });
    });

    historial.push({
        id: generarId(),
        fecha: obtenerFechaActual(),
        rutina: rutina.nombre,
        ejercicios: detalle.length,
        series: totalSeries,
        repeticiones: totalReps,
        detalle: detalle
    });

    guardarDatos();
    cronoReiniciar();
    aviso(`¡Entrenamiento guardado!\n${totalSeries} series · ${totalReps} repeticiones`);
    abrirDia(obtenerFechaActual());
}

/* =====================================================
   6. PROGRESO CORPORAL
===================================================== */

const camposCuerpo = [
    { clave: "peso", nombre: "Peso", unidad: "kg" },
    { clave: "cintura", nombre: "Cintura", unidad: "cm" },
    { clave: "pecho", nombre: "Pecho", unidad: "cm" },
    { clave: "cadera", nombre: "Cadera", unidad: "cm" }
];

const metricasGrafica = [
    camposCuerpo[0],
    { clave: "imc", nombre: "IMC", unidad: "" },
    ...camposCuerpo.slice(1)
];

function calcularIMC(pesoKg) {
    if (!alturaCm || !pesoKg) return null;
    const metros = alturaCm / 100;
    return pesoKg / (metros * metros);
}

function categoriaIMC(imc) {
    if (imc < 18.5) return "Bajo peso";
    if (imc < 25) return "Peso normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidad";
}

function registrosOrdenados() {
    return medidasCuerpo.slice().sort((a, b) => a.fecha.localeCompare(b.fecha));
}

function valorMetrica(registro, clave) {
    if (clave === "imc") return calcularIMC(registro.peso);
    const valor = registro[clave];
    return (typeof valor === "number" && valor > 0) ? valor : null;
}

function serieMetrica(clave) {
    return registrosOrdenados()
        .map(r => ({ fecha: r.fecha, valor: valorMetrica(r, clave) }))
        .filter(p => p.valor !== null);
}

function obtenerUltimoPeso() {
    const serie = serieMetrica("peso");
    return serie.length ? serie[serie.length - 1] : null;
}

function cambioMetrica(clave) {
    const serie = serieMetrica(clave);
    if (serie.length < 2) return null;
    const primero = serie[0];
    const ultimo = serie[serie.length - 1];
    return { primero: primero, ultimo: ultimo, cambio: ultimo.valor - primero.valor };
}

function mostrarProgreso() {
    const pesos = serieMetrica("peso");
    const ultimoPeso = pesos.length ? pesos[pesos.length - 1] : null;
    const imc = ultimoPeso ? calcularIMC(ultimoPeso.valor) : null;
    const cinturas = serieMetrica("cintura");
    const ultimaCintura = cinturas.length ? cinturas[cinturas.length - 1] : null;
    const ica = (ultimaCintura && alturaCm) ? ultimaCintura.valor / alturaCm : null;

    contenido.innerHTML = `
        <span data-vista="progreso" hidden></span>
        <h2>Progreso corporal</h2>
        <button onclick="mostrarFormularioCuerpo()" style="width:100%;">+ Añadir registro</button>

        <div class="resumen-progreso">
            <div class="dato-resumen"><strong>${ultimoPeso ? formatoNum(ultimoPeso.valor) : "–"}</strong><span>Peso actual (kg)</span></div>
            <div class="dato-resumen"><strong>${imc ? formatoNum(imc) : "–"}</strong><span>${imc ? "IMC · " + categoriaIMC(imc) : "IMC"}</span></div>
            <div class="dato-resumen"><strong>${ultimaCintura ? formatoNum(ultimaCintura.valor) : "–"}</strong><span>Cintura (cm)</span></div>
            <div class="dato-resumen"><strong>${ica ? formatoNum(ica, 2) : "–"}</strong><span>Cintura / altura (ideal &lt; 0,5)</span></div>
            <button class="dato-resumen dato-boton" onclick="mostrarFormularioAltura()">
                <strong>${alturaCm ? formatoNum(alturaCm) : "–"}</strong>
                <span>${alturaCm ? "Altura (cm) · toca para cambiar" : "Toca para indicar tu altura"}</span>
            </button>
        </div>

        ${htmlTendencia(pesos)}
        ${lecturaCorporal()}

        <h3 style="margin-top: 20px;">📈 Evolución</h3>
        <div id="zonaGrafica">${htmlZonaGrafica()}</div>

        <h3 style="margin-top: 25px;">Comparativa desde el primer registro</h3>
        ${htmlComparativa()}

        <h3 style="margin-top: 25px;">Registros</h3>
        ${htmlRegistrosCuerpo()}
    `;
}

function htmlTendencia(pesos) {
    if (pesos.length < 2) {
        return `<div class="tarjeta-rutina"><p>Añade al menos dos registros de peso para ver tu tendencia.</p></div>`;
    }

    const ultimo = pesos[pesos.length - 1];
    const limite = new Date();
    limite.setDate(limite.getDate() - 30);
    const limiteTexto = fechaATexto(limite);
    const recientes = pesos.filter(p => p.fecha >= limiteTexto);
    const base = recientes.length >= 2 ? recientes[0] : pesos[pesos.length - 2];
    const cambio = ultimo.valor - base.valor;

    let icono, texto;
    if (Math.abs(cambio) < 0.3) { icono = "➖"; texto = "Tu peso se mantiene estable"; }
    else if (cambio < 0) { icono = "📉"; texto = "Estás perdiendo peso"; }
    else { icono = "📈"; texto = "Estás ganando peso"; }

    return `
        <div class="tarjeta-rutina tendencia">
            <h3>${icono} ${texto}</h3>
            <p>${cambio > 0 ? "+" : ""}${formatoNum(cambio)} kg desde el ${formatearFecha(base.fecha)}</p>
        </div>
    `;
}

function lecturaCorporal() {
    const peso = cambioMetrica("peso");
    const cintura = cambioMetrica("cintura");
    if (!peso || !cintura) return "";

    const pecho = cambioMetrica("pecho");
    const crecePecho = pecho && pecho.cambio >= 0.5;
    let texto = "";

    if (peso.cambio <= -0.3 && cintura.cambio <= -0.5) {
        texto = "Bajan el peso y la cintura: estás adelgazando.";
    } else if (peso.cambio >= 0.3 && cintura.cambio < 0.5 && crecePecho) {
        texto = "Sube el peso, la cintura se mantiene y crece el pecho: señal de ganancia de volumen.";
    } else if (peso.cambio >= 0.3 && cintura.cambio >= 0.5) {
        texto = "Suben el peso y la cintura: estás ganando peso también en la zona abdominal.";
    }

    if (!texto) return "";
    return `
        <div class="tarjeta-rutina">
            <h3>🔎 Lectura orientativa</h3>
            <p>${texto}</p>
            <p class="texto-ultima">Comparando tus primeros y últimos registros. Es solo una orientación.</p>
        </div>
    `;
}

function htmlZonaGrafica() {
    const periodos = [[30, "1 mes"], [90, "3 meses"], [180, "6 meses"], [0, "Todo"]];

    const selectorPeriodo = periodos.map(p =>
        `<button class="chip chip-tiempo ${p[0] === periodoActual ? "activo" : ""}" onclick="elegirPeriodo(${p[0]})">${p[1]}</button>`
    ).join("");

    const selectorMetrica = metricasGrafica.map(m =>
        `<button class="chip chip-medida ${m.clave === metricaActual ? "activo" : ""}" onclick="elegirMetrica('${m.clave}')">${m.nombre}</button>`
    ).join("");

    return `
        <p class="titulo-chips">⏱ Periodo</p>
        <div class="selector-chips">${selectorPeriodo}</div>
        <p class="titulo-chips">📏 Medida</p>
        <div class="selector-chips">${selectorMetrica}</div>
        ${htmlGrafica()}
    `;
}

function elegirPeriodo(dias) {
    periodoActual = dias;
    actualizarGrafica();
}

function elegirMetrica(clave) {
    metricaActual = clave;
    actualizarGrafica();
}

function actualizarGrafica() {
    const zona = document.getElementById("zonaGrafica");
    if (zona) zona.innerHTML = htmlZonaGrafica();
}

function htmlGrafica() {
    const metrica = metricasGrafica.find(m => m.clave === metricaActual) || metricasGrafica[0];
    let puntos = serieMetrica(metrica.clave);

    if (periodoActual > 0) {
        const limite = new Date();
        limite.setDate(limite.getDate() - periodoActual);
        const limiteTexto = fechaATexto(limite);
        puntos = puntos.filter(p => p.fecha >= limiteTexto);
    }

    if (puntos.length === 0) {
        const mensaje = (metrica.clave === "imc" && !alturaCm)
            ? "Guarda tu altura para ver la evolución del IMC."
            : `Sin registros de ${metrica.nombre.toLowerCase()} en este periodo.`;
        return `<div class="caja-grafica"><p>${mensaje}</p></div>`;
    }

    const W = 320, H = 210, izq = 40, der = 14, arriba = 18, abajo = 30;

    const valores = puntos.map(p => p.valor);
    let min = Math.min(...valores);
    let max = Math.max(...valores);
    if (min === max) { min -= 1; max += 1; }
    const margen = (max - min) * 0.15;
    min -= margen;
    max += margen;

    const t0 = textoAFecha(puntos[0].fecha).getTime();
    const t1 = textoAFecha(puntos[puntos.length - 1].fecha).getTime();

    const xDe = function(fecha) {
        if (puntos.length === 1 || t1 === t0) return izq + (W - izq - der) / 2;
        return izq + ((textoAFecha(fecha).getTime() - t0) / (t1 - t0)) * (W - izq - der);
    };
    const yDe = function(valor) {
        return arriba + (1 - (valor - min) / (max - min)) * (H - arriba - abajo);
    };

    const decimalesEje = (max - min) > 10 ? 0 : 1;
    let rejilla = "";
    for (let i = 0; i <= 3; i++) {
        const valor = min + ((max - min) * i) / 3;
        const y = yDe(valor);
        rejilla += `<line class="grafica-rejilla" x1="${izq}" y1="${y.toFixed(1)}" x2="${W - der}" y2="${y.toFixed(1)}"/>`;
        rejilla += `<text class="grafica-texto" x="${izq - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end">${formatoNum(valor, decimalesEje)}</text>`;
    }

    const coords = puntos.map(p => ({ x: xDe(p.fecha), y: yDe(p.valor), valor: p.valor, fecha: p.fecha }));

    const linea = coords.length > 1
        ? `<polyline class="grafica-linea" points="${coords.map(c => c.x.toFixed(1) + "," + c.y.toFixed(1)).join(" ")}"/>`
        : "";

    const circulos = coords.map(c => `<circle class="grafica-punto" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="4"/>`).join("");

    const etiquetasValor = coords.length <= 8
        ? coords.map(c => `<text class="grafica-texto grafica-valor" x="${c.x.toFixed(1)}" y="${(c.y - 9).toFixed(1)}" text-anchor="middle">${formatoNum(c.valor)}</text>`).join("")
        : "";

    const puntosEjeX = coords.length > 1 ? [coords[0], coords[coords.length - 1]] : [coords[0]];
    const etiquetasFecha = puntosEjeX.map(c => `<text class="grafica-texto" x="${c.x.toFixed(1)}" y="${H - 8}" text-anchor="middle">${formatearFechaCorta(c.fecha)}</text>`).join("");

    const primero = puntos[0];
    const ultimo = puntos[puntos.length - 1];
    const cambio = ultimo.valor - primero.valor;
    const unidad = metrica.unidad ? " " + metrica.unidad : "";
    const resumen = puntos.length > 1
        ? `${formatoNum(primero.valor)} → ${formatoNum(ultimo.valor)}${unidad} (${cambio > 0 ? "+" : ""}${formatoNum(cambio)})`
        : `Un solo registro: ${formatoNum(ultimo.valor)}${unidad}`;

    return `
        <div class="caja-grafica">
            <svg class="grafica" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica de ${metrica.nombre}">
                ${rejilla}
                ${linea}
                ${circulos}
                ${etiquetasValor}
                ${etiquetasFecha}
            </svg>
            <p class="texto-ultima" style="text-align:center;">${metrica.nombre}: ${resumen}</p>
        </div>
    `;
}

function htmlComparativa() {
    const filas = metricasGrafica.map(m => {
        const c = cambioMetrica(m.clave);
        if (!c) return "";
        const redondeado = Math.round(c.cambio * 10) / 10;
        const flecha = redondeado > 0 ? "▲ +" : (redondeado < 0 ? "▼ " : "= ");
        return `<tr>
            <td>${m.nombre}</td>
            <td>${formatoNum(c.primero.valor)}</td>
            <td>${formatoNum(c.ultimo.valor)}</td>
            <td>${flecha}${formatoNum(c.cambio)}</td>
        </tr>`;
    }).join("");

    if (!filas) return "<p>Cuando tengas al menos dos registros verás aquí cómo cambia cada medida.</p>";

    return `
        <table class="tabla-comparativa">
            <thead><tr><th>Medida</th><th>Inicio</th><th>Ahora</th><th>Cambio</th></tr></thead>
            <tbody>${filas}</tbody>
        </table>
    `;
}

function htmlRegistrosCuerpo() {
    const lista = registrosOrdenados().reverse();
    if (lista.length === 0) return "<p>Todavía no hay registros. Pulsa «Añadir registro» para empezar.</p>";

    return lista.map(r => {
        const datos = camposCuerpo
            .filter(c => typeof r[c.clave] === "number" && r[c.clave] > 0)
            .map(c => `${c.nombre}: ${formatoNum(r[c.clave])} ${c.unidad}`)
            .join(" · ");
        const imc = calcularIMC(r.peso);

        return `
            <div class="tarjeta-rutina">
                <h3>${formatearFecha(r.fecha)}</h3>
                <p>${escaparHTML(datos)}${imc ? " · IMC: " + formatoNum(imc) : ""}</p>
                <button class="boton-texto" onclick="mostrarFormularioCuerpo('${r.id}')">Ver / editar</button>
            </div>
        `;
    }).join("");
}

function mostrarFormularioCuerpo(id) {
    cuerpoEditandoId = id || null;
    const registro = id ? medidasCuerpo.find(r => r.id === id) : null;
    const fecha = registro ? registro.fecha : obtenerFechaActual();

    const campos = camposCuerpo.map(c => {
        const serie = serieMetrica(c.clave);
        const ultimo = serie.length ? serie[serie.length - 1].valor : null;
        const placeholder = ultimo ? "Último: " + formatoNum(ultimo) : "Opcional";
        const valor = (registro && registro[c.clave]) ? registro[c.clave] : "";
        return `
            <label>${c.nombre} (${c.unidad})</label>
            <input type="number" step="0.1" min="0" inputmode="decimal" id="cuerpo_${c.clave}" placeholder="${placeholder}" value="${valor}">
        `;
    }).join("");

    contenido.innerHTML = `
        <h2>${registro ? "Editar registro" : "Nuevo registro"}</h2>
        <p>Rellena solo lo que quieras medir hoy.</p>
        <label>Fecha</label>
        <input type="date" id="cuerpo_fecha" value="${fecha}">
        ${campos}
        <button onclick="guardarRegistroCuerpo()" style="width:100%; margin-top:10px;">Guardar</button>
        <button class="boton-texto texto-volver" onclick="mostrarProgreso()" style="width:100%; margin-top:10px;">Cancelar</button>
        ${registro ? `<button class="boton-borrar" onclick="eliminarRegistroCuerpo('${registro.id}')" style="width:100%; margin-top:10px;">🗑 Eliminar registro</button>` : ""}
    `;
}

function guardarRegistroCuerpo() {
    const fecha = document.getElementById("cuerpo_fecha").value;
    if (!fecha) { aviso("Elige una fecha."); return; }
    if (fecha > obtenerFechaActual()) { aviso("La fecha no puede ser futura."); return; }

    const valores = {};
    let alguno = false;
    camposCuerpo.forEach(c => {
        const texto = String(document.getElementById("cuerpo_" + c.clave).value).replace(",", ".");
        const numero = parseFloat(texto);
        if (numero > 0 && numero < 1000) {
            valores[c.clave] = numero;
            alguno = true;
        }
    });
    if (!alguno) { aviso("Rellena al menos un dato."); return; }

    const existente = medidasCuerpo.find(r => r.fecha === fecha && r.id !== cuerpoEditandoId);

    if (cuerpoEditandoId) {
        if (existente) { aviso("Ya tienes un registro en esa fecha."); return; }
        const indice = medidasCuerpo.findIndex(r => r.id === cuerpoEditandoId);
        if (indice >= 0) medidasCuerpo[indice] = Object.assign({ id: cuerpoEditandoId, fecha: fecha }, valores);
    } else if (existente) {
        Object.assign(existente, valores);
    } else {
        medidasCuerpo.push(Object.assign({ id: generarId(), fecha: fecha }, valores));
    }

    cuerpoEditandoId = null;
    guardarDatos();
    aviso("Registro guardado.");
    mostrarProgreso();
}

function eliminarRegistroCuerpo(id) {
    confirmar("¿Eliminar este registro corporal?", function() {
        medidasCuerpo = medidasCuerpo.filter(r => r.id !== id);
        guardarDatos();
        aviso("Registro eliminado.");
        mostrarProgreso();
    });
}

function mostrarFormularioAltura() {
    contenido.innerHTML = `
        <h2>Altura</h2>
        <p>La necesito para calcular el IMC y la relación cintura/altura.</p>
        <label>Altura en cm</label>
        <input type="number" id="inputAltura" inputmode="decimal" placeholder="Ej: 175" value="${alturaCm || ""}">
        <button onclick="guardarAltura()" style="width:100%; margin-top:10px;">Guardar</button>
        <button class="boton-texto texto-volver" onclick="mostrarProgreso()" style="width:100%; margin-top:10px;">Cancelar</button>
    `;
}

function guardarAltura() {
    const texto = String(document.getElementById("inputAltura").value).replace(",", ".");
    const valor = parseFloat(texto);
    if (!(valor >= 100 && valor <= 250)) { aviso("Introduce una altura entre 100 y 250 cm."); return; }
    alturaCm = valor;
    guardarDatos();
    aviso("Altura guardada.");
    mostrarProgreso();
}

/* =====================================================
   7. CRONÓMETRO Y DESCANSO
===================================================== */

function mostrarCronometro() {
    contenido.innerHTML = `
        <span data-vista="cronometro" hidden></span>
        <h2>Cronómetro y descanso</h2>
        <div class="reloj">
            <p id="etiquetaCrono">Parado</p>
            <div id="tiempo">00:00</div>
            <div class="botones-reloj">
                <button class="boton-iniciar" onclick="cronoIniciar()">Iniciar</button>
                <button class="boton-pausar" onclick="cronoParar()">Parar</button>
                <button onclick="cronoReiniciar()">Reiniciar</button>
            </div>
            <div class="seccion-descanso">
                <h3>Descanso entre series</h3>
                <div class="grid-opciones-descanso">
                    <button onclick="cronoDescanso(30)">30 seg</button>
                    <button onclick="cronoDescanso(45)">45 seg</button>
                    <button onclick="cronoDescanso(60)">60 seg</button>
                    <button onclick="cronoDescanso(90)">90 seg</button>
                    <button onclick="cronoDescanso(120)">2 min</button>
                    <button onclick="cronoDescanso(180)">3 min</button>
                </div>
            </div>
        </div>
    `;
    actualizarVistaCronometro();
}

function cronoMsActual() {
    return cronoModo === "subida" ? cronoMs + (Date.now() - cronoInicio) : cronoMs;
}

function cronoIniciar() {
    if (cronoModo === "subida") return;
    clearInterval(cronoIntervalo);
    if (cronoModo === "bajada") cronoMs = 0;
    cronoModo = "subida";
    cronoColor = "verde";
    cronoInicio = Date.now();
    cronoIntervalo = setInterval(actualizarVistaCronometro, 250);
    actualizarVistaCronometro();
}

function cronoParar() {
    if (cronoModo === "subida") cronoMs += Date.now() - cronoInicio;
    else if (cronoModo === "bajada") cronoMs = 0;
    cronoModo = "parado";
    cronoColor = "rojo";
    clearInterval(cronoIntervalo);
    actualizarVistaCronometro();
}

function cronoReiniciar() {
    clearInterval(cronoIntervalo);
    cronoModo = "parado";
    cronoColor = "";
    cronoMs = 0;
    actualizarVistaCronometro();
}

function cronoDescanso(segundos) {
    clearInterval(cronoIntervalo);
    cronoMs = 0;
    cronoModo = "bajada";
    cronoColor = "naranja";
    cronoFin = Date.now() + segundos * 1000;
    cronoIntervalo = setInterval(actualizarVistaCronometro, 250);
    actualizarVistaCronometro();
}

function finDescanso() {
    clearInterval(cronoIntervalo);
    cronoModo = "parado";
    cronoColor = "";
    cronoMs = 0;
    actualizarVistaCronometro();
    if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]);
    aviso("⏱ ¡Descanso terminado!");
}

function actualizarVistaCronometro() {
    document.querySelectorAll(".reloj").forEach(function(caja) {
        caja.classList.remove("brillo-verde", "brillo-rojo", "brillo-naranja");
        if (cronoColor) caja.classList.add("brillo-" + cronoColor);
    });

    let segundos;

    if (cronoModo === "bajada") {
        const restante = Math.ceil((cronoFin - Date.now()) / 1000);
        if (restante <= 0) { finDescanso(); return; }
        segundos = restante;
    } else {
        segundos = Math.floor(cronoMsActual() / 1000);
    }

    const texto = document.getElementById("tiempo");
    if (texto) {
        const mins = Math.floor(segundos / 60);
        const segs = segundos % 60;
        texto.innerText = `${String(mins).padStart(2, "0")}:${String(segs).padStart(2, "0")}`;
    }

    const etiqueta = document.getElementById("etiquetaCrono");
    if (etiqueta) {
        etiqueta.innerText = cronoModo === "bajada" ? "Descansando…" : (cronoModo === "subida" ? "En marcha" : "Parado");
    }
}

/* =====================================================
   8. CALENDARIO
===================================================== */

const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const nombresDias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const leyendaCalendario = '<span class="leyenda"><span class="ley"><i class="ley-hoy"></i>Hoy</span><span class="ley"><i class="ley-linea" style="background:#D9A514"></i>Entrenamiento</span><span class="ley"><i class="ley-linea" style="background:#4FC3F7"></i>Anotación</span><span class="ley"><i class="ley-linea" style="background:#E65100"></i>Cardio</span></span>';

function hayEntreno(fecha) {
    return historial.some(item => item.fecha === fecha);
}

function hayNotas(fecha) {
    return Array.isArray(notasDias[fecha]) && notasDias[fecha].length > 0;
}

function hayCarrera(fecha) {
    return carreras.some(c => c.fecha === fecha);
}

function subirAlContenido() {
    if (contenido) contenido.scrollIntoView({ behavior: "smooth", block: "start" });
}

function mostrarCalendario() {
    anioActual = new Date().getFullYear();
    mesActual = new Date().getMonth();
    diaSeleccionado = null;
    verAnio();
}

function verAnio() {
    const hoy = new Date();
    let meses = "";

    for (let m = 0; m < 12; m++) {
        const esActual = (m === hoy.getMonth() && anioActual === hoy.getFullYear());
        meses += `
            <button class="mini-mes ${esActual ? "mini-mes-actual" : ""}" onclick="verMes(${m})">
                <span class="mini-mes-titulo">${nombresMeses[m]}</span>
                <span class="mini-mes-dias">${htmlMiniMes(anioActual, m)}</span>
            </button>
        `;
    }

    contenido.innerHTML = `
        <span data-vista="calendario" hidden></span>
        <h2>Calendario</h2>
        <div class="navegacion-calendario">
            <button class="boton-calendario-nav" onclick="cambiarAnio(-1)">◀</button>
            <h3>${anioActual}</h3>
            <button class="boton-calendario-nav" onclick="cambiarAnio(1)">▶</button>
        </div>
        <div class="anio-grid">${meses}</div>
        <p class="texto-ultima">Toca un mes para verlo. ${leyendaCalendario}</p>
    `;
    subirAlContenido();
}

function cambiarAnio(direccion) {
    anioActual += direccion;
    verAnio();
}

function htmlMiniMes(anio, mes) {
    const primerDia = new Date(anio, mes, 1).getDay();
    const desplazamiento = primerDia === 0 ? 6 : primerDia - 1;
    const totalDias = new Date(anio, mes + 1, 0).getDate();
    const hoy = obtenerFechaActual();

    let html = "";
    for (let i = 0; i < desplazamiento; i++) html += `<span class="mini-dia"></span>`;

    for (let dia = 1; dia <= totalDias; dia++) {
        const fecha = fechaATexto(new Date(anio, mes, dia));
        let clases = "mini-dia";
        if (fecha === hoy) clases += " mini-hoy";

        const sombras = [];
        if (hayEntreno(fecha)) sombras.push("inset 0 -2px 0 #D9A514");
        if (hayNotas(fecha)) sombras.push("inset 0 -4px 0 #4FC3F7");
        if (hayCarrera(fecha)) sombras.push("inset 0 -6px 0 #E65100");
        const estilo = sombras.length ? ` style="box-shadow: ${sombras.join(", ")}"` : "";

        html += `<span class="${clases}"${estilo}>${dia}</span>`;
    }
    return html;
}

function verMes(mes) {
    mesActual = mes;
    diaSeleccionado = null;
    mostrarMes();
}

function mostrarMes() {
    contenido.innerHTML = `
        <button class="boton-volver-cal" onclick="verAnio()">◀ ${anioActual}</button>
        <div class="navegacion-calendario">
            <button class="boton-calendario-nav" onclick="cambiarMes(-1)">◀</button>
            <h3>${nombresMeses[mesActual]} ${anioActual}</h3>
            <button class="boton-calendario-nav" onclick="cambiarMes(1)">▶</button>
        </div>
        <div class="dias-semana"><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
        <div id="rejillaCalendario" class="calendario-grid"></div>
        <p class="texto-ultima" style="margin-top: 15px;">${leyendaCalendario} Toca un día para verlo.</p>
    `;
    generarRejillaCalendario();
    subirAlContenido();
}

function cambiarMes(direccion) {
    mesActual += direccion;
    if (mesActual > 11) { mesActual = 0; anioActual++; }
    if (mesActual < 0) { mesActual = 11; anioActual--; }
    mostrarMes();
}

function generarRejillaCalendario() {
    const rejilla = document.getElementById("rejillaCalendario");
    if (!rejilla) return;

    const primerDia = new Date(anioActual, mesActual, 1).getDay();
    const totalDias = new Date(anioActual, mesActual + 1, 0).getDate();
    const desplazamiento = primerDia === 0 ? 6 : primerDia - 1;
    const hoy = obtenerFechaActual();

    let html = "";
    for (let i = 0; i < desplazamiento; i++) html += `<div class="dia-vacio"></div>`;

    for (let dia = 1; dia <= totalDias; dia++) {
        const fecha = fechaATexto(new Date(anioActual, mesActual, dia));
        let clases = "dia-calendario";
        if (fecha === hoy) clases += " dia-hoy";

        let barras = "";
        if (hayEntreno(fecha)) barras += '<span class="barra-entreno"></span>';
        if (hayNotas(fecha)) barras += '<span class="barra-nota"></span>';
        if (hayCarrera(fecha)) barras += '<span class="barra-carrera"></span>';

        html += `<button class="${clases}" onclick="abrirDia('${fecha}')">${dia}${barras ? `<span class="barras-dia">${barras}</span>` : ""}</button>`;
    }

    rejilla.innerHTML = html;
}

function abrirDia(fecha) {
    const f = textoAFecha(fecha);
    anioActual = f.getFullYear();
    mesActual = f.getMonth();
    diaSeleccionado = fecha;
    notaEditandoId = null;
    mostrarDia();
    subirAlContenido();
}

function cambiarDia(delta) {
    const f = textoAFecha(diaSeleccionado);
    f.setDate(f.getDate() + delta);
    abrirDia(fechaATexto(f));
}

function resumenEntreno(item) {
    let texto = `${item.ejercicios} ejercicios`;
    const series = item.series ?? (item.detalle ? item.detalle.reduce((t, d) => t + d.series.length, 0) : null);
    if (series) texto += ` · ${series} series`;
    return texto;
}

function htmlSeriesPlano(item) {
    if (!item.detalle || item.detalle.length === 0) return "";
    return item.detalle.map(d => `
        <p><strong>${escaparHTML(d.nombre)}</strong><br>${d.series.map((s, i) => `Serie ${i + 1}: ${s.reps} reps`).join(" · ")}</p>
    `).join("");
}

function mostrarDia() {
    const fecha = diaSeleccionado;
    const f = textoAFecha(fecha);
    const entrenos = historial.filter(item => item.fecha === fecha);
    const runs = carreras.filter(c => c.fecha === fecha);
    const notas = notasDias[fecha] || [];
    const editando = notaEditandoId ? notas.find(n => n.id === notaEditandoId) : null;

    const htmlEntrenos = entrenos.length === 0
        ? "<p>No hay entrenamientos este día.</p>"
        : entrenos.map(item => `
            <details class="tarjeta-rutina desplegable">
                <summary><strong>${escaparHTML(item.rutina)}</strong><br><span>${resumenEntreno(item)} · toca para abrir</span></summary>
                ${htmlSeriesPlano(item)}
                <button class="boton-borrar" style="margin-top: 10px;" onclick="eliminarHistorial('${item.id}')">🗑 Eliminar entrenamiento</button>
            </details>
        `).join("");

    const htmlCarreras = runs.length === 0 ? "" : `
        <h3 style="margin-top: 25px;">🏃 Carreras</h3>
        ${runs.map(c => `
            <div class="tarjeta-rutina">
                <p>${resumenCarrera(c)}</p>
                <button class="boton-texto" onclick="verCarrera('${c.id}', 'dia')">Ver carrera</button>
            </div>
        `).join("")}
    `;

    const htmlNotas = notas.length === 0
        ? "<p>No hay anotaciones este día.</p>"
        : notas.map(n => `
            <div class="nota-dia" onclick="editarNota('${n.id}')">
                <div class="nota-texto">${escaparHTML(n.texto)}</div>
                <span class="nota-editar">✏️</span>
            </div>
        `).join("");

    contenido.innerHTML = `
        <button class="boton-volver-cal" onclick="mostrarMes()">◀ ${nombresMeses[mesActual]}</button>
        <div class="navegacion-calendario">
            <button class="boton-calendario-nav" onclick="cambiarDia(-1)">◀</button>
            <div class="titulo-dia">
                <h3>${f.getDate()} de ${nombresMeses[f.getMonth()].toLowerCase()}</h3>
                <p>${nombresDias[f.getDay()]} ${f.getFullYear()}</p>
            </div>
            <button class="boton-calendario-nav" onclick="cambiarDia(1)">▶</button>
        </div>

        <h3 style="margin-top: 20px;">🏋️ Entrenamientos</h3>
        ${htmlEntrenos}

        ${htmlCarreras}

        <h3 style="margin-top: 25px;">📝 Anotaciones</h3>
        ${htmlNotas}

        <div class="tarjeta-rutina">
            <h3>${editando ? "Editar anotación" : "Nueva anotación"}</h3>
            <textarea id="notaTexto" placeholder="Ej: Dolor de hombro, dormí poco, subir peso la próxima vez...">${editando ? escaparHTML(editando.texto) : ""}</textarea>
            <button onclick="guardarNota()" style="width:100%;">${editando ? "Guardar cambios" : "+ Añadir anotación"}</button>
            ${editando ? `<button class="boton-texto texto-volver" onclick="cancelarEdicionNota()" style="width:100%; margin-top:10px;">Cancelar</button>
            <button class="boton-borrar" onclick="eliminarNota('${editando.id}')" style="width:100%; margin-top:10px;">🗑 Eliminar anotación</button>` : ""}
        </div>
    `;
}

function guardarNota() {
    const texto = document.getElementById("notaTexto").value.trim();
    if (!texto) { aviso("Escribe la anotación."); return; }

    if (!notasDias[diaSeleccionado]) notasDias[diaSeleccionado] = [];

    if (notaEditandoId) {
        const nota = notasDias[diaSeleccionado].find(n => n.id === notaEditandoId);
        if (nota) nota.texto = texto;
    } else {
        notasDias[diaSeleccionado].push({ id: generarId(), texto: texto });
    }

    notaEditandoId = null;
    guardarDatos();
    aviso("Anotación guardada.");
    mostrarDia();
}

function editarNota(id) {
    notaEditandoId = id;
    mostrarDia();
    const caja = document.getElementById("notaTexto");
    if (caja) {
        caja.scrollIntoView({ behavior: "smooth", block: "center" });
        caja.focus();
    }
}

function cancelarEdicionNota() {
    notaEditandoId = null;
    mostrarDia();
}

function eliminarNota(id) {
    confirmar("¿Eliminar esta anotación?", function() {
        notasDias[diaSeleccionado] = (notasDias[diaSeleccionado] || []).filter(n => n.id !== id);
        if (notasDias[diaSeleccionado].length === 0) delete notasDias[diaSeleccionado];
        notaEditandoId = null;
        guardarDatos();
        aviso("Anotación eliminada.");
        mostrarDia();
    });
}

function eliminarHistorial(id) {
    confirmar("¿Eliminar este entrenamiento del historial?", function() {
        historial = historial.filter(item => item.id !== id);
        guardarDatos();
        aviso("Entrenamiento eliminado.");
        if (diaSeleccionado) mostrarDia();
        else verAnio();
    });
}

/* =====================================================
   9. AJUSTES
===================================================== */

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
    return `
        <div class="grupo-colores">
            ${paletaColores.map(c => `
                <button class="muestra-color ${actual && c[0].toLowerCase() === actual.toLowerCase() ? "activo" : ""}"
                        style="background: ${c[0]};" aria-label="${c[1]}"
                        onclick="${funcion}('${c[0]}')"></button>
            `).join("")}
        </div>
        <label>Otro color</label>
        <input type="color" value="${actual || "#2196F3"}" onchange="${funcion}(this.value)">
    `;
}

function mostrarAjustes() {
    const temas = [["oscuro", "Oscuro clásico"], ["oled", "Negro OLED"], ["claro", "Claro"]];
    const letras = [["pequenia", "Pequeña"], ["mediana", "Normal"], ["grande", "Grande"]];

    const nombreTema = temas.find(t => t[0] === temaActual)[1];
    const nombreLetra = letras.find(l => l[0] === letraActual)[1];
    const colorNombre = (paletaColores.find(c => c[0].toLowerCase() === colorActual.toLowerCase()) || ["", "Personalizado"])[1];

    const hayMenuPersonal = colorMenuGlobal !== "" || Object.keys(coloresMenu).length > 0;
    const colorObjetivo = menuSeleccionado === "todos" ? (colorMenuGlobal || colorActual) : colorDeBoton(menuSeleccionado);

    const botonOpcion = (valor, texto, actual, funcion) => `
        <button class="boton-tema ${valor === actual ? "activo" : ""}" onclick="${funcion}('${valor}')">${texto}</button>
    `;

    const ajuste = (clave, titulo, valor, cuerpo) => `
        <details class="ajuste" ${ajusteAbierto === clave ? "open" : ""}
                 ontoggle="if(this.open){ajusteAbierto='${clave}'}else if(ajusteAbierto==='${clave}'){ajusteAbierto=''}">
            <summary>${titulo}<small>${valor}</small></summary>
            ${cuerpo}
        </details>
    `;

    const chipsMenu = [["todos", "Todos"]].concat(botonesMenu).map(b =>
        `<button class="chip chip-medida ${b[0] === menuSeleccionado ? "activo" : ""}" onclick="elegirBotonMenu('${b[0]}')">${b[1]}</button>`
    ).join("");

    contenido.innerHTML = `
        <span data-vista="ajustes" hidden></span>
        <h2>Ajustes y personalización</h2>

        ${ajuste("tema", "Tema visual", nombreTema, `
            <div class="grupo-botones-temas">
                ${temas.map(t => botonOpcion(t[0], t[1], temaActual, "cambiarTemaApp")).join("")}
            </div>
        `)}

        ${ajuste("letra", "Tamaño de letra", nombreLetra, `
            <div class="grupo-botones-temas">
                ${letras.map(l => botonOpcion(l[0], l[1], letraActual, "cambiarTamanioLetra")).join("")}
            </div>
        `)}

        ${ajuste("color", "Color de diseño", colorNombre, htmlPaleta(colorActual, "cambiarColorPrincipal"))}

        ${ajuste("menu", "Color de los botones", hayMenuPersonal ? "Personalizado" : "Como el diseño", `
            <p>Elige qué botón quieres cambiar, o «Todos» para todos a la vez.</p>
            <div class="selector-chips">${chipsMenu}</div>
            <p class="texto-ultima">Cambiando: <strong>${menuSeleccionado === "todos" ? "todos los botones" : botonesMenu.find(b => b[0] === menuSeleccionado)[1]}</strong></p>
            ${htmlPaleta(colorObjetivo, "cambiarColorBoton")}
            <button onclick="restaurarColoresMenu()" style="width:100%; margin-top:12px;">Usar el color del diseño en todos</button>
        `)}

        ${ajuste("base", "Ejercicios base", ejerciciosOcultos.length === 0 ? "Todos" : ejerciciosOcultos.length + " eliminados", `
            <p>${ejerciciosOcultos.length === 0 ? "Tienes todos los ejercicios base." : `Has eliminado ${ejerciciosOcultos.length} ejercicio(s) base.`}</p>
            <button onclick="restaurarEjerciciosBase()" style="width: 100%;">Recuperar ejercicios base eliminados</button>
        `)}

        ${ajuste("version", "Actualizaciones", "v" + APP_VERSION, `
            <p>Versión instalada: <strong>${APP_VERSION}</strong></p>
            <button class="boton-actualizar" onclick="buscarActualizaciones()" style="width: 100%;">🔄 Buscar actualizaciones</button>
        `)}

        ${ajuste("copia", "Copia de seguridad", "", `
            <p>Guarda tus ejercicios, rutinas, cardio e historial por si se borran los datos del móvil.</p>
            <div class="grupo-botones-temas">
                <button onclick="exportarDatos()">Descargar copia</button>
                <button onclick="copiarDatos()">Copiar al portapapeles</button>
            </div>
            <label>Importar desde archivo</label>
            <input type="file" accept=".json,application/json" onchange="importarArchivo(event)">
            <label>…o pega aquí la copia</label>
            <textarea id="textoImportar" placeholder="Pega aquí el texto de la copia"></textarea>
            <button onclick="importarTexto()" style="width: 100%;">Importar texto</button>
        `)}
    `;
}

function cambiarTemaApp(nuevoTema) {
    temaActual = nuevoTema;
    aplicarPreferencias();
    guardarDatos();
    mostrarAjustes();
}

function cambiarTamanioLetra(tamanio) {
    letraActual = tamanio;
    aplicarPreferencias();
    guardarDatos();
    mostrarAjustes();
}

function cambiarColorPrincipal(colorHex) {
    if (!/^#[0-9a-f]{6}$/i.test(colorHex)) return;
    colorActual = colorHex;
    aplicarPreferencias();
    guardarDatos();
    ajusteAbierto = "color";
    mostrarAjustes();
}

function elegirBotonMenu(clave) {
    menuSeleccionado = clave;
    ajusteAbierto = "menu";
    mostrarAjustes();
}

function cambiarColorBoton(colorHex) {
    if (!/^#[0-9a-f]{6}$/i.test(colorHex)) return;
    if (menuSeleccionado === "todos") {
        colorMenuGlobal = colorHex;
        coloresMenu = {};
    } else {
        coloresMenu[menuSeleccionado] = colorHex;
    }
    aplicarPreferencias();
    guardarDatos();
    ajusteAbierto = "menu";
    mostrarAjustes();
}

function restaurarColoresMenu() {
    colorMenuGlobal = "";
    coloresMenu = {};
    menuSeleccionado = "todos";
    aplicarPreferencias();
    guardarDatos();
    ajusteAbierto = "menu";
    mostrarAjustes();
    aviso("Botones con el color del diseño.");
}

async function buscarActualizaciones() {
    if (!navigator.onLine) { aviso("Sin conexión: no se puede comprobar."); return; }
    aviso("Buscando actualizaciones…");
    try {
        const respuesta = await fetch("script.js?ts=" + Date.now(), { cache: "no-store" });
        const texto = await respuesta.text();
        const m = texto.match(/const APP_VERSION = "([^"]+)"/);
        if (!m) { aviso("No se pudo leer la versión nueva."); return; }
        if (m[1] !== APP_VERSION) {
            confirmar(`Hay una versión nueva (${m[1]}). ¿Actualizar ahora?\n\nTus datos no se borran.`, actualizarApp);
        } else {
            aviso("✅ Ya tienes la última versión.");
        }
    } catch (error) {
        aviso("No se pudo comprobar. Revisa tu conexión.");
    }
}

async function actualizarApp() {
    try {
        if ("serviceWorker" in navigator) {
            const registro = await navigator.serviceWorker.getRegistration();
            if (registro) {
                if (registro.waiting) registro.waiting.postMessage("SKIP_WAITING");
                await registro.update();
            }
        }
        if (window.caches) {
            const claves = await caches.keys();
            await Promise.all(claves.map(k => caches.delete(k)));
        }
    } catch (error) {}
    location.reload();
}

/* =====================================================
   10. COPIA DE SEGURIDAD
===================================================== */

function crearCopia() {
    return JSON.stringify({
        app: "mi-entrenamiento",
        version: 5,
        fecha: new Date().toISOString(),
        misEjercicios: misEjercicios,
        rutinas: rutinas,
        historial: historial,
        ejerciciosOcultos: ejerciciosOcultos,
        medidasCuerpo: medidasCuerpo,
        notasDias: notasDias,
        carreras: carreras,
        listasMusica: listasMusica,
        videosGuardados: videosGuardados,
        coloresMenu: coloresMenu,
        colorMenuGlobal: colorMenuGlobal,
        alturaCm: alturaCm,
        tema: temaActual,
        letra: letraActual,
        color: colorActual
    }, null, 2);
}

function exportarDatos() {
    try {
        const blob = new Blob([crearCopia()], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = `mi-entrenamiento-${obtenerFechaActual()}.json`;
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
        aviso("Copia descargada.");
    } catch (error) {
        aviso("No se pudo descargar. Prueba con «Copiar al portapapeles».");
    }
}

function copiarDatos() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(crearCopia()).then(
            function() { aviso("Copia guardada en el portapapeles."); },
            function() { aviso("No se pudo copiar."); }
        );
    } else {
        aviso("Este navegador no permite copiar. Usa «Descargar copia».");
    }
}

function aplicarCopia(texto) {
    let datos;
    try {
        datos = JSON.parse(texto);
    } catch (error) {
        aviso("El contenido no es una copia válida.");
        return;
    }

    if (!datos || !Array.isArray(datos.misEjercicios) || !Array.isArray(datos.rutinas) || !Array.isArray(datos.historial)) {
        aviso("La copia no tiene el formato esperado.");
        return;
    }

    confirmar("Esto reemplazará tus datos actuales por los de la copia. ¿Continuar?", function() {
        misEjercicios = datos.misEjercicios;
        rutinas = datos.rutinas;
        historial = datos.historial;
        ejerciciosOcultos = Array.isArray(datos.ejerciciosOcultos) ? datos.ejerciciosOcultos : [];

        if (Array.isArray(datos.medidasCuerpo)) medidasCuerpo = datos.medidasCuerpo;
        if (Array.isArray(datos.carreras)) carreras = datos.carreras;
        if (Array.isArray(datos.listasMusica)) listasMusica = datos.listasMusica;
        if (Array.isArray(datos.videosGuardados)) videosGuardados = datos.videosGuardados;
        if (datos.notasDias && typeof datos.notasDias === "object" && !Array.isArray(datos.notasDias)) notasDias = datos.notasDias;
        if (datos.coloresMenu && typeof datos.coloresMenu === "object" && !Array.isArray(datos.coloresMenu)) coloresMenu = datos.coloresMenu;
        if (/^#[0-9a-f]{6}$/i.test(datos.colorMenuGlobal || "")) colorMenuGlobal = datos.colorMenuGlobal;
        if (parseFloat(datos.alturaCm) > 0) alturaCm = parseFloat(datos.alturaCm);

        if (["oscuro", "oled", "claro"].includes(datos.tema)) temaActual = datos.tema;
        if (["pequenia", "mediana", "grande"].includes(datos.letra)) letraActual = datos.letra;
        if (/^#[0-9a-f]{6}$/i.test(datos.color || "")) colorActual = datos.color;

        guardarDatos();
        aplicarPreferencias();
        mostrarAjustes();
        aviso("Copia importada correctamente.");
    });
}

function importarArchivo(evento) {
    const archivo = evento.target.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = function() { aplicarCopia(lector.result); };
    lector.onerror = function() { aviso("No se pudo leer el archivo."); };
    lector.readAsText(archivo);
}

function importarTexto() {
    const caja = document.getElementById("textoImportar");
    if (!caja || !caja.value.trim()) { aviso("Pega primero el texto de la copia."); return; }
    aplicarCopia(caja.value);
}

/* =====================================================
   11. CARDIO (GPS, CALORÍAS Y ACTIVIDADES)
===================================================== */

const tiposCardio = {
    correr:     { nombre: "Correr",          icono: "🏃", gps: true,  ritmo: true },
    caminar:    { nombre: "Caminar",         icono: "🚶", gps: true,  ritmo: true },
    senderismo: { nombre: "Senderismo",      icono: "🥾", gps: true,  ritmo: true },
    bicicleta:  { nombre: "Bicicleta",       icono: "🚴", gps: true,  ritmo: false },
    estatica:   { nombre: "Bici estática",   icono: "🚲", gps: false, ritmo: false, met: 7 },
    eliptica:   { nombre: "Elíptica",        icono: "🏋️", gps: false, ritmo: false, met: 5 },
    remo:       { nombre: "Remo (máquina)",  icono: "🚣", gps: false, ritmo: false, met: 7 },
    comba:      { nombre: "Comba",           icono: "🤸", gps: false, ritmo: false, met: 11 },
    natacion:   { nombre: "Natación",        icono: "🏊", gps: false, ritmo: false, met: 8 }
};

function tipoDe(c) {
    return tiposCardio[c.tipo] ? c.tipo : "correr";
}

function pesoCalorias() {
    const ultimo = obtenerUltimoPeso();
    return ultimo ? ultimo.valor : 70;
}

function velocidadKmh(seg, distM) {
    return (seg > 0 && distM > 0) ? (distM / 1000) / (seg / 3600) : 0;
}

function metCardio(tipo, vel) {
    if (tipo === "correr") return vel > 0 ? Math.max(6, Math.min(18, vel)) : 9.8;
    if (tipo === "caminar") {
        if (vel <= 0) return 3.5;
        if (vel < 4.5) return 3.0;
        if (vel < 5.2) return 3.5;
        if (vel < 6) return 4.3;
        return 5.0;
    }
    if (tipo === "senderismo") return 6.0;
    if (tipo === "bicicleta") {
        if (vel <= 0) return 8.0;
        if (vel < 16) return 4.0;
        if (vel < 19) return 6.8;
        if (vel < 22) return 8.0;
        if (vel < 25) return 10.0;
        if (vel < 30) return 12.0;
        return 15.8;
    }
    return tiposCardio[tipo].met || 6;
}

function calcularCalorias(tipo, seg, distM, pesoKg) {
    const vel = velocidadKmh(seg, distM);
    return Math.round(metCardio(tipo, vel) * pesoKg * (seg / 3600));
}

function caloriasDe(c) {
    if (typeof c.calorias === "number") return c.calorias;
    return calcularCalorias(tipoDe(c), c.duracion || 0, c.distancia || 0, pesoCalorias());
}

function nuevoEstadoCorrer() {
    return {
        estado: "parado",
        tipo: "correr",
        inicio: 0,
        acumMs: 0,
        distM: 0,
        puntos: [],
        parciales: [],
        ultimoKm: 0,
        watchId: null,
        intervalo: null,
        ultimaPos: null,
        precision: null,
        gps: "",
        avisoDenegado: false,
        wakeLock: null
    };
}

function haversine(a, b) {
    const R = 6371000;
    const rad = Math.PI / 180;
    const dLat = (b[0] - a[0]) * rad;
    const dLon = (b[1] - a[1]) * rad;
    const x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
}

function formatoTiempo(segundos) {
    segundos = Math.max(0, Math.round(segundos));
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function formatoRitmo(segPorKm) {
    if (!isFinite(segPorKm) || segPorKm <= 0 || segPorKm > 3600) return "–";
    const total = Math.round(segPorKm);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function formatoKm(km) {
    return km.toFixed(2).replace(".", ",");
}

function tiempoCorrerMs() {
    return correr.estado === "corriendo" ? correr.acumMs + (Date.now() - correr.inicio) : correr.acumMs;
}

function textoPermisoGps() {
    return "La ubicación está bloqueada para esta app.\n\n" +
        "1. En Chrome: ⋮ › Configuración › Configuración del sitio › Ubicación, y permítela para esta página.\n" +
        "2. En Ajustes del móvil › Ubicación: actívala.\n" +
        "3. En Ajustes › Aplicaciones › Chrome › Permisos › Ubicación: «Permitir solo mientras se usa» y «Usar ubicación precisa».\n\n" +
        "Después vuelve aquí y pulsa «Comprobar GPS».";
}

function textoGps() {
    if (correr.estado === "parado") return "El GPS se activa al empezar (en actividades de exterior).";
    if (correr.estado === "pausado") return "Actividad en pausa.";
    if (correr.gps === "sinGps") return "Actividad sin GPS: se mide tiempo y calorías.";
    if (correr.gps === "no") return "Este navegador no tiene GPS. Solo se mide el tiempo.";
    if (correr.gps === "denegado") return "🚫 Ubicación bloqueada. Pulsa «Comprobar GPS» para ver cómo activarla.";
    if (correr.gps === "debil") return `Señal GPS débil${correr.precision ? " (±" + Math.round(correr.precision) + " m)" : ""}. Busca cielo abierto.`;
    if (correr.gps === "ok") return `GPS activo · precisión ±${Math.round(correr.precision || 0)} m`;
    return "Buscando señal GPS…";
}

async function comprobarGps() {
    if (!navigator.geolocation) { informar("Este navegador no tiene GPS."); return; }
    if (!window.isSecureContext) { informar("La página no es segura (https). El GPS solo funciona con https."); return; }

    try {
        if (navigator.permissions && navigator.permissions.query) {
            const permiso = await navigator.permissions.query({ name: "geolocation" });
            if (permiso.state === "denied") { informar(textoPermisoGps()); return; }
        }
    } catch (error) {}

    aviso("Buscando señal GPS…");
    navigator.geolocation.getCurrentPosition(
        function(pos) {
            aviso(`✅ GPS funcionando. Precisión: ±${Math.round(pos.coords.accuracy)} m.`);
            if (correr.estado === "corriendo" && correr.gps === "denegado") {
                detenerGps();
                correr.avisoDenegado = false;
                iniciarGps();
                aviso("GPS reactivado en el entrenamiento.");
            }
        },
        function(error) {
            if (error.code === 1) informar(textoPermisoGps());
            else if (error.code === 2) informar("No hay señal GPS. Activa la ubicación del móvil y sal a un sitio abierto.");
            else informar("El GPS tarda demasiado. Prueba en el exterior y vuelve a intentarlo.");
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
}

function elegirTipoCardio(clave) {
    tipoCardio = clave;
    mostrarCorrer();
}

function mostrarCorrer() {
    const total = carreras.reduce((t, c) => t + (c.distancia || 0), 0) / 1000;
    const kcalTotal = carreras.reduce((t, c) => t + caloriasDe(c), 0);
    const tipo = correr.estado === "parado" ? tipoCardio : correr.tipo;
    const t = tiposCardio[tipo];

    let botones = "";
    if (correr.estado === "parado") {
        botones = `<button class="boton-iniciar ancho-completo" onclick="empezarCorrer()">▶ Empezar</button>`;
    } else if (correr.estado === "corriendo") {
        botones = `
            <button style="background:#E65100;" onclick="pausarCorrer()">⏸ Pausar</button>
            <button class="boton-pausar" onclick="terminarCorrer()">⏹ Terminar</button>
        `;
    } else {
        botones = `
            <button class="boton-iniciar" onclick="continuarCorrer()">▶ Continuar</button>
            <button class="boton-pausar" onclick="terminarCorrer()">⏹ Terminar</button>
        `;
    }

    const selector = correr.estado === "parado"
        ? `<div class="selector-chips">${Object.keys(tiposCardio).map(k =>
            `<button class="chip ${k === tipoCardio ? "activo" : ""}" onclick="elegirTipoCardio('${k}')">${tiposCardio[k].icono} ${tiposCardio[k].nombre}</button>`
          ).join("")}</div>`
        : `<h3>${t.icono} ${t.nombre}</h3>`;

    const celdasGps = t.gps ? `
        <div><strong id="correrDist">0,00</strong><span>kilómetros</span></div>
        <div><strong id="correrRitmo">–</strong><span>${t.ritmo ? "ritmo medio (min/km)" : "velocidad media (km/h)"}</span></div>
    ` : "";

    contenido.innerHTML = `
        <span data-vista="correr" hidden></span>
        <h2>Cardio 🏃</h2>

        <div class="panel-correr">
            ${selector}
            <p id="correrGps" class="texto-ultima"></p>
            <div class="correr-grande" id="correrTiempo">00:00</div>
            <div class="correr-datos">
                ${celdasGps}
                <div class="ancho"><strong id="correrKcal">0</strong><span>calorías (kcal)</span></div>
            </div>
            <div class="botones-correr">${botones}</div>
            ${t.gps ? `<button class="boton-texto" style="margin-top:8px;" onclick="comprobarGps()">📡 Comprobar GPS</button>` : ""}
            <label class="fila-check">
                <input type="checkbox" ${vozCorrer ? "checked" : ""} onchange="cambiarVoz(this.checked)">
                Avisar por voz cada kilómetro
            </label>
            <p class="texto-ultima">Calorías aproximadas calculadas con ${obtenerUltimoPeso() ? formatoNum(pesoCalorias()) + " kg (tu último peso)" : "70 kg (registra tu peso en Progreso para afinarlas)"}.</p>
        </div>

        <button onclick="mostrarFormularioCarrera()" style="width:100%;">+ Añadir actividad manual</button>

        <div class="resumen-progreso">
            <div class="dato-resumen"><strong>${carreras.length}</strong><span>Actividades</span></div>
            <div class="dato-resumen"><strong>${formatoKm(total)}</strong><span>Km totales</span></div>
            <div class="dato-resumen" style="grid-column: 1 / -1;"><strong>${kcalTotal}</strong><span>kcal quemadas en total</span></div>
        </div>

        <h3>Mis actividades</h3>
        ${htmlListaCarreras()}
    `;
    actualizarVistaCorrer();
}

function cambiarVoz(activa) {
    vozCorrer = activa;
    guardarDatos();
}

function actualizarVistaCorrer() {
    const tiempo = document.getElementById("correrTiempo");
    if (!tiempo) return;
    const tipo = correr.estado === "parado" ? tipoCardio : correr.tipo;
    const t = tiposCardio[tipo];
    const seg = Math.floor(tiempoCorrerMs() / 1000);
    const km = correr.distM / 1000;

    tiempo.innerText = formatoTiempo(seg);

    const d = document.getElementById("correrDist");
    if (d) d.innerText = formatoKm(km);

    const r = document.getElementById("correrRitmo");
    if (r) {
        if (km <= 0.05) r.innerText = "–";
        else r.innerText = t.ritmo ? formatoRitmo(seg / km) : formatoNum(km / (seg / 3600));
    }

    const k = document.getElementById("correrKcal");
    if (k) k.innerText = calcularCalorias(tipo, seg, correr.distM, pesoCalorias());

    const g = document.getElementById("correrGps");
    if (g) g.innerText = textoGps();
}

function iniciarTickCorrer() {
    clearInterval(correr.intervalo);
    correr.intervalo = setInterval(actualizarVistaCorrer, 1000);
}

function iniciarGps() {
    if (!tiposCardio[correr.tipo].gps) { correr.gps = "sinGps"; return; }
    if (!navigator.geolocation) { correr.gps = "no"; return; }
    correr.gps = "buscando";
    correr.ultimaPos = null;
    correr.watchId = navigator.geolocation.watchPosition(
        posicionCorrer,
        errorGps,
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 }
    );
}

function detenerGps() {
    if (correr.watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(correr.watchId);
    correr.watchId = null;
}

function errorGps(error) {
    if (error && error.code === 1) {
        correr.gps = "denegado";
        if (!correr.avisoDenegado) {
            correr.avisoDenegado = true;
            informar(textoPermisoGps());
        }
    } else {
        correr.gps = "debil";
    }
    actualizarVistaCorrer();
}

function posicionCorrer(pos) {
    if (correr.estado !== "corriendo") return;

    correr.precision = pos.coords.accuracy;
    if (pos.coords.accuracy > 35) {
        correr.gps = "debil";
        actualizarVistaCorrer();
        return;
    }
    correr.gps = "ok";

    const actual = [pos.coords.latitude, pos.coords.longitude];

    if (!correr.ultimaPos) {
        correr.ultimaPos = { p: actual, t: pos.timestamp };
        correr.puntos.push(actual);
        actualizarVistaCorrer();
        return;
    }

    const d = haversine(correr.ultimaPos.p, actual);
    const dt = (pos.timestamp - correr.ultimaPos.t) / 1000;
    const velMax = correr.tipo === "bicicleta" ? 25 : 12;

    if (d < 4) { actualizarVistaCorrer(); return; }
    if (dt > 0 && d / dt > velMax) return;

    correr.distM += d;
    correr.puntos.push(actual);
    correr.ultimaPos = { p: actual, t: pos.timestamp };

    comprobarKm();
    actualizarVistaCorrer();
}

function comprobarKm() {
    const km = Math.floor(correr.distM / 1000);
    while (correr.ultimoKm < km) {
        correr.ultimoKm++;
        const seg = Math.round(tiempoCorrerMs() / 1000);
        correr.parciales.push(seg);
        if (tiposCardio[correr.tipo].ritmo) {
            hablar(`Kilómetro ${correr.ultimoKm}. Tiempo ${textoHablado(seg)}. Ritmo medio ${textoHablado(seg / correr.ultimoKm)} por kilómetro.`);
        } else {
            hablar(`Kilómetro ${correr.ultimoKm}. Tiempo ${textoHablado(seg)}.`);
        }
    }
}

function textoHablado(segundos) {
    segundos = Math.round(segundos);
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    if (h > 0) return `${h} hora${h > 1 ? "s" : ""} ${m} minutos`;
    return `${m} minutos ${s} segundos`;
}

function hablar(texto) {
    if (!vozCorrer || !window.speechSynthesis) return;
    try {
        const frase = new SpeechSynthesisUtterance(texto);
        frase.lang = "es-ES";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(frase);
    } catch (error) {}
}

async function pedirPantallaActiva() {
    try {
        if ("wakeLock" in navigator) correr.wakeLock = await navigator.wakeLock.request("screen");
    } catch (error) {}
}

function liberarPantalla() {
    try {
        if (correr.wakeLock) { correr.wakeLock.release(); correr.wakeLock = null; }
    } catch (error) {}
}

document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "visible" && correr.estado === "corriendo") pedirPantallaActiva();
});

function empezarCorrer() {
    const tipo = tipoCardio;
    correr = nuevoEstadoCorrer();
    correr.tipo = tipo;
    correr.estado = "corriendo";
    correr.inicio = Date.now();
    iniciarGps();
    iniciarTickCorrer();
    pedirPantallaActiva();
    hablar(tiposCardio[tipo].nombre + " iniciado.");
    mostrarCorrer();
}

function pausarCorrer() {
    if (correr.estado !== "corriendo") return;
    correr.acumMs += Date.now() - correr.inicio;
    correr.estado = "pausado";
    detenerGps();
    clearInterval(correr.intervalo);
    liberarPantalla();
    mostrarCorrer();
}

function continuarCorrer() {
    if (correr.estado !== "pausado") return;
    correr.estado = "corriendo";
    correr.inicio = Date.now();
    correr.ultimaPos = null;
    iniciarGps();
    iniciarTickCorrer();
    pedirPantallaActiva();
    mostrarCorrer();
}

function simplificarRuta(puntos) {
    const maximo = 500;
    const paso = Math.max(1, Math.ceil(puntos.length / maximo));
    const resultado = [];
    for (let i = 0; i < puntos.length; i += paso) {
        resultado.push([Math.round(puntos[i][0] * 100000) / 100000, Math.round(puntos[i][1] * 100000) / 100000]);
    }
    const ultimo = puntos[puntos.length - 1];
    if (ultimo && puntos.length > 1 && (puntos.length - 1) % paso !== 0) {
        resultado.push([Math.round(ultimo[0] * 100000) / 100000, Math.round(ultimo[1] * 100000) / 100000]);
    }
    return resultado;
}

function terminarCorrer() {
    if (correr.estado === "parado") return;
    const duracion = Math.round(tiempoCorrerMs() / 1000);
    confirmar("¿Terminar y guardar la actividad?", function() {
        guardarCarreraTerminada(duracion);
    });
}

function guardarCarreraTerminada(duracion) {
    detenerGps();
    clearInterval(correr.intervalo);
    liberarPantalla();

    if (duracion < 10) {
        correr = nuevoEstadoCorrer();
        aviso("Actividad demasiado corta, no se guarda.");
        mostrarCorrer();
        return;
    }

    const carrera = {
        id: generarId(),
        tipo: correr.tipo,
        fecha: obtenerFechaActual(),
        duracion: duracion,
        distancia: Math.round(correr.distM),
        calorias: calcularCalorias(correr.tipo, duracion, correr.distM, pesoCalorias()),
        ruta: simplificarRuta(correr.puntos),
        parciales: correr.parciales,
        origen: tiposCardio[correr.tipo].gps ? "gps" : "tiempo"
    };

    carreras.push(carrera);
    guardarDatos();
    correr = nuevoEstadoCorrer();
    hablar("Actividad terminada.");
    aviso("¡Actividad guardada!");
    verCarrera(carrera.id, "correr");
}

function resumenCarrera(c) {
    const t = tiposCardio[tipoDe(c)];
    const km = (c.distancia || 0) / 1000;
    const partes = [`${t.icono} ${t.nombre}`];
    if (km > 0) partes.push(formatoKm(km) + " km");
    partes.push(formatoTiempo(c.duracion));
    if (km > 0) partes.push(t.ritmo ? formatoRitmo(c.duracion / km) + " min/km" : formatoNum(velocidadKmh(c.duracion, c.distancia)) + " km/h");
    partes.push(caloriasDe(c) + " kcal");
    return partes.join(" · ");
}

function htmlListaCarreras() {
    const lista = carreras.slice().sort((a, b) => b.fecha.localeCompare(a.fecha));
    if (lista.length === 0) return "<p>Todavía no hay actividades guardadas.</p>";

    return lista.map(c => `
        <div class="tarjeta-rutina">
            <h3>${formatearFecha(c.fecha)}</h3>
            <p>${resumenCarrera(c)}</p>
            <button class="boton-texto" onclick="verCarrera('${c.id}', 'correr')">Ver actividad</button>
        </div>
    `).join("");
}

function htmlRuta(ruta) {
    if (!ruta || ruta.length < 2) return `<p class="texto-ultima">Esta actividad no tiene ruta GPS.</p>`;

    const W = 320, H = 240, pad = 22;
    const lats = ruta.map(p => p[0]);
    const lons = ruta.map(p => p[1]);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLon = Math.min(...lons), maxLon = Math.max(...lons);
    const cos = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);

    const w = (maxLon - minLon) * cos || 0.00001;
    const h = (maxLat - minLat) || 0.00001;
    const escala = Math.min((W - 2 * pad) / w, (H - 2 * pad) / h);
    const offX = (W - w * escala) / 2;
    const offY = (H - h * escala) / 2;

    const pt = function(p) {
        return [offX + (p[1] - minLon) * cos * escala, offY + (maxLat - p[0]) * escala];
    };

    const puntos = ruta.map(p => pt(p).map(v => v.toFixed(1)).join(",")).join(" ");
    const ini = pt(ruta[0]);
    const fin = pt(ruta[ruta.length - 1]);

    return `
        <div class="caja-grafica">
            <svg class="grafica" viewBox="0 0 ${W} ${H}" role="img" aria-label="Ruta de la actividad">
                <polyline class="ruta-linea" points="${puntos}"/>
                <circle class="ruta-inicio" cx="${ini[0].toFixed(1)}" cy="${ini[1].toFixed(1)}" r="6"/>
                <circle class="ruta-fin" cx="${fin[0].toFixed(1)}" cy="${fin[1].toFixed(1)}" r="6"/>
            </svg>
            <p class="texto-ultima" style="text-align:center;">Ruta recorrida · verde: salida · rojo: llegada</p>
        </div>
    `;
}

function verCarrera(id, origen) {
    origenCarrera = origen || "correr";
    const c = carreras.find(x => x.id === id);
    if (!c) { mostrarCorrer(); return; }

    const t = tiposCardio[tipoDe(c)];
    const km = (c.distancia || 0) / 1000;

    const celdas = [];
    if (km > 0) celdas.push(`<div class="dato-resumen"><strong>${formatoKm(km)}</strong><span>Kilómetros</span></div>`);
    celdas.push(`<div class="dato-resumen"><strong>${formatoTiempo(c.duracion)}</strong><span>Tiempo</span></div>`);
    if (km > 0) {
        celdas.push(`<div class="dato-resumen"><strong>${t.ritmo ? formatoRitmo(c.duracion / km) : formatoNum(velocidadKmh(c.duracion, c.distancia))}</strong><span>${t.ritmo ? "Ritmo medio (min/km)" : "Velocidad media (km/h)"}</span></div>`);
        if (t.ritmo) celdas.push(`<div class="dato-resumen"><strong>${formatoNum(velocidadKmh(c.duracion, c.distancia))}</strong><span>Velocidad (km/h)</span></div>`);
    }
    celdas.push(`<div class="dato-resumen"><strong>${caloriasDe(c)}</strong><span>Calorías (kcal)</span></div>`);

    const parciales = (c.parciales && c.parciales.length > 0)
        ? `<h3 style="margin-top: 20px;">Tiempo por kilómetro</h3>` +
          c.parciales.map((seg, i) => {
              const anterior = i > 0 ? c.parciales[i - 1] : 0;
              return `<p>Km ${i + 1}: <strong>${formatoTiempo(seg - anterior)}</strong></p>`;
          }).join("")
        : "";

    contenido.innerHTML = `
        <button class="boton-volver-cal" onclick="volverDeCarrera()">◀ Volver</button>
        <h2>${t.icono} ${t.nombre} · ${formatearFecha(c.fecha)}</h2>

        <div class="resumen-progreso">${celdas.join("")}</div>

        ${t.gps ? htmlRuta(c.ruta) : ""}
        ${parciales}

        <button class="boton-texto texto-rojo" style="margin-top:20px;" onclick="eliminarCarrera('${c.id}')">🗑 Eliminar actividad</button>
    `;
    subirAlContenido();
}

function volverDeCarrera() {
    if (origenCarrera === "dia" && diaSeleccionado) mostrarDia();
    else mostrarCorrer();
}

function eliminarCarrera(id) {
    confirmar("¿Eliminar esta actividad?", function() {
        carreras = carreras.filter(c => c.id !== id);
        guardarDatos();
        aviso("Actividad eliminada.");
        volverDeCarrera();
    });
}

function mostrarFormularioCarrera() {
    contenido.innerHTML = `
        <h2>Actividad manual</h2>
        <p>Para actividades que hiciste sin la app.</p>
        <label>Actividad</label>
        <select id="carTipo">
            ${Object.keys(tiposCardio).map(k => `<option value="${k}" ${k === tipoCardio ? "selected" : ""}>${tiposCardio[k].icono} ${tiposCardio[k].nombre}</option>`).join("")}
        </select>
        <label>Fecha</label>
        <input type="date" id="carFecha" value="${obtenerFechaActual()}">
        <label>Distancia en km (opcional en actividades de interior)</label>
        <input type="number" step="0.01" min="0" inputmode="decimal" id="carKm" placeholder="Ej: 5,2">
        <label>Horas</label>
        <input type="number" min="0" inputmode="numeric" id="carH" value="0">
        <label>Minutos</label>
        <input type="number" min="0" max="59" inputmode="numeric" id="carM" value="0">
        <label>Segundos</label>
        <input type="number" min="0" max="59" inputmode="numeric" id="carS" value="0">
        <button onclick="guardarCarreraManual()" style="width:100%; margin-top:10px;">Guardar</button>
        <button class="boton-texto texto-volver" onclick="mostrarCorrer()" style="width:100%; margin-top:10px;">Cancelar</button>
    `;
}

function guardarCarreraManual() {
    const tipo = document.getElementById("carTipo").value;
    const fecha = document.getElementById("carFecha").value;
    const km = parseFloat(String(document.getElementById("carKm").value).replace(",", ".")) || 0;
    const h = parseInt(document.getElementById("carH").value) || 0;
    const m = parseInt(document.getElementById("carM").value) || 0;
    const s = parseInt(document.getElementById("carS").value) || 0;
    const duracion = h * 3600 + m * 60 + s;
    const distM = Math.round(km * 1000);

    if (!fecha) { aviso("Elige una fecha."); return; }
    if (fecha > obtenerFechaActual()) { aviso("La fecha no puede ser futura."); return; }
    if (km < 0 || km >= 500) { aviso("Introduce una distancia válida."); return; }
    if (tiposCardio[tipo].gps && km <= 0) { aviso("Introduce la distancia."); return; }
    if (duracion <= 0) { aviso("Introduce el tiempo."); return; }

    carreras.push({
        id: generarId(),
        tipo: tipo,
        fecha: fecha,
        duracion: duracion,
        distancia: distM,
        calorias: calcularCalorias(tipo, duracion, distM, pesoCalorias()),
        ruta: [],
        parciales: [],
        origen: "manual"
    });

    guardarDatos();
    aviso("Actividad guardada.");
    mostrarCorrer();
}

/* =====================================================
   12. MÚSICA, PODCASTS Y VÍDEOS
===================================================== */

function guardarMusicaVideos() {
    guardarDatos();
}

/* ---------- Abrir app nativa con fallback a web ---------- */
function abrirApp(esquema, web) {
    const vis = document.visibilityState;
    const t   = Date.now();
    window.location.href = esquema;
    setTimeout(() => {
        if (document.visibilityState === vis && Date.now() - t < 1800) {
            window.open(web, "_blank", "noopener");
        }
    }, 1200);
}

const APPS_MUSICA = [
    ["Spotify",       "spotify:",       "https://open.spotify.com"],
    ["YouTube Music", "youtubemusic://","https://music.youtube.com"],
    ["Apple Music",   "music://",       "https://music.apple.com"],
    ["Deezer",        "deezer://",      "https://www.deezer.com"],
    ["SoundCloud",    "soundcloud://",  "https://soundcloud.com"]
];

const APPS_PODCASTS = [
    ["Spotify",         "spotify:",  "https://open.spotify.com/genre/podcasts-page"],
    ["Apple Podcasts",  "podcasts://","https://podcasts.apple.com"],
    ["YouTube",         "youtube://", "https://www.youtube.com"],
    ["Google Podcasts", "podcasts://","https://podcasts.google.com"]
];

/* ---------- Detectar y reproducir audio ---------- */
function detectarServicioAudio(url) {
    let m = url.match(/open\.spotify\.com\/(playlist|album|track|episode|show|artist)\/([\w]+)/);
    if (m) return { servicio: "spotify", tipo: m[1], id: m[2] };

    m = url.match(/music\.apple\.com\/([a-z]{2})\/(album|playlist|song)\/[^/]+\/(?:[^/]+\/)?([\w.]+)/i);
    if (m) return { servicio: "apple", storefront: m[1], tipo: m[2], id: m[3] };

    m = url.match(/deezer\.com\/(?:[a-z]{2}\/)?(playlist|album|track)\/(\d+)/);
    if (m) return { servicio: "deezer", tipo: m[1], id: m[2] };

    if (/youtube\.com|youtu\.be/.test(url)) {
        const yt = url.match(/(?:v=|youtu\.be\/|playlist\?list=)([\w-]+)/);
        if (yt) return { servicio: "youtube", id: yt[1], esLista: url.includes("list=") };
    }
    return { servicio: "desconocido" };
}

function reproductorAudio(item) {
    const d = detectarServicioAudio(item.url);
    if (d.servicio === "spotify") {
        const h = d.tipo === "episode" ? 232 : d.tipo === "track" ? 152 : 352;
        return `<iframe src="https://open.spotify.com/embed/${d.tipo}/${d.id}?theme=0"
            width="100%" height="${h}" frameborder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            style="border-radius:12px; margin-top:10px;" loading="lazy"></iframe>`;
    }
    if (d.servicio === "apple") {
        return `<iframe allow="autoplay *; encrypted-media *; clipboard-write"
            frameborder="0" height="175"
            style="width:100%; max-width:660px; background:transparent; border-radius:12px; margin-top:10px;"
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
            src="https://embed.music.apple.com/${d.storefront}/${d.tipo}/${d.id}"></iframe>`;
    }
    if (d.servicio === "deezer") {
        return `<iframe src="https://widget.deezer.com/widget/dark/${d.tipo}/${d.id}"
            width="100%" height="300" frameborder="0" allow="encrypted-media; clipboard-write"
            style="border-radius:12px; margin-top:10px;"></iframe>`;
    }
    if (d.servicio === "youtube") {
        const src = d.esLista
            ? `https://www.youtube.com/embed/videoseries?list=${d.id}`
            : `https://www.youtube.com/embed/${d.id}`;
        return `<iframe width="100%" height="240" src="${src}"
            allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen frameborder="0"
            style="border-radius:12px; margin-top:10px;"></iframe>`;
    }
    return `<p style="margin-top:10px;">No se puede incrustar. 
        <a href="${item.url}" target="_blank" rel="noopener">▶ Abrir enlace</a></p>`;
}

/* Abrir una lista guardada en su app nativa */
function abrirListaEnApp(id) {
    const l = listasMusica.find(x => x.id === id);
    if (!l) return;
    const d = detectarServicioAudio(l.url);
    const esquemas = { spotify: "spotify:", apple: "music://", deezer: "deezer://" };
    if (esquemas[d.servicio]) abrirApp(esquemas[d.servicio], l.url);
    else abrirEnlace(l.url);
}

/* ---------- Vista principal música / podcasts ---------- */
function mostrarMusica(pestanaActiva) {
    pestanaActiva = pestanaActiva || "musica";
    const esPodcast = pestanaActiva === "podcasts";
    const filtradas = listasMusica.filter(l => (l.categoria || "musica") === pestanaActiva);

    const tarjetas = filtradas.length === 0
        ? `<p>Todavía no has guardado ${esPodcast ? "podcasts" : "listas"}.</p>`
        : filtradas.map(l => `
            <div class="tarjeta-rutina">
                <h3>${esPodcast ? "🎙" : "🎵"} ${escaparHTML(l.nombre)}</h3>
                <div id="player-${l.id}">
                    <button class="boton-texto" onclick="togglePlayerAudio('${l.id}')">▶ Reproducir aquí</button>
                </div>
                <button class="boton-texto" onclick="abrirListaEnApp('${l.id}')">🚀 Abrir en app</button>
                <button class="boton-texto" onclick="mostrarFormularioLista('${l.id}','${pestanaActiva}')">Editar</button>
            </div>
        `).join("");

    const apps = esPodcast ? APPS_PODCASTS : APPS_MUSICA;

    contenido.innerHTML = `
        <span data-vista="musica" hidden></span>
        <h2>Música y podcasts ${esPodcast ? "🎙" : "🎵"}</h2>

        <div class="filtros-ejercicios" style="margin-bottom:15px;">
            <button onclick="mostrarMusica('musica')"   style="${!esPodcast ? "font-weight:bold;" : ""}">🎵 Música</button>
            <button onclick="mostrarMusica('podcasts')" style="${esPodcast  ? "font-weight:bold;" : ""}">🎙 Podcasts</button>
        </div>

        <h3>Abrir aplicación</h3>
        <div class="filtros-ejercicios">
            ${apps.map(a => `<button onclick="abrirApp('${a[1]}','${a[2]}')">${a[0]}</button>`).join("")}
        </div>

        <h3>Mis ${esPodcast ? "podcasts" : "listas"}</h3>
        ${tarjetas}
        <button onclick="mostrarFormularioLista(null,'${pestanaActiva}')"
                style="width:100%; margin-top:15px;">+ Añadir ${esPodcast ? "podcast" : "lista"}</button>
        <p class="texto-ultima">En ${esPodcast ? "Spotify, Apple Podcasts o YouTube" : "Spotify, Apple Music o Deezer"}: abre el contenido › Compartir › Copiar enlace, y pégalo aquí.</p>
    `;
}

function togglePlayerAudio(id) {
    const cont = document.getElementById("player-" + id);
    const item = listasMusica.find(x => x.id === id);
    if (!cont || !item) return;

    if (cont.dataset.abierto === "1") {
        cont.innerHTML = `<button class="boton-texto" onclick="togglePlayerAudio('${id}')">▶ Reproducir aquí</button>`;
        cont.dataset.abierto = "0";
    } else {
        cont.innerHTML = reproductorAudio(item) +
            `<button class="boton-texto" style="margin-top:8px;" onclick="togglePlayerAudio('${id}')">✕ Cerrar</button>`;
        cont.dataset.abierto = "1";
    }
}

function mostrarFormularioLista(id, categoria) {
    categoria = categoria || "musica";
    listaEditandoId = id || null;
    const l = id ? listasMusica.find(x => x.id === id) : null;
    const esPodcast = categoria === "podcasts";

    contenido.innerHTML = `
        <h2>${l ? "Editar" : "Nueva"} ${esPodcast ? "podcast" : "lista"}</h2>
        <label>Nombre</label>
        <input type="text" id="listaNombre"
               placeholder="Ej: ${esPodcast ? "Podcast de running" : "Correr"}"
               value="${l ? escaparHTML(l.nombre) : ""}">
        <label>Enlace</label>
        <input type="url" id="listaUrl" placeholder="https://open.spotify.com/..."
               value="${l ? escaparHTML(l.url) : ""}">
        <div style="display:flex; gap:10px; margin-top:15px;">
            <button onclick="guardarLista('${categoria}')" style="flex:1;">Guardar</button>
            <button class="boton-texto texto-volver" onclick="mostrarMusica('${categoria}')" style="flex:1;">Cancelar</button>
        </div>
        ${l ? `<button class="boton-texto texto-rojo" onclick="eliminarLista('${l.id}','${categoria}')"
                style="width:100%; margin-top:15px;">🗑 Eliminar</button>` : ""}
    `;
}

function guardarLista(categoria) {
    const nombre = document.getElementById("listaNombre").value.trim();
    const url    = document.getElementById("listaUrl").value.trim();
    if (!nombre || !url) { alert("Pon un nombre y un enlace."); return; }

    if (listaEditandoId) {
        const l = listasMusica.find(x => x.id === listaEditandoId);
        if (l) { l.nombre = nombre; l.url = url; }
    } else {
        listasMusica.push({ id: "lista_" + Date.now(), nombre, url, categoria });
    }
    guardarMusicaVideos();
    listaEditandoId = null;
    mostrarMusica(categoria);
}

function eliminarLista(id, categoria) {
    confirmar("¿Eliminar esta lista?", function() {
        listasMusica = listasMusica.filter(x => x.id !== id);
        guardarMusicaVideos();
        mostrarMusica(categoria);
    });
}

/* =====================================================
   VÍDEOS
===================================================== */

function detectarTipoVideo(url) {
    let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    if (m) return { tipo: "youtube", id: m[1] };

    m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return { tipo: "vimeo", id: m[1] };

    if (/\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i.test(url))
        return { tipo: "directo", src: url };

    return { tipo: "desconocido", src: url };
}

function mostrarVideos() {
    const lista = videosGuardados.length === 0
        ? "<p>Todavía no has guardado ningún vídeo.</p>"
        : videosGuardados.map(v => `
            <div class="tarjeta-rutina">
                <h3>🎥 ${escaparHTML(v.nombre)}</h3>
                <button class="boton-texto" onclick="reproducirGuardado('${v.id}')">▶ Reproducir</button>
                <button class="boton-texto" onclick="mostrarFormularioVideo('${v.id}')">Editar</button>
            </div>
        `).join("");

    contenido.innerHTML = `
        <span data-vista="video" hidden></span>
        <h2>Vídeos 🎥</h2>
        <p>Reproductor integrado. Elige la fuente:</p>

        <div class="filtros-ejercicios">
            <button onclick="seleccionarArchivoVideo()">📁 Archivo del móvil</button>
            <button onclick="mostrarFormularioVideo(null,'youtube')">▶ YouTube</button>
            <button onclick="mostrarFormularioVideo(null,'vimeo')">▶ Vimeo</button>
            <button onclick="mostrarFormularioVideo(null,'directo')">🔗 Enlace directo</button>
        </div>

        <div id="zonaReproductor" style="margin-top:20px;"></div>

        <h3>Mis vídeos</h3>
        ${lista}
        <button onclick="mostrarFormularioVideo()" style="width:100%; margin-top:15px;">+ Añadir vídeo por enlace</button>
    `;
}

function reproducirVideo(v) {
    const zona = document.getElementById("zonaReproductor");
    if (!zona) return;

    let html;
    if (v.tipo === "youtube") {
        html = `<iframe width="100%" height="240"
            src="https://www.youtube.com/embed/${v.id}?autoplay=1"
            allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen frameborder="0"
            style="border-radius:12px;"></iframe>`;
    } else if (v.tipo === "vimeo") {
        html = `<iframe width="100%" height="240"
            src="https://player.vimeo.com/video/${v.id}?autoplay=1"
            allow="autoplay; fullscreen; picture-in-picture" allowfullscreen frameborder="0"
            style="border-radius:12px;"></iframe>`;
    } else if (v.tipo === "directo" || v.tipo === "local") {
        html = `<video src="${v.src}" controls autoplay playsinline
            style="width:100%; max-height:60vh; border-radius:12px; background:#000;"></video>`;
    } else {
        html = `<p>No se pudo incrustar. <a href="${v.src}" target="_blank" rel="noopener">Abrir enlace</a></p>`;
    }

    zona.innerHTML = `
        <div class="tarjeta-rutina">
            <h3>▶ ${escaparHTML(v.nombre)}</h3>
            ${html}
        </div>
    `;
    zona.scrollIntoView({ behavior: "smooth", block: "start" });
}

function seleccionarArchivoVideo() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = () => {
        const f = input.files[0];
        if (!f) return;
        reproducirVideo({ nombre: f.name, tipo: "local", src: URL.createObjectURL(f) });
    };
    input.click();
}

function reproducirGuardado(id) {
    const v = videosGuardados.find(x => x.id === id);
    if (!v) return;
    reproducirVideo({ nombre: v.nombre, ...detectarTipoVideo(v.url) });
}

function mostrarFormularioVideo(id, tipoSugerido) {
    videoEditandoId = id || null;
    const v = id ? videosGuardados.find(x => x.id === id) : null;

    const ph = {
        youtube: "https://www.youtube.com/watch?v=...",
        vimeo:   "https://vimeo.com/123456789",
        directo: "https://ejemplo.com/video.mp4",
        default: "Pega el enlace (YouTube, Vimeo o .mp4)"
    }[tipoSugerido] || "Pega el enlace (YouTube, Vimeo o .mp4)";

    contenido.innerHTML = `
        <h2>${v ? "Editar vídeo" : "Nuevo vídeo"}</h2>
        <label>Nombre</label>
        <input type="text" id="videoNombre" placeholder="Ej: Rutina de piernas"
               value="${v ? escaparHTML(v.nombre) : ""}">
        <label>Enlace</label>
        <input type="url" id="videoUrl" placeholder="${ph}"
               value="${v ? escaparHTML(v.url) : ""}">
        <div style="display:flex; gap:10px; margin-top:15px;">
            <button onclick="guardarVideo()" style="flex:1;">Guardar</button>
            <button class="boton-texto texto-volver" onclick="mostrarVideos()" style="flex:1;">Cancelar</button>
        </div>
        ${v ? `<button class="boton-texto texto-rojo" onclick="eliminarVideo('${v.id}')"
                style="width:100%; margin-top:15px;">🗑 Eliminar vídeo</button>` : ""}
    `;
}

function guardarVideo() {
    const nombre = document.getElementById("videoNombre").value.trim();
    const url    = document.getElementById("videoUrl").value.trim();
    if (!nombre || !url) { alert("Pon un nombre y un enlace."); return; }

    if (videoEditandoId) {
        const v = videosGuardados.find(x => x.id === videoEditandoId);
        if (v) { v.nombre = nombre; v.url = url; }
    } else {
        videosGuardados.push({ id: "video_" + Date.now(), nombre, url });
    }
    guardarMusicaVideos();
    videoEditandoId = null;
    mostrarVideos();
}

function eliminarVideo(id) {
    confirmar("¿Eliminar este vídeo?", function() {
        videosGuardados = videosGuardados.filter(x => x.id !== id);
        guardarMusicaVideos();
        mostrarVideos();
    });
}

