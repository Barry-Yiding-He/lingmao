// 灵猫符牌 - 微信小游戏最小可运行版本

const ELEMENTS = ['fire', 'water', 'wood', 'metal', 'earth'];
const ELEMENT_DISPLAY_ORDER = ['metal', 'wood', 'water', 'fire', 'earth'];

const ELEMENT_LABELS = {
  fire: '火',
  water: '水',
  wood: '木',
  metal: '金',
  earth: '土'
};

const ELEMENT_COLORS = {
  fire: '#d85b44',
  water: '#3f83c9',
  wood: '#4d9a57',
  metal: '#b68b32',
  earth: '#8b6b4a'
};

const GAME_FONT_PATH = 'assets/ZCOOLKuaiLe-Regular.ttf';
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

const ELEMENT_ICON_PATHS = {
  fire: 'assets/element-fire.png',
  water: 'assets/element-water.png',
  wood: 'assets/element-wood.png',
  metal: 'assets/element-metal.png',
  earth: 'assets/element-earth.png'
};

const STAGES_PER_WORLD = 3;
const WORLD_COUNT = 3;
const LEVEL_COUNT = STAGES_PER_WORLD * WORLD_COUNT;
const LEVEL_HP = [
  300, 300, 300,
  450, 450, 450,
  600, 600, 600
];

const HAND_TYPES = [
  { type: 'spirit_straight', name: '灵脉符', baseScore: 100, multiplier: 6 },
  { type: 'same_element', name: '同源符', baseScore: 50, multiplier: 4 },
  { type: 'straight', name: '五连符', baseScore: 60, multiplier: 3 },
  { type: 'triple', name: '三重符', baseScore: 40, multiplier: 3 },
  { type: 'pair', name: '对符', baseScore: 20, multiplier: 2 },
  { type: 'single', name: '单符', baseScore: 10, multiplier: 1 }
];

function makeExampleCard(element, number, index) {
  return {
    id: 'example_' + element + '_' + number + '_' + index,
    element: element,
    number: number
  };
}

// 比赛信息「牌型示例」用的一组符牌（与 evaluateHand 判定一致）。
function createHandTypeExampleCards(handType) {
  if (handType === 'spirit_straight') {
    return [1, 2, 3, 4, 5].map(function(n, i) {
      return makeExampleCard('wood', n, i);
    });
  }

  if (handType === 'same_element') {
    return [1, 3, 5, 7, 9].map(function(n, i) {
      return makeExampleCard('metal', n, i);
    });
  }

  if (handType === 'straight') {
    return [
      makeExampleCard('water', 3, 0),
      makeExampleCard('wood', 4, 1),
      makeExampleCard('fire', 5, 2),
      makeExampleCard('metal', 6, 3),
      makeExampleCard('earth', 7, 4)
    ];
  }

  if (handType === 'triple') {
    return [
      makeExampleCard('fire', 8, 0),
      makeExampleCard('water', 8, 1),
      makeExampleCard('wood', 8, 2),
      makeExampleCard('metal', 2, 3),
      makeExampleCard('earth', 4, 4)
    ];
  }

  if (handType === 'pair') {
    return [
      makeExampleCard('fire', 6, 0),
      makeExampleCard('water', 6, 1),
      makeExampleCard('wood', 2, 2),
      makeExampleCard('metal', 4, 3),
      makeExampleCard('earth', 5, 4)
    ];
  }

  return [makeExampleCard('fire', 9, 0)];
}

const RELICS = [
  {
    id: 'fire_tail',
    name: '火尾猫',
    price: 6,
    desc: '每张火牌 +5 加分'
  },
  {
    id: 'water_mirror',
    name: '水镜猫',
    price: 7,
    desc: '每张水牌 倍率 +0.2'
  },
  {
    id: 'orange_cat',
    name: '橘猫',
    price: 8,
    desc: '每张 7 倍率 +0.5'
  },
  {
    id: 'black_cat',
    name: '黑猫',
    price: 9,
    desc: '每关首次出牌 倍率 x2'
  },
  {
    id: 'wealth_cat',
    name: '招财猫',
    price: 6,
    desc: '打出对符 金币 +2'
  }
];

const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');
const systemInfo = wx.getSystemInfoSync();
const ELEMENT_ICONS = {};
const GAME_IMAGES = {};

const GAME_IMAGE_PATHS = {
  background: 'assets/battle-background.png',
  catBoss: 'assets/cat-boss-key.png',
  slashEffect: 'assets/slash-effect-key.png'
};

const HAMMER_SOUND_SRC = 'data:audio/wav;base64,UklGRpQDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YXADAAAAANgSXiMYMDA4jTvSOj43bzIdLs4rnSwGMd44WUMwT9xa02TMa+1u8W0qaXBh/1c5TnJFuT6sOmY5fToYPRpATkKfQkVA4TqPMtwnrRscD0YDH/lP8RjsUely6KvoDOmu6NfmGuNo3Q3Wps0DxQa9fbYDsumvKLBqshm2d7q/vkfCmMSCxR/FzMMbwrTAPcA5wfvDkMjGzi/WN9475qbtAPQI+bf8QP8EAX8CNgSbBvwJeg79E0Aa1SBBJwYtvDEgNR43zjd0N3A2LjUUNHIzdTMfNE01uTYION044jjcN7I1cTJILoEpdSSAH+wa7xadE+oQrA6lDI8KJAgyBZwBY/2k+JXzeu6d6UDlleG23qLcQNti2s/ZT9mv2M/XotY11afTKNLs0CfQAdCT0N/R1NNO1h7ZEtz53q/hIORJ5jnoDerr6/jtVPAW80H2zPmd/Y8BeQUwCZQMjA8SEiwU7BVtF9AYMRqmGzkd6B6mIFoi5yMuJRUmiSaBJgMmHSXnI3wi+CBzH/wdmxxKG/4ZpRgqF3kVhBNGEcAO/wsWCRsGKQNVALH9RvsV+Rn3RfWK89nxJPBj7pfsxOr36EHnsuVe5FHjlOIn4gfiKOJ84vXig+Md5LzkYOUO5s7mrOey6OrpWev/7Nfu2PD08h71R/dj+Wr7WP0u/+8AowJRBAEGtwd0CTYL9wysDkwQyxEgE0MUMhXtFXcW1xYVFzgXRxdGFzYXFhfhFpIWIhaMFcsU3xPJEo0RMxDCDkMNvgs5CrgIPAfFBVEE2wJhAd//Vv7G/DT7o/kb+KT2Q/X+89jy1PHw8Cvwgu/v7nHuBO6n7VztJO0D7fzsE+1K7aXtIe6/7nnvTPA08SryLPM19ET1WfZz95X4v/nz+jL8ef3H/hoAbAG6Av8DNwVdBnIHcwhgCTwKBgvBC20MCw2bDRsOiQ7jDiYPUA9fD1QPLg/vDpgOLQ6vDSMNiQzjCzILdwqxCd8IAQgXByIGIgUbBA0D/QHtAOD/2v7b/eX8+fsY+0D6c/mu+PT3RPef9gb2fPUD9Zv0RvQG9NrzwvO+883z7PMc9Fn0pfT99GL10/VR9tz2dPcY+Mn4g/lH+hL74vu1/In9Xf4v//7/yQCRAVQCEgPMA4AELQXTBXAGAgeJBwIIbgjLCBkJWAmICaoJ';

const HAMMER_SOUND_FILE = 'assets/hammer-hit.wav';

const MONSTER_LAYOUT = {
  hpBottomPadding: 2,
  stageTopPadding: 4,
  stageToHpGap: 2,
  stageMinHeight: 72,
  monsterMinHeight: 58,
  monsterHeightRatio: 0.94,
  monsterHeightInset: 2,
  monsterHorizontalMargin: 72,
  monsterMinWidth: 108,
  monsterAspectRatio: 1.36,
  monsterToHpGap: 0,
  monsterVisualDownOffsetRatio: 0.12,
  monsterBottomClearance: 0,
  hpWidthMax: 320,
  hpHorizontalPadding: 42,
  hpHeight: 22
};

canvas.width = systemInfo.windowWidth;
canvas.height = systemInfo.windowHeight;

function createLevelDeck() {
  const deck = [];

  ELEMENTS.forEach(function(element) {
    for (let number = 1; number <= 10; number += 1) {
      deck.push({
        id: element + '_' + number + '_' + Date.now() + '_' + Math.random(),
        number: number,
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

function createHandTypeCounts() {
  const counts = {};

  HAND_TYPES.forEach(function(handType) {
    counts[handType.type] = 0;
  });

  return counts;
}

// 判断牌型，并返回基础分和倍率。
function evaluateHand(cards) {
  if (!cards || cards.length === 0) {
    return { type: 'none', name: '无符', baseScore: 0, multiplier: 0 };
  }

  const numbers = cards.map(function(card) {
    return card.number;
  }).sort(function(a, b) {
    return a - b;
  });
  const sameElement = cards.every(function(card) {
    return card.element === cards[0].element;
  });
  const counts = {};

  numbers.forEach(function(number) {
    counts[number] = (counts[number] || 0) + 1;
  });

  const hasCount = function(count) {
    return Object.keys(counts).some(function(key) {
      return counts[key] === count;
    });
  };

  const isFiveStraight = cards.length === 5 && numbers.every(function(number, index) {
    return index === 0 || number === numbers[index - 1] + 1;
  });

  if (cards.length === 5 && isFiveStraight && sameElement) {
    return { type: 'spirit_straight', name: '灵脉符', baseScore: 100, multiplier: 6 };
  }

  if (cards.length === 5 && sameElement) {
    return { type: 'same_element', name: '同源符', baseScore: 50, multiplier: 4 };
  }

  if (cards.length === 5 && isFiveStraight) {
    return { type: 'straight', name: '五连符', baseScore: 60, multiplier: 3 };
  }

  if (cards.length >= 3 && hasCount(3)) {
    return { type: 'triple', name: '三重符', baseScore: 40, multiplier: 3 };
  }

  if (cards.length >= 2 && hasCount(2)) {
    return { type: 'pair', name: '对符', baseScore: 20, multiplier: 2 };
  }

  return { type: 'single', name: '单符', baseScore: 10, multiplier: 1 };
}

function getScoringCards(cards, handType) {
  if (!cards || cards.length === 0) {
    return [];
  }

  if (handType === 'spirit_straight' || handType === 'same_element' || handType === 'straight') {
    return cards.slice();
  }

  // 单符：仅最高点数的一张参与底分与结算（多张时其余为废牌）。
  if (handType === 'single') {
    let best = cards[0];
    cards.forEach(function(card) {
      if (card.number > best.number) {
        best = card;
      }
    });
    return [best];
  }

  const groups = {};

  cards.forEach(function(card) {
    if (!groups[card.number]) {
      groups[card.number] = [];
    }
    groups[card.number].push(card);
  });

  const numbers = Object.keys(groups).map(function(numberText) {
    return Number(numberText);
  }).sort(function(a, b) {
    return b - a;
  });

  if (handType === 'triple') {
    for (let i = 0; i < numbers.length; i += 1) {
      const group = groups[numbers[i]];
      if (group.length >= 3) {
        return group.slice(0, 3);
      }
    }
  }

  if (handType === 'pair') {
    for (let i = 0; i < numbers.length; i += 1) {
      const group = groups[numbers[i]];
      if (group.length >= 2) {
        return group.slice(0, 2);
      }
    }
  }

  return cards.slice();
}

function orderPlayedCardsForDisplay(playedCards, scoringCards, handType) {
  const scoringIds = {};
  const orderedScoringCards = scoringCards.slice();

  scoringCards.forEach(function(card) {
    scoringIds[card.id] = true;
  });

  if (handType === 'straight' || handType === 'spirit_straight' || handType === 'same_element') {
    orderedScoringCards.sort(function(a, b) {
      return a.number - b.number;
    });
  }

  return orderedScoringCards.concat(playedCards.filter(function(card) {
    return !scoringIds[card.id];
  }));
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

function createSettlementTimeline(scoringCards, context, relics) {
  let base = context.baseScore;
  let multiplier = context.rawMultiplier || context.multiplier;
  const steps = scoringCards.map(function(card) {
    const relicEvents = getCardRelicEvents(card, context, relics);
    const relicAffectsStats = relicEvents.some(function(event) {
      return (event.stat === 'base' && event.amount) || (event.stat === 'multiplier' && event.amount);
    });
    const step = {
      card: card,
      scoreBefore: base,
      multiplierBefore: multiplier,
      scoreGain: card.number,
      relicEvents: relicEvents,
      hasStatChange: card.number > 0 || relicAffectsStats
    };

    base += card.number;
    relicEvents.forEach(function(event) {
      if (event.stat === 'base') {
        base += event.amount;
      }
      if (event.stat === 'multiplier') {
        multiplier += event.amount;
      }
    });

    step.scoreAfter = base;
    step.multiplierAfter = multiplier;
    return step;
  });

  return {
    steps: steps,
    finalBase: context.baseScore + context.faceTotal + context.bonusScore,
    finalMultiplier: context.multiplier
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

// 绘制单张符牌。
function drawCard(drawCtx, card, x, y, selected, cardWidth, cardHeight) {
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
  drawCtx.fillText(card.number, x + 6, cardY + 5);

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
  drawCtx.fillText(card.number, x + w - 3, y + 2);
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
  drawCtx.fillText(card.number, x + 5, y + 4);

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
    this.currentScore = 0;
    this.handsLeft = 4;
    this.discardsLeft = 4;
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
    this.hammerAudio = null;
    this.ambientAnimationRunning = false;
    this.firstHandPlayed = false;
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

    const topPadding = safeArea
      ? Math.max(safeTop, menuBottom || safeTop) + 12
      : (menuBottom ? menuBottom + 12 : 32);
    const bottomPadding = 10;
    const headerHeight = 34;
    const hpBarHeight = MONSTER_LAYOUT.hpHeight;
    const calculationHeight = 46;
    const actionButtonsHeight = 62;
    let playAreaHeight = 92;
    let handCardsHeight = 150;

    const oldHandAreaTop = canvasHeight - bottomSafeInset - handCardsHeight - bottomPadding;
    const oldActionButtonsY = oldHandAreaTop - actionButtonsHeight - 8;
    const oldPlayAreaBottom = oldActionButtonsY - 8;
    const oldPlayAreaY = oldPlayAreaBottom - playAreaHeight;
    const oldCalculationY = oldPlayAreaY - 8 - calculationHeight;
    const sectionGap = oldPlayAreaY - (oldCalculationY + calculationHeight);

    const minMonsterHeight = MONSTER_LAYOUT.monsterMinHeight;
    const minPlayAreaHeight = 74;
    const minHandCardsHeight = 112;
    const availableContentHeight = canvasHeight - bottomSafeInset - bottomPadding - topPadding;
    const fixedGapHeight = sectionGap * 6;
    let monsterHeight = availableContentHeight -
      headerHeight -
      hpBarHeight -
      calculationHeight -
      playAreaHeight -
      actionButtonsHeight -
      handCardsHeight -
      fixedGapHeight;

    if (monsterHeight < minMonsterHeight) {
      let shortage = minMonsterHeight - monsterHeight;
      const playShrink = Math.min(shortage, playAreaHeight - minPlayAreaHeight);
      playAreaHeight -= playShrink;
      shortage -= playShrink;

      const handShrink = Math.min(shortage, handCardsHeight - minHandCardsHeight);
      handCardsHeight -= handShrink;
      shortage -= handShrink;

      monsterHeight = availableContentHeight -
        headerHeight -
        hpBarHeight -
        calculationHeight -
        playAreaHeight -
        actionButtonsHeight -
        handCardsHeight -
        fixedGapHeight;
      monsterHeight = Math.max(40, monsterHeight);
    }

    let totalLayoutHeight = headerHeight +
      monsterHeight +
      hpBarHeight +
      calculationHeight +
      playAreaHeight +
      actionButtonsHeight +
      handCardsHeight +
      fixedGapHeight;

    if (totalLayoutHeight > availableContentHeight) {
      let overflow = totalLayoutHeight - availableContentHeight;
      const handExtraShrink = Math.min(overflow, handCardsHeight - 88);
      handCardsHeight -= handExtraShrink;
      overflow -= handExtraShrink;

      const playExtraShrink = Math.min(overflow, playAreaHeight - 64);
      playAreaHeight -= playExtraShrink;
      overflow -= playExtraShrink;

      monsterHeight = Math.max(32, monsterHeight - overflow);
    }

    const headerY = topPadding;
    const monsterY = headerY + headerHeight + sectionGap;
    const hpBarY = monsterY + monsterHeight + sectionGap;
    const calculationY = hpBarY + hpBarHeight + sectionGap;
    const playAreaY = calculationY + calculationHeight + sectionGap;
    const actionButtonsY = playAreaY + playAreaHeight + sectionGap;
    const handCardsY = actionButtonsY + actionButtonsHeight + sectionGap;
    const topBarBottom = headerY + headerHeight;
    const availableWidth = Math.max(220, canvasWidth - 28);
    const availableHeight = Math.max(90, handCardsHeight - 18);
    const handCardHeight = Math.max(86, Math.min(126, availableHeight));
    const handCardWidth = Math.max(54, Math.min(78, Math.floor(handCardHeight * 0.68), Math.floor(availableWidth * 0.24)));
    const handCardGap = Math.max(18, Math.min(34, Math.floor(handCardWidth * 0.48)));

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
      actionButtonsY: actionButtonsY,
      actionButtonsHeight: actionButtonsHeight,
      handCardsY: handCardsY,
      handCardsHeight: handCardsHeight,
      handCardWidth: handCardWidth,
      handCardHeight: handCardHeight,
      handCardGap: handCardGap,
      formulaY: calculationY,
      monsterAreaTop: monsterY,
      monsterAreaBottom: hpBarY + hpBarHeight,
      playAreaTop: playAreaY,
      playAreaBottom: playAreaY + playAreaHeight,
      handAreaTop: handCardsY,
      actionBarY: actionButtonsY,
      actionBarHeight: actionButtonsHeight,
      cardWidth: handCardWidth,
      cardHeight: handCardHeight,
      cardGap: handCardGap
    };

    if (!this.layoutLogged) {
      console.log("layout", this.layout);
      console.log("layout gaps", {
        monster: this.layout.monsterY - (this.layout.headerY + this.layout.headerHeight),
        hpBar: this.layout.hpBarY - (this.layout.monsterY + this.layout.monsterHeight),
        calculation: this.layout.calculationY - (this.layout.hpBarY + this.layout.hpBarHeight),
        playArea: this.layout.playAreaY - (this.layout.calculationY + this.layout.calculationHeight),
        actionButtons: this.layout.actionButtonsY - (this.layout.playAreaY + this.layout.playAreaHeight),
        handCards: this.layout.handCardsY - (this.layout.actionButtonsY + this.layout.actionButtonsHeight),
        sectionGap: this.layout.sectionGap
      });
      this.layoutLogged = true;
    }
  }

  // 绑定微信小游戏触摸事件。
  bindEvents() {
    const self = this;
    wx.onTouchStart(function(event) {
      const point = getTouchPoint(event);
      if (point) {
        self.handleTouch(point);
      }
    });
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
    this.startLevel();
  }

  // 开始当前关卡。
  startLevel() {
    this.monsterMaxHp = LEVEL_HP[this.level - 1];
    this.monsterHp = this.monsterMaxHp;
    this.visualMonsterHp = this.monsterHp;
    this.currentScore = 0;
    this.handsLeft = 4;
    this.discardsLeft = 4;
    this.firstHandPlayed = false;
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

    this.drawCardsToHand();
  }

  // 从牌组补到 8 张手牌。
  drawCardsToHand() {
    while (this.hand.length < 8) {
      if (this.deck.length === 0) {
        break;
      }
      this.hand.push(this.deck.pop());
    }
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

    if (this.selectedIds.length > 5) {
      this.lastResultText = '出牌最多只能选择 5 张符牌';
      return;
    }

    const selectedCards = this.hand.filter(function(card) {
      return this.selectedIds.indexOf(card.id) >= 0;
    }, this);

    if (selectedCards.length === 0) {
      this.selectedIds = [];
      this.lastResultText = '选中的符牌已失效，请重新选择';
      return;
    }

    const result = evaluateHand(selectedCards);
    const scoringCards = getScoringCards(selectedCards, result.type);
    const orderedPlayed = orderPlayedCardsForDisplay(selectedCards, scoringCards, result.type);
    const orderedScoring = orderedPlayed.slice(0, scoringCards.length);
    const faceTotal = orderedScoring.reduce(function(sum, card) {
      return sum + card.number;
    }, 0);

    let context = {
      selectedCards: orderedScoring,
      playedCards: orderedPlayed,
      handType: result.type,
      handName: result.name,
      faceTotal: faceTotal,
      baseScore: result.baseScore,
      bonusScore: 0,
      rawMultiplier: result.multiplier,
      multiplier: result.multiplier,
      goldGain: 1,
      isFirstHandOfLevel: !this.firstHandPlayed
    };

    context = applyRelics(context, this.relics);

    const finalScore = Math.floor((context.baseScore + context.faceTotal + context.bonusScore) * context.multiplier);
    let nextState = 'playing';
    const hpBefore = this.monsterHp;
    const hpAfter = Math.max(0, this.monsterHp - finalScore);
    const timeline = createSettlementTimeline(orderedScoring, context, this.relics);

    this.currentScore += finalScore;
    this.monsterHp = hpAfter;
    this.visualMonsterHp = hpBefore;
    this.gold += context.goldGain;
    this.handsLeft -= 1;
    this.handTypeCounts[result.type] = (this.handTypeCounts[result.type] || 0) + 1;
    this.firstHandPlayed = true;
    this.lastResultText = result.name + ' +' + finalScore + ' 分，有效点数 ' + context.faceTotal + '，金币 +' + context.goldGain;
    this.centerFeedback = null;
    this.isResolving = true;
    this.playedCards = orderedPlayed;

    this.hand = this.hand.filter(function(card) {
      return this.selectedIds.indexOf(card.id) < 0;
    }, this);
    this.selectedIds = [];
    this.drawCardsToHand();

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

    this.hand = this.hand.filter(function(card) {
      return this.selectedIds.indexOf(card.id) < 0;
    }, this);
    this.selectedIds = [];
    this.drawCardsToHand();
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
    ctx.fillText('第 ' + info.world + ' 关  ' + info.stage + ' / 3', canvasWidth / 2, layout.headerY + 10);
    ctx.font = gameFont(18);
    ctx.textAlign = 'left';
    ctx.fillText('金币 ' + this.gold, 14, layout.headerY + 10);
    this.drawButton('重新开始', canvasWidth - 94, layout.headerY - 4, 80, 28, '#7a3f35', function() {
      this.restart();
    }.bind(this));
  }

  getSettlementDisplay() {
    const animation = this.settlementAnimation;

    if (!animation) {
      return null;
    }

    const elapsed = Date.now() - animation.startTime;
    let base = animation.context.baseScore;
    let multiplier = animation.context.rawMultiplier || animation.context.multiplier;
    let activeIndex = -1;
    let activeProgress = 0;
    let activeStep = null;
    let floatText = '';

    animation.timeline.steps.forEach(function(step, index) {
      const stepStart = index * animation.cardDuration;
      const stepProgress = (elapsed - stepStart) / animation.cardDuration;

      if (stepProgress >= 1) {
        base = step.scoreAfter;
        multiplier = step.multiplierAfter;
        return;
      }

      if (stepProgress >= 0 && activeIndex < 0) {
        activeIndex = index;
        activeProgress = clamp(stepProgress, 0, 1);
        activeStep = step;
        base = step.scoreBefore;
        multiplier = step.multiplierBefore;

        if (activeProgress > 0.22) {
          base += step.scoreGain;
        }

        step.relicEvents.forEach(function(event, eventIndex) {
          if (activeProgress > 0.48 + eventIndex * 0.14) {
            if (event.stat === 'base') {
              base += event.amount;
            }
            if (event.stat === 'multiplier') {
              multiplier += event.amount;
            }
            floatText = event.text;
          }
        });
      }
    });

    if (elapsed >= animation.damageStart) {
      base = animation.timeline.finalBase;
      multiplier = animation.timeline.finalMultiplier;
    }

    return {
      elapsed: elapsed,
      base: base,
      multiplier: multiplier,
      activeIndex: activeIndex,
      activeStep: activeStep,
      activeProgress: activeProgress,
      floatText: floatText,
      damageProgress: clamp((elapsed - animation.damageStart) / animation.damageDuration, 0, 1),
      fadeProgress: clamp((elapsed - animation.damageStart - animation.damageDuration) / animation.fadeDuration, 0, 1)
    };
  }

  drawGameImage(key, x, y, w, h, alpha) {
    const image = GAME_IMAGES[key];

    if (!image || !image.ready) {
      return false;
    }

    ctx.save();
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    ctx.drawImage(image.chromaCanvas || image, x, y, w, h);
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
    const selectedCards = this.hand.filter(function(card) {
      return this.selectedIds.indexOf(card.id) >= 0;
    }, this);
    const canPreviewHand = selectedCards.length > 0 && selectedCards.length <= 5;
    const result = canPreviewHand ? evaluateHand(selectedCards) : null;
    const settlementDisplay = settlementDisplayCached !== undefined
      ? settlementDisplayCached
      : this.getSettlementDisplay();
    const baseText = settlementDisplay
      ? String(Math.round(settlementDisplay.base))
      : (canPreviewHand ? String(result.baseScore) : '');
    const multiplierText = settlementDisplay
      ? String(formatMultiplier(settlementDisplay.multiplier))
      : (canPreviewHand ? String(result.multiplier) : '');
    const boxW = Math.min(72, Math.floor((canvasWidth - 150) / 2));
    const boxH = layout.calculationHeight;
    const gap = 28;
    const totalW = boxW * 2 + gap;
    const x1 = Math.floor((canvasWidth - totalW) / 2);
    const x2 = x1 + boxW + gap;
    const y = layout.calculationY;

    ctx.fillStyle = selectedCards.length > 0 || settlementDisplay ? '#d9792b' : '#b98a55';
    ctx.font = gameFont(18);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(settlementDisplay ? this.settlementAnimation.result.name : (canPreviewHand ? result.name : ''), x1 - 12, y + boxH / 2);

    fillRoundedRect(ctx, x1, y, boxW, boxH, 12, '#fffaf0');
    fillRoundedRect(ctx, x2, y, boxW, boxH, 12, '#fffaf0');
    strokeRoundedRect(ctx, x1, y, boxW, boxH, 12, '#6b4f38', 2);
    strokeRoundedRect(ctx, x2, y, boxW, boxH, 12, '#6b4f38', 2);

    ctx.fillStyle = '#2f2118';
    ctx.font = gameFont(22);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(baseText, x1 + boxW / 2, y + boxH / 2);
    ctx.fillText(multiplierText, x2 + boxW / 2, y + boxH / 2);
    ctx.font = gameFont(24);
    ctx.fillText('x', canvasWidth / 2, y + boxH / 2);

    if (settlementDisplay && this.settlementAnimation && settlementDisplay.floatText) {
      ctx.fillStyle = '#f2bb35';
      ctx.font = gameFont(14);
      ctx.textAlign = 'center';
      ctx.fillText(settlementDisplay.floatText, canvasWidth / 2, y - 12 - settlementDisplay.activeProgress * 10);
    }

    this.drawButton('比赛信息', Math.min(canvasWidth - 82, x2 + boxW + 12), y + 7, 70, 32, '#f2bb35', function() {
      this.openMatchInfoModal();
    }.bind(this), '#2f2118');
  }

  drawMonster(settlementDisplayCached) {
    const layout = this.layout;
    const canvasWidth = layout.canvasWidth;
    const areaTop = layout.monsterY;
    const areaBottom = layout.monsterY + layout.monsterHeight;
    const hpW = Math.min(canvasWidth - MONSTER_LAYOUT.hpHorizontalPadding, MONSTER_LAYOUT.hpWidthMax);
    const hpH = layout.hpBarHeight;
    const hpX = Math.floor((canvasWidth - hpW) / 2);
    const hpY = layout.hpBarY;
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
    const monsterY = Math.max(stageTop, stageBottom - monsterH - MONSTER_LAYOUT.monsterToHpGap);
    const monsterVisualDownOffset = Math.floor(monsterH * MONSTER_LAYOUT.monsterVisualDownOffsetRatio);
    const monsterRenderY = Math.min(
      hpY - MONSTER_LAYOUT.monsterBottomClearance - monsterH,
      monsterY + monsterVisualDownOffset
    );
    const displayedHp = this.settlementAnimation ? this.visualMonsterHp : this.monsterHp;
    const hpRate = this.monsterMaxHp > 0 ? displayedHp / this.monsterMaxHp : 0;
    const settlementDisplay = settlementDisplayCached !== undefined
      ? settlementDisplayCached
      : this.getSettlementDisplay();
    const now = Date.now();
    const breath = Math.sin(now / 520) * 0.035;
    const damageShake = settlementDisplay && settlementDisplay.damageProgress > 0 && settlementDisplay.damageProgress < 0.65
      ? Math.sin(now / 28) * 4 * (1 - settlementDisplay.damageProgress)
      : 0;

    const bossW = monsterW * (1 + breath);
    const bossH = monsterH * (1 - breath * 0.55);
    const bossX = canvasWidth / 2 - bossW / 2 + damageShake;
    const bossY = Math.min(stageBottom - bossH + monsterVisualDownOffset, monsterRenderY + monsterH - bossH);

    if (!this.drawGameImage('catBoss', bossX, bossY, bossW, bossH, 1)) {
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

    fillRoundedRect(ctx, hpX, hpY, hpW, hpH, 10, '#fff5df');
    fillRoundedRect(ctx, hpX, hpY, Math.floor(hpW * hpRate), hpH, 10, '#c54a3f');
    strokeRoundedRect(ctx, hpX, hpY, hpW, hpH, 10, '#2f2118', 2);
    ctx.fillStyle = '#2f2118';
    ctx.font = gameFont(14);
    ctx.fillText(displayedHp + '/' + this.monsterMaxHp, canvasWidth / 2, hpY + hpH / 2);
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
        return a.number - b.number;
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
      const slotW = Math.floor((modalW - 84) / 10);
      const cardW = Math.max(20, Math.min(24, slotW - 1));
      const cardH = 34;
      const cardsByNumber = {};
      const labelIcon = ELEMENT_ICONS[element];
      const labelIconSize = 24;

      cards.forEach(function(card) {
        cardsByNumber[card.number] = card;
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

      for (let number = 1; number <= 10; number += 1) {
        const slotX = cardX + (number - 1) * slotW;
        const slotY = rowY + Math.floor((rowH - cardH) / 2);
        const hasCard = !!cardsByNumber[number];

        ctx.fillStyle = hasCard ? '#fffaf0' : 'rgba(107, 79, 56, 0.12)';
        ctx.strokeStyle = hasCard ? '#5d4937' : 'rgba(107, 79, 56, 0.35)';
        ctx.lineWidth = 1;
        fillRoundedRect(ctx, slotX, slotY, cardW, cardH, 6, ctx.fillStyle);
        strokeRoundedRect(ctx, slotX, slotY, cardW, cardH, 6, ctx.strokeStyle, 1);

        if (hasCard) {
          drawMiniDeckCard(ctx, cardsByNumber[number], slotX, slotY, cardW, cardH);
        }
      }
    });
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
    const modalH = 294;
    const modalX = Math.floor((canvasWidth - modalW) / 2);
    const modalY = Math.max(layout.topPadding + 18, Math.floor((canvasHeight - modalH) / 2));
    const rowY = modalY + 56;
    const rowH = 34;

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
      ctx.font = gameFont(15);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(handType.name, modalX + 26, y + (rowH - 4) / 2);

      ctx.font = gameFont(14);
      ctx.textAlign = 'center';
      ctx.fillText(handType.baseScore + ' x ' + handType.multiplier, modalX + modalW / 2 + 18, y + (rowH - 4) / 2);

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
    this.drawFormulaWindows(settlementFrame);

    const playBoxY = layout.playAreaY;
    const playBoxH = Math.min(86, Math.max(64, layout.playAreaHeight));
    const playCardGap = 6;
    const playCardW = Math.min(52, Math.floor((canvasWidth - 52 - playCardGap * 4) / 5));
    const playCardH = Math.min(playBoxH - 14, Math.floor(playCardW * 1.42));
    const playSlotsW = playCardW * 5 + playCardGap * 4;
    const playSlotX = Math.floor((canvasWidth - playSlotsW) / 2);
    const playSlotY = playBoxY + Math.floor((playBoxH - playCardH) / 2);
    const settlementDisplay = settlementFrame;
    const activeCard = settlementDisplay && this.settlementAnimation && settlementDisplay.activeIndex >= 0
      ? this.settlementAnimation.timeline.steps[settlementDisplay.activeIndex].card
      : null;

    fillRoundedRect(ctx, playSlotX - 6, playSlotY - 6, playSlotsW + 12, playCardH + 12, 14, '#ead3a7');
    strokeRoundedRect(ctx, playSlotX - 6, playSlotY - 6, playSlotsW + 12, playCardH + 12, 14, '#6b4f38', 1);

    for (let slotIndex = 0; slotIndex < 5; slotIndex += 1) {
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
    const maxHandWidth = canvasWidth - 28;
    const stackStep = this.hand.length > 1
      ? Math.max(22, Math.min(layout.handCardGap, Math.floor((maxHandWidth - cardW) / (this.hand.length - 1))))
      : 0;
    const cardsWidth = cardW + stackStep * Math.max(0, this.hand.length - 1);
    const startX = Math.max(14, Math.floor((canvasWidth - cardsWidth) / 2));
    const cardY = layout.handCardsY + Math.max(8, Math.floor((layout.handCardsHeight - cardH) / 2));

    ctx.fillStyle = 'rgba(213, 186, 136, 0.7)';
    ctx.fillRect(0, layout.handCardsY, canvasWidth, layout.canvasHeight - layout.handCardsY);
    ctx.strokeStyle = '#6b4f38';
    ctx.strokeRect(0, layout.handCardsY, canvasWidth, 1);

    this.hand.forEach(function(card, index) {
      const x = startX + index * stackStep;
      const selected = this.selectedIds.indexOf(card.id) >= 0;

      drawCard(ctx, card, x, cardY, selected, cardW, cardH);
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

    const sideW = Math.max(62, Math.floor((canvasWidth - 228) / 2));
    const mainW = Math.max(76, Math.floor((canvasWidth - sideW * 2 - 46) / 2));
    const buttonY = layout.actionButtonsY + Math.floor((layout.actionButtonsHeight - 36) / 2);
    let x = 10;
    this.drawButton('剩余牌库 ' + this.deck.length, x, buttonY, sideW, 36, '#6b4f38', function() {
      this.openDeckModal();
    }.bind(this));
    x += sideW + 8;
    this.drawButton('出牌x' + this.handsLeft, x, buttonY, mainW, 36, '#9b3d32', function() {
      this.playSelectedCards();
    }.bind(this));
    x += mainW + 8;
    this.drawButton('弃牌x' + this.discardsLeft, x, buttonY, mainW, 36, '#536d47', function() {
      this.discardSelectedCards();
    }.bind(this));
    x += mainW + 8;
    this.relicButtonArea = { x: x, y: buttonY, w: sideW, h: 36 };
    this.drawButton('饰品', x, buttonY, sideW, 36, '#7a5a35', function() {
      this.openRelicModal();
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
