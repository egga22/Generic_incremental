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
