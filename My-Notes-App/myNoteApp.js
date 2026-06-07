// ==========================================
// ZONE 0: TRANSLATION DICTIONARY (i18n)
// ==========================================
const translations = {
    en: {
        appTitle: "My Notes App",
        settingsTitle: "App Settings",
        fontStyle: "Font Style",
        accentColor: "Theme Palette",
        language: "Language / Idioma",
        todoTitle: "New Checklist",
        todoPlaceholder: "Checklist Title...",
        todoBtn: "Create List",
        noteTitle: "New Note",
        notePlaceholder: "Note Title...",
        noteBtn: "Create Note",
        alertTask: "Please enter a checklist title!",
        alertNote: "Please enter a note title!",
        innerTodoPlaceholder: "Add item...",
        innerTodoBtn: "+",
        deleteCard: "X",
        saveCard: "Save",
        notesColumn: "Notes",
        listsColumn: "Checklists"
    },
    es: {
        appTitle: "Mi Aplicación de Notas",
        settingsTitle: "Configuración de la App",
        fontStyle: "Tipo de Letra",
        accentColor: "Paleta de Colores",
        language: "Language / Idioma",
        todoTitle: "Nueva Lista",
        todoPlaceholder: "Título de la lista...",
        todoBtn: "Crear Lista",
        noteTitle: "Nueva Nota",
        notePlaceholder: "Título de la nota...",
        noteBtn: "Crear Nota",
        alertTask: "¡Por favor, ingresa un título para la lista!",
        alertNote: "¡Por favor, ingresa un título para la nota!",
        innerTodoPlaceholder: "Nuevo ítem...",
        innerTodoBtn: "+",
        deleteCard: "X",
        saveCard: "Guardar",
        notesColumn: "Notas",
        listsColumn: "Listas de Tareas"
    }
};

let currentLang = localStorage.getItem("app_lang") || "en";


let expandedCardsState = JSON.parse(localStorage.getItem("my_expanded_cards")) || {};


// ==========================================
// ZONE 1: THE CHECKLIST GENERATOR MOTOR
// ==========================================
const checklistTitleInput = document.getElementById("checklist-title-input");
const createListBtn = document.getElementById("create-list-btn");

function addNewChecklist() {
    let titleText = checklistTitleInput.value.trim();
    if (titleText === "") {
        alert(translations[currentLang].alertTask);
        return;
    }
    const newChecklistObject = {
        id: Date.now(),
        type: "checklist",
        name: titleText,
        items: []
    };
    dashboardState.push(newChecklistObject);
    expandedCardsState[newChecklistObject.id] = true; 
    checklistTitleInput.value = "";
    renderDashboard();
}

createListBtn.addEventListener("click", addNewChecklist);

// Add Enter Key event listener for Checklist Title Input
checklistTitleInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") addNewChecklist();
});


// ==========================================
// ZONE 2: THE NOTES APPLICATION 
// ==========================================
const noteTitleInput = document.getElementById("note-title-input");
const createNoteBtn = document.getElementById("create-note-btn");

function addNewText() {
    let titleText = noteTitleInput.value.trim();
    if (titleText === "") {
        alert(translations[currentLang].alertNote);
        return;
    }
    const newTextObject = {
        id: Date.now(),
        type: "note",
        name: titleText,
        bodyContent: ""
    };
    dashboardState.push(newTextObject);
    expandedCardsState[newTextObject.id] = true; 
    noteTitleInput.value = "";
    renderDashboard();
}

createNoteBtn.addEventListener("click", addNewText);

// Add Enter Key event listener for Note Title Input
noteTitleInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") addNewText();
});


// ==========================================
// ZONE 3: SETTINGS & CUSTOMIZATION LAYER
// ==========================================
const btnSettings = document.querySelector(".btn-settings");
const settingsPanel = document.getElementById("settings-panel");
const fontSelect = document.getElementById("font-select");
const paletteSelect = document.getElementById("palette-select");
const langSelect = document.getElementById("lang-select");

const notesDisplay = document.getElementById("notes-display");
const checklistsDisplay = document.getElementById("checklists-display");

let dashboardState = JSON.parse(localStorage.getItem("my_dashboard_data")) || [];

const colorPalettes = {
    default: { bg: "#f4f7f6", card: "#ffffff", text: "#333333", input: "#333333", border: "#e0e0e0", primary: "#4caf50", hover: "#45a049" },
    ocean: { bg: "#e0f2fe", card: "#ffffff", text: "#0f172a", input: "#0f172a", border: "#bae6fd", primary: "#0284c7", hover: "#0369a1" },
    sunset: { bg: "#fdf2f8", card: "#ffffff", text: "#4c0519", input: "#4c0519", border: "#fbcfe8", primary: "#db2777", hover: "#be185d" },
    cyberpunk: { bg: "#0f172a", card: "#1e293b", text: "#f8fafc", input: "#f1f5f9", border: "#334155", primary: "#f43f5e", hover: "#e11d48" }
};

btnSettings.addEventListener("click", function() {
    settingsPanel.classList.toggle("hidden");
});

function applyPalette(paletteName) {
    const theme = colorPalettes[paletteName] || colorPalettes.default;
    document.documentElement.style.setProperty('--bg-color', theme.bg);
    document.documentElement.style.setProperty('--card-bg', theme.card);
    document.documentElement.style.setProperty('--text-color', theme.text);
    document.documentElement.style.setProperty('--border-color', theme.border);
    document.documentElement.style.setProperty('--input-text-color', theme.input);
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--primary-hover', theme.hover);
    localStorage.setItem("theme_palette", paletteName);
}

paletteSelect.addEventListener("change", function() {
    applyPalette(paletteSelect.value);
});

function translateUI() {
    const langData = translations[currentLang];
    document.querySelector(".app-title").innerHTML = `<i class="fa-solid fa-note-sticky"></i> ${langApp = langData.appTitle}`;
    document.querySelector("#settings-panel h2").textContent = langData.settingsTitle;
    document.querySelector("label[for='font-select']").textContent = langData.fontStyle;
    document.querySelector("label[for='palette-select']").textContent = langData.accentColor;
    document.querySelector("label[for='lang-select']").textContent = langData.language;

    document.querySelector(".app-container h2").textContent = langData.todoTitle;
    document.getElementById("checklist-title-input").placeholder = langData.todoPlaceholder;
    document.getElementById("create-list-btn").textContent = langData.todoBtn;

    document.querySelector(".note-creator h2").textContent = langData.noteTitle;
    document.getElementById("note-title-input").placeholder = langData.notePlaceholder;
    document.getElementById("create-note-btn").textContent = langData.noteBtn;

    document.getElementById("notes-column-title").textContent = langData.notesColumn;
    document.getElementById("lists-column-title").textContent = langData.listsColumn;
}

langSelect.addEventListener("change", function() {
    currentLang = langSelect.value;
    localStorage.setItem("app_lang", currentLang);
    translateUI();
    renderDashboard(); 
});

fontSelect.addEventListener("change", function() {
    const selectedFont = fontSelect.value;
    document.body.style.fontFamily = selectedFont;
    localStorage.setItem("theme_font", selectedFont);
});

function loadUserSettings() {
    const savedLang = localStorage.getItem("app_lang");
    if (savedLang) {
        currentLang = savedLang;
        langSelect.value = savedLang;
    }
    translateUI(); 

    const savedPalette = localStorage.getItem("theme_palette") || "default";
    paletteSelect.value = savedPalette;
    applyPalette(savedPalette);

    const savedFont = localStorage.getItem("theme_font");
    if (savedFont) {
        fontSelect.value = savedFont;
        document.body.style.fontFamily = savedFont;
    }
}


// ==========================================
// ZONE 4: MASTER UNIFIED RENDER ENGINE
// ==========================================
function renderDashboard() {
  
    notesDisplay.innerHTML = "";
    checklistsDisplay.innerHTML = "";
    const langData = translations[currentLang];

    for (let card of dashboardState) {
        const fieldText = document.createElement("fieldset");
        fieldText.classList.add("fade-in-item");

        // Header section acting as our toggle button
        const fieldName = document.createElement("legend");
        fieldName.classList.add("accordion-header");
        fieldName.innerHTML = `${card.name} <i class="fa-solid ${expandedCardsState[card.id] ? 'fa-chevron-up' : 'fa-chevron-down'}" style="margin-left: 8px; font-size: 0.75rem; opacity: 0.7;"></i>`;
        
        // Expand/Collapse click listener
        fieldName.addEventListener("click", function() {
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
            newText.value = card.bodyContent || "";
            cardBody.appendChild(newText);

            
            const actionsRow = document.createElement("div");
            actionsRow.classList.add("card-actions-row");

            const saveBtn = document.createElement("button");
            saveBtn.textContent = langData.saveCard;
            saveBtn.classList.add("save-card-btn");
            saveBtn.addEventListener("click", function() {
                card.bodyContent = newText.value;
                localStorage.setItem("my_dashboard_data", JSON.stringify(dashboardState));
                // Minor interaction polish: briefly alert user or minimize
                saveBtn.style.backgroundColor = "var(--primary-hover)";
                setTimeout(() => { saveBtn.style.backgroundColor = "var(--primary-color)"; }, 500);
            });

            const deleteCardBtn = document.createElement("button");
            deleteCardBtn.textContent = langData.deleteCard;
            deleteCardBtn.classList.add("delete-card-btn");
            deleteCardBtn.addEventListener("click", function() {
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

                cb.addEventListener("change", function() {
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

            miniInput.addEventListener("keydown", function(e) {
                if (e.key === "Enter") submitTaskItem();
            });

            const miniBtn = document.createElement("button");
            miniBtn.textContent = langData.innerTodoBtn;
            miniBtn.addEventListener("click", submitTaskItem);

            miniInputRow.appendChild(miniInput);
            miniInputRow.appendChild(miniBtn);
            
            cardBody.appendChild(listWrapper);
            cardBody.appendChild(miniInputRow);

            // Footer item deletion button for checklist cards
            const deleteCardBtn = document.createElement("button");
            deleteCardBtn.textContent = langData.deleteCard;
            deleteCardBtn.classList.add("delete-card-btn");
            deleteCardBtn.addEventListener("click", function() {
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


// ==========================================
// INITIALIZATION
// ==========================================
loadUserSettings(); 
renderDashboard();