// ==========================================================================
// SUPABASE CLOUD CONNECTION INITIALIZATION (Collision-Proof Version)
// ==========================================================================
const SUPABASE_URL = "https://vgelhstxwaroystxtvpi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZWxoc3R4d2Fyb3lzdHh0dnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNjQyNDgsImV4cCI6MjA5NjY0MDI0OH0.dimqxPWIhejuLifm0ooqiEXqz0T7un_NB4s3WhdJlnw";

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
    paletteSelect.value = activePalette;
    
    if (activePalette === "default") {
        root.style.setProperty('--bg-color', '#f4f7f6');
        root.style.setProperty('--surface-color', '#ffffff');
        root.style.setProperty('--text-color', '#333333');
        root.style.setProperty('--primary-color', '#4caf50');
        root.style.setProperty('--primary-hover', '#45a049');
        root.style.setProperty('--border-color', '#cccccc');
    } else if (activePalette === "ocean") {
        root.style.setProperty('--bg-color', '#04bdb3');
        root.style.setProperty('--surface-color', '#004d40');
        root.style.setProperty('--text-color', '#f8f6f6');
        root.style.setProperty('--primary-color', '#00bfa5');
        root.style.setProperty('--primary-hover', '#00b0ff');
        root.style.setProperty('--border-color', '#00796b');
    } else if (activePalette === "sunset") {
        root.style.setProperty('--bg-color', '#fff3e0');
        root.style.setProperty('--surface-color', '#3e2723');
        root.style.setProperty('--text-color', '#f38908');
        root.style.setProperty('--primary-color', '#ff9800');
        root.style.setProperty('--primary-hover', '#f57c00');
        root.style.setProperty('--border-color', '#e65100');
    } else if (activePalette === "cyberpunk") {
        root.style.setProperty('--bg-color', '#120136');
        root.style.setProperty('--surface-color', '#03001e');
        root.style.setProperty('--text-color', '#00f5ff');
        root.style.setProperty('--primary-color', '#ff007f');
        root.style.setProperty('--primary-hover', '#7300ff');
        root.style.setProperty('--border-color', '#7300ff');
    }
}

function renderDashboard() {
    notesDisplay.innerHTML = "";
    checklistsDisplay.innerHTML = "";
    const langData = translations[currentLang];

    let noteCount = 0;
    let checklistCount = 0;
    for (let card of dashboardState) {
        if (card.type === "note") noteCount++;
        if (card.type === "checklist") checklistCount++;
    }

    if (noteCount === 0) {
        const emptyNotice = document.createElement("p");
        emptyNotice.textContent = langData.emptyNotes;
        emptyNotice.style.color = "var(--text-color)";
        emptyNotice.style.opacity = "0.6";
        emptyNotice.style.fontStyle = "italic";
        emptyNotice.style.fontSize = "14px";
        emptyNotice.style.padding = "10px";
        notesDisplay.appendChild(emptyNotice);
    }

    if (checklistCount === 0) {
        const emptyNotice = document.createElement("p");
        emptyNotice.textContent = langData.emptyLists;
        emptyNotice.style.color = "var(--text-color)";
        emptyNotice.style.opacity = "0.6";
        emptyNotice.style.fontStyle = "italic";
        emptyNotice.style.fontSize = "14px";
        emptyNotice.style.padding = "10px";
        checklistsDisplay.appendChild(emptyNotice);
    }

    for (let card of dashboardState) {
        const fieldText = document.createElement("fieldset");
        fieldText.classList.add("fade-in-item");

        const fieldName = document.createElement("legend");
        fieldName.classList.add("accordion-header");
        
        let progressText = "";
        if (card.type === "checklist" && card.items && card.items.length > 0) {
            const totalTasks = card.items.length;
            const completedTasks = card.items.filter(t => t.completed).length;
            
            if (completedTasks === totalTasks) {
                progressText = ` <span style="color: var(--primary-color); font-weight: bold; margin-left: 6px;">(${langData.listDone})</span>`;
            } else {
                progressText = ` <span style="opacity: 0.6; font-weight: normal; margin-left: 6px;">(${completedTasks}/${totalTasks})</span>`;
            }
        }
        
        fieldName.innerHTML = `${card.name}${progressText} <i class="fa-solid ${expandedCardsState[card.id] ? 'fa-chevron-up' : 'fa-chevron-down'}" style="margin-left: 8px; font-size: 0.75rem; opacity: 0.7;"></i>`;
        
        fieldName.addEventListener("click", () => {
            expandedCardsState[card.id] = !expandedCardsState[card.id];
            localStorage.setItem("my_expanded_cards", JSON.stringify(expandedCardsState));
            renderDashboard();
        });
        
        fieldText.appendChild(fieldName);

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-collapsible-body");
        if (!expandedCardsState[card.id]) {
            cardBody.classList.add("collapsed");
        }

        if (card.type === "note") {
            const newText = document.createElement("textarea");
            newText.value = card.body_content || "";
            cardBody.appendChild(newText);

            const actionsRow = document.createElement("div");
            actionsRow.classList.add("card-actions-row");

            const saveBtn = document.createElement("button");
            saveBtn.textContent = langData.saveCard;
            saveBtn.classList.add("save-card-btn");
            
            // Full-stack asynchronous note updating
            saveBtn.addEventListener("click", async () => {
                card.body_content = newText.value;
                saveBtn.style.backgroundColor = "var(--primary-hover)";
                try {
                    const { error } = await supabaseClient
                        .from('notes')
                        .update({ body_content: card.body_content })
                        .eq('id', card.id);
                    if (error) throw error;
                    setTimeout(() => { saveBtn.style.backgroundColor = "var(--primary-color)"; }, 500);
                } catch (err) {
                    alert("Cloud save failed: " + err.message);
                }
            });

            const deleteCardBtn = document.createElement("button");
            deleteCardBtn.textContent = langData.deleteCard;
            deleteCardBtn.classList.add("delete-card-btn");
            
            // Full-stack asynchronous card dropping
            deleteCardBtn.addEventListener("click", async () => {
                if(!confirm("Delete this card from the cloud permanent register?")) return;
                try {
                    const { error } = await supabaseClient
                        .from('notes')
                        .delete()
                        .eq('id', card.id);
                    if (error) throw error;

                    dashboardState = dashboardState.filter(item => item.id !== card.id);
                    delete expandedCardsState[card.id];
                    renderDashboard();
                } catch (err) {
                    alert("Cloud delete failed: " + err.message);
                }
            });

            actionsRow.appendChild(saveBtn);
            actionsRow.appendChild(deleteCardBtn);
            cardBody.appendChild(actionsRow);

        } else if (card.type === "checklist") {
            const listWrapper = document.createElement("ul");
            listWrapper.classList.add("inner-task-list");

            for (let task of card.items) {
                const li = document.createElement("li");
                const cb = document.createElement("input");
                cb.type = "checkbox";
                cb.checked = task.completed;
                
                const span = document.createElement("span");
                span.textContent = task.text;
                if (task.completed) {
                    span.style.textDecoration = "line-through";
                    span.style.color = "gray";
                }

                // Full-stack asynchronous checklist state change
                cb.addEventListener("change", async () => {
                    task.completed = cb.checked;
                    try {
                        const { error } = await supabaseClient
                            .from('notes')
                            .update({ items: card.items })
                            .eq('id', card.id);
                        if (error) throw error;
                        renderDashboard();
                    } catch (err) {
                        alert("Task sync failed: " + err.message);
                    }
                });

                li.appendChild(cb);
                li.appendChild(span);
                listWrapper.appendChild(li);
            }

            const miniInputRow = document.createElement("div");
            miniInputRow.classList.add("inner-input-section");

            const miniInput = document.createElement("input");
            miniInput.type = "text";
            miniInput.placeholder = langData.innerTodoPlaceholder;

            // Asynchronous micro sub-item insertion logic
            async function submitTaskItem() {
                let taskText = miniInput.value.trim();
                if (taskText === "") return;
                
                card.items.push({ text: taskText, completed: false });
                try {
                    const { error } = await supabaseClient
                        .from('notes')
                        .update({ items: card.items })
                        .eq('id', card.id);
                    if (error) throw error;
                    renderDashboard();
                } catch (err) {
                    alert("Adding checklist item failed: " + err.message);
                }
            }

            miniInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") submitTaskItem();
            });

            const miniBtn = document.createElement("button");
            miniBtn.textContent = langData.innerTodoBtn;
            miniBtn.addEventListener("click", submitTaskItem);

            miniInputRow.appendChild(miniInput);
            miniInputRow.appendChild(miniBtn);
            
            cardBody.appendChild(listWrapper);
            cardBody.appendChild(miniInputRow);

            const deleteCardBtn = document.createElement("button");
            deleteCardBtn.textContent = langData.deleteCard;
            deleteCardBtn.classList.add("delete-card-btn");
            
            deleteCardBtn.addEventListener("click", async () => {
                if(!confirm("Delete this card from the cloud permanent register?")) return;
                try {
                    const { error } = await supabaseClient
                        .from('notes')
                        .delete()
                        .eq('id', card.id);
                    if (error) throw error;

                    dashboardState = dashboardState.filter(item => item.id !== card.id);
                    delete expandedCardsState[card.id];
                    renderDashboard();
                } catch (err) {
                    alert("Cloud delete failed: " + err.message);
                }
            });
            cardBody.appendChild(deleteCardBtn);
        }

        fieldText.appendChild(cardBody);

        if (card.type === "note") {
            notesDisplay.appendChild(fieldText);
        } else {
            checklistsDisplay.appendChild(fieldText);
        }
    }

    localStorage.setItem("my_expanded_cards", JSON.stringify(expandedCardsState));
}

// ==========================================================================
// ZONE 5: KICKSTART APP RUNTIME INITS
// ==========================================================================
translateUI();
applyFontPreferences();
applyPalettePreferences();
// Boot up by syncing immediately with the virtual distributed server rows!
fetchNotesFromCloud();
