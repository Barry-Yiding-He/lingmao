const HAND_TYPES = [
  { type: 'flush', name: '同花', spiritMultiplier: 1, desc: '三张同元素，每张牌触发两次元素灵猫' },
  { type: 'birth_chain', name: '相生链', spiritMultiplier: 1.5, desc: '三张相生顺序排列，本次出牌总灵力 x1.5' },
  { type: 'control_chain', name: '相克链', spiritMultiplier: 1, desc: '三张相克顺序排列，此次攻击无视护盾' },
  { type: 'two_birth', name: '二相生', spiritMultiplier: 1.2, desc: '两张相生顺序排列，本次出牌总灵力 x1.2' },
  { type: 'two_control', name: '二相克', spiritMultiplier: 1, desc: '两张相克顺序排列，直接削减25%护盾' },
  { type: 'sun_soul', name: '日魄', spiritMultiplier: 1, desc: '只出单张且元素克制，该张牌灵力 +10' },
  { type: 'plain', name: '普通出牌', spiritMultiplier: 1, desc: '无正式牌型' }
];

const HAND_TYPE_MAP = {};
HAND_TYPES.forEach(function(handType) {
  HAND_TYPE_MAP[handType.type] = handType;
});

module.exports = {
  HAND_TYPES: HAND_TYPES,
  HAND_TYPE_MAP: HAND_TYPE_MAP
};
