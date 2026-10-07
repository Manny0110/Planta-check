// =============================================================
// CONFIGURACIÓN DE SUPABASE
// Pega aquí SOLO tu Project URL y tu Publishable/anon key.
// NUNCA uses la service_role key en una página pública.
// =============================================================
const SUPABASE_URL = "https://hzsqgqiljukgqrblovrx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_YgxLYterTKv8-Xak9gF5YQ_zf3aWZ5q";

// =============================================================
// ELEMENTOS DE LA PÁGINA
// =============================================================

const els = {
  loading: document.querySelector("#loading"),
  message: document.querySelector("#message"),
  content: document.querySelector("#content"),

  driveLinks: document.querySelector("#driveLinks"),
  driveEmpty: document.querySelector("#driveEmpty"),

  sectionButtons: document.querySelector("#sectionButtons"),
  sectionsEmpty: document.querySelector("#sectionsEmpty"),
  currentSectionName: document.querySelector("#currentSectionName"),

  progressPercent: document.querySelector("#progressPercent"),
  progressBar: document.querySelector("#progressBar"),
  completedCount: document.querySelector("#completedCount"),
  inProgressCount: document.querySelector("#inProgressCount"),
  pendingCount: document.querySelector("#pendingCount"),
  totalCount: document.querySelector("#totalCount"),

  activityCount: document.querySelector("#activityCount"),
  activitiesBody: document.querySelector("#activitiesBody"),
  activitiesEmpty: document.querySelector("#activitiesEmpty"),
};

let sections = [];
let selectedSectionId = null;
let db = null;

// =============================================================
// CONFIGURACIÓN Y MENSAJES
// =============================================================

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
  els.message.textContent = "";
  els.message.classList.add("hidden");
}

// =============================================================
// INICIAR APLICACIÓN
// =============================================================

async function init() {
  if (!configurationIsReady()) {
    els.loading.classList.add("hidden");
    showError(
      "Falta configurar Supabase. Revisa las dos primeras constantes de app.js."
    );
    return;
  }

  if (!window.supabase) {
    els.loading.classList.add("hidden");
    showError("No se pudo cargar la biblioteca de Supabase.");
    return;
  }

  db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  clearError();

  try {
    const results = await Promise.allSettled([
      loadDriveLinks(),
      loadSections()
    ]);

    const errors = results
      .filter(result => result.status === "rejected")
      .map(result => result.reason.message);

    if (errors.length > 0) {
      showError(`Error al cargar datos: ${errors.join("; ")}`);
    }
  } catch (error) {
    showError(`Error inesperado: ${error.message}`);
  } finally {
    els.loading.classList.add("hidden");
  }
}

// =============================================================
// GOOGLE DRIVE
// =============================================================

async function loadDriveLinks() {
  const { data, error } = await db
    .from("links_drive")
    .select("id, apartado, orden, titulo, url")
    .order("orden", { ascending: true });

  if (error) throw error;

  renderDriveLinks(data ?? []);
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

    const icon = document.createElement("div");
    icon.className = "drive-icon";
    icon.textContent =
      item.apartado === "WORD ACTUALIZADO" ? "📄" : "📁";

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
        : "Accede a los archivos del proyecto.";

    const link = document.createElement("a");
    link.className = "drive-button";
    link.textContent = "Abrir en Drive ↗";

    // Solo aceptar enlaces HTTPS de Google Drive.
    try {
      const url = new URL(item.url);
      if (
        url.protocol === "https:" &&
        url.hostname === "drive.google.com"
      ) {
        link.href = url.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      } else {
        link.removeAttribute("href");
        link.textContent = "Enlace no válido";
      }
    } catch {
      link.textContent = "Enlace no válido";
    }

    content.append(label, title, description, link);
    card.append(icon, content);
    els.driveLinks.appendChild(card);
  }
}

// =============================================================
// CARGAR SECCIONES
// =============================================================

async function loadSections() {
  const { data, error } = await db
    .from("secciones")
    .select("id, nombre, orden")
    .order("orden", { ascending: true });

  if (error) throw error;

  sections = data ?? [];
  renderSectionButtons();

  if (sections.length === 0) {
    els.sectionsEmpty.classList.remove("hidden");
    els.content.classList.add("hidden");
    return;
  }

  els.sectionsEmpty.classList.add("hidden");

  await selectSection(sections[0].id);
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
    button.dataset.sectionId = String(section.id);

    button.addEventListener("click", () => {
      selectSection(section.id);
    });

    els.sectionButtons.appendChild(button);
  }
}

// =============================================================
// SELECCIONAR SECCIÓN
// =============================================================

async function selectSection(sectionId) {
  selectedSectionId = String(sectionId);
  clearError();

  for (const button of els.sectionButtons.querySelectorAll(
    ".section-button"
  )) {
    button.classList.toggle(
      "active",
      button.dataset.sectionId === selectedSectionId
    );
  }

  const section = sections.find(
    item => String(item.id) === selectedSectionId
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
// CARGAR ACTIVIDADES Y RESPONSABLES
// =============================================================

async function loadActivities(sectionId) {
  const { data, error } = await db
    .from("actividades")
    .select(
      "id, orden, actividad, responsable, estado, updated_at, seccion_id"
    )
    .eq("seccion_id", sectionId)
    .order("orden", { ascending: true });

  if (error) throw error;

  // Evita mostrar datos de otra sección si el usuario
  // cambia rápidamente entre botones.
  if (String(sectionId) !== selectedSectionId) return;

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
      activities.length === 1 ? "actividad" : "actividades"
    }`;

  if (activities.length === 0) {
    els.activitiesEmpty.classList.remove("hidden");
    return;
  }

  els.activitiesEmpty.classList.add("hidden");

  for (const activity of activities) {
    const tr = document.createElement("tr");

    // Número
    const number = document.createElement("td");
    number.textContent = activity.orden;

    // Actividad
    const title = document.createElement("td");
    title.textContent = activity.actividad;

    // Responsable
    const responsibleCell = document.createElement("td");

    const responsible = document.createElement("span");
    responsible.className = "responsible";
    responsible.textContent =
      activity.responsable || "Sin asignar";

    responsibleCell.appendChild(responsible);

    // Estado
    const statusCell = document.createElement("td");

    const status = document.createElement("span");
    status.className = `status ${statusClass(activity.estado)}`;
    status.textContent = activity.estado;

    statusCell.appendChild(status);

    // Orden de las cuatro columnas
    tr.append(
      number,
      title,
      responsibleCell,
      statusCell
    );

    els.activitiesBody.appendChild(tr);
  }
}

// =============================================================
// PROGRESO
// =============================================================

function renderProgress(activities) {
  const total = activities.length;

  const completed = activities.filter(
    a => a.estado === "Completado"
  ).length;

  const inProgress = activities.filter(
    a => a.estado === "En proceso"
  ).length;

  const pending = activities.filter(
    a => a.estado === "Pendiente"
  ).length;

  const percent =
    total === 0
      ? 0
      : Math.round((completed / total) * 100);

  els.progressPercent.textContent = `${percent}%`;
  els.progressBar.style.width = `${percent}%`;

  els.completedCount.textContent = completed;
  els.inProgressCount.textContent = inProgress;
  els.pendingCount.textContent = pending;
  els.totalCount.textContent = total;
}

// =============================================================
// ESTILOS DE ESTADO
// =============================================================

function statusClass(status) {
  if (status === "Completado") {
    return "status-complete";
  }

  if (status === "En proceso") {
    return "status-process";
  }

  return "status-pending";
}

// =============================================================
// INICIAR
// =============================================================

init();


