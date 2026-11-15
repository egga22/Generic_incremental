// Run with npm test (Node 20.19+).
const {JSDOM} = require('jsdom');
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const dom = new JSDOM(fs.readFileSync('index.html','utf8'), {url:'https://example.test', runScripts:'outside-only'});
const context = dom.getInternalVMContext();
const timers = [];
context.setInterval = fn => { timers.push(fn); return timers.length; };
context.setTimeout = () => 1;
context.clearTimeout = () => {};
vm.runInContext('(function(){' + fs.readFileSync('break_eternity.js','utf8').replace(/export \{[\s\S]*?\};/, 'globalThis.Decimal = y;') + '})();', context);
let source = fs.readFileSync('game.js','utf8').replace("import Decimal from './break_eternity.js';",'');
source += `
globalThis.testAPI = {get state(){return state}, D, rate, kirbyBonus, feedKirby, tokenReward, creditMultiplier, challengeExponent, challengeDuration, challengeGainMultiplier, resetAscendanceRun, resetCreditRun, runAutomations, runPresetResets, presetAllowsPurchase, isValidSave, serializeState, render, checkAchievements, recordFortuneRitual, spinFortune, bankFortune, fortuneUsed, fortuneCapacity, fortuneSegments, clearFortuneChain, updateFortuneProgress};`;
vm.runInContext(source, context);
const a = context.testAPI, s = a.state, doc = dom.window.document;
assert(a.isValidSave(JSON.parse(a.serializeState())), 'fresh save round trip');
assert(a.isValidSave({balance:0,runEarned:0}), 'old save accepted');
s.printer = true; const base = a.rate(); s.researchBranch='production'; s.researchLevel=2;
assert(a.rate().eq(base.times(4)), 'production research');
s.balance=a.D(500); s.researchBranch='none'; const reward=a.tokenReward(); s.researchBranch='resets';
assert(a.tokenReward().eq(reward.times(4)), 'reset research');
s.activeChallenge='deduction2+time3'; assert.equal(a.challengeExponent(),.8); assert.equal(a.challengeDuration(s.activeChallenge),5);
s.completedCombos.push('deduction2+time3'); assert.equal(a.challengeGainMultiplier(),1.1);
s.pyramidUnlocked=true; s.completedChallenges=['deduction1','time1']; s.activeChallenge=''; a.render();
doc.getElementById('start-combo').click(); assert.equal(s.activeChallenge,'deduction1+time1');
s.tokens=a.D('1e33'); a.render(); doc.getElementById('credit-prestige-button').click();
assert(s.completedCombos.includes('deduction1+time1')); assert.equal(s.activeChallenge,''); assert(s.credits.eq(0));
s.cubeUnlocked=true; s.cubeTarget='credits'; a.render();
doc.querySelector('[data-save-loadout="0"]').click(); s.cubeTarget='points'; a.render(); doc.querySelector('[data-load-loadout="0"]').click(); assert.equal(s.cubeTarget,'credits');
s.sparkPrestiges=1; s.sparkCharge=100; a.render(); doc.querySelector('[data-burst="100"]').click();
const burstRate = a.rate(); s.sparkBurstUntil=0; assert(burstRate.eq(a.rate().times(5)), 'burst ends cleanly');
assert.equal(s.sparkCharge,0); assert.equal(s.sparkBurstPower,5); assert(s.achievements.includes('burst'));
assert(a.isValidSave(JSON.parse(a.serializeState())), 'feature save round trip');
s.automationPresets[0]='save'; s.automationReserve[0]=20;
assert(!a.presetAllowsPurchase(0,90,a.D(100))); assert(a.presetAllowsPurchase(0,80,a.D(100)));
s.totalAscendances=10; a.resetAscendanceRun(); assert(s.printer && s.press && s.expansionUnlocked && s.cubeUnlocked && s.automationBought.every(Boolean)); assert.equal(s.researchLevel,0);
s.researchLevel=5; a.checkAchievements(); assert(s.achievements.includes('research'));
assert(!a.isValidSave({balance:0,runEarned:0,sparkCharge:101}));
assert(!a.isValidSave({balance:0,runEarned:0,cubeLoadouts:['bogus','','']}));
s.automationsUnlocked=true; s.automationPresets[0]='fast'; s.automationLastReset[0]=0; s.balance=a.D(10000); s.activeChallenge='deduction1';
const resets=s.tokenResetCount; a.runPresetResets(Date.now()); assert.equal(s.tokenResetCount,resets,'no auto resets in trials'); s.activeChallenge='';
a.runPresetResets(Date.now()); assert.equal(s.tokenResetCount,resets+1,'fast preset resets eligible runs');
// Direct conversion must match both existing prestige buttons, including bonuses.
for (const boosted of [false, true]) {
  s.tokens=a.D('1e285'); s.credits=a.D('1e250'); s.ascendance=a.D(0);
  s.activeChallenge=''; s.gainZeroActive=false; s.tokenCreditLevel=boosted ? 5 : 0;
  s.ascCreditExponent=boosted; s.ascCubeAscendance=true;
  s.cubeUnlocked=true; s.cubeTarget='ascendance'; s.cubeLevel=3;
  const before={...s};
  a.render();
  assert(!doc.getElementById('token-ascendance-button').disabled);
  doc.getElementById('token-ascendance-button').click();
  const direct=s.ascendance;
  assert(s.tokens.eq(0) && s.credits.eq(0), 'direct conversion resets both currencies');
  assert.equal(s.totalAscendances,before.totalAscendances+1);
  Object.assign(s,before); a.render();
  doc.getElementById('credit-prestige-button').click();
  doc.getElementById('ascendance-prestige-button').click();
  assert(s.ascendance.eq(direct), 'direct reward matches sequential conversion');
}
s.tokens=a.D('1e33'); s.credits=a.D(0); a.render();
assert(doc.getElementById('token-ascendance-button').disabled, 'insufficient tokens');
s.tokens=a.D('1e300'); s.activeChallenge='deduction1'; a.render();
assert(doc.getElementById('token-ascendance-button').disabled, 'no shortcut during trials');
s.activeChallenge=''; s.gainZeroActive=true; a.render();
assert(doc.getElementById('token-ascendance-button').disabled, 'zero gain prevents shortcut');
s.gainZeroActive=false;
a.render(); timers.forEach(fn => fn());
console.log('Progression checks passed: startup, saves, research, combined trials, loadouts, burst, reserves, milestones, achievements, tick.');

// Scary Mode: purchase, overlay, settings, and persistence.
s.scaryModeLevel=0; s.scaryModeActive=true; s.ascendance=a.D('1e665'); a.render();
assert(doc.getElementById('scary-overlay').hidden);
doc.getElementById('buy-asc-10').click(); assert.equal(s.scaryModeLevel,0);
s.ascendance=a.D('1e666'); a.render(); doc.getElementById('buy-asc-10').click();
assert.equal(s.scaryModeLevel,1); assert(s.ascendance.eq(0));
assert(!doc.getElementById('scary-overlay').hidden);
assert(!doc.getElementById('scary-mode-setting').hidden);
s.ascendance=a.D('1e667'); doc.getElementById('buy-asc-10').click();
assert(s.ascendance.eq('1e667'), 'Scary Mode cannot be purchased twice');
doc.getElementById('scary-mode').click(); assert(doc.getElementById('scary-overlay').hidden);
assert.equal(s.scaryModeActive,false);
a.resetAscendanceRun(); a.render(); assert.equal(s.scaryModeLevel,1);
assert(doc.getElementById('scary-overlay').hidden, 'disabled preference survives reset');
const scarySave=JSON.parse(a.serializeState());
assert(a.isValidSave(scarySave)); assert.equal(scarySave.scaryModeLevel,1); assert.equal(scarySave.scaryModeActive,false);
doc.getElementById('scary-mode').click(); assert(!doc.getElementById('scary-overlay').hidden);
console.log('Scary Mode passed: price, single purchase, overlay, toggle, resets, and saved state.');

// Fortune unlock requires deliberate prestige routing, and remains retryable.
s.fortuneUnlocked=false; s.fortuneClue=0; s.cubeUnlocked=true; s.activeChallenge='';
s.balance=a.D('1e900'); s.totalCreditPrestiges=20; a.render();
assert(!s.fortuneUnlocked, 'ordinary progression does not reveal engine');
s.cubeTarget='points'; a.recordFortuneRitual('token'); assert.equal(s.fortuneClue,1);
s.cubeTarget='credits'; a.recordFortuneRitual('token'); assert.equal(s.fortuneClue,0,'mistake restarts route');
for (const [layer,target] of [['token','points'],['token','tokens'],['credit','credits'],['token','points']]) {
  s.cubeTarget=target; a.recordFortuneRitual(layer);
}
assert(s.fortuneUnlocked); assert.equal(s.fortuneCharges,6);
a.render(); assert(!doc.getElementById('fortune-panel').hidden);
s.gainZeroActive=false; s.printer=true;
// Seed exact segment outcomes; no flaky probabilistic assertions.
function land(id, reroll=false) {
  const parts=a.fortuneSegments(), index=parts.findIndex(p=>p.id===id);
  assert(index>=0); const before=parts.slice(0,index).reduce((n,p)=>n+p.weight,0);
  context.Math.random=()=> (before+0.5)/(a.fortuneCapacity()+4);
  a.spinFortune(reroll);
}
s.fortuneCharges=50; a.clearFortuneChain();
land('multiplier'); land('points'); assert.equal(s.fortuneSeconds,30,'prime doubles payout');
land('points'); assert.equal(s.fortuneSeconds,60,'repeat output streak');
a.render(); assert(doc.querySelector('[data-fortune-wedge]').disabled,'pot locks editor');
const balance=s.balance, expected=s.fortuneBase.min(a.rate()).times(s.fortuneSeconds);
a.bankFortune(); assert(s.balance.eq(balance.plus(expected))); assert(s.fortuneTokens>0);
const banked=s.fortuneTokens;
land('tokens'); land('bust'); assert.equal(s.fortunePending,0); assert.equal(s.fortuneTokens,banked);
land('refund'); land('refund'); land('refund'); assert.equal(s.fortuneRefunds,2,'refund cap');
a.clearFortuneChain(); s.fortuneFrame=2; land('tokens'); const pot=s.fortunePending;
land('bust',true); assert.equal(s.fortunePending,pot,'protected reroll preserves pot');
const charges=s.fortuneCharges; a.spinFortune(true); assert.equal(s.fortuneCharges,charges,'one reroll per chain');
s.activeChallenge='deduction1'; a.spinFortune(); a.bankFortune(); assert.equal(s.fortunePending,pot,'trials block wheel payouts');
s.activeChallenge=''; s.gainZeroActive=true; a.bankFortune(); assert.equal(s.fortunePending,pot,'null gain blocks wheel payouts');
s.gainZeroActive=false;
a.resetAscendanceRun(); assert(s.fortuneUnlocked); assert.equal(s.fortuneFrame,2); assert.equal(s.fortuneTokens,banked); assert.equal(s.fortunePending,0);
s.fortuneTokens=200; a.render();
doc.getElementById('fortune-upgrade-frame').click(); assert.equal(s.fortuneFrame,3);
assert.equal(s.fortuneTokens,160); doc.getElementById('fortune-add').click(); assert.equal(s.fortuneWedges.length,5);
const select=doc.querySelector('[data-fortune-wedge="0"]'); select.value='cache'; select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
assert.equal(s.fortuneWedges[0],'cache'); assert(a.fortuneUsed()<=a.fortuneCapacity());
assert(a.isValidSave(JSON.parse(a.serializeState())),'Fortune save round trip');
for (const invalid of [{fortuneFrame:5},{fortuneQuality:-1},{fortuneClue:5},{fortuneWedges:['fake']},{fortuneSeconds:121},{fortuneCharges:101}]) assert(!a.isValidSave({balance:0,runEarned:0,...invalid}));
const watermark=s.fortuneMilestone; s.balance=a.D(10).pow((watermark+2)*10); const start=s.fortuneCharges;
a.updateFortuneProgress(); assert.equal(s.fortuneCharges,Math.min(100,start+2));
s.balance=a.D(0); a.updateFortuneProgress(); s.balance=a.D(10).pow((watermark+2)*10); a.updateFortuneProgress();
assert.equal(s.fortuneCharges,Math.min(100,start+2),'resets cannot replay high water rewards');
console.log('Fortune checks passed: puzzle, recovery, weighted outcomes, combos, banking, bust, refund/reroll caps, restrictions, workshop, persistence, saves, milestones.');

a.clearFortuneChain(); land('blank');
assert(a.isValidSave(JSON.parse(a.serializeState())),'Idle outcome saves correctly');
s.fortuneBoostUntil=Date.now()+30000; land('bust'); assert(s.fortuneBoostUntil>Date.now(),'bust preserves banked Overdrive');
// Reload a real serialized save into a fresh document/runtime.
const reload = new JSDOM(fs.readFileSync('index.html','utf8'), {url:'https://example.test',runScripts:'outside-only'});
const rc=reload.getInternalVMContext(); rc.setInterval=()=>1; rc.setTimeout=()=>1; rc.clearTimeout=()=>{};
rc.localStorage.setItem('pocket-foundry-save-v2',a.serializeState());
vm.runInContext('(function(){'+fs.readFileSync('break_eternity.js','utf8').replace(/export \{[\s\S]*?\};/,'globalThis.Decimal = y;')+'})();',rc);
vm.runInContext(source,rc);
assert(rc.testAPI.state.fortuneUnlocked); assert.equal(rc.testAPI.state.fortuneFrame,3);
assert.equal(rc.testAPI.state.fortuneWedges[0],'cache'); assert(rc.testAPI.isValidSave(JSON.parse(rc.testAPI.serializeState())));
console.log('Fortune reload and banked boost checks passed.');
// Exercise the discovery through the actual prestige buttons, not just the matcher.
const r=rc.testAPI, rs=r.state, rd=reload.window.document;
rs.fortuneUnlocked=false; rs.fortuneClue=0; rs.cubeUnlocked=true; rs.activeChallenge=''; rs.gainZeroActive=false;
for (const [layer,target] of [['token','points'],['token','tokens'],['credit','credits'],['token','points']]) {
  rs.cubeTarget=target; rs.balance=r.D('1e100'); rs.tokens=r.D('1e40'); r.render();
  rd.getElementById(layer==='credit'?'credit-prestige-button':'prestige-button').click();
}
assert(rs.fortuneUnlocked,'actual prestige route reveals wheel');
console.log('Fortune discovery verified through prestige controls.');

// Companion controls, economic effects, restrictions, and persisted settings.
vm.runInContext('state = {...initialState}; for (const key of CURRENCY_KEYS) state[key] = D(initialState[key]);', context);
const ks = a.state; ks.fortuneWedges=['points','tokens','multiplier','refund'];
a.render(); assert(doc.getElementById('kirby-panel').hidden, 'companion starts locked');
ks.tokenResetCount=1; ks.balance=a.D(1000); ks.tokens=a.D(10); ks.printer=true; a.render();
assert(!doc.getElementById('kirby-panel').hidden);
const plainRate=a.rate();
doc.querySelector('[data-kirby-feed="balance"]').click();
assert(ks.balance.eq(990)); assert.equal(ks.kirbyFullness,25); assert(ks.kirbyBeam);
assert(a.rate().gt(plainRate));
a.feedKirby('balance'); assert.equal(ks.kirbyFullness,25,'feeding cooldown enforced');
ks.kirbyFeedAt=0; a.render(); doc.querySelector('[data-kirby-feed="tokens"]').click();
assert(ks.tokens.eq(9)); assert(ks.kirbyMirror);
ks.kirbyFullness=100; a.render(); doc.getElementById('kirby-hypernova').click();
assert.equal(ks.kirbyFullness,0); assert(a.kirbyBonus('beam')>1.4);
ks.kirbyBurstUntil=0; assert.equal(a.kirbyBonus('beam'),1,'nap has no bonus');
ks.kirbyNapUntil=0; ks.kirbyAbility='mirror';
const mirrorReward=a.tokenReward(); ks.activeChallenge='time1'; assert.equal(a.kirbyBonus('mirror'),1);
ks.activeChallenge='';
const toggle=doc.getElementById('copyright-mode'); toggle.checked=true;
toggle.dispatchEvent(new dom.window.Event('change'));
assert(ks.copyrightMode); assert(doc.getElementById('kirby-panel').hidden);
assert.equal(a.kirbyBonus('mirror'),1); assert(a.tokenReward().lt(mirrorReward));
const beforeDisabled=ks.balance.toString(); ks.kirbyFeedAt=0; a.feedKirby('balance');
assert.equal(ks.balance.toString(),beforeDisabled,'copyright mode blocks hidden interactions');
assert(JSON.parse(a.serializeState()).copyrightMode,'copyright setting is saved');
assert(a.isValidSave(JSON.parse(a.serializeState())));
for (const bad of [{kirbyFullness:101},{kirbyAbility:'invalid'},{kirbyStoneSeconds:301}]) {
  assert(!a.isValidSave({balance:0,runEarned:0,...bad}));
}
ks.kirbyFullness=75; a.resetAscendanceRun();
assert.equal(ks.kirbyFullness,0); assert(ks.kirbyBeam && ks.kirbyMirror && ks.kirbyUnlocked && ks.copyrightMode);
toggle.checked=false; toggle.dispatchEvent(new dom.window.Event('change'));
assert(!doc.getElementById('kirby-panel').hidden,'disabling copyright mode restores companion');
console.log('Kirby checks passed: unlock, feeding, cooldowns, bonuses, burst, nap, trials, copyright mode, saves, Ascendance.');

ks.kirbyNapUntil=0; ks.kirbySwitchAt=0; ks.activeChallenge=''; ks.sparkPrestiges=1; a.render();
doc.querySelector('[data-kirby-ability="spark"]').click();
assert.equal(ks.kirbyAbility,'spark'); assert(a.kirbyBonus('spark')>1);
doc.querySelector('[data-kirby-ability="mirror"]').click();
assert.equal(ks.kirbyAbility,'spark','switch cooldown enforced');
ks.kirbyAbility='stone'; ks.cubeUnlocked=true; ks.cubeTarget='points'; ks.kirbyStoneTarget='points'; ks.kirbyStoneSeconds=300;
assert(a.kirbyBonus('stone')>1); ks.cubeTarget='tokens'; assert.equal(a.kirbyBonus('stone'),1,'changing target removes Stone charge immediately');
ks.kirbyAbility='beam'; ks.kirbyBurstUntil=Date.now()-1; ks.kirbyNapUntil=Date.now()-1;
assert(a.kirbyBonus('beam')>1 && a.kirbyBonus('beam')<1.4,'expired burst and nap restore ordinary bonus');
assert(a.isValidSave(JSON.parse(a.serializeState())));

// Every Hyper Timer style is selectable, persisted, and bounded by the same goal.
const animation = doc.getElementById('prestige-animation');
const progress = doc.getElementById('prestige-progress');
assert.equal(animation.options.length, 8);
for (const style of ['none', 'bar', 'ring', 'pie', 'multibar', 'letters', 'color', 'pro']) {
  animation.value = style;
  animation.dispatchEvent(new dom.window.Event('change'));
  assert.equal(a.state.prestigeAnimation, style);
  assert.equal(JSON.parse(a.serializeState()).prestigeAnimation, style);
  assert(a.isValidSave(JSON.parse(a.serializeState())), `${style} save is importable`);
  const shown = [...progress.querySelectorAll('[data-visual]')].filter(el => !el.hidden).map(el => el.dataset.visual);
  assert.deepEqual(shown, style === 'none' ? [] : style === 'pro' ? ['multibar','letters','color'] : [style]);
  for (const fraction of [0, .5, 1, 2, -1]) {
    vm.runInContext(`renderPrestigeProgress(${fraction})`, context);
    const expected = Math.max(0, Math.min(1, fraction));
    assert.equal(Number(progress.getAttribute('aria-valuenow')), expected * 100);
    assert.equal(doc.getElementById('progress-fill').style.width, `${expected * 100}%`);
    if (expected === 0 || expected === 1) {
      assert.equal(progress.querySelector('.progress-letters b').textContent, expected ? 'ZZZ' : 'AAA');
      for (const bar of progress.querySelectorAll('.progress-multibar i')) assert.equal(bar.style.getPropertyValue('--bar-fill'), expected ? '100%' : '0%');
    }
  }
}
assert(!a.isValidSave({balance:0, runEarned:0, prestigeAnimation:'unknown'}));
a.resetAscendanceRun();
assert.equal(a.state.prestigeAnimation, 'pro', 'appearance survives Ascendance');
vm.runInContext('state.balance = D(nextGoal()).div(2); render();', context);
assert.equal(Number(progress.getAttribute('aria-valuenow')), 50, 'uses current prestige goal');
vm.runInContext('state.balance = D(0); render();', context);
assert.equal(Number(progress.getAttribute('aria-valuenow')), 0, 'resets track run balance');
console.log('Prestige styles passed: all eight choices, save validation, visibility, endpoints, goal tracking, reset persistence.');

// Late P$ upgrades require Expansion plans, then the preceding upgrade.
const chainState=a.state;
chainState.balance=a.D('1e300'); chainState.expansionUnlocked=false;
for (let i=16;i<=20;i++) chainState[`pointUpgrade${i}Bought`]=false;
for (let i=16;i<=20;i++) {
  a.render();
  const button=doc.getElementById(`buy-point-${i}`);
  assert(button.disabled, `upgrade ${i} locked without prerequisite`);
  assert(doc.getElementById(`upgrade-point-${i}`).classList.contains('locked'));
  button.disabled=false; button.click();
  assert(!chainState[`pointUpgrade${i}Bought`], 'purchase handler rejects missing prerequisite');
}
chainState.expansionUnlocked=true;
for (let i=16;i<=20;i++) {
  a.render();
  const button=doc.getElementById(`buy-point-${i}`);
  assert(!button.disabled, `upgrade ${i} unlocks in sequence`);
  assert(!doc.getElementById(`upgrade-point-${i}`).classList.contains('locked'));
  button.click();
  assert(chainState[`pointUpgrade${i}Bought`]);
}
console.log('Upgrades 16–20 prerequisite chain passed.');
const cs = a.state;
// Casino: deterministic outcomes, stake guards, persisted rules and hands.
vm.runInContext(`
state.alphaUnlocked = true; state.casinoUnlocked = true; state.activeChallenge = ''; state.gainZeroActive = false;
state.alpha = D(100); state.americanRoulette = false;
document.querySelector('#casino-stake').value = '10'; render();
globalThis.casinoRandom = Math.random; Math.random = () => 1.5 / 37;
document.querySelector('#roulette-bet').value = 'red'; spinRoulette();
`, context);
assert(cs.alpha.eq(110), 'red win returns 2x stake');
vm.runInContext(`Math.random = () => 0; spinRoulette();`, context);
assert(cs.alpha.eq(100), 'European zero loses color bets');
const american = doc.querySelector('#american-roulette'); american.checked = true;
american.dispatchEvent(new dom.window.Event('change'));
assert(cs.americanRoulette); assert.equal(doc.querySelector('#roulette-number').options.length,38);
vm.runInContext(`Math.random = () => .999; document.querySelector('#roulette-bet').value = 'number'; document.querySelector('#roulette-number').value = '00'; spinRoulette();`,context);
assert(cs.alpha.eq(450), 'American double zero pays 36x');
for (const bad of ['0','-1','Infinity','NaN','1e999999999999999999999999','garbage','451']) {
  doc.querySelector('#casino-stake').value = bad;
  const before = cs.alpha.toString(); doc.querySelector('#roulette-spin').click();
  assert.equal(cs.alpha.toString(), before, `reject stake ${bad}`);
}
vm.runInContext(`
document.querySelector('#casino-stake').value = '10';
state.blackjackActive = false; dealBlackjack();
Math.random = casinoRandom;
`, context);
assert(a.isValidSave(JSON.parse(a.serializeState())), 'casino save round trip');
// Set up known hands to isolate dealer rules, aces, pushes and repeated settlement.
vm.runInContext(`
state.alpha = D(90); state.blackjackStake = D(10); state.blackjackActive = true;
state.blackjackPlayer = [9, 7]; state.blackjackDealer = [0, 5]; state.blackjackDeck = [12];
playBlackjack('stand');
`,context);
assert(cs.alpha.eq(110), 'dealer stands on soft 17, player 18 wins');
vm.runInContext(`playBlackjack('stand');`,context); assert(cs.alpha.eq(110), 'cannot settle twice');
vm.runInContext(`
state.alpha = D(90); state.blackjackStake = D(10); state.blackjackActive = true;
state.blackjackPlayer = [9, 7]; state.blackjackDealer = [9, 7]; state.blackjackDeck = [];
playBlackjack('stand');
`,context); assert(cs.alpha.eq(100), 'push refunds stake');
vm.runInContext(`
state.alpha = D(90); state.blackjackStake = D(10); state.blackjackActive = true;
state.blackjackPlayer = [9, 7]; state.blackjackDealer = [9, 7]; state.blackjackDeck = [12];
playBlackjack('hit');
`,context); assert(cs.alpha.eq(90), 'bust forfeits stake');
vm.runInContext(`state.gainZeroActive = true; spinRoulette(); dealBlackjack();`,context);
assert(cs.alpha.eq(90), 'null gain blocks casino');
cs.gainZeroActive=false;
console.log('Casino checks passed: roulette payouts, zero/00, invalid stakes, blackjack dealer, push, bust, restrictions and saves.');

// Constant stakes share the same parser for roulette and blackjack.
for (const [input, value] of [['e',Math.E], ['π',Math.PI], ['pi',Math.PI], [' PI ',Math.PI], ['E',Math.E]]) {
  doc.querySelector('#casino-stake').value = input;
  vm.runInContext(`state.alpha = D(100); state.blackjackActive = false; render();`, context);
  assert(!doc.querySelector('#roulette-spin').disabled, `roulette accepts ${input}`);
  assert(!doc.querySelector('#blackjack-deal').disabled, `blackjack accepts ${input}`);
  assert(vm.runInContext('casinoStake()', context).eq(a.D(value)), `constant value ${input}`);
  vm.runInContext(`Math.random = () => 0; spinRoulette(); Math.random = casinoRandom;`, context);
  assert(cs.alpha.eq(a.D(100).minus(value)), `roulette deducts constant ${input}`);
}
vm.runInContext(`state.alpha = D(100); document.querySelector('#casino-stake').value = 'π'; Math.random = () => .5; dealBlackjack(); Math.random = casinoRandom;`, context);
assert(cs.alpha.eq(a.D(100).minus(Math.PI)) || !cs.blackjackActive, 'blackjack uses constant stake');
if (cs.blackjackActive) assert(cs.blackjackStake.eq(a.D(Math.PI)), 'blackjack holds exact parsed stake');
assert(a.isValidSave(JSON.parse(a.serializeState())), 'constant stake save round trip');
for (const invalid of ['pie', 'Math.PI', '2*pi', 'e+1']) {
  doc.querySelector('#casino-stake').value = invalid;
  assert(vm.runInContext('casinoStake().eq(0)', context), `reject unsupported expression ${invalid}`);
}
console.log('Casino constant stakes passed: e, π, pi, case/whitespace, both games and saves.');
// Preserve e and pi as algebraic terms rather than their decimal approximations.
vm.runInContext(`
state.alpha = D(100); state.alphaTerms = null; state.blackjackActive = false;
document.querySelector('#roulette-bet').value = 'red';
Math.random = () => 0;
document.querySelector('#casino-stake').value = 'e'; spinRoulette();
document.querySelector('#casino-stake').value = 'π'; spinRoulette();
`, context);
assert.equal(vm.runInContext('alphaDisplay()',context), '100 − e − π');
vm.runInContext(`changeAlpha(10); activeTab = 'alpha'; render();`,context);
assert.equal(doc.querySelector('#balance').textContent,'110 − e − π','ordinary Alpha gains preserve symbolic terms');
vm.runInContext(`Math.random = () => 1.5 / 38; spinRoulette();`,context);
assert.equal(vm.runInContext('alphaDisplay()',context),'110 − e','pi win cancels prior pi loss exactly');
vm.runInContext(`
document.querySelector('#casino-stake').value = 'π'; Math.random = () => .999; dealBlackjack();
Math.random = casinoRandom;
`,context);
assert(cs.blackjackActive, 'known shuffle leaves an active hand');
assert.equal(vm.runInContext('alphaDisplay()',context),'110 − e − π');
const symbolicReload = new JSDOM(fs.readFileSync('index.html','utf8'), {url:'https://example.test',runScripts:'outside-only'});
const sc = symbolicReload.getInternalVMContext(); sc.setInterval=()=>1; sc.setTimeout=()=>1; sc.clearTimeout=()=>{};
sc.localStorage.setItem('pocket-foundry-save-v2', a.serializeState());
vm.runInContext('(function(){'+fs.readFileSync('break_eternity.js','utf8').replace(/export \{[\s\S]*?\};/,'globalThis.Decimal = y;')+'})();',sc);
vm.runInContext(source,sc);
assert.equal(vm.runInContext('alphaDisplay()',sc),'110 − e − π','reload retains algebraic balance');
assert.equal(sc.testAPI.state.blackjackStakeKind,'pi','reload retains symbolic hand stake');
vm.runInContext(`settleBlackjack(1, 'Push.');`,sc);
assert.equal(vm.runInContext('alphaDisplay()',sc),'110 − e','push restores pi exactly after reload');
vm.runInContext(`changeAlpha(-1, 'pi'); settleBlackjack(2.5, 'Natural.');`,context);
assert.equal(vm.runInContext('alphaDisplay()',context),'110 − e + 0.5π','natural payout retains fractional pi coefficient');
assert(a.isValidSave(JSON.parse(a.serializeState())), 'symbolic save valid');
assert(!a.isValidSave({balance:0,runEarned:0,alphaTerms:{base:'0',e:'Infinity',pi:'0'}}));
assert(!a.isValidSave({balance:0,runEarned:0,blackjackStakeKind:'invalid'}));
console.log('Symbolic Alpha passed: mixed balances, ordinary gains, exact cancellations, blackjack payouts, reloads and validation.');

// Casino license is a paid, permanent prerequisite, including handler-level checks.
vm.runInContext(`
state.alphaUnlocked = true; state.casinoUnlocked = false; state.blackjackActive = false;
state.alpha = D(249); state.alphaTerms = null; document.querySelector('#casino-stake').value = '1'; render();
`,context);
assert(doc.querySelector('#alpha-casino').hidden, 'casino hidden before license');
assert(doc.querySelector('#buy-casino').disabled, 'license unaffordable');
vm.runInContext(`spinRoulette(); dealBlackjack();`,context);
assert(cs.alpha.eq(249) && !cs.blackjackActive, 'cannot gamble before license');
vm.runInContext(`state.alphaUnlocked = false; state.alpha = D(300);`,context);
doc.querySelector('#buy-casino').disabled=false; doc.querySelector('#buy-casino').click();
assert(!cs.casinoUnlocked && cs.alpha.eq(300), 'license requires Alpha unlock');
vm.runInContext(`state.alphaUnlocked = true; state.alpha = D(250); render();`,context);
doc.querySelector('#buy-casino').click();
assert(cs.casinoUnlocked && cs.alpha.eq(0), 'license costs exactly 250 alpha');
assert(!doc.querySelector('#alpha-casino').hidden, 'licensed casino visible');
assert(doc.querySelector('#buy-casino').disabled, 'cannot buy twice');
assert(a.isValidSave(JSON.parse(a.serializeState())), 'license saves');
a.resetAscendanceRun(); assert(cs.casinoUnlocked, 'license survives Ascendance');
console.log('Casino license passed: cost, prerequisites, visibility, handlers, saves and permanent unlock.');

const hs = a.state;
// Translations charge distinct currencies exactly once and persist independently of the puzzle.
hs.cubeUnlocked=true; hs.fortuneUnlocked=false; hs.fortuneHints=0; hs.fortuneClue=2;
hs.balance=a.D(0); a.render();
assert(!doc.getElementById('fortune-hint-shop').hidden);
assert.equal(doc.getElementById('fortune-bought-hints').children.length,0);
const hintButton=doc.getElementById('buy-fortune-hint');
assert(hintButton.disabled); hintButton.disabled=false; hintButton.click();
assert.equal(hs.fortuneHints,0,'handler rejects unaffordable hint');
const prices=[['balance','1e100'],['tokens','1e50'],['credits','1e25'],['data','1000']];
for (const [i,[currency,cost]] of prices.entries()) {
  hs[currency]=a.D(cost); a.render(); assert(!hintButton.disabled);
  const untouched=Object.fromEntries(prices.filter(([key])=>key!==currency).map(([key])=>[key,hs[key].toString()]));
  hintButton.click(); assert(hs[currency].eq(0),'exact hint price deducted');
  for (const [key,value] of Object.entries(untouched)) assert(hs[key].eq(value),'other currencies untouched');
  assert.equal(hs.fortuneHints,i+1); assert.equal(hs.fortuneClue,2,'hint never advances puzzle');
  assert.equal(doc.getElementById('fortune-bought-hints').children.length,i+1);
}
assert(hintButton.disabled); hintButton.disabled=false; hintButton.click(); assert.equal(hs.fortuneHints,4,'no duplicate purchases');
a.resetAscendanceRun(); assert.equal(hs.fortuneHints,4,'translations survive Ascendance');
assert(a.isValidSave(JSON.parse(a.serializeState())),'hint save round trip');
for (const value of [-1,5,1.5,'1']) assert(!a.isValidSave({balance:0,runEarned:0,fortuneHints:value}));
hs.fortuneUnlocked=true; a.render(); assert(doc.getElementById('fortune-hint-shop').hidden,'shop hides after discovery');
hs.fortuneHints=0; hs.balance=a.D('1e100'); hintButton.disabled=false; hintButton.click();
assert.equal(hs.fortuneHints,0,'no purchases after discovery');
console.log('Fortune hints passed: sequential prices, currency isolation, insufficient funds, no duplicates, persistence, validation and discovery gating.');

// Visible spins land the selected weighted wedge under the fixed pointer.
hs.activeChallenge=''; hs.gainZeroActive=false; hs.fortuneCharges=20;
a.clearFortuneChain(); a.render();
const originalTimeout = context.setTimeout;
let finishSpin;
context.setTimeout = (callback, delay) => { if (delay === 2600) finishSpin=callback; return 1; };
const wheel = doc.getElementById('fortune-wheel');
const segments = a.fortuneSegments();
const winningIndex = segments.findIndex(part=>part.id==='points');
const preceding = segments.slice(0,winningIndex).reduce((sum,part)=>sum+part.weight,0);
context.Math.random=()=> (preceding+.5)/(a.fortuneCapacity()+4);
doc.getElementById('fortune-spin').click();
assert.equal(wheel.getAttribute('aria-busy'),'true');
assert.equal(doc.getElementById('fortune-result').textContent,'Spinning…');
const angle=Number(wheel.style.transform.match(/rotate\((.+)deg\)/)[1]);
assert(angle>=1800,'at least five full turns');
const center=(preceding+segments[winningIndex].weight/2)/(a.fortuneCapacity()+4)*360;
assert(Math.abs((angle+center)%360)<1e-8,'winning wedge aligns with pointer');
assert(doc.getElementById('fortune-spin').disabled);
assert(doc.getElementById('fortune-bank').disabled);
assert(doc.querySelector('[data-fortune-wedge]').disabled);
const remaining=hs.fortuneCharges;
a.spinFortune(); assert.equal(hs.fortuneCharges,remaining,'no overlapping spins');
a.render(); assert.equal(wheel.style.transform,`rotate(${angle}deg)`,'render preserves motion');
assert.equal(typeof finishSpin,'function'); finishSpin();
assert.equal(wheel.getAttribute('aria-busy'),'false');
assert(!doc.getElementById('fortune-bank').disabled);
assert.match(doc.getElementById('fortune-result').textContent,/Output/);
context.setTimeout=originalTimeout;
console.log('Fortune animation passed: turns, landing angle, input lock, rerender stability and completion.');
