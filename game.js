// 灵猫符牌 - 微信小游戏最小可运行版本

const elementConfig = require('./src/config/elements');
const levelConfig = require('./src/config/levels');
const handTypeConfig = require('./src/config/handTypes');
const relicConfig = require('./src/config/relics');
const bossConfig = require('./src/config/boss');
const handEvaluator = require('./src/logic/handEvaluator');

const ELEMENTS = elementConfig.ELEMENTS;
const ELEMENT_DISPLAY_ORDER = elementConfig.ELEMENT_DISPLAY_ORDER;
const ELEMENT_LABELS = elementConfig.ELEMENT_LABELS;
const ELEMENT_COLORS = elementConfig.ELEMENT_COLORS;
const ELEMENT_ICON_PATHS = elementConfig.ELEMENT_ICON_PATHS;

const STAGES_PER_WORLD = levelConfig.STAGES_PER_WORLD;
const LEVEL_COUNT = levelConfig.LEVEL_COUNT;
const LEVEL_HP = levelConfig.LEVEL_HP;

const HAND_TYPES = handTypeConfig.HAND_TYPES;
const createHandTypeCounts = handEvaluator.createHandTypeCounts;
const evaluateHand = handEvaluator.evaluateHand;
const getScoringCards = handEvaluator.getScoringCards;
const orderPlayedCardsForDisplay = handEvaluator.orderPlayedCardsForDisplay;
const controlsElement = handEvaluator.controlsElement;
const isControlledBy = handEvaluator.isControlledBy;

const RELICS = relicConfig.RELICS;
const GAME_IMAGE_PATHS = bossConfig.GAME_IMAGE_PATHS;
const MONSTER_LAYOUT = bossConfig.MONSTER_LAYOUT;

const HOME_NAV_ITEMS = [
  { label: '图鉴', state: 'codex' },
  { label: '牌型升级', state: 'hand_upgrade' },
  { label: '战斗', state: 'start' },
  { label: '猫窝', state: 'cat_home' },
  { label: '召唤', state: 'summon' }
];

const GAME_FONT_PATH = 'assets/ZCOOLKuaiLe-Regular.ttf';
const INITIAL_HAND_SIZE = 5;
const MAX_HAND_SIZE = 6;
const MAX_SELECTED_CARDS = 3;
const STARTING_ACTION_COUNT = 4;
const BASE_CARD_SPIRIT = 5;
const BASE_MOMENTUM = 1;
const FIRE_MOMENTUM_GAIN = 0.2;
const WOOD_SPIRIT_GAIN = 2;
const METAL_POINT_GAIN = 1;
const EARTH_THREE_CARD_BONUS = 5;
const SUN_SOUL_BONUS = 10;
const ELEMENT_ADVANTAGE_DAMAGE_MULTIPLIER = 1.5;
const ELEMENT_DISADVANTAGE_DAMAGE_MULTIPLIER = 0.5;
const TWO_CONTROL_SHIELD_RATIO = 0.25;
let GAME_FONT_FAMILY = 'sans-serif';

function gameFont(size) {
  return size + 'px ' + GAME_FONT_FAMILY;
}

function roundedRectPath(drawCtx, x, y, w, h, radius) {
  const r = Math.max(0, Math.min(radius || 0, w / 2, h / 2));

  drawCtx.beginPath();
  drawCtx.moveTo(x + r, y);
  drawCtx.lineTo(x + w - r, y);
  drawCtx.quadraticCurveTo(x + w, y, x + w, y + r);
  drawCtx.lineTo(x + w, y + h - r);
  drawCtx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  drawCtx.lineTo(x + r, y + h);
  drawCtx.quadraticCurveTo(x, y + h, x, y + h - r);
  drawCtx.lineTo(x, y + r);
  drawCtx.quadraticCurveTo(x, y, x + r, y);
  drawCtx.closePath();
}

function fillRoundedRect(drawCtx, x, y, w, h, radius, fillStyle) {
  drawCtx.fillStyle = fillStyle;
  roundedRectPath(drawCtx, x, y, w, h, radius);
  drawCtx.fill();
}

function strokeRoundedRect(drawCtx, x, y, w, h, radius, strokeStyle, lineWidth) {
  drawCtx.strokeStyle = strokeStyle;
  drawCtx.lineWidth = lineWidth || 1;
  roundedRectPath(drawCtx, x, y, w, h, radius);
  drawCtx.stroke();
}

function makeExampleCard(element, number, index) {
  return {
    id: 'example_' + element + '_' + number + '_' + index,
    element: element,
    number: number
  };
}

// 比赛信息「牌型示例」用的一组符牌（与 evaluateHand 判定一致）。
function createHandTypeExampleCards(handType) {
  if (handType === 'flush') {
    return [
      makeExampleCard('metal', 0, 0),
      makeExampleCard('metal', 0, 1),
      makeExampleCard('metal', 0, 2)
    ];
  }

  if (handType === 'birth_chain') {
    return [
      makeExampleCard('wood', 0, 0),
      makeExampleCard('water', 0, 1),
      makeExampleCard('fire', 0, 2)
    ];
  }

  if (handType === 'control_chain') {
    return [
      makeExampleCard('metal', 0, 0),
      makeExampleCard('wood', 0, 1),
      makeExampleCard('earth', 0, 2)
    ];
  }

  if (handType === 'two_birth') {
    return [
      makeExampleCard('wood', 0, 0),
      makeExampleCard('water', 0, 1)
    ];
  }

  if (handType === 'two_control') {
    return [
      makeExampleCard('metal', 0, 0),
      makeExampleCard('wood', 0, 1)
    ];
  }

  if (handType === 'sun_soul') {
    return [makeExampleCard('metal', 0, 0)];
  }

  return [makeExampleCard('fire', 0, 0)];
}

const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');
const systemInfo = wx.getSystemInfoSync();
const ELEMENT_ICONS = {};
const GAME_IMAGES = {};

const HAMMER_SOUND_SRC = 'data:audio/wav;base64,UklGRpQDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YXADAAAAANgSXiMYMDA4jTvSOj43bzIdLs4rnSwGMd44WUMwT9xa02TMa+1u8W0qaXBh/1c5TnJFuT6sOmY5fToYPRpATkKfQkVA4TqPMtwnrRscD0YDH/lP8RjsUely6KvoDOmu6NfmGuNo3Q3Wps0DxQa9fbYDsumvKLBqshm2d7q/vkfCmMSCxR/FzMMbwrTAPcA5wfvDkMjGzi/WN9475qbtAPQI+bf8QP8EAX8CNgSbBvwJeg79E0Aa1SBBJwYtvDEgNR43zjd0N3A2LjUUNHIzdTMfNE01uTYION044jjcN7I1cTJILoEpdSSAH+wa7xadE+oQrA6lDI8KJAgyBZwBY/2k+JXzeu6d6UDlleG23qLcQNti2s/ZT9mv2M/XotY11afTKNLs0CfQAdCT0N/R1NNO1h7ZEtz53q/hIORJ5jnoDerr6/jtVPAW80H2zPmd/Y8BeQUwCZQMjA8SEiwU7BVtF9AYMRqmGzkd6B6mIFoi5yMuJRUmiSaBJgMmHSXnI3wi+CBzH/wdmxxKG/4ZpRgqF3kVhBNGEcAO/wsWCRsGKQNVALH9RvsV+Rn3RfWK89nxJPBj7pfsxOr36EHnsuVe5FHjlOIn4gfiKOJ84vXig+Md5LzkYOUO5s7mrOey6OrpWev/7Nfu2PD08h71R/dj+Wr7WP0u/+8AowJRBAEGtwd0CTYL9wysDkwQyxEgE0MUMhXtFXcW1xYVFzgXRxdGFzYXFhfhFpIWIhaMFcsU3xPJEo0RMxDCDkMNvgs5CrgIPAfFBVEE2wJhAd//Vv7G/DT7o/kb+KT2Q/X+89jy1PHw8Cvwgu/v7nHuBO6n7VztJO0D7fzsE+1K7aXtIe6/7nnvTPA08SryLPM19ET1WfZz95X4v/nz+jL8ef3H/hoAbAG6Av8DNwVdBnIHcwhgCTwKBgvBC20MCw2bDRsOiQ7jDiYPUA9fD1QPLg/vDpgOLQ6vDSMNiQzjCzILdwqxCd8IAQgXByIGIgUbBA0D/QHtAOD/2v7b/eX8+fsY+0D6c/mu+PT3RPef9gb2fPUD9Zv0RvQG9NrzwvO+883z7PMc9Fn0pfT99GL10/VR9tz2dPcY+Mn4g/lH+hL74vu1/In9Xf4v//7/yQCRAVQCEgPMA4AELQXTBXAGAgeJBwIIbgjLCBkJWAmICaoJ';

const HAMMER_SOUND_FILE = 'assets/hammer-hit.wav';

canvas.width = systemInfo.windowWidth;
canvas.height = systemInfo.windowHeight;

function createLevelDeck() {
  const deck = [];

  ELEMENTS.forEach(function(element) {
    for (let serial = 1; serial <= 8; serial += 1) {
      deck.push({
        id: element + '_' + serial + '_' + Date.now() + '_' + Math.random(),
        serial: serial,
        number: 0,
        element: element
      });
    }
  });

  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }

  return deck;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const x = clamp(t, 0, 1) - 1;
  return 1 + c3 * x * x * x + c1 * x * x;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
}

function easeInOutCubic(t) {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function formatMultiplier(value) {
  return Math.round(value * 10) / 10;
}

function formatAmount(value) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10);
}

function createElementBonuses() {
  const bonuses = {};

  ELEMENTS.forEach(function(element) {
    bonuses[element] = 0;
  });

  return bonuses;
}

function createLevelElementBonuses(previousBonuses) {
  const bonuses = createElementBonuses();

  if (previousBonuses) {
    bonuses.metal = previousBonuses.metal || 0;
  }

  return bonuses;
}

function pickRandomElement() {
  return ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
}

function getCardPower(card, elementBonuses) {
  const cardPower = card && typeof card.number === 'number' ? card.number : 0;
  const elementPower = card && elementBonuses ? (elementBonuses[card.element] || 0) : 0;

  return cardPower + elementPower;
}

function getCardDisplayText(card) {
  const power = card && typeof card.displayPower === 'number'
    ? card.displayPower
    : getCardPower(card);
  return power > 0 ? '+' + power : '';
}

function getBattleSideButtonLayout(layout) {
  const buttonW = Math.max(42, Math.floor(layout.canvasWidth * 0.11));
  const buttonH = Math.max(34, Math.floor(layout.hpBarHeight * 1.45));
  const rightPadding = Math.max(8, Math.floor(layout.canvasWidth * 0.025));
  const x = layout.canvasWidth - buttonW - rightPadding;
  const y = layout.hpBarY + Math.floor((layout.hpBarHeight - buttonH) / 2);
  const gap = Math.max(8, Math.floor(layout.canvasHeight * 0.012));

  return {
    x: x,
    y: y,
    w: buttonW,
    h: buttonH,
    gap: gap
  };
}

function getHpBarLayout(layout) {
  const sideButton = getBattleSideButtonLayout(layout);
  const leftPadding = Math.max(40, Math.floor(layout.canvasWidth * 0.15));
  const rightGap = Math.max(8, Math.floor(layout.canvasWidth * 0.018));
  const rightLimit = sideButton.x - rightGap;
  const hpX = leftPadding;
  const hpW = Math.max(120, rightLimit - hpX);

  return {
    x: hpX,
    y: layout.hpBarY,
    w: hpW,
    h: layout.hpBarHeight
  };
}

function estimateHandSpirit(cards, result, elementBonuses) {
  if (!cards || !cards.length || !result) {
    return { spirit: 0, momentum: BASE_MOMENTUM, handSpirit: 0 };
  }

  const catTriggerCount = result.type === 'flush' ? 2 : 1;
  const bonusPreview = Object.assign(createElementBonuses(), elementBonuses || {});
  let spirit = 0;
  let momentum = BASE_MOMENTUM;

  cards.forEach(function(card, index) {
    let gain = BASE_CARD_SPIRIT + getCardPower(card, bonusPreview);

    if (result.type === 'sun_soul' && index === 0) {
      gain += SUN_SOUL_BONUS;
    }

    if (card.element === 'wood') {
      const elementGain = WOOD_SPIRIT_GAIN * catTriggerCount;
      gain += elementGain;
      bonusPreview[card.element] = (bonusPreview[card.element] || 0) + elementGain;
    }

    if (card.element === 'metal') {
      const elementGain = METAL_POINT_GAIN * catTriggerCount;
      gain += elementGain;
      bonusPreview[card.element] = (bonusPreview[card.element] || 0) + elementGain;
    }

    if (card.element === 'earth' && cards.length === 3) {
      gain += EARTH_THREE_CARD_BONUS * catTriggerCount;
    }

    spirit += gain;

    if (card.element === 'fire') {
      momentum += FIRE_MOMENTUM_GAIN * catTriggerCount;
    }
  });

  return {
    spirit: spirit,
    momentum: momentum,
    handSpirit: spirit * result.spiritMultiplier * momentum
  };
}

function requestGameFrame(callback) {
  if (wx.requestAnimationFrame) {
    return wx.requestAnimationFrame(callback);
  }
  return setTimeout(callback, 16);
}

function getCardRelicEvents(card, context, relics) {
  const events = [];

  if (!Array.isArray(relics)) {
    return events;
  }

  relics.forEach(function(relic) {
    if (!relic || !relic.id) {
      return;
    }

    if (relic.id === 'fire_tail' && card.element === 'fire') {
      events.push({ relic: relic, stat: 'base', amount: 5, text: relic.name + ' +5' });
    }

    if (relic.id === 'water_mirror' && card.element === 'water') {
      events.push({ relic: relic, stat: 'multiplier', amount: 0.2, text: relic.name + ' +0.2' });
    }

    if (relic.id === 'orange_cat' && card.number === 7) {
      events.push({ relic: relic, stat: 'multiplier', amount: 0.5, text: relic.name + ' +0.5' });
    }
  });

  return events;
}

function createSettlementTimeline(playedCards, context) {
  let spirit = 0;
  let momentum = BASE_MOMENTUM;
  const steps = [];
  const catTriggerCount = context.result.type === 'flush' ? 2 : 1;
  const elementBonuses = context.elementBonuses || createElementBonuses();
  const initialElementBonuses = Object.assign(createElementBonuses(), elementBonuses);

  function pushStep(card, spiritGain, momentumGain, updatesCardPower, spiritBadgeText, elementBonusesBefore) {
    const spiritBefore = spirit;
    const momentumBefore = momentum;

    spirit += spiritGain;
    momentum += momentumGain;

    steps.push({
      card: card,
      scoreBefore: spiritBefore,
      multiplierBefore: momentumBefore,
      scoreGain: spiritGain,
      momentumGain: momentumGain,
      spiritBadgeText: spiritBadgeText || '',
      scoreAfter: spirit,
      multiplierAfter: momentum,
      displayPowerAfter: getCardPower(card, elementBonuses),
      elementBonusesBefore: Object.assign(createElementBonuses(), elementBonusesBefore || elementBonuses),
      elementBonusesAfter: Object.assign(createElementBonuses(), elementBonuses),
      updatesCardPower: !!updatesCardPower,
      hasStatChange: spiritGain > 0 || momentumGain > 0 || updatesCardPower
    });
  }

  playedCards.forEach(function(card, cardIndex) {
    const baseGain = BASE_CARD_SPIRIT + getCardPower(card, elementBonuses);
    let firstTriggerBaseGain = baseGain;

    if (context.result.type === 'sun_soul' && cardIndex === 0) {
      firstTriggerBaseGain += SUN_SOUL_BONUS;
    }

    for (let triggerIndex = 0; triggerIndex < catTriggerCount; triggerIndex += 1) {
      const elementBonusesBefore = Object.assign(createElementBonuses(), elementBonuses);
      let spiritGain = triggerIndex === 0 ? firstTriggerBaseGain : 0;
      let momentumGain = 0;
      let updatesCardPower = false;
      let spiritBadgeText = '';

      if (card.element === 'wood') {
        elementBonuses[card.element] = (elementBonuses[card.element] || 0) + WOOD_SPIRIT_GAIN;
        spiritGain += WOOD_SPIRIT_GAIN;
        updatesCardPower = true;
        spiritBadgeText = '+' + formatAmount(elementBonuses[card.element]);
      }

      if (card.element === 'metal') {
        elementBonuses[card.element] = (elementBonuses[card.element] || 0) + METAL_POINT_GAIN;
        spiritGain += METAL_POINT_GAIN;
        updatesCardPower = true;
        spiritBadgeText = '+' + formatAmount(elementBonuses[card.element]);
      }

      if (card.element === 'earth' && playedCards.length === 3) {
        spiritGain += EARTH_THREE_CARD_BONUS;
      }

      if (card.element === 'fire') {
        momentumGain += FIRE_MOMENTUM_GAIN;
      }

      if (card.element === 'water') {
        context.gainsTide = true;
      }

      pushStep(card, spiritGain, momentumGain, updatesCardPower, spiritBadgeText, elementBonusesBefore);
    }
  });

  return {
    steps: steps,
    finalBase: spirit,
    finalMultiplier: momentum,
    initialElementBonuses: initialElementBonuses,
    finalElementBonuses: Object.assign(createElementBonuses(), elementBonuses),
    handSpirit: spirit * context.result.spiritMultiplier * momentum
  };
}

// 根据已拥有摆件修改出牌结算上下文。
function applyRelics(context, relics) {
  const selectedCards = Array.isArray(context.selectedCards) ? context.selectedCards : [];
  const appliedRelicIds = {};

  if (!Array.isArray(relics)) {
    return context;
  }

  relics.forEach(function(relic) {
    if (!relic || !relic.id || appliedRelicIds[relic.id]) {
      return;
    }

    appliedRelicIds[relic.id] = true;

    if (relic.id === 'fire_tail') {
      selectedCards.forEach(function(card) {
        if (card.element === 'fire') {
          context.bonusScore += 5;
        }
      });
    }

    if (relic.id === 'water_mirror') {
      selectedCards.forEach(function(card) {
        if (card.element === 'water') {
          context.multiplier += 0.2;
        }
      });
    }

    if (relic.id === 'orange_cat') {
      selectedCards.forEach(function(card) {
        if (card.number === 7) {
          context.multiplier += 0.5;
        }
      });
    }

    if (relic.id === 'black_cat' && context.isFirstHandOfLevel) {
      context.multiplier *= 2;
    }

    if (relic.id === 'wealth_cat' && context.handType === 'pair') {
      context.goldGain += 2;
    }
  });

  return context;
}

// 在牌面中心绘制五行元素符号（图标或文字兜底）。
function drawElementSymbol(drawCtx, element, centerX, centerY, size, alpha) {
  const color = ELEMENT_COLORS[element];
  const icon = ELEMENT_ICONS[element];
  const emblemSize = Math.max(12, size);
  const half = emblemSize / 2;
  const opacity = alpha === undefined ? 1 : alpha;

  drawCtx.save();
  drawCtx.globalAlpha = opacity;

  if (icon && icon.ready) {
    drawCtx.drawImage(icon, centerX - half, centerY - half, emblemSize, emblemSize);
  } else {
    drawCtx.fillStyle = color;
    drawCtx.globalAlpha = opacity * 0.18;
    drawCtx.beginPath();
    drawCtx.arc(centerX, centerY, half * 0.9, 0, Math.PI * 2);
    drawCtx.fill();
    drawCtx.globalAlpha = opacity;
    drawCtx.fillStyle = color;
    drawCtx.font = gameFont(Math.max(12, Math.floor(emblemSize * 0.5)));
    drawCtx.textAlign = 'center';
    drawCtx.textBaseline = 'middle';
    drawCtx.fillText(ELEMENT_LABELS[element], centerX, centerY);
  }

  drawCtx.restore();
}

function drawArrowLine(drawCtx, fromX, fromY, toX, toY, color, lineWidth, headSize) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const arrowBackX = toX - Math.cos(angle) * headSize;
  const arrowBackY = toY - Math.sin(angle) * headSize;

  drawCtx.save();
  drawCtx.strokeStyle = color;
  drawCtx.fillStyle = color;
  drawCtx.lineWidth = lineWidth;
  drawCtx.lineCap = 'round';
  drawCtx.beginPath();
  drawCtx.moveTo(fromX, fromY);
  drawCtx.lineTo(arrowBackX, arrowBackY);
  drawCtx.stroke();

  drawCtx.beginPath();
  drawCtx.moveTo(toX, toY);
  drawCtx.lineTo(
    arrowBackX + Math.cos(angle + Math.PI / 2) * headSize * 0.45,
    arrowBackY + Math.sin(angle + Math.PI / 2) * headSize * 0.45
  );
  drawCtx.lineTo(
    arrowBackX + Math.cos(angle - Math.PI / 2) * headSize * 0.45,
    arrowBackY + Math.sin(angle - Math.PI / 2) * headSize * 0.45
  );
  drawCtx.closePath();
  drawCtx.fill();
  drawCtx.restore();
}

function drawFiveElementDiagram(drawCtx, x, y, size) {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const radius = size * 0.36;
  const iconSize = Math.max(13, size * 0.24);
  const lineWidth = Math.max(1.5, size * 0.025);
  const headSize = Math.max(5, size * 0.07);
  const positions = {
    metal: { x: centerX, y: centerY - radius },
    water: { x: centerX + radius * 0.95, y: centerY - radius * 0.30 },
    wood: { x: centerX + radius * 0.58, y: centerY + radius * 0.86 },
    fire: { x: centerX - radius * 0.58, y: centerY + radius * 0.86 },
    earth: { x: centerX - radius * 0.95, y: centerY - radius * 0.30 }
  };
  const birth = ['wood', 'fire', 'earth', 'metal', 'water'];
  const control = ['metal', 'wood', 'earth', 'water', 'fire'];

  drawCtx.save();
  drawCtx.globalAlpha = 0.92;
  birth.forEach(function(element, index) {
    const next = birth[(index + 1) % birth.length];
    const from = positions[element];
    const to = positions[next];
    drawArrowLine(
      drawCtx,
      from.x + (to.x - from.x) * 0.22,
      from.y + (to.y - from.y) * 0.22,
      from.x + (to.x - from.x) * 0.75,
      from.y + (to.y - from.y) * 0.75,
      '#3f9b61',
      lineWidth,
      headSize
    );
  });

  control.forEach(function(element, index) {
    const next = control[(index + 1) % control.length];
    const from = positions[element];
    const to = positions[next];
    drawArrowLine(
      drawCtx,
      from.x + (to.x - from.x) * 0.30,
      from.y + (to.y - from.y) * 0.30,
      from.x + (to.x - from.x) * 0.66,
      from.y + (to.y - from.y) * 0.66,
      '#b34a43',
      Math.max(1.2, lineWidth * 0.85),
      Math.max(4, headSize * 0.85)
    );
  });

  Object.keys(positions).forEach(function(element) {
    const point = positions[element];
    drawCtx.fillStyle = '#fffaf0';
    drawCtx.beginPath();
    drawCtx.arc(point.x, point.y, iconSize * 0.54, 0, Math.PI * 2);
    drawCtx.fill();
    drawCtx.strokeStyle = ELEMENT_COLORS[element];
    drawCtx.lineWidth = Math.max(1, size * 0.018);
    drawCtx.stroke();
    drawElementSymbol(drawCtx, element, point.x, point.y, iconSize * 0.74, 0.95);
  });
  drawCtx.restore();
}

// 绘制单张符牌。
function drawCard(drawCtx, card, x, y, selected, cardWidth, cardHeight, selectedOrder) {
  const w = cardWidth || 40;
  const h = cardHeight || 62;
  const color = ELEMENT_COLORS[card.element];
  const cardY = selected ? y - 12 : y;
  const radius = Math.max(5, Math.floor(w * 0.08));
  const emblemSize = Math.max(28, Math.min(
    Math.floor(Math.min(w, h) * 0.52),
    w - 12,
    h - 24
  ));

  card.renderX = x;
  card.renderY = cardY;
  card.renderW = w;
  card.renderH = h;

  drawCtx.save();
  drawCtx.shadowColor = 'rgba(47, 33, 24, 0.25)';
  drawCtx.shadowBlur = selected ? 10 : 5;
  drawCtx.shadowOffsetY = selected ? 4 : 2;
  drawCtx.fillStyle = selected ? '#fff4c2' : '#fffaf0';
  roundedRectPath(drawCtx, x, cardY, w, h, radius);
  drawCtx.fill();
  drawCtx.shadowColor = 'transparent';
  drawCtx.strokeStyle = color;
  drawCtx.lineWidth = selected ? 3.5 : 2.5;
  drawCtx.stroke();

  drawElementSymbol(drawCtx, card.element, x + w / 2, cardY + h / 2, emblemSize);

  drawCtx.fillStyle = color;
  drawCtx.font = gameFont(Math.max(14, Math.floor(w * 0.28)));
  drawCtx.textAlign = 'left';
  drawCtx.textBaseline = 'top';
  drawCtx.fillText(getCardDisplayText(card), x + 6, cardY + 5);

  if (selected && selectedOrder > 0) {
    const badgeRadius = Math.max(8, Math.floor(w * 0.16));
    const badgeX = x + w - badgeRadius - 4;
    const badgeY = cardY + badgeRadius + 4;

    drawCtx.fillStyle = '#d9792b';
    drawCtx.beginPath();
    drawCtx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
    drawCtx.fill();
    drawCtx.strokeStyle = '#fffaf0';
    drawCtx.lineWidth = 2;
    drawCtx.stroke();
    drawCtx.fillStyle = '#fffaf0';
    drawCtx.font = gameFont(Math.max(12, Math.floor(badgeRadius * 1.15)));
    drawCtx.textAlign = 'center';
    drawCtx.textBaseline = 'middle';
    drawCtx.fillText(String(selectedOrder), badgeX, badgeY);
  }

  drawCtx.restore();
}

function drawMiniDeckCard(drawCtx, card, x, y, w, h) {
  const color = ELEMENT_COLORS[card.element];
  const emblemSize = Math.max(12, Math.floor(Math.min(w, h) * 0.62));

  drawElementSymbol(drawCtx, card.element, x + w / 2, y + h / 2, emblemSize, 0.92);

  drawCtx.save();
  drawCtx.fillStyle = color;
  drawCtx.font = gameFont(Math.max(10, Math.floor(w * 0.55)));
  drawCtx.textAlign = 'right';
  drawCtx.textBaseline = 'top';
  drawCtx.fillText(getCardDisplayText(card), x + w - 3, y + 2);
  drawCtx.restore();
}

function drawPlayedCard(drawCtx, card, x, y, w, h) {
  const color = ELEMENT_COLORS[card.element];
  const radius = Math.max(4, Math.floor(w * 0.08));
  const emblemSize = Math.max(24, Math.min(
    Math.floor(Math.min(w, h) * 0.58),
    w - 10,
    h - 16
  ));

  drawCtx.save();
  drawCtx.fillStyle = '#fffaf0';
  roundedRectPath(drawCtx, x, y, w, h, radius);
  drawCtx.fill();
  drawCtx.strokeStyle = color;
  drawCtx.lineWidth = 2.5;
  drawCtx.stroke();

  drawElementSymbol(drawCtx, card.element, x + w / 2, y + h / 2, emblemSize);

  drawCtx.fillStyle = color;
  drawCtx.font = gameFont(Math.max(13, Math.floor(w * 0.34)));
  drawCtx.textAlign = 'left';
  drawCtx.textBaseline = 'top';
  drawCtx.fillText(getCardDisplayText(card), x + 5, y + 4);

  drawCtx.restore();
}

// 判断坐标是否在矩形内。
function hitRect(point, rect) {
  return point.x >= rect.x &&
    point.x <= rect.x + rect.w &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.h;
}

// 从微信触摸事件中安全取出画布坐标。
function getTouchPoint(event) {
  const touches = event && event.touches && event.touches.length > 0
    ? event.touches
    : event && event.changedTouches;

  if (!touches || touches.length === 0) {
    return null;
  }

  return {
    x: touches[0].clientX,
    y: touches[0].clientY
  };
}

class Game {
  constructor() {
    this.state = 'start';
    this.level = 1;
    this.monsterMaxHp = LEVEL_HP[0];
    this.monsterHp = this.monsterMaxHp;
    this.monsterMaxShield = Math.floor(this.monsterMaxHp / 2);
    this.monsterShield = this.monsterMaxShield;
    this.bossElement = pickRandomElement();
    this.currentScore = 0;
    this.handsLeft = STARTING_ACTION_COUNT;
    this.discardsLeft = STARTING_ACTION_COUNT;
    this.gold = 10;
    this.deck = [];
    this.hand = [];
    this.playedCards = [];
    this.selectedIds = [];
    this.relics = [];
    this.shopItems = [];
    this.handTypeCounts = createHandTypeCounts();
    this.lastResultText = '';
    this.centerFeedback = null;
    this.deckModalOpen = false;
    this.relicModalOpen = false;
    this.matchInfoModalOpen = false;
    this.matchInfoExampleType = null;
    this.selectedRelicId = RELICS[0] ? RELICS[0].id : null;
    this.isResolving = false;
    this.settlementAnimation = null;
    this.visualMonsterHp = this.monsterHp;
    this.visualMonsterShield = this.monsterShield;
    this.hammerAudio = null;
    this.ambientAnimationRunning = false;
    this.firstHandPlayed = false;
    this.hasTide = false;
    this.pendingTideDraw = false;
    this.elementBonuses = createElementBonuses();
    this.touchAreas = [];
    this.systemInfo = wx.getSystemInfoSync();
    this.layout = null;

    this.calculateLayout(true);
    this.loadGameFont();
    this.loadElementIcons();
    this.loadGameImages();
    this.prepareHammerAudio();
    this.bindEvents();
    this.startAmbientAnimationLoop();
    this.draw();
  }

  loadGameFont() {
    if (!wx.loadFont) {
      return;
    }

    try {
      const loadedFontFamily = wx.loadFont(GAME_FONT_PATH);
      if (loadedFontFamily) {
        GAME_FONT_FAMILY = loadedFontFamily;
      }
    } catch (error) {
      GAME_FONT_FAMILY = 'sans-serif';
    }
  }

  loadElementIcons() {
    Object.keys(ELEMENT_ICON_PATHS).forEach(function(element) {
      if (ELEMENT_ICONS[element]) {
        return;
      }

      const image = wx.createImage();
      image.ready = false;
      image.onload = function() {
        image.ready = true;
        this.draw();
      }.bind(this);
      image.src = ELEMENT_ICON_PATHS[element];
      ELEMENT_ICONS[element] = image;
    }, this);
  }

  loadGameImages() {
    Object.keys(GAME_IMAGE_PATHS).forEach(function(key) {
      if (GAME_IMAGES[key]) {
        return;
      }

      const image = wx.createImage();
      image.ready = false;
      image.onload = function() {
        image.ready = true;
        this.prepareChromaImage(key, image);
        this.draw();
      }.bind(this);
      image.src = GAME_IMAGE_PATHS[key];
      GAME_IMAGES[key] = image;
    }, this);
  }

  prepareChromaImage(key, image) {
    const imageWidth = image ? (image.width || image.naturalWidth) : 0;
    const imageHeight = image ? (image.height || image.naturalHeight) : 0;

    if (!image || !imageWidth || !imageHeight || !wx.createCanvas) {
      return;
    }

    try {
      const offscreen = wx.createCanvas();
      offscreen.width = imageWidth;
      offscreen.height = imageHeight;
      const offCtx = offscreen.getContext('2d');

      if (!offCtx || !offCtx.getImageData || !offCtx.putImageData) {
        return;
      }

      offCtx.drawImage(image, 0, 0, offscreen.width, offscreen.height);
      const data = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
      const pixels = data.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const greenDistance = Math.abs(r) + Math.abs(g - 255) + Math.abs(b);

        if (g > 150 && g > r * 1.3 && g > b * 1.3) {
          pixels[i + 3] = greenDistance < 110 ? 0 : Math.min(pixels[i + 3], 90);
        }
      }

      offCtx.putImageData(data, 0, 0);
      image.chromaCanvas = offscreen;
    } catch (error) {
      image.chromaCanvas = null;
    }
  }

  prepareHammerAudio() {
    if (!wx.createInnerAudioContext) {
      return;
    }

    try {
      this.hammerAudio = wx.createInnerAudioContext();
      this.hammerAudio.src = HAMMER_SOUND_FILE;
      this.hammerAudio.volume = 0.35;
      this.hammerAudio.obeyMuteSwitch = false;
    } catch (error) {
      this.hammerAudio = null;
    }
  }

  playHammerSound() {
    if (this.hammerAudio) {
      try {
        this.hammerAudio.stop();
        if (typeof this.hammerAudio.seek === 'function') {
          this.hammerAudio.seek(0);
        }
        this.hammerAudio.play();
        return;
      } catch (error) {}
    }

    if (wx.createInnerAudioContext) {
      try {
        const audio = wx.createInnerAudioContext();
        audio.src = HAMMER_SOUND_FILE;
        audio.volume = 0.2;
        audio.obeyMuteSwitch = false;
        audio.onEnded(function() {
          audio.destroy();
        });
        audio.onError(function() {
          audio.destroy();
        });
        audio.play();
        return;
      } catch (error) {}
    }

    if (this.hammerAudio) {
      try {
        this.hammerAudio.stop();
        this.hammerAudio.play();
        return;
      } catch (error) {}
    }

    if (wx.vibrateShort) {
      try {
        wx.vibrateShort({ type: 'light' });
      } catch (error) {}
    }
  }

  startAmbientAnimationLoop() {
    if (this.ambientAnimationRunning) {
      return;
    }

    this.ambientAnimationRunning = true;

    const tick = function() {
      if (this.state === 'playing' && !this.isResolving) {
        this.draw();
      }

      requestGameFrame(tick);
    }.bind(this);

    requestGameFrame(tick);
  }

  // 统一计算安全区、顶部、手牌和底部操作栏布局。
  // force 为 true 时完整重算；否则在画布尺寸未变时跳过，减轻每帧 draw 里的同步 API 与重复计算（结算动画更顺滑）。
  calculateLayout(force) {
    let si = this.systemInfo;

    if (force || !si || si.windowWidth !== canvas.width || si.windowHeight !== canvas.height) {
      si = wx.getSystemInfoSync();
      this.systemInfo = si;

      if (si.windowWidth !== canvas.width || si.windowHeight !== canvas.height) {
        canvas.width = si.windowWidth;
        canvas.height = si.windowHeight;
      }
    }

    if (!force && this.layout &&
        this.layout.canvasWidth === canvas.width &&
        this.layout.canvasHeight === canvas.height) {
      return;
    }

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const safeArea = this.systemInfo.safeArea;
    const safeTop = safeArea ? safeArea.top : 0;
    const bottomSafeInset = safeArea ? canvasHeight - safeArea.bottom : 0;
    let menuBottom = 0;

    if (wx.getMenuButtonBoundingClientRect) {
      try {
        const menuButton = wx.getMenuButtonBoundingClientRect();
        menuBottom = menuButton && menuButton.bottom ? menuButton.bottom : 0;
      } catch (error) {
        menuBottom = 0;
      }
    }

    const scale = Math.min(canvasWidth / 360, canvasHeight / 802);
    const topPadding = safeArea
      ? Math.max(safeTop, menuBottom || safeTop) + Math.round(8 * scale)
      : (menuBottom ? menuBottom + Math.round(8 * scale) : Math.round(30 * scale));
    const bottomPadding = Math.max(8, Math.round(10 * scale));
    const sectionGap = Math.max(5, Math.round(7 * scale));
    const formulaPlayGap = Math.max(2, Math.floor(sectionGap * 0.45));
    const headerHeight = Math.max(32, Math.round(canvasHeight * 0.055));
    const hpBarHeight = Math.max(20, Math.round(canvasHeight * 0.030));
    const calculationHeight = Math.max(42, Math.round(canvasHeight * 0.052));
    const playAreaHeight = Math.max(66, Math.round(canvasHeight * 0.088));
    const deckPreviewHeight = Math.max(50, Math.round(canvasHeight * 0.070));
    const actionButtonsHeight = Math.max(54, Math.round(canvasHeight * 0.075));
    const handSlotGap = Math.max(4, Math.min(8, Math.floor(canvasWidth * 0.014)));
    const handAvailableWidth = Math.max(220, canvasWidth - 28);
    const handCardWidth = Math.max(42, Math.min(68, Math.floor((handAvailableWidth - handSlotGap * (MAX_HAND_SIZE - 1)) / MAX_HAND_SIZE)));
    const handCardHeight = Math.floor(handCardWidth * 1.42);
    let handCardsHeight = handCardHeight + Math.max(14, Math.round(canvasHeight * 0.018));

    const bottomLimit = canvasHeight - bottomSafeInset - bottomPadding;
    const actionButtonsY = bottomLimit - actionButtonsHeight;
    let handCardsY = actionButtonsY - handCardsHeight;
    let deckPreviewY = handCardsY - deckPreviewHeight;
    let playAreaY = deckPreviewY - playAreaHeight - sectionGap;
    let calculationY = playAreaY - calculationHeight - formulaPlayGap;
    const headerY = topPadding;
    const topBarBottom = headerY + headerHeight;
    const hpBarY = topBarBottom + Math.max(10, Math.round(canvasHeight * 0.024));
    const monsterY = hpBarY + hpBarHeight + sectionGap;
    let monsterHeight = calculationY - monsterY - sectionGap;

    if (monsterHeight < MONSTER_LAYOUT.monsterMinHeight) {
      const shortage = MONSTER_LAYOUT.monsterMinHeight - monsterHeight;
      handCardsHeight = Math.max(92, handCardsHeight - shortage);
      monsterHeight = MONSTER_LAYOUT.monsterMinHeight;
    }

    handCardsY = actionButtonsY - handCardsHeight;
    deckPreviewY = handCardsY - deckPreviewHeight;
    playAreaY = deckPreviewY - playAreaHeight - sectionGap;
    calculationY = playAreaY - calculationHeight - formulaPlayGap;
    monsterHeight = Math.max(48, calculationY - monsterY - sectionGap);
    const handCardGap = handSlotGap;

    this.layout = {
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
      topPadding: topPadding,
      bottomSafeInset: bottomSafeInset,
      sectionGap: sectionGap,
      headerY: headerY,
      headerHeight: headerHeight,
      topBarBottom: topBarBottom,
      monsterY: monsterY,
      monsterHeight: monsterHeight,
      hpBarY: hpBarY,
      hpBarHeight: hpBarHeight,
      calculationY: calculationY,
      calculationHeight: calculationHeight,
      playAreaY: playAreaY,
      playAreaHeight: playAreaHeight,
      deckPreviewY: deckPreviewY,
      deckPreviewHeight: deckPreviewHeight,
      actionButtonsY: actionButtonsY,
      actionButtonsHeight: actionButtonsHeight,
      handCardsY: handCardsY,
      handCardsHeight: handCardsHeight,
      handCardWidth: handCardWidth,
      handCardHeight: handCardHeight,
      handCardGap: handCardGap,
      formulaY: calculationY,
      monsterAreaTop: monsterY,
      monsterAreaBottom: monsterY + monsterHeight,
      playAreaTop: playAreaY,
      playAreaBottom: playAreaY + playAreaHeight,
      handAreaTop: handCardsY,
      actionBarY: actionButtonsY,
      actionBarHeight: actionButtonsHeight,
      cardWidth: handCardWidth,
      cardHeight: handCardHeight,
      cardGap: handCardGap
    };

  }

  // 绑定微信小游戏触摸事件。
  bindEvents() {
    const self = this;
    wx.onTouchStart(function(event) {
      const point = getTouchPoint(event);
      if (point) {
        self.handleTouch(point);
      }
    }, this);
  }

  getLevelInfo() {
    return {
      world: Math.floor((this.level - 1) / STAGES_PER_WORLD) + 1,
      stage: ((this.level - 1) % STAGES_PER_WORLD) + 1
    };
  }

  openDeckModal() {
    this.deckModalOpen = true;
    this.relicModalOpen = false;
    this.matchInfoModalOpen = false;
    this.matchInfoExampleType = null;
  }

  openRelicModal() {
    this.relicModalOpen = true;
    this.deckModalOpen = false;
    this.matchInfoModalOpen = false;
    this.matchInfoExampleType = null;
    if (!this.selectedRelicId && RELICS.length > 0) {
      this.selectedRelicId = RELICS[0].id;
    }
  }

  openMatchInfoModal() {
    this.matchInfoModalOpen = true;
    this.matchInfoExampleType = null;
    this.deckModalOpen = false;
    this.relicModalOpen = false;
  }

  // 初始化一局新游戏。
  restart() {
    this.calculateLayout(true);
    this.isResolving = false;
    this.settlementAnimation = null;
    this.centerFeedback = null;
    this.state = 'playing';
    this.level = 1;
    this.gold = 10;
    this.relics = [];
    this.deckModalOpen = false;
    this.relicModalOpen = false;
    this.matchInfoModalOpen = false;
    this.matchInfoExampleType = null;
    this.selectedRelicId = RELICS[0] ? RELICS[0].id : null;
    this.elementBonuses = createElementBonuses();
    this.startLevel();
  }

  // 退出当前对局，返回开始主界面。
  exitToStart() {
    this.isResolving = false;
    this.settlementAnimation = null;
    this.centerFeedback = null;
    this.deckModalOpen = false;
    this.relicModalOpen = false;
    this.matchInfoModalOpen = false;
    this.matchInfoExampleType = null;
    this.selectedIds = [];
    this.state = 'start';
  }

  // 切换主界面底部导航页。
  openHomeTab(state) {
    this.isResolving = false;
    this.settlementAnimation = null;
    this.centerFeedback = null;
    this.deckModalOpen = false;
    this.relicModalOpen = false;
    this.matchInfoModalOpen = false;
    this.matchInfoExampleType = null;
    this.selectedIds = [];
    this.state = state;
  }

  // 开始当前关卡。
  startLevel() {
    this.monsterMaxHp = LEVEL_HP[this.level - 1];
    this.monsterHp = this.monsterMaxHp;
    this.monsterMaxShield = Math.floor(this.monsterMaxHp / 2);
    this.monsterShield = this.monsterMaxShield;
    this.bossElement = pickRandomElement();
    this.visualMonsterHp = this.monsterHp;
    this.visualMonsterShield = this.monsterShield;
    this.currentScore = 0;
    this.handsLeft = STARTING_ACTION_COUNT;
    this.discardsLeft = STARTING_ACTION_COUNT;
    this.firstHandPlayed = false;
    this.hasTide = false;
    this.pendingTideDraw = false;
    this.elementBonuses = createLevelElementBonuses(this.elementBonuses);
    this.selectedIds = [];
    this.deck = [];
    this.hand = [];
    this.playedCards = [];
    this.lastResultText = '';
    this.centerFeedback = null;
    this.deckModalOpen = false;
    this.relicModalOpen = false;
    this.matchInfoModalOpen = false;
    this.matchInfoExampleType = null;
    this.handTypeCounts = createHandTypeCounts();
    this.isResolving = false;
    this.settlementAnimation = null;

    this.deck = createLevelDeck();

    this.drawCards();
  }

  // 每次行动后补到5张；若行动开始时已有灵潮，则本次最多补到6张并消耗灵潮。
  drawCards() {
    let targetHandSize = INITIAL_HAND_SIZE;

    if (this.pendingTideDraw || this.hasTide) {
      targetHandSize = MAX_HAND_SIZE;
      this.pendingTideDraw = false;
      this.hasTide = false;
    }

    targetHandSize = Math.min(MAX_HAND_SIZE, targetHandSize);
    let drawCount = Math.max(0, targetHandSize - this.hand.length);

    while (drawCount > 0) {
      if (this.deck.length === 0) {
        break;
      }
      this.hand.push(this.deck.pop());
      drawCount -= 1;
    }

    this.sortHandCards();
  }

  drawExactCards(count) {
    let drawCount = Math.max(0, Math.min(count || 0, MAX_HAND_SIZE - this.hand.length));

    while (drawCount > 0) {
      if (this.deck.length === 0) {
        break;
      }
      this.hand.push(this.deck.pop());
      drawCount -= 1;
    }

    this.sortHandCards();
  }

  // 手牌展示顺序：金、木、水、火、土；同元素按点数从小到大。
  sortHandCards() {
    const elementOrder = {};

    ELEMENT_DISPLAY_ORDER.forEach(function(element, index) {
      elementOrder[element] = index;
    });

    this.hand.sort(function(a, b) {
      const elementDiff = elementOrder[a.element] - elementOrder[b.element];

      if (elementDiff !== 0) {
        return elementDiff;
      }

      return (a.serial || 0) - (b.serial || 0);
    });
  }

  // 响应当前页面的点击。
  handleTouch(point) {
    if (this.isResolving) {
      return;
    }

    if (this.state === 'playing' && !this.deckModalOpen && !this.relicModalOpen && !this.matchInfoModalOpen && this.relicButtonArea && hitRect(point, this.relicButtonArea)) {
      this.openRelicModal();
      this.draw();
      return;
    }

    for (let i = this.touchAreas.length - 1; i >= 0; i -= 1) {
      const area = this.touchAreas[i];
      if (hitRect(point, area)) {
        area.onTap();
        this.draw();
        return;
      }
    }
  }

  // 切换手牌选中状态。
  toggleCard(card) {
    const index = this.selectedIds.indexOf(card.id);
    if (index >= 0) {
      this.selectedIds.splice(index, 1);
      return;
    }

    if (this.selectedIds.length >= MAX_SELECTED_CARDS) {
      this.lastResultText = '最多只能选择 ' + MAX_SELECTED_CARDS + ' 张符牌';
      return;
    }

    this.selectedIds.push(card.id);
  }

  // 点击出牌后进行结算。
  playSelectedCards() {
    if (this.state !== 'playing' || this.isResolving) {
      return;
    }

    if (this.handsLeft <= 0) {
      this.lastResultText = '本小关出牌次数已用完';
      return;
    }

    if (this.selectedIds.length === 0) {
      this.lastResultText = '请先选择符牌';
      return;
    }

    if (this.selectedIds.length > MAX_SELECTED_CARDS) {
      this.lastResultText = '出牌最多只能选择 ' + MAX_SELECTED_CARDS + ' 张符牌';
      return;
    }

    const selectedCards = this.selectedIds.map(function(id) {
      return this.hand.find(function(card) {
        return card.id === id;
      });
    }, this).filter(function(card) {
      return !!card;
    });

    if (selectedCards.length === 0) {
      this.selectedIds = [];
      this.lastResultText = '选中的符牌已失效，请重新选择';
      return;
    }

    const result = evaluateHand(selectedCards, this.bossElement);
    const scoringCards = getScoringCards(selectedCards, result.type);
    const orderedPlayed = orderPlayedCardsForDisplay(selectedCards, scoringCards, result.type);

    let context = {
      result: result,
      selectedCards: orderedPlayed,
      playedCards: orderedPlayed,
      handType: result.type,
      handName: result.name,
      enchantElement: result.enchantElement,
      gainsTide: false,
      elementBonuses: this.elementBonuses,
      goldGain: 1,
      isFirstHandOfLevel: !this.firstHandPlayed
    };

    const timeline = createSettlementTimeline(orderedPlayed, context);
    const handSpirit = timeline.handSpirit;
    const spiritPoolBefore = this.currentScore;
    const spiritPoolAfter = spiritPoolBefore + handSpirit;
    const attackElement = context.enchantElement;
    let damageMultiplier = 1;

    if (attackElement && controlsElement(attackElement, this.bossElement)) {
      damageMultiplier = ELEMENT_ADVANTAGE_DAMAGE_MULTIPLIER;
    } else if (attackElement && isControlledBy(attackElement, this.bossElement)) {
      damageMultiplier = ELEMENT_DISADVANTAGE_DAMAGE_MULTIPLIER;
    }

    const finalScore = Math.ceil(spiritPoolAfter * damageMultiplier);
    let nextState = 'playing';
    const hpBefore = this.monsterHp;
    const shieldBefore = this.monsterShield;
    let remainingDamage = finalScore;

    if (result.type === 'two_control' && this.monsterShield > 0) {
      this.monsterShield = Math.max(0, this.monsterShield - Math.floor(this.monsterMaxShield * TWO_CONTROL_SHIELD_RATIO));
    }

    if (result.type === 'control_chain') {
      this.monsterHp = Math.max(0, this.monsterHp - remainingDamage);
    } else {
      const shieldDamage = Math.min(this.monsterShield, remainingDamage);
      this.monsterShield -= shieldDamage;
      remainingDamage -= shieldDamage;
      this.monsterHp = Math.max(0, this.monsterHp - remainingDamage);
    }

    const hpAfter = this.monsterHp;
    const shieldAfter = this.monsterShield;

    this.currentScore = spiritPoolAfter;
    this.monsterHp = hpAfter;
    this.visualMonsterHp = hpBefore;
    this.visualMonsterShield = shieldBefore;
    this.gold += context.goldGain;
    this.handsLeft -= 1;
    this.handTypeCounts[result.type] = (this.handTypeCounts[result.type] || 0) + 1;
    this.firstHandPlayed = true;
    this.lastResultText = result.name + ' 入池+' + formatAmount(handSpirit) + '，灵力池' + formatAmount(this.currentScore) + '，伤害' + finalScore;
    this.centerFeedback = null;
    this.isResolving = true;
    this.playedCards = orderedPlayed;

    this.hand = this.hand.filter(function(card) {
      return this.selectedIds.indexOf(card.id) < 0;
    }, this);
    this.selectedIds = [];

    if (context.gainsTide) {
      this.hasTide = true;
      this.pendingTideDraw = true;
    }

    this.drawCards();

    if (this.monsterHp <= 0) {
      if (this.level >= LEVEL_COUNT) {
        nextState = 'win';
      } else {
        nextState = 'shop';
      }
    } else if (this.handsLeft <= 0) {
      nextState = 'gameover';
    }

    this.startSettlementAnimation({
      result: result,
      context: context,
      timeline: timeline,
      finalScore: finalScore,
      hpBefore: hpBefore,
      hpAfter: hpAfter,
      shieldBefore: shieldBefore,
      shieldAfter: shieldAfter,
      nextState: nextState
    });
  }

  startSettlementAnimation(data) {
    const cardDuration = 560;
    const damageDuration = 880;
    const fadeDuration = 420;
    const scoreDuration = Math.max(cardDuration, data.timeline.steps.length * cardDuration);
    const damageStart = scoreDuration + 180;
    const endTime = damageStart + damageDuration + fadeDuration;

    this.settlementAnimation = {
      startTime: Date.now(),
      cardDuration: cardDuration,
      damageStart: damageStart,
      damageDuration: damageDuration,
      fadeDuration: fadeDuration,
      endTime: endTime,
      result: data.result,
      context: data.context,
      timeline: data.timeline,
      finalScore: data.finalScore,
      hpBefore: data.hpBefore,
      hpAfter: data.hpAfter,
      shieldBefore: data.shieldBefore,
      shieldAfter: data.shieldAfter,
      nextState: data.nextState,
      playedHammerSteps: {}
    };

    this.tickSettlementAnimation();
  }

  tickSettlementAnimation() {
    if (!this.settlementAnimation) {
      return;
    }

    const animation = this.settlementAnimation;
    const elapsed = Date.now() - animation.startTime;
    const hitStep = Math.floor(elapsed / animation.cardDuration);
    const hitTime = elapsed - hitStep * animation.cardDuration;

    if (hitStep >= 0 &&
      hitStep < animation.timeline.steps.length &&
      hitTime > animation.cardDuration * 0.24 &&
      animation.timeline.steps[hitStep].hasStatChange &&
      !animation.playedHammerSteps[hitStep]) {
      animation.playedHammerSteps[hitStep] = true;
      this.playHammerSound();
    }

    if (elapsed >= animation.damageStart) {
      const t = easeInOutCubic((elapsed - animation.damageStart) / animation.damageDuration);
      this.visualMonsterHp = Math.round(animation.hpBefore + (animation.hpAfter - animation.hpBefore) * t);
      this.visualMonsterShield = Math.round(animation.shieldBefore + (animation.shieldAfter - animation.shieldBefore) * t);
    }

    this.draw();

    if (elapsed >= animation.endTime) {
      this.finishSettlementAnimation();
      return;
    }

    requestGameFrame(function() {
      this.tickSettlementAnimation();
    }.bind(this));
  }

  finishSettlementAnimation() {
    const animation = this.settlementAnimation;

    this.isResolving = false;
    this.centerFeedback = null;
    this.settlementAnimation = null;
    this.visualMonsterHp = this.monsterHp;
    this.visualMonsterShield = this.monsterShield;
    this.playedCards = [];

    if (animation.nextState === 'shop') {
      this.enterShop();
    } else {
      this.state = animation.nextState;
    }

    this.draw();
  }

  // 弃掉选中牌并补牌。
  discardSelectedCards() {
    if (this.state !== 'playing' || this.isResolving) {
      return;
    }

    if (this.discardsLeft <= 0) {
      this.lastResultText = '本小关弃牌次数已用完';
      return;
    }

    if (this.selectedIds.length === 0) {
      this.lastResultText = '请选择要弃掉的符牌';
      return;
    }

    if (this.selectedIds.length > MAX_SELECTED_CARDS) {
      this.lastResultText = '弃牌最多只能选择 ' + MAX_SELECTED_CARDS + ' 张符牌';
      return;
    }

    const discardedCount = this.selectedIds.length;

    this.hand = this.hand.filter(function(card) {
      return this.selectedIds.indexOf(card.id) < 0;
    }, this);
    this.selectedIds = [];
    this.drawExactCards(discardedCount);
    this.discardsLeft -= 1;
    this.lastResultText = '已弃牌并补牌';
  }

  // 进入商店并随机展示三个摆件。
  enterShop() {
    const ownedIds = {};
    this.relics.forEach(function(relic) {
      ownedIds[relic.id] = true;
    });

    let pool = RELICS.filter(function(relic) {
      return !ownedIds[relic.id];
    });

    if (pool.length < 3) {
      pool = RELICS.slice();
    }

    this.shopItems = [];

    while (this.shopItems.length < 3 && pool.length > 0) {
      const index = Math.floor(Math.random() * pool.length);
      this.shopItems.push(pool.splice(index, 1)[0]);
    }

    this.state = 'shop';
  }

  // 尝试购买商店摆件。
  buyRelic(relic) {
    if (!relic || !relic.id) {
      this.lastResultText = '摆件数据异常';
      return;
    }

    if (this.gold < relic.price) {
      this.lastResultText = '金币不足';
      return;
    }

    this.gold -= relic.price;
    if (!this.relics.some(function(ownedRelic) {
      return ownedRelic.id === relic.id;
    })) {
      this.relics.push(relic);
    }
    this.nextLevel();
  }

  // 跳过商店或购买后进入下一关。
  nextLevel() {
    this.level += 1;
    this.state = 'playing';
    this.startLevel();
  }

  // 绘制圆角感按钮，此处用矩形保证小游戏兼容性。
  drawButton(label, x, y, w, h, fill, onTap, textColor) {
    const radius = Math.min(12, Math.floor(h * 0.35));

    fillRoundedRect(ctx, x, y, w, h, radius, fill);
    strokeRoundedRect(ctx, x, y, w, h, radius, '#2f2118', 2);
    ctx.fillStyle = textColor || '#fffaf0';
    ctx.font = gameFont(Math.max(12, Math.min(18, Math.floor(w / Math.max(3, label.length)))));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);
    this.touchAreas.push({ x: x, y: y, w: w, h: h, onTap: onTap });
  }

  // 主界面底部导航栏。
  drawHomeBottomNav(activeState) {
    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const navH = 64;
    const navY = layout.canvasHeight - layout.bottomSafeInset - navH;
    const buttonGap = 6;
    const sidePadding = 8;
    const buttonW = Math.floor((canvasWidth - sidePadding * 2 - buttonGap * (HOME_NAV_ITEMS.length - 1)) / HOME_NAV_ITEMS.length);
    const buttonH = 42;
    const buttonY = navY + 10;

    fillRoundedRect(ctx, 0, navY, canvasWidth, navH + layout.bottomSafeInset, 0, 'rgba(53, 37, 26, 0.86)');

    HOME_NAV_ITEMS.forEach(function(item, index) {
      const x = sidePadding + index * (buttonW + buttonGap);
      const isActive = item.state === activeState;

      this.drawButton(
        item.label,
        x,
        buttonY,
        buttonW,
        buttonH,
        isActive ? '#f2bb35' : '#7a5a35',
        function() {
          this.openHomeTab(item.state);
        }.bind(this),
        isActive ? '#2f2118' : '#fffaf0'
      );
    }, this);
  }

  // 绘制顶部状态栏。
  drawTopBar() {
    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const info = this.getLevelInfo();

    ctx.fillStyle = 'rgba(53, 37, 26, 0.8)';
    ctx.fillRect(0, 0, canvasWidth, layout.topBarBottom);
    ctx.fillStyle = '#fff5df';
    ctx.font = gameFont(18);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('第 ' + info.world + ' 关  ' + info.stage + ' / 3', canvasWidth / 2, layout.headerY + layout.headerHeight / 2);
    ctx.font = gameFont(18);
    ctx.textAlign = 'left';
    ctx.fillText('金币 ' + this.gold, 14, layout.headerY + layout.headerHeight / 2);
    this.drawButton('退出', canvasWidth - 78, layout.headerY + (layout.headerHeight - 28) / 2, 64, 28, '#7a3f35', function() {
      this.exitToStart();
    }.bind(this));
  }

  getSettlementDisplay() {
    const animation = this.settlementAnimation;

    if (!animation) {
      return null;
    }

    const elapsed = Date.now() - animation.startTime;
    let base = 0;
    let multiplier = BASE_MOMENTUM;
    let currentElementBonuses = Object.assign(createElementBonuses(), animation.timeline.initialElementBonuses || {});
    let activeIndex = -1;
    let activeProgress = 0;
    let activeStep = null;

    animation.timeline.steps.forEach(function(step, index) {
      const stepStart = index * animation.cardDuration;
      const stepProgress = (elapsed - stepStart) / animation.cardDuration;

      if (stepProgress >= 1) {
        base = step.scoreAfter;
        multiplier = step.multiplierAfter;
        currentElementBonuses = Object.assign(createElementBonuses(), step.elementBonusesAfter || currentElementBonuses);
        return;
      }

      if (stepProgress >= 0 && activeIndex < 0) {
        activeIndex = index;
        activeProgress = clamp(stepProgress, 0, 1);
        activeStep = step;
        base = step.scoreBefore;
        multiplier = step.multiplierBefore;
        currentElementBonuses = Object.assign(createElementBonuses(), step.elementBonusesBefore || currentElementBonuses);

        if (activeProgress > 0.22) {
          base += step.scoreGain;
          currentElementBonuses = Object.assign(createElementBonuses(), step.elementBonusesAfter || currentElementBonuses);
        }

      }
    });

    if (elapsed >= animation.damageStart) {
      base = animation.timeline.finalBase;
      multiplier = animation.timeline.finalMultiplier;
      currentElementBonuses = Object.assign(createElementBonuses(), animation.timeline.finalElementBonuses || currentElementBonuses);
    }

    return {
      elapsed: elapsed,
      base: base,
      multiplier: multiplier,
      currentElementBonuses: currentElementBonuses,
      activeIndex: activeIndex,
      activeStep: activeStep,
      activeProgress: activeProgress,
      damageProgress: clamp((elapsed - animation.damageStart) / animation.damageDuration, 0, 1),
      fadeProgress: clamp((elapsed - animation.damageStart - animation.damageDuration) / animation.fadeDuration, 0, 1)
    };
  }

  drawGameImage(key, x, y, w, h, alpha, crop) {
    const image = GAME_IMAGES[key];

    if (!image || !image.ready) {
      return false;
    }

    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    if (crop) {
      ctx.drawImage(image.chromaCanvas || image, crop.x, crop.y, crop.w, crop.h, x, y, w, h);
    } else {
      ctx.drawImage(image.chromaCanvas || image, x, y, w, h);
    }
    ctx.restore();
    return true;
  }

  drawBackground() {
    const layout = this.layout;

    ctx.fillStyle = '#f3dfba';
    ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight);

    if (this.drawGameImage('background', 0, 0, layout.canvasWidth, layout.canvasHeight, 1)) {
      ctx.fillStyle = 'rgba(243, 223, 186, 0.20)';
      ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight);
    }
  }

  drawFormulaWindows(settlementDisplayCached) {
    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const selectedCards = this.selectedIds.map(function(id) {
      return this.hand.find(function(card) {
        return card.id === id;
      });
    }, this).filter(function(card) {
      return !!card;
    });
    const canPreviewHand = selectedCards.length > 0 && selectedCards.length <= MAX_SELECTED_CARDS;
    const result = canPreviewHand ? evaluateHand(selectedCards, this.bossElement) : null;
    const settlementDisplay = settlementDisplayCached !== undefined
      ? settlementDisplayCached
      : this.getSettlementDisplay();
    const baseText = settlementDisplay
      ? String(Math.round(settlementDisplay.base))
      : '';
    const multiplierText = settlementDisplay
      ? String(formatMultiplier(settlementDisplay.multiplier))
      : '';
    const handName = settlementDisplay
      ? ''
      : (canPreviewHand ? result.name : '');
    const boxW = Math.max(42, Math.min(52, Math.floor(canvasWidth * 0.14)));
    const boxH = Math.max(30, Math.min(34, layout.calculationHeight - 12));
    const gap = Math.max(16, Math.floor(canvasWidth * 0.045));
    const totalW = boxW * 2 + gap;
    const x1 = Math.floor((canvasWidth - totalW) / 2);
    const x2 = x1 + boxW + gap;
    const y = layout.calculationY + Math.floor((layout.calculationHeight - boxH) / 2);

    ctx.fillStyle = selectedCards.length > 0 || settlementDisplay ? '#d9792b' : '#b98a55';
    ctx.font = gameFont(18);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(handName, x2 + boxW + Math.max(8, Math.floor(canvasWidth * 0.02)), y + boxH / 2);

    fillRoundedRect(ctx, x1, y, boxW, boxH, 8, '#fffaf0');
    fillRoundedRect(ctx, x2, y, boxW, boxH, 8, '#fffaf0');
    strokeRoundedRect(ctx, x1, y, boxW, boxH, 8, '#6b4f38', 2);
    strokeRoundedRect(ctx, x2, y, boxW, boxH, 8, '#6b4f38', 2);

    const labelFontSize = 14;
    const labelY = y - 1;
    ctx.fillStyle = '#d9792b';
    ctx.font = gameFont(labelFontSize);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('灵力', x1 + boxW / 2, labelY);
    ctx.fillText('灵势', x2 + boxW / 2, labelY);

    ctx.fillStyle = '#2f2118';
    ctx.font = gameFont(18);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(baseText, x1 + boxW / 2, y + boxH / 2);
    ctx.fillText(multiplierText, x2 + boxW / 2, y + boxH / 2);
    ctx.font = gameFont(24);
    ctx.fillText('x', canvasWidth / 2, y + boxH / 2);

    if (settlementDisplay &&
        settlementDisplay.activeStep &&
        settlementDisplay.activeStep.hasStatChange &&
        settlementDisplay.activeProgress > 0.24) {
      const spiritBadge = settlementDisplay.activeStep.spiritBadgeText ||
        (settlementDisplay.activeStep.scoreGain > 0
          ? '+' + formatAmount(settlementDisplay.activeStep.scoreGain)
          : '');
      const momentumBadge = settlementDisplay.activeStep.momentumGain
        ? '+' + formatAmount(settlementDisplay.activeStep.momentumGain)
        : '';
      const badgeFontSize = 36;
      const badgeY = y + boxH / 2;

      ctx.fillStyle = '#f2bb35';
      ctx.font = gameFont(badgeFontSize);

      if (spiritBadge) {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(spiritBadge, x1 - 4, badgeY);
      }

      if (momentumBadge) {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(momentumBadge, x2 + boxW + 4, badgeY);
      }
    }

  }

  drawMonster(settlementDisplayCached) {
    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const areaTop = layout.monsterY;
    const areaBottom = layout.monsterY + layout.monsterHeight;
    const hpBar = getHpBarLayout(layout);
    const hpW = hpBar.w;
    const hpH = hpBar.h;
    const hpX = hpBar.x;
    const hpY = hpBar.y;
    const stageTop = areaTop + MONSTER_LAYOUT.stageTopPadding;
    const stageBottom = areaBottom;
    const stageH = Math.max(MONSTER_LAYOUT.stageMinHeight, stageBottom - stageTop);
    const monsterH = Math.min(
      stageH - MONSTER_LAYOUT.monsterHeightInset,
      Math.max(MONSTER_LAYOUT.monsterMinHeight, Math.floor(stageH * MONSTER_LAYOUT.monsterHeightRatio))
    );
    const monsterW = Math.min(
      canvasWidth - MONSTER_LAYOUT.monsterHorizontalMargin,
      Math.max(MONSTER_LAYOUT.monsterMinWidth, Math.floor(monsterH * MONSTER_LAYOUT.monsterAspectRatio))
    );
    const monsterX = canvasWidth / 2 - monsterW / 2;
    const monsterVisualDownOffset = Math.floor(monsterH * MONSTER_LAYOUT.monsterVisualDownOffsetRatio);
    const monsterRenderY = clamp(
      stageTop + Math.floor((stageH - monsterH) * 0.52) + monsterVisualDownOffset,
      stageTop,
      Math.max(stageTop, stageBottom - monsterH)
    );
    const displayedHp = this.settlementAnimation ? this.visualMonsterHp : this.monsterHp;
    const displayedShield = this.settlementAnimation ? this.visualMonsterShield : this.monsterShield;
    const hpRate = this.monsterMaxHp > 0 ? displayedHp / this.monsterMaxHp : 0;
    const shieldRate = this.monsterMaxHp > 0 ? displayedShield / this.monsterMaxHp : 0;
    const settlementDisplay = settlementDisplayCached !== undefined
      ? settlementDisplayCached
      : this.getSettlementDisplay();
    const now = Date.now();
    const breath = Math.sin(now / 520) * 0.028;
    const damageShake = settlementDisplay && settlementDisplay.damageProgress > 0 && settlementDisplay.damageProgress < 0.65
      ? Math.sin(now / 28) * 4 * (1 - settlementDisplay.damageProgress)
      : 0;

    const bossW = monsterW * (1 + breath);
    const bossH = monsterH * (1 - breath * 0.55);
    const bossX = canvasWidth / 2 - bossW / 2 + damageShake;
    const bossY = clamp(
      monsterRenderY + (monsterH - bossH) / 2,
      stageTop,
      Math.max(stageTop, stageBottom - bossH)
    );
    const bossCrop = MONSTER_LAYOUT.catBossCrop;
    const bossImageSize = 1254;
    const croppedBossW = bossCrop ? bossW * bossCrop.w / bossImageSize : bossW;
    const croppedBossH = bossCrop ? bossH * bossCrop.h / bossImageSize : bossH;
    const croppedBossX = bossCrop ? canvasWidth / 2 - croppedBossW / 2 + damageShake : bossX;
    const croppedBossY = bossCrop ? bossY : bossY;

    if (!this.drawGameImage('catBoss', croppedBossX, croppedBossY, croppedBossW, croppedBossH, 1, bossCrop)) {
      fillRoundedRect(ctx, monsterX + damageShake, monsterRenderY, monsterW, monsterH, 20, '#4b3226');
      fillRoundedRect(ctx, monsterX + 18 + damageShake, monsterRenderY + 18, monsterW - 36, monsterH - 20, 16, '#8d5743');
      ctx.fillStyle = '#f6d77f';
      ctx.fillRect(canvasWidth / 2 - monsterW * 0.20 + damageShake, monsterRenderY + monsterH * 0.48, 14, 11);
      ctx.fillRect(canvasWidth / 2 + monsterW * 0.12 + damageShake, monsterRenderY + monsterH * 0.48, 14, 11);
      ctx.fillStyle = '#2f2118';
      ctx.font = gameFont(Math.max(14, Math.floor(monsterH * 0.18)));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('怪兽', canvasWidth / 2 + damageShake, monsterRenderY + monsterH * 0.24);
    }

    if (settlementDisplay && settlementDisplay.damageProgress > 0) {
      const slashT = settlementDisplay.damageProgress;
      const slashAlpha = clamp(1 - settlementDisplay.fadeProgress, 0, 1);
      const slashScale = 0.72 + easeOutBack(Math.min(slashT * 1.4, 1)) * 0.38;
      const slashW = monsterW * 1.36 * slashScale;
      const slashH = monsterH * 1.08 * slashScale;
      const slashCenterX = canvasWidth / 2 + damageShake * 0.35;
      const slashCenterY = bossY + bossH * 0.50;

      this.drawGameImage('slashEffect', slashCenterX - slashW / 2, slashCenterY - slashH / 2, slashW, slashH, slashAlpha);

      ctx.save();
      ctx.globalAlpha = slashAlpha;
      ctx.fillStyle = '#ffd84f';
      ctx.strokeStyle = '#7a3f35';
      ctx.lineWidth = 4;
      ctx.font = gameFont(Math.max(20, Math.floor(stageH * 0.20)));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const damageText = '-' + this.settlementAnimation.finalScore;
      const damageY = Math.max(stageTop + 14, slashCenterY - bossH * 0.42 - easeOutCubic(slashT) * 22);
      ctx.strokeText(damageText, canvasWidth / 2, damageY);
      ctx.fillText(damageText, canvasWidth / 2, damageY);
      ctx.restore();
    }

    const hpFillW = Math.floor(hpW * clamp(hpRate, 0, 1));
    const shieldFillW = Math.floor(hpW * clamp(shieldRate, 0, 1));
    const shieldX = hpX + hpW - shieldFillW;

    fillRoundedRect(ctx, hpX, hpY, hpW, hpH, 10, '#fff5df');
    if (hpFillW > 0) {
      fillRoundedRect(ctx, hpX, hpY, hpFillW, hpH, 10, '#c54a3f');
    }
    if (displayedShield > 0 && shieldFillW > 0) {
      fillRoundedRect(ctx, shieldX, hpY, shieldFillW, hpH, 10, '#6fb0d7');
    }
    strokeRoundedRect(ctx, hpX, hpY, hpW, hpH, 10, '#2f2118', 2);
    ctx.fillStyle = '#2f2118';
    ctx.font = gameFont(14);
    ctx.fillText(ELEMENT_LABELS[this.bossElement] + ' ' + displayedHp + '/' + this.monsterMaxHp + ' 护盾' + displayedShield, canvasWidth / 2, hpY + hpH / 2);
  }

  drawBattleSideButtons() {
    const layout = this.layout;
    const button = getBattleSideButtonLayout(layout);

    this.drawButton('设置', button.x, button.y, button.w, button.h, '#fffaf0', function() {
      this.openRelicModal();
    }.bind(this), '#2f2118');

    this.drawButton('牌型', button.x, button.y + button.h + button.gap, button.w, button.h, '#fffaf0', function() {
      this.openMatchInfoModal();
    }.bind(this), '#2f2118');
  }

  drawDeckPreviewStrip() {
    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const y = layout.deckPreviewY;
    const h = layout.deckPreviewHeight;
    const iconSize = Math.min(Math.floor(h * 0.68), Math.floor(canvasWidth * 0.12));
    const gap = Math.max(12, Math.floor((canvasWidth - iconSize * ELEMENT_DISPLAY_ORDER.length - 28) / (ELEMENT_DISPLAY_ORDER.length - 1)));
    const totalW = iconSize * ELEMENT_DISPLAY_ORDER.length + gap * (ELEMENT_DISPLAY_ORDER.length - 1);
    const startX = Math.floor((canvasWidth - totalW) / 2);
    const iconY = y + Math.floor((h - iconSize) / 2);

    fillRoundedRect(ctx, 0, y, canvasWidth, h, 0, 'rgba(255, 250, 240, 0.80)');
    ctx.strokeStyle = 'rgba(107, 79, 56, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.moveTo(0, y + h);
    ctx.lineTo(canvasWidth, y + h);
    ctx.stroke();

    ELEMENT_DISPLAY_ORDER.forEach(function(element, index) {
      const x = startX + index * (iconSize + gap);

      fillRoundedRect(ctx, x, iconY, iconSize, iconSize, 3, '#fffaf0');
      strokeRoundedRect(ctx, x, iconY, iconSize, iconSize, 3, '#c9c2b8', 2);
      drawElementSymbol(ctx, element, x + iconSize / 2, iconY + iconSize / 2, Math.floor(iconSize * 0.62), 0.92);
    });

    this.touchAreas.push({
      x: 0,
      y: y,
      w: canvasWidth,
      h: h,
      onTap: function() {
        this.openDeckModal();
      }.bind(this)
    });
  }

  drawDeckModal() {
    if (!this.deckModalOpen) {
      return;
    }

    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const canvasHeight = layout.canvasHeight;
    const modalW = Math.min(canvasWidth - 28, 340);
    const modalH = Math.min(canvasHeight - layout.topPadding - 36, 330);
    const modalX = Math.floor((canvasWidth - modalW) / 2);
    const modalY = Math.max(layout.topPadding + 18, Math.floor((canvasHeight - modalH) / 2));
    const rowH = Math.floor((modalH - 62) / 5);
    const grouped = {};

    ELEMENT_DISPLAY_ORDER.forEach(function(element) {
      grouped[element] = [];
    });

    this.deck.forEach(function(card) {
      if (grouped[card.element]) {
        grouped[card.element].push(card);
      }
    });

    ELEMENT_DISPLAY_ORDER.forEach(function(element) {
      grouped[element].sort(function(a, b) {
        return (a.serial || 0) - (b.serial || 0);
      });
    });

    ctx.fillStyle = 'rgba(47, 33, 24, 0.55)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    this.touchAreas.push({
      x: 0,
      y: 0,
      w: canvasWidth,
      h: canvasHeight,
      onTap: function() {
        this.deckModalOpen = false;
      }.bind(this)
    });

    fillRoundedRect(ctx, modalX, modalY, modalW, modalH, 18, '#fff5df');
    strokeRoundedRect(ctx, modalX, modalY, modalW, modalH, 18, '#2f2118', 3);
    this.touchAreas.push({
      x: modalX,
      y: modalY,
      w: modalW,
      h: modalH,
      onTap: function() {}
    });

    ctx.fillStyle = '#2f2118';
    ctx.font = gameFont(18);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('剩余牌库 ' + this.deck.length + ' 张', modalX + modalW / 2, modalY + 26);

    this.drawButton('×', modalX + modalW - 38, modalY + 10, 26, 26, '#7a3f35', function() {
      this.deckModalOpen = false;
    }.bind(this));

    ELEMENT_DISPLAY_ORDER.forEach(function(element, index) {
      const cards = grouped[element];
      const rowY = modalY + 50 + index * rowH;
      const labelX = modalX + 18;
      const cardX = modalX + 68;
      const slotW = Math.floor((modalW - 84) / 8);
      const cardW = Math.max(20, Math.min(24, slotW - 1));
      const cardH = 34;
      const cardsByNumber = {};
      const labelIcon = ELEMENT_ICONS[element];
      const labelIconSize = 24;

      cards.forEach(function(card) {
        cardsByNumber[card.serial] = card;
      });

      if (labelIcon && labelIcon.ready) {
        ctx.drawImage(labelIcon, labelX, rowY + Math.floor((rowH - labelIconSize) / 2), labelIconSize, labelIconSize);
      } else {
        ctx.fillStyle = ELEMENT_COLORS[element];
        ctx.beginPath();
        ctx.arc(labelX + labelIconSize / 2, rowY + rowH / 2, labelIconSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#2f2118';
      ctx.font = gameFont(12);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cards.length, labelX + labelIconSize / 2, rowY + rowH - 5);

      if (cards.length === 0) {
        ctx.fillStyle = '#8b7a67';
        ctx.font = gameFont(13);
        ctx.fillText('无', cardX, rowY + rowH / 2);
        return;
      }

      for (let serial = 1; serial <= 8; serial += 1) {
        const slotX = cardX + (serial - 1) * slotW;
        const slotY = rowY + Math.floor((rowH - cardH) / 2);
        const hasCard = !!cardsByNumber[serial];

        ctx.fillStyle = hasCard ? '#fffaf0' : 'rgba(107, 79, 56, 0.12)';
        ctx.strokeStyle = hasCard ? '#5d4937' : 'rgba(107, 79, 56, 0.35)';
        ctx.lineWidth = 1;
        fillRoundedRect(ctx, slotX, slotY, cardW, cardH, 6, ctx.fillStyle);
        strokeRoundedRect(ctx, slotX, slotY, cardW, cardH, 6, ctx.strokeStyle, 1);

        if (hasCard) {
          cardsByNumber[serial].displayPower = getCardPower(cardsByNumber[serial], this.elementBonuses);
          drawMiniDeckCard(ctx, cardsByNumber[serial], slotX, slotY, cardW, cardH);
        }
      }
    }, this);
  }

  drawRelicModal() {
    if (!this.relicModalOpen) {
      return;
    }

    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const canvasHeight = layout.canvasHeight;
    const modalW = Math.min(canvasWidth - 28, 340);
    const modalH = Math.min(canvasHeight - layout.topPadding - 36, 360);
    const modalX = Math.floor((canvasWidth - modalW) / 2);
    const modalY = Math.max(layout.topPadding + 18, Math.floor((canvasHeight - modalH) / 2));
    const listY = modalY + 50;
    const rowH = 34;
    const detailY = listY + RELICS.length * rowH + 12;
    const ownedIds = {};
    let selectedRelic = null;

    this.relics.forEach(function(relic) {
      ownedIds[relic.id] = true;
    });

    RELICS.forEach(function(relic) {
      if (relic.id === this.selectedRelicId) {
        selectedRelic = relic;
      }
    }, this);

    if (!selectedRelic && RELICS.length > 0) {
      selectedRelic = RELICS[0];
      this.selectedRelicId = selectedRelic.id;
    }

    ctx.fillStyle = 'rgba(47, 33, 24, 0.55)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    this.touchAreas.push({
      x: 0,
      y: 0,
      w: canvasWidth,
      h: canvasHeight,
      onTap: function() {
        this.relicModalOpen = false;
      }.bind(this)
    });

    fillRoundedRect(ctx, modalX, modalY, modalW, modalH, 18, '#fff5df');
    strokeRoundedRect(ctx, modalX, modalY, modalW, modalH, 18, '#2f2118', 3);
    this.touchAreas.push({
      x: modalX,
      y: modalY,
      w: modalW,
      h: modalH,
      onTap: function() {}
    });

    ctx.fillStyle = '#2f2118';
    ctx.font = gameFont(18);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('饰品', modalX + modalW / 2, modalY + 26);

    this.drawButton('×', modalX + modalW - 38, modalY + 10, 26, 26, '#7a3f35', function() {
      this.relicModalOpen = false;
    }.bind(this));

    RELICS.forEach(function(relic, index) {
      const rowY = listY + index * rowH;
      const isSelected = selectedRelic && selectedRelic.id === relic.id;
      const isOwned = !!ownedIds[relic.id];

      fillRoundedRect(ctx, modalX + 14, rowY, modalW - 28, rowH - 4, 8, isSelected ? '#ead3a7' : '#fffaf0');
      strokeRoundedRect(ctx, modalX + 14, rowY, modalW - 28, rowH - 4, 8, isSelected ? '#9b3d32' : '#d0b486', 1);

      ctx.fillStyle = '#2f2118';
      ctx.font = gameFont(15);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(relic.name, modalX + 26, rowY + (rowH - 4) / 2);

      ctx.fillStyle = isOwned ? '#536d47' : '#8b7a67';
      ctx.font = gameFont(13);
      ctx.textAlign = 'right';
      ctx.fillText(isOwned ? '已拥有' : '未拥有', modalX + modalW - 26, rowY + (rowH - 4) / 2);

      this.touchAreas.push({
        x: modalX + 14,
        y: rowY,
        w: modalW - 28,
        h: rowH - 4,
        onTap: function() {
          this.selectedRelicId = relic.id;
        }.bind(this)
      });
    }, this);

    if (!selectedRelic) {
      return;
    }

    fillRoundedRect(ctx, modalX + 14, detailY, modalW - 28, modalH - (detailY - modalY) - 14, 12, '#f8ead2');
    strokeRoundedRect(ctx, modalX + 14, detailY, modalW - 28, modalH - (detailY - modalY) - 14, 12, '#6b4f38', 2);

    ctx.fillStyle = '#2f2118';
    ctx.font = gameFont(17);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(selectedRelic.name, modalX + 28, detailY + 12);
    ctx.font = gameFont(13);
    ctx.fillStyle = '#6b4f38';
    ctx.fillText('价格：' + selectedRelic.price + ' 金币', modalX + 28, detailY + 38);
    ctx.fillText('状态：' + (ownedIds[selectedRelic.id] ? '已拥有' : '未拥有'), modalX + 128, detailY + 38);
    ctx.fillStyle = '#2f2118';
    ctx.fillText(selectedRelic.desc, modalX + 28, detailY + 64);
  }

  drawMatchInfoModal() {
    if (!this.matchInfoModalOpen) {
      return;
    }

    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const canvasHeight = layout.canvasHeight;
    const modalW = Math.min(canvasWidth - 28, 340);
    const rowH = 54;
    const listH = HAND_TYPES.length * rowH;
    const modalH = Math.min(canvasHeight - layout.topPadding - 24, Math.max(320, 56 + listH + 12));
    const modalX = Math.floor((canvasWidth - modalW) / 2);
    const modalY = Math.max(layout.topPadding + 12, Math.floor((canvasHeight - modalH) / 2));
    const rowY = modalY + 56;

    ctx.fillStyle = 'rgba(47, 33, 24, 0.55)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    this.touchAreas.push({
      x: 0,
      y: 0,
      w: canvasWidth,
      h: canvasHeight,
      onTap: function() {
        if (this.matchInfoExampleType) {
          this.matchInfoExampleType = null;
        } else {
          this.matchInfoModalOpen = false;
        }
      }.bind(this)
    });

    fillRoundedRect(ctx, modalX, modalY, modalW, modalH, 18, '#fff5df');
    strokeRoundedRect(ctx, modalX, modalY, modalW, modalH, 18, '#2f2118', 3);
    this.touchAreas.push({
      x: modalX,
      y: modalY,
      w: modalW,
      h: modalH,
      onTap: function() {}
    });

    ctx.fillStyle = '#2f2118';
    ctx.font = gameFont(18);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('比赛信息', modalX + modalW / 2, modalY + 26);

    ctx.font = gameFont(12);
    ctx.fillStyle = '#6b4f38';
    ctx.fillText('点击牌型一行可查看示例牌组', modalX + modalW / 2, modalY + 44);

    ctx.fillStyle = '#2f2118';
    ctx.font = gameFont(18);

    this.drawButton('×', modalX + modalW - 38, modalY + 10, 26, 26, '#7a3f35', function() {
      this.matchInfoModalOpen = false;
      this.matchInfoExampleType = null;
    }.bind(this));

    HAND_TYPES.forEach(function(handType, index) {
      const y = rowY + index * rowH;
      const count = this.handTypeCounts && this.handTypeCounts[handType.type] ? this.handTypeCounts[handType.type] : 0;

      fillRoundedRect(ctx, modalX + 14, y, modalW - 28, rowH - 4, 8, index % 2 === 0 ? '#fffaf0' : '#f8ead2');
      strokeRoundedRect(ctx, modalX + 14, y, modalW - 28, rowH - 4, 8, '#d0b486', 1);

      ctx.fillStyle = '#2f2118';
      ctx.font = gameFont(20);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(handType.name, modalX + 26, y + (rowH - 4) / 2);

      const effectText = handType.desc;
      const maxLineLength = 12;
      const effectLines = effectText.length > maxLineLength
        ? [effectText.slice(0, maxLineLength), effectText.slice(maxLineLength)]
        : [effectText];
      const effectStartY = y + 15;

      ctx.font = gameFont(13);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      effectLines.forEach(function(line, lineIndex) {
        ctx.fillText(line, modalX + modalW / 2 + 28, effectStartY + lineIndex * 16);
      });

      ctx.textAlign = 'right';
      ctx.fillText('# ' + count, modalX + modalW - 26, y + (rowH - 4) / 2);

      if (!this.matchInfoExampleType) {
        this.touchAreas.push({
          x: modalX + 14,
          y: y,
          w: modalW - 28,
          h: rowH - 4,
          onTap: function() {
            this.matchInfoExampleType = handType.type;
          }.bind(this)
        });
      }
    }, this);

    if (this.matchInfoExampleType) {
      this.drawHandTypeExamplePopover(canvasWidth, canvasHeight);
    }
  }

  drawHandTypeExamplePopover(canvasWidth, canvasHeight) {
    const handType = this.matchInfoExampleType;
    const cards = createHandTypeExampleCards(handType);
    let titleName = '牌型';

    HAND_TYPES.forEach(function(ht) {
      if (ht.type === handType) {
        titleName = ht.name;
      }
    });

    const exW = Math.min(canvasWidth - 32, 300);
    const cardCount = Math.max(1, cards.length);
    const cardGap = 6;
    const cardH = 86;
    const cardW = Math.min(48, Math.floor((exW - 28 - cardGap * (cardCount - 1)) / cardCount));
    const cardsRowW = cardW * cardCount + cardGap * (cardCount - 1);
    const exH = cardH + 100;
    const exX = Math.floor((canvasWidth - exW) / 2);
    const exY = Math.floor((canvasHeight - exH) / 2);

    ctx.fillStyle = 'rgba(30, 22, 18, 0.42)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    this.touchAreas.push({
      x: 0,
      y: 0,
      w: canvasWidth,
      h: canvasHeight,
      onTap: function() {
        this.matchInfoExampleType = null;
      }.bind(this)
    });

    fillRoundedRect(ctx, exX, exY, exW, exH, 14, '#fff5df');
    strokeRoundedRect(ctx, exX, exY, exW, exH, 14, '#2f2118', 2);

    this.touchAreas.push({
      x: exX,
      y: exY,
      w: exW,
      h: exH,
      onTap: function() {}
    });

    ctx.fillStyle = '#2f2118';
    ctx.font = gameFont(17);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleName + ' · 示例', canvasWidth / 2, exY + 24);

    const rowY = exY + 44;
    let cx = exX + Math.floor((exW - cardsRowW) / 2);

    cards.forEach(function(card) {
      drawPlayedCard(ctx, card, cx, rowY, cardW, cardH);
      cx += cardW + cardGap;
    });

    this.drawButton('知道了', exX + exW / 2 - 52, exY + exH - 42, 104, 34, '#536d47', function() {
      this.matchInfoExampleType = null;
    }.bind(this));
  }

  drawGoldenShards(centerX, centerY, radius, progress, seedText) {
    const t = clamp(progress, 0, 1);
    const alpha = Math.sin(t * Math.PI);
    let seed = 0;

    for (let i = 0; i < seedText.length; i += 1) {
      seed += seedText.charCodeAt(i) * (i + 3);
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    for (let i = 0; i < 18; i += 1) {
      const randomA = Math.sin(seed + i * 12.9898) * 43758.5453;
      const randomB = Math.sin(seed + i * 78.233) * 24634.6345;
      const angle = Math.PI * 2 * (i / 18) + (randomA - Math.floor(randomA)) * 0.55;
      const distance = radius * (0.28 + t * (0.70 + (randomB - Math.floor(randomB)) * 0.42));
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const size = 2.4 + (i % 4) * 0.8;

      ctx.fillStyle = i % 3 === 0 ? '#fff3a3' : (i % 3 === 1 ? '#f2bb35' : '#ffdf63');
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.55, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.55, y);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // 绘制出牌页面。
  drawPlaying() {
    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const settlementFrame = this.getSettlementDisplay();

    this.drawTopBar();
    this.drawMonster(settlementFrame);
    this.drawBattleSideButtons();
    this.drawFormulaWindows(settlementFrame);

    const playBoxY = layout.playAreaY;
    const playBoxH = Math.min(86, Math.max(64, layout.playAreaHeight));
    const playCardGap = 6;
    const sidePadding = Math.max(10, Math.floor(canvasWidth * 0.035));
    const diagramTop = layout.calculationY + Math.max(0, Math.floor(layout.calculationHeight * 0.05));
    const diagramBottom = layout.playAreaY + layout.playAreaHeight - Math.max(0, Math.floor(layout.playAreaHeight * 0.02));
    const diagramSize = Math.max(58, Math.min(
      diagramBottom - diagramTop,
      Math.floor(canvasWidth * 0.18)
    ));
    const diagramX = sidePadding;
    const diagramY = diagramTop + Math.floor((diagramBottom - diagramTop - diagramSize) / 2);
    const infoW = Math.max(64, Math.min(82, Math.floor(canvasWidth * 0.15)));
    const infoX = canvasWidth - sidePadding - infoW;
    const infoBoxH = Math.max(30, Math.min(38, Math.floor(playBoxH * 0.48)));
    const poolY = playBoxY + Math.floor((playBoxH - infoBoxH) / 2);
    const centerSafeLeft = diagramX + diagramSize + Math.max(8, Math.floor(canvasWidth * 0.02));
    const centerSafeRight = infoX - Math.max(8, Math.floor(canvasWidth * 0.02));
    const slotAreaW = Math.max(132, centerSafeRight - centerSafeLeft);
    const playCardW = Math.min(52, Math.floor((slotAreaW - playCardGap * (MAX_SELECTED_CARDS - 1)) / MAX_SELECTED_CARDS));
    const playCardH = Math.min(playBoxH - 14, Math.floor(playCardW * 1.42));
    const playSlotsW = playCardW * MAX_SELECTED_CARDS + playCardGap * (MAX_SELECTED_CARDS - 1);
    const centeredSlotX = Math.floor((canvasWidth - playSlotsW) / 2);
    const minSlotX = centerSafeLeft;
    const maxSlotX = centerSafeRight - playSlotsW;
    const playSlotX = clamp(centeredSlotX, minSlotX, Math.max(minSlotX, maxSlotX));
    const playSlotY = playBoxY + Math.floor((playBoxH - playCardH) / 2);
    const settlementDisplay = settlementFrame;
    const displayElementBonuses = settlementDisplay && settlementDisplay.currentElementBonuses
      ? settlementDisplay.currentElementBonuses
      : this.elementBonuses;
    const activeCard = settlementDisplay && this.settlementAnimation && settlementDisplay.activeIndex >= 0
      ? this.settlementAnimation.timeline.steps[settlementDisplay.activeIndex].card
      : null;

    drawFiveElementDiagram(ctx, diagramX, diagramY, diagramSize);

    const poolLabelFontSize = 14;
    const poolLabelY = poolY - 1;

    fillRoundedRect(ctx, infoX, poolY, infoW, infoBoxH, 8, '#fffaf0');
    strokeRoundedRect(ctx, infoX, poolY, infoW, infoBoxH, 8, '#6b4f38', 2);
    ctx.fillStyle = '#2f2118';
    ctx.font = gameFont(18);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(formatAmount(this.currentScore), infoX + infoW / 2, poolY + infoBoxH / 2);

    ctx.fillStyle = '#c74334';
    ctx.font = gameFont(poolLabelFontSize);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('灵力池', infoX + infoW / 2, poolLabelY);

    fillRoundedRect(ctx, playSlotX - 6, playSlotY - 6, playSlotsW + 12, playCardH + 12, 14, '#ead3a7');
    strokeRoundedRect(ctx, playSlotX - 6, playSlotY - 6, playSlotsW + 12, playCardH + 12, 14, '#6b4f38', 1);

    for (let slotIndex = 0; slotIndex < MAX_SELECTED_CARDS; slotIndex += 1) {
      const slotX = playSlotX + slotIndex * (playCardW + playCardGap);

      fillRoundedRect(ctx, slotX, playSlotY, playCardW, playCardH, 8, 'rgba(255, 250, 240, 0.58)');
      strokeRoundedRect(ctx, slotX, playSlotY, playCardW, playCardH, 8, 'rgba(107, 79, 56, 0.55)', 2);

      if (this.playedCards[slotIndex]) {
        const card = this.playedCards[slotIndex];
        const isActive = activeCard && activeCard.id === card.id;
        const activeStep = isActive ? settlementDisplay.activeStep : null;
        const hasStatChange = activeStep && activeStep.hasStatChange;
        const pop = isActive ? easeOutBack(Math.min(settlementDisplay.activeProgress * 2.6, 1)) : 0;
        const hitPulse = isActive && hasStatChange && settlementDisplay.activeProgress > 0.24 && settlementDisplay.activeProgress < 0.62
          ? Math.sin((settlementDisplay.activeProgress - 0.24) / 0.38 * Math.PI)
          : 0;
        const shake = hitPulse > 0 ? Math.sin(Date.now() / 18 + slotIndex * 1.7) * 4 * hitPulse : 0;
        const scale = 1 + pop * 0.18 - hitPulse * 0.04;
        const drawW = playCardW * scale;
        const drawH = playCardH * scale;
        const drawX = slotX + (playCardW - drawW) / 2 + shake;
        const drawY = playSlotY + (playCardH - drawH) / 2 - pop * 13 + hitPulse * 4;

        if (isActive) {
          ctx.save();
          ctx.globalAlpha = 0.72;
          ctx.strokeStyle = '#f2bb35';
          ctx.lineWidth = 4;
          roundedRectPath(ctx, drawX - 4, drawY - 4, drawW + 8, drawH + 8, 10);
          ctx.stroke();
          ctx.restore();
        }

        card.displayPower = getCardPower(card, displayElementBonuses);
        drawPlayedCard(ctx, card, drawX, drawY, drawW, drawH);

        if (isActive && hitPulse > 0) {
          this.drawGoldenShards(
            slotX + playCardW / 2,
            playSlotY + playCardH / 2,
            Math.max(drawW, drawH),
            (settlementDisplay.activeProgress - 0.24) / 0.38,
            card.id
          );
        }
      }
    }

    const cardW = layout.handCardWidth;
    const cardH = layout.handCardHeight;
    const visibleHandCount = Math.min(MAX_HAND_SIZE, Math.max(this.hand.length, INITIAL_HAND_SIZE));
    const cardsWidth = cardW * visibleHandCount + layout.handCardGap * Math.max(0, visibleHandCount - 1);
    const startX = Math.max(14, Math.floor((canvasWidth - cardsWidth) / 2));
    const cardY = layout.handCardsY + Math.max(8, Math.floor((layout.handCardsHeight - cardH) / 2));

    this.drawDeckPreviewStrip();

    ctx.fillStyle = 'rgba(213, 186, 136, 0.72)';
    ctx.fillRect(0, layout.handCardsY, canvasWidth, layout.canvasHeight - layout.handCardsY);
    ctx.strokeStyle = '#6b4f38';
    ctx.strokeRect(0, layout.handCardsY, canvasWidth, 1);

    this.hand.forEach(function(card, index) {
      const x = startX + index * (cardW + layout.handCardGap);
      const selectedIndex = this.selectedIds.indexOf(card.id);
      const selected = selectedIndex >= 0;
      const selectedOrder = selected ? selectedIndex + 1 : 0;

      card.displayPower = getCardPower(card, this.elementBonuses);
      drawCard(ctx, card, x, cardY, selected, cardW, cardH, selectedOrder);
      this.touchAreas.push({
        x: card.renderX,
        y: card.renderY,
        w: card.renderW,
        h: card.renderH,
        onTap: function() {
          this.toggleCard(card);
        }.bind(this)
      });
    }, this);

    const buttonH = Math.max(38, Math.min(48, Math.floor(layout.actionButtonsHeight * 0.68)));
    const buttonY = layout.actionButtonsY + Math.floor((layout.actionButtonsHeight - buttonH) / 2);
    const actionSidePadding = Math.max(12, Math.floor(canvasWidth * 0.045));
    const deckButtonW = Math.max(48, Math.floor(canvasWidth * 0.16));
    const mainGap = Math.max(20, Math.floor(canvasWidth * 0.06));
    const mainW = Math.floor((canvasWidth - actionSidePadding * 2 - deckButtonW - mainGap * 2) / 2);
    let x = actionSidePadding;

    this.drawButton('出牌x' + this.handsLeft, x, buttonY, mainW, buttonH, '#9b3d32', function() {
      this.playSelectedCards();
    }.bind(this));
    x += mainW + mainGap;
    this.drawButton('弃牌x' + this.discardsLeft, x, buttonY, mainW, buttonH, '#536d47', function() {
      this.discardSelectedCards();
    }.bind(this));
    x += mainW + mainGap;
    this.drawButton('牌库' + this.deck.length, x, buttonY, deckButtonW, buttonH, '#2f7fb3', function() {
      this.openDeckModal();
    }.bind(this));
  }

  // 绘制开始页面。
  drawStart() {
    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const canvasHeight = layout.canvasHeight;

    ctx.fillStyle = '#d85b44';
    ctx.font = gameFont(40);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('灵猫符牌', canvasWidth / 2, Math.max(layout.topPadding + 40, canvasHeight * 0.28));

    ctx.font = gameFont(15);
    ctx.fillStyle = '#d85b44';
    this.drawButton('开始游戏', canvasWidth / 2 - 80, canvasHeight * 0.55, 160, 46, '#d85b44', function() {
      this.restart();
    }.bind(this));
    this.drawHomeBottomNav('start');
  }

  // 绘制主界面底部导航的占位页面。
  drawHomePlaceholder(title, desc, activeState) {
    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const canvasHeight = layout.canvasHeight;

    ctx.fillStyle = '#2f2118';
    ctx.font = gameFont(34);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, canvasWidth / 2, Math.max(layout.topPadding + 56, canvasHeight * 0.30));

    ctx.fillStyle = '#6b4f38';
    ctx.font = gameFont(16);
    ctx.fillText(desc, canvasWidth / 2, Math.max(layout.topPadding + 106, canvasHeight * 0.40));

    this.drawHomeBottomNav(activeState);
  }

  // 绘制商店页面。
  drawShop() {
    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const shopTitleY = layout.topPadding;

    // 背景沿用 draw() 中的主战场底图，不再铺纯色盖住。
    ctx.fillStyle = '#2f2118';
    ctx.font = gameFont(24);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('灵猫摆件铺', canvasWidth / 2, shopTitleY);

    ctx.font = gameFont(16);
    ctx.fillText('金币 ' + this.gold + '    已通过第 ' + this.level + ' 关', canvasWidth / 2, shopTitleY + 34);

    this.shopItems.forEach(function(relic, index) {
      const x = 20;
      const y = shopTitleY + 76 + index * 126;
      const w = canvasWidth - 40;
      const h = 104;

      fillRoundedRect(ctx, x, y, w, h, 14, '#fff5df');
      strokeRoundedRect(ctx, x, y, w, h, 14, '#6b4f38', 2);

      ctx.fillStyle = '#2f2118';
      ctx.font = gameFont(20);
      ctx.textAlign = 'left';
      ctx.fillText(relic.name, x + 16, y + 26);

      ctx.font = gameFont(14);
      ctx.fillStyle = '#6b4f38';
      ctx.fillText(relic.desc, x + 16, y + 54);
      ctx.fillText('价格：' + relic.price + ' 金币', x + 16, y + 80);

      this.drawButton('购买', x + w - 92, y + 34, 72, 42, '#9b3d32', function() {
        this.buyRelic(relic);
      }.bind(this));
    }, this);

    ctx.fillStyle = '#6b4f38';
    ctx.font = gameFont(14);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.lastResultText, canvasWidth / 2, layout.actionButtonsY - 18);

    this.drawButton('跳过', canvasWidth / 2 - 70, layout.actionButtonsY + 15, 140, 42, '#536d47', function() {
      this.nextLevel();
    }.bind(this));
  }

  // 绘制胜利页面。
  drawWin() {
    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const canvasHeight = layout.canvasHeight;

    ctx.fillStyle = '#35251a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#fff5df';
    ctx.font = gameFont(28);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('三大关通关', canvasWidth / 2, Math.max(layout.topPadding + 60, canvasHeight * 0.32));
    ctx.font = gameFont(16);
    ctx.fillText('灵猫符牌今日大吉', canvasWidth / 2, Math.max(layout.topPadding + 110, canvasHeight * 0.42));
    this.drawButton('重新开始', canvasWidth / 2 - 80, canvasHeight * 0.55, 160, 46, '#9b3d32', function() {
      this.restart();
    }.bind(this));
  }

  // 绘制失败页面（版式与主界面开始页一致，沿用 drawBackground 底图）。
  drawGameOver() {
    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const canvasHeight = layout.canvasHeight;

    ctx.fillStyle = '#d85b44';
    ctx.font = gameFont(40);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('挑战失败', canvasWidth / 2, Math.max(layout.topPadding + 40, canvasHeight * 0.28));

    ctx.font = gameFont(15);
    ctx.fillStyle = '#d85b44';
    ctx.fillText('怪兽血量 ' + this.monsterHp + '/' + this.monsterMaxHp, canvasWidth / 2, Math.max(layout.topPadding + 90, canvasHeight * 0.38));
    this.drawButton('重新开始', canvasWidth / 2 - 80, canvasHeight * 0.55, 160, 46, '#d85b44', function() {
      this.restart();
    }.bind(this));
  }

  // 绘制本次出牌结算提示。
  drawCenterFeedback() {
    if (!this.centerFeedback) {
      return;
    }

    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const canvasHeight = layout.canvasHeight;
    const boxW = Math.min(canvasWidth - 48, 260);
    const boxH = 106;
    const x = (canvasWidth - boxW) / 2;
    const y = canvasHeight / 2 - boxH / 2;

    fillRoundedRect(ctx, x, y, boxW, boxH, 18, 'rgba(47, 33, 24, 0.88)');
    strokeRoundedRect(ctx, x, y, boxW, boxH, 18, '#f2bb35', 3);

    ctx.fillStyle = '#fff5df';
    ctx.font = gameFont(26);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.centerFeedback.handName, canvasWidth / 2, y + 38);

    ctx.fillStyle = '#f2bb35';
    ctx.font = gameFont(24);
    ctx.fillText('+' + this.centerFeedback.score + ' 分', canvasWidth / 2, y + 74);
  }

  // 根据 state 绘制完整画面。
  draw() {
    this.calculateLayout(false);
    this.touchAreas = [];
    this.relicButtonArea = null;
    this.drawBackground();

    if (this.state === 'start') {
      this.drawStart();
    } else if (this.state === 'codex') {
      this.drawHomePlaceholder('图鉴', '这里将展示已收集的卡牌、元素与敌人信息', 'codex');
    } else if (this.state === 'hand_upgrade') {
      this.drawHomePlaceholder('牌型升级', '这里将用于升级牌型与调整成长路线', 'hand_upgrade');
    } else if (this.state === 'cat_home') {
      this.drawHomePlaceholder('猫窝', '这里将放置灵猫养成与饰品展示内容', 'cat_home');
    } else if (this.state === 'summon') {
      this.drawHomePlaceholder('召唤', '这里将用于召唤新灵猫或获得新道具', 'summon');
    } else if (this.state === 'playing') {
      this.drawPlaying();
    } else if (this.state === 'shop') {
      this.drawShop();
    } else if (this.state === 'win') {
      this.drawWin();
    } else if (this.state === 'gameover') {
      this.drawGameOver();
    }

    this.drawCenterFeedback();
    this.drawDeckModal();
    this.drawRelicModal();
    this.drawMatchInfoModal();
  }
}

new Game();
