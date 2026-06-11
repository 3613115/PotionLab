const SAVE_KEY = "potionLabSaveV1";

const ingredients = [
  {
    id: "moonWater",
    name: "Moon Water",
    icon: "🌙",
    description: "Cool water gathered under silver moonlight.",
    upgradeId: "moonWell",
  },
  {
    id: "starHerb",
    name: "Star Herb",
    icon: "🌿",
    description: "A fragrant sprig dotted with tiny constellations.",
    upgradeId: "herbalShelf",
  },
  {
    id: "crystalDust",
    name: "Crystal Dust",
    icon: "💎",
    description: "Glittering powder that hums with quiet magic.",
    upgradeId: "crystalGrinder",
  },
];

const recipes = [
  {
    id: "healingPotion",
    name: "Healing Potion",
    icon: "💖",
    requirements: { moonWater: 1, starHerb: 1 },
    coins: 10,
    experience: 8,
    startsDiscovered: true,
  },
  {
    id: "manaPotion",
    name: "Mana Potion",
    icon: "🔮",
    requirements: { moonWater: 1, crystalDust: 1 },
    coins: 12,
    experience: 9,
    startsDiscovered: true,
  },
  {
    id: "sparkPotion",
    name: "Spark Potion",
    icon: "⚡",
    requirements: { starHerb: 1, crystalDust: 1 },
    coins: 15,
    experience: 11,
    startsDiscovered: false,
  },
  {
    id: "mysteryPotion",
    name: "Mystery Potion",
    icon: "🌌",
    requirements: { moonWater: 1, starHerb: 1, crystalDust: 1 },
    coins: 28,
    experience: 18,
    startsDiscovered: false,
  },
];

const upgradeDefinitions = {
  betterCauldron: {
    name: "Better Cauldron",
    description: "Adds a permanent bonus to potion coin value.",
    baseCost: 35,
    costMultiplier: 1.65,
  },
  herbalShelf: {
    name: "Herbal Shelf",
    description: "Collect more Star Herb with every click.",
    baseCost: 28,
    costMultiplier: 1.55,
  },
  moonWell: {
    name: "Moon Well",
    description: "Collect more Moon Water with every click.",
    baseCost: 28,
    costMultiplier: 1.55,
  },
  crystalGrinder: {
    name: "Crystal Grinder",
    description: "Collect more Crystal Dust with every click.",
    baseCost: 32,
    costMultiplier: 1.58,
  },
};

const defaultState = {
  ingredients: { moonWater: 0, starHerb: 0, crystalDust: 0 },
  coins: 0,
  experience: 0,
  labLevel: 1,
  totalBrewed: 0,
  muted: false,
  upgrades: {
    betterCauldron: { level: 0 },
    herbalShelf: { level: 0 },
    moonWell: { level: 0 },
    crystalGrinder: { level: 0 },
  },
  discoveredRecipes: recipes.reduce((found, recipe) => {
    found[recipe.id] = recipe.startsDiscovered;
    return found;
  }, {}),
};

let state = loadState();
let audioContext;

const elements = {
  ingredientsList: document.getElementById("ingredientsList"),
  recipeSelect: document.getElementById("recipeSelect"),
  brewButton: document.getElementById("brewButton"),
  brewMessage: document.getElementById("brewMessage"),
  cauldron: document.getElementById("cauldron"),
  recipeBook: document.getElementById("recipeBook"),
  upgradesList: document.getElementById("upgradesList"),
  toastStack: document.getElementById("toastStack"),
  muteButton: document.getElementById("muteButton"),
  resetButton: document.getElementById("resetButton"),
  coinsValue: document.getElementById("coinsValue"),
  experienceValue: document.getElementById("experienceValue"),
  experienceNeededValue: document.getElementById("experienceNeededValue"),
  labLevelValue: document.getElementById("labLevelValue"),
  totalBrewedValue: document.getElementById("totalBrewedValue"),
  recipesDiscoveredValue: document.getElementById("recipesDiscoveredValue"),
  levelProgressText: document.getElementById("levelProgressText"),
  levelProgressBar: document.getElementById("levelProgressBar"),
};

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved) {
      return cloneDefaultState();
    }

    return {
      ...cloneDefaultState(),
      ...saved,
      ingredients: { ...cloneDefaultState().ingredients, ...(saved.ingredients || {}) },
      upgrades: { ...cloneDefaultState().upgrades, ...(saved.upgrades || {}) },
      discoveredRecipes: { ...cloneDefaultState().discoveredRecipes, ...(saved.discoveredRecipes || {}) },
    };
  } catch (error) {
    console.warn("Potion Lab save could not be loaded.", error);
    return cloneDefaultState();
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function formatNumber(value) {
  return Math.floor(value).toLocaleString();
}

function getExperienceNeeded() {
  return 25 + (state.labLevel - 1) * 18;
}

function getUpgradeCost(upgradeId) {
  const upgrade = upgradeDefinitions[upgradeId];
  const level = state.upgrades[upgradeId].level;
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
}

function getIngredientGain(ingredient) {
  const upgradeLevel = state.upgrades[ingredient.upgradeId]?.level || 0;
  return 1 + upgradeLevel;
}

function getPotionValue(recipe) {
  const levelBonus = 1 + (state.labLevel - 1) * 0.08;
  const cauldronBonus = 1 + state.upgrades.betterCauldron.level * 0.12;
  return Math.ceil(recipe.coins * levelBonus * cauldronBonus);
}

function canBrew(recipe) {
  return Object.entries(recipe.requirements).every(([ingredientId, amount]) => state.ingredients[ingredientId] >= amount);
}

function requirementText(requirements) {
  return Object.entries(requirements)
    .map(([ingredientId, amount]) => {
      const ingredient = ingredients.find((item) => item.id === ingredientId);
      return `${amount} ${ingredient.name}`;
    })
    .join(" + ");
}

function render() {
  renderStats();
  renderIngredients();
  renderRecipes();
  renderUpgrades();
  updateMuteButton();
  saveState();
}

function renderStats() {
  const needed = getExperienceNeeded();
  const progress = Math.min(100, Math.floor((state.experience / needed) * 100));

  elements.coinsValue.textContent = formatNumber(state.coins);
  elements.experienceValue.textContent = formatNumber(state.experience);
  elements.experienceNeededValue.textContent = formatNumber(needed);
  elements.labLevelValue.textContent = formatNumber(state.labLevel);
  elements.totalBrewedValue.textContent = formatNumber(state.totalBrewed);
  elements.levelProgressText.textContent = `${progress}%`;
  elements.levelProgressBar.style.width = `${progress}%`;
}

function renderIngredients() {
  elements.ingredientsList.innerHTML = ingredients
    .map((ingredient) => {
      const gain = getIngredientGain(ingredient);
      return `
        <button class="ingredient-card" type="button" data-ingredient="${ingredient.id}">
          <span class="ingredient-icon">${ingredient.icon}</span>
          <span>
            <span class="card-title-row">
              <span class="card-title">${ingredient.name}</span>
              <span class="ingredient-count">${formatNumber(state.ingredients[ingredient.id])}</span>
            </span>
            <span class="card-description">${ingredient.description} Collect +${gain}.</span>
          </span>
        </button>
      `;
    })
    .join("");

  elements.ingredientsList.querySelectorAll(".ingredient-card").forEach((button) => {
    button.addEventListener("click", () => collectIngredient(button.dataset.ingredient, button));
  });
}

function renderRecipes() {
  const previousSelection = elements.recipeSelect.value || recipes[0].id;
  const discoveredCount = recipes.filter((recipe) => state.discoveredRecipes[recipe.id]).length;
  elements.recipesDiscoveredValue.textContent = `${discoveredCount}/${recipes.length} found`;

  elements.recipeSelect.innerHTML = recipes
    .map((recipe) => {
      const isDiscovered = state.discoveredRecipes[recipe.id];
      const label = isDiscovered ? `${recipe.icon} ${recipe.name}` : "❔ Unknown Recipe";
      const disabled = canBrew(recipe) ? "" : "disabled";
      return `<option value="${recipe.id}" ${disabled}>${label} — ${requirementText(recipe.requirements)}</option>`;
    })
    .join("");

  if (recipes.some((recipe) => recipe.id === previousSelection)) {
    elements.recipeSelect.value = previousSelection;
  }

  const selectedRecipe = recipes.find((recipe) => recipe.id === elements.recipeSelect.value) || recipes[0];
  elements.brewButton.disabled = !selectedRecipe || !canBrew(selectedRecipe);

  elements.recipeBook.innerHTML = recipes
    .map((recipe) => {
      const isDiscovered = state.discoveredRecipes[recipe.id];
      const recipeName = isDiscovered ? `${recipe.icon} ${recipe.name}` : "❔ Unknown Recipe";
      const detail = isDiscovered
        ? requirementText(recipe.requirements)
        : `${Object.keys(recipe.requirements).length} ingredient clue${Object.keys(recipe.requirements).length > 1 ? "s" : ""} hidden in the lab.`;
      const reward = isDiscovered ? `<span class="recipe-reward">${getPotionValue(recipe)} coins · ${recipe.experience} XP</span>` : "";

      return `
        <article class="recipe-card ${isDiscovered ? "discovered" : "unknown"}">
          <div class="recipe-title-row">
            <span class="recipe-name">${recipeName}</span>
            <span>${isDiscovered ? "Found" : "Secret"}</span>
          </div>
          <p class="recipe-detail">${detail}</p>
          ${reward}
        </article>
      `;
    })
    .join("");
}

function renderUpgrades() {
  elements.upgradesList.innerHTML = Object.entries(upgradeDefinitions)
    .map(([upgradeId, upgrade]) => {
      const level = state.upgrades[upgradeId].level;
      const cost = getUpgradeCost(upgradeId);
      const disabled = state.coins < cost ? "disabled" : "";

      return `
        <article class="upgrade-card">
          <div class="upgrade-title-row">
            <span class="upgrade-name">${upgrade.name}</span>
            <span class="upgrade-level">Lvl ${level}</span>
          </div>
          <p class="upgrade-description">${upgrade.description}</p>
          <button class="buy-button" type="button" data-upgrade="${upgradeId}" ${disabled}>Buy for ${formatNumber(cost)} coins</button>
        </article>
      `;
    })
    .join("");

  elements.upgradesList.querySelectorAll(".buy-button").forEach((button) => {
    button.addEventListener("click", () => buyUpgrade(button.dataset.upgrade));
  });
}

function collectIngredient(ingredientId, target) {
  const ingredient = ingredients.find((item) => item.id === ingredientId);
  const gain = getIngredientGain(ingredient);
  state.ingredients[ingredientId] += gain;

  showFloatingFeedback(target, `+${gain} ${ingredient.name}`);
  playTone("collect");
  render();
}

function brewSelectedRecipe() {
  const recipe = recipes.find((item) => item.id === elements.recipeSelect.value) || recipes[0];
  if (!recipe || !canBrew(recipe)) {
    elements.brewMessage.textContent = "The cauldron needs more ingredients before it can bubble.";
    showToast("Gather the missing ingredients first.");
    return;
  }

  Object.entries(recipe.requirements).forEach(([ingredientId, amount]) => {
    state.ingredients[ingredientId] -= amount;
  });

  const wasNewDiscovery = !state.discoveredRecipes[recipe.id];
  state.discoveredRecipes[recipe.id] = true;
  const coinsEarned = getPotionValue(recipe);
  state.coins += coinsEarned;
  state.experience += recipe.experience;
  state.totalBrewed += 1;

  elements.cauldron.classList.add("brewing");
  window.setTimeout(() => elements.cauldron.classList.remove("brewing"), 700);

  elements.brewMessage.textContent = `${recipe.icon} Brewed ${recipe.name}! Earned ${coinsEarned} coins and ${recipe.experience} XP.`;
  showToast(wasNewDiscovery ? `New recipe discovered: ${recipe.name}!` : `${recipe.name} sold for ${coinsEarned} coins.`);
  playTone("brew");
  handleLevelUps();
  render();
}

function handleLevelUps() {
  let leveledUp = false;
  while (state.experience >= getExperienceNeeded()) {
    state.experience -= getExperienceNeeded();
    state.labLevel += 1;
    leveledUp = true;
  }

  if (leveledUp) {
    elements.brewMessage.textContent += ` Lab Level is now ${state.labLevel}!`;
    showToast(`Lab Level ${state.labLevel} reached! Potion values increased.`);
    playTone("level");
  }
}

function buyUpgrade(upgradeId) {
  const cost = getUpgradeCost(upgradeId);
  if (state.coins < cost) {
    showToast("Not enough coins for that upgrade yet.");
    return;
  }

  state.coins -= cost;
  state.upgrades[upgradeId].level += 1;
  playTone("upgrade");
  showToast(`${upgradeDefinitions[upgradeId].name} upgraded to level ${state.upgrades[upgradeId].level}.`);
  render();
}

function resetProgress() {
  const shouldReset = window.confirm("Reset all Potion Lab progress on this browser?");
  if (!shouldReset) {
    return;
  }

  localStorage.removeItem(SAVE_KEY);
  state = cloneDefaultState();
  elements.brewMessage.textContent = "The lab sparkles with a fresh start.";
  render();
}

function updateMuteButton() {
  elements.muteButton.textContent = state.muted ? "🔇 Sound Off" : "🔊 Sound On";
  elements.muteButton.setAttribute("aria-pressed", String(state.muted));
}

function toggleMute() {
  state.muted = !state.muted;
  updateMuteButton();
  if (!state.muted) {
    playTone("collect");
  }
  saveState();
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playTone(type) {
  if (state.muted) {
    return;
  }

  const context = getAudioContext();
  const now = context.currentTime;
  const settings = {
    collect: { frequencies: [640, 820], duration: 0.09, volume: 0.045, wave: "sine" },
    brew: { frequencies: [220, 330, 520], duration: 0.16, volume: 0.065, wave: "triangle" },
    upgrade: { frequencies: [392, 494, 659], duration: 0.12, volume: 0.055, wave: "square" },
    level: { frequencies: [523, 659, 784, 1046], duration: 0.14, volume: 0.065, wave: "sine" },
  }[type];

  settings.frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = now + index * settings.duration * 0.72;
    const end = start + settings.duration;

    oscillator.type = settings.wave;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(settings.volume, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  });
}

function showFloatingFeedback(target, text) {
  const rect = target.getBoundingClientRect();
  const feedback = document.createElement("span");
  feedback.className = "float-feedback";
  feedback.textContent = text;
  feedback.style.left = `${rect.left + rect.width / 2}px`;
  feedback.style.top = `${rect.top + 18}px`;
  document.body.appendChild(feedback);
  feedback.addEventListener("animationend", () => feedback.remove());
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  elements.toastStack.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
  }, 2600);
  window.setTimeout(() => toast.remove(), 3000);
}

elements.brewButton.addEventListener("click", brewSelectedRecipe);
elements.recipeSelect.addEventListener("change", renderRecipes);
elements.muteButton.addEventListener("click", toggleMute);
elements.resetButton.addEventListener("click", resetProgress);

render();
