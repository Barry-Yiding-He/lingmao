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

const ELEMENT_ICON_PATHS = {
  fire: 'assets/element-fire.png',
  water: 'assets/element-water.png',
  wood: 'assets/element-wood.png',
  metal: 'assets/element-metal.png',
  earth: 'assets/element-earth.png'
};

module.exports = {
  ELEMENTS: ELEMENTS,
  ELEMENT_DISPLAY_ORDER: ELEMENT_DISPLAY_ORDER,
  ELEMENT_LABELS: ELEMENT_LABELS,
  ELEMENT_COLORS: ELEMENT_COLORS,
  ELEMENT_ICON_PATHS: ELEMENT_ICON_PATHS
};
