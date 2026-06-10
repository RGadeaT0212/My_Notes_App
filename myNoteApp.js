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
let dashboardState = JSON.parse(localStorage.getItem("my_dashboard_data")) || [];
let expandedCardsState = JSON.parse(localStorage.getItem("my_expanded_cards")) || {};
let currentLang = localStorage.getItem("my_app_lang") || "en";
let activePalette = localStorage.getItem("my_app_palette") || "default";
let activeFont = localStorage.getItem("my_app_font") || "Segoe UI, sans-serif";

// ==========================================================================
// ZONE 2: ELEMENT DOM CACHED REFERENCES INITIALIZATION
// ==========================================================================
const notesDisplay = document.getElementById("notes-display");
const checklistsDisplay = document.getElementById("checklists-display");

// Creation overlay selectors
const creationOverlay = document.getElementById("creation-overlay");
const floatingAddBtn = document.getElementById("floating-add-btn");
const closeOverlayBtn = document.getElementById("close-overlay-btn");

// Inputs selectors
const noteTitleInput = document.getElementById("note-title-input");
const createNoteBtn = document.getElementById("create-note-btn");
const checklistTitleInput = document.getElementById("checklist-title-input");
const createListBtn = document.getElementById("create-list-btn");

// Configuration menu panels selectors
const settingsToggleBtn = document.getElementById("settings-toggle-btn");
const settingsPanel = document.getElementById("settings-panel");
const fontSelect = document.getElementById("font-select");
const paletteSelect = document.getElementById("palette-select");
const langSelect = document.getElementById("lang-select");

// ==========================================================================
// ZONE 3: DYNAMIC APPLICATION EVENT EVENTLISTENERS LOGIC
// ==========================================================================

// Overlay workflow structural handlers
floatingAddBtn.addEventListener("click", () => {
    creationOverlay.classList.remove("hidden");
    // Auto-focuses the first input box for a fluid native app feel
    setTimeout(() => checklistTitleInput.focus(), 300); 
});

closeOverlayBtn.addEventListener("click", () => {
    creationOverlay.classList.add("hidden");
});

settingsToggleBtn.addEventListener("click", () => {
    settingsPanel.classList.toggle("hidden");
});

// --- REUSABLE CORE CARD CREATION CORE PROCESSING ENGINE FUNCTIONS ---
function executeChecklistCreation() {
    const titleText = checklistTitleInput.value.trim();
    if (titleText === "") return;

    const newListObj = {
        id: "card_" + Date.now(),
        type: "checklist",
        name: titleText,
        items: []
    };

    dashboardState.push(newListObj);
    expandedCardsState[newListObj.id] = true;
    checklistTitleInput.value = "";

    creationOverlay.classList.add("hidden");
    renderDashboard();
}

function executeNoteCreation() {
    const titleText = noteTitleInput.value.trim();
    if (titleText === "") return;

    const newNoteObj = {
        id: "card_" + Date.now(),
        type: "note",
        name: titleText,
        bodyContent: ""
    };

    dashboardState.push(newNoteObj);
    expandedCardsState[newNoteObj.id] = true;
    noteTitleInput.value = "";
    
    creationOverlay.classList.add("hidden");
    renderDashboard();
}

// --- ATTACHING THE TRIGGERS (BUTTON CLICK + KEYDOWN ENTER KEY ENGINE) ---
createListBtn.addEventListener("click", executeChecklistCreation);
checklistTitleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") executeChecklistCreation();
});

createNoteBtn.addEventListener("click", executeNoteCreation);
noteTitleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") executeNoteCreation();
});

// App configuration preferences handlers
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
        root.style.setProperty('--bg-color', '#f4f7f6');
        root.style.setProperty('--surface-color', '#ffffff');
        root.style.setProperty('--text-color', '#333333');
        root.style.setProperty('--primary-color', '#4caf50');
        root.style.setProperty('--primary-hover', '#45a049');
        root.style.setProperty('--border-color', '#cccccc');
    } else if (activePalette === "ocean") {
        root.style.setProperty('--bg-color', '#e0f2f1');
        root.style.setProperty('--surface-color', '#004d40');
        root.style.setProperty('--text-color', '#383232');
        root.style.setProperty('--primary-color', '#00bfa5');
        root.style.setProperty('--primary-hover', '#00b0ff');
        root.style.setProperty('--border-color', '#00796b');
    } else if (activePalette === "sunset") {
        root.style.setProperty('--bg-color', '#fff3e0');
        root.style.setProperty('--surface-color', '#3e2723');
        root.style.setProperty('--text-color', '#4b4742');
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

    // QUANTIFY CARDS PATTERNS
    let noteCount = 0;
    let checklistCount = 0;
    for (let card of dashboardState) {
        if (card.type === "note") noteCount++;
        if (card.type === "checklist") checklistCount++;
    }

    // INTERACTIVE EMPTY STATE SAFEGUARDS
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

    // MAIN RENDER STREAMING LOOP
    for (let card of dashboardState) {
        const fieldText = document.createElement("fieldset");
        fieldText.classList.add("fade-in-item");

        const fieldName = document.createElement("legend");
        fieldName.classList.add("accordion-header");
        
        // CHECKLIST DYNAMIC COMPLETION LOGIC
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

        // CONDITIONAL GENERATOR STRUCT ROUTING
        if (card.type === "note") {
            const newText = document.createElement("textarea");
            newText.value = card.bodyContent || "";
            cardBody.appendChild(newText);

            const actionsRow = document.createElement("div");
            actionsRow.classList.add("card-actions-row");

            const saveBtn = document.createElement("button");
            saveBtn.textContent = langData.saveCard;
            saveBtn.classList.add("save-card-btn");
            saveBtn.addEventListener("click", () => {
                card.bodyContent = newText.value;
                localStorage.setItem("my_dashboard_data", JSON.stringify(dashboardState));
                saveBtn.style.backgroundColor = "var(--primary-hover)";
                setTimeout(() => { saveBtn.style.backgroundColor = "var(--primary-color)"; }, 500);
            });

            const deleteCardBtn = document.createElement("button");
            deleteCardBtn.textContent = langData.deleteCard;
            deleteCardBtn.classList.add("delete-card-btn");
            deleteCardBtn.addEventListener("click", () => {
                dashboardState = dashboardState.filter(item => item.id !== card.id);
                delete expandedCardsState[card.id];
                renderDashboard();
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

                cb.addEventListener("change", () => {
                    task.completed = cb.checked;
                    renderDashboard();
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

            function submitTaskItem() {
                let taskText = miniInput.value.trim();
                if (taskText !== "") {
                    card.items.push({ text: taskText, completed: false });
                    renderDashboard();
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
            deleteCardBtn.addEventListener("click", () => {
                dashboardState = dashboardState.filter(item => item.id !== card.id);
                delete expandedCardsState[card.id];
                renderDashboard();
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

    localStorage.setItem("my_dashboard_data", JSON.stringify(dashboardState));
    localStorage.setItem("my_expanded_cards", JSON.stringify(expandedCardsState));
}

// ==========================================================================
// ZONE 5: KICKSTART APP RUNTIME INITS
// ==========================================================================
translateUI();
applyFontPreferences();
applyPalettePreferences();
renderDashboard();
