const handTypeConfig = require('../config/handTypes');
const elementConfig = require('../config/elements');

const HAND_TYPES = handTypeConfig.HAND_TYPES;
const HAND_TYPE_MAP = handTypeConfig.HAND_TYPE_MAP;
const ELEMENT_DISPLAY_ORDER = elementConfig.ELEMENT_DISPLAY_ORDER;

const BIRTH_CHAIN = ['wood', 'fire', 'earth', 'metal', 'water'];
const CONTROL_CHAIN = ['metal', 'wood', 'earth', 'water', 'fire'];

function createHandTypeCounts() {
  const counts = {};

  HAND_TYPES.forEach(function(handType) {
    counts[handType.type] = 0;
  });

  return counts;
}

function countByElement(cards) {
  const counts = {};

  cards.forEach(function(card) {
    counts[card.element] = (counts[card.element] || 0) + 1;
  });

  return counts;
}

function getEnchantElement(cards) {
  const counts = countByElement(cards);
  let bestElement = null;
  let bestCount = 0;

  ELEMENT_DISPLAY_ORDER.forEach(function(element) {
    const count = counts[element] || 0;

    if (count >= 2 && count > bestCount) {
      bestElement = element;
      bestCount = count;
    }
  });

  return bestElement;
}

function isSameElement(cards) {
  return cards.length > 0 && cards.every(function(card) {
    return card.element === cards[0].element;
  });
}

function followsChain(cards, chain, allowWrap) {
  if (!cards || cards.length < 2) {
    return false;
  }

  for (let i = 1; i < cards.length; i += 1) {
    const previousIndex = chain.indexOf(cards[i - 1].element);
    const currentIndex = chain.indexOf(cards[i].element);

    if (previousIndex < 0 || currentIndex < 0) {
      return false;
    }

    const nextIndex = allowWrap ? (previousIndex + 1) % chain.length : previousIndex + 1;

    if (nextIndex !== currentIndex) {
      return false;
    }
  }

  return true;
}

function hasAdjacentChain(cards, chain) {
  if (!cards || cards.length < 2) {
    return false;
  }

  for (let i = 0; i < cards.length - 1; i += 1) {
    if (followsChain(cards.slice(i, i + 2), chain, true)) {
      return true;
    }
  }

  return false;
}

function handResult(type, cards) {
  const handType = HAND_TYPE_MAP[type] || HAND_TYPE_MAP.plain;

  return {
    type: handType.type,
    name: handType.name,
    spiritMultiplier: handType.spiritMultiplier,
    desc: handType.desc,
    enchantElement: getEnchantElement(cards || [])
  };
}

function evaluateHand(cards, bossElement) {
  if (!cards || cards.length === 0) {
    return handResult('plain', []);
  }

  const cardCount = cards.length;

  if (cardCount === 3 && isSameElement(cards)) {
    return handResult('flush', cards);
  }

  if (cardCount === 3 && followsChain(cards, BIRTH_CHAIN, true)) {
    return handResult('birth_chain', cards);
  }

  if (cardCount === 3 && followsChain(cards, CONTROL_CHAIN, true)) {
    return handResult('control_chain', cards);
  }

  if (hasAdjacentChain(cards, BIRTH_CHAIN)) {
    return handResult('two_birth', cards);
  }

  if (hasAdjacentChain(cards, CONTROL_CHAIN)) {
    return handResult('two_control', cards);
  }

  if (cardCount === 1 && bossElement && controlsElement(cards[0].element, bossElement)) {
    return handResult('sun_soul', cards);
  }

  return handResult('plain', cards);
}

function controlsElement(attackerElement, defenderElement) {
  const attackerIndex = CONTROL_CHAIN.indexOf(attackerElement);
  const defenderIndex = CONTROL_CHAIN.indexOf(defenderElement);

  return attackerIndex >= 0 &&
    defenderIndex >= 0 &&
    (attackerIndex + 1) % CONTROL_CHAIN.length === defenderIndex;
}

function isControlledBy(attackerElement, defenderElement) {
  return controlsElement(defenderElement, attackerElement);
}

function getScoringCards(cards) {
  return cards ? cards.slice() : [];
}

function orderPlayedCardsForDisplay(playedCards) {
  return playedCards ? playedCards.slice() : [];
}

module.exports = {
  BIRTH_CHAIN: BIRTH_CHAIN,
  CONTROL_CHAIN: CONTROL_CHAIN,
  createHandTypeCounts: createHandTypeCounts,
  evaluateHand: evaluateHand,
  getScoringCards: getScoringCards,
  orderPlayedCardsForDisplay: orderPlayedCardsForDisplay,
  controlsElement: controlsElement,
  isControlledBy: isControlledBy
};
