// ==========================
// LANGUAGE SYSTEM
// ==========================

const TRANSLATIONS = {
    pt: {
        title: '⚔️ ANIME VANGUARDS',
        subtitle: 'Calculadora de Dano'
    },
    en: {
        title: '⚔️ ANIME VANGUARDS',
        subtitle: 'Damage Calculator'
    }
};

function detectLanguage() {
    const saved = localStorage.getItem('language');
    if (saved) return saved;

    const browserLang = navigator.language.split('-')[0];
    return (browserLang === 'pt' || browserLang === 'en') ? browserLang : 'pt';
}

let currentLanguage = detectLanguage();

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updatePageLanguage();
}

function updatePageLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (TRANSLATIONS[currentLanguage][key]) {
            el.textContent = TRANSLATIONS[currentLanguage][key];
        }
    });
}

// CONSTANTS
const LEVEL_EXPONENT = 1.0235310218999;
const EVO_MULTIPLIER = 1.4;

// UNIT TRAITS - Solar, Ethereal, Monarch
const UNIT_TRAITS = {
    'none': 1.0,
    'solar': 1.1,
    'ethereal': 1.2, 
    'monarch': 4.0
};

// MEMORY TRAITS - Apenas as traits reais do jogo
const MEMORY_TRAITS = {
    'none': 1.0,
    'solar': 1.1,
    'jack': 1.2,
    'divinity': 1.5
};

// CALCULATE LEVEL MULTIPLIER: 1.0235310218999^(Level - 1)
function calculateLevelMultiplier(level) {
    if (level <= 1) return 1.0;
    return Math.pow(LEVEL_EXPONENT, level - 1);
}

// CUSTOM DROPDOWN INITIALIZATION
function initCustomDropdowns() {
    const dropdowns = document.querySelectorAll('.custom-dropdown');
    
    dropdowns.forEach(dropdown => {
        const display = dropdown.querySelector('.dropdown-display');
        const menu = dropdown.querySelector('.dropdown-menu');
        const items = dropdown.querySelectorAll('.dropdown-item');
        const hiddenInput = dropdown.querySelector('input[type="hidden"]');
        
        // Toggle menu on display click
        display.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other menus
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m !== menu) m.classList.remove('open');
            });
            document.querySelectorAll('.dropdown-display').forEach(d => {
                if (d !== display) d.classList.remove('active');
            });
            menu.classList.toggle('open');
            display.classList.toggle('active');
        });
        
        // Handle item selection
        items.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                const name = item.dataset.name;
                const image = item.dataset.image;
                
                // Update hidden input
                hiddenInput.value = value;
                
                // Update display
                const img = display.querySelector('img');
                const text = display.querySelector('span');

                if (img && image) {
                    img.src = image;
                }

                if (text && name) {
                    text.textContent = name;
                }
                
                // Remove active states
                items.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                
                // Close menu
                menu.classList.remove('open');
                display.classList.remove('active');
                
                // Trigger calculation
                hiddenInput.dispatchEvent(new Event('change'));

                if (hiddenInput.id === 'languageSelect') {
                    setLanguage(value);
                }
            });
        });
    });
    
    // Close menus when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
        document.querySelectorAll('.dropdown-display').forEach(d => d.classList.remove('active'));
    });
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', function() {
    setLanguage(currentLanguage);

const languageInput = document.getElementById('languageSelect');
if (languageInput) {
    languageInput.value = currentLanguage;
    languageInput.addEventListener('change', function () {
        setLanguage(this.value);
    });
}

updatePageLanguage();
    // Initialize custom dropdowns
    initCustomDropdowns();
    // Unit inputs
    document.getElementById('unitLevel').addEventListener('input', function() {
        document.getElementById('unitLevelDisplay').textContent = 'Lvl ' + this.value;
        calculateUnitDamage();
        calculateMemoryDamage();
    });
    document.getElementById('unitBase').addEventListener('input', function() {
        calculateUnitDamage();
        calculateMemoryDamage();
    });
    document.getElementById('unitStatus').addEventListener('input', function() {
        calculateUnitDamage();
        calculateMemoryDamage();
    });
    document.getElementById('unitTrait').addEventListener('change', function() {
        calculateUnitDamage();
        calculateMemoryDamage();
    });
    
    // Memory inputs
    document.getElementById('memoryLevel').addEventListener('input', function() {
        document.getElementById('memoryLevelDisplay').textContent = 'Lvl ' + this.value;
        calculateMemoryDamage();
    });
    document.getElementById('memoryBase').addEventListener('input', calculateMemoryDamage);
    document.getElementById('memoryStatus').addEventListener('input', calculateMemoryDamage);
    document.getElementById('memoryTrait').addEventListener('change', calculateMemoryDamage);
    
    // EVO toggle
    document.getElementById('evoYes').addEventListener('click', function() {
        document.getElementById('evoNo').classList.remove('active');
        document.getElementById('evoYes').classList.add('active');
        calculateMemoryDamage();
    });
    
    document.getElementById('evoNo').addEventListener('click', function() {
        document.getElementById('evoYes').classList.remove('active');
        document.getElementById('evoNo').classList.add('active');
        calculateMemoryDamage();
    });
    
    // Initial calculation
    calculateUnitDamage();
    calculateMemoryDamage();
});

// STATUS MULTIPLIER: 1 + (status / 100)
function calculateStatusMultiplier(status) {
    return 1 + (status / 100);
}

// GET UNIT TRAIT MULTIPLIER
function getUnitTraitMultiplier(trait) {
    const mult = UNIT_TRAITS[trait] || 1.0;
    return isNaN(mult) || mult === undefined || mult === null ? 1.0 : mult;
}

// GET MEMORY TRAIT MULTIPLIER - Com proteção completa
function getMemoryTraitMultiplier(trait) {
    const mult = MEMORY_TRAITS[trait] || 1.0;
    // Fallback obrigatório: se for inválido, retorna 1.0
    if (isNaN(mult) || mult === undefined || mult === null || typeof mult !== 'number') {
        return 1.0;
    }
    return mult;
}

// CALCULATE UNIT DAMAGE
function calculateUnitDamage() {
    const base = parseFloat(document.getElementById('unitBase').value) || 0;
    const level = parseInt(document.getElementById('unitLevel').value) || 1;
    const status = parseFloat(document.getElementById('unitStatus').value) || 0;
    const trait = document.getElementById('unitTrait').value;
    
    if (base <= 0) {
        updateUnitDisplay(0, 1.0, 1.0, 1.0);
        return 0;
    }
    
    const levelMult = calculateLevelMultiplier(level);
    const statusMult = calculateStatusMultiplier(status);
    const traitMult = getUnitTraitMultiplier(trait);
    
    // Unit Damage = Base × (1.0235310218999^(Level-1)) × (1 + Status/100) × TraitMult
    const unitDamage = base * levelMult * statusMult * traitMult;
    const finalDamage = Math.round(unitDamage);
    
    updateUnitDisplay(finalDamage, levelMult, statusMult, traitMult);
    calculateTotalDamage();
    return finalDamage;
}

// UPDATE UNIT DISPLAY
function updateUnitDisplay(damage, levelMult, statusMult, traitMult) {
    document.getElementById('unitDamage').textContent = damage.toLocaleString('pt-BR');
    document.getElementById('unitLevelMult').textContent = levelMult.toFixed(3) + '×';
    document.getElementById('unitStatusMult').textContent = statusMult.toFixed(3) + '×';
    document.getElementById('unitTraitMult').textContent = traitMult.toFixed(3) + '×';
}

// CALCULATE MEMORY DAMAGE
function calculateMemoryDamage() {
    const memoryBase = parseFloat(document.getElementById('memoryBase').value) || 0;
    const memoryLevel = parseInt(document.getElementById('memoryLevel').value) || 1;
    const memoryStatus = parseFloat(document.getElementById('memoryStatus').value) || 0;
    const memoryTrait = document.getElementById('memoryTrait').value || 'none';
    const unitStatus = parseFloat(document.getElementById('unitStatus').value) || 0;
    const unitTrait = document.getElementById('unitTrait').value || 'none';
    const isEvo = document.getElementById('evoYes').classList.contains('active');
    
    if (memoryBase <= 0) {
        updateMemoryDisplay(0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0);
        return 0;
    }
    
    // STAGE 1: (BaseMemoria × LevelMemoria × StatusMemoria × TraitMemoria × EVO)
    const memoryLevelMult = calculateLevelMultiplier(memoryLevel);
    const memoryStatusMult = calculateStatusMultiplier(memoryStatus);
    const memoryTraitMult = getMemoryTraitMultiplier(memoryTrait);
    const evoMult = isEvo ? EVO_MULTIPLIER : 1.0;
    
    // Validação obrigatória: nunca deixar multiplicador ser NaN
    if (isNaN(memoryTraitMult) || memoryTraitMult <= 0) {
        console.warn('Trait inválido detectado, usando 1.0');
        var memoryStats = memoryBase * memoryLevelMult * memoryStatusMult * 1.0 * evoMult;
    } else {
        var memoryStats = memoryBase * memoryLevelMult * memoryStatusMult * memoryTraitMult * evoMult;
    }
    
    // STAGE 2: MemoryStats × UnitLevelMult × UnitStatus × UnitTrait
    const unitLevel = parseInt(document.getElementById('unitLevel').value) || 1;
    const unitLevelMult = calculateLevelMultiplier(unitLevel);
    const unitStatusMult = calculateStatusMultiplier(unitStatus);
    const unitTraitMult = getUnitTraitMultiplier(unitTrait);
    
    let memoryFinal = memoryStats * unitLevelMult * unitStatusMult * unitTraitMult;
    const finalDamage = Math.round(memoryFinal);
    
    // Validação final: nunca retornar 0 se base foi preenchido
    if (finalDamage <= 0 && memoryBase > 0) {
        console.warn('Cálculo resultou em 0 mas base é válido, retornando resultado correto');
        return 0; // Neste caso está realmente correto retornar valores baixos
    }
    
    updateMemoryDisplay(finalDamage, memoryLevelMult, memoryStatusMult, memoryTraitMult, unitLevelMult, unitStatusMult, unitTraitMult, evoMult);
    calculateTotalDamage();
    return finalDamage;
}

// UPDATE MEMORY DISPLAY
function updateMemoryDisplay(damage, memoryLevelMult, memoryStatusMult, memoryTraitMult, unitLevelMult, unitStatusMult, unitTraitMult, evoMult) {
    document.getElementById('memoryDamage').textContent = damage.toLocaleString('pt-BR');
    document.getElementById('memoryLevelMult').textContent = memoryLevelMult.toFixed(3) + '×';
    document.getElementById('memoryStatusMult').textContent = memoryStatusMult.toFixed(3) + '×';
    document.getElementById('memoryTraitMult').textContent = memoryTraitMult.toFixed(3) + '×';
    document.getElementById('memoryEvoMult').textContent = evoMult.toFixed(1) + '×';
    document.getElementById('memoryRandomLevelMult').textContent = unitLevelMult.toFixed(3) + '×';
    document.getElementById('unitStatusMultMemory').textContent = unitStatusMult.toFixed(3) + '×';
    document.getElementById('unitTraitMultMemory').textContent = unitTraitMult.toFixed(3) + '×';
}

// CALCULATE TOTAL DAMAGE
function calculateTotalDamage() {
    const unitDamage = parseInt(document.getElementById('unitDamage').textContent.replace(/\D/g, '')) || 0;
    const memoryDamage = parseInt(document.getElementById('memoryDamage').textContent.replace(/\D/g, '')) || 0;
    
    const totalDamage = unitDamage + memoryDamage;
    
    document.getElementById('totalUnitDamageBreakdown').textContent = unitDamage.toLocaleString('pt-BR');
    document.getElementById('totalMemoryDamageBreakdown').textContent = memoryDamage.toLocaleString('pt-BR');
    document.getElementById('totalDamage').textContent = totalDamage.toLocaleString('pt-BR');
}
