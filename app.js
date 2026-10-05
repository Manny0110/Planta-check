// =============================================================
// CONFIGURACIÓN DE SUPABASE
// Pega aquí SOLO tu Project URL y tu Publishable/anon key.
// NUNCA uses la service_role key en una página pública.
// =============================================================
const SUPABASE_URL = "https://hzsqgqiljukgqrblovrx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_YgxLYterTKv8-Xak9gF5YQ_zf3aWZ5q";

const els = {
  loading: document.querySelector("#loading"),
  message: document.querySelector("#message"),
  content: document.querySelector("#content"),

  // Drive
  driveLinks: document.querySelector("#driveLinks"),
  driveEmpty: document.querySelector("#driveEmpty"),

  // Secciones
  sectionButtons: document.querySelector("#sectionButtons"),
  sectionsEmpty: document.querySelector("#sectionsEmpty"),
  currentSectionName: document.querySelector("#currentSectionName"),

  // Progreso
  progressPercent: document.querySelector("#progressPercent"),
  progressBar: document.querySelector("#progressBar"),
  completedCount: document.querySelector("#completedCount"),
  inProgressCount: document.querySelector("#inProgressCount"),
  pendingCount: document.querySelector("#pendingCount"),
  totalCount: document.querySelector("#totalCount"),

  // Actividades
  activityCount: document.querySelector("#activityCount"),
  activitiesBody: document.querySelector("#activitiesBody"),
  activitiesEmpty: document.querySelector("#activitiesEmpty"),
};


let sections = [];
let selectedSectionId = null;
let db = null;


function configurationIsReady() {
  return (
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("PEGA_AQUI") &&
    SUPABASE_PUBLISHABLE_KEY.length > 20 &&
    !SUPABASE_PUBLISHABLE_KEY.includes("PEGA_AQUI")
  );
}


function showError(text) {
  els.message.textContent = text;
  els.message.classList.remove("hidden");
}


function clearError() {
  els.message.classList.add("hidden");
  els.message.textContent = "";
}


// =============================================================
// INICIAR APLICACIÓN
// =============================================================

async function init() {

  if (!configurationIsReady()) {
    els.loading.classList.add("hidden");

    showError(
      "Falta configurar Supabase. Revisa SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY."
    );

    return;
  }


  db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


  try {

    clearError();

    // Cargamos documentos y secciones
    await Promise.all([
      loadDriveLinks(),
      loadSections()
    ]);

  } catch (error) {

    els.loading.classList.add("hidden");

    showError(
      `No se pudieron cargar los datos: ${error.message}`
    );
  }
}


// =============================================================
// LINKS DE GOOGLE DRIVE
// =============================================================

async function loadDriveLinks() {

  const { data, error } = await db
    .from("links_drive")
    .select("id, apartado, orden, titulo, url")
    .order("orden", { ascending: true });


  if (error) throw error;


  const links = data ?? [];

  renderDriveLinks(links);
}


function renderDriveLinks(links) {

  els.driveLinks.innerHTML = "";


  if (links.length === 0) {

    els.driveEmpty.classList.remove("hidden");

    return;
  }


  els.driveEmpty.classList.add("hidden");


  for (const item of links) {

    const card = document.createElement("article");

    card.className = "drive-card";


    // Icono
    const icon = document.createElement("div");

    icon.className = "drive-icon";

    icon.textContent =
      item.apartado === "WORD ACTUALIZADO"
        ? "📄"
        : "📁";


    // Contenido
    const content = document.createElement("div");

    content.className = "drive-card-content";


    const label = document.createElement("p");

    label.className = "drive-label";

    label.textContent = "GOOGLE DRIVE";


    const title = document.createElement("h3");

    title.textContent = item.titulo;


    const description = document.createElement("p");

    description.className = "drive-description";

    description.textContent =
      item.apartado === "WORD ACTUALIZADO"
        ? "Accede al documento actualizado del proyecto."
        : "Accede a la carpeta principal de archivos del proyecto.";


    // Botón
    const link = document.createElement("a");

    link.className = "drive-button";

    link.href = item.url;

    link.target = "_blank";

    link.rel = "noopener noreferrer";

    link.textContent = "Abrir en Drive ↗";


    content.append(
      label,
      title,
      description,
      link
    );


    card.append(
      icon,
      content
    );


    els.driveLinks.appendChild(card);
  }
}


// =============================================================
// SECCIONES
// =============================================================

async function loadSections() {

  els.loading.classList.remove("hidden");


  const { data, error } = await db
    .from("secciones")
    .select("id, nombre, orden")
    .order("orden", { ascending: true });


  if (error) throw error;


  sections = data ?? [];


  renderSectionButtons();


  if (sections.length === 0) {

    els.loading.classList.add("hidden");

    els.sectionsEmpty.classList.remove("hidden");

    return;
  }


  els.sectionsEmpty.classList.add("hidden");


  await selectSection(
    sections[0].id
  );


  els.loading.classList.add("hidden");

  els.content.classList.remove("hidden");
}


// =============================================================
// BOTONES DE SECCIONES
// =============================================================

function renderSectionButtons() {

  els.sectionButtons.innerHTML = "";


  for (const section of sections) {

    const button = document.createElement("button");


    button.type = "button";

    button.className = "section-button";

    button.textContent = section.nombre;

    button.dataset.sectionId =
      String(section.id);


    button.addEventListener(
      "click",
      () => selectSection(section.id)
    );


    els.sectionButtons.appendChild(button);
  }
}


// =============================================================
// SELECCIONAR SECCIÓN
// =============================================================

async function selectSection(sectionId) {

  selectedSectionId =
    String(sectionId);


  clearError();


  for (
    const button of
    els.sectionButtons.querySelectorAll(".section-button")
  ) {

    button.classList.toggle(
      "active",
      button.dataset.sectionId === selectedSectionId
    );
  }


  const section = sections.find(
    (item) =>
      String(item.id) === selectedSectionId
  );


  els.currentSectionName.textContent =
    section?.nombre ?? "Sección";


  try {

    await loadActivities(sectionId);

  } catch (error) {

    showError(
      `No se pudieron cargar las actividades: ${error.message}`
    );
  }
}


// =============================================================
// ACTIVIDADES
// =============================================================

async function loadActivities(sectionId) {

  const { data, error } = await db
    .from("actividades")
    .select(
      "id, orden, actividad, estado, updated_at, seccion_id"
    )
    .eq("seccion_id", sectionId)
    .order("orden", { ascending: true });


  if (error) throw error;


  const activities = data ?? [];


  renderActivities(activities);

  renderProgress(activities);
}


// =============================================================
// MOSTRAR ACTIVIDADES
// =============================================================

function renderActivities(activities) {

  els.activitiesBody.innerHTML = "";


  els.activityCount.textContent =
    `${activities.length} ${
      activities.length === 1
        ? "actividad"
        : "actividades"
    }`;


  if (activities.length === 0) {

    els.activitiesEmpty.classList.remove("hidden");

    return;
  }


  els.activitiesEmpty.classList.add("hidden");


  for (const activity of activities) {

    const tr =
      document.createElement("tr");


    const number =
      document.createElement("td");

    number.textContent =
      activity.orden;


    const title =
      document.createElement("td");

    title.textContent =
      activity.actividad;


    const statusCell =
      document.createElement("td");


    const status =
      document.createElement("span");


    status.className =
      `status ${statusClass(activity.estado)}`;


    status.textContent =
      activity.estado;


    statusCell.appendChild(status);


    tr.append(
      number,
      title,
      statusCell
    );


    els.activitiesBody.appendChild(tr);
  }
}


// =============================================================
// PROGRESO
// =============================================================

function renderProgress(activities) {

  const total =
    activities.length;


  const completed =
    activities.filter(
      (a) =>
        a.estado === "Completado"
    ).length;


  const inProgress =
    activities.filter(
      (a) =>
        a.estado === "En proceso"
    ).length;


  const pending =
    activities.filter(
      (a) =>
        a.estado === "Pendiente"
    ).length;


  const percent =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );


  els.progressPercent.textContent =
    `${percent}%`;


  els.progressBar.style.width =
    `${percent}%`;


  els.completedCount.textContent =
    completed;


  els.inProgressCount.textContent =
    inProgress;


  els.pendingCount.textContent =
    pending;


  els.totalCount.textContent =
    total;
}


// =============================================================
// CLASE DEL ESTADO
// =============================================================

function statusClass(status) {

  if (status === "Completado")
    return "status-complete";


  if (status === "En proceso")
    return "status-process";


  return "status-pending";
}


// =============================================================
// INICIAR
// =============================================================

init();
