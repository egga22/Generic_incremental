import Decimal from './break_eternity.js';

const SAVE_KEY = 'pocket-foundry-save-v2';
const BASE_MAX_UPGRADE_LEVEL = 1000;
const CURRENCY_KEYS = ['balance', 'runEarned', 'lifetime', 'tokens', 'credits', 'data', 'cubeClicks', 'alpha', 'ascendance', 'darkMatter', 'darkMatterCoinBoost', 'spark'];
const D = value => value instanceof Decimal ? value : new Decimal(value ?? 0);
function upgradeLevelMax() { return BASE_MAX_UPGRADE_LEVEL + (state?.cyan15Bought ? 250 : 0); }
const lt = (a, b) => D(a).lt(b);
const lte = (a, b) => D(a).lte(b);
const gt = (a, b) => D(a).gt(b);
const gte = (a, b) => D(a).gte(b);
const plus = (a, b) => D(a).plus(b);
const minus = (a, b) => D(a).minus(b);
const initialState = { balance: 0, runEarned: 0, lifetime: 0, printer: false, press: false, multiplierLevel: 0, incomeLevel: 0, powerLevel: 0, clickLevel: 0, logLevel: 0, exponentLevel: 0, exponentCapLevel: 0, capLevel: 0, tokens: 0, totalPrestiges: 0, tokenResetCount: 0, tokenMultiplierLevel: 0, discountLevel: 0, tokenBoostLevel: 0, expansionUnlocked: false, tokenCreditLevel: 0, tokenDiscountLevel: 0, credits: 0, totalCreditPrestiges: 0, data: 0, totalDataPrestiges: 0, dataLore: Array(5).fill(false), gainZeroBought: false, gainZeroActive: false, priceOrigins: {}, creditEngine: false, creditExponentLevel: 0, heavyMint: false, cubeUnlocked: false, cubeLevel: 0, cubeClicks: 0, cubeTarget: 'points', freeRunUpgrades: false, passiveTokens: false, alphaUnlocked: false, alpha: 0, alphaGainPurchases: 0, alphaBoostLevel: 0, alphaCapLevel: 0, alphaNeutralBought: false, alphaGeneratorBought: false, darkMatterUnlocked: false, darkMatter: 0, darkMatter1Bought: false, darkMatter2Bought: false, darkMatter2Level: 0, darkMatter3Bought: false, darkMatter4Bought: false, darkMatterCoinBoost: 1, darkMatterFlipTimer: 0, darkMatterFlipDuration: 1, pyramidUnlocked: false, activeChallenge: '', challengeEndsAt: 0, completedChallenges: [], creditChallengeBoost: false, automationsUnlocked: false, automationBought: Array(12).fill(false), automationActive: Array(12).fill(false), ascendance: 0, totalAscendances: 0, ascCurrencyBoost: false, ascCreditExponent: false, ascCubePowerLevel: 0, ascCubeAutoclicker: false, ascCubeAscendance: false, ascCubeAlpha: false, ascPointDiscountLevel: 0, ascTotalLevelBoost: false, ascAllCurrencyLevel: 0, ascMainlinePowerLevel: 0, spark: 0, sparkPrestiges: 0, sparkUpgrade1Level: 0, sparkUpgrade2Level: 0, sparkUpgrade3Level: 0, pointUpgrade16Bought: false, pointUpgrade17Bought: false, pointUpgrade18Bought: false, pointUpgrade19Bought: false, pointUpgrade20Bought: false, cyan13Bought: false, cyan14Level: 0, cyan15Bought: false, cyanSquareCounts: [0, 0, 0] };
let savedSnapshot;
let saveConflict = false;
const savedState = loadState();
let state = { ...initialState, ...savedState, totalPrestiges: savedState.totalPrestiges ?? savedState.tokens ?? 0, tokenResetCount: savedState.tokenResetCount ?? savedState.totalPrestiges ?? savedState.tokens ?? 0 };
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
function save() {
  if (saveConflict) return;
  if (localStorage.getItem(SAVE_KEY) !== savedSnapshot) {
    saveConflict = true;
    window.alert('Another tab updated this save. Close the other tab, then reload this one to continue from the latest save.');
    return;
  }
  const snapshot = { ...state };
  for (const key of CURRENCY_KEYS) snapshot[key] = state[key].toString();
  const serialized = JSON.stringify(snapshot);
  if (serialized === savedSnapshot) return;
  localStorage.setItem(SAVE_KEY, serialized);
  savedSnapshot = serialized;
}
function incomeBase() { return (state.printer ? 1 : 0) + (state.press ? 1 : 0) + state.incomeLevel * (state.incomeLevel + 1) / 2; }
function currencyGainMultiplier() { return state.gainZeroActive ? 0 : D(100).pow(state.ascCurrencyBoost ? 1 : 0).times(D(2).pow(state.ascAllCurrencyLevel)); }
function applyCurrencyGain(amount) { return state.gainZeroActive ? D(0) : D(amount).pow(D(1.3).pow(state.ascMainlinePowerLevel)).times(D(100).pow(state.ascCurrencyBoost ? 1 : 0)).times(D(2).pow(state.ascAllCurrencyLevel)); }
function applyAlphaGain(amount) { return state.gainZeroActive ? D(0) : D(amount); }
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
function rate() {
  let value = D(incomeBase()).times(D(1.1).pow(state.multiplierLevel)).times(D(1.3).pow(state.powerLevel)).times(D(2).pow(state.tokenMultiplierLevel)).times(D(1.5).pow(state.tokenBoostLevel)).times(1 + state.totalPrestiges * 0.5).times(pointMultiplier());
  if (state.logLevel) value = value.times(state.balance.max(10).log10().max(1).pow(state.logLevel));
  if (state.exponentLevel && value.gt(0)) value = value.pow(D(1.1).pow(state.exponentLevel));
  const exponent = challengeExponent();
  const challenged = exponent < 1 && value.gt(0) ? value.pow(exponent) : value;
  return applyCurrencyGain(challenged.times(sparkRateMultiplier()));
}
const challengeNames = { deduction1: 'Deduction I', deduction2: 'Deduction II', deduction3: 'Deduction III', time1: 'Time Limit I', time2: 'Time Limit II', time3: 'Time Limit III' };
function saleGain() {
  return applyCurrencyGain(D(1 + state.clickLevel * 2).times(pointMultiplier()).pow(challengeExponent()));
}
function challengeExponent() { return ({ deduction1: .9, deduction2: .8, deduction3: .7 })[state.activeChallenge] || 1; }
function challengeDuration(id) { const base = ({ time1: 7, time2: 6, time3: 5 })[id] || 0; return base ? base + state.cyan14Level : 0; }
function resetCreditRun() {
  // Permanent upgrades, including Automations and the Pyramid, stay bought across this reset.
  state.tokens = D(0); state.totalPrestiges = 0; state.balance = D(0); state.runEarned = D(0);
  state.printer = false; state.press = false; state.multiplierLevel = 0; state.incomeLevel = 0;
  state.powerLevel = 0; state.clickLevel = 0; state.logLevel = 0; state.exponentLevel = 0;
  state.exponentCapLevel = 0; state.capLevel = 0; state.tokenMultiplierLevel = 0;
  state.discountLevel = 0; state.tokenBoostLevel = 0; state.expansionUnlocked = false;
  state.tokenCreditLevel = 0; state.tokenDiscountLevel = 0;
  state.pointUpgrade16Bought = false; state.pointUpgrade17Bought = false; state.pointUpgrade18Bought = false; state.pointUpgrade19Bought = false; state.pointUpgrade20Bought = false;
  resetPriceOrigins(['multiplierLevel', 'incomeLevel', 'powerLevel', 'clickLevel', 'discountLevel', 'tokenBoostLevel', 'tokenCreditLevel', 'tokenDiscountLevel', 'exponentCapLevel', 'logLevel', 'exponentLevel', 'capLevel']);
}
function resetAscendanceRun() {
  state.balance = D(0); state.runEarned = D(0); state.lifetime = D(0);
  state.printer = false; state.press = false; state.multiplierLevel = 0; state.incomeLevel = 0;
  state.powerLevel = 0; state.clickLevel = 0; state.logLevel = 0; state.exponentLevel = 0;
  state.exponentCapLevel = 0; state.capLevel = 0; state.tokens = D(0); state.totalPrestiges = 0;
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
function challengeGainMultiplier() { return state.creditChallengeBoost ? state.completedChallenges.length + 1 : 1; }
function tokenIncomeRate() { return state.passiveTokens && state.tokenResetCount > 0 ? applyCurrencyGain(state.balance.div(state.tokenResetCount * 1000).times(challengeGainMultiplier())) : D(0); }
function tokenReward() {
  let reward = state.balance.div(nextGoal()).floor().times(D(1.25).pow(state.tokenBoostLevel));
  if (state.creditExponentLevel) reward = reward.pow(D(1.01).pow(state.creditExponentLevel));
  return applyCurrencyGain(reward.times(tokenMultiplier()).times(challengeGainMultiplier()));
}
function cubeMultiplier(target) {
  const unlocked = state.cubeUnlocked && (target === 'ascendance' ? state.ascCubeAscendance : target === 'alpha' ? state.ascCubeAlpha : true);
  return unlocked && state.cubeTarget === target ? D(state.cubeLevel).max(1) : D(1);
}
function cubeClickPower() { return 2 ** state.ascCubePowerLevel; }
function cubeClickGain() { return D(cubeClickPower()).times(applyCurrencyGain(1)); }
function ascendanceGain(amount) { return state.gainZeroActive ? D(0) : D(amount).times(cubeMultiplier('ascendance')); }
function addCubeClicks(amount) {
  state.cubeClicks = plus(state.cubeClicks, amount);
  while (gte(state.cubeClicks, cubeNextCost())) {
    state.cubeClicks = minus(state.cubeClicks, cubeNextCost());
    state.cubeLevel += 1;
  }
}
function totalUpgradeLevels() {
  const levels = [state.multiplierLevel,state.incomeLevel,state.powerLevel,state.clickLevel,state.logLevel,state.exponentLevel,state.exponentCapLevel,state.capLevel,state.tokenMultiplierLevel,state.discountLevel,state.tokenBoostLevel,state.tokenCreditLevel,state.tokenDiscountLevel,state.creditExponentLevel,state.sparkUpgrade1Level,state.sparkUpgrade2Level,state.sparkUpgrade3Level,state.alphaGainPurchases,state.alphaBoostLevel,state.alphaCapLevel,state.ascCubePowerLevel,state.ascPointDiscountLevel,state.cyan14Level,state.darkMatter2Level];
  const bought = [state.printer,state.press,state.expansionUnlocked,state.creditEngine,state.heavyMint,state.cubeUnlocked,state.freeRunUpgrades,state.passiveTokens,state.alphaUnlocked,state.alphaNeutralBought,state.alphaGeneratorBought,state.darkMatterUnlocked,state.darkMatter1Bought,state.darkMatter3Bought,state.darkMatter4Bought,state.pyramidUnlocked,state.creditChallengeBoost,state.automationsUnlocked,state.ascCurrencyBoost,state.ascCreditExponent,state.ascCubeAutoclicker,state.ascCubeAscendance,state.ascCubeAlpha,state.ascTotalLevelBoost,state.pointUpgrade16Bought,state.pointUpgrade17Bought,state.pointUpgrade18Bought,state.pointUpgrade19Bought,state.pointUpgrade20Bought,state.cyan13Bought,state.cyan15Bought];
  return levels.reduce((sum, level) => sum + (Number(level) || 0), state.automationBought.filter(Boolean).length + state.dataLore.filter(Boolean).length + bought.filter(Boolean).length + state.ascAllCurrencyLevel + state.ascMainlinePowerLevel);
}
function pointMultiplier() { return D(state.creditEngine ? 25 : 1).times(state.heavyMint ? 5 : 1).times(cubeMultiplier('points')).times(state.ascTotalLevelBoost ? D(totalUpgradeLevels()).max(1) : 1).times(state.pointUpgrade16Bought ? 10 : 1).times(state.pointUpgrade17Bought ? 100 : 1).times(state.pointUpgrade18Bought ? 1000 : 1).times(state.pointUpgrade19Bought ? 1e6 : 1).times(state.pointUpgrade20Bought ? 1e12 : 1); }
function tokenMultiplier() { return D(state.creditEngine ? 25 : 1).times(state.heavyMint ? 5 : 1).times(cubeMultiplier('tokens')); }
function creditMultiplier() { return applyCurrencyGain(cubeMultiplier('credits').times(state.tokenCreditLevel || 1).times(challengeGainMultiplier())); }
function tokenCostMultiplier() { return D(state.heavyMint ? 7.5 : 1).div(state.priceOrigins?.tokenCostMultiplier || 1); }
function tokenAmplifierCost() { return D(3).times(tokenCostMultiplier()); }
function discountTokenCost() { return D(3).times(tokenCostMultiplier()); }
function multiplierCost() { return pointCost(D(100).times(D(1.5).pow(priceLevel('multiplierLevel', state.multiplierLevel))).times(D(0.7).pow(priceLevel('discountLevel', state.discountLevel))).max(1).ceil()); }
function incomeCost() { return pointCost(D(50).times(D(1.5).pow(priceLevel('incomeLevel', state.incomeLevel))).ceil()); }
function powerCost() { return pointCost(D(250).times(D(1.5).pow(priceLevel('powerLevel', state.powerLevel))).ceil()); }
function clickCost() { return pointCost(D(100).times(D(1.5).pow(priceLevel('clickLevel', state.clickLevel))).ceil()); }
function tokenBoostCost() { return D(5).times(D(1.5).pow(priceLevel('tokenBoostLevel', state.tokenBoostLevel))).times(tokenCostMultiplier()); }
function expansionCost() { return D(10).times(tokenCostMultiplier()); }
function creditPowerCost() { return D('1e15').times(D(2.5).pow(priceLevel('tokenCreditLevel', state.tokenCreditLevel))).times(D(0.99).pow(priceLevel('tokenDiscountLevel', state.tokenDiscountLevel))).times(tokenCostMultiplier()); }
function tokenDiscountCost() { return D('5e8').times(D(1.5).pow(priceLevel('tokenDiscountLevel', state.tokenDiscountLevel))).times(tokenCostMultiplier()); }
function exponentCapCost() { return pointCost(D('1e29').times(D(2).pow(priceLevel('exponentCapLevel', state.exponentCapLevel)))); }
function logCost() { return pointCost(D('1e9').times(D(1.5).pow(priceLevel('logLevel', state.logLevel)))); }
function exponentCost() { return pointCost(D('5e10').times(D(1.5).pow(priceLevel('exponentLevel', state.exponentLevel)))); }
function capCost() { return pointCost(D('5e8').times(D(1.5).pow(priceLevel('capLevel', state.capLevel)))); }
function ascPointDiscountCost() { return D('1e300').times(D(1.5).pow(state.ascPointDiscountLevel)); }
function ascAllCurrencyCost() { return D('1e12').times(D(10).pow(state.ascAllCurrencyLevel)); }
function ascMainlinePowerCost() { return D('1e175').times(D(1000).pow(state.ascMainlinePowerLevel)); }
function highPointUpgradeCost(index) { return pointCost(D(['1e180','1e200','1e220','1e240','1e260'][index - 16])); }
function sparkPrestigeCost() { return pointCost(SPARK_PRESTIGE_COST); }
function sparkReward(balance) { const ratio = D(balance).div(sparkPrestigeCost()); return ratio.lt(1) ? D(0) : ratio.log10().floor().plus(1); }
function sparkUpgradeCost(index) { const level = state[`sparkUpgrade${index}Level`]; const base = [0, 1, 10, 100][index]; const growth = [0, 1.5, 2, 3][index]; return D(base).times(D(growth).pow(level)); }
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
  return reward;
}
function powerMax() { return 100 + state.capLevel * 2; }
function exponentMax() { return 1 + state.exponentCapLevel; }
function creditExponentCost() { return D(2).times(D(2).pow(priceLevel('creditExponentLevel', state.creditExponentLevel))); }
function cubeNextCost() { return D(2).pow(priceLevel('cubeLevel', state.cubeLevel)); }
function cubeClicksToNext() { return cubeNextCost().minus(state.cubeClicks).max(0); }
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
function render() {
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
  balance.textContent = fmt(counter.value);
  balance.className = `balance currency-${counter.color}`;
  rateLine.textContent = counter.detail;
  document.querySelector('#work-button').textContent = state.gainZeroActive ? 'Restore currency gains ×1' : `Make a sale · +P$${fmt(saleGain())}`;
  document.querySelector('#run-earned').textContent = fmt(state.runEarned);
  document.querySelector('#prestige-tokens').textContent = fmt(state.tokens);
  document.querySelector('#credit-balance').textContent = fmt(state.credits);
  document.querySelector('#ascendance-balance').textContent = fmt(state.ascendance);
  document.querySelector('#run-label').textContent = gt(state.runEarned, 0) ? 'ACTIVE RUN' : 'NEW RUN';
  const goal = nextGoal();
  document.querySelector('#prestige-goal').textContent = `P$ ${fmt(goal)}`;
  document.querySelector('#progress-fill').style.width = `${Math.min(100, state.balance.div(goal).times(100).toNumber())}%`;
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
  document.querySelector('#power-cap').textContent = powerMax();
  document.querySelector('#token-tab').hidden = state.totalPrestiges < 1 && lt(state.tokens, 1);
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
  const asc3Ready = state.ascCurrencyBoost && state.cubeUnlocked;
  const asc3 = document.querySelector('#buy-asc-3');
  asc3.disabled = !asc3Ready || state.ascCubePowerLevel >= 5 || lt(state.ascendance, 10);
  asc3.textContent = state.ascCubePowerLevel >= 5 ? 'MAX LEVEL' : '10 ᛥ';
  document.querySelector('#upgrade-asc-3').classList.toggle('locked', !asc3Ready);
  document.querySelector('#asc-cube-power').textContent = cubeClickPower();
  document.querySelector('#asc-cube-power-level').textContent = state.ascCubePowerLevel;
  const asc7 = document.querySelector('#buy-asc-7');
  asc7.disabled = !state.ascCreditExponent || state.ascTotalLevelBoost || lt(state.ascendance, '1e10');
  asc7.textContent = state.ascTotalLevelBoost ? 'Bought' : '1e10 ᛥ';
  document.querySelector('#upgrade-asc-7').classList.toggle('locked', !state.ascCreditExponent);
  document.querySelector('#asc-total-level-multiplier').textContent = fmt(D(totalUpgradeLevels()).max(1));
  const asc8 = document.querySelector('#buy-asc-8');
  const asc8Cost = ascAllCurrencyCost();
  asc8.disabled = state.ascAllCurrencyLevel >= 50 || lt(state.ascendance, asc8Cost);
  asc8.textContent = state.ascAllCurrencyLevel >= 50 ? 'MAX LEVEL' : `${fmt(asc8Cost)} ᛥ`;
  document.querySelector('#asc-all-currency-level').textContent = state.ascAllCurrencyLevel;
  document.querySelector('#asc-all-currency-multiplier').textContent = fmt(D(2).pow(state.ascAllCurrencyLevel));
  document.querySelector('#upgrade-asc-8').classList.remove('locked');
  const asc9 = document.querySelector('#buy-asc-9');
  const asc9Cost = ascMainlinePowerCost();
  asc9.disabled = state.ascMainlinePowerLevel >= 50 || lt(state.ascendance, asc9Cost);
  asc9.textContent = state.ascMainlinePowerLevel >= 50 ? 'MAX LEVEL' : `${fmt(asc9Cost)} ᛥ`;
  document.querySelector('#asc-mainline-power-level').textContent = state.ascMainlinePowerLevel;
  document.querySelector('#asc-mainline-power').textContent = fmt(D(1.3).pow(state.ascMainlinePowerLevel));
  document.querySelector('#upgrade-asc-9').classList.remove('locked');
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
  const asc12Ready = state.ascCreditExponent;
  const pointDiscount = document.querySelector('#buy-point-discount');
  pointDiscount.disabled = !asc12Ready || state.ascPointDiscountLevel >= 20 || lt(state.balance, ascPointDiscountCost());
  pointDiscount.textContent = state.ascPointDiscountLevel >= 20 ? 'MAX LEVEL' : `P$ ${fmt(ascPointDiscountCost())}`;
  document.querySelector('#upgrade-point-discount').classList.toggle('locked', !asc12Ready);
  document.querySelector('#asc-point-discount-level').textContent = state.ascPointDiscountLevel;
  for (let i = 16; i <= 20; i += 1) {
    const bought = state[`pointUpgrade${i}Bought`];
    const cost = highPointUpgradeCost(i);
    const button = document.querySelector(`#buy-point-${i}`);
    button.disabled = bought || lt(state.balance, cost);
    button.textContent = bought ? 'Bought' : `P$ ${fmt(cost)}`;
    document.querySelector(`#upgrade-point-${i}`).classList.remove('locked');
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

  const multCost = multiplierCost();
  const mult = document.querySelector('#buy-multiplier');
  mult.disabled = !state.press || state.multiplierLevel >= upgradeLevelMax() || lt(state.balance, multCost);
  mult.textContent = state.multiplierLevel >= upgradeLevelMax() ? 'MAX LEVEL' : state.freeRunUpgrades ? `P$ ${fmt(multCost)} · kept` : `P$ ${fmt(multCost)}`;
  document.querySelector('#upgrade-multiplier').classList.toggle('locked', !state.press);

  const addCost = incomeCost();
  const income = document.querySelector('#buy-income');
  income.disabled = !state.press || state.incomeLevel >= upgradeLevelMax() || lt(state.balance, addCost);
  income.textContent = state.incomeLevel >= upgradeLevelMax() ? 'MAX LEVEL' : state.freeRunUpgrades ? `P$ ${fmt(addCost)} · kept` : `P$ ${fmt(addCost)}`;
  document.querySelector('#upgrade-income').classList.toggle('locked', !state.press);

  const powerCostNow = powerCost();
  const power = document.querySelector('#buy-power');
  power.disabled = state.multiplierLevel < 1 || state.powerLevel >= powerMax() || lt(state.balance, powerCostNow);
  power.textContent = state.powerLevel >= powerMax() ? 'MAX LEVEL' : `P$ ${fmt(powerCostNow)}`;
  document.querySelector('#upgrade-power').classList.toggle('locked', state.multiplierLevel < 1);

  const clickCostNow = clickCost();
  const click = document.querySelector('#buy-click');
  click.disabled = state.incomeLevel < 1 || state.clickLevel >= upgradeLevelMax() || lt(state.balance, clickCostNow);
  click.textContent = state.clickLevel >= upgradeLevelMax() ? 'MAX LEVEL' : `P$ ${fmt(clickCostNow)}`;
  document.querySelector('#upgrade-click').classList.toggle('locked', state.incomeLevel < 1);

  const tokenMultiplier = document.querySelector('#buy-token-multiplier');
  tokenMultiplier.disabled = state.tokenMultiplierLevel >= 10 || lt(state.tokens, tokenAmplifierCost());
  tokenMultiplier.textContent = state.tokenMultiplierLevel >= 10 ? 'MAX LEVEL' : `${fmt(tokenAmplifierCost())} tokens`;
  const discount = document.querySelector('#buy-discount');
  discount.disabled = state.tokenMultiplierLevel < 1 || state.discountLevel >= upgradeLevelMax() || lt(state.tokens, discountTokenCost());
  discount.textContent = state.discountLevel >= upgradeLevelMax() ? 'MAX LEVEL' : `${fmt(discountTokenCost())} tokens`;
  document.querySelector('#upgrade-discount').classList.toggle('locked', state.tokenMultiplierLevel < 1);
  const tokenBoost = document.querySelector('#buy-token-boost');
  tokenBoost.disabled = state.tokenMultiplierLevel < 1 || state.tokenBoostLevel >= 10 || lt(state.tokens, tokenBoostCost());
  tokenBoost.textContent = state.tokenBoostLevel >= 10 ? 'MAX LEVEL' : `${fmt(tokenBoostCost())} tokens`;
  document.querySelector('#upgrade-token-boost').classList.toggle('locked', state.tokenMultiplierLevel < 1);
  const expansionReady = state.expansionUnlocked;
  for (const id of ['log', 'exponent', 'cap']) {
    const cost = id === 'log' ? logCost() : id === 'exponent' ? exponentCost() : capCost();
    const level = id === 'log' ? state.logLevel : id === 'exponent' ? state.exponentLevel : state.capLevel;
    const maxLevel = id === 'log' ? 3 : id === 'exponent' ? exponentMax() : upgradeLevelMax();
    const button = document.querySelector(`#buy-${id}`);
    button.disabled = !expansionReady || level >= maxLevel || lt(state.balance, cost);
    button.textContent = level >= maxLevel ? 'MAX LEVEL' : id === 'cap' && state.freeRunUpgrades ? `P$ ${fmt(cost)} · kept` : `P$ ${fmt(cost)}`;
    document.querySelector(`#upgrade-${id}`).classList.toggle('locked', !expansionReady);
  }
  const exponentCap = document.querySelector('#buy-exponent-cap');
  const exponentCapReady = state.expansionUnlocked && state.creditExponentLevel >= 1;
  exponentCap.disabled = !exponentCapReady || state.exponentCapLevel >= 5 || lt(state.balance, exponentCapCost());
  exponentCap.textContent = state.exponentCapLevel >= 5 ? 'MAX LEVEL' : `P$ ${fmt(exponentCapCost())}`;
  document.querySelector('#upgrade-exponent-cap').classList.toggle('locked', !exponentCapReady);
  const unlock = document.querySelector('#buy-unlock');
  unlock.disabled = state.tokenBoostLevel < 1 || lt(state.tokens, expansionCost()) || state.expansionUnlocked;
  unlock.textContent = state.expansionUnlocked ? 'Unlocked' : `${fmt(expansionCost())} tokens`;
  document.querySelector('#upgrade-unlock').classList.toggle('locked', state.tokenBoostLevel < 1 || state.expansionUnlocked);
  const creditPower = document.querySelector('#buy-credit-power');
  creditPower.disabled = !state.expansionUnlocked || state.tokenCreditLevel >= 50 || lt(state.tokens, creditPowerCost());
  creditPower.textContent = state.tokenCreditLevel >= 50 ? 'MAX LEVEL' : `${fmt(creditPowerCost())} tokens`;
  document.querySelector('#upgrade-credit-power').classList.toggle('locked', !state.expansionUnlocked);
  const tokenDiscount = document.querySelector('#buy-token-discount');
  tokenDiscount.disabled = state.tokenCreditLevel < 1 || state.tokenDiscountLevel >= 25 || lt(state.tokens, tokenDiscountCost());
  tokenDiscount.textContent = state.tokenDiscountLevel >= 25 ? 'MAX LEVEL' : `${fmt(tokenDiscountCost())} tokens`;
  document.querySelector('#upgrade-token-discount').classList.toggle('locked', state.tokenCreditLevel < 1);
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
  document.body.classList.toggle('dark-matter-mode', activeTab === 'darkmatter');
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
  showUpgrade('exponent-cap', exponentCapReady || state.exponentCapLevel > 0);
  showUpgrade('alpha-unlock', state.printer || state.alphaUnlocked);
  showUpgrade('alpha-gain', state.alphaUnlocked);
  showUpgrade('alpha-boost', state.alphaUnlocked && state.alphaGainPurchases > 0);
  showUpgrade('alpha-neutral', state.alphaUnlocked && state.alphaBoostLevel > 0);
  showUpgrade('alpha-cap', state.alphaUnlocked && state.alphaBoostLevel > 0);
  showUpgrade('alpha-joke', state.alphaUnlocked);
  showUpgrade('point-discount', asc12Ready || state.ascPointDiscountLevel > 0);
  showUpgrade('cyan-13', state.automationsUnlocked || state.cyan13Bought);
  showUpgrade('cyan-14', state.pyramidUnlocked || state.cyan14Level > 0);
  showUpgrade('cyan-15', true);
  showUpgrade('alpha-generator', state.alphaUnlocked);
  showUpgrade('darkmatter-unlock', state.alphaUnlocked && !state.darkMatterUnlocked);
  showUpgrade('discount', state.tokenMultiplierLevel > 0 || state.discountLevel > 0);
  showUpgrade('token-boost', state.tokenMultiplierLevel > 0 || state.tokenBoostLevel > 0);
  showUpgrade('unlock', state.tokenBoostLevel > 0 || state.expansionUnlocked);
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
  const creditExponent = document.querySelector('#buy-credit-exponent');
  creditExponent.disabled = !state.creditEngine || state.creditExponentLevel >= 3 || lt(state.credits, creditExponentCost());
  creditExponent.textContent = state.creditExponentLevel >= 3 ? 'MAX LEVEL' : `${fmt(creditExponentCost())} C$`;
  document.querySelector('#credit-exponent-level').textContent = state.creditExponentLevel;
  document.querySelector('#upgrade-credit-exponent').classList.toggle('locked', !state.creditEngine);
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
  const dataEarned = state.balance.div(dataCost).floor();
  dataPrestige.disabled = lt(state.balance, dataCost);
  document.querySelector('#data-prestige-label').textContent = gte(state.balance, dataCost) ? `Data reset · +${fmt(applyCurrencyGain(dataEarned))} 𝔻 · resets P$ only` : `P$ ${fmt(dataCost)} for 1 𝔻 · resets P$ only`;
  for (let i = 1; i <= 3; i += 1) {
    const level = state[`sparkUpgrade${i}Level`];
    const max = [0, 1000, 100, 50][i];
    const button = document.querySelector(`#buy-spark-${i}`);
    const cost = sparkUpgradeCost(i);
    button.disabled = level >= max || lt(state.spark, cost);
    button.textContent = level >= max ? 'MAX LEVEL' : `${fmt(cost)} ⊹`;
    document.querySelector(`#spark-${i}-level`).textContent = level;
  }
  const sparkCost = sparkPrestigeCost();
  const sparkEarned = sparkReward(state.balance);
  const sparkPrestige = document.querySelector('#spark-prestige-button');
  sparkPrestige.disabled = lt(state.balance, sparkCost);
  document.querySelector('#spark-prestige-label').textContent = gte(state.balance, sparkCost) ? `Spark reset · +${fmt(sparkEarned)} ⊹ · resets P$ only` : `P$ ${fmt(sparkCost)} for Spark ⊹ · resets P$ only`;
  const ascendanceCost = D('1e250');
  const ascendanceEarned = state.credits.div(ascendanceCost).floor();
  const ascendancePrestige = document.querySelector('#ascendance-prestige-button');
  ascendancePrestige.disabled = lt(state.credits, ascendanceCost);
  document.querySelector('#ascendance-prestige-label').textContent = gte(state.credits, ascendanceCost) ? `Ascend · +${fmt(ascendanceGain(ascendanceEarned))} ᛥ` : 'C$ 1e250 for 1 ᛥ';
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
document.querySelector('#buy-asc-3').addEventListener('click', () => {
  if (!state.ascCurrencyBoost || !state.cubeUnlocked || state.ascCubePowerLevel >= 5 || lt(state.ascendance, 10)) return;
  state.ascendance = minus(state.ascendance, 10);
  state.ascCubePowerLevel += 1;
  toast('Cube click power doubled');
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
document.querySelector('#buy-asc-8').addEventListener('click', () => {
  const cost = ascAllCurrencyCost();
  if (state.ascAllCurrencyLevel >= 50 || lt(state.ascendance, cost)) return;
  state.ascendance = minus(state.ascendance, cost); state.ascAllCurrencyLevel += 1;
  toast('All previous currency gains doubled'); render(); save();
});
document.querySelector('#buy-asc-9').addEventListener('click', () => {
  const cost = ascMainlinePowerCost();
  if (state.ascMainlinePowerLevel >= 50 || lt(state.ascendance, cost)) return;
  state.ascendance = minus(state.ascendance, cost); state.ascMainlinePowerLevel += 1;
  toast('Mainline currency gains raised to a higher power'); render(); save();
});
document.querySelector('#buy-point-discount').addEventListener('click', () => {
  if (!state.ascCreditExponent || state.ascPointDiscountLevel >= 20 || lt(state.balance, ascPointDiscountCost())) return;
  state.balance = minus(state.balance, ascPointDiscountCost());
  state.ascPointDiscountLevel += 1;
  toast('All P$ costs halved');
  render(); save();
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
    if (state[`pointUpgrade${upgradeNumber}Bought`] || lt(state.balance, cost)) return;
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
      else state[info.currency] = minus(state[info.currency], amount);
    }
    state.dataLore[index] = true;
    toast(`Data archive ${index + 1} uncovered`);
    render(); save();
  });
}
document.querySelector('#buy-alpha-unlock').addEventListener('click', () => { if (!state.printer || state.alphaUnlocked) return; state.alphaUnlocked = true; toast('Alpha upgrades unlocked'); render(); save(); });
document.querySelector('#buy-alpha-gain').addEventListener('click', () => { if (!state.alphaUnlocked) return; const gain = applyAlphaGain(1 + state.alphaBoostLevel).times(cubeMultiplier('alpha')); state.alphaGainPurchases += 1; state.alpha = plus(state.alpha, gain); toast(`+${fmt(gain)} α`); render(); save(); });
document.querySelector('#buy-alpha-generator').addEventListener('click', () => { if (!state.alphaUnlocked || state.alphaGeneratorBought || lt(state.alpha, 10)) return; state.alpha = minus(state.alpha, 10); state.alphaGeneratorBought = true; toast('Alpha generator started'); render(); save(); });
document.querySelector('#buy-alpha-boost').addEventListener('click', () => { const cost = alphaBoostPrice(); if (!state.alphaUnlocked || state.alphaBoostLevel >= 50 || lt(state.alpha, cost)) return; state.alpha = minus(state.alpha, cost); state.alphaBoostLevel += 1; toast('Alpha gain increased'); render(); save(); });
document.querySelector('#buy-alpha-neutral').addEventListener('click', () => { if (!state.alphaUnlocked || state.alphaBoostLevel < 1 || state.alphaNeutralBought) return; const gain = applyAlphaGain(5).times(cubeMultiplier('alpha')); state.alpha = plus(state.alpha, gain); state.alphaNeutralBought = true; toast(`+${fmt(gain)} α · Neutral multiplier bought`); render(); save(); });
document.querySelector('#buy-alpha-cap').addEventListener('click', () => { const cost = alphaCapPrice(); if (!state.alphaUnlocked || state.alphaBoostLevel < 1 || lt(state.alpha, cost)) return; state.alpha = minus(state.alpha, cost); state.alphaCapLevel += 1; toast('2α max level increased by 2'); render(); save(); });
document.querySelector('#buy-gain-zero').addEventListener('click', () => {
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
document.querySelector('#buy-multiplier').addEventListener('click', () => {
  if (state.multiplierLevel >= upgradeLevelMax()) return;
  purchase(multiplierCost(), () => { state.multiplierLevel += 1; }, 'Compounding level added', !state.freeRunUpgrades);
});
document.querySelector('#buy-income').addEventListener('click', () => {
  if (state.incomeLevel >= upgradeLevelMax()) return;
  purchase(incomeCost(), () => { state.incomeLevel += 1; }, 'Output level added', !state.freeRunUpgrades);
});
document.querySelector('#buy-power').addEventListener('click', () => {
  if (state.multiplierLevel < 1 || state.powerLevel >= powerMax()) return;
  purchase(powerCost(), () => { state.powerLevel += 1; }, 'Compounding II level added');
});
document.querySelector('#buy-click').addEventListener('click', () => {
  if (state.incomeLevel < 1 || state.clickLevel >= upgradeLevelMax()) return;
  purchase(clickCost(), () => { state.clickLevel += 1; }, 'Click power increased');
});
document.querySelector('#buy-log').addEventListener('click', () => {
  if (!state.expansionUnlocked || state.logLevel >= 3) return;
  purchase(logCost(), () => { state.logLevel += 1; }, 'Logarithmic output increased');
});
document.querySelector('#buy-exponent').addEventListener('click', () => {
  if (!state.expansionUnlocked || state.exponentLevel >= exponentMax()) return;
  purchase(exponentCost(), () => { state.exponentLevel += 1; }, 'Gain exponent increased');
});
document.querySelector('#buy-cap').addEventListener('click', () => {
  if (!state.expansionUnlocked || state.capLevel >= upgradeLevelMax()) return;
  purchase(capCost(), () => { state.capLevel += 1; }, 'Upgrade 5 capacity increased', !state.freeRunUpgrades);
});
document.querySelector('#buy-exponent-cap').addEventListener('click', () => {
  if (!state.expansionUnlocked || !state.creditExponentLevel || state.exponentCapLevel >= 5) return;
  purchase(exponentCapCost(), () => { state.exponentCapLevel += 1; }, 'Upgrade 8 max level increased');
});
document.querySelector('#buy-token-multiplier').addEventListener('click', () => {
  const cost = tokenAmplifierCost();
  if (state.tokenMultiplierLevel >= 10 || lt(state.tokens, cost)) return;
  state.tokens = minus(state.tokens, cost);
  state.tokenMultiplierLevel += 1;
  toast('Token amplifier level added');
  render();
});
document.querySelector('#buy-discount').addEventListener('click', () => {
  const cost = discountTokenCost();
  if (state.tokenMultiplierLevel < 1 || state.discountLevel >= upgradeLevelMax() || lt(state.tokens, cost)) return;
  state.tokens = minus(state.tokens, cost);
  state.discountLevel += 1;
  toast('Bulk pricing level added');
  render();
});
document.querySelector('#buy-token-boost').addEventListener('click', () => {
  const cost = tokenBoostCost();
  if (state.tokenMultiplierLevel < 1 || state.tokenBoostLevel >= 10 || lt(state.tokens, cost)) return;
  state.tokens = minus(state.tokens, cost);
  state.tokenBoostLevel += 1;
  toast('Token foundry level added');
  render();
});
document.querySelector('#buy-unlock').addEventListener('click', () => {
  const cost = expansionCost();
  if (state.tokenBoostLevel < 1 || lt(state.tokens, cost) || state.expansionUnlocked) return;
  state.tokens = minus(state.tokens, cost);
  state.expansionUnlocked = true;
  toast('New P$ upgrades unlocked');
  render();
});
document.querySelector('#buy-credit-power').addEventListener('click', () => {
  const cost = creditPowerCost();
  if (!state.expansionUnlocked || state.tokenCreditLevel >= 50 || lt(state.tokens, cost)) return;
  state.tokens = minus(state.tokens, cost);
  state.tokenCreditLevel += 1;
  toast('Factorial Power increased');
  render();
  save();
});
document.querySelector('#buy-token-discount').addEventListener('click', () => {
  const cost = tokenDiscountCost();
  if (state.tokenCreditLevel < 1 || state.tokenDiscountLevel >= 25 || lt(state.tokens, cost)) return;
  state.tokens = minus(state.tokens, cost);
  state.tokenDiscountLevel += 1;
  toast('Factorial cost reduced');
  render();
  save();
});
document.querySelector('#sections-toggle').addEventListener('click', () => { const tabs = document.querySelector('#upgrade-tabs'); tabs.hidden = !tabs.hidden; document.querySelector('#sections-toggle').setAttribute('aria-expanded', String(!tabs.hidden)); });
function chooseTab(tab) { activeTab = tab; document.querySelector('#upgrade-tabs').hidden = true; document.querySelector('#sections-toggle').setAttribute('aria-expanded', 'false'); render(); }
document.querySelector('#run-tab').addEventListener('click', () => chooseTab('run'));
document.querySelector('#token-tab').addEventListener('click', () => { if (state.totalPrestiges) chooseTab('token'); });
document.querySelector('#credit-tab').addEventListener('click', () => { if (state.totalCreditPrestiges || gt(state.credits, 0)) chooseTab('credit'); });
document.querySelector('#data-tab').addEventListener('click', () => { if (state.totalDataPrestiges || gt(state.data, 0) || state.dataLore.some(Boolean)) chooseTab('data'); });
document.querySelector('#spark-tab').addEventListener('click', () => { if (state.sparkPrestiges || gt(state.spark, 0)) chooseTab('spark'); });
for (let i = 1; i <= 3; i += 1) document.querySelector(`#buy-spark-${i}`).addEventListener('click', () => {
  const levelKey = `sparkUpgrade${i}Level`;
  const max = [0, 1000, 100, 50][i];
  const cost = sparkUpgradeCost(i);
  if (state[levelKey] >= max || lt(state.spark, cost)) return;
  state.spark = minus(state.spark, cost); state[levelKey] += 1;
  toast(`Spark upgrade ${i} accelerated P$ production`); render(); save();
});
document.querySelector('#cube-tab').addEventListener('click', () => { if (state.cubeUnlocked) chooseTab('cube'); });
document.querySelector('#pyramid-tab').addEventListener('click', () => { if (state.pyramidUnlocked) chooseTab('pyramid'); });
document.querySelector('#alpha-tab').addEventListener('click', () => { if (state.alphaUnlocked) chooseTab('alpha'); });
document.querySelector('#darkmatter-tab').addEventListener('click', () => { if (state.darkMatterUnlocked) chooseTab('darkmatter'); });
document.querySelector('#buy-darkmatter-unlock').addEventListener('click', () => { if (!state.alphaUnlocked || state.darkMatterUnlocked || lt(state.alpha, 1000)) return; state.alpha = minus(state.alpha, 1000); state.darkMatterUnlocked = true; activeTab = 'darkmatter'; toast('Dark Matter unlocked'); render(); save(); });
document.querySelector('#buy-darkmatter-1').addEventListener('click', () => { if (!state.darkMatterUnlocked || state.darkMatter1Bought) return; state.darkMatter1Bought = true; toast('Dark Matter generation started'); render(); save(); });
document.querySelector('#buy-darkmatter-2').addEventListener('click', () => { if (!state.darkMatter1Bought || state.darkMatter2Level >= 1000 || lt(state.darkMatter, 2)) return; state.darkMatter = D(0); state.darkMatter2Level += 1; toast('Dark Matter gain doubled'); render(); save(); });
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
document.querySelector('#prestige-button').addEventListener('click', () => {
  if (lt(state.balance, nextGoal())) return;
  const reward = tokenReward();
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
  toast(`Fresh start. +${fmt(reward)} tokens earned!`);
  save();
  render();
});
document.querySelector('#credit-prestige-button').addEventListener('click', () => {
  if (lt(state.tokens, '1e33')) return;
  const completing = state.activeChallenge;
  const reward = completing ? D(0) : creditPrestigeReward();
  state.credits = plus(state.credits, reward);
  state.totalCreditPrestiges += 1;
  resetCreditRun();
  if (completing) {
    if (!state.challengeEndsAt || Date.now() <= state.challengeEndsAt) {
      if (!state.completedChallenges.includes(completing)) state.completedChallenges.push(completing);
      toast(`${challengeNames[completing]} complete · No credits earned`);
    } else toast(`${challengeNames[completing]} failed · Time expired`);
    state.activeChallenge = ''; state.challengeEndsAt = 0; activeTab = 'pyramid';
  } else {
    activeTab = 'credit';
    toast(`Credit prestige. +${fmt(reward)} C$ earned!`);
  }
  save(); render();
});
document.querySelector('#spark-prestige-button').addEventListener('click', () => {
  const cost = sparkPrestigeCost();
  if (lt(state.balance, cost)) return;
  const reward = sparkReward(state.balance);
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
  const reward = applyCurrencyGain(state.balance.div(cost).floor());
  state.data = plus(state.data, reward);
  state.totalDataPrestiges += 1;
  state.balance = D(0);
  state.runEarned = D(0);
  activeTab = 'data';
  toast(`Data reset · +${fmt(reward)} 𝔻`);
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
document.querySelector('#buy-credit-exponent').addEventListener('click', () => {
  const cost = creditExponentCost();
  if (!state.creditEngine || state.creditExponentLevel >= 3 || lt(state.credits, cost)) return;
  state.credits = minus(state.credits, cost);
  state.creditExponentLevel += 1;
  toast('Token exponent increased');
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

let lastTick = Date.now();
function runAutomations() {
  const buyPointsUpgrade = (index, unlocked, alreadyBought, cost, action, free = false) => {
    if (!state.automationActive[index] || !unlocked || alreadyBought || lt(state.balance, cost)) return;
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
  if (state.automationActive[10] && gte(state.tokens, tokenAmplifierCost()) && state.tokenMultiplierLevel < 10) {
    state.tokens = minus(state.tokens, tokenAmplifierCost()); state.tokenMultiplierLevel += 1;
  }
  if (state.automationActive[11] && state.tokenBoostLevel > 0 && gte(state.tokens, expansionCost()) && !state.expansionUnlocked) {
    state.tokens = minus(state.tokens, expansionCost()); state.expansionUnlocked = true;
  }
}
setInterval(() => {
  const now = Date.now();
  const elapsed = Math.max(0, (now - lastTick) / 1000);
  lastTick = now;
  runAutomations();
  if (state.cubeUnlocked && state.ascCubeAutoclicker) addCubeClicks(cubeClickGain().times(elapsed));
  const earned = rate().times(elapsed);
  if (state.activeChallenge && state.challengeEndsAt && now >= state.challengeEndsAt) { const name = challengeNames[state.activeChallenge]; state.activeChallenge = ''; state.challengeEndsAt = 0; toast(`${name} failed · Time expired`); }
  const passiveTokensEarned = tokenIncomeRate().times(elapsed);
  if (state.alphaGeneratorBought) state.alpha = plus(state.alpha, applyAlphaGain(cubeMultiplier('alpha').times(elapsed / 10)));
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
