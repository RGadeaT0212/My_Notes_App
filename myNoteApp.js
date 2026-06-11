// ==========================================================================
// SUPABASE CLOUD CONNECTION INITIALIZATION (Collision-Proof Version)
// ==========================================================================
const SUPABASE_URL = "https://vgelhstxwaroystxtvpi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qebp47e0OiGEozzCcXmwpA_6AkJ1aX7";

// Initializing the live database toolbelt instance with a unique variable name
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================================================
// ZONE 0: DICTIONARY TRANSLATIONS SYSTEM (BILINGUAL i18n DATA CONFIG)
// ==========================================================================
const translations = {
    en: {
        appTitle: "My Notes App",
        notesColumn: "Notes",
        listsColumn: "Checklists",
        newNote: "New Note",
        newChecklist: "New Checklist",
        createNoteBtn: "Create Note",
        createListBtn: "Create List",
        placeholderNote: "Note Title...",
        placeholderList: "Checklist Title...",
        emptyNotes: "No notes saved yet. Type a title above to create one!",
        emptyLists: "No checklists created yet. Start organizing your tasks above!",
        saveCard: "Save Content",
        deleteCard: "Delete Card",
        innerTodoPlaceholder: "Add item...",
        innerTodoBtn: "Add",
        listDone: "Done! 🎉",
        overlayTitle: "Create Workspace Item"
    },
    es: {
        appTitle: "Mi Aplicación de Notas",
        notesColumn: "Notas",
        listsColumn: "Listas de Tareas",
        newNote: "Nueva Nota",
        newChecklist: "Nueva Lista",
        createNoteBtn: "Crear Nota",
        createListBtn: "Crear Lista",
        placeholderNote: "Título de la Nota...",
        placeholderList: "Título de la Lista...",
        emptyNotes: "No hay notas guardadas aún. ¡Escribe un título arriba para crear una!",
        emptyLists: "No hay listas creadas aún. ¡Empieza a organizar tus tareas arriba!",
        saveCard: "Guardar",
        deleteCard: "Eliminar",
        innerTodoPlaceholder: "Añadir tarea...",
        innerTodoBtn: "Añadir",
        listDone: "¡Hecho! 🎉",
        overlayTitle: "Crear Elemento de Trabajo"
    }
};

// ==========================================================================
// ZONE 1: APPLICATION CORE APP STATES VARIABLES
// ==========================================================================
let dashboardState = []; // Instantiated as empty; hydrated instantly from cloud records
let expandedCardsState = JSON.parse(localStorage.getItem("my_expanded_cards")) || {};
let currentLang = localStorage.getItem("my_app_lang") || "en";
let activePalette = localStorage.getItem("my_app_palette") || "default";
let activeFont = localStorage.getItem("my_app_font") || "Segoe UI, sans-serif";

// ==========================================================================
// ZONE 2: ELEMENT DOM CACHED REFERENCES INITIALIZATION
// ==========================================================================
const notesDisplay = document.getElementById("notes-display");
const checklistsDisplay = document.getElementById("checklists-display");

const creationOverlay = document.getElementById("creation-overlay");
const floatingAddBtn = document.getElementById("floating-add-btn");
const closeOverlayBtn = document.getElementById("close-overlay-btn");

const noteTitleInput = document.getElementById("note-title-input");
const createNoteBtn = document.getElementById("create-note-btn");
const checklistTitleInput = document.getElementById("checklist-title-input");
const createListBtn = document.getElementById("create-list-btn");

const settingsToggleBtn = document.getElementById("settings-toggle-btn");
const settingsPanel = document.getElementById("settings-panel");
const fontSelect = document.getElementById("font-select");
const paletteSelect = document.getElementById("palette-select");
const langSelect = document.getElementById("lang-select");

// ==========================================================================
// ZONE 3: DYNAMIC APPLICATION EVENT EVENTLISTENERS LOGIC
// ==========================================================================

floatingAddBtn.addEventListener("click", () => {
    creationOverlay.classList.remove("hidden");
    setTimeout(() => checklistTitleInput.focus(), 300); 
});

closeOverlayBtn.addEventListener("click", () => {
    creationOverlay.classList.add("hidden");
});

settingsToggleBtn.addEventListener("click", () => {
    settingsPanel.classList.toggle("hidden");
});

// --- ASYNCHRONOUS CLOUD CRUD DATABASE OPERATIONS ---

async function executeChecklistCreation() {
    const titleText = checklistTitleInput.value.trim();
    if (titleText === "") return;

    const newListObj = {
        id: "card_" + Date.now(),
        type: "checklist",
        name: titleText,
        items: []
    };

    try {
        const { error } = await supabaseClient
            .from('notes')
            .insert([newListObj]);

        if (error) throw error;

        dashboardState.push(newListObj);
        expandedCardsState[newListObj.id] = true;
        checklistTitleInput.value = "";
        creationOverlay.classList.add("hidden");
        renderDashboard();
    } catch (err) {
        alert("Cloud write failure: " + err.message);
    }
}

async function executeNoteCreation() {
    const titleText = noteTitleInput.value.trim();
    if (titleText === "") return;

    const newNoteObj = {
        id: "card_" + Date.now(),
        type: "note",
        name: titleText,
        body_content: "" // Database naming conventions support underscores
    };

    try {
        const { error } = await supabaseClient
            .from('notes')
            .insert([newNoteObj]);

        if (error) throw error;

        dashboardState.push(newNoteObj);
        expandedCardsState[newNoteObj.id] = true;
        noteTitleInput.value = "";
        creationOverlay.classList.add("hidden");
        renderDashboard();
    } catch (err) {
        alert("Cloud write failure: " + err.message);
    }
}

// Triggers
createListBtn.addEventListener("click", executeChecklistCreation);
checklistTitleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") executeChecklistCreation();
});

createNoteBtn.addEventListener("click", executeNoteCreation);
noteTitleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") executeNoteCreation();
});

langSelect.addEventListener("change", (e) => {
    currentLang = e.target.value;
    localStorage.setItem("my_app_lang", currentLang);
    translateUI();
    renderDashboard();
});

fontSelect.addEventListener("change", (e) => {
    activeFont = e.target.value;
    localStorage.setItem("my_app_font", activeFont);
    applyFontPreferences();
});

paletteSelect.addEventListener("change", (e) => {
    activePalette = e.target.value;
    localStorage.setItem("my_app_palette", activePalette);
    applyPalettePreferences();
});

// ==========================================================================
// ZONE 4: MASTER RUNTIME DATA RENDER CONFIGURATION FUNCTIONS
// ==========================================================================

// Dynamic Asynchronous Cloud Hydrator
async function fetchNotesFromCloud() {
    try {
        const { data, error } = await supabaseClient
            .from('notes')
            .select('*');

        if (error) throw error;

        if (data) {
            dashboardState = data;
            renderDashboard();
        }
    } catch (err) {
        console.error("Critical Cloud Pipeline Fetch Failure: ", err.message);
    }
}

function translateUI() {
    const langData = translations[currentLang];
    if (!langData) return; 
    
    const elNotesCol = document.getElementById("notes-column-title");
    if (elNotesCol) elNotesCol.textContent = langData.notesColumn;

    const elListsCol = document.getElementById("lists-column-title");
    if (elListsCol) elListsCol.textContent = langData.listsColumn;

    const elOverlayTitle = document.getElementById("creation-overlay-title");
    if (elOverlayTitle) elOverlayTitle.textContent = langData.overlayTitle;

    const elNewNoteTitle = document.getElementById("new-note-title");
    if (elNewNoteTitle) elNewNoteTitle.textContent = langData.newNote;

    const elNewListTitle = document.getElementById("new-checklist-title");
    if (elNewListTitle) elNewListTitle.textContent = langData.newChecklist;
    
    if (createNoteBtn) createNoteBtn.textContent = langData.createNoteBtn;
    if (createListBtn) createListBtn.textContent = langData.createListBtn;
    if (noteTitleInput) noteTitleInput.placeholder = langData.placeholderNote;
    if (checklistTitleInput) checklistTitleInput.placeholder = langData.placeholderList;
    
    if (langSelect) langSelect.value = currentLang;
}

function applyFontPreferences() {
    document.body.style.fontFamily = activeFont;
    fontSelect.value = activeFont;
}

function applyPalettePreferences() {
    const root = document.documentElement;
    paletteSelect.value = active
