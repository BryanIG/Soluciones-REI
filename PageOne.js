// =============================
// DATOS LOCALES (fallback)
// =============================
const datosCategorias = {
};

// =============================
// FIREBASE
// =============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import {
    getStorage,
    ref as sRef,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    listAll
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js";

// =============================
// LOADING GLOBAL
// =============================
let _loadingStart = 0;
const _LOADING_MIN_MS = 350;

function showLoading() {
    _loadingStart = Date.now();
    document.getElementById("loading-screen")?.classList.add("active");
}

function hideLoading() {
    const elapsed = Date.now() - _loadingStart;
    const remaining = _LOADING_MIN_MS - elapsed;

    if (remaining > 0) {
        setTimeout(() => {
            document.getElementById("loading-screen")?.classList.remove("active");
        }, remaining);
    } else {
        document.getElementById("loading-screen")?.classList.remove("active");
    }
}

// =============================
// UI: Toast + Confirm Modal
// =============================
function uiToast(message, type = "info", opts = {}) {
    const titleMap = { success: "Listo", error: "Ups", info: "Info", warn: "Aviso" };
    const iconMap = { success: "✓", error: "✕", info: "i", warn: "!" };

    const title = opts.title ?? titleMap[type] ?? "Info";
    const ms = opts.ms ?? 2600;

    const wrap = document.getElementById("ui-toasts");
    if (!wrap) return;

    const el = document.createElement("div");
    el.className = `ui-toast ui-toast--${type}`;
    el.innerHTML = `
    <div class="ui-toast__icon">${iconMap[type] ?? "i"}</div>
    <div>
      <div class="ui-toast__title">${title}</div>
      <p class="ui-toast__msg">${message}</p>
    </div>
    <button class="ui-toast__close" aria-label="Cerrar">✕</button>
  `;

    const close = () => {
        el.style.animation = "uiToastOut .18s ease-in forwards";
        setTimeout(() => el.remove(), 180);
    };

    el.querySelector(".ui-toast__close")?.addEventListener("click", close);
    wrap.appendChild(el);

    setTimeout(close, ms);
}

let _uiConfirmBusy = false;

function uiConfirm({ title = "Confirmación", message = "¿Estás seguro?", confirmText = "Aceptar", cancelText = "Cancelar", tone = "warn" } = {}) {
    return new Promise((resolve) => {
        if (_uiConfirmBusy) return resolve(false);
        _uiConfirmBusy = true;

        const modal = document.getElementById("ui-modal");
        const icon = document.getElementById("ui-modal-icon");
        const t = document.getElementById("ui-modal-title");
        const d = document.getElementById("ui-modal-desc");
        const ok = document.getElementById("ui-modal-ok");
        const cancel = document.getElementById("ui-modal-cancel");
        const x = document.getElementById("ui-modal-x");

        if (!modal || !icon || !t || !d || !ok || !cancel || !x) {
            _uiConfirmBusy = false;
            return resolve(window.confirm(message));
        }

        const iconMap = { warn: "!", danger: "🗑️", info: "i" };
        icon.textContent = iconMap[tone] ?? "!";
        t.textContent = title;
        d.textContent = message;

        ok.textContent = confirmText;
        cancel.textContent = cancelText;

        // estilo del botón OK según tono
        ok.classList.remove("ui-btn--danger");
        if (tone === "danger") ok.classList.add("ui-btn--danger");

        const cleanup = (val) => {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.removeEventListener("keydown", onKey);
            ok.removeEventListener("click", onOk);
            cancel.removeEventListener("click", onCancel);
            x.removeEventListener("click", onCancel);
            modal.querySelector(".ui-modal__backdrop")?.removeEventListener("click", onBackdrop);
            _uiConfirmBusy = false;
            resolve(val);
        };

        const onOk = () => cleanup(true);
        const onCancel = () => cleanup(false);
        const onBackdrop = (e) => { if (e.target?.dataset?.close) cleanup(false); };
        const onKey = (e) => { if (e.key === "Escape") cleanup(false); };

        ok.addEventListener("click", onOk);
        cancel.addEventListener("click", onCancel);
        x.addEventListener("click", onCancel);
        modal.querySelector(".ui-modal__backdrop")?.addEventListener("click", onBackdrop);
        document.addEventListener("keydown", onKey);

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        ok.focus();
    });
}

const firebaseConfig = {
    apiKey: "AIzaSyDBYLehTam7rJWrkzH0IUirJ9gn2aWxf0E",
    authDomain: "reconocimientos-rei.firebaseapp.com",
    projectId: "reconocimientos-rei",
    storageBucket: "reconocimientos-rei.firebasestorage.app",
    messagingSenderId: "915562838166",
    appId: "1:915562838166:web:4e75e942268977277f2ab7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ flags admin
let ES_ADMIN = false;
let CATEGORIA_ACTUAL_ID = null;
let CATEGORIA_ACTUAL_TITULO = "";
let WHATSAPP_EMPRESA = "528128953057"; // fallback temporal
let WHATSAPP_PLANTILLA = ""; // se carga desde Firestore

// =============================
// UTILIDADES
// =============================
function normalizarTelefonoWA(num) {
    // Deja solo dígitos (sirve aunque pongan +52, espacios o guiones)
    return String(num || "").replace(/[^\d]/g, "");
}

function armarMensajeCotizacion({ tituloCategoria, idCategoria }) {
    const nombre = (tituloCategoria || idCategoria || "una categoría").trim();

    // Si hay plantilla en Firestore, úsala
    if (WHATSAPP_PLANTILLA && WHATSAPP_PLANTILLA.trim().length > 0) {
        let msg = WHATSAPP_PLANTILLA;

        // Reemplazo principal
        msg = msg.replaceAll("{{producto}}", nombre);

        // Protección: si el admin borró {{producto}}, lo añadimos al final
        if (!WHATSAPP_PLANTILLA.includes("{{producto}}")) {
            msg = `${msg}\n\nProducto: ${nombre}`;
        }

        return msg.trim();
    }

    // Fallback si todavía no hay plantilla
    return (
        `Hola, buen día.

        Me gustaría solicitar una cotización e información sobre: ${nombre}.

        ¿Podría apoyarme con precios, tiempos de entrega y opciones de personalización?

        Muchas gracias.`
    );
}

async function abrirWhatsappCotizacion() {
    await cargarWhatsappDesdeFirestore();

    const phone = normalizarTelefonoWA(WHATSAPP_EMPRESA);
    if (!phone) return;

    const titulo = CATEGORIA_ACTUAL_TITULO || document.getElementById("modalTitulo")?.innerText?.trim() || "";
    const msg = armarMensajeCotizacion({ tituloCategoria: titulo, idCategoria: CATEGORIA_ACTUAL_ID });

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
}

function abrirWhatsappCotizacionSinBloqueo() {
    const phone = normalizarTelefonoWA(WHATSAPP_EMPRESA);
    if (!phone) return;

    const titulo = CATEGORIA_ACTUAL_TITULO || document.getElementById("modalTitulo")?.innerText?.trim() || "";
    const msg = armarMensajeCotizacion({ tituloCategoria: titulo, idCategoria: CATEGORIA_ACTUAL_ID });

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
}

async function cargarWhatsappDesdeFirestore() {
    try {
        const ref = doc(db, "config", "whatsapp");
        const snap = await getDoc(ref);

        if (snap.exists()) {
            const data = snap.data();

            const tel = String(data.telefono || "").trim();
            if (tel) WHATSAPP_EMPRESA = tel;

            const plantilla = String(data.plantilla || "").trim();
            if (plantilla) WHATSAPP_PLANTILLA = plantilla;
        }
    } catch (e) {
        console.warn("No se pudo cargar WhatsApp desde Firestore:", e?.code, e?.message);
    }
}

async function cargarWhatsappEnPanelAdmin() {
    try {
        const ref = doc(db, "config", "whatsapp");
        const snap = await getDoc(ref);

        if (snap.exists()) {
            const data = snap.data();

            if (adminWhatsappTelefono) {
                adminWhatsappTelefono.value = String(data.telefono || "").trim();
            }

            if (adminPlantillaMensaje) {
                adminPlantillaMensaje.value = String(data.plantilla || "");
            }
        } else {
            if (adminWhatsappTelefono) adminWhatsappTelefono.value = "";
            if (adminPlantillaMensaje) adminPlantillaMensaje.value = "";
        }

        actualizarPreviewPlantilla();
    } catch (e) {
        console.warn("No se pudo cargar WhatsApp al panel:", e?.code, e?.message);
    }
}

function actualizarPreviewPlantilla() {
    if (!previewMensajeWA || !adminPlantillaMensaje) return;

    const base = adminPlantillaMensaje.value || "";
    // Demo para el preview (solo visual)
    const demo = base.replaceAll("{{producto}}", "Trofeos De Resina");

    previewMensajeWA.textContent = demo.trim() || "Aquí aparecerá la vista previa...";
}

async function guardarPlantillaDesdePanelAdmin() {
    if (!ES_ADMIN) return;

    const texto = String(adminPlantillaMensaje?.value || "").trim();
    if (!texto) {
        uiToast("Escribe una plantilla", "warn");
        return;
    }

    // regla mínima: debe incluir {{producto}}
    if (!texto.includes("{{producto}}")) {
        uiToast("La plantilla debe incluir {{producto}}", "warn");
        return;
    }

    showLoading();
    try {
        await setDoc(doc(db, "config", "whatsapp"), { plantilla: texto }, { merge: true });
        uiToast("Plantilla guardada", "success");
    } catch (e) {
        console.error(e);
        uiToast("Error al guardar plantilla", "error");
    } finally {
        hideLoading();
    }
}

async function guardarWhatsappDesdePanelAdmin() {
    if (!ES_ADMIN) return;
    if (!adminWhatsappTelefono) return;

    const tel = String(adminWhatsappTelefono.value || "").trim();
    if (!tel) {
        uiToast("Escribe un número de WhatsApp", "warn");
        return;
    }

    showLoading();
    try {
        await setDoc(doc(db, "config", "whatsapp"), { telefono: tel }, { merge: true });
        WHATSAPP_EMPRESA = tel; // actualiza en memoria para usarlo al instante
        uiToast("WhatsApp actualizado", "success");
    } catch (e) {
        console.error(e);
        uiToast(`No se pudo guardar (${e?.code || "error"})`, "error", { ms: 6000 });
    } finally {
        hideLoading();
    }
}

function normalizarIdCategoria(valor) {
    return (valor || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "");
}

function renderCarousel(imagenes) {
    const carouselInner = document.getElementById("carouselInner");
    carouselInner.innerHTML = "";

    // Normaliza y limpia URLs vacías
    const urls = (imagenes || [])
        .map((x) => (typeof x === "string" ? x : x?.url))
        .filter((u) => typeof u === "string" && u.trim() !== "");

    if (urls.length === 0) {
        carouselInner.innerHTML = `
      <div class="carousel-item active">
        <div class="text-center p-5">
          <h5>No hay imágenes en esta categoría</h5>
        </div>
      </div>
    `;
        return;
    }

    urls.forEach((url, index) => {
        carouselInner.innerHTML += `
      <div class="carousel-item ${index === 0 ? "active" : ""}">
        <img src="${url}" class="d-block w-100">
      </div>
    `;
    });
}

// =============================
// MODAL CATEGORÍAS (Firestore con fallback)
// =============================
window.abrirModal = async function (categoria) {
    showLoading();
    try {
        const catId = normalizarIdCategoria(categoria);
        CATEGORIA_ACTUAL_ID = catId;

        const docRef = doc(db, "categorias", catId);
        const snap = await getDoc(docRef);

        let data;
        if (snap.exists()) {
            data = snap.data();
        } else {
            data = datosCategorias[catId];
        }

        if (!data) {
            uiToast("Categoría no encontrada", "error");
            return;
        }

        document.getElementById("modalTitulo").innerText = data.titulo || "";
        CATEGORIA_ACTUAL_TITULO = (data.titulo || "").trim();
        document.getElementById("modalDescripcion").innerText = data.descripcion || "";
        renderCarousel(data.imagenes || []);

        const modal = new bootstrap.Modal(document.getElementById("categoriaModal"));

        // mostrar/ocultar acciones admin
        const modalAdminActionsLocal = document.getElementById("modalAdminActions");
        if (modalAdminActionsLocal) {
            modalAdminActionsLocal.classList.toggle("d-none", !ES_ADMIN);
        }

        modal.show();
    } finally {
        hideLoading();
    }
};

// =============================
// ✅ CARGAR CATEGORÍAS DINÁMICAS DESDE FIRESTORE
// =============================
async function cargarCategoriasDinamicas() {
    const cont = document.getElementById("categoriasDinamicas");
    if (!cont) return;

    showLoading();
    try {
        cont.innerHTML = "";

        const snap = await getDocs(collection(db, "categorias"));

        snap.forEach((docu) => {
            const id = docu.id;
            const data = docu.data();

            const imgs = data.imagenes || [];
            const portada = imgs.length > 0
                ? (typeof imgs[0] === "string" ? imgs[0] : imgs[0].url)
                : "imagenes/logo.png";

            const titulo = (data.titulo || "").trim();
            const tieneUpdatedAt = !!data.updatedAt; // solo los creados desde el panel
            if (!titulo || imgs.length === 0 || !tieneUpdatedAt) return;

            cont.innerHTML += `
        <div class="col-md-4">
          <div class="categoria-card" onclick="abrirModal('${id}')">
            <img src="${portada}" class="img-fluid">
            <h4>${titulo}</h4>
          </div>
        </div>
      `;
        });
    } finally {
        hideLoading();
    }
}

// =============================
// ✅ ACTUALIZAR CATEGORÍAS FIJAS
// =============================
async function actualizarCategoriasFijasDesdeFirestore() {
    // Busca todas las cards fijas (las que tú marcaste con data-cat)
    const cards = document.querySelectorAll(".categoria-card[data-cat]");
    if (!cards || cards.length === 0) return;

    try {
        // Traemos todos los docs de categorias una sola vez
        const snap = await getDocs(collection(db, "categorias"));

        // Convertimos a mapa: id -> data
        const mapa = {};
        snap.forEach((d) => { mapa[d.id] = d.data(); });

        // Recorremos cards fijas y aplicamos override si existe en Firestore
        cards.forEach((card) => {
            const id = card.getAttribute("data-cat");
            const data = mapa[id];
            if (!data) return; // si no existe en Firestore, deja lo local

            // ✅ Título
            const titulo = (data.titulo || "").trim();
            if (titulo) {
                const h4 = card.querySelector(".cat-title");
                if (h4) h4.textContent = titulo;
            }

            // ✅ Imagen (portada = primera)
            const imgs = data.imagenes || [];
            const portada = imgs.length > 0
                ? (typeof imgs[0] === "string" ? imgs[0] : imgs[0].url)
                : null;

            if (portada) {
                const imgEl = card.querySelector(".cat-img");
                if (imgEl) imgEl.src = portada;
            }
        });

    } catch (e) {
        console.error("Error actualizando categorías fijas:", e);
    }
}

// cargar al iniciar
cargarCategoriasDinamicas();
actualizarCategoriasFijasDesdeFirestore();
cargarWhatsappDesdeFirestore();

// =============================
// CONTROL ADMIN (mostrar/ocultar)
// =============================
const adminOptions = document.getElementById("adminOptions");
const logoutBtnContainer = document.getElementById("logoutBtnContainer");
const logoutBtn = document.getElementById("logoutBtn");

// Panel elements
const adminCategoriaId = document.getElementById("adminCategoriaId");
const adminTitulo = document.getElementById("adminTitulo");
const adminDescripcion = document.getElementById("adminDescripcion");
const adminImagenes = document.getElementById("adminImagenes");
const adminListaImagenes = document.getElementById("adminListaImagenes");
const btnGuardarTodo = document.getElementById("btnGuardarTodo");
const adminWhatsappTelefono = document.getElementById("adminWhatsappTelefono");
const btnGuardarWhatsapp = document.getElementById("btnGuardarWhatsapp");
const adminPlantillaMensaje = document.getElementById("adminPlantillaMensaje");
const btnGuardarPlantilla = document.getElementById("btnGuardarPlantilla");
const previewMensajeWA = document.getElementById("previewMensajeWA");

// Acciones Admin dentro del modal de categoría
const modalAdminActions = document.getElementById("modalAdminActions");
const btnEditarCategoria = document.getElementById("btnEditarCategoria");
const btnEliminarCategoria = document.getElementById("btnEliminarCategoria");

const adminModalEl = document.getElementById("adminModal");

function limpiarPanelAdmin() {
    adminCategoriaId.value = "";
    adminTitulo.value = "";
    adminDescripcion.value = "";
    adminImagenes.value = "";
    adminListaImagenes.innerHTML = `<div class="text-muted">No hay imágenes guardadas.</div>`;
}

// Cada vez que abras el modal desde "Panel Admin", empieza en blanco
adminModalEl?.addEventListener("show.bs.modal", async () => {
    limpiarPanelAdmin();
    await cargarWhatsappEnPanelAdmin();
});

btnEditarCategoria?.addEventListener("click", async () => {
    if (!ES_ADMIN) return;
    if (!CATEGORIA_ACTUAL_ID) return;

    // Cerrar modal de categoría
    const catModalEl = document.getElementById("categoriaModal");
    const catModalInstance = bootstrap.Modal.getInstance(catModalEl);
    catModalInstance?.hide();

    // Abrir modal admin
    const adminModalEl = document.getElementById("adminModal");
    const adminModal = new bootstrap.Modal(adminModalEl);
    adminModal.show();

    // Cargar esa categoría en el panel
    adminCategoriaId.value = CATEGORIA_ACTUAL_ID;
    await cargarCategoriaEnPanel(CATEGORIA_ACTUAL_ID);
});

btnEliminarCategoria?.addEventListener("click", async () => {
    if (!ES_ADMIN) return;
    if (!CATEGORIA_ACTUAL_ID) return;

    await eliminarCategoriaCompleta(CATEGORIA_ACTUAL_ID);
});

function getCatIdDesdePanel() {
    return normalizarIdCategoria(adminCategoriaId.value);
}

btnGuardarTodo?.addEventListener("click", async () => {
    const catId = getCatIdDesdePanel();
    if (!catId) {
        uiToast("Escribe un ID de categoría", "warn");
        return;
    }

    showLoading();
    try {
        const refCat = doc(db, "categorias", catId);

        // 1) Leer lo actual (si existe)
        const snapAntes = await getDoc(refCat);

        // 2) Base de imágenes:
        // - Si existe en Firestore: usa esas
        // - Si NO existe: trae las del fallback local (para no perderlas)
        const imagenesActuales = snapAntes.exists()
            ? (snapAntes.data().imagenes || [])
            : (datosCategorias[catId]?.imagenes || []);

        // 3) Guardar título/desc + asegurar imágenes base si era categoría vieja
        await setDoc(refCat, {
            titulo: adminTitulo.value.trim(),
            descripcion: adminDescripcion.value.trim(),
            imagenes: imagenesActuales,          // ✅ clave para categorías por defecto
            updatedAt: serverTimestamp()
        }, { merge: true });

        // 4) Si el admin seleccionó imágenes nuevas, subirlas y anexarlas (sin reemplazar)
        const files = adminImagenes.files;
        if (files && files.length > 0) {
            const nuevas = [];

            for (const file of files) {
                const safeName = file.name.replace(/\s+/g, "_");
                const path = `categorias/${catId}/${Date.now()}_${safeName}`;
                const storageRef = sRef(storage, path);

                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);

                nuevas.push({
                    url,
                    path,
                    nombre: file.name,
                    createdAt: Date.now()
                });
            }

            // Traer lo último y anexar
            const snapDespues = await getDoc(refCat);
            const actualesFinal = snapDespues.exists() ? (snapDespues.data().imagenes || []) : imagenesActuales;

            await updateDoc(refCat, {
                imagenes: [...actualesFinal, ...nuevas],
                updatedAt: serverTimestamp()
            });

            adminImagenes.value = "";
        }

        // 5) Refrescar UI
        await cargarCategoriaEnPanel(catId);
        await cargarCategoriasDinamicas();

        uiToast("Cambios guardados", "success");
    } catch (e) {
        console.error(e);
        uiToast("Error al guardar cambios", "error");
    } finally {
        hideLoading();
    }
});

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        ES_ADMIN = false;
        adminOptions.style.display = "none";
        logoutBtnContainer.style.display = "none";
        return;
    }

    const adminRef = doc(db, "usuarios", user.uid);
    const adminSnap = await getDoc(adminRef);

    if (adminSnap.exists()) {
        ES_ADMIN = true;
        adminOptions.style.display = "block";
        logoutBtnContainer.style.display = "block";
    } else {
        ES_ADMIN = false;
        adminOptions.style.display = "none";
        logoutBtnContainer.style.display = "none";
    }
});

logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.reload();
});

// =============================
// PANEL: cargar categoría al escribir
// =============================
async function cargarCategoriaEnPanel(catId) {
    try {
        const docRef = doc(db, "categorias", catId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // 🔥 Datos desde Firebase
            const data = docSnap.data();
            adminTitulo.value = data.titulo || "";
            adminDescripcion.value = data.descripcion || "";
            pintarListaImagenes(data.imagenes || []);
        } else {
            // ⭐ Fallback a datos locales
            const local = datosCategorias[catId];
            if (local) {
                adminTitulo.value = local.titulo || "";
                adminDescripcion.value = local.descripcion || "";
                pintarListaImagenes(local.imagenes || []);
            } else {
                // Vacío si no existe en ningún lado
                adminTitulo.value = "";
                adminDescripcion.value = "";
                pintarListaImagenes([]);
            }
        }
    } catch (error) {
        console.error("Error cargando categoría:", error);
    }
}

function pintarListaImagenes(imagenes) {
    adminListaImagenes.innerHTML = "";

    if (!imagenes || imagenes.length === 0) {
        adminListaImagenes.innerHTML = `<div class="text-muted">No hay imágenes guardadas.</div>`;
        return;
    }

    imagenes.forEach((img) => {
        const url = typeof img === "string" ? img : img.url;
        const path = typeof img === "string" ? null : img.path;
        const nombre = typeof img === "string" ? "Imagen" : (img.nombre || "Imagen");

        adminListaImagenes.innerHTML += `
      <div class="d-flex align-items-center gap-2 border rounded p-2">
        <img src="${url}" style="width:90px;height:60px;object-fit:cover;border-radius:8px;">
        <div class="flex-grow-1">
          <div class="fw-semibold">${nombre}</div>
          <div class="text-muted" style="font-size:12px">${path || "No editable (local)"}</div>
        </div>
        ${path ? `<button class="btn btn-sm btn-danger" data-path="${path}">Eliminar</button>` : ""}
      </div>
    `;
    });

    adminListaImagenes.querySelectorAll("button[data-path]").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const catId = getCatIdDesdePanel();
            await eliminarImagen(catId, btn.dataset.path);
            await cargarCategoriasDinamicas();
        });
    });
}

let timerCat = null;
adminCategoriaId?.addEventListener("input", () => {
    clearTimeout(timerCat);
    timerCat = setTimeout(async () => {
        const catId = getCatIdDesdePanel();
        await cargarCategoriaEnPanel(catId);
    }, 350);
});

document.getElementById("btnCotizarWhatsapp")?.addEventListener("click", () => {
    abrirWhatsappCotizacionSinBloqueo();
});

btnGuardarWhatsapp?.addEventListener("click", async () => {
    await guardarWhatsappDesdePanelAdmin();
});

adminPlantillaMensaje?.addEventListener("input", actualizarPreviewPlantilla);
btnGuardarPlantilla?.addEventListener("click", guardarPlantillaDesdePanelAdmin);

// =============================
// PANEL: eliminar imagen (Storage + Firestore)
// =============================
async function eliminarImagen(catId, path) {
    if (!catId || !path) return;

    const ok = await uiConfirm({
        title: "Eliminar imagen",
        message: "¿Eliminar esta imagen? Esta acción no se puede deshacer.",
        confirmText: "Sí, eliminar",
        cancelText: "Cancelar",
        tone: "danger"
    });
    if (!ok) return;

    showLoading();
    try {
        const refCat = doc(db, "categorias", catId);
        const snap = await getDoc(refCat);
        if (!snap.exists()) return;

        const data = snap.data();
        const imagenes = data.imagenes || [];
        const nuevaLista = imagenes.filter((img) => typeof img === "string" ? true : img.path !== path);

        await deleteObject(sRef(storage, path));

        await updateDoc(refCat, {
            imagenes: nuevaLista,
            updatedAt: serverTimestamp()
        });

        await cargarCategoriaEnPanel(catId);
    } catch (error) {
        console.error(error);
        uiToast("Error al eliminar imagen", "error");
    } finally {
        hideLoading();
    }
}

// =============================
// ELIMINAR CATEGORÍA COMPLETA
// =============================
async function eliminarCategoriaCompleta(catId) {
    const cat = normalizarIdCategoria(catId);

    const ok1 = await uiConfirm({
        title: "Eliminar categoría",
        message: `¿Seguro que quieres ELIMINAR la categoría "${cat}"?`,
        confirmText: "Sí, eliminar",
        cancelText: "Cancelar",
        tone: "danger"
    });
    if (!ok1) return;

    const ok2 = await uiConfirm({
        title: "Confirmación final",
        message: "Esto borrará también TODAS las imágenes de Storage. ¿Confirmas?",
        confirmText: "Confirmar borrado",
        cancelText: "Cancelar",
        tone: "danger"
    });
    if (!ok2) return;

    showLoading();
    try {
        // borrar folder en Storage
        const folderRef = sRef(storage, `categorias/${cat}`);
        try {
            const res = await listAll(folderRef);
            for (const item of res.items) {
                try { await deleteObject(item); } catch (e) { }
            }
        } catch (e) { }

        // borrar doc en Firestore
        await deleteDoc(doc(db, "categorias", cat));

        // cerrar modal de categoría
        const catModalEl = document.getElementById("categoriaModal");
        const inst = bootstrap.Modal.getInstance(catModalEl);
        inst?.hide();

        await cargarCategoriasDinamicas();

        uiToast("Categoría eliminada", "success");
    } catch (error) {
        console.error(error);
        uiToast("Error al eliminar categoría (revisa permisos/rules)", "error");
    } finally {
        hideLoading();
    }
}