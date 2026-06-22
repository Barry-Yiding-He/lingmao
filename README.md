# Lingmao Rune Cards

[中文详细版](README.zh-CN.md)

Lingmao Rune Cards is a WeChat Mini Game card-battle prototype built with Canvas and JavaScript. Players combine five-element rune cards, trigger elemental cat effects, build a shared spirit pool, and defeat randomized bosses across 3 worlds and 9 stages with limited play and discard actions.

## Highlights

- **Original combat system**: `Metal / Wood / Water / Fire / Earth` drive card combinations, growth effects, boss matchups, and damage resolution instead of acting as simple suit replacements.
- **Mobile Canvas gameplay**: Implements portrait layout, touch-based card selection, battle feedback, animations, HP bars, shields, and in-combat state display.
- **Config-driven rules**: Elements, hand types, levels, bosses, and relics are separated into configuration and logic modules for easier tuning and expansion.
- **Complete prototype flow**: Includes start, battle, shop, victory, and failure states, plus deck preview, hand hints, and result feedback.
- **Portfolio-ready scope**: Demonstrates game-system design, state management, Canvas rendering, mobile interaction design, and modular JavaScript implementation.

## Tech Stack

- JavaScript
- WeChat Mini Game API
- Canvas 2D rendering
- CommonJS modules
- Mobile-first portrait layout

## Gameplay Overview

Each run contains 3 worlds and 9 stages. Every stage generates a random elemental boss with HP and shield. The player can play up to 3 rune cards per turn, discard cards to redraw, and must defeat the boss before play actions run out.

Core rules:

- Each stage starts with a randomized elemental boss.
- Bosses have HP and shield; initial shield equals half of max HP.
- The player can play up to 3 cards per turn.
- Each stage gives 4 play actions and 4 discard actions.
- The hand normally refills to 5 cards; the water tide effect can refill up to 6 cards once.
- The goal is to defeat the boss before play actions are exhausted.

## Five-Element System

The game uses two five-element relationship cycles:

- Generating cycle: `Wood -> Fire -> Earth -> Metal -> Water -> Wood`
- Controlling cycle: `Metal -> Wood -> Earth -> Water -> Fire -> Metal`

Hand evaluation respects the order in which cards are selected. For example, `wood -> fire -> earth` is a generating chain, while `metal -> wood -> earth` is a controlling chain. The battle screen includes a relationship diagram to support player decisions.

## Hand Rules

Each play can contain up to 3 cards.

| Hand | Condition | Effect |
| --- | --- | --- |
| Flush | 3 cards of the same element | Each cat effect triggers twice |
| Generating Chain | 3 cards follow the generating cycle | Spirit gain x1.5 |
| Controlling Chain | 3 cards follow the controlling cycle | Damage bypasses shield |
| Two-Card Generation | Any adjacent generating pair | Spirit gain x1.2 |
| Two-Card Control | Any adjacent controlling pair | Reduces 25% of max shield first |
| Sun Soul | Single card controls the boss element | Card spirit +10 |
| Plain Play | No special hand matched | Standard spirit calculation |

## Elemental Cat Effects

Each played card triggers its elemental cat effect once. A flush triggers each card effect twice.

| Element | Effect |
| --- | --- |
| Metal | Metal cards gain permanent `+1` for the run |
| Wood | Wood cards gain `+2` spirit for the current battle |
| Water | Grants a one-time tide state, refilling up to 6 cards next draw |
| Fire | Adds `+0.2` momentum for the current play |
| Earth | If 3 cards are played, the earth card gains `+5` spirit |

## Scoring and Damage

Spirit is calculated for the current play, then added to a shared spirit pool. Damage is based on the total spirit pool:

- If the attack element controls the boss element, damage is `spirit pool x1.5`.
- If the attack element is controlled by the boss element, damage is `spirit pool x0.5`.
- Otherwise, damage equals the current spirit pool.
- Shield absorbs damage first, while controlling chains can bypass shield.

## Implemented Features

- WeChat Mini Game Canvas rendering and touch input
- Start, battle, shop, victory, and failure states
- 9-stage progression
- Elemental deck, draw, play, discard, and refill flows
- Elemental hand evaluation and priority handling
- Spirit pool, momentum, boss HP, and shield resolution
- Element relationship diagram, deck preview, and hand hints
- Result animations, value badges, and hit sound effects
- Early shop and relic system
- Mobile portrait layout adaptation

## Project Structure

```text
.
├── game.js                  # Main loop, rendering, input, battle logic
├── game.json                # WeChat Mini Game configuration
├── project.config.json      # WeChat DevTools project configuration
├── src
│   ├── config
│   │   ├── boss.js          # Boss and asset layout config
│   │   ├── elements.js      # Element config
│   │   ├── handTypes.js     # Hand type config
│   │   ├── levels.js        # Level HP config
│   │   └── relics.js        # Shop relic config
│   └── logic
│       └── handEvaluator.js # Hand and element evaluator
└── assets                   # Images, fonts, and audio assets
```

## How to Run

1. Open the project folder in WeChat DevTools.
2. Compile and run it in the simulator or on a real device.
3. Tap the start button to enter the battle flow.

## Future Improvements

- Tune progression curves for metal, wood, and other growth effects.
- Add more boss behaviors to differentiate stages.
- Expand shop relics and mechanic-driven items.
- Improve onboarding for element relationships and spirit-pool rules.
- Add test coverage for hand evaluation, refills, shield logic, and cross-stage growth.

