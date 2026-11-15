we tried to make an incremental game
its not very good
1+1=2
yea

## Discoveries and mastery

The panel beneath upgrades adds:

- Cube target loadouts: one slot with the Cube, two after one Ascendance, three after three. Stored targets never bypass unlock requirements.
- Nine combined Pyramid trials: pair a completed Deduction trial with a completed timed trial. Reach 1e33 tokens and credit prestige before time expires. Each unique pair adds 10% to the token/credit reward multiplier.
- Data research after all five lore records: five levels costing 10/20/40/80/160 Data. Freely switch between production (2× P$/sec per level), resets (2× token/credit reset rewards per level), and automation (one extra autobuyer pass per tick per level). Ascendance clears research.
- Ascendance milestones at 1/3/5/10 resets: printers; Expansion and Max Buy; Credit engine/Cube/Pyramid; all autobuyers. These starting unlocks apply after resets.
- Per-layer automation presets using existing purchased autobuyers. Fast resets unlocks with Automations, reserve mode after three standard trials, and Long push after one Ascendance. Reset intervals are configurable; Long push waits five times the interval. Automatic resets pause during trials. Off leaves existing autobuyers alone.
- Spark charge after the first Spark reset: positive passive production fills 100% in five minutes. Spend charge for a 30-second P$/sec burst, from ×1.04 to ×5. Charging pauses during a burst; spending all charge requires at least 1%.
- Six achievements with cosmetic Gold and Violet panel themes at three and six achievements.

New progress is included in exports and saves; older saves receive empty/default feature state. Milestones are derived from the existing Ascendance count.

## Checks

Use Node 20.19+ (or Node 22.12+), then `npm ci` and `npm test` for DOM-based progression and save checks. Tests do not establish long-term balance or visual layout quality.

## Kirby companion

After your first prestige, Kirby appears beneath the upgrades. Feed 1% of P$ (minimum 10) or tokens (minimum 1) every 30 seconds for 25 Fullness; those foods discover Beam and Mirror. Spark, Stone, and Fisher unlock alongside their existing game systems. Equip one ability with a 10-second switch cooldown. Friendship increases with discovered abilities and caps at five.

Beam boosts passive production, Mirror boosts token reset rewards, Spark speeds charge, Stone builds production strength over five minutes on one Cube target, and Fisher awards an extra fish every fifth successful catch. Hypernova spends 100 Fullness for 30 seconds of doubled ability strength (Fisher: every third catch), followed by a 60-second nap. Effects pause during trials and zero-gain mode. Ascendance clears Fullness, burst, nap, and Stone charge while keeping discoveries.

**More → Copyright mode** hides Kirby and disables all companion effects and interactions. It cancels an active burst and clears Stone charge, preserves discoveries and Fullness, and is included in saves and exports. Turn it off to restore the companion.
