const GAME_IMAGE_PATHS = {
  background: 'assets/battle-background.png',
  catBoss: 'assets/cat-boss-key.png',
  slashEffect: 'assets/slash-effect-key.png'
};

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
  monsterVisualDownOffsetRatio: 0,
  monsterBottomClearance: 0,
  catBossCrop: { x: 218, y: 94, w: 803, h: 1033 },
  hpWidthMax: 320,
  hpHorizontalPadding: 42,
  hpHeight: 22
};

module.exports = {
  GAME_IMAGE_PATHS: GAME_IMAGE_PATHS,
  MONSTER_LAYOUT: MONSTER_LAYOUT
};
