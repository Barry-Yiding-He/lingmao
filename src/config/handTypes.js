const HAND_TYPES = [
  { type: 'royal_flush', name: '皇家同花顺', baseScore: 100, multiplier: 12 },
  { type: 'straight_flush', name: '同花顺', baseScore: 80, multiplier: 8 },
  { type: 'four_kind', name: '四条', baseScore: 50, multiplier: 7 },
  { type: 'full_house', name: '葫芦', baseScore: 30, multiplier: 4 },
  { type: 'fire_five', name: '天火焚原', baseScore: 25, multiplier: 4 },
  { type: 'water_five', name: '巨浪冲击', baseScore: 25, multiplier: 4 },
  { type: 'wood_five', name: '万木森罗', baseScore: 25, multiplier: 4 },
  { type: 'metal_five', name: '金刚伏魔', baseScore: 25, multiplier: 4 },
  { type: 'earth_five', name: '山崩地裂', baseScore: 25, multiplier: 4 },
  { type: 'fire_earth', name: '熔岩流火', baseScore: 20, multiplier: 3 },
  { type: 'metal_water', name: '金水相逢', baseScore: 20, multiplier: 3 },
  { type: 'water_wood', name: '水木清华', baseScore: 20, multiplier: 3 },
  { type: 'wood_fire', name: '木火通明', baseScore: 20, multiplier: 3 },
  { type: 'earth_metal', name: '土金蕴灵', baseScore: 20, multiplier: 3 },
  { type: 'metal_wood', name: '金断朽木', baseScore: 20, multiplier: 3 },
  { type: 'wood_earth', name: '木破岩土', baseScore: 20, multiplier: 3 },
  { type: 'earth_water', name: '土掩洪流', baseScore: 20, multiplier: 3 },
  { type: 'water_fire', name: '水灭火势', baseScore: 20, multiplier: 3 },
  { type: 'fire_metal', name: '火炼真金', baseScore: 20, multiplier: 3 },
  { type: 'straight', name: '顺子', baseScore: 25, multiplier: 4 },
  { type: 'triple', name: '三条', baseScore: 25, multiplier: 3 },
  { type: 'two_pair', name: '两对', baseScore: 20, multiplier: 2 },
  { type: 'pair', name: '一对', baseScore: 10, multiplier: 2 },
  { type: 'high_card', name: '高牌', baseScore: 5, multiplier: 1 }
];

const HAND_TYPE_MAP = {};
HAND_TYPES.forEach(function(handType) {
  HAND_TYPE_MAP[handType.type] = handType;
});

const ELEMENT_FIVE_HANDS = {
  fire: 'fire_five',
  water: 'water_five',
  wood: 'wood_five',
  metal: 'metal_five',
  earth: 'earth_five'
};

const ELEMENT_COMBO_HANDS = [
  { type: 'fire_earth', three: 'fire', two: 'earth' },
  { type: 'metal_water', three: 'metal', two: 'water' },
  { type: 'water_wood', three: 'water', two: 'wood' },
  { type: 'wood_fire', three: 'wood', two: 'fire' },
  { type: 'earth_metal', three: 'earth', two: 'metal' },
  { type: 'metal_wood', three: 'metal', two: 'wood' },
  { type: 'wood_earth', three: 'wood', two: 'earth' },
  { type: 'earth_water', three: 'earth', two: 'water' },
  { type: 'water_fire', three: 'water', two: 'fire' },
  { type: 'fire_metal', three: 'fire', two: 'metal' }
];

const FIVE_CARD_HAND_TYPES = [
  'royal_flush', 'straight_flush', 'full_house',
  'fire_five', 'water_five', 'wood_five', 'metal_five', 'earth_five',
  'fire_earth', 'metal_water', 'water_wood', 'wood_fire', 'earth_metal',
  'metal_wood', 'wood_earth', 'earth_water', 'water_fire', 'fire_metal',
  'straight'
];

module.exports = {
  HAND_TYPES: HAND_TYPES,
  HAND_TYPE_MAP: HAND_TYPE_MAP,
  ELEMENT_FIVE_HANDS: ELEMENT_FIVE_HANDS,
  ELEMENT_COMBO_HANDS: ELEMENT_COMBO_HANDS,
  FIVE_CARD_HAND_TYPES: FIVE_CARD_HAND_TYPES
};
