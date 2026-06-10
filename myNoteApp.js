// ==========================================================================
// SUPABASE CLOUD CONNECTION INITIALIZATION
// ==========================================================================
// TODO: Replace these placeholder strings with your actual Supabase Project Settings credentials
const SUPABASE_URL = "https://vgelhstxwaroystxtvpi.supabase.co/rest/v1/";

const SUPABASE_ANON_KEY = "sb_publishable_qebp47e0OiGEozzCcXmwpA_6AkJ1aX7";

// This establishes the live connection toolbelt client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
let dashboardState = []; // Instantiated as empty; hydated directly from cloud
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

// --- ASYNCHRONOUS FULL-STACK CARD TRANSACTION OPERATIONS ---

async function executeChecklistCreation() {
    const titleText = checklistTitleInput.value.trim();
    if (titleText === "") return;

    const newListObj = {
        id: "card_" + Date.now(),
        type: "checklist",
        name: titleText,
        items: [] // Sent into the PostgreSQL jsonb column natively
    };

    try {
        // PUSH UPWARD TO CLOUD: Insert row into our Supabase notes table
        const { error } = await supabase
            .from('notes')
            .insert([newListObj]);

        if (error) throw error;

        dashboardState.push(newListObj);
        expandedCardsState[newListObj.id] = true;
        checklistTitleInput.value = "";
        creationOverlay.classList.add("hidden");
        renderDashboard();
    } catch (err) {
        alert("Cloud write error: " + err.message);
    }
}

async function executeNoteCreation() {
    const titleText = noteTitleInput.value.trim();
    if (titleText === "") return;

    const newNoteObj = {
        id: "card_" + Date.now(),
        type: "note",
        name: titleText,
        body_content: "" // column matches postgres schema underscore naming conventions
    };

    try {
        // PUSH UPWARD TO CLOUD: Insert row into our Supabase notes table
        const { error } = await supabase
            .from('notes')
            .insert([newNoteObj]);

        if (error) throw error;

        dashboardState.push(newNoteObj);
        expandedCardsState[newNoteObj.id] = true;
        noteTitleInput.value = "";
        creationOverlay.classList.add("hidden");
        renderDashboard();
    } catch (err) {
        alert("Cloud write error: " + err.message);
    }
}

// Attach listeners to input triggers
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

// NEW: ASYNCHRONOUS INITIAL HYDRATION STREAM FROM POSTGRES SERVER
async function fetchNotesFromCloud() {
    try {
        const { data, error } = await supabase
            .from('notes')
            .select('*');

        if (error) throw error;

        if (data) {
            dashboardState = data;
            renderDashboard();
        }
    } catch (err) {
        console.error("Critical Cloud Fetch Failure: ", err.message);
    }
}

function translateUI() {
    const langData = translations[currentLang];
    document.getElementById("notes-column-title").textContent = langData.notesColumn;
    document.getElementById("lists-column-title").textContent = langData.listsColumn;
    document.getElementById("creation-overlay-title").textContent = langData.overlayTitle;
    document.getElementById("new-note-title").textContent = langData.newNote;
    document.getElementById("new-checklist-title").textContent = langData.newChecklist;
    createNoteBtn.textContent = langData.createNoteBtn;
    createListBtn.textContent = langData.createListBtn;
    noteTitleInput.placeholder = langData.placeholderNote;
    checklistTitleInput.placeholder = langData.placeholderList;
    langSelect.value = currentLang;
}

function applyFontPreferences() {
    document.body.style.fontFamily = activeFont;
    fontSelect.value = activeFont;
}

function applyPalettePreferences() {
    const root = document.documentElement;
    paletteSelect.value = activePalette;
    
    if (activePalette === "default") {
        root.style.setProperty('--bg-color', '#eef2f3');
        root.style.setProperty('--surface-color', '#ffffff');
        root.style.setProperty('--text-color', '#2c3e50');
        root.style.setProperty('--primary-color', '#4caf50');
        root.style.setProperty('--primary-hover', '#439a46');
        root.style.setProperty('--border-color', 'rgba(0,0,0,0.08)');
        root.style.setProperty('--shadow-light', 'rgba(255, 255, 255, 0.9)');
        root.style.setProperty('--shadow-dark', 'rgba(163, 177, 198, 0.4)');
        root.style.setProperty('--input-bg-color', '#ffffff');
        root.style.setProperty('--input-text-color', '#2c3e50');
    } else if (activePalette === "ocean") {
        root.style.setProperty('--bg-color', '#e0f2f1');
        root.style.setProperty('--surface-color', '#004d40');
        root.style.setProperty('--text-color', '#ffffff');
        root.style.setProperty('--primary-color', '#00bfa5');
        root.style.setProperty('--primary-hover', '#00a18b');
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.15)');
        root.style.setProperty('--shadow-light', 'rgba(255, 255, 255, 0.05)');
        root.style.setProperty('--shadow-dark', 'rgba(0, 0, 0, 0.3)');
        root.style.setProperty('--input-bg-color', '#ffffff');
        root.style.setProperty('--input-text-color', '#004d40');
        root.style.setProperty('--overlay-bg', 'rgba(0, 51, 44, 0.7)');
        root.style.setProperty('--card-bg', '#004d40');
        root.style.setProperty('--card-text', '#ffffff');
    } else if (activePalette === "sunset") {
        root.style.setProperty('--bg-color', '#fdf6ec');
        root.style.setProperty('--surface-color', '#3e2723');
        root.style.setProperty('--text-color', '#fdf6ec');
        root.style.setProperty('--primary-color', '#e67e22');
        root.style.setProperty('--primary-hover', '#d35400');
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.12)');
        root.style.setProperty('--shadow-light', 'rgba(255, 255, 255, 0.05)');
        root.style.setProperty('--shadow-dark', 'rgba(0, 0, 0, 0.4)');
        root.style.setProperty('--input-bg-color', '#ffffff');
        root.style.setProperty('--input-text-color', '#3e2723');
        root.style.setProperty('--overlay-bg', 'rgba(38, 23, 21, 0.75)');
        root.style.setProperty('--card-bg', '#3e2723');
        root.style.setProperty('--card-text', '#fdf6ec');
    } else if (activePalette === "cyberpunk") {
        root.style.setProperty('--bg-color', '#0c002b');
        root.style.setProperty('--surface-color', '#170055');
        root.style.setProperty('--text-color', '#00ffff');
        root.style.setProperty('--primary-color', '#ff007f');
        root.style.setProperty('--primary-hover', '#d8006b');
        root.style.setProperty('--border-color', 'rgba(0, 255, 255, 0.2)');
        root.style.setProperty('--shadow-light', 'rgba(23, 0, 85, 0.5)');
        root.style.setProperty('--shadow-dark', 'rgba(0, 0, 0, 0.7)');
        root.style.setProperty('--input-bg-color', '#0c002b');
        root.style.setProperty('--input-text-color', '#00ffff');
        root.style.setProperty('--overlay-bg', 'rgba(12, 0, 43, 0.7)');
        root.style.setProperty('--card-bg', '#170055');
        root.style.setProperty('--card-text', '#00ffff');
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
        notesDisplay.appendChild(emptyNotice);
    }

    if (checklistCount === 0) {
        const emptyNotice = document.createElement("p");
        emptyNotice.textContent = langData.emptyLists;
        emptyNotice.style.color = "var(--text-color)";
        emptyNotice.style.opacity = "0.6";
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
            
            // FULL-STACK MUTATION: Update existing note data rows inside the cloud
            saveBtn.addEventListener("click", async () => {
                card.body_content = newText.value;
                saveBtn.style.backgroundColor = "var(--primary-hover)";
                
                try {
                    const { error } = await supabase
                        .from('notes')
                        .update({ body_content: card.body_content })
                        .eq('id', card.id);

                    if (error) throw error;
                    setTimeout(() => { saveBtn.style.backgroundColor = "var(--primary-color)"; }, 500);
                } catch (err) {
                    alert("Cloud update failed: " + err.message);
                }
            });

            const deleteCardBtn = document.createElement("button");
            deleteCardBtn.textContent = langData.deleteCard;
            deleteCardBtn.classList.add("delete-card-btn");
            
            // FULL-STACK MUTATION: Delete note data rows from the cloud entirely
            deleteCardBtn.addEventListener("click", async () => {
                if(!confirm("Are you sure?")) return;
                try {
                    const { error } = await supabase
                        .from('notes')
                        .delete()
                        .eq('id', card.id);

                    if (error) throw error;

                    dashboardState = dashboardState.filter(item => item.id !== card.id);
                    delete expandedCardsState[card.id];
                    renderDashboard();
                } catch (err) {
                    alert("Cloud target deletion failed: " + err.message);
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

                // FULL-STACK MUTATION: Sync individual checkbox checking triggers to cloud JSON column arrays
                cb.addEventListener("change", async () => {
                    task.completed = cb.checked;
                    try {
                        const { error } = await supabase
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

            // FULL-STACK MUTATION: Push secondary items directly into deep nesting cloud targets
            async function submitTaskItem() {
                let taskText = miniInput.value.trim();
                if (taskText === "") return;
                
                card.items.push({ text: taskText, completed: false });
                try {
                    const { error } = await supabase
                        .from('notes')
                        .update({ items: card.items })
                        .eq('id', card.id);
                    if (error) throw error;
                    renderDashboard();
                } catch (err) {
                    alert("Adding task failed: " + err.message);
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
                if(!confirm("Are you sure?")) return;
                try {
                    const { error } = await supabase
                        .from('notes')
                        .delete()
                        .eq('id', card.id);
                    if (error) throw error;

                    dashboardState = dashboardState.filter(item => item.id !== card.id);
                    delete expandedCardsState[card.id];
                    renderDashboard();
                } catch (err) {
                    alert("Cloud target deletion failed: " + err.message);
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
// Boot up by pulling fresh cloud rows over the network pipeline
fetchNotesFromCloud();
