# Potion Lab

Potion Lab is a cozy magical potion crafting and idle progression browser game. You run a tiny enchanted laboratory where you gather ingredients, brew potions, sell them for coins, discover recipes, and upgrade your tools.

This is the first playable version: small, polished, beginner-friendly, and ready to run directly from `index.html` with no build step or external libraries.

## How to Play

1. Click ingredient cards to collect:
   - Moon Water
   - Star Herb
   - Crystal Dust
2. Choose a recipe from the cauldron recipe selector.
3. Click **Brew Potion** when you have the required ingredients.
4. Earn coins and experience from each successful brew.
5. Spend coins on upgrades to collect faster or increase potion value.
6. Discover unknown recipes by successfully brewing them for the first time.

## Features

- Three collectible magical ingredients.
- Four starter recipes:
  - Healing Potion
  - Mana Potion
  - Spark Potion
  - Mystery Potion
- Recipe discovery with known and unknown recipe book entries.
- Coins, experience, lab levels, and total potions brewed tracking.
- Four upgrades with scaling costs:
  - Better Cauldron
  - Herbal Shelf
  - Moon Well
  - Crystal Grinder
- Automatic progress saving with `localStorage`.
- Reset progress button with confirmation.
- Web Audio API sound effects for collecting, brewing, upgrading, and leveling up.
- Mute/unmute toggle.
- Responsive cozy magical lab layout with glassy cards, glowing cauldron, particles, and mobile support.

## Controls

- **Click ingredient cards**: Collect ingredients.
- **Recipe dropdown**: Pick a potion recipe.
- **Brew Potion button**: Craft the selected potion if you have enough ingredients.
- **Buy buttons**: Purchase lab upgrades when you have enough coins.
- **Sound button**: Mute or unmute generated sound effects.
- **Reset Progress button**: Clear saved progress after confirmation.

## Saving Progress

Potion Lab saves progress automatically in the browser using `localStorage` under the key `potionLabSaveV1`.

Saved data includes:

- Ingredients
- Coins
- Experience
- Lab level
- Upgrade levels
- Discovered recipes
- Total potions brewed
- Mute preference

Progress is stored only for the current browser/profile. Clearing site data or using the reset button removes the save.

## Run Locally

No installation is required.

1. Download or clone this repository.
2. Open `index.html` directly in any modern browser.
3. Start brewing potions.

You can also serve the folder with any static file server, but it is not required.

## Deploy with GitHub Pages

1. Push the repository to GitHub.
2. Open the repository settings on GitHub.
3. Go to **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and the root folder.
6. Save the settings.
7. GitHub will provide a public Pages URL after deployment finishes.

Because this project uses only static files, GitHub Pages can host it without any build configuration.

## Suggested OEECO Submission Description

**Potion Lab** is a cozy browser-based potion crafting game where players gather Moon Water, Star Herb, and Crystal Dust, brew magical potions, discover recipes, earn coins and experience, and upgrade their laboratory. This first playable version focuses on satisfying click interactions, a glowing cauldron centerpiece, recipe discovery, save progress, responsive design, and generated Web Audio sound effects without external assets or libraries.

## Future Expansion Ideas

- More ingredients and recipe tiers.
- Idle ingredient generation.
- Quests and customer orders.
- Potion quality ratings.
- Laboratory decorations.
- Achievements and collection milestones.
