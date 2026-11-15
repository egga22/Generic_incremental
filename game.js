import Decimal from './break_eternity.js';

const SAVE_KEY = 'pocket-foundry-save-v2';
const PRESTIGE_STYLES = ['none', 'bar', 'ring', 'pie', 'multibar', 'letters', 'color', 'pro'];
const BASE_MAX_UPGRADE_LEVEL = 1000;
const FISHING_COST = 100;
const FISHING_REEL_WINDOW = 1600;
const RED_FISH_REEL_WINDOW = 850;
const GARBAGE_COST = '1e900';
const MAINLINE_SOFT_CAP = '1e1000';
const MAINLINE_CURRENCIES = {
  points: 'balance', tokens: 'tokens', credits: 'credits', data: 'data', spark: 'spark', ascendance: 'ascendance'
};
const CURRENCY_KEYS = ['balance', 'runEarned', 'lifetime', 'tokens', 'credits', 'data', 'cubeClicks', 'alpha', 'ascendance', 'darkMatter', 'darkMatterCoinBoost', 'spark', 'fishPoints', 'fortuneBase', 'blackjackStake'];
const D = value => value instanceof Decimal ? value : new Decimal(value ?? 0);
function upgradeLevelMax() { return BASE_MAX_UPGRADE_LEVEL + (state?.cyan15Bought ? 250 : 0); }
const lt = (a, b) => D(a).lt(b);
const lte = (a, b) => D(a).lte(b);
const gt = (a, b) => D(a).gt(b);
const gte = (a, b) => D(a).gte(b);
const plus = (a, b) => D(a).plus(b);
const minus = (a, b) => D(a).minus(b);
const initialState = { balance: 0, runEarned: 0, lifetime: 0, printer: false, press: false, multiplierLevel: 0, incomeLevel: 0, powerLevel: 0, clickLevel: 0, logLevel: 0, exponentLevel: 0, exponentCapLevel: 0, capLevel: 0, tokens: 0, totalPrestiges: 0, tokenResetCount: 0, tokenMultiplierLevel: 0, discountLevel: 0, tokenBoostLevel: 0, expansionUnlocked: false, maxBuyUnlocked: false, maxBuyActive: false, tokenCreditLevel: 0, tokenDiscountLevel: 0, credits: 0, totalCreditPrestiges: 0, data: 0, totalDataPrestiges: 0, dataLore: Array(5).fill(false), gainZeroBought: false, gainZeroActive: false, priceOrigins: {}, creditEngine: false, creditExponentLevel: 0, heavyMint: false, cubeUnlocked: false, cubeLevel: 0, cubeClicks: 0, cubeTarget: 'points', freeRunUpgrades: false, passiveTokens: false, alphaUnlocked: false, alpha: 0, alphaGainPurchases: 0, alphaBoostLevel: 0, alphaCapLevel: 0, alphaNeutralBought: false, alphaGeneratorBought: false, fishingUnlocked: false, fishPoints: 0, fishGainLevel: 0, redFishLevel: 0, fishAlphaLevel: 0, garbageUnlocked: false, darkMatterUnlocked: false, darkMatter: 0, darkMatter1Bought: false, darkMatter2Bought: false, darkMatter2Level: 0, darkMatter3Bought: false, darkMatter4Bought: false, darkMatterCoinBoost: 1, darkMatterFlipTimer: 0, darkMatterFlipDuration: 1, pyramidUnlocked: false, activeChallenge: '', challengeEndsAt: 0, completedChallenges: [], creditChallengeBoost: false, automationsUnlocked: false, automationBought: Array(12).fill(false), automationActive: Array(12).fill(false), ascendance: 0, totalAscendances: 0, ascCurrencyBoost: false, ascCreditExponent: false, ascCubePowerLevel: 0, ascCubeAutoclicker: false, ascCubeAscendance: false, ascCubeAlpha: false, ascPointDiscountLevel: 0, ascTotalLevelBoost: false, ascAllCurrencyLevel: 0, ascMainlinePowerLevel: 0, scaryModeLevel: 0, scaryModeActive: true, spark: 0, sparkPrestiges: 0, sparkUpgrade1Level: 0, sparkUpgrade2Level: 0, sparkUpgrade3Level: 0, pointUpgrade16Bought: false, pointUpgrade17Bought: false, pointUpgrade18Bought: false, pointUpgrade19Bought: false, pointUpgrade20Bought: false, cyan13Bought: false, cyan14Level: 0, cyan15Bought: false, cyanSquareCounts: [0, 0, 0] };
Object.assign(initialState, {
  casinoUnlocked: false,
  alphaTerms: null, blackjackStakeKind: 'base',
  americanRoulette: false, blackjackStake: 0, blackjackDeck: [], blackjackPlayer: [], blackjackDealer: [], blackjackActive: false,
  prestigeAnimation: 'bar', hardMode: false,
  copyrightMode: false, kirbyUnlocked: false, kirbyAbility: 'beam',
  kirbyBeam: false, kirbyMirror: false, kirbyFullness: 0,
  kirbyFeedAt: 0, kirbySwitchAt: 0, kirbyBurstUntil: 0, kirbyNapUntil: 0,
  kirbyStoneSeconds: 0, kirbyStoneTarget: 'points', kirbyCatches: 0,
  fortuneUnlocked: false, fortuneClue: 0, fortuneHints: 0,
  fortuneCharges: 0, fortuneTokens: 0, fortuneFrame: 0, fortuneQuality: 0,
  fortuneWedges: ['points', 'tokens', 'multiplier', 'refund'],
  fortuneMilestone: 0, fortunePending: 0, fortuneSeconds: 0,
  fortuneMultiplier: 1, fortuneLast: '', fortuneStreak: 0, fortuneRefunds: 0,
  fortuneRerolled: false, fortuneBoost: false, fortuneBoostUntil: 0,
  fortuneBase: 0, fortuneResult: 'The mechanism is waiting.',
  cubeLoadouts: ['', '', ''], researchBranch: 'none', researchLevel: 0,
  completedCombos: [], achievements: [], achievementTheme: 'default',
  sparkCharge: 0, sparkBurstUntil: 0, sparkBurstPower: 1,
  automationPresets: ['off', 'off'], automationSeconds: [30, 60],
  automationReserve: [10, 10], automationLastReset: [0, 0]
});
let savedSnapshot;
let saveConflict = false;
const savedState = loadState();
let state = { ...initialState, ...savedState, totalPrestiges: savedState.totalPrestiges ?? savedState.tokens ?? 0, tokenResetCount: savedState.tokenResetCount ?? savedState.totalPrestiges ?? savedState.tokens ?? 0 };
if (!PRESTIGE_STYLES.includes(state.prestigeAnimation)) state.prestigeAnimation = 'bar';
for (const key of CURRENCY_KEYS) state[key] = normalizeSavedCurrency(Object.hasOwn(savedState, key) ? savedState[key] : initialState[key]);
state.automationBought = Array.from({ length: 12 }, (_, i) => Boolean(savedState.automationBought?.[i]));
state.automationActive = Array.from({ length: 12 }, (_, i) => Boolean(savedState.automationActive?.[i] ?? savedState.automationBought?.[i]));
state.dataLore = Array.from({ length: 5 }, (_, i) => Boolean(savedState.dataLore?.[i]));
state.darkMatter2Level = Math.max(0, Math.min(1000, Number(savedState.darkMatter2Level ?? (savedState.darkMatter2Bought ? 1 : 0)) || 0));
state.darkMatterFlipDuration = Math.max(1, Number(savedState.darkMatterFlipDuration) || 1);
state.cyanSquareCounts = Array.from({ length: 3 }, (_, i) => Math.max(0, Number(savedState.cyanSquareCounts?.[i]) || 0));
state.priceOrigins ||= {};
let toastTimer;
let activeTab = 'run';
let fishingBiteAt = null;
let fishingRedFish = false;
let fishingResult = 'Ready to cast.';

function loadState() {
  try {
    savedSnapshot = localStorage.getItem(SAVE_KEY);
    return JSON.parse(savedSnapshot) || {};
  } catch { return {}; }
}
function normalizeSavedCurrency(value) {
  if (value === null || value === Infinity || value?.__numericValue === 'Infinity' || value === 'Infinity') return D(1);
  try { const result = D(value); return result.isNan() ? D(0) : result; } catch { return D(0); }
}
function serializeState() {
  ensureAlphaTerms();
  const snapshot = { ...state };
  for (const key of CURRENCY_KEYS) snapshot[key] = state[key].toString();
  return JSON.stringify(snapshot);
}
function save() {
  if (saveConflict) return;
  if (localStorage.getItem(SAVE_KEY) !== savedSnapshot) {
    saveConflict = true;
    window.alert('Another tab updated this save. Close the other tab, then reload this one to continue from the latest save.');
    return;
  }
  const serialized = serializeState();
  if (serialized === savedSnapshot) return;
  localStorage.setItem(SAVE_KEY, serialized);
  savedSnapshot = serialized;
}
function incomeBase() { return (state.printer ? 1 : 0) + (state.press ? 1 : 0) + state.incomeLevel * (state.incomeLevel + 1) / 2; }
function currencyGainMultiplier() { return state.gainZeroActive ? 0 : D(100).pow(state.ascCurrencyBoost ? 1 : 0).times(D(2).pow(state.ascAllCurrencyLevel)); }
function applyCurrencyGain(amount) { return state.gainZeroActive ? D(0) : D(amount).pow(D(1.3).pow(state.ascMainlinePowerLevel)).times(D(100).pow(state.ascCurrencyBoost ? 1 : 0)).times(D(2).pow(state.ascAllCurrencyLevel)); }
function mainlineGainDivisor(currency) {
  const balance = state[currency];
  return balance.gt(MAINLINE_SOFT_CAP) ? D(2).pow(balance.log10().minus(1000)) : D(1);
}
function softenGain(amount, currency) {
  return D(amount).div(mainlineGainDivisor(currency));
}
function fishAlphaMultiplier() {
  return state.fishAlphaLevel ? state.fishPoints.div(50).plus(1) : D(1);
}
function applyAlphaGain(amount) {
  return state.gainZeroActive ? D(0) : D(amount).times(fishAlphaMultiplier());
}
function pointCost(amount) { return D(amount).div(D(2).pow(state.ascPointDiscountLevel || 0)); }
function priceLevel(key, level) { return Math.max(0, level - (state.priceOrigins?.[key] || 0)); }
function resetUpgradePrices() {
  state.priceOrigins = {
    multiplierLevel: state.multiplierLevel, incomeLevel: state.incomeLevel, powerLevel: state.powerLevel, clickLevel: state.clickLevel,
    discountLevel: state.discountLevel, tokenBoostLevel: state.tokenBoostLevel, tokenCreditLevel: state.tokenCreditLevel,
    tokenDiscountLevel: state.tokenDiscountLevel, exponentCapLevel: state.exponentCapLevel, logLevel: state.logLevel,
    exponentLevel: state.exponentLevel, capLevel: state.capLevel, creditExponentLevel: state.creditExponentLevel,
    cubeLevel: state.cubeLevel, alphaBoostLevel: state.alphaBoostLevel, alphaCapLevel: state.alphaCapLevel,
    tokenCostMultiplier: state.heavyMint ? 7.5 : 1
  };
}
function resetPriceOrigins(keys) {
  for (const key of keys) state.priceOrigins[key] = 0;
}
function restoreCurrencyGain() {
  state.gainZeroActive = false;
  state.balance = D(1);
  resetUpgradePrices();
  toast('P$ restored to 1 · Upgrade prices reset');
  render(); save();
}
function sparkRateMultiplier() { return D(1.1).pow(state.sparkUpgrade1Level).times(D(2).pow(state.sparkUpgrade2Level)).times(D(10).pow(state.sparkUpgrade3Level)); }
function kirbyAvailable() {
  return !state.copyrightMode && state.kirbyUnlocked && !state.activeChallenge && !state.gainZeroActive;
}
function kirbyAbilities() {
  return { beam: state.kirbyBeam, mirror: state.kirbyMirror, spark: state.sparkPrestiges > 0,
    stone: state.cubeUnlocked, fisher: state.fishingUnlocked };
}
function kirbyFriendship() {
  return Math.min(5, Object.values(kirbyAbilities()).filter(Boolean).length);
}
function kirbyBonus(ability) {
  if (!kirbyAvailable() || state.kirbyAbility !== ability || !kirbyAbilities()[ability] || Date.now() < state.kirbyNapUntil && Date.now() >= state.kirbyBurstUntil) return 1;
  const strength = 1 + kirbyFriendship() * .05;
  const burst = Date.now() < state.kirbyBurstUntil ? 2 : 1;
  const base = {beam: .2, mirror: .1, spark: .25, stone: state.kirbyStoneTarget === state.cubeTarget ? Math.min(300, state.kirbyStoneSeconds) / 1500 : 0, fisher: 0}[ability];
  return 1 + base * strength * burst;
}
function feedKirby(currency) {
  const now = Date.now();
  if (!kirbyAvailable() || now < state.kirbyFeedAt || now < state.kirbyNapUntil || state.kirbyFullness >= 100) return;
  if (!['balance', 'tokens'].includes(currency)) return;
  const cost = state[currency].times(.01).max(currency === 'tokens' ? 1 : 10);
  if (state[currency].lt(cost)) return;
  state[currency] = state[currency].minus(cost);
  state[currency === 'tokens' ? 'kirbyMirror' : 'kirbyBeam'] = true;
  state.kirbyFullness = Math.min(100, state.kirbyFullness + 25);
  state.kirbyFeedAt = now + 30000;
  render(); save();
}
function renderKirby() {
  if (state.tokenResetCount > 0 || state.totalCreditPrestiges > 0 || state.totalAscendances > 0) state.kirbyUnlocked = true;
  const panel = document.getElementById('kirby-panel');
  panel.hidden = state.copyrightMode || !state.kirbyUnlocked;
  document.getElementById('copyright-mode').checked = state.copyrightMode;
  if (panel.hidden) return;
  const now = Date.now(), available = kirbyAvailable(), napping = now < state.kirbyNapUntil;
  const bursting = now < state.kirbyBurstUntil;
  panel.dataset.ability = state.kirbyAbility;
  document.getElementById('kirby-face').textContent = bursting ? '( > ◡ < ) ★' : napping ? '( − . − ) zZ' : '( • ◡ • )';
  document.getElementById('kirby-status').textContent = !available ? 'Resting during trials or zero gain.' : bursting ? 'Hypernova! Poyo!' : napping ? `Nap: ${Math.ceil((state.kirbyNapUntil-now)/1000)}s` : `Poyo! ${state.kirbyAbility === 'stone' ? 'Too square. ' : ''}Ready for a snack.`;
  document.getElementById('kirby-progress').textContent = `Fullness ${state.kirbyFullness}% · Friendship ${kirbyFriendship()}/5 · Feed cooldown ${Math.max(0, Math.ceil((state.kirbyFeedAt-now)/1000))}s`;
  for (const currency of ['balance', 'tokens']) {
    const b = document.querySelector(`[data-kirby-feed="${currency}"]`);
    const cost = state[currency].times(.01).max(currency === 'tokens' ? 1 : 10);
    b.textContent = `Feed ${fmt(cost)} ${currency === 'tokens' ? 'tokens' : 'P$'}`;
    b.disabled = !available || napping || now < state.kirbyFeedAt || state.kirbyFullness >= 100 || state[currency].lt(cost);
  }
  document.querySelectorAll('[data-kirby-ability]').forEach(b => {
    const ability = b.dataset.kirbyAbility;
    b.disabled = !available || napping || now < state.kirbySwitchAt || !kirbyAbilities()[ability];
    b.setAttribute('aria-pressed', String(state.kirbyAbility === ability));
  });
  document.getElementById('kirby-hypernova').disabled = !available || napping || state.kirbyFullness < 100 || !kirbyAbilities()[state.kirbyAbility];
}
function rate() {
  let value = D(incomeBase()).times(D(1.1).pow(state.multiplierLevel)).times(D(1.3).pow(state.powerLevel)).times(D(2).pow(state.tokenMultiplierLevel)).times(D(1.5).pow(state.tokenBoostLevel)).times(1 + state.totalPrestiges * 0.5).times(pointMultiplier()).times(state.researchBranch === 'production' ? D(2).pow(state.researchLevel) : 1).times(Date.now() < state.sparkBurstUntil ? state.sparkBurstPower : 1);
  if (state.logLevel) value = value.times(state.balance.max(10).log10().max(1).pow(state.logLevel));
  if (state.exponentLevel && value.gt(0)) value = value.pow(D(1.1).pow(state.exponentLevel));
  const exponent = challengeExponent();
  const challenged = exponent < 1 && value.gt(0) ? value.pow(exponent) : value;
  return softenGain(applyCurrencyGain(challenged.times(sparkRateMultiplier())), 'balance').times(Date.now() < state.fortuneBoostUntil && !state.activeChallenge ? 2 : 1).times(kirbyBonus('beam')).times(kirbyBonus('stone'));
}
const challengeNames = { deduction1: 'Deduction I', deduction2: 'Deduction II', deduction3: 'Deduction III', time1: 'Time Limit I', time2: 'Time Limit II', time3: 'Time Limit III' };
for (const deduction of ['deduction1', 'deduction2', 'deduction3']) {
  for (const time of ['time1', 'time2', 'time3']) challengeNames[`${deduction}+${time}`] = `${challengeNames[deduction]} + ${challengeNames[time]}`;
}
function saleGain() {
  return softenGain(applyCurrencyGain(D(1 + state.clickLevel * 2).times(pointMultiplier()).pow(challengeExponent())), 'balance');
}
function challengeExponent() { return ({ deduction1: .9, deduction2: .8, deduction3: .7 })[state.activeChallenge.split('+')[0]] || 1; }
function challengeDuration(id) { const base = ({ time1: 7, time2: 6, time3: 5 })[id.split('+').at(-1)] || 0; return base ? base + state.cyan14Level : 0; }
function resetCreditRun() {
  clearFortuneChain(true);
  // Permanent upgrades, including Automations and the Pyramid, stay bought across this reset.
  state.tokens = D(0); state.totalPrestiges = 0; state.balance = D(0); state.runEarned = D(0);
  state.printer = false; state.press = false; state.multiplierLevel = 0; state.incomeLevel = 0;
  state.powerLevel = 0; state.clickLevel = 0; state.logLevel = 0; state.exponentLevel = 0;
  state.exponentCapLevel = 0; state.capLevel = 0; state.tokenMultiplierLevel = 0;
  state.discountLevel = 0; state.tokenBoostLevel = 0; state.expansionUnlocked = false;
  state.tokenCreditLevel = 0; state.tokenDiscountLevel = 0;
  state.maxBuyUnlocked = false; state.maxBuyActive = false;
  state.pointUpgrade16Bought = false; state.pointUpgrade17Bought = false; state.pointUpgrade18Bought = false; state.pointUpgrade19Bought = false; state.pointUpgrade20Bought = false;
  applyAscendanceMilestones();
  resetPriceOrigins(['multiplierLevel', 'incomeLevel', 'powerLevel', 'clickLevel', 'discountLevel', 'tokenBoostLevel', 'tokenCreditLevel', 'tokenDiscountLevel', 'exponentCapLevel', 'logLevel', 'exponentLevel', 'capLevel']);
}
function resetAscendanceRun() {
  state.kirbyFullness = 0; state.kirbyBurstUntil = 0; state.kirbyNapUntil = 0; state.kirbyStoneSeconds = 0;
  updateFortuneProgress();
  clearFortuneChain(true);
  state.balance = D(0); state.runEarned = D(0); state.lifetime = D(0);
  state.printer = false; state.press = false; state.multiplierLevel = 0; state.incomeLevel = 0;
  state.powerLevel = 0; state.clickLevel = 0; state.logLevel = 0; state.exponentLevel = 0;
  state.exponentCapLevel = 0; state.capLevel = 0; state.tokens = D(0); state.totalPrestiges = 0;
  state.maxBuyUnlocked = false; state.maxBuyActive = false;
  state.tokenResetCount = 0; state.tokenMultiplierLevel = 0; state.discountLevel = 0;
  state.tokenBoostLevel = 0; state.expansionUnlocked = false; state.tokenCreditLevel = 0;
  state.tokenDiscountLevel = 0; state.credits = D(0); state.totalCreditPrestiges = 0;
  state.data = D(0); state.totalDataPrestiges = 0; state.dataLore = Array(5).fill(false);
  state.gainZeroBought = false; state.gainZeroActive = false; state.priceOrigins = {};
  state.creditEngine = false; state.creditExponentLevel = 0; state.heavyMint = false;
  state.cubeLevel = 0; state.cubeClicks = D(0); state.cubeTarget = 'points';
  state.freeRunUpgrades = false; state.passiveTokens = false;
  state.pointUpgrade16Bought = false; state.pointUpgrade17Bought = false; state.pointUpgrade18Bought = false; state.pointUpgrade19Bought = false; state.pointUpgrade20Bought = false;
  state.activeChallenge = ''; state.challengeEndsAt = 0; state.creditChallengeBoost = false;
  state.automationsUnlocked = false; state.automationBought = Array(12).fill(false);
  state.automationActive = Array(12).fill(false);
  state.researchBranch = 'none'; state.researchLevel = 0;
  applyAscendanceMilestones();
}
function nextGoal() { return 500 * (state.totalPrestiges + 1); }
const DATA_PRESTIGE_COST = D('1e200');
const SPARK_PRESTIGE_COST = D('1e300');
const dataUpgradeInfo = [
  { cost: 5, currency: 'points', amount: D('1e210'), lore: 'Points are the foundry’s raw measure of work. P$ is that same output counted as spendable production.' },
  { cost: 10, currency: 'tokens', amount: D('1e230'), lore: 'Tokens record completed production cycles. Each reset turns a run’s scale into a permanent foothold for the next one.' },
  { cost: 20, currency: 'credits', amount: D('1e250'), lore: 'Credits sit beyond tokens: they preserve progress through a deeper reset and fund upgrades that outlast ordinary runs.' },
  { cost: 30, currency: 'data', lore: 'Data is the record left behind when P$ is cleared. It remembers what the foundry has learned without carrying the old balance forward.' },
  { cost: 40, currency: 'data', lore: 'The Pyramid was built as a test of repeatability. Its trials strip away accumulated credit, and each completed challenge leaves a permanent mark in the record.' }
];
function challengeGainMultiplier() { return (state.creditChallengeBoost ? state.completedChallenges.length + 1 : 1) * (1 + state.completedCombos.length * .1); }
function tokenIncomeRate() {
  if (!state.passiveTokens || state.tokenResetCount <= 0) return D(0);
  return softenGain(applyCurrencyGain(state.balance.div(state.tokenResetCount * 1000).times(challengeGainMultiplier())), 'tokens');
}
function tokenReward() {
  let reward = state.balance.div(nextGoal()).floor().times(D(1.25).pow(state.tokenBoostLevel));
  if (state.creditExponentLevel) reward = reward.pow(D(1.01).pow(state.creditExponentLevel));
  return softenGain(applyCurrencyGain(reward.times(state.researchBranch === 'resets' ? D(2).pow(state.researchLevel) : 1).times(tokenMultiplier()).times(challengeGainMultiplier())), 'tokens').times(kirbyBonus('mirror'));
}
function cubeMultiplier(target) {
  const unlocked = state.cubeUnlocked && (target === 'ascendance' ? state.ascCubeAscendance : target === 'alpha' ? state.ascCubeAlpha : true);
  return unlocked && state.cubeTarget === target ? D(state.cubeLevel).max(1) : D(1);
}
function cubeClickPower() { return 2 ** state.ascCubePowerLevel; }
function cubeClickGain() { return D(cubeClickPower()).times(applyCurrencyGain(1)); }
function ascendanceGain(amount) { return state.gainZeroActive ? D(0) : softenGain(D(amount).times(cubeMultiplier('ascendance')), 'ascendance'); }
function addCubeClicks(amount) {
  state.cubeClicks = plus(state.cubeClicks, amount);
  while (gte(state.cubeClicks, cubeNextCost())) {
    state.cubeClicks = minus(state.cubeClicks, cubeNextCost());
    state.cubeLevel += 1;
  }
}
function totalUpgradeLevels() {
  const levels = [state.multiplierLevel,state.incomeLevel,state.powerLevel,state.clickLevel,state.logLevel,state.exponentLevel,state.exponentCapLevel,state.capLevel,state.tokenMultiplierLevel,state.discountLevel,state.tokenBoostLevel,state.tokenCreditLevel,state.tokenDiscountLevel,state.creditExponentLevel,state.sparkUpgrade1Level,state.sparkUpgrade2Level,state.sparkUpgrade3Level,state.alphaGainPurchases,state.alphaBoostLevel,state.alphaCapLevel,state.ascCubePowerLevel,state.ascPointDiscountLevel,state.cyan14Level,state.darkMatter2Level];
  const bought = [state.printer,state.press,state.expansionUnlocked,state.maxBuyUnlocked,state.creditEngine,state.heavyMint,state.cubeUnlocked,state.freeRunUpgrades,state.passiveTokens,state.alphaUnlocked,state.casinoUnlocked,state.alphaNeutralBought,state.alphaGeneratorBought,state.darkMatterUnlocked,state.darkMatter1Bought,state.darkMatter3Bought,state.darkMatter4Bought,state.pyramidUnlocked,state.creditChallengeBoost,state.automationsUnlocked,state.ascCurrencyBoost,state.ascCreditExponent,state.ascCubeAutoclicker,state.ascCubeAscendance,state.ascCubeAlpha,state.ascTotalLevelBoost,state.pointUpgrade16Bought,state.pointUpgrade17Bought,state.pointUpgrade18Bought,state.pointUpgrade19Bought,state.pointUpgrade20Bought,state.cyan13Bought,state.cyan15Bought];
  return levels.reduce((sum, level) => sum + (Number(level) || 0), state.automationBought.filter(Boolean).length + state.dataLore.filter(Boolean).length + bought.filter(Boolean).length + state.ascAllCurrencyLevel + state.ascMainlinePowerLevel);
}
function pointMultiplier() { return D(state.creditEngine ? 25 : 1).times(state.heavyMint ? 5 : 1).times(cubeMultiplier('points')).times(state.ascTotalLevelBoost ? D(totalUpgradeLevels()).max(1) : 1).times(state.pointUpgrade16Bought ? 10 : 1).times(state.pointUpgrade17Bought ? 100 : 1).times(state.pointUpgrade18Bought ? 1000 : 1).times(state.pointUpgrade19Bought ? 1e6 : 1).times(state.pointUpgrade20Bought ? 1e12 : 1); }
function tokenMultiplier() { return D(state.creditEngine ? 25 : 1).times(state.heavyMint ? 5 : 1).times(cubeMultiplier('tokens')); }
function creditMultiplier() { return applyCurrencyGain(D(state.researchBranch === 'resets' ? 2 : 1).pow(state.researchLevel).times(cubeMultiplier('credits').times(state.tokenCreditLevel || 1).times(challengeGainMultiplier()))); }
function tokenCostMultiplier() { return D(state.heavyMint ? 7.5 : 1).div(state.priceOrigins?.tokenCostMultiplier || 1); }
function tokenAmplifierCost() { return D(3).times(tokenCostMultiplier()); }
function discountTokenCost() { return D(3).times(tokenCostMultiplier()); }
function multiplierCost(level = state.multiplierLevel) { return pointCost(D(100).times(D(1.5).pow(priceLevel('multiplierLevel', level))).times(D(0.7).pow(priceLevel('discountLevel', state.discountLevel))).max(1).ceil()); }
function incomeCost(level = state.incomeLevel) { return pointCost(D(50).times(D(1.5).pow(priceLevel('incomeLevel', level))).ceil()); }
function powerCost(level = state.powerLevel) { return pointCost(D(250).times(D(1.5).pow(priceLevel('powerLevel', level))).ceil()); }
function clickCost(level = state.clickLevel) { return pointCost(D(100).times(D(1.5).pow(priceLevel('clickLevel', level))).ceil()); }
function tokenBoostCost(level = state.tokenBoostLevel) { return D(5).times(D(1.5).pow(priceLevel('tokenBoostLevel', level))).times(tokenCostMultiplier()); }
function expansionCost() { return D(10).times(tokenCostMultiplier()); }
function maxBuyCost() { return D(25).times(tokenCostMultiplier()); }
function creditPowerCost(level = state.tokenCreditLevel) { return D('1e15').times(D(2.5).pow(priceLevel('tokenCreditLevel', level))).times(D(0.99).pow(priceLevel('tokenDiscountLevel', state.tokenDiscountLevel))).times(tokenCostMultiplier()); }
function tokenDiscountCost(level = state.tokenDiscountLevel) { return D('5e8').times(D(1.5).pow(priceLevel('tokenDiscountLevel', level))).times(tokenCostMultiplier()); }
function exponentCapCost(level = state.exponentCapLevel) { return pointCost(D('1e29').times(D(2).pow(priceLevel('exponentCapLevel', level)))); }
function logCost(level = state.logLevel) { return pointCost(D('1e9').times(D(1.5).pow(priceLevel('logLevel', level)))); }
function exponentCost(level = state.exponentLevel) { return pointCost(D('5e10').times(D(1.5).pow(priceLevel('exponentLevel', level)))); }
function capCost(level = state.capLevel) { return pointCost(D('5e8').times(D(1.5).pow(priceLevel('capLevel', level)))); }
function ascPointDiscountCost(level = state.ascPointDiscountLevel) { return D('1e300').times(D(1.5).pow(level)); }
function ascAllCurrencyCost(level = state.ascAllCurrencyLevel) { return D('1e12').times(D(10).pow(level)); }
function ascMainlinePowerCost(level = state.ascMainlinePowerLevel) { return D('1e600').times(D(1e6).pow(level)); }
function highPointUpgradeReady(index) { return index === 16 ? state.expansionUnlocked : state[`pointUpgrade${index - 1}Bought`]; }
function highPointUpgradeCost(index) { return pointCost(D(['1e180','1e200','1e220','1e240','1e260'][index - 16])); }
function sparkPrestigeCost() { return pointCost(SPARK_PRESTIGE_COST); }
function sparkReward(balance) { const ratio = D(balance).div(sparkPrestigeCost()); return ratio.lt(1) ? D(0) : softenGain(ratio.log10().floor().plus(1), 'spark'); }
function sparkUpgradeCost(index, level = state[`sparkUpgrade${index}Level`]) { const base = [0, 1, 10, 100][index]; const growth = [0, 1.5, 2, 3][index]; return D(base).times(D(growth).pow(level)); }
function cyanUpgradeCost(index) { return pointCost(D(10).pow([150, 160, 170][index] * (2 ** state.cyanSquareCounts[index]))); }
function cyanUpgradeReady(index) { return index === 0 ? state.automationsUnlocked : index === 1 ? state.pyramidUnlocked : true; }
function applyCyanAutomation() { if (state.cyan13Bought && state.creditChallengeBoost && !state.automationsUnlocked) { state.automationsUnlocked = true; return true; } return false; }
function buyCyanUpgrade(index) {
  const max = index === 1 ? 2 : 1;
  const level = index === 1 ? state.cyan14Level : index === 0 ? Number(state.cyan13Bought) : Number(state.cyan15Bought);
  const cost = cyanUpgradeCost(index);
  if (!cyanUpgradeReady(index) || level >= max || lt(state.balance, cost)) return;
  state.balance = minus(state.balance, cost);
  if (index === 0) state.cyan13Bought = true;
  if (index === 1) { state.cyan14Level += 1; if (state.activeChallenge && challengeDuration(state.activeChallenge)) state.challengeEndsAt += 60000; }
  if (index === 2) state.cyan15Bought = true;
  for (let other = 0; other < 3; other += 1) if (other !== index) state.cyanSquareCounts[other] += 1;
  toast(`Cyan upgrade ${13 + index} bought`); render(); save();
}
function creditPrestigeReward() {
  let reward = state.tokens.div('1e33').floor().times(creditMultiplier());
  if (state.ascCreditExponent) reward = reward.pow(1.5);
  return softenGain(reward, 'credits');
}
function dataReward(cost) {
  return softenGain(applyCurrencyGain(state.balance.div(cost).floor()), 'data');
}
function powerMax() { return 100 + state.capLevel * 2; }
function exponentMax() { return 1 + state.exponentCapLevel; }
// Quote the same credits and Ascendance as a credit prestige followed by Ascend.
function tokenAscendanceReward() {
  if (state.activeChallenge || lt(state.tokens, '1e33')) return D(0);
  return ascendanceGain(plus(state.credits, creditPrestigeReward()).div('1e250').floor());
}
function creditExponentCost(level = state.creditExponentLevel) { return D(2).times(D(2).pow(priceLevel('creditExponentLevel', level))); }
function cubeNextCost() { return D(2).pow(priceLevel('cubeLevel', state.cubeLevel)); }
function cubeClicksToNext() { return cubeNextCost().minus(state.cubeClicks).max(0); }
// Keep irrational components symbolic; alpha is the numeric projection used by progression.
function alphaTermsValue(terms) {
  return D(terms.base).plus(D(terms.e).times(Math.E)).plus(D(terms.pi).times(Math.PI));
}
function ensureAlphaTerms() {
  if (!state.alphaTerms || !alphaTermsValue(state.alphaTerms).eq(state.alpha)) {
    state.alphaTerms = { base: state.alpha.toString(), e: '0', pi: '0' };
  }
  return state.alphaTerms;
}
function changeAlpha(amount, kind = 'base') {
  const terms = ensureAlphaTerms();
  terms[kind] = D(terms[kind]).plus(amount).toString();
  state.alpha = alphaTermsValue(terms);
}
function symbolicAmount(terms) {
  const pieces = [];
  for (const [key, suffix] of [['base', ''], ['e', 'e'], ['pi', 'π']]) {
    const n = D(terms[key]);
    if (n.eq(0)) continue;
    const sign = n.lt(0) ? '−' : '+';
    const coefficient = suffix && n.abs().eq(1) ? '' : n.abs().toString();
    pieces.push(`${pieces.length ? ` ${sign} ` : n.lt(0) ? '−' : ''}${coefficient}${suffix}`);
  }
  return pieces.join('') || '0';
}
function alphaDisplay() {
  const terms = ensureAlphaTerms();
  return D(terms.e).eq(0) && D(terms.pi).eq(0) ? fmt(state.alpha) : symbolicAmount(terms);
}
function casinoStakeKind() {
  const raw = document.querySelector('#casino-stake').value.trim().toLowerCase();
  return raw === 'e' ? 'e' : ['pi', 'π'].includes(raw) ? 'pi' : 'base';
}
function casinoStakeLabel(amount, kind) {
  return symbolicAmount({ base: kind === 'base' ? amount : 0, e: kind === 'e' ? amount : 0, pi: kind === 'pi' ? amount : 0 });
}
const CASINO_UNLOCK_COST = D(250);
const ROULETTE_RED = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
function casinoStake() {
  const raw = document.querySelector('#casino-stake').value.trim().toLowerCase();
  const constants = { e: Math.E, pi: Math.PI, 'π': Math.PI };
  if (Object.hasOwn(constants, raw)) return D(constants[raw]);
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(raw)) return D(0);
  const stake = D(raw);
  return stake.isFinite() && stake.gte(1) ? stake : D(0);
}
function casinoAvailable() {
  return state.alphaUnlocked && state.casinoUnlocked && !state.gainZeroActive && !state.activeChallenge && !saveConflict;
}
function renderCasino() {
  document.querySelector('#alpha-casino').hidden = !state.alphaUnlocked || !state.casinoUnlocked;
  const unlock = document.querySelector('#buy-casino');
  unlock.disabled = !state.alphaUnlocked || state.casinoUnlocked || lt(state.alpha, CASINO_UNLOCK_COST);
  unlock.textContent = state.casinoUnlocked ? 'Unlocked' : `${fmt(CASINO_UNLOCK_COST)} α`;
  document.querySelector('#upgrade-casino').classList.toggle('locked', !state.alphaUnlocked);
  const stake = casinoStake(), ready = casinoAvailable();
  document.querySelector('#american-roulette').checked = state.americanRoulette;
  document.querySelector('#roulette-rules').textContent = state.americanRoulette ? 'American wheel: 38 pockets, including green 0 and 00.' : 'European wheel: 37 pockets, including green 0.';
  const numbers = document.querySelector('#roulette-number');
  if (numbers.options.length !== (state.americanRoulette ? 38 : 37)) {
    const selected = numbers.value;
    numbers.replaceChildren(...Array.from({length: 37}, (_, n) => new Option(String(n), String(n))));
    if (state.americanRoulette) numbers.add(new Option('00', '00'));
    numbers.value = selected === '00' && !state.americanRoulette ? '0' : selected || '0';
  }
  document.querySelector('#roulette-spin').disabled = !ready || stake.lt(1) || stake.gt(state.alpha);
  document.querySelector('#blackjack-deal').disabled = !ready || state.blackjackActive || stake.lt(1) || stake.gt(state.alpha);
  for (const action of ['hit', 'stand']) document.querySelector(`#blackjack-${action}`).disabled = !ready || !state.blackjackActive;
  const player = state.blackjackPlayer.map(cardName).join(' · ');
  const dealer = state.blackjackActive ? `${cardName(state.blackjackDealer[0])} · Hidden` : state.blackjackDealer.map(cardName).join(' · ');
  document.querySelector('#blackjack-cards').textContent = player ? `You: ${player} (${handTotal(state.blackjackPlayer)}). Dealer: ${dealer}${state.blackjackActive ? '' : ` (${handTotal(state.blackjackDealer)})`}.` : 'No hand in play.';
}
function spinRoulette() {
  const stake = casinoStake(), bet = document.querySelector('#roulette-bet').value;
  const number = document.querySelector('#roulette-number').value;
  if (!casinoAvailable() || stake.lt(1) || stake.gt(state.alpha) || !['red','black','number'].includes(bet)) return;
  const roll = Math.floor(Math.random() * (state.americanRoulette ? 38 : 37));
  const pocket = roll === 37 ? '00' : String(roll);
  const color = roll === 0 || roll === 37 ? 'green' : ROULETTE_RED.includes(roll) ? 'red' : 'black';
  const won = bet === 'number' ? number === pocket : bet === color;
  const kind = casinoStakeKind(), units = kind === 'base' ? stake : D(1);
  const net = won ? units.times(bet === 'number' ? 35 : 1) : units.neg();
  changeAlpha(net, kind);
  document.querySelector('#casino-result').textContent = `Roulette: ${pocket} ${color}. ${won ? `Won ${casinoStakeLabel(units.times(bet === 'number' ? 36 : 2), kind)} α including stake.` : `Lost ${casinoStakeLabel(units, kind)} α.`}`;
  render(); save();
}
function cardName(card) { return `${['A','2','3','4','5','6','7','8','9','10','J','Q','K'][card % 13]}${['♠','♥','♦','♣'][Math.floor(card / 13)]}`; }
function handTotal(cards) {
  let total = 0, aces = 0;
  for (const card of cards) { const rank = card % 13; total += rank === 0 ? 11 : Math.min(rank + 1, 10); if (rank === 0) aces++; }
  while (total > 21 && aces-- > 0) total -= 10;
  return total;
}
function settleBlackjack(multiplier, message) {
  const kind = state.blackjackStakeKind;
  const units = kind === 'base' ? state.blackjackStake : D(1);
  changeAlpha(units.times(multiplier), kind);
  state.blackjackActive = false;
  document.querySelector('#casino-result').textContent = `Blackjack: ${message} Payout ${casinoStakeLabel(units.times(multiplier), kind)} α including stake.`;
  state.blackjackStake = D(0);
}
function dealBlackjack() {
  const stake = casinoStake();
  if (!casinoAvailable() || state.blackjackActive || stake.lt(1) || stake.gt(state.alpha)) return;
  state.blackjackDeck = Array.from({length:52}, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [state.blackjackDeck[i], state.blackjackDeck[j]] = [state.blackjackDeck[j], state.blackjackDeck[i]]; }
  state.blackjackStakeKind = casinoStakeKind();
  changeAlpha(state.blackjackStakeKind === 'base' ? stake.neg() : -1, state.blackjackStakeKind); state.blackjackStake = stake; state.blackjackActive = true;
  state.blackjackPlayer = [state.blackjackDeck.pop(), state.blackjackDeck.pop()];
  state.blackjackDealer = [state.blackjackDeck.pop(), state.blackjackDeck.pop()];
  const playerNatural = handTotal(state.blackjackPlayer) === 21, dealerNatural = handTotal(state.blackjackDealer) === 21;
  if (playerNatural || dealerNatural) settleBlackjack(playerNatural ? dealerNatural ? 1 : 2.5 : 0, playerNatural ? dealerNatural ? 'Both blackjack. Push.' : 'Natural blackjack!' : 'Dealer blackjack.');
  else document.querySelector('#casino-result').textContent = `Stake ${casinoStakeLabel(state.blackjackStakeKind === 'base' ? stake : 1, state.blackjackStakeKind)} α placed. Hit or stand.`;
  render(); save();
}
function playBlackjack(action) {
  if (!casinoAvailable() || !state.blackjackActive || !['hit','stand'].includes(action)) return;
  if (action === 'hit') state.blackjackPlayer.push(state.blackjackDeck.pop());
  const player = handTotal(state.blackjackPlayer);
  if (player > 21) settleBlackjack(0, 'Bust.');
  else if (action === 'stand' || player === 21) {
    while (handTotal(state.blackjackDealer) < 17) state.blackjackDealer.push(state.blackjackDeck.pop());
    const dealer = handTotal(state.blackjackDealer);
    settleBlackjack(dealer > 21 || player > dealer ? 2 : player === dealer ? 1 : 0, dealer > 21 ? 'Dealer busts. You win!' : player > dealer ? 'You win!' : player === dealer ? 'Push.' : 'Dealer wins.');
  }
  render(); save();
}

function alphaBoostPrice() { return D(25).times(D(1.5).pow(priceLevel('alphaBoostLevel', state.alphaBoostLevel))).ceil(); }
function alphaCapPrice() { return D(100).times(D(1.5).pow(priceLevel('alphaCapLevel', state.alphaCapLevel))).ceil(); }
function darkMatterRate() { return !state.gainZeroActive && state.darkMatter1Bought ? D(0.1).times(D(2).pow(state.darkMatter2Level)).times(state.darkMatter3Bought ? state.darkMatterCoinBoost : 1) : D(0); }
function automationCost(index) { return 1e30 * (index + 1); }
function automationPrerequisite(index) {
  return [true, state.printer, state.press, state.press, state.multiplierLevel > 0, state.incomeLevel > 0, state.expansionUnlocked, state.expansionUnlocked, state.expansionUnlocked, state.expansionUnlocked && state.creditExponentLevel > 0, true, state.tokenBoostLevel > 0][index];
}
function setupAutomationCards() {
  const container = document.querySelector('#automation-upgrades');
  container.innerHTML = '<h3 class="automation-heading">Automations</h3>' + Array.from({ length: 12 }, (_, index) => {
    const target = index < 10 ? `upgrade ${index + 1}` : index === 10 ? '1T' : '4T';
    const number = index + 1;
    return `<article class="upgrade token-upgrade automation-upgrade" id="upgrade-automation-${number}" hidden><div><h3>${number}AU. Automate ${target}</h3><p>Permanent. Automatically buys ${target} when available.</p><div class="effect">${state.automationBought[index] ? 'Automation active' : 'One time'}</div></div><button id="buy-automation-${number}" type="button">${fmt(automationCost(index))} tokens</button></article>`;
  }).join('');
}
const NUMBER_SUFFIXES = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'De'];

function fmt(value) {
  const number = D(value);
  if (number.isNan()) return '0';
  if (!number.isFinite()) return number.sign < 0 ? '-∞' : '∞';
  const magnitude = number.abs();
  if (magnitude.lt(1000)) {
    const small = number.toNumber();
    return Number.isInteger(small) ? String(small) : small.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }
  if (magnitude.lt('1e36')) {
    const group = Math.floor(magnitude.e / 3);
    const scaled = Number(number.div(D(10).pow(group * 3)).toNumber().toPrecision(3));
    if (Math.abs(scaled) < 1000) return `${scaled}${NUMBER_SUFFIXES[group - 1]}`;
    if (group < NUMBER_SUFFIXES.length) return `${number.sign}${NUMBER_SUFFIXES[group]}`;
  }
  return number.toExponential(2).replace(/e\+/g, 'e');
}
function toast(message) {
  const el = document.querySelector('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}
function purchase(cost, action, message, spend = true) {
  if (lt(state.balance, cost)) return;
  if (spend) state.balance = minus(state.balance, cost);
  action();
  toast(message);
  render();
}
const levelUpgrades = {
  run: {
    multiplier: { key: 'multiplierLevel', max: upgradeLevelMax, cost: multiplierCost, ready: () => state.press, kept: true, message: 'Compounding level added' },
    income: { key: 'incomeLevel', max: upgradeLevelMax, cost: incomeCost, ready: () => state.press, kept: true, message: 'Output level added' },
    cap: { key: 'capLevel', max: upgradeLevelMax, cost: capCost, ready: () => state.expansionUnlocked, kept: true, message: 'Upgrade 5 capacity increased' },
    'exponent-cap': { key: 'exponentCapLevel', max: () => 5, cost: exponentCapCost, ready: () => state.expansionUnlocked && state.creditExponentLevel >= 1, message: 'Upgrade 8 max level increased' },
    power: { key: 'powerLevel', max: powerMax, cost: powerCost, ready: () => state.multiplierLevel > 0, message: 'Compounding II level added' },
    click: { key: 'clickLevel', max: upgradeLevelMax, cost: clickCost, ready: () => state.incomeLevel > 0, message: 'Click power increased' },
    log: { key: 'logLevel', max: () => 3, cost: logCost, ready: () => state.expansionUnlocked, message: 'Logarithmic output increased' },
    exponent: { key: 'exponentLevel', max: exponentMax, cost: exponentCost, ready: () => state.expansionUnlocked, message: 'Gain exponent increased' },
    'point-discount': { key: 'ascPointDiscountLevel', max: () => 20, cost: ascPointDiscountCost, ready: () => state.ascCreditExponent, message: 'All P$ costs halved' }
  },
  token: {
    'token-multiplier': { key: 'tokenMultiplierLevel', max: () => 10, cost: tokenAmplifierCost, message: 'Token amplifier level added' },
    discount: { key: 'discountLevel', max: upgradeLevelMax, cost: discountTokenCost, ready: () => state.tokenMultiplierLevel > 0, message: 'Bulk pricing level added' },
    'token-boost': { key: 'tokenBoostLevel', max: () => 10, cost: tokenBoostCost, ready: () => state.tokenMultiplierLevel > 0, message: 'Token foundry level added' },
    'credit-power': { key: 'tokenCreditLevel', max: () => 50, cost: creditPowerCost, ready: () => state.expansionUnlocked, message: 'Factorial Power increased' },
    'token-discount': { key: 'tokenDiscountLevel', max: () => 25, cost: tokenDiscountCost, ready: () => state.tokenCreditLevel > 0, message: 'Factorial cost reduced' }
  },
  credit: {
    'credit-exponent': { key: 'creditExponentLevel', max: () => 3, cost: creditExponentCost, ready: () => state.creditEngine, message: 'Token exponent increased' }
  },
  spark: Object.fromEntries([1000, 100, 50].map((max, index) => {
    const number = index + 1;
    return [`spark-${number}`, {
      key: `sparkUpgrade${number}Level`,
      max: () => max,
      cost: level => sparkUpgradeCost(number, level),
      message: `Spark upgrade ${number} accelerated P$ production`
    }];
  })),
  alpha: {
    'fish-1': { key: 'fishGainLevel', max: () => 2, cost: level => D(5 * (level + 1)), ready: () => state.fishingUnlocked, message: 'Fish Point gain increased' },
    'fish-2': { key: 'redFishLevel', max: () => 1, cost: () => D(10), ready: () => state.fishingUnlocked, message: 'Red Fish added to the pond' },
    'fish-3': { key: 'fishAlphaLevel', max: () => 1, cost: () => D(25), ready: () => state.fishingUnlocked, message: 'Fish Points now boost Alpha gain' }
  },
  ascendance: {
    'asc-3': { key: 'ascCubePowerLevel', max: () => 5, cost: () => D(10), ready: () => state.ascCurrencyBoost && state.cubeUnlocked, message: 'Cube click power doubled' },
    'asc-8': { key: 'ascAllCurrencyLevel', max: () => 50, cost: ascAllCurrencyCost, message: 'All previous currency gains doubled' },
    'asc-9': { key: 'ascMainlinePowerLevel', max: () => 10, cost: ascMainlinePowerCost, message: 'Mainline currency gains raised to a higher power' },
    'asc-10': { key: 'scaryModeLevel', max: () => 1, cost: () => D('1e666'), message: 'SCARY' }
  }
};
const upgradeCurrencies = { run: 'balance', token: 'tokens', credit: 'credits', spark: 'spark', ascendance: 'ascendance', alpha: 'fishPoints' };

function clampUpgradeLevels() {
  // Cap-granting upgrades in the run table come before the levels they affect.
  for (const upgrades of Object.values(levelUpgrades)) {
    for (const { key, max } of Object.values(upgrades)) {
      const limit = max();
      if (state[key] <= limit) continue;
      state[key] = limit;
      if (state.priceOrigins[key] > limit) state.priceOrigins[key] = limit;
    }
  }
  state.darkMatter2Level = Math.min(state.darkMatter2Level, 1000);
  const excessTrialLevels = state.cyan14Level - 2;
  if (excessTrialLevels > 0) {
    state.cyan14Level = 2;
    if (challengeDuration(state.activeChallenge)) {
      state.challengeEndsAt -= excessTrialLevels * 60000;
    }
  }
}

function levelPurchase(upgrade, balance, maxBuy) {
  const start = state[upgrade.key];
  const max = Math.min(upgrade.max(), maxBuy ? Infinity : start + 1);
  const spend = !(upgrade.kept && state.freeRunUpgrades);
  let total = D(0);
  let level = start;
  for (; level < max; level += 1) {
    const price = upgrade.cost(level);
    if (lt(balance, price)) break;
    if (spend) {
      balance = minus(balance, price);
      total = plus(total, price);
    }
  }
  return { count: level - start, balance, total };
}

function levelPrice(currency, amount) {
  const unit = { tokens: 'tokens', credits: 'C$', spark: '⊹', ascendance: 'ᛥ', fishPoints: '🐟' };
  return currency === 'balance' ? `P$ ${amount}` : `${amount} ${unit[currency]}`;
}

function renderLevelUpgrades() {
  const currency = upgradeCurrencies[activeTab];
  const maxBuy = state.maxBuyUnlocked && state.maxBuyActive;
  for (const [id, upgrade] of Object.entries(levelUpgrades[activeTab] ?? {})) {
    const button = document.querySelector(`#buy-${id}`);
    const level = state[upgrade.key];
    const capped = level >= upgrade.max();
    const ready = upgrade.ready?.() ?? true;
    const price = upgrade.cost(level);
    button.disabled = capped || !ready || lt(state[currency], price);
    document.querySelector(`#upgrade-${id}`).classList.toggle('locked', !ready);
    if (maxBuy && !button.disabled) {
      const { count, total } = levelPurchase(upgrade, state[currency], true);
      button.textContent = `${levelPrice(currency, fmt(total))} · ×${count}`;
      button.title = levelPrice(currency, total.toString());
    } else {
      const kept = upgrade.kept && state.freeRunUpgrades ? ' · kept' : '';
      button.textContent = capped ? 'MAX LEVEL' : levelPrice(currency, fmt(price)) + kept;
      button.removeAttribute('title');
    }
  }
}

const THEME_KEY = 'generic-incremental-dark-mode';
const themeToggle = document.querySelector('#theme-toggle');
let darkMode = false;
try {
  darkMode = localStorage.getItem(THEME_KEY) === 'true';
} catch {
  // The switch can still work for this page when storage is unavailable.
}
themeToggle.checked = darkMode;

function matterName() {
  return darkMode ? 'Light Matter' : 'Dark Matter';
}

function applyThemePreference() {
  document.querySelectorAll('[data-matter-name]').forEach(label => {
    label.textContent = matterName();
  });
}

themeToggle.addEventListener('change', () => {
  darkMode = themeToggle.checked;
  applyThemePreference();
  renderTheme();
  try {
    localStorage.setItem(THEME_KEY, String(darkMode));
  } catch {
    // Keep the current theme even if the preference cannot be saved.
  }
});
applyThemePreference();

function renderTheme() {
  const matterTab = activeTab === 'darkmatter';
  const darkScreen = darkMode !== matterTab;
  document.body.classList.toggle('dark-screen', darkScreen);
  document.body.classList.toggle('light-matter-screen', darkMode && matterTab);
  document.querySelector('meta[name="theme-color"]').content = darkScreen ? '#000000' : '#ffffff';
}

function fishingPhase(now) {
  if (fishingBiteAt === null) return 'idle';
  if (now < fishingBiteAt) return 'waiting';
  const reelWindow = fishingRedFish ? RED_FISH_REEL_WINDOW : FISHING_REEL_WINDOW;
  if (now < fishingBiteAt + reelWindow) return 'bite';
  return 'escaped';
}

function renderFishing() {
  const unlocked = state.alphaUnlocked && state.fishingUnlocked;
  const unlockCard = document.querySelector('#upgrade-fishing');
  const pond = document.querySelector('#fishing-pond');
  unlockCard.hidden = !state.alphaUnlocked || unlocked;
  document.querySelector('#buy-fishing').disabled = !state.alphaUnlocked || unlocked || lt(state.alpha, FISHING_COST);
  pond.hidden = !unlocked;
  document.querySelector('#fish-upgrades').hidden = !unlocked;
  if (!unlocked) return;

  document.querySelector('#fish-gain-level').textContent = state.fishGainLevel;
  document.querySelector('#fish-alpha-multiplier').textContent = fmt(fishAlphaMultiplier());

  if (state.gainZeroActive) fishingBiteAt = null;
  let phase = fishingPhase(performance.now());
  if (phase === 'escaped') {
    fishingBiteAt = null;
    fishingResult = 'Too late. The fish got away.';
    phase = 'idle';
  }
  const status = document.querySelector('#fishing-status');
  const message = state.gainZeroActive ? 'Fishing is paused during Null gain.'
    : phase === 'waiting' ? 'Waiting for a bite…'
    : phase === 'bite' ? (fishingRedFish ? 'Red Fish! Reel in now!' : 'Bite! Reel in now!')
    : fishingResult;
  if (status.textContent !== message) status.textContent = message;
  pond.toggleAttribute('data-bite', phase === 'bite');
  pond.toggleAttribute('data-red-bite', phase === 'bite' && fishingRedFish);
  const action = document.querySelector('#fishing-action');
  action.disabled = state.gainZeroActive;
  const label = phase === 'idle' ? 'Cast line' : 'Reel in';
  if (action.textContent !== label) action.textContent = label;
  document.querySelector('#fish-points').textContent = fmt(state.fishPoints);
}

const garbageForm = document.querySelector('#garbage-form');
const garbageCurrency = document.querySelector('#garbage-currency');
const garbageAmount = document.querySelector('#garbage-amount');
const garbageAll = document.querySelector('#garbage-all');

function renderGarbage() {
  document.querySelector('#upgrade-garbage').hidden = state.garbageUnlocked;
  document.querySelector('#buy-garbage').disabled = state.garbageUnlocked || lt(state.tokens, GARBAGE_COST);
  garbageForm.hidden = !state.garbageUnlocked;
  if (!state.garbageUnlocked) return;
  const balance = state[garbageCurrency.value];
  document.querySelector('#garbage-balance').textContent = fmt(balance);
  garbageAll.disabled = balance.lte(0);
  document.querySelector('#garbage-delete').disabled = balance.lte(0);
}

function discardCurrency(discardAll) {
  if (!state.garbageUnlocked || saveConflict) return;
  const key = garbageCurrency.value;
  const balance = state[key];
  const input = garbageAmount.value.trim();
  const decimal = /^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
  const layered = /^(?:e{2,}|\(e\^\d+\))[+-]?\d+(?:\.\d+)?$/i;
  if (!discardAll && !decimal.test(input) && !layered.test(input)) {
    toast('Enter an amount such as 100 or 1e900.');
    return;
  }
  const amount = discardAll ? balance : D(input);
  if (!amount.isFinite() || !amount.gt(0) || amount.gt(balance)) {
    toast('Enter a positive amount up to your balance.');
    return;
  }
  const remaining = balance.minus(amount);
  const label = garbageCurrency.selectedOptions[0].textContent;
  if (!window.confirm(`Permanently delete ${discardAll ? 'all' : amount.toString()} ${label}?`)) return;
  if (key === 'alpha') {
    if (discardAll) { state.alpha = D(0); state.alphaTerms = null; }
    else changeAlpha(amount.neg());
  } else state[key] = remaining;
  garbageAmount.value = '';
  save();
  render();
  toast(`${fmt(amount)} ${label} deleted.`);
}

document.querySelector('#buy-garbage').addEventListener('click', () => {
  if (state.garbageUnlocked || lt(state.tokens, GARBAGE_COST)) return;
  state.tokens = minus(state.tokens, GARBAGE_COST);
  state.garbageUnlocked = true;
  save();
  render();
});
garbageCurrency.addEventListener('change', renderGarbage);
garbageForm.addEventListener('submit', event => {
  event.preventDefault();
  discardCurrency(false);
});
garbageAll.addEventListener('click', () => discardCurrency(true));

// Use the existing goal fraction for every style; no extra animation timers.
function renderPrestigeProgress(fraction) {
  const p = Number.isNaN(fraction) ? 0 : Math.max(0, Math.min(1, fraction));
  const style = PRESTIGE_STYLES.includes(state.prestigeAnimation) ? state.prestigeAnimation : 'bar';
  const visual = document.getElementById('prestige-progress');
  visual.dataset.style = style;
  visual.setAttribute('aria-valuenow', String(p * 100));
  visual.setAttribute('aria-valuetext', `${(p * 100).toFixed(1)}% of prestige goal`);
  visual.style.setProperty('--progress-angle', `${p * 360}deg`);
  visual.style.setProperty('--progress-color', `hsl(${220 - p * 80} 65% 45%)`);
  for (const part of visual.querySelectorAll('[data-visual]')) {
    part.hidden = !(part.dataset.visual === style || style === 'pro' && ['multibar', 'letters', 'color'].includes(part.dataset.visual));
  }
  document.getElementById('progress-fill').style.width = `${p * 100}%`;
  // Three nested base-10 bars: fine progress rolls over into the next row.
  visual.querySelectorAll('.progress-multibar i').forEach((bar, i) => {
    const units = p * 10 ** (3 - i);
    const fill = p === 1 ? 1 : (i === 0 ? units % 10 : Math.floor(units) % 10) / 10;
    bar.style.setProperty('--bar-fill', `${fill * 100}%`);
  });
  let index = Math.floor(p * (26 ** 3 - 1));
  let letters = '';
  for (let i = 0; i < 3; i++) {
    letters = String.fromCharCode(65 + index % 26) + letters;
    index = Math.floor(index / 26);
  }
  visual.querySelector('.progress-letters b').textContent = letters;
  visual.querySelector('.progress-letters span').style.width = `${p === 1 ? 100 : (p * (26 ** 3 - 1) % 1) * 100}%`;
  document.getElementById('prestige-animation').value = style;
}

function render() {
  document.getElementById('scary-overlay').hidden = !state.scaryModeLevel || !state.scaryModeActive;
  document.getElementById('scary-mode-setting').hidden = !state.scaryModeLevel;
  document.getElementById('scary-mode').checked = state.scaryModeActive;
  document.getElementById('hard-mode').checked = state.hardMode;
  document.body.classList.toggle('hard-mode', state.hardMode);
  renderKirby();
  renderExpansion();
  renderTheme();
  renderFishing();
  renderGarbage();
  if (applyCyanAutomation()) save();
  const balance = document.querySelector('#balance');
  const balanceLabel = document.querySelector('#balance-label');
  const rateLine = document.querySelector('#rate-line');
  const counter = activeTab === 'spark'
    ? { label: 'AVAILABLE SPARK · ⊹', value: state.spark, color: 'spark', detail: `${fmt(rate())} P$ per second` }
    : activeTab === 'darkmatter'
    ? { label: 'AVAILABLE ⊠', value: state.darkMatter, color: 'darkmatter', detail: `${fmt(darkMatterRate())} ⊠ per second` }
    : activeTab === 'alpha'
    ? { label: 'AVAILABLE α', value: state.alpha, color: 'alpha', detail: 'Alpha upgrades' }
    : activeTab === 'ascendance'
    ? { label: 'ASCENDANCE POINTS · ᛥ', value: state.ascendance, color: 'ascendance', detail: 'Ascendance upgrades' }
    : activeTab === 'data'
    ? { label: 'AVAILABLE 𝔻', value: state.data, color: 'data', detail: 'Data archive' }
    : activeTab === 'token'
    ? { label: 'AVAILABLE TOKENS', value: state.tokens, color: 'tokens', detail: `${fmt(tokenIncomeRate())} tokens per second` }
    : activeTab === 'credit'
      ? { label: 'AVAILABLE C$', value: state.credits, color: 'credits', detail: 'Earned on token prestige' }
      : activeTab === 'cube'
        ? { label: 'CUBE CLICKS · CC', value: state.cubeClicks, color: 'cc', detail: `${fmt(cubeClicksToNext())} CC to next cube level` }
        : { label: 'AVAILABLE P$', value: state.balance, color: 'points', detail: `${fmt(rate())} P$ per second` };
  balanceLabel.textContent = counter.label;
  balance.textContent = activeTab === 'alpha' ? alphaDisplay() : fmt(counter.value);
  balance.className = `balance currency-${counter.color}`;
  rateLine.textContent = counter.detail;
  const limit = document.querySelector('#mainline-soft-cap');
  const currency = MAINLINE_CURRENCIES[counter.color];
  const divisor = currency ? mainlineGainDivisor(currency) : D(1);
  limit.hidden = divisor.lte(1);
  if (!limit.hidden) limit.textContent = `Gain divided by ${fmt(divisor)} · ÷2 per power of 10 above 1e1000`;
  document.querySelector('#work-button').textContent = state.gainZeroActive ? 'Restore currency gains ×1' : `Generic Button · +P$${fmt(saleGain())}`;
  document.querySelector('#run-earned').textContent = fmt(state.runEarned);
  document.querySelector('#prestige-tokens').textContent = fmt(state.tokens);
  document.querySelector('#credit-balance').textContent = fmt(state.credits);
  document.querySelector('#ascendance-balance').textContent = fmt(state.ascendance);
  document.querySelector('#run-label').textContent = gt(state.runEarned, 0) ? 'ACTIVE RUN' : 'NEW RUN';
  const goal = nextGoal();
  document.querySelector('#prestige-goal').textContent = `P$ ${fmt(goal)}`;
  renderPrestigeProgress(state.balance.div(goal).toNumber());
  document.querySelector('#mult-level').textContent = state.multiplierLevel;
  document.querySelector('#income-level').textContent = state.incomeLevel;
  document.querySelector('#mult-level-max').textContent = upgradeLevelMax();
  document.querySelector('#income-level-max').textContent = upgradeLevelMax();
  document.querySelector('#cap-level-max').textContent = upgradeLevelMax();
  document.querySelector('#discount-level-max').textContent = upgradeLevelMax();
  document.querySelector('#income-level-effect').textContent = fmt(state.incomeLevel * (state.incomeLevel + 1) / 2);
  document.querySelector('#power-level').textContent = state.powerLevel;
  document.querySelector('#click-level').textContent = state.clickLevel;
  document.querySelector('#click-level-max').textContent = upgradeLevelMax();
  document.querySelector('#click-bonus').textContent = state.clickLevel * 2;
  document.querySelector('#token-mult-level').textContent = state.tokenMultiplierLevel;
  document.querySelector('#discount-level').textContent = state.discountLevel;
  document.querySelector('#token-boost-level').textContent = state.tokenBoostLevel;
  document.querySelector('#token-credit-factor').textContent = state.tokenCreditLevel || 1;
  document.querySelector('#token-credit-level').textContent = state.tokenCreditLevel;
  document.querySelector('#token-discount-level').textContent = state.tokenDiscountLevel;
  document.querySelector('#challenge-gain-multiplier').textContent = challengeGainMultiplier();
  document.querySelector('#log-level').textContent = state.logLevel;
  document.querySelector('#exponent-level').textContent = state.exponentLevel;
  document.querySelector('#exponent-max').textContent = exponentMax();
  document.querySelector('#exponent-cap-level').textContent = state.exponentCapLevel;
  document.querySelector('#passive-token-rate').textContent = fmt(tokenIncomeRate());
  document.querySelector('#cap-level').textContent = state.capLevel;
  const powerLevelMax = powerMax();
  document.querySelector('#power-level-max').textContent = powerLevelMax;
  document.querySelector('#power-cap').textContent = powerLevelMax;
  document.querySelector('#token-tab').hidden = state.totalPrestiges < 1 && lt(state.tokens, 1) && !state.garbageUnlocked;
  const hasCredits = state.totalCreditPrestiges > 0 || gt(state.credits, 0) || state.creditEngine || state.cubeUnlocked || state.pyramidUnlocked;
  document.querySelector('#credit-tab').hidden = !hasCredits;
  document.querySelector('#data-tab').hidden = state.totalDataPrestiges < 1 && lt(state.data, 1) && !state.dataLore.some(Boolean);
  document.querySelector('#spark-tab').hidden = state.sparkPrestiges < 1 && lt(state.spark, 1);
  document.querySelector('#cube-tab').hidden = !state.cubeUnlocked;
  document.querySelector('#pyramid-tab').hidden = !state.pyramidUnlocked;
  document.querySelector('#alpha-tab').hidden = !state.alphaUnlocked;
  document.querySelector('#darkmatter-tab').hidden = !state.darkMatterUnlocked;
  document.querySelector('#ascendance-tab').hidden = state.totalAscendances < 1 && lt(state.ascendance, 1);
  const gainZeroCard = document.querySelector('#upgrade-gain-zero');
  const gainZeroButton = document.querySelector('#buy-gain-zero');
  gainZeroCard.hidden = false;
  gainZeroCard.classList.remove('locked');
  document.querySelector('#gain-zero-factor').textContent = currencyGainMultiplier();
  gainZeroButton.disabled = false;
  gainZeroButton.textContent = state.gainZeroBought ? (state.gainZeroActive ? 'Active · toggle off' : 'Inactive · toggle on') : 'Free';
  document.querySelector('#cube-click-button').textContent = `+${fmt(cubeClickGain())} CC`;
  const alphaUnlock = document.querySelector('#buy-alpha-unlock');
  alphaUnlock.disabled = !state.printer || state.alphaUnlocked;
  alphaUnlock.textContent = state.alphaUnlocked ? 'Unlocked' : 'Free';
  document.querySelector('#upgrade-alpha-unlock').classList.toggle('locked', !state.printer && !state.alphaUnlocked);
  const asc1 = document.querySelector('#buy-asc-1');
  asc1.disabled = state.ascCurrencyBoost || lt(state.ascendance, 5);
  asc1.textContent = state.ascCurrencyBoost ? 'Bought' : '5 ᛥ';
  document.querySelector('#upgrade-asc-1').classList.toggle('locked', state.ascCurrencyBoost);
  const asc2Ready = state.ascCurrencyBoost && state.completedChallenges.includes('deduction2');
  const asc2 = document.querySelector('#buy-asc-2');
  asc2.disabled = !asc2Ready || state.ascCreditExponent;
  asc2.textContent = state.ascCreditExponent ? 'Bought' : 'Free';
  document.querySelector('#upgrade-asc-2').classList.toggle('locked', !asc2Ready);
  document.querySelector('#asc-cube-power').textContent = cubeClickPower();
  document.querySelector('#asc-cube-power-level').textContent = state.ascCubePowerLevel;
  const asc7 = document.querySelector('#buy-asc-7');
  asc7.disabled = !state.ascCreditExponent || state.ascTotalLevelBoost || lt(state.ascendance, '1e10');
  asc7.textContent = state.ascTotalLevelBoost ? 'Bought' : '1e10 ᛥ';
  document.querySelector('#upgrade-asc-7').classList.toggle('locked', !state.ascCreditExponent);
  document.querySelector('#asc-total-level-multiplier').textContent = fmt(D(totalUpgradeLevels()).max(1));
  document.querySelector('#asc-all-currency-level').textContent = state.ascAllCurrencyLevel;
  document.querySelector('#asc-all-currency-multiplier').textContent = fmt(D(2).pow(state.ascAllCurrencyLevel));
  document.querySelector('#asc-mainline-power-level').textContent = state.ascMainlinePowerLevel;
  document.querySelector('#asc-mainline-power').textContent = fmt(D(1.3).pow(state.ascMainlinePowerLevel));
  for (const [id, available, bought] of [
    ['4', state.ascCubePowerLevel > 0, state.ascCubeAutoclicker],
    ['5', state.ascCubePowerLevel > 0, state.ascCubeAscendance],
    ['6', state.ascCubePowerLevel > 0 && state.alphaUnlocked, state.ascCubeAlpha]
  ]) {
    const button = document.querySelector(`#buy-asc-${id}`);
    button.disabled = !available || bought;
    button.textContent = bought ? 'Bought' : 'Free';
    document.querySelector(`#upgrade-asc-${id}`).classList.toggle('locked', !available);
  }
  document.querySelector('#asc-point-discount-level').textContent = state.ascPointDiscountLevel;
  for (let i = 16; i <= 20; i += 1) {
    const bought = state[`pointUpgrade${i}Bought`];
    const cost = highPointUpgradeCost(i);
    const button = document.querySelector(`#buy-point-${i}`);
    button.disabled = !highPointUpgradeReady(i) || bought || lt(state.balance, cost);
    button.textContent = bought ? 'Bought' : `P$ ${fmt(cost)}`;
    document.querySelector(`#upgrade-point-${i}`).classList.toggle('locked', !highPointUpgradeReady(i));
  }
  for (let i = 0; i < 3; i += 1) {
    const button = document.querySelector(`#buy-cyan-${13 + i}`);
    const level = i === 1 ? state.cyan14Level : i === 0 ? Number(state.cyan13Bought) : Number(state.cyan15Bought);
    const max = i === 1 ? 2 : 1;
    const cost = cyanUpgradeCost(i);
    button.disabled = !cyanUpgradeReady(i) || level >= max || lt(state.balance, cost);
    button.textContent = level >= max ? 'Bought' : `P$ ${fmt(cost)}`;
    document.querySelector(`#upgrade-cyan-${13 + i}`).classList.toggle('locked', !cyanUpgradeReady(i));
  }
  document.querySelector('#cyan-14-level').textContent = state.cyan14Level;
  document.querySelector('#cyan-15-max').textContent = upgradeLevelMax();
  document.querySelector('.cube-target[data-target="ascendance"]').hidden = !state.ascCubeAscendance;
  document.querySelector('.cube-target[data-target="alpha"]').hidden = !state.ascCubeAlpha;

  const printer = document.querySelector('#buy-printer');
  printer.disabled = state.printer;
  printer.textContent = state.printer ? 'Bought' : 'Free';
  const press = document.querySelector('#buy-press');
  press.disabled = !state.printer || state.press || lt(state.balance, pointCost(10));
  press.textContent = state.press ? 'Bought' : `P$ ${fmt(pointCost(10))}`;
  document.querySelector('#upgrade-press').classList.toggle('locked', !state.printer);

  const unlock = document.querySelector('#buy-unlock');
  unlock.disabled = state.tokenBoostLevel < 1 || lt(state.tokens, expansionCost()) || state.expansionUnlocked;
  unlock.textContent = state.expansionUnlocked ? 'Unlocked' : `${fmt(expansionCost())} tokens`;
  document.querySelector('#upgrade-unlock').classList.toggle('locked', state.tokenBoostLevel < 1 || state.expansionUnlocked);
  const maxBuyUnlock = document.querySelector('#buy-max-buy');
  maxBuyUnlock.disabled = !state.expansionUnlocked || state.maxBuyUnlocked || lt(state.tokens, maxBuyCost());
  maxBuyUnlock.textContent = state.maxBuyUnlocked ? 'Unlocked' : `${fmt(maxBuyCost())} tokens`;
  const maxBuyToggle = document.querySelector('#max-buy-toggle');
  maxBuyToggle.hidden = !state.maxBuyUnlocked || !['run', 'token', 'credit', 'spark', 'ascendance'].includes(activeTab);
  maxBuyToggle.setAttribute('aria-pressed', String(state.maxBuyActive));
  const challengeBoost = document.querySelector('#buy-credit-challenge-boost');
  challengeBoost.disabled = !state.pyramidUnlocked || state.creditChallengeBoost || lt(state.credits, 1e7);
  challengeBoost.textContent = state.creditChallengeBoost ? 'Bought' : '10M C$';
  document.querySelector('#upgrade-credit-challenge-boost').classList.toggle('locked', !state.pyramidUnlocked);
  const automationUnlock = document.querySelector('#buy-automation-unlock');
  automationUnlock.disabled = !state.creditChallengeBoost || state.automationsUnlocked || lt(state.credits, 1e8);
  automationUnlock.textContent = state.automationsUnlocked ? 'Unlocked' : '100M C$';
  document.querySelector('#upgrade-automation-unlock').classList.toggle('locked', !state.creditChallengeBoost);
  document.querySelector('#automation-upgrades').hidden = !state.automationsUnlocked;
  for (let i = 0; i < 12; i += 1) {
    const number = i + 1;
    const card = document.querySelector(`#upgrade-automation-${number}`);
    const button = document.querySelector(`#buy-automation-${number}`);
    const available = state.automationsUnlocked && automationPrerequisite(i);
    card.hidden = !available && !state.automationBought[i];
    card.classList.toggle('locked', !available && !state.automationBought[i]);
    button.disabled = state.automationBought[i] ? false : (!available || lt(state.tokens, automationCost(i)));
    button.textContent = state.automationBought[i] ? (state.automationActive[i] ? 'Active · pause' : 'Paused · resume') : `${fmt(automationCost(i))} tokens`;
    card.querySelector('.effect').textContent = state.automationBought[i] ? (state.automationActive[i] ? 'Permanent · active' : 'Permanent · paused') : 'One time';
  }
  document.querySelector('#run-upgrades').hidden = activeTab !== 'run';
  document.querySelector('#token-upgrades').hidden = activeTab !== 'token';
  document.querySelector('#credit-upgrades').hidden = activeTab !== 'credit';
  document.querySelector('#data-upgrades').hidden = activeTab !== 'data';
  document.querySelector('#spark-upgrades').hidden = activeTab !== 'spark';
  document.querySelector('#cube-panel').hidden = activeTab !== 'cube';
  document.querySelector('#pyramid-panel').hidden = activeTab !== 'pyramid';
  document.querySelector('#alpha-upgrades').hidden = activeTab !== 'alpha';
  document.querySelector('#darkmatter-upgrades').hidden = activeTab !== 'darkmatter';
  document.querySelector('#darkmatter-tab').classList.toggle('active', activeTab === 'darkmatter');
  document.querySelector('#ascendance-upgrades').hidden = activeTab !== 'ascendance';
  document.querySelector('#run-tab').classList.toggle('active', activeTab === 'run');
  document.querySelector('#token-tab').classList.toggle('active', activeTab === 'token');
  document.querySelector('#credit-tab').classList.toggle('active', activeTab === 'credit');
  document.querySelector('#cube-tab').classList.toggle('active', activeTab === 'cube');
  document.querySelector('#pyramid-tab').classList.toggle('active', activeTab === 'pyramid');
  document.querySelector('#alpha-tab').classList.toggle('active', activeTab === 'alpha');
  document.querySelector('#ascendance-tab').classList.toggle('active', activeTab === 'ascendance');
  document.querySelector('#data-tab').classList.toggle('active', activeTab === 'data');
  document.querySelector('#spark-tab').classList.toggle('active', activeTab === 'spark');
  renderCasino();
  document.querySelector('#alpha-gain-amount').textContent = fmt(applyAlphaGain(1 + state.alphaBoostLevel).times(cubeMultiplier('alpha')));
  document.querySelector('#alpha-boost-level').textContent = state.alphaBoostLevel;
  const alphaBoostMax = 50 + state.alphaCapLevel * 2;
  document.querySelector('#alpha-boost-max').textContent = alphaBoostMax;
  const alphaBoost = document.querySelector('#buy-alpha-boost');
  const alphaBoostCost = alphaBoostPrice();
  alphaBoost.disabled = !state.alphaUnlocked || state.alphaBoostLevel >= alphaBoostMax || lt(state.alpha, alphaBoostCost);
  alphaBoost.textContent = state.alphaBoostLevel >= alphaBoostMax ? 'MAX LEVEL' : `${fmt(alphaBoostCost)} α`;
  document.querySelector('#upgrade-alpha-boost').classList.toggle('locked', !state.alphaUnlocked);
  document.querySelector('#upgrade-alpha-boost').hidden = state.alphaGainPurchases < 1;
  const alphaNeutral = document.querySelector('#buy-alpha-neutral');
  alphaNeutral.disabled = !state.alphaUnlocked || state.alphaBoostLevel < 1 || state.alphaNeutralBought;
  alphaNeutral.textContent = state.alphaNeutralBought ? 'Bought' : '−5 α';
  document.querySelector('#upgrade-alpha-neutral').classList.toggle('locked', !state.alphaUnlocked || state.alphaBoostLevel < 1);
  document.querySelector('#upgrade-alpha-neutral').hidden = state.alphaBoostLevel < 1 || state.alphaNeutralBought;
  const alphaCap = document.querySelector('#buy-alpha-cap');
  const alphaCapCost = alphaCapPrice();
  alphaCap.disabled = !state.alphaUnlocked || state.alphaBoostLevel < 1 || lt(state.alpha, alphaCapCost);
  alphaCap.textContent = `${fmt(alphaCapCost)} α`;
  document.querySelector('#upgrade-alpha-cap').classList.toggle('locked', !state.alphaUnlocked || state.alphaBoostLevel < 1);
  document.querySelector('#upgrade-alpha-cap').hidden = state.alphaBoostLevel < 1;
  document.querySelector('#buy-alpha-joke').textContent = `${fmt(state.alpha.times(1.5).ceil().max(1))} α`;
  const alphaGenerator = document.querySelector('#buy-alpha-generator');
  alphaGenerator.disabled = !state.alphaUnlocked || state.alphaGeneratorBought || lt(state.alpha, 10);
  alphaGenerator.textContent = state.alphaGeneratorBought ? 'Bought' : '10 α';
  document.querySelector('#upgrade-alpha-generator').classList.toggle('locked', !state.alphaUnlocked || !state.alphaGeneratorBought);
  const darkMatterUnlock = document.querySelector('#buy-darkmatter-unlock');
  darkMatterUnlock.disabled = !state.alphaUnlocked || state.darkMatterUnlocked || lt(state.alpha, 1000);
  darkMatterUnlock.textContent = state.darkMatterUnlocked ? 'Unlocked' : '1000 α';
  document.querySelector('#upgrade-darkmatter-unlock').classList.toggle('locked', !state.alphaUnlocked);
  const dm1 = document.querySelector('#buy-darkmatter-1');
  dm1.disabled = !state.darkMatterUnlocked || state.darkMatter1Bought;
  dm1.textContent = state.darkMatter1Bought ? 'Bought' : 'Free';
  document.querySelector('#upgrade-darkmatter-1').classList.toggle('locked', !state.darkMatter1Bought);
  const dm2 = document.querySelector('#buy-darkmatter-2');
  dm2.disabled = !state.darkMatter1Bought || state.darkMatter2Level >= 1000 || lt(state.darkMatter, 2);
  dm2.textContent = state.darkMatter2Level >= 1000 ? 'MAX LEVEL' : '2 ⊠';
  document.querySelector('#darkmatter-2-level').textContent = state.darkMatter2Level;
  document.querySelector('#darkmatter-2-multiplier').textContent = fmt(D(2).pow(state.darkMatter2Level));
  document.querySelector('#upgrade-darkmatter-2').classList.toggle('locked', !state.darkMatter1Bought);
  const dm3 = document.querySelector('#buy-darkmatter-3');
  dm3.disabled = !state.darkMatter1Bought || state.darkMatter3Bought;
  dm3.textContent = state.darkMatter3Bought ? 'Active' : 'Free';
  document.querySelector('#upgrade-darkmatter-3').classList.toggle('locked', !state.darkMatter1Bought);
  const dm4 = document.querySelector('#buy-darkmatter-4');
  dm4.disabled = !state.darkMatter3Bought || state.darkMatter4Bought;
  dm4.textContent = state.darkMatter4Bought ? 'Bought' : 'Free';
  document.querySelector('#upgrade-darkmatter-4').classList.toggle('locked', !state.darkMatter3Bought);
  document.querySelector('#darkmatter-coin-boost').textContent = fmt(state.darkMatterCoinBoost);
  document.querySelector('#darkmatter-flip-duration').textContent = state.darkMatterFlipDuration;
  const showUpgrade = (id, available) => { document.querySelector(`#upgrade-${id}`).hidden = !available; };
  showUpgrade('press', state.printer || state.press);
  showUpgrade('multiplier', state.press || state.multiplierLevel > 0);
  showUpgrade('income', state.press || state.incomeLevel > 0);
  showUpgrade('power', state.multiplierLevel > 0 || state.powerLevel > 0);
  showUpgrade('click', state.incomeLevel > 0 || state.clickLevel > 0);
  showUpgrade('log', state.expansionUnlocked || state.logLevel > 0);
  showUpgrade('exponent', state.expansionUnlocked || state.exponentLevel > 0);
  showUpgrade('cap', state.expansionUnlocked || state.capLevel > 0);
  showUpgrade('exponent-cap', levelUpgrades.run['exponent-cap'].ready() || state.exponentCapLevel > 0);
  showUpgrade('alpha-unlock', state.printer || state.alphaUnlocked);
  showUpgrade('alpha-gain', state.alphaUnlocked);
  showUpgrade('alpha-boost', state.alphaUnlocked && state.alphaGainPurchases > 0);
  showUpgrade('alpha-neutral', state.alphaUnlocked && state.alphaBoostLevel > 0);
  showUpgrade('alpha-cap', state.alphaUnlocked && state.alphaBoostLevel > 0);
  showUpgrade('alpha-joke', state.alphaUnlocked);
  showUpgrade('point-discount', state.ascCreditExponent || state.ascPointDiscountLevel > 0);
  showUpgrade('cyan-13', state.automationsUnlocked || state.cyan13Bought);
  showUpgrade('cyan-14', state.pyramidUnlocked || state.cyan14Level > 0);
  showUpgrade('cyan-15', true);
  showUpgrade('alpha-generator', state.alphaUnlocked);
  showUpgrade('darkmatter-unlock', state.alphaUnlocked && !state.darkMatterUnlocked);
  showUpgrade('discount', state.tokenMultiplierLevel > 0 || state.discountLevel > 0);
  showUpgrade('token-boost', state.tokenMultiplierLevel > 0 || state.tokenBoostLevel > 0);
  showUpgrade('unlock', state.tokenBoostLevel > 0 || state.expansionUnlocked);
  showUpgrade('max-buy', state.expansionUnlocked);
  showUpgrade('credit-power', state.expansionUnlocked || state.tokenCreditLevel > 0);
  showUpgrade('token-discount', state.tokenCreditLevel > 0 || state.tokenDiscountLevel > 0);
  showUpgrade('credit-exponent', state.creditEngine || state.creditExponentLevel > 0);
  showUpgrade('credit-cost', state.creditEngine || state.heavyMint);
  showUpgrade('passive-tokens', state.creditExponentLevel > 0 || state.passiveTokens);
  showUpgrade('credit-challenge-boost', state.pyramidUnlocked || state.creditChallengeBoost);
  showUpgrade('automation-unlock', state.creditChallengeBoost || state.automationsUnlocked);
  document.querySelector('#pyramid-status').textContent = state.activeChallenge ? `${challengeNames[state.activeChallenge]} active` : 'Choose a challenge';
  const pyramidTimer = document.querySelector('#pyramid-timer');
  pyramidTimer.hidden = !state.activeChallenge || !challengeDuration(state.activeChallenge);
  pyramidTimer.textContent = pyramidTimer.hidden ? '' : `${Math.max(0, Math.ceil((state.challengeEndsAt - Date.now()) / 1000))}s`;
  document.querySelectorAll('.challenge button').forEach(button => { const done = state.completedChallenges.includes(button.dataset.challenge); button.disabled = !state.pyramidUnlocked || !!state.activeChallenge || done; button.textContent = done ? 'Complete' : state.activeChallenge === button.dataset.challenge ? 'Active' : 'Start'; });

  const creditMultiplierButton = document.querySelector('#buy-credit-multiplier');
  creditMultiplierButton.disabled = lt(state.credits, 1) || state.creditEngine;
  creditMultiplierButton.textContent = state.creditEngine ? 'Bought' : '1 C$';
  document.querySelector('#credit-exponent-level').textContent = state.creditExponentLevel;
  const heavyMint = document.querySelector('#buy-credit-cost');
  heavyMint.disabled = !state.creditEngine || state.heavyMint || lt(state.credits, 5);
  heavyMint.textContent = state.heavyMint ? 'Bought' : '5 C$';
  document.querySelector('#upgrade-credit-cost').classList.toggle('locked', !state.creditEngine);
  const cubeUnlock = document.querySelector('#buy-cube-unlock');
  cubeUnlock.disabled = state.cubeUnlocked || lt(state.credits, 10);
  cubeUnlock.textContent = state.cubeUnlocked ? 'Unlocked' : '10 C$';
  const freeRun = document.querySelector('#buy-free-run');
  freeRun.disabled = state.freeRunUpgrades || lt(state.credits, 100);
  freeRun.textContent = state.freeRunUpgrades ? 'Bought' : '100 C$';
  const passiveTokens = document.querySelector('#buy-passive-tokens');
  passiveTokens.disabled = !state.creditExponentLevel || state.passiveTokens || lt(state.credits, 10000);
  passiveTokens.textContent = state.passiveTokens ? 'Bought' : '10K C$';
  document.querySelector('#upgrade-passive-tokens').classList.toggle('locked', !state.creditExponentLevel);
  const pyramidUnlock = document.querySelector('#buy-pyramid-unlock');
  pyramidUnlock.disabled = state.pyramidUnlocked || lt(state.credits, 1e6);
  pyramidUnlock.textContent = state.pyramidUnlocked ? 'Unlocked' : '1M C$';
  for (let i = 0; i < dataUpgradeInfo.length; i += 1) {
    const info = dataUpgradeInfo[i];
    const bought = state.dataLore[i];
    const currencyValue = info.currency === 'points' ? state.balance : state[info.currency];
    const costAmount = info.currency === 'points' ? pointCost(info.amount) : info.amount;
    const extraCost = info.currency === 'points' ? `P$ ${fmt(costAmount)}` : info.currency === 'tokens' ? `${fmt(info.amount)} tokens` : info.currency === 'credits' ? `${fmt(info.amount)} C$` : '';
    const button = document.querySelector(`#buy-data-${i + 1}`);
    button.disabled = bought || lt(state.data, info.cost) || (info.amount && lt(currencyValue, costAmount));
    button.textContent = bought ? 'Archived' : `${info.cost} 𝔻${extraCost ? ` · ${extraCost}` : ''}`;
    document.querySelector(`#data-lore-${i + 1}`).textContent = info.lore;
    document.querySelector(`#data-lore-${i + 1}`).hidden = !bought;
    document.querySelector(`#upgrade-data-${i + 1}`).querySelector('p').hidden = bought;
  }

  document.querySelector('#cube-level').textContent = fmt(state.cubeLevel);
  document.querySelector('#cube-face-level').textContent = fmt(state.cubeLevel);
  document.querySelector('#cube-clicks').textContent = fmt(state.cubeClicks);
  document.querySelector('#cube-next').textContent = `${fmt(cubeClicksToNext())} CC to next level`;
  const cubeTargetName = state.cubeTarget[0].toUpperCase() + state.cubeTarget.slice(1);
  document.querySelector('#cube-target-name').textContent = cubeTargetName;
  document.querySelector('#cube-multiplier').textContent = fmt(cubeMultiplier(state.cubeTarget));
  document.querySelectorAll('.cube-target').forEach(button => button.classList.toggle('active', button.dataset.target === state.cubeTarget));

  const prestige = document.querySelector('#prestige-button');
  prestige.disabled = lt(state.balance, goal);
  document.querySelector('#prestige-button-label').textContent = gte(state.balance, goal) ? `Prestige · +${fmt(tokenReward())} tokens` : `P$ ${fmt(goal)} to prestige`;
  const creditPrestige = document.querySelector('#credit-prestige-button');
  const creditsEarned = state.activeChallenge ? D(0) : creditPrestigeReward();
  creditPrestige.disabled = lt(state.tokens, '1e33');
  document.querySelector('#credit-prestige-label').textContent = gte(state.tokens, '1e33') ? (state.activeChallenge ? 'Finish challenge · No credits' : `Credit prestige · +${fmt(creditsEarned)} C$`) : '1De tokens for 1 C$';
  const dataPrestige = document.querySelector('#data-prestige-button');
  const dataCost = pointCost(DATA_PRESTIGE_COST);
  dataPrestige.disabled = lt(state.balance, dataCost);
  document.querySelector('#data-prestige-label').textContent = gte(state.balance, dataCost) ? `Data reset · +${fmt(dataReward(dataCost))} 𝔻 · resets P$ only` : `P$ ${fmt(dataCost)} for 1 𝔻 · resets P$ only`;
  for (let i = 1; i <= 3; i += 1) {
    document.querySelector(`#spark-${i}-level`).textContent = state[`sparkUpgrade${i}Level`];
  }
  renderLevelUpgrades();
  const sparkCost = sparkPrestigeCost();
  const sparkEarned = sparkReward(state.balance);
  const sparkPrestige = document.querySelector('#spark-prestige-button');
  sparkPrestige.disabled = lt(state.balance, sparkCost);
  document.querySelector('#spark-prestige-label').textContent = gte(state.balance, sparkCost) ? `Spark reset · +${fmt(sparkEarned)} ⊹ · resets P$ only` : `P$ ${fmt(sparkCost)} for Spark ⊹ · resets P$ only`;
  const tokenAscendanceEarned = tokenAscendanceReward();
  document.querySelector('#token-ascendance-button').disabled = lt(tokenAscendanceEarned, 1);
  document.querySelector('#token-ascendance-label').textContent = gte(tokenAscendanceEarned, 1)
    ? `Tokens → Ascendance · +${fmt(tokenAscendanceEarned)} ᛥ`
    : 'Tokens → Ascendance · need enough for 1 ᛥ';
  const ascendanceCost = D('1e250');
  const ascendanceEarned = state.credits.div(ascendanceCost).floor();
  const ascendancePrestige = document.querySelector('#ascendance-prestige-button');
  ascendancePrestige.disabled = lt(state.credits, ascendanceCost);
  document.querySelector('#ascendance-prestige-label').textContent = gte(state.credits, ascendanceCost) ? `Ascend · +${fmt(ascendanceGain(ascendanceEarned))} ᛥ` : 'C$ 1e250 for 1 ᛥ';
}

for (const [tab, upgrades] of Object.entries(levelUpgrades)) {
  const currency = upgradeCurrencies[tab];
  for (const [id, upgrade] of Object.entries(upgrades)) {
    document.querySelector(`#buy-${id}`).addEventListener('click', () => {
      if (upgrade.ready && !upgrade.ready()) return;
      const { count, balance } = levelPurchase(upgrade, state[currency], state.maxBuyUnlocked && state.maxBuyActive);
      if (!count) return;
      state[upgrade.key] += count;
      state[currency] = balance;
      toast(count === 1 ? upgrade.message : `Bought ${count} levels`);
      render(); save();
    });
  }
}

setupAutomationCards();
for (let i = 0; i < 12; i += 1) {
  const index = i;
  document.querySelector(`#buy-automation-${index + 1}`).addEventListener('click', () => {
    const cost = automationCost(index);
    if (state.automationBought[index]) {
      state.automationActive[index] = !state.automationActive[index];
      toast(`Automation ${index + 1} ${state.automationActive[index] ? 'resumed' : 'paused'}`);
      render(); save();
      return;
    }
    if (!state.automationsUnlocked || !automationPrerequisite(index) || lt(state.tokens, cost)) return;
    state.tokens = minus(state.tokens, cost);
    state.automationBought[index] = true;
    state.automationActive[index] = true;
    toast(`Automation ${index + 1} bought`);
    render(); save();
  });
}
document.querySelector('#buy-credit-challenge-boost').addEventListener('click', () => {
  if (!state.pyramidUnlocked || state.creditChallengeBoost || lt(state.credits, 1e7)) return;
  state.credits = minus(state.credits, 1e7); state.creditChallengeBoost = true;
  toast('Pyramid mastery bought'); render(); save();
});
document.querySelector('#buy-asc-1').addEventListener('click', () => {
  if (state.ascCurrencyBoost || lt(state.ascendance, 5)) return;
  state.ascendance = minus(state.ascendance, 5);
  state.ascCurrencyBoost = true;
  toast('All lower currency gains ×100');
  render(); save();
});
document.querySelector('#buy-asc-2').addEventListener('click', () => {
  if (!state.ascCurrencyBoost || !state.completedChallenges.includes('deduction2') || state.ascCreditExponent) return;
  state.ascCreditExponent = true;
  toast('Credit gains raised to 1.5');
  render(); save();
});
document.querySelector('#buy-asc-4').addEventListener('click', () => {
  if (!state.ascCubePowerLevel || state.ascCubeAutoclicker) return;
  state.ascCubeAutoclicker = true;
  toast('Cube autoclicker unlocked');
  render(); save();
});
document.querySelector('#buy-asc-5').addEventListener('click', () => {
  if (!state.ascCubePowerLevel || state.ascCubeAscendance) return;
  state.ascCubeAscendance = true;
  toast('Cube can now affect ᛥ');
  render(); save();
});
document.querySelector('#buy-asc-6').addEventListener('click', () => {
  if (!state.ascCubePowerLevel || !state.alphaUnlocked || state.ascCubeAlpha) return;
  state.ascCubeAlpha = true;
  toast('Cube can now affect α');
  render(); save();
});
document.querySelector('#buy-asc-7').addEventListener('click', () => {
  if (!state.ascCreditExponent || state.ascTotalLevelBoost || lt(state.ascendance, '1e10')) return;
  state.ascendance = minus(state.ascendance, '1e10'); state.ascTotalLevelBoost = true;
  toast('P$ gain linked to upgrade levels'); render(); save();
});
document.querySelector('#buy-automation-unlock').addEventListener('click', () => {
  if (!state.creditChallengeBoost || state.automationsUnlocked) return;
  if (!state.cyan13Bought) { if (lt(state.credits, 1e8)) return; state.credits = minus(state.credits, 1e8); }
  state.automationsUnlocked = true;
  toast(state.cyan13Bought ? 'Automations unlocked for free' : 'Automations unlocked'); render(); save();
});
for (let i = 3; i < 8; i += 1) {
  const upgradeNumber = i + 13;
  document.querySelector(`#buy-point-${upgradeNumber}`).addEventListener('click', () => {
    const cost = highPointUpgradeCost(upgradeNumber);
    if (!highPointUpgradeReady(upgradeNumber) || state[`pointUpgrade${upgradeNumber}Bought`] || lt(state.balance, cost)) return;
    purchase(cost, () => { state[`pointUpgrade${upgradeNumber}Bought`] = true; }, `Upgrade ${upgradeNumber} bought`);
    save();
  });
}
for (let i = 0; i < 3; i += 1) document.querySelector(`#buy-cyan-${13 + i}`).addEventListener('click', () => buyCyanUpgrade(i));
for (let i = 0; i < dataUpgradeInfo.length; i += 1) {
  const index = i;
  document.querySelector(`#buy-data-${index + 1}`).addEventListener('click', () => {
    const info = dataUpgradeInfo[index];
    const currencyValue = info.currency === 'points' ? state.balance : state[info.currency];
    const amount = info.currency === 'points' ? pointCost(info.amount) : info.amount;
    if (state.dataLore[index] || lt(state.data, info.cost) || (info.amount && lt(currencyValue, amount))) return;
    state.data = minus(state.data, info.cost);
    if (info.amount) {
      if (info.currency === 'points') state.balance = minus(state.balance, amount);
      else if (info.currency === 'alpha') changeAlpha(D(amount).neg());
      else state[info.currency] = minus(state[info.currency], amount);
    }
    state.dataLore[index] = true;
    toast(`Data archive ${index + 1} uncovered`);
    render(); save();
  });
}
document.querySelector('#buy-casino').addEventListener('click', () => {
  if (!state.alphaUnlocked || state.casinoUnlocked || lt(state.alpha, CASINO_UNLOCK_COST)) return;
  changeAlpha(CASINO_UNLOCK_COST.neg());
  state.casinoUnlocked = true;
  toast('Alpha Casino unlocked');
  render(); save();
});
document.querySelector('#casino-stake').addEventListener('input', renderCasino);
document.querySelector('#roulette-spin').addEventListener('click', spinRoulette);
document.querySelector('#blackjack-deal').addEventListener('click', dealBlackjack);
for (const action of ['hit','stand']) document.querySelector(`#blackjack-${action}`).addEventListener('click', () => playBlackjack(action));
document.querySelector('#american-roulette').addEventListener('change', event => { state.americanRoulette = event.target.checked; render(); save(); });
document.querySelector('#buy-alpha-unlock').addEventListener('click', () => { if (!state.printer || state.alphaUnlocked) return; state.alphaUnlocked = true; toast('Alpha upgrades unlocked'); render(); save(); });
document.querySelector('#buy-alpha-gain').addEventListener('click', () => { if (!state.alphaUnlocked) return; const gain = applyAlphaGain(1 + state.alphaBoostLevel).times(cubeMultiplier('alpha')); state.alphaGainPurchases += 1; changeAlpha(gain); toast(`+${fmt(gain)} α`); render(); save(); });
document.querySelector('#buy-alpha-generator').addEventListener('click', () => { if (!state.alphaUnlocked || state.alphaGeneratorBought || lt(state.alpha, 10)) return; changeAlpha(-10); state.alphaGeneratorBought = true; toast('Alpha generator started'); render(); save(); });
document.querySelector('#buy-alpha-boost').addEventListener('click', () => { const cost = alphaBoostPrice(); if (!state.alphaUnlocked || state.alphaBoostLevel >= 50 || lt(state.alpha, cost)) return; changeAlpha(cost.neg()); state.alphaBoostLevel += 1; toast('Alpha gain increased'); render(); save(); });
document.querySelector('#buy-alpha-neutral').addEventListener('click', () => { if (!state.alphaUnlocked || state.alphaBoostLevel < 1 || state.alphaNeutralBought) return; const gain = applyAlphaGain(5).times(cubeMultiplier('alpha')); changeAlpha(gain); state.alphaNeutralBought = true; toast(`+${fmt(gain)} α · Neutral multiplier bought`); render(); save(); });
document.querySelector('#buy-alpha-cap').addEventListener('click', () => { const cost = alphaCapPrice(); if (!state.alphaUnlocked || state.alphaBoostLevel < 1 || lt(state.alpha, cost)) return; changeAlpha(cost.neg()); state.alphaCapLevel += 1; toast('2α max level increased by 2'); render(); save(); });
document.querySelector('#buy-fishing').addEventListener('click', () => {
  if (!state.alphaUnlocked || state.fishingUnlocked || lt(state.alpha, FISHING_COST)) return;
  changeAlpha(D(FISHING_COST).neg());
  state.fishingUnlocked = true;
  render();
  save();
});
document.querySelector('#fishing-action').addEventListener('click', () => {
  if (!state.alphaUnlocked || !state.fishingUnlocked || state.gainZeroActive) return;
  const now = performance.now();
  const phase = fishingPhase(now);
  if (phase === 'idle') {
    fishingBiteAt = now + 1500 + Math.random() * 2000;
    fishingRedFish = Boolean(state.redFishLevel) && Math.random() < 0.2;
  } else {
    fishingBiteAt = null;
    if (phase === 'bite') {
      let extra = 0;
      if (kirbyAvailable() && state.kirbyAbility === 'fisher' && (Date.now() >= state.kirbyNapUntil || Date.now() < state.kirbyBurstUntil)) {
        state.kirbyCatches += 1;
        if (state.kirbyCatches >= (Date.now() < state.kirbyBurstUntil ? 3 : 5)) { extra = 1; state.kirbyCatches = 0; }
      }
      const reward = (1 + extra) * (1 + state.fishGainLevel) * (fishingRedFish ? 1.5 : 1);
      state.fishPoints = plus(state.fishPoints, reward);
      fishingResult = `${fishingRedFish ? 'Red Fish' : 'Fish'} caught! +${fmt(reward)} 🐟`;
      save();
    } else {
      fishingResult = phase === 'waiting' ? 'Too early. The fish got away.' : 'Too late. The fish got away.';
    }
  }
  renderFishing();
});
document.querySelector('#buy-gain-zero').addEventListener('click', () => {
  if (!state.gainZeroActive) clampUpgradeLevels();
  if (!state.gainZeroBought) {
    state.gainZeroBought = true;
    state.gainZeroActive = true;
    state.balance = D(1);
    resetUpgradePrices();
    toast('All currency gain set to ×0');
  } else {
    if (state.gainZeroActive) {
      restoreCurrencyGain();
      return;
    }
    state.gainZeroActive = true;
    toast('All currency gain set to ×0');
  }
  render(); save();
});
document.querySelector('#buy-printer').addEventListener('click', () => {
  if (state.printer) return;
  state.printer = true;
  toast('Upgrade 1 bought');
  render();
});
document.querySelector('#buy-press').addEventListener('click', () => {
  if (state.press || !state.printer) return;
  purchase(pointCost(10), () => { state.press = true; }, 'Upgrade 2 bought');
});
document.querySelector('#buy-unlock').addEventListener('click', () => {
  const cost = expansionCost();
  if (state.tokenBoostLevel < 1 || lt(state.tokens, cost) || state.expansionUnlocked) return;
  state.tokens = minus(state.tokens, cost);
  state.expansionUnlocked = true;
  toast('New P$ upgrades unlocked');
  render();
});
document.querySelector('#buy-max-buy').addEventListener('click', () => {
  const cost = maxBuyCost();
  if (!state.expansionUnlocked || state.maxBuyUnlocked || lt(state.tokens, cost)) return;
  state.tokens = minus(state.tokens, cost);
  state.maxBuyUnlocked = true;
  toast('Max Buy unlocked'); render(); save();
});
document.querySelector('#max-buy-toggle').addEventListener('click', () => {
  if (!state.maxBuyUnlocked) return;
  state.maxBuyActive = !state.maxBuyActive;
  toast(state.maxBuyActive ? 'Max Buy on' : 'Max Buy off'); render(); save();
});
document.querySelector('#sections-toggle').addEventListener('click', () => { const tabs = document.querySelector('#upgrade-tabs'); tabs.hidden = !tabs.hidden; document.querySelector('#sections-toggle').setAttribute('aria-expanded', String(!tabs.hidden)); });
function chooseTab(tab) { activeTab = tab; document.querySelector('#upgrade-tabs').hidden = true; document.querySelector('#sections-toggle').setAttribute('aria-expanded', 'false'); render(); }
document.querySelector('#run-tab').addEventListener('click', () => chooseTab('run'));
document.querySelector('#token-tab').addEventListener('click', () => { if (state.totalPrestiges || gt(state.tokens, 0) || state.garbageUnlocked) chooseTab('token'); });
document.querySelector('#credit-tab').addEventListener('click', () => { if (state.totalCreditPrestiges || gt(state.credits, 0)) chooseTab('credit'); });
document.querySelector('#data-tab').addEventListener('click', () => { if (state.totalDataPrestiges || gt(state.data, 0) || state.dataLore.some(Boolean)) chooseTab('data'); });
document.querySelector('#spark-tab').addEventListener('click', () => { if (state.sparkPrestiges || gt(state.spark, 0)) chooseTab('spark'); });
document.querySelector('#cube-tab').addEventListener('click', () => { if (state.cubeUnlocked) chooseTab('cube'); });
document.querySelector('#pyramid-tab').addEventListener('click', () => { if (state.pyramidUnlocked) chooseTab('pyramid'); });
document.querySelector('#alpha-tab').addEventListener('click', () => { if (state.alphaUnlocked) chooseTab('alpha'); });
document.querySelector('#darkmatter-tab').addEventListener('click', () => { if (state.darkMatterUnlocked) chooseTab('darkmatter'); });
document.querySelector('#buy-darkmatter-unlock').addEventListener('click', () => { if (!state.alphaUnlocked || state.darkMatterUnlocked || lt(state.alpha, 1000)) return; changeAlpha(-1000); state.darkMatterUnlocked = true; activeTab = 'darkmatter'; toast(`${matterName()} unlocked`); render(); save(); });
document.querySelector('#buy-darkmatter-1').addEventListener('click', () => { if (!state.darkMatterUnlocked || state.darkMatter1Bought) return; state.darkMatter1Bought = true; toast(`${matterName()} generation started`); render(); save(); });
document.querySelector('#buy-darkmatter-2').addEventListener('click', () => { if (!state.darkMatter1Bought || state.darkMatter2Level >= 1000 || lt(state.darkMatter, 2)) return; state.darkMatter = D(0); state.darkMatter2Level += 1; toast(`${matterName()} gain doubled`); render(); save(); });
document.querySelector('#buy-darkmatter-3').addEventListener('click', () => { if (!state.darkMatter1Bought || state.darkMatter3Bought) return; state.darkMatter3Bought = true; state.darkMatterCoinBoost = D(1); state.darkMatterFlipTimer = 0; state.darkMatterFlipDuration = 1; toast('Coin flip activated'); render(); save(); });
document.querySelector('#buy-darkmatter-4').addEventListener('click', () => { if (!state.darkMatter3Bought || state.darkMatter4Bought) return; state.darkMatter4Bought = true; toast('Heads now last longer'); render(); save(); });
document.querySelector('#ascendance-tab').addEventListener('click', () => { if (state.totalAscendances || gt(state.ascendance, 0)) chooseTab('ascendance'); });
document.querySelectorAll('.challenge button').forEach(button => button.addEventListener('click', () => {
  if (!state.pyramidUnlocked || state.activeChallenge || state.completedChallenges.includes(button.dataset.challenge)) return;
  const id = button.dataset.challenge; state.credits = D(0); resetCreditRun(); state.activeChallenge = id;
  const minutes = challengeDuration(id); state.challengeEndsAt = minutes ? Date.now() + minutes * 60000 : 0; activeTab = 'pyramid';
  toast(`${challengeNames[id]} started · Credits reset`); save(); render();
}));
document.querySelectorAll('.cube-target').forEach(button => button.addEventListener('click', () => {
  state.cubeTarget = button.dataset.target;
  render();
  save();
}));
document.querySelector('#cube-click-button').addEventListener('click', () => {
  if (!state.cubeUnlocked) return;
  addCubeClicks(cubeClickGain());
  render();
  save();
});
document.querySelector('#work-button').addEventListener('click', () => {
  if (state.gainZeroActive) {
    restoreCurrencyGain();
    return;
  }
  const amount = saleGain();
  state.balance = plus(state.balance, amount);
  state.runEarned = plus(state.runEarned, amount);
  state.lifetime = plus(state.lifetime, amount);
  render();
});
document.querySelector('#prestige-button').addEventListener('click', performTokenPrestige);
function performTokenPrestige() {
  if (lt(state.balance, nextGoal())) return;
  recordFortuneRitual('token');
  clearFortuneChain(true);
  const reward = tokenReward();
  state.automationLastReset[0] = Date.now();
  state.tokens = plus(state.tokens, reward);
  state.totalPrestiges += 1;
  state.tokenResetCount += 1;
  state.balance = D(0);
  state.runEarned = D(0);
  state.printer = false;
  state.press = false;
  state.multiplierLevel = 0;
  state.incomeLevel = 0;
  state.powerLevel = 0;
  state.clickLevel = 0;
  state.logLevel = 0;
  state.exponentLevel = 0;
  state.exponentCapLevel = 0;
  state.capLevel = 0;
  state.pointUpgrade16Bought = false; state.pointUpgrade17Bought = false; state.pointUpgrade18Bought = false; state.pointUpgrade19Bought = false; state.pointUpgrade20Bought = false;
  resetPriceOrigins(['multiplierLevel', 'incomeLevel', 'powerLevel', 'clickLevel', 'logLevel', 'exponentLevel', 'exponentCapLevel', 'capLevel']);
  applyAscendanceMilestones();
  toast(`Fresh start. +${fmt(reward)} tokens earned!`);
  save();
  render();
}
document.querySelector('#credit-prestige-button').addEventListener('click', performCreditPrestige);
function performCreditPrestige() {
  if (lt(state.tokens, '1e33')) return;
  state.automationLastReset[1] = Date.now();
  const completing = state.activeChallenge;
  const reward = completing ? D(0) : creditPrestigeReward();
  state.credits = plus(state.credits, reward);
  state.totalCreditPrestiges += 1;
  recordFortuneRitual('credit');
  updateFortuneProgress();
  if (state.fortuneUnlocked) state.fortuneCharges = Math.min(100, state.fortuneCharges + 1);
  resetCreditRun();
  if (completing) {
    if (!state.challengeEndsAt || Date.now() <= state.challengeEndsAt) {
      if (completing.includes('+')) { if (!state.completedCombos.includes(completing)) state.completedCombos.push(completing); }
      else if (!state.completedChallenges.includes(completing)) state.completedChallenges.push(completing);
      toast(`${challengeNames[completing]} complete · No credits earned`);
    } else toast(`${challengeNames[completing]} failed · Time expired`);
    state.activeChallenge = ''; state.challengeEndsAt = 0; activeTab = 'pyramid';
  } else {
    activeTab = 'credit';
    toast(`Credit prestige. +${fmt(reward)} C$ earned!`);
  }
  save(); render();
}
document.querySelector('#spark-prestige-button').addEventListener('click', () => {
  const cost = sparkPrestigeCost();
  if (lt(state.balance, cost)) return;
  const reward = sparkReward(state.balance);
  updateFortuneProgress(); clearFortuneChain(true);
  state.spark = plus(state.spark, reward);
  state.sparkPrestiges += 1;
  state.balance = D(0); state.runEarned = D(0);
  activeTab = 'spark';
  toast(`P$ reset · +${fmt(reward)} ⊹`);
  save(); render();
});
document.querySelector('#data-prestige-button').addEventListener('click', () => {
  const cost = pointCost(DATA_PRESTIGE_COST);
  if (lt(state.balance, cost)) return;
  const reward = dataReward(cost);
  updateFortuneProgress(); clearFortuneChain(true);
  state.data = plus(state.data, reward);
  state.totalDataPrestiges += 1;
  state.balance = D(0);
  state.runEarned = D(0);
  activeTab = 'data';
  toast(`Data reset · +${fmt(reward)} 𝔻`);
  save(); render();
});
document.querySelector('#token-ascendance-button').addEventListener('click', () => {
  const reward = tokenAscendanceReward();
  if (lt(reward, 1)) return;
  state.ascendance = plus(state.ascendance, reward);
  state.totalAscendances += 1;
  resetAscendanceRun();
  activeTab = 'ascendance';
  toast(`Tokens → Ascendance · +${fmt(reward)} ᛥ`);
  save(); render();
});
document.querySelector('#ascendance-prestige-button').addEventListener('click', () => {
  const cost = D('1e250');
  if (lt(state.credits, cost)) return;
  const reward = ascendanceGain(state.credits.div(cost).floor());
  state.ascendance = plus(state.ascendance, reward);
  state.totalAscendances += 1;
  resetAscendanceRun();
  activeTab = 'ascendance';
  toast(`Ascendance · +${fmt(reward)} ᛥ`);
  save(); render();
});
document.querySelector('#buy-credit-multiplier').addEventListener('click', () => {
  if (lt(state.credits, 1) || state.creditEngine) return;
  state.credits = minus(state.credits, 1);
  state.creditEngine = true;
  toast('Credit engine bought');
  render();
  save();
});
document.querySelector('#buy-credit-cost').addEventListener('click', () => {
  if (!state.creditEngine || state.heavyMint || lt(state.credits, 5)) return;
  state.credits = minus(state.credits, 5);
  state.heavyMint = true;
  toast('Heavy mint bought');
  render();
  save();
});
document.querySelector('#buy-cube-unlock').addEventListener('click', () => {
  if (state.cubeUnlocked || lt(state.credits, 10)) return;
  state.credits = minus(state.credits, 10);
  state.cubeUnlocked = true;
  toast('The Cube unlocked');
  render();
  save();
});
document.querySelector('#buy-free-run').addEventListener('click', () => {
  if (state.freeRunUpgrades || lt(state.credits, 100)) return;
  state.credits = minus(state.credits, 100);
  state.freeRunUpgrades = true;
  toast('Upgrades 3, 4, and 9 no longer spend P$');
  render();
  save();
});
document.querySelector('#buy-pyramid-unlock').addEventListener('click', () => {
  if (state.pyramidUnlocked || lt(state.credits, 1e6)) return;
  state.credits = minus(state.credits, 1e6); state.pyramidUnlocked = true;
  toast('The Pyramid unlocked'); render(); save();
});
document.querySelector('#buy-passive-tokens').addEventListener('click', () => {
  if (!state.creditExponentLevel || state.passiveTokens || lt(state.credits, 10000)) return;
  state.credits = minus(state.credits, 10000);
  state.passiveTokens = true;
  toast('Passive token income unlocked');
  render();
  save();
});

// The inscription describes a repeatable route, never a missable milestone.
const FORTUNE_WEDGES = {
  points: { name: 'Output', space: 2, color: '#4097bf', detail: '15 seconds of production' },
  cache: { name: 'Cache', space: 3, color: '#5972ce', detail: '35 seconds of production' },
  tokens: { name: 'Cogs', space: 2, color: '#c39a36', detail: '4 workshop cogs' },
  multiplier: { name: 'Prime', space: 1, color: '#a779cf', detail: 'Double next payout, up to ×8' },
  refund: { name: 'Return', space: 1, color: '#479f81', detail: 'Refund a charge, twice per chain' },
  boost: { name: 'Overdrive', space: 2, color: '#c4794a', detail: 'Bank for ×2 production for 30 seconds' }
};
function recordFortuneRitual(layer) {
  if (!state.cubeUnlocked || state.fortuneUnlocked || state.activeChallenge) return;
  const route = ['token:points', 'token:tokens', 'credit:credits', 'token:points'];
  const step = `${layer}:${state.cubeTarget}`;
  state.fortuneClue = step === route[state.fortuneClue] ? state.fortuneClue + 1 : step === route[0] ? 1 : 0;
  if (state.fortuneClue === 4) {
    state.fortuneUnlocked = true;
    state.fortuneCharges = 6;
    // Existing scale is the baseline, not a pile of retroactive charges.
    state.fortuneMilestone = fortuneMilestone();
    toast('The Cube unfolds. Fortune Engine discovered.');
  }
}
function fortuneMilestone() { return Math.max(0, Math.min(10000, Math.floor(state.balance.max(1).log10().toNumber() / 10 + 1e-9))); }
function updateFortuneProgress() {
  if (!state.fortuneUnlocked) return;
  const milestone = fortuneMilestone();
  if (milestone > state.fortuneMilestone) {
    state.fortuneCharges = Math.min(100, state.fortuneCharges + milestone - state.fortuneMilestone);
    state.fortuneMilestone = milestone;
  }
}
function clearFortuneChain(forfeit = false) {
  state.fortunePending = 0; state.fortuneSeconds = 0; state.fortuneMultiplier = 1;
  state.fortuneLast = ''; state.fortuneStreak = 0; state.fortuneRefunds = 0;
  state.fortuneRerolled = false; state.fortuneBoost = false; state.fortuneBase = D(0);
  if (forfeit) state.fortuneBoostUntil = 0;
}
function fortuneCapacity() { return 10 + state.fortuneFrame * 2; }
function fortuneSlots() { return 4 + Math.floor(state.fortuneFrame / 2); }
function fortuneUsed(wedges = state.fortuneWedges) { return wedges.reduce((sum, id) => sum + FORTUNE_WEDGES[id].space, 0); }
function fortuneAllowed() { return state.fortuneUnlocked && !state.activeChallenge && !state.gainZeroActive; }
function fortuneSegments() {
  const segments = state.fortuneWedges.map((id, index) => ({ id, index, weight: FORTUNE_WEDGES[id].space, ...FORTUNE_WEDGES[id] }));
  const blank = fortuneCapacity() - fortuneUsed();
  if (blank) segments.push({ id: 'blank', name: 'Idle', weight: blank, color: '#888' });
  segments.push({ id: 'bust', name: 'Bust', weight: 4, color: '#b44f61' });
  return segments;
}
let fortuneSpinning = false;
let fortuneRotation = 0;
function animateFortuneSpin(segment) {
  const parts = fortuneSegments(), total = fortuneCapacity() + 4;
  const index = parts.findIndex(part => part === segment || (part.id === segment.id && part.index === segment.index));
  const before = parts.slice(0, index).reduce((sum, part) => sum + part.weight, 0);
  const target = 360 - (before + segment.weight / 2) / total * 360;
  // The fixed pointer sits at twelve o'clock; land the selected wedge beneath it.
  fortuneRotation += 360 * 5 + ((target - fortuneRotation % 360 + 360) % 360);
  const wheel = document.getElementById('fortune-wheel');
  fortuneSpinning = true;
  wheel.style.transform = `rotate(${fortuneRotation}deg)`;
  wheel.setAttribute('aria-busy', 'true');
  setTimeout(() => {
    fortuneSpinning = false;
    wheel.setAttribute('aria-busy', 'false');
    renderFortune();
  }, 2600);
}
function spinFortune(reroll = false, animate = false) {
  if (fortuneSpinning || !fortuneAllowed() || state.fortuneCharges < 1) return;
  if (reroll && (state.fortuneFrame < 2 || state.fortuneRerolled || !state.fortunePending)) return;
  if (!state.fortunePending) state.fortuneBase = rate();
  if (reroll) state.fortuneRerolled = true;
  state.fortuneCharges--;
  let roll = Math.random() * (fortuneCapacity() + 4);
  const segment = fortuneSegments().find(part => (roll -= part.weight) < 0);
  if (animate) animateFortuneSpin(segment);
  const id = segment.id;
  // A reroll protects the existing pot, but still spends a charge and cannot be repeated.
  if (id === 'bust') {
    if (!reroll) clearFortuneChain();
    state.fortuneResult = reroll ? 'Reroll: bust deflected. Your pot survives.' : 'Bust. Unbanked winnings lost; banked progress is safe.';
    return;
  }
  state.fortunePending++;
  state.fortuneStreak = id === state.fortuneLast ? Math.min(3, state.fortuneStreak + 1) : 1;
  state.fortuneLast = id;
  const factor = state.fortuneMultiplier * state.fortuneStreak;
  if (id === 'points' || id === 'cache') {
    state.fortuneSeconds = Math.min(120, state.fortuneSeconds + (id === 'cache' ? 35 : 15) * (1 + state.fortuneQuality) * factor);
    state.fortuneMultiplier = 1;
  }
  if (id === 'tokens') { state.fortunePending += (4 + state.fortuneQuality * 2) * factor; state.fortuneMultiplier = 1; }
  if (id === 'multiplier') state.fortuneMultiplier = Math.min(8, state.fortuneMultiplier * 2);
  if (id === 'refund' && state.fortuneRefunds < 2) { state.fortuneCharges++; state.fortuneRefunds++; }
  if (id === 'boost') state.fortuneBoost = true;
  state.fortuneResult = `${segment.name}${state.fortuneStreak > 1 ? ` · ×${state.fortuneStreak} streak` : ''}. Bank or risk another spin.`;
}
function bankFortune() {
  if (!fortuneAllowed() || !state.fortunePending) return;
  // Snapshot at chain start and current production both bound the prize.
  const payout = state.fortuneBase.min(rate()).times(state.fortuneSeconds);
  state.balance = plus(state.balance, payout); state.runEarned = plus(state.runEarned, payout); state.lifetime = plus(state.lifetime, payout);
  state.fortuneTokens += state.fortunePending;
  const boosted = state.fortuneBoost;
  clearFortuneChain();
  if (boosted) state.fortuneBoostUntil = Date.now() + 30000;
  state.fortuneResult = `Banked P$ ${fmt(payout)} and workshop cogs.${boosted ? ' Overdrive: ×2 for 30s.' : ''}`;
}
const fortunePanel = document.createElement('section');
fortunePanel.id = 'fortune-panel'; fortunePanel.className = 'expansion-panel'; fortunePanel.hidden = true;
document.querySelector('.prestige').before(fortunePanel);
fortunePanel.innerHTML = `<details open><summary>Fortune Engine</summary>
<p>Bank winnings or risk another charge. Bust loses the current pot. Every safe spin adds one cog; repeat wedges build a ×2/×3 streak. Prime affects the next Output, Cache, or Cogs payout. Idle only adds its one cog.</p>
<div class="fortune-layout"><div class="fortune-wheel-frame"><div id="fortune-wheel" role="img" aria-label="Wheel probabilities"></div><span class="fortune-wheel-label" aria-hidden="true">FORTUNE</span></div><div><p id="fortune-wallet"></p><p id="fortune-pot"></p><p id="fortune-result" role="status" aria-live="polite"></p>
<button id="fortune-spin">Spin · 1 charge</button><button id="fortune-reroll">Protected reroll · 1 charge</button><button id="fortune-bank">Bank winnings</button></div></div>
<p>Charges: +1 per Credit prestige and per new ten-decade P$ high-water mark (100 stored max). Refunds: twice per chain. Production payouts: at most 120 seconds at the lower of starting and current production. All prestiges forfeit the pot and end Overdrive. Trials and Null gain pause the engine.</p>
<h3>Wheel workshop</h3><p>Each wedge occupies its stated space and has that many chances to land. Unused space becomes Idle. Four spaces always belong to Bust. Editing and upgrades require an empty pot.</p>
<p id="fortune-odds"></p><p id="fortune-frame"></p><div id="fortune-wedges"></div>
<button id="fortune-add">Add Output wedge</button><button id="fortune-upgrade-frame"></button><button id="fortune-upgrade-quality"></button>
<p>Frame levels add 2 spaces each; levels 2 and 4 also add a slot. Level 2 unlocks one protected reroll per chain. Quality increases Output/Cache duration and Cogs payouts. Workshop upgrades and discoveries survive every prestige.</p></details>`;
const fortuneHint = document.createElement('p'); fortuneHint.id = 'fortune-hint';
fortuneHint.textContent = 'An inscription on the Cube: “Let raw work turn a cycle; let cycles turn another. Let credit turn the deeper cycle. Return raw work to a cycle, and the square will remember how to turn.” Four faint notches border the inscription.';
document.querySelector('.cube-effect').after(fortuneHint);
// Optional translations: buying information never advances the inscription itself.
const FORTUNE_HINTS = [
  { currency: 'balance', cost: '1e100', label: 'P$', text: 'The inscription describes four prestiges. Before each, choose what the Cube multiplies. Its notches record the correct order; a mistake can always be retried.' },
  { currency: 'tokens', cost: '1e50', label: 'Tokens', text: '“Raw work”, “cycles”, and “credit” mean the Cube targets Points, Tokens, and Credits. Read them in the inscription’s order, including the return.' },
  { currency: 'credits', cost: '1e25', label: 'C$', text: '“A cycle” means a token prestige; “the deeper cycle” means a credit prestige. Only the third step uses the deeper reset. Pyramid trials do not count.' },
  { currency: 'data', cost: '1000', label: 'Data', text: 'Full translation: Points target → token prestige; Tokens target → token prestige; Credits target → credit prestige; Points target → token prestige. The Fortune Engine then unfolds. Change the Cube target before each reset.' }
];
const fortuneHintShop = document.createElement('div');
fortuneHintShop.id = 'fortune-hint-shop';
fortuneHintShop.innerHTML = '<details><summary>Commission a translation</summary><p>The translator charges outrageous fees. These optional hints only explain the inscription; solving it yourself is free. Purchases survive all prestiges.</p><ol id="fortune-bought-hints"></ol><button id="buy-fortune-hint" type="button"></button></details>';
fortuneHint.after(fortuneHintShop);
function renderFortuneHints() {
  fortuneHintShop.hidden = !state.cubeUnlocked || state.fortuneUnlocked;
  if (fortuneHintShop.hidden) return;
  const list = document.getElementById('fortune-bought-hints');
  // Build only purchased text, so unopened hints are not present in the page DOM.
  list.replaceChildren(...FORTUNE_HINTS.slice(0, state.fortuneHints).map(hint => {
    const item = document.createElement('li'); item.textContent = hint.text; return item;
  }));
  const hint = FORTUNE_HINTS[state.fortuneHints], button = document.getElementById('buy-fortune-hint');
  button.textContent = hint ? `Buy hint ${state.fortuneHints + 1} · ${fmt(D(hint.cost))} ${hint.label}` : 'All translations purchased';
  button.disabled = !hint || lt(state[hint.currency], hint.cost);
}
document.getElementById('buy-fortune-hint').addEventListener('click', () => {
  const hint = FORTUNE_HINTS[state.fortuneHints];
  if (!state.cubeUnlocked || state.fortuneUnlocked || !hint || lt(state[hint.currency], hint.cost)) return;
  state[hint.currency] = minus(state[hint.currency], hint.cost);
  state.fortuneHints++;
  save(); render();
});
let fortuneEditorKey = '';
function renderFortune() {
  renderFortuneHints();
  updateFortuneProgress();
  fortuneHint.hidden = !state.cubeUnlocked || state.fortuneUnlocked;
  fortuneHint.dataset.notches = state.fortuneClue;
  fortuneHint.title = `${state.fortuneClue} of four notches are lit. The inscription can always be retried.`;
  fortunePanel.hidden = !state.fortuneUnlocked;
  if (!state.fortuneUnlocked) return;
  const locked = !fortuneAllowed() || fortuneSpinning, editing = !!state.fortunePending || fortuneSpinning;
  document.getElementById('fortune-wallet').textContent = `${state.fortuneCharges} charges · ${state.fortuneTokens} banked cogs`;
  document.getElementById('fortune-pot').textContent = `Pot: ${state.fortunePending} cogs + ${state.fortuneSeconds}s output · Next payout ×${state.fortuneMultiplier}${state.fortuneBoost ? ' + Overdrive' : ''}`;
  document.getElementById('fortune-result').textContent = fortuneSpinning ? 'Spinning…' : locked ? 'Engine paused during trials or Null gain.' : state.fortuneResult;
  document.getElementById('fortune-spin').disabled = locked || !state.fortuneCharges;
  document.getElementById('fortune-reroll').disabled = locked || !state.fortuneCharges || !editing || state.fortuneFrame < 2 || state.fortuneRerolled;
  document.getElementById('fortune-bank').disabled = locked || !editing;
  document.getElementById('fortune-frame').textContent = `Frame ${state.fortuneFrame}/4 · Quality ${state.fortuneQuality}/4 · ${fortuneUsed()}/${fortuneCapacity()} space · ${state.fortuneWedges.length}/${fortuneSlots()} slots`;
  for (const [kind, level] of [['frame', state.fortuneFrame], ['quality', state.fortuneQuality]]) {
    const button = document.getElementById(`fortune-upgrade-${kind}`);
    button.textContent = level >= 4 ? `${kind} complete` : `Upgrade ${kind} · ${10 * 2 ** level} cogs`;
    button.disabled = editing || level >= 4 || state.fortuneTokens < 10 * 2 ** level;
  }
  document.getElementById('fortune-add').disabled = editing || state.fortuneWedges.length >= fortuneSlots() || fortuneUsed() + 2 > fortuneCapacity();
  const editorKey = JSON.stringify([state.fortuneWedges, state.fortuneFrame, editing]);
  if (editorKey !== fortuneEditorKey) {
    fortuneEditorKey = editorKey;
    document.getElementById('fortune-wedges').innerHTML = state.fortuneWedges.map((id, i) => `<fieldset><legend>Wedge ${i + 1}</legend><label>Type <select data-fortune-wedge="${i}" ${editing ? 'disabled' : ''}>${Object.entries(FORTUNE_WEDGES).map(([key, w]) => `<option value="${key}" ${key === id ? 'selected' : ''} ${fortuneUsed() - FORTUNE_WEDGES[id].space + w.space > fortuneCapacity() ? 'disabled' : ''}>${w.name} · ${w.space} space — ${w.detail}</option>`).join('')}</select></label>${i >= 4 ? `<button data-fortune-remove="${i}" ${editing ? 'disabled' : ''}>Remove</button>` : ''}</fieldset>`).join('');
    let angle = 0;
    const parts = fortuneSegments().map(part => { const start = angle; angle += part.weight / (fortuneCapacity() + 4) * 360; return `${part.color} ${start}deg ${angle}deg`; });
    const wheel = document.getElementById('fortune-wheel'); wheel.style.background = `conic-gradient(${parts.join(',')})`;
    document.getElementById('fortune-odds').textContent = fortuneSegments().map(part => `${part.name}: ${(100 * part.weight / (fortuneCapacity() + 4)).toFixed(1)}%`).join(' · ');
    wheel.setAttribute('aria-label', fortuneSegments().map(part => `${part.name}: ${(100 * part.weight / (fortuneCapacity() + 4)).toFixed(1)}%`).join(', '));
    if (!wheel.style.transform) { wheel.style.transition = 'none'; wheel.style.transform = 'rotate(0deg)'; void wheel.offsetWidth; wheel.style.transition = ''; }
  }
}
fortunePanel.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button || button.disabled || !state.fortuneUnlocked || fortuneSpinning) return;
  if (button.id === 'fortune-spin') spinFortune(false, true);
  if (button.id === 'fortune-reroll') spinFortune(true, true);
  if (button.id === 'fortune-bank') bankFortune();
  if (!state.fortunePending) {
    if (button.id === 'fortune-add' && state.fortuneWedges.length < fortuneSlots() && fortuneUsed() + 2 <= fortuneCapacity()) state.fortuneWedges.push('points');
    if (button.dataset.fortuneRemove !== undefined && Number(button.dataset.fortuneRemove) >= 4) state.fortuneWedges.splice(Number(button.dataset.fortuneRemove), 1);
    for (const kind of ['frame', 'quality']) if (button.id === `fortune-upgrade-${kind}`) {
      const key = kind === 'frame' ? 'fortuneFrame' : 'fortuneQuality', cost = 10 * 2 ** state[key];
      if (state[key] < 4 && state.fortuneTokens >= cost) { state.fortuneTokens -= cost; state[key]++; }
    }
  }
  save(); render();
});
fortunePanel.addEventListener('change', event => {
  const index = Number(event.target.dataset.fortuneWedge), id = event.target.value;
  if (fortuneSpinning || !state.fortuneUnlocked || state.fortunePending || !Number.isInteger(index) || index < 0 || index >= state.fortuneWedges.length || !Object.hasOwn(FORTUNE_WEDGES, id)) return;
  const next = [...state.fortuneWedges]; next[index] = id;
  if (fortuneUsed(next) <= fortuneCapacity()) state.fortuneWedges = next;
  save(); render();
});

// Expansion progress uses additive save fields so older saves retain their progress.
const ACHIEVEMENTS = {
  neutral: ['A resounding ×1', 'Buy Neutral multiplier.', () => state.alphaNeutralBought],
  cube: ['Thinking inside the box', 'Reach Cube level 10.', () => state.cubeLevel >= 10],
  combo: ['Two problems at once', 'Complete a combined Pyramid trial.', () => state.completedCombos.length > 0],
  reset: ['Have we met before?', 'Ascend once.', () => state.totalAscendances > 0],
  burst: ['Acceptable workplace temperature', 'Activate a full-charge Spark burst.', () => false],
  research: ['Peer reviewed by nobody', 'Reach research level 5.', () => state.researchLevel === 5]
};
function awardAchievement(id) {
  if (!state.achievements.includes(id)) { state.achievements.push(id); toast(`Achievement: ${ACHIEVEMENTS[id][0]}`); }
}
function checkAchievements() { for (const [id, info] of Object.entries(ACHIEVEMENTS)) if (info[2]()) awardAchievement(id); }
function applyAscendanceMilestones() {
  if (state.totalAscendances >= 1) { state.printer = true; state.press = true; }
  if (state.totalAscendances >= 3) { state.expansionUnlocked = true; state.maxBuyUnlocked = true; }
  if (state.totalAscendances >= 5) { state.creditEngine = true; state.cubeUnlocked = true; state.pyramidUnlocked = true; }
  if (state.totalAscendances >= 10) { state.automationsUnlocked = true; state.automationBought.fill(true); state.automationActive.fill(true); }
}
function presetUnlocked(mode) {
  return mode === 'off' || state.automationsUnlocked && (mode === 'fast' || mode === 'save' && state.completedChallenges.length >= 3 || mode === 'push' && state.totalAscendances >= 1);
}
function presetAllowsPurchase(layer, cost, balance) {
  return state.automationPresets[layer] !== 'save' || D(cost).lte(D(balance).times(1 - state.automationReserve[layer] / 100));
}
function runPresetResets(now) {
  // No automatic trial completion or destructive resets during challenges.
  if (!state.automationsUnlocked || state.activeChallenge) return;
  ['prestige-button', 'credit-prestige-button'].forEach((id, layer) => {
    const mode = state.automationPresets[layer];
    if (!presetUnlocked(mode) || !['fast', 'push'].includes(mode)) return;
    const interval = state.automationSeconds[layer] * (mode === 'push' ? 5 : 1) * 1000;
    const ready = layer ? gte(state.tokens, '1e33') : gte(state.balance, nextGoal());
    if (ready && now - state.automationLastReset[layer] >= interval) (layer ? performCreditPrestige : performTokenPrestige)();
  });
}
function cubeTargetAvailable(target) { return state.cubeUnlocked && (target === 'ascendance' ? state.ascCubeAscendance : target === 'alpha' ? state.ascCubeAlpha : ['points', 'tokens', 'credits'].includes(target)); }
function loadoutSlots() { return state.totalAscendances >= 3 ? 3 : state.totalAscendances >= 1 ? 2 : 1; }
const expansionPanel = document.createElement('section');
expansionPanel.id = 'expansion-panel';
expansionPanel.className = 'expansion-panel';
document.querySelector('.prestige').before(expansionPanel);
expansionPanel.innerHTML = `
<details open><summary>Discoveries &amp; mastery</summary>
<div id="loadout-feature"><h3>Cube loadouts</h3><p>Save a target, then restore it in one click. Slots unlock with the Cube, 1 Ascendance, and 3 Ascendances. Cube levels and clicks are shared.</p><div id="loadout-slots"></div></div>
<div id="combo-feature"><h3>Combined Pyramid trials</h3><p>Pair completed trials. Reach 1e33 tokens under both restrictions, then credit prestige. Each unique pair adds +10% to token and credit rewards. Starting clears credits and the credit run.</p><label>Deduction <select id="combo-deduction">${[1,2,3].map(i => `<option value="deduction${i}">Deduction ${i}</option>`).join('')}</select></label>
<label>Time limit <select id="combo-time">${[1,2,3].map(i => `<option value="time${i}">Time Limit ${i}</option>`).join('')}</select></label><button id="start-combo">Start combined trial</button><p id="combo-progress"></p></div>
<div id="research-feature"><h3>Data research</h3><p>Requires all five lore records. Choose one branch: Production doubles P$/sec per level; Resets doubles token and credit reset rewards per level; Automation adds one autobuyer pass per tick per level. Levels cost 10, 20, 40, 80, 160 Data. Switch branches freely; Ascendance clears research and refunds nothing.</p><select id="research-branch"><option value="none">Choose research</option><option value="production">Production</option><option value="resets">Resets</option><option value="automation">Automation</option></select><button id="buy-research">Research</button><p id="research-progress"></p></div>
<div id="preset-feature"><h3>Automation presets</h3><p>Uses purchased, active autobuyers. Fast resets unlocks with Automations; Save for next upgrade after 3 trials; Long push after 1 Ascendance. Off keeps ordinary autobuyers running. Fast resets uses your interval; Long push waits 5× longer. Save mode keeps a reserve and never resets. Trials always disable automatic resets.</p>${['P$ → tokens','Tokens → credits'].map((name, i) => `<fieldset><legend>${name}</legend><select id="preset-${i}"><option value="off">Off</option><option value="fast">Fast resets</option><option value="save">Save for next upgrade</option><option value="push">Long push</option></select><label>Reset interval (seconds) <input id="preset-seconds-${i}" type="number" min="5" max="3600"></label><label>Reserve % <input id="preset-reserve-${i}" type="number" min="0" max="90"></label></fieldset>`).join('')}</div>
<div id="burst-feature"><h3>Spark charge &amp; burst</h3><p>Production charges 1% every 3 seconds after your first Spark reset. Spend 25%, 50%, or all stored charge for 30 seconds of ×(1 + charge/25) P$/sec, up to ×5. Charging pauses during bursts.</p><p id="burst-progress"></p>${[25,50,100].map(n => `<button data-burst="${n}">${n === 100 ? 'Spend all charge' : `Spend ${n}%`}</button>`).join('')}</div>
<h3>Ascendance milestones</h3><p id="asc-milestones"></p>
<h3>Questionable achievements</h3><p>Three achievements unlock Gold; all six unlock Violet. Rewards are cosmetic.</p><ul id="achievement-list"></ul><label>Theme <select id="achievement-theme"><option value="default">Default</option><option value="gold">Gold</option><option value="violet">Violet</option></select></label>
</details>`;
function renderExpansion() {
  renderFortune();
  for (const [id, visible] of [['loadout',state.cubeUnlocked],['combo',state.pyramidUnlocked],['research',state.dataLore.every(Boolean)],['preset',state.automationsUnlocked],['burst',state.sparkPrestiges > 0]]) document.getElementById(`${id}-feature`).hidden = !visible;
  document.getElementById('loadout-slots').innerHTML = Array.from({length:3}, (_,i) => `<p>Slot ${i+1}: ${state.cubeLoadouts[i] || 'Empty'} <button data-save-loadout="${i}" ${i >= loadoutSlots() ? 'disabled' : ''}>Save current target</button> <button data-load-loadout="${i}" ${i >= loadoutSlots() || !cubeTargetAvailable(state.cubeLoadouts[i]) ? 'disabled' : ''}>Load</button></p>`).join('');
  document.getElementById('combo-progress').textContent = `${state.completedCombos.length}/9 pairs complete: ${state.completedCombos.map(id => challengeNames[id]).join(', ') || 'none'}`;
  const combo = `${document.getElementById('combo-deduction').value}+${document.getElementById('combo-time').value}`;
  document.getElementById('start-combo').disabled = !!state.activeChallenge || state.completedCombos.includes(combo) || !combo.split('+').every(id => state.completedChallenges.includes(id));
  document.getElementById('research-branch').value = state.researchBranch;
  document.getElementById('research-progress').textContent = `Level ${state.researchLevel}/5 · ${state.researchBranch}`;
  document.getElementById('buy-research').textContent = state.researchLevel >= 5 ? 'Research complete' : `${10 * 2 ** state.researchLevel} Data`;
  document.getElementById('buy-research').disabled = state.researchLevel >= 5 || state.researchBranch === 'none' || lt(state.data, 10 * 2 ** state.researchLevel);
  for (let i = 0; i < 2; i++) {
    const select = document.getElementById(`preset-${i}`); select.value = state.automationPresets[i];
    for (const option of select.options) option.disabled = !presetUnlocked(option.value);
    for (const [suffix, values] of [['seconds',state.automationSeconds],['reserve',state.automationReserve]]) { const input = document.getElementById(`preset-${suffix}-${i}`); if (document.activeElement !== input) input.value = values[i]; }
  }
  const bursting = Date.now() < state.sparkBurstUntil;
  document.getElementById('burst-progress').textContent = `${state.sparkCharge.toFixed(1)}% charged${bursting ? ` · ×${state.sparkBurstPower} burst: ${Math.ceil((state.sparkBurstUntil-Date.now())/1000)}s` : ''}`;
  expansionPanel.querySelectorAll('[data-burst]').forEach(b => { b.disabled = bursting || state.sparkCharge < (Number(b.dataset.burst) === 100 ? 1 : Number(b.dataset.burst)); });
  document.getElementById('asc-milestones').textContent = [[1,'Start resets with both printers'],[3,'Keep Expansion and Max Buy'],[5,'Start with Credit engine, Cube, and Pyramid'],[10,'Start with all automations']].map(([n,label]) => `${state.totalAscendances >= n ? '✓' : '○'} ${n}: ${label}`).join(' · ');
  document.getElementById('achievement-list').innerHTML = Object.entries(ACHIEVEMENTS).map(([id, info]) => `<li>${state.achievements.includes(id) ? '✓' : '○'} ${info[0]} — ${info[1]}</li>`).join('');
  const theme = document.getElementById('achievement-theme'); theme.value = state.achievementTheme;
  theme.options[1].disabled = state.achievements.length < 3; theme.options[2].disabled = state.achievements.length < 6;
  document.body.dataset.achievementTheme = state.achievementTheme;
}
expansionPanel.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button || button.disabled) return;
  if (button.dataset.saveLoadout !== undefined && state.cubeUnlocked) state.cubeLoadouts[Number(button.dataset.saveLoadout)] = state.cubeTarget;
  if (button.dataset.loadLoadout !== undefined) { const target = state.cubeLoadouts[Number(button.dataset.loadLoadout)]; if (cubeTargetAvailable(target)) state.cubeTarget = target; }
  if (button.id === 'start-combo' && state.pyramidUnlocked && !state.activeChallenge) {
    const id = `${document.getElementById('combo-deduction').value}+${document.getElementById('combo-time').value}`;
    if (state.completedCombos.includes(id) || !id.split('+').every(v => state.completedChallenges.includes(v))) return;
    state.credits = D(0); resetCreditRun(); state.activeChallenge = id; state.challengeEndsAt = Date.now() + challengeDuration(id) * 60000; activeTab = 'pyramid';
  }
  if (button.id === 'buy-research' && state.dataLore.every(Boolean) && state.researchBranch !== 'none' && state.researchLevel < 5) {
    const cost = 10 * 2 ** state.researchLevel; if (gte(state.data, cost)) { state.data = minus(state.data, cost); state.researchLevel++; }
  }
  if (button.dataset.burst && state.sparkPrestiges > 0 && Date.now() >= state.sparkBurstUntil) {
    const amount = Number(button.dataset.burst) === 100 ? state.sparkCharge : Number(button.dataset.burst);
    if (amount < 1 || amount > state.sparkCharge) return;
    if (amount === 100) awardAchievement('burst');
    state.sparkCharge -= amount; state.sparkBurstPower = 1 + amount / 25; state.sparkBurstUntil = Date.now() + 30000;
  }
  checkAchievements(); save(); render();
});
expansionPanel.addEventListener('change', event => {
  const el = event.target;
  if (el.id === 'research-branch' && state.dataLore.every(Boolean)) state.researchBranch = el.value;
  for (let i=0;i<2;i++) {
    if (el.id === `preset-${i}` && presetUnlocked(el.value)) { state.automationPresets[i] = el.value; state.automationLastReset[i] = Date.now(); }
    if (el.id === `preset-seconds-${i}`) state.automationSeconds[i] = Math.max(5, Math.min(3600, Number(el.value) || 30));
    if (el.id === `preset-reserve-${i}`) state.automationReserve[i] = Math.max(0, Math.min(90, Number(el.value) || 0));
  }
  if (el.id === 'achievement-theme' && (el.value === 'default' || el.value === 'gold' && state.achievements.length >= 3 || el.value === 'violet' && state.achievements.length >= 6)) state.achievementTheme = el.value;
  save(); render();
});
applyAscendanceMilestones();

let lastTick = Date.now();
function runAutomations() {
  const buyPointsUpgrade = (index, unlocked, alreadyBought, cost, action, free = false) => {
    if (!presetAllowsPurchase(0, cost, state.balance) || !state.automationActive[index] || !unlocked || alreadyBought || lt(state.balance, cost)) return;
    if (!free) state.balance = minus(state.balance, cost);
    action();
  };
  buyPointsUpgrade(0, true, state.printer, 0, () => { state.printer = true; });
  buyPointsUpgrade(1, state.printer, state.press, pointCost(10), () => { state.press = true; });
  buyPointsUpgrade(2, state.press, state.multiplierLevel >= upgradeLevelMax(), multiplierCost(), () => { state.multiplierLevel += 1; }, state.freeRunUpgrades);
  buyPointsUpgrade(3, state.press, state.incomeLevel >= upgradeLevelMax(), incomeCost(), () => { state.incomeLevel += 1; }, state.freeRunUpgrades);
  buyPointsUpgrade(4, state.multiplierLevel > 0, state.powerLevel >= powerMax(), powerCost(), () => { state.powerLevel += 1; });
  buyPointsUpgrade(5, state.incomeLevel > 0, state.clickLevel >= upgradeLevelMax(), clickCost(), () => { state.clickLevel += 1; });
  buyPointsUpgrade(6, state.expansionUnlocked, state.logLevel >= 3, logCost(), () => { state.logLevel += 1; });
  buyPointsUpgrade(7, state.expansionUnlocked, state.exponentLevel >= exponentMax(), exponentCost(), () => { state.exponentLevel += 1; });
  buyPointsUpgrade(8, state.expansionUnlocked, state.capLevel >= upgradeLevelMax(), capCost(), () => { state.capLevel += 1; }, state.freeRunUpgrades);
  buyPointsUpgrade(9, state.expansionUnlocked && state.creditExponentLevel > 0, state.exponentCapLevel >= 5, exponentCapCost(), () => { state.exponentCapLevel += 1; });
  if (presetAllowsPurchase(1, tokenAmplifierCost(), state.tokens) && state.automationActive[10] && gte(state.tokens, tokenAmplifierCost()) && state.tokenMultiplierLevel < 10) {
    state.tokens = minus(state.tokens, tokenAmplifierCost()); state.tokenMultiplierLevel += 1;
  }
  if (presetAllowsPurchase(1, expansionCost(), state.tokens) && state.automationActive[11] && state.tokenBoostLevel > 0 && gte(state.tokens, expansionCost()) && !state.expansionUnlocked) {
    state.tokens = minus(state.tokens, expansionCost()); state.expansionUnlocked = true;
  }
}
setInterval(() => {
  const now = Date.now();
  const elapsed = Math.max(0, (now - lastTick) / 1000);
  lastTick = now;
  runAutomations();
  if (state.researchBranch === 'automation') for (let i = 0; i < state.researchLevel; i++) runAutomations();
  runPresetResets(now);
  if (state.sparkPrestiges > 0 && rate().gt(0) && now >= state.sparkBurstUntil) state.sparkCharge = Math.min(100, state.sparkCharge + elapsed / 3 * kirbyBonus('spark'));
  if (kirbyAvailable() && state.kirbyAbility === 'stone' && state.cubeUnlocked) {
    if (state.kirbyStoneTarget !== state.cubeTarget) state.kirbyStoneSeconds = 0;
    state.kirbyStoneTarget = state.cubeTarget;
    state.kirbyStoneSeconds = Math.min(300, state.kirbyStoneSeconds + elapsed);
  }
  checkAchievements();
  if (state.cubeUnlocked && state.ascCubeAutoclicker) addCubeClicks(cubeClickGain().times(elapsed));
  const earned = rate().times(elapsed);
  if (state.activeChallenge && state.challengeEndsAt && now >= state.challengeEndsAt) { const name = challengeNames[state.activeChallenge]; state.activeChallenge = ''; state.challengeEndsAt = 0; toast(`${name} failed · Time expired`); }
  const passiveTokensEarned = tokenIncomeRate().times(elapsed);
  if (state.alphaGeneratorBought) changeAlpha(applyAlphaGain(cubeMultiplier('alpha').times(elapsed / 10)));
  if (state.darkMatter3Bought) {
    state.darkMatterFlipTimer += elapsed;
    while (state.darkMatterFlipTimer >= state.darkMatterFlipDuration) {
      state.darkMatterFlipTimer -= state.darkMatterFlipDuration;
      if (Math.random() < 0.5) {
        state.darkMatterCoinBoost = state.darkMatterCoinBoost.times(2);
        if (state.darkMatter4Bought) state.darkMatterFlipDuration += 1;
      } else {
        state.darkMatterCoinBoost = D(1);
        state.darkMatterFlipDuration = 1;
      }
    }
  }
  const darkMatterEarned = darkMatterRate().times(elapsed);
  if (darkMatterEarned.gt(0)) state.darkMatter = plus(state.darkMatter, darkMatterEarned);
  if (earned.gt(0)) {
    state.balance = plus(state.balance, earned);
    state.runEarned = plus(state.runEarned, earned);
    state.lifetime = plus(state.lifetime, earned);
  }
  if (gt(passiveTokensEarned, 0)) state.tokens = plus(state.tokens, passiveTokensEarned);
  render();
  save();
}, 250);
render();

const saveTools = document.querySelector('#more-menu');

function isSaveObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function isValidSave(snapshot) {
  if (!isSaveObject(snapshot) || !Object.hasOwn(snapshot, 'balance') || !Object.hasOwn(snapshot, 'runEarned')) return false;
  return Object.entries(snapshot).every(([key, value]) => {
    if (!Object.hasOwn(initialState, key)) return false;
    if (CURRENCY_KEYS.includes(key)) {
      return (typeof value === 'string' && value.trim() !== '' || typeof value === 'number')
        && D(value).isFinite() && D(value).gte(0);
    }
    const fallback = initialState[key];
    if (['blackjackDeck', 'blackjackPlayer', 'blackjackDealer'].includes(key)) return Array.isArray(value) && value.length <= 52 && new Set(value).size === value.length && value.every(n => Number.isInteger(n) && n >= 0 && n < 52);
    if (key === 'alphaTerms') return value === null || isSaveObject(value) && Object.keys(value).length === 3 && ['base', 'e', 'pi'].every(k => typeof value[k] === 'string' && value[k].trim() !== '' && D(value[k]).isFinite());
    if (key === 'blackjackStakeKind') return ['base', 'e', 'pi'].includes(value);
    if (key === 'prestigeAnimation') return PRESTIGE_STYLES.includes(value);
    if (key === 'kirbyAbility') return ['beam', 'mirror', 'spark', 'stone', 'fisher'].includes(value);
    if (key === 'kirbyStoneTarget') return ['points', 'tokens', 'credits', 'ascendance', 'alpha'].includes(value);
    if (key === 'kirbyFullness') return Number.isInteger(value) && value >= 0 && value <= 100;
    if (key === 'kirbyStoneSeconds') return Number.isFinite(value) && value >= 0 && value <= 300;
    if (key === 'kirbyCatches') return Number.isInteger(value) && value >= 0 && value <= 4;
    if (key === 'fortuneHints') return Number.isInteger(value) && value >= 0 && value <= FORTUNE_HINTS.length;
    if (key === 'fortuneClue') return Number.isInteger(value) && value >= 0 && value <= 4;
    if (key === 'fortuneWedges') return Array.isArray(value) && value.length >= 4 && value.length <= 6 && value.every(v => Object.hasOwn(FORTUNE_WEDGES, v)) && value.reduce((n, v) => n + FORTUNE_WEDGES[v].space, 0) <= 10 + 2 * (snapshot.fortuneFrame || 0) && value.length <= 4 + Math.floor((snapshot.fortuneFrame || 0) / 2);
    if (['fortuneFrame', 'fortuneQuality'].includes(key)) return Number.isInteger(value) && value >= 0 && value <= 4;
    if (key === 'fortuneCharges') return Number.isInteger(value) && value >= 0 && value <= 100;
    if (key === 'fortuneMultiplier') return Number.isInteger(value) && value >= 1 && value <= 8;
    if (key === 'fortuneSeconds') return Number.isInteger(value) && value >= 0 && value <= 120;
    if (key === 'fortuneRefunds') return Number.isInteger(value) && value >= 0 && value <= 2;
    if (key === 'fortuneStreak') return Number.isInteger(value) && value >= 0 && value <= 3;
    if (key === 'fortuneLast') return ['', 'blank'].includes(value) || Object.hasOwn(FORTUNE_WEDGES, value);
    if (key === 'fortuneResult') return typeof value === 'string' && value.length <= 200;
    if (key === 'cubeLoadouts') return Array.isArray(value) && value.length === 3 && value.every(v => ['', 'points', 'tokens', 'credits', 'ascendance', 'alpha'].includes(v));
    if (key === 'researchBranch') return ['none', 'production', 'resets', 'automation'].includes(value);
    if (key === 'researchLevel') return Number.isInteger(value) && value >= 0 && value <= 5;
    if (key === 'completedCombos') return Array.isArray(value) && value.every(v => v.includes('+') && Object.hasOwn(challengeNames, v));
    if (key === 'achievements') return Array.isArray(value) && value.every(v => Object.hasOwn(ACHIEVEMENTS, v));
    if (key === 'achievementTheme') return ['default', 'gold', 'violet'].includes(value);
    if (key === 'automationPresets') return Array.isArray(value) && value.length === 2 && value.every(v => ['off', 'fast', 'save', 'push'].includes(v));
    if (['automationSeconds', 'automationReserve', 'automationLastReset'].includes(key)) return Array.isArray(value) && value.length === 2 && value.every(v => Number.isFinite(v) && v >= 0) && (key !== 'automationReserve' || value.every(v => v <= 90)) && (key !== 'automationSeconds' || value.every(v => v >= 5 && v <= 3600));
    if (key === 'sparkCharge') return Number.isFinite(value) && value >= 0 && value <= 100;
    if (key === 'sparkBurstPower') return Number.isFinite(value) && value >= 1 && value <= 5;
    if (key === 'priceOrigins') {
      return isSaveObject(value) && Object.values(value).every(n => Number.isFinite(n) && n >= 0);
    }
    if (key === 'activeChallenge') return value === '' || Object.hasOwn(challengeNames, value);
    if (key === 'cubeTarget') return ['points', 'tokens', 'credits', 'ascendance', 'alpha'].includes(value);
    if (key === 'completedChallenges') return Array.isArray(value) && value.every(id => Object.hasOwn(challengeNames, id));
    if (Array.isArray(fallback)) {
      return Array.isArray(value) && value.every(item => typeof item === typeof fallback[0]
        && (typeof item !== 'number' || Number.isSafeInteger(item) && item >= 0));
    }
    if (typeof fallback === 'number') {
      return Number.isFinite(value) && value >= 0
        && (key === 'darkMatterFlipTimer' || Number.isSafeInteger(value));
    }
    return typeof value === typeof fallback;
  });
}

saveTools.querySelector('#export-save').addEventListener('click', () => {
  const backup = JSON.stringify({ format: SAVE_KEY, state: JSON.parse(serializeState()) });
  const url = URL.createObjectURL(new Blob([backup], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'generic-incremental-save.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
const importFile = saveTools.querySelector('input[type=file]');
saveTools.querySelector('#import-save').addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async () => {
  const [file] = importFile.files;
  importFile.value = '';
  if (!file) return;

  let backup;
  try {
    backup = JSON.parse(await file.text());
    if (backup?.format !== SAVE_KEY || !isValidSave(backup.state)) throw new Error('Invalid save');
  } catch {
    toast('Choose a valid Generic Incremental save file.');
    return;
  }
  if (!window.confirm('Replace your current progress with this save?')) return;
  try {
    if (saveConflict || localStorage.getItem(SAVE_KEY) !== savedSnapshot) {
      toast('Another tab updated this save. Close it and reload before importing.');
      return;
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(backup.state));
  } catch {
    toast('Could not write the save to browser storage.');
    return;
  }
  window.location.reload();
});

document.getElementById('prestige-animation').addEventListener('change', event => {
  if (!PRESTIGE_STYLES.includes(event.target.value)) return;
  state.prestigeAnimation = event.target.value;
  render(); save();
});

// Walls belong to the visible page sections; hidden progression panels add no scroll.
document.querySelectorAll('.game-shell > section:not(.economy)').forEach(section => {
  const wall = document.createElement('div');
  wall.className = 'hard-mode-wall';
  wall.setAttribute('aria-hidden', 'true');
  section.before(wall);
});
document.getElementById('hard-mode').addEventListener('change', event => {
  state.hardMode = event.target.checked;
  render(); save();
});

const deepSettings = document.querySelector('#deep-settings');
document.querySelector('#open-deep-settings').addEventListener('click', () => deepSettings.showModal());

document.getElementById('copyright-mode').addEventListener('change', event => {
  state.copyrightMode = event.target.checked;
  state.kirbyBurstUntil = 0; state.kirbyStoneSeconds = 0;
  render(); save();
});
document.querySelectorAll('[data-kirby-feed]').forEach(b => b.addEventListener('click', () => feedKirby(b.dataset.kirbyFeed)));
document.querySelectorAll('[data-kirby-ability]').forEach(b => b.addEventListener('click', () => {
  const ability = b.dataset.kirbyAbility, now = Date.now();
  if (!kirbyAvailable() || !kirbyAbilities()[ability] || now < state.kirbySwitchAt || now < state.kirbyNapUntil) return;
  state.kirbyAbility = ability; state.kirbySwitchAt = now + 10000; state.kirbyStoneSeconds = 0;
  render(); save();
}));
document.getElementById('kirby-hypernova').addEventListener('click', () => {
  if (!kirbyAvailable() || state.kirbyFullness < 100 || Date.now() < state.kirbyNapUntil || !kirbyAbilities()[state.kirbyAbility]) return;
  state.kirbyFullness = 0; state.kirbyBurstUntil = Date.now() + 30000; state.kirbyNapUntil = state.kirbyBurstUntil + 60000;
  render(); save();
});

document.getElementById('scary-mode').addEventListener('change', event => {
  state.scaryModeActive = event.target.checked;
  render(); save();
});
