const handTypeConfig = require('../config/handTypes');
const elementConfig = require('../config/elements');

const HAND_TYPES = handTypeConfig.HAND_TYPES;
const HAND_TYPE_MAP = handTypeConfig.HAND_TYPE_MAP;
const ELEMENT_FIVE_HANDS = handTypeConfig.ELEMENT_FIVE_HANDS;
const ELEMENT_COMBO_HANDS = handTypeConfig.ELEMENT_COMBO_HANDS;
const FIVE_CARD_HAND_TYPES = handTypeConfig.FIVE_CARD_HAND_TYPES;
const ELEMENT_DISPLAY_ORDER = elementConfig.ELEMENT_DISPLAY_ORDER;

const ELEMENT_ORDER = {};
ELEMENT_DISPLAY_ORDER.forEach(function(element, index) {
  ELEMENT_ORDER[element] = index;
});

function createHandTypeCounts() {
  const counts = {};

  HAND_TYPES.forEach(function(handType) {
    counts[handType.type] = 0;
  });

  return counts;
}

function handResult(type) {
  const handType = HAND_TYPE_MAP[type];

  return {
    type: handType.type,
    name: handType.name,
    baseScore: handType.baseScore,
    multiplier: handType.multiplier
  };
}

function sortedNumbers(cards) {
  return cards.map(function(card) {
    return card.number;
  }).sort(function(a, b) {
    return a - b;
  });
}

function countByNumber(cards) {
  const counts = {};

  cards.forEach(function(card) {
    counts[card.number] = (counts[card.number] || 0) + 1;
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

function hasNumberCount(counts, target) {
  return Object.keys(counts).some(function(key) {
    return counts[key] === target;
  });
}

function countPairGroups(counts) {
  return Object.keys(counts).filter(function(key) {
    return counts[key] === 2;
  }).length;
}

function isConsecutiveStraight(numbers, length) {
  if (numbers.length !== length) {
    return false;
  }

  for (let i = 1; i < numbers.length; i += 1) {
    if (numbers[i] !== numbers[i - 1] + 1) {
      return false;
    }
  }

  return true;
}

function isRoyalStraight(numbers) {
  return numbers.length === 5 &&
    numbers[0] === 6 &&
    numbers[4] === 10 &&
    isConsecutiveStraight(numbers, 5);
}

function matchesElementCombo(elementCounts, threeElement, twoElement) {
  return (elementCounts[threeElement] || 0) === 3 &&
    (elementCounts[twoElement] || 0) === 2;
}

function compareCardsByElementThenNumber(a, b) {
  const elementDiff = ELEMENT_ORDER[a.element] - ELEMENT_ORDER[b.element];

  if (elementDiff !== 0) {
    return elementDiff;
  }

  return a.number - b.number;
}

function evaluateHand(cards) {
  if (!cards || cards.length === 0) {
    return { type: 'none', name: '无符', baseScore: 0, multiplier: 0 };
  }

  const numbers = sortedNumbers(cards);
  const numberCounts = countByNumber(cards);
  const elementCounts = countByElement(cards);
  const sameElement = cards.every(function(card) {
    return card.element === cards[0].element;
  });
  const cardCount = cards.length;

  if (cardCount === 5 && sameElement && isRoyalStraight(numbers)) {
    return handResult('royal_flush');
  }

  if (cardCount === 5 && sameElement && isConsecutiveStraight(numbers, 5)) {
    return handResult('straight_flush');
  }

  if (cardCount >= 4 && hasNumberCount(numberCounts, 4)) {
    return handResult('four_kind');
  }

  if (cardCount === 5 && hasNumberCount(numberCounts, 3) && hasNumberCount(numberCounts, 2)) {
    return handResult('full_house');
  }

  if (cardCount === 5 && sameElement) {
    return handResult(ELEMENT_FIVE_HANDS[cards[0].element]);
  }

  if (cardCount === 5) {
    for (let i = 0; i < ELEMENT_COMBO_HANDS.length; i += 1) {
      const combo = ELEMENT_COMBO_HANDS[i];

      if (matchesElementCombo(elementCounts, combo.three, combo.two)) {
        return handResult(combo.type);
      }
    }
  }

  if (cardCount === 5 && isConsecutiveStraight(numbers, 5)) {
    return handResult('straight');
  }

  if (cardCount >= 3 && hasNumberCount(numberCounts, 3)) {
    return handResult('triple');
  }

  if (cardCount >= 4 && countPairGroups(numberCounts) >= 2) {
    return handResult('two_pair');
  }

  if (cardCount >= 2 && hasNumberCount(numberCounts, 2)) {
    return handResult('pair');
  }

  return handResult('high_card');
}

function getScoringCards(cards, handType) {
  if (!cards || cards.length === 0) {
    return [];
  }

  if (FIVE_CARD_HAND_TYPES.indexOf(handType) >= 0) {
    return cards.slice();
  }

  if (handType === 'high_card') {
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

  if (handType === 'four_kind') {
    for (let i = 0; i < numbers.length; i += 1) {
      const group = groups[numbers[i]];

      if (group.length >= 4) {
        return group.slice(0, 4);
      }
    }
  }

  if (handType === 'triple') {
    for (let i = 0; i < numbers.length; i += 1) {
      const group = groups[numbers[i]];

      if (group.length >= 3) {
        return group.slice(0, 3);
      }
    }
  }

  if (handType === 'two_pair') {
    const scoringCards = [];

    numbers.forEach(function(number) {
      const group = groups[number];

      if (group.length >= 2 && scoringCards.length < 4) {
        scoringCards.push(group[0], group[1]);
      }
    });

    if (scoringCards.length >= 4) {
      return scoringCards.slice(0, 4);
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

  orderedScoringCards.sort(compareCardsByElementThenNumber);

  return orderedScoringCards.concat(playedCards.filter(function(card) {
    return !scoringIds[card.id];
  }));
}

module.exports = {
  createHandTypeCounts: createHandTypeCounts,
  evaluateHand: evaluateHand,
  getScoringCards: getScoringCards,
  orderPlayedCardsForDisplay: orderPlayedCardsForDisplay
};
