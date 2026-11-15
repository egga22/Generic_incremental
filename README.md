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

## Pyramid Expeditions

Open the Pyramid after unlocking it to start an eight-floor expedition. Each floor offers three routes: Weighted Gallery (milder deduction), Sealed Vault (larger treasure, harsher deduction), and Collapsing Stairs (short timer). Rooms reset P$ and tokens while keeping credits and permanent upgrades. Collect `1e(33 + 3 × cleared floors)` tokens and press **Clear room** before the timer expires. Room clears do not award credits or complete regular trials.

Each cleared room adds its floor number times its route reward (1/3/2 seals) to unbanked treasure and grants a temporary relic. Prisms add 0.03 to room production exponents, Scarabs double expedition token reset rewards, and Hourglasses add 30 seconds to future rooms. Base timers are 420/360/180 seconds and shorten by 20 seconds per cleared floor, with a 60-second minimum after bonuses.

Between floors, bank treasure and leave or choose another route. Failure or abandonment loses all unbanked treasure and relics; clearing floor eight automatically banks. Timers use wall-clock time and continue across reloads. Automatic resets and other prestige layers pause during expeditions; normal autobuyers and manual token resets remain available.

Banked seals buy three permanent upgrades: ×1.1 passive production per level, ×1.1 token/credit reset rewards per level, and +10 seconds per room per level. Each has 20 levels costing 5 × next level seals. Banked seals, upgrades, and best depth survive Ascendance.
