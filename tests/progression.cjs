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
globalThis.testAPI = {get state(){return state}, D, rate, saleGain, applyCurrencyGain, epsilonGainRate, tickEpsilon, kirbyBonus, feedKirby, tokenReward, creditMultiplier, challengeExponent, challengeDuration, challengeGainMultiplier, resetAscendanceRun, resetCreditRun, runAutomations, runPresetResets, presetAllowsPurchase, isValidSave, serializeState, render, checkAchievements, recordFortuneRitual, spinFortune, bankFortune, fortuneUsed, fortuneCapacity, fortuneSegments, clearFortuneChain, updateFortuneProgress};`;
vm.runInContext(source, context);
const a = context.testAPI, s = a.state, doc = dom.window.document;
assert(a.isValidSave(JSON.parse(a.serializeState())), 'fresh save round trip');
assert(a.isValidSave({balance:0,runEarned:0}), 'old save accepted');
// Only held currencies count, with a strict greater-than threshold.
const achievementStart = {...s};
for (const key of ['balance', 'tokens', 'credits', 'data', 'alpha', 'ascendance', 'darkMatter', 'epsilon', 'spark', 'fishPoints', 'fortuneTokens', 'fortuneCharges']) {
  s.achievements = []; s[key] = a.D('1e9000');
  a.checkAchievements();
  assert(!s.achievements.includes('over9000'), `${key}: exact threshold does not qualify`);
  s[key] = a.D('1.01e9000'); a.checkAchievements(); a.checkAchievements();
  assert.equal(s.achievements.filter(id => id === 'over9000').length, 1, `${key}: award once above threshold`);
  if (key !== 'fortuneTokens' && key !== 'fortuneCharges') assert(a.isValidSave(JSON.parse(a.serializeState())), `${key}: achievement saves correctly`);
  Object.assign(s, achievementStart);
}
s.lifetime = a.D('1e9001'); s.runEarned = a.D('1e9001'); s.cubeClicks = a.D('1e9001');
a.checkAchievements(); assert(!s.achievements.includes('over9000'), 'statistics and Cube progress are not currency');
Object.assign(s, achievementStart);

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
s.activeChallenge='additionpower'; s.balance=a.D(10); s.printer=true; s.multiplierLevel=1;
s.pointUpgrade21Bought=true; s.researchBranch='production'; s.researchLevel=1;
assert(a.rate().eq(a.D('6.1')), 'Addition Power adds the multiplier, point-upgrade, and research factors');
assert(a.saleGain().eq(a.D(3)), 'Addition Power applies to click gain multipliers');
s.balance=a.D(500); s.tokens=a.D(0); s.tokenBoostLevel=1; s.creditEngine=true; s.heavyMint=true;
s.cubeUnlocked=true; s.cubeTarget='tokens'; s.cubeLevel=4;
s.researchBranch='resets'; s.researchLevel=1;
assert(a.tokenReward().eq(a.D('38.25').times(a.challengeGainMultiplier())), 'Addition Power converts token gain upgrades while preserving challenge bonuses');
s.ascCurrencyBoost=true; s.ascAllCurrencyLevel=1;
assert(a.applyCurrencyGain(1).eq(103), 'Addition Power converts global gain upgrades for all currencies');
s.balance=a.D(10); s.tokenBoostLevel=0; s.creditEngine=false; s.heavyMint=false;
s.cubeUnlocked=false; s.cubeTarget='points'; s.cubeLevel=0; s.researchBranch='production'; s.researchLevel=1;
s.ascCurrencyBoost=false; s.ascAllCurrencyLevel=0;
s.activeChallenge=''; assert(a.rate().eq(a.D('4.4')), 'normal production multipliers remain unchanged');
s.printer=false; s.balance=a.D(0); s.multiplierLevel=0; s.pointUpgrade21Bought=false;
s.researchBranch='none'; s.researchLevel=0;
s.cyan14Level=0; s.cyanSquareCounts=[0,0,0]; s.completedChallenges=['deduction1','time1'];
a.render(); doc.querySelector('[data-challenge="time4"]').click();
const time4Deadline=s.challengeEndsAt;
assert.equal(s.activeChallenge,'time4');
assert(time4Deadline-Date.now()>=4500 && time4Deadline-Date.now()<=5000,'Time Limit IV starts with five seconds');
s.balance=a.D('1e200'); a.render(); doc.getElementById('buy-cyan-14').click();
assert.equal(s.challengeEndsAt,time4Deadline,'cyan time upgrades do not extend Time Limit IV');
assert.equal(a.challengeDuration('time4'),5/60,'Time Limit IV remains five seconds after cyan upgrades');
const validChallengeSave=JSON.parse(a.serializeState());
validChallengeSave.completedChallenges=['additionpower','time4'];
assert(a.isValidSave(validChallengeSave),'new challenges are accepted in saves');
s.activeChallenge=''; s.challengeEndsAt=0; s.cyan14Level=0; s.cyanSquareCounts=[0,0,0]; s.balance=a.D(0);
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

const dieState=a.state;
// Icosahedron: exact price, both prerequisites, all faces, cooldown, and persistence.
dieState.icosahedronUnlocked=false; dieState.cubeUnlocked=false; dieState.pyramidUnlocked=true; dieState.credits=a.D('1e1001'); a.render();
const buyDie=doc.getElementById('buy-icosahedron-unlock');
assert(buyDie.disabled); buyDie.click(); assert(!dieState.icosahedronUnlocked);
dieState.cubeUnlocked=true; dieState.pyramidUnlocked=false; a.render(); assert(buyDie.disabled);
dieState.pyramidUnlocked=true; dieState.credits=a.D('9e999'); a.render(); assert(buyDie.disabled);
dieState.credits=a.D('1e1000'); a.render(); buyDie.click(); assert(dieState.icosahedronUnlocked); assert(dieState.credits.eq(0));
dieState.activeChallenge=''; dieState.gainZeroActive=false;
const rollDie=doc.getElementById('roll-icosahedron'), oldRandom=context.Math.random;
for(let face=0; face<20; face++) {
  dieState.icosahedronReadyAt=0; dieState.balance=a.D(1000); dieState.tokens=a.D(1000); dieState.credits=a.D(1000); dieState.cubeLevel=10; dieState.cubeClicks=a.D(0);
  context.Math.random=()=> (face+.5)/20; a.render(); rollDie.click();
  assert(dieState.icosahedronResult.startsWith(`Face ${face+1}:`));
  assert(dieState.icosahedronReadyAt>Date.now()+299000);
  if(face>=12) { const key=face<15?'balance':face<18?'tokens':'credits'; assert(dieState[key].lt(1000) && dieState[key].gte(600)); }
  else if(face>=9) assert(dieState.cubeLevel>10 || dieState.cubeClicks.gt(0));
  else if(face>=6) assert(dieState.credits.gt(1000));
  else if(face>=3) assert(dieState.tokens.gt(1000));
  const result=dieState.icosahedronResult; rollDie.click(); assert.equal(dieState.icosahedronResult,result);
}
context.Math.random=oldRandom;
for(const block of ['trial','null']) {
  dieState.icosahedronReadyAt=0; dieState.activeChallenge=block==='trial'?'deduction1':''; dieState.gainZeroActive=block==='null'; a.render(); assert(rollDie.disabled);
}
dieState.activeChallenge=''; dieState.gainZeroActive=false; dieState.icosahedronReadyAt=Date.now()+300000;
const deadline=dieState.icosahedronReadyAt; a.resetCreditRun(); a.resetAscendanceRun();
assert(dieState.icosahedronUnlocked); assert.equal(dieState.icosahedronReadyAt,deadline);
const dieSave=JSON.parse(a.serializeState()); assert(a.isValidSave(dieSave)); assert.equal(dieSave.icosahedronReadyAt,deadline);
dieState.icosahedronReadyAt=Date.now()-1; a.render(); assert(!rollDie.disabled, 'elapsed wall-clock cooldown enables rolling');
console.log('Icosahedron checks passed');

// Expeditions: exercise the actual route, completion, cash-out and upgrade controls.
const es = a.state;
const expeditionTestStart = {...es, expeditionUpgrades: [...es.expeditionUpgrades]};
es.activeChallenge=''; es.challengeEndsAt=0; es.pyramidUnlocked=false; es.gainZeroActive=false;
es.expedition=null; es.expeditionSeals=0; es.expeditionUpgrades=[0,0,0]; a.render();
assert(doc.getElementById('expedition-panel').hidden);
es.pyramidUnlocked=true; es.credits=a.D(12345); a.render();
const expeditionClick=id=>doc.getElementById(id).click();
const route=id=>doc.querySelector(`[data-expedition-room="${id}"]`).click();
const clearRoom=()=>{es.tokens=a.D(10).pow(33+es.expedition.floor*3);a.render();expeditionClick('credit-prestige-button');};
expeditionClick('expedition-start');
assert.equal(es.activeChallenge,'expedition'); assert(es.credits.eq(12345)); assert(es.tokens.eq(0));
assert(doc.getElementById('expedition-bank').disabled);
assert(doc.getElementById('credit-prestige-button').disabled);
assert(doc.querySelector('[data-challenge="deduction1"]').disabled);
for(const id of ['data-prestige-button','spark-prestige-button','ascendance-prestige-button','token-ascendance-button']) assert(doc.getElementById(id).disabled);
route('gallery'); const firstDeadline=es.challengeEndsAt;
assert.equal(es.expedition.room,'gallery'); assert.equal(a.challengeExponent(),.82);
assert(firstDeadline>Date.now()+419000);
const trialRecords=JSON.stringify(es.completedChallenges), combos=JSON.stringify(es.completedCombos);
es.tokens=a.D('9e32'); a.render(); assert(doc.getElementById('credit-prestige-button').disabled);
clearRoom(); assert.equal(es.expedition.floor,1); assert.equal(es.expedition.treasure,1);
assert.equal(es.expedition.relics[0],1); assert.equal(es.challengeEndsAt,0);
assert.equal(JSON.stringify(es.completedChallenges),trialRecords); assert.equal(JSON.stringify(es.completedCombos),combos);
assert(es.credits.eq(12345)); assert(!doc.getElementById('expedition-bank').disabled);
route('vault'); assert(Math.abs(a.challengeExponent()-.73)<1e-9);
es.tokens=a.D('1e33'); a.render(); assert(doc.getElementById('credit-prestige-button').disabled,'later floors require their larger goal');
clearRoom(); assert.equal(es.expedition.treasure,7); assert.equal(es.expedition.relics[1],1);
es.balance=a.D('1e20'); const scarabReward=a.tokenReward(); es.expedition.relics[1]=0;
assert(scarabReward.eq(a.tokenReward().times(2))); es.expedition.relics[1]=1;
route('stairs'); clearRoom(); assert.equal(es.expedition.treasure,13);
route('gallery'); assert(es.challengeEndsAt>Date.now()+389000,'Hourglass extends later rooms');
const activeSave=JSON.parse(a.serializeState()); assert(a.isValidSave(activeSave));
// A reload keeps route, treasure, relics, and the absolute deadline.
const expeditionReload = new JSDOM(fs.readFileSync('index.html','utf8'), {url:'https://example.test',runScripts:'outside-only'});
const ec=expeditionReload.getInternalVMContext(); ec.setInterval=()=>1; ec.setTimeout=()=>1; ec.clearTimeout=()=>{};
ec.localStorage.setItem('pocket-foundry-save-v2',JSON.stringify(activeSave));
vm.runInContext('(function(){'+fs.readFileSync('break_eternity.js','utf8').replace(/export \{[\s\S]*?\};/,'globalThis.Decimal = y;')+'})();',ec);
vm.runInContext(source,ec);
assert.equal(ec.testAPI.state.challengeEndsAt,es.challengeEndsAt);
assert.equal(JSON.stringify(ec.testAPI.state.expedition),JSON.stringify(es.expedition));
assert(!a.isValidSave({...activeSave,expedition:{...activeSave.expedition,room:'bogus'}}));
assert(!a.isValidSave({...activeSave,expedition:{...activeSave.expedition,floor:8}}));
assert(!a.isValidSave({...activeSave,expeditionUpgrades:[21,0,0]}));
assert(!a.isValidSave({...activeSave,activeChallenge:''}));
clearRoom(); expeditionClick('expedition-bank');
assert.equal(es.expedition,null); assert.equal(es.expeditionSeals,17); assert.equal(es.activeChallenge,'');
expeditionClick('expedition-bank'); assert.equal(es.expeditionSeals,17,'no double bank');
es.printer=true; const productionBefore=a.rate();
doc.querySelector('[data-expedition-upgrade="0"]').click();
assert.equal(es.expeditionSeals,12); assert.equal(es.expeditionUpgrades[0],1);
assert(a.rate().eq(productionBefore.times(1.1)),'permanent production boost');
doc.querySelector('[data-expedition-upgrade="1"]').click();
es.balance=a.D('1e20'); const resetBoost=a.tokenReward();es.expeditionUpgrades[1]=0;
assert(resetBoost.eq(a.tokenReward().times(1.1)));es.expeditionUpgrades[1]=1;
expeditionClick('expedition-start'); route('stairs'); clearRoom(); route('vault');
const bankedBeforeLoss=es.expeditionSeals; es.challengeEndsAt=Date.now()-1;
es.tokens=a.D('1e100'); a.render(); expeditionClick('credit-prestige-button');
assert.equal(es.expedition,null); assert.equal(es.expeditionSeals,bankedBeforeLoss,'timeout loses only unbanked treasure');
expeditionClick('expedition-start'); route('gallery'); clearRoom();expeditionClick('expedition-abandon');
assert.equal(es.expeditionSeals,bankedBeforeLoss);assert.equal(es.expedition,null);
// Full depth banks once, then all permanent progress survives Ascendance.
expeditionClick('expedition-start');
for(let floor=0;floor<8;floor++){route('vault'); clearRoom();}
assert.equal(es.expedition,null); assert.equal(es.expeditionBest,8);
assert.equal(es.expeditionSeals,bankedBeforeLoss+108);
const permanentSeals=es.expeditionSeals; a.resetAscendanceRun();
assert.equal(es.expeditionSeals,permanentSeals);assert.equal(es.expeditionUpgrades[0],1);assert.equal(es.expeditionUpgrades[1],1);
assert(a.isValidSave(JSON.parse(a.serializeState())));
// The regular tick also expires rooms without requiring a button click.
es.pyramidUnlocked=true; a.render(); expeditionClick('expedition-start'); route('gallery');
es.challengeEndsAt=Date.now()-1; timers.forEach(fn=>fn());
assert.equal(es.expedition,null); assert.equal(es.activeChallenge,'');
Object.assign(es, expeditionTestStart); a.render();
expeditionReload.window.close();
console.log('Expeditions passed: routes, escalating goals, relics, prestige locks, bank/loss, upgrades, full depth, reloads and save validation.');

// Upgrade 21 follows 20, doubles gain, saves, and resets with Points upgradethinkState.
const thinkState=a.state;
const thinkStart = {...thinkState};
thinkState.pointUpgrade20Bought=false; thinkState.pointUpgrade21Bought=false; thinkState.balance=a.D('1e282'); a.render();
const thinkButton=doc.getElementById('buy-point-21');
assert(thinkButton.disabled); thinkButton.click(); assert(!thinkState.pointUpgrade21Bought);
thinkState.pointUpgrade20Bought=true; thinkState.ascPointDiscountLevel=0; a.render();
const thinkRate=a.rate(), thinkBalance=thinkState.balance;
thinkButton.click(); assert(thinkState.pointUpgrade21Bought);
assert(thinkState.balance.eq(thinkBalance.minus('1e280')));
assert(a.rate().eq(thinkRate.times(2)), '21 doubles permanent production');
assert(thinkButton.disabled); thinkButton.click(); assert(thinkState.balance.eq(thinkBalance.minus('1e280')));
assert(a.isValidSave(JSON.parse(a.serializeState())));
a.resetCreditRun(); assert(!thinkState.pointUpgrade21Bought);
thinkState.pointUpgrade21Bought=true; a.resetAscendanceRun(); assert(!thinkState.pointUpgrade21Bought);
Object.assign(thinkState,thinkStart);
console.log('Think on it checks passed');

// Icosahedron workshop and collection progression.
const ds=a.state, dieBefore={...ds};
ds.icosahedronUnlocked=true; ds.activeChallenge=''; ds.gainZeroActive=false;
ds.dieFaces=[]; ds.dieUpgrades=[0,0,0]; ds.dieShards=0; ds.dieRolls=0; ds.dieWins=0; ds.dieHistory=[]; ds.dieStance='balanced';
const dieStance=doc.getElementById('icosahedron-stance');
doc.getElementById('icosahedron-tab').click();
assert(!doc.getElementById('icosahedron-panel').hidden);
assert(doc.getElementById('credit-upgrades').hidden);
dieStance.value='daring'; dieStance.dispatchEvent(new dom.window.Event('change')); assert.equal(ds.dieStance,'balanced');
for(let i=0;i<5;i++) {
 ds.icosahedronReadyAt=0; context.Math.random=()=> (i+.5)/20; a.render(); rollDie.click();
}
assert.equal(ds.dieShards,20); assert.equal(ds.dieFaces.length,5); assert.equal(ds.dieRolls,5);
assert.equal(doc.querySelectorAll('.die-collection .collected').length,5);
ds.icosahedronReadyAt=0; context.Math.random=()=>.025; a.render(); rollDie.click(); assert.equal(ds.dieShards,21,'repeat faces do not repay discovery bonus');
dieStance.value='daring'; dieStance.dispatchEvent(new dom.window.Event('change')); assert.equal(ds.dieStance,'daring');
const quick=doc.querySelector('[data-die-upgrade="0"]'); quick.click(); assert.equal(ds.dieUpgrades[0],1); assert.equal(ds.dieShards,16);
const priorDeadline=ds.icosahedronReadyAt; assert(priorDeadline>Date.now(),'workshop does not erase cooldown');
ds.dieFaces=Array.from({length:20},(_,i)=>i+1); ds.dieStance='guarded'; ds.dieUpgrades=[5,0,5]; ds.credits=a.D(1000);
ds.icosahedronReadyAt=0; context.Math.random=()=>19.5/20; a.render(); const beforeLoss=ds.credits; rollDie.click();
assert(ds.credits.eq(beforeLoss.times(.95)), 'guarded and cushioning reduce 40% loss to 5%');
assert(ds.icosahedronReadyAt>Date.now()+149000 && ds.icosahedronReadyAt<=Date.now()+150000);
assert.equal(ds.dieShards,17,'losses still award shards');
for(let i=0;i<10;i++) { ds.icosahedronReadyAt=0; a.render(); rollDie.click(); }
assert.equal(ds.dieHistory.length,8);
ds.dieStance='balanced'; ds.dieUpgrades=[5,5,5]; ds.tokens=a.D(1000); ds.icosahedronReadyAt=0;
context.Math.random=()=>3.5/20; a.render(); rollDie.click();
assert(Math.abs(ds.tokens.toNumber()-1280)<1e-8, 'polish and full collection multiply positive rewards');
const maxShards=ds.dieShards; quick.click(); assert.equal(ds.dieShards,maxShards); assert.equal(ds.dieUpgrades[0],5);
ds.dieUpgrades=[0,5,5]; ds.dieShards=0; a.render(); quick.click(); assert.equal(ds.dieUpgrades[0],0);
ds.dieUpgrades=[5,5,5];
const shardsBeforeReset=ds.dieShards; a.resetCreditRun(); a.resetAscendanceRun();
assert.equal(ds.dieShards,shardsBeforeReset); assert.equal(ds.dieFaces.length,20); assert.equal(ds.dieUpgrades[0],5);
assert(a.isValidSave(JSON.parse(a.serializeState())));
assert(!a.isValidSave({dieFaces:[1,1]})); assert(!a.isValidSave({dieFaces:[21]}));
assert(!a.isValidSave({dieUpgrades:[6,0,0]})); assert(!a.isValidSave({dieStance:'daring',dieFaces:[]}));
ds.activeChallenge='deduction1'; a.render(); const blockedShards=ds.dieShards; quick.click(); rollDie.click(); assert.equal(ds.dieShards,blockedShards);
context.Math.random=oldRandom; Object.assign(ds,dieBefore); a.render();
console.log('Icosahedron expansion passed: tab, collection, shards, stances, workshop, cooldown, losses, history, resets and validation.');

// NPC tab, milestone requests, persistence, and save compatibility.
const ns = a.state;
const beforeNPCs = {...ns};
ns.npcProgress = [0, 0, 0]; ns.npcTalks = [0, 0, 0];
ns.printer = false; ns.totalPrestiges = 0; ns.totalCreditPrestiges = 0; ns.totalAscendances = 0;
ns.pyramidUnlocked = false;
doc.getElementById('npc-tab').click();
assert(!doc.getElementById('npc-panel').hidden);
assert(doc.getElementById('run-upgrades').hidden);
assert(doc.querySelector('[data-npc-quest="0"]').disabled);
assert(!doc.querySelector('[data-npc-talk="1"]'), 'unmet NPC has no interactions');
doc.querySelector('[data-npc-talk="0"]').click();
assert.equal(ns.npcTalks[0], 1);
ns.printer = true; a.render(); doc.querySelector('[data-npc-quest="0"]').click();
assert.equal(ns.npcProgress[0], 1);
assert(doc.querySelector('[data-npc-quest="0"]').disabled, 'next request is separately gated');
ns.totalPrestiges = 1; a.render();
assert(doc.querySelector('[data-npc-talk="1"]'), 'Orin arrives at Token prestige');
doc.querySelector('[data-npc-quest="0"]').click();
ns.cubeUnlocked = true; a.render(); doc.querySelector('[data-npc-quest="0"]').click();
assert.equal(ns.npcProgress[0], 3);
assert(!doc.querySelector('[data-npc-quest="0"]'), 'completed requests cannot repeat');
a.resetCreditRun(); a.resetAscendanceRun();
assert.equal(ns.npcProgress[0], 3, 'relationships survive resets');
assert.equal(ns.npcTalks[0], 1, 'conversation survives resets');
assert(a.isValidSave(JSON.parse(a.serializeState())), 'NPC state saves');
assert(!a.isValidSave({balance:0,runEarned:0,npcProgress:[4,0,0]}));
assert(!a.isValidSave({balance:0,runEarned:0,npcTalks:[0]}));
assert(a.isValidSave({balance:0,runEarned:0}), 'pre-NPC saves remain valid');
doc.getElementById('run-tab').click(); assert(doc.getElementById('npc-panel').hidden);
const originalRandom = context.Math.random;
context.Math.random = () => .9;
doc.getElementById('npc-tab').click();
assert(doc.getElementById('traveler-card').hidden, 'traveler does not appear on a roll of 0.9');
assert(doc.querySelector('[data-npc-talk="0"]'), 'the regular NPC is available when the traveler is absent');
doc.getElementById('run-tab').click();
context.Math.random = () => .899;
doc.getElementById('npc-tab').click();
assert(!doc.getElementById('traveler-card').hidden, 'traveler appears on a roll below 0.9');
doc.getElementById('traveler-yes').click();
assert(!doc.getElementById('epsilon-upgrades').hidden, 'accepting the traveler opens the Epsilon tree');
assert(doc.getElementById('sections-toggle').hidden, 'the Sections menu is locked in the Epsilon tree');
doc.getElementById('sections-toggle').click();
assert(doc.getElementById('upgrade-tabs').hidden, 'the locked Sections menu cannot open');
const epsilonReload = new JSDOM(fs.readFileSync('index.html','utf8'), {url:'https://example.test',runScripts:'outside-only'});
const erc = epsilonReload.getInternalVMContext(); erc.setInterval=()=>1; erc.setTimeout=()=>1; erc.clearTimeout=()=>{};
erc.localStorage.setItem('pocket-foundry-save-v2',a.serializeState());
vm.runInContext('(function(){'+fs.readFileSync('break_eternity.js','utf8').replace(/export \{[\s\S]*?\};/,'globalThis.Decimal = y;')+'})();',erc);
vm.runInContext(source,erc);
assert(!epsilonReload.window.document.getElementById('epsilon-upgrades').hidden, 'reloading before 9ε keeps the player in the tree');
assert(epsilonReload.window.document.getElementById('sections-toggle').hidden, 'reloading cannot bypass the locked menu');
doc.getElementById('buy-epsilon-1').click();
assert.equal(a.epsilonGainRate().toString(), '0.01');
ns.ascMainlinePowerLevel=5; ns.ascCurrencyBoost=true; ns.ascAllCurrencyLevel=3;
a.tickEpsilon(2);
assert(ns.epsilon.eq(.02), 'mainline gain bonuses do not affect epsilon');
ns.epsilon=a.D(.15); context.Math.random=()=>0;
a.render();
doc.getElementById('buy-epsilon-2').click();
assert.equal(ns.epsilonUpgrade2Level,1);
assert.equal(ns.epsilonOctahedrons.length,1);
assert(ns.epsilon.eq(0), 'the second upgrade spends its full cost');
assert(a.epsilonGainRate().eq(.02));
ns.epsilon=a.D(1); ns.epsilonOctahedrons=[3,1,1]; a.render();
doc.getElementById('buy-epsilon-3').click();
assert.equal(ns.epsilonUpgrade3Level,1); assert(ns.epsilon.eq(0), 'buying beneath an octahedron drains epsilon');
ns.epsilon=a.D(100); ns.epsilonUpgrade3Level=5; ns.epsilonUpgrade4Level=4; a.render();
doc.getElementById('buy-epsilon-5').click(); doc.getElementById('buy-epsilon-6').click();
assert.equal(ns.epsilonOctahedrons.length,3, '5ε and 6ε add their octahedrons');
assert.equal(doc.querySelectorAll('[data-epsilon-threats="1"] .epsilon-octahedron.dim').length,1, 'the second octahedron is dimmer');
ns.epsilonOctahedrons=[1]; ns.epsilonOctahedronTimer=4.9;
a.tickEpsilon(.09); assert.equal(ns.epsilonOctahedrons[0],1,'octahedrons wait five seconds before moving');
a.tickEpsilon(.02); assert.equal(ns.epsilonOctahedrons[0],2,'octahedrons move to a different upgrade every five seconds');
ns.epsilonUpgrade3Level=5; ns.epsilonUpgrade4Level=4; ns.epsilonUpgrade5Level=1; ns.epsilonUpgrade6Level=1;
ns.epsilonUpgrade7Level=0; ns.epsilonOctahedrons=[1,2,3]; ns.epsilon=a.D(5000); a.render();
assert(doc.getElementById('buy-epsilon-8').disabled, '8ε requires maxing out 7ε');
for (let level=1; level<=5; level++) {
  doc.getElementById('buy-epsilon-7').click();
  assert.equal(ns.epsilonUpgrade7Level,level);
  assert.equal(ns.epsilonOctahedrons.length,Math.max(0,3-Math.min(level,3)));
}
doc.getElementById('buy-epsilon-8').click(); doc.getElementById('buy-epsilon-8').click();
assert.equal(ns.epsilonUpgrade8Level,2);
ns.epsilon=a.D(2000); a.render();
assert(!doc.getElementById('buy-epsilon-9').disabled, '9ε unlocks after all previous upgrades are maxed');
doc.getElementById('buy-epsilon-9').click();
assert(ns.epsilonEscapeUnlocked); assert(!doc.getElementById('sections-toggle').hidden);
doc.getElementById('sections-toggle').click();
assert(!doc.getElementById('upgrade-tabs').hidden, '9ε re-enables the Sections menu');
assert(a.isValidSave(JSON.parse(a.serializeState())), 'epsilon currency and upgrades save');
assert(!a.isValidSave({balance:0,runEarned:0,epsilonOctahedrons:[10]}));
assert(!a.isValidSave({balance:0,runEarned:0,epsilonUpgrade7Level:6}));
context.Math.random = originalRandom;
Object.assign(ns, beforeNPCs);
console.log('NPC and Epsilon checks passed: traveler odds, tree access, epsilon gain, moving hazards, upgrade gates, escape, and saves.');
