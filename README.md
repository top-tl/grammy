[![npm version](https://img.shields.io/npm/v/@toptl/grammy.svg)](https://www.npmjs.com/package/@toptl/grammy)
[![npm downloads](https://img.shields.io/npm/dm/@toptl/grammy.svg)](https://www.npmjs.com/package/@toptl/grammy)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

# toptl-grammy

Grammy plugin for [TOP.TL](https://top.tl) — auto-post bot stats and check user votes.

## Installation

```bash
npm install toptl-grammy toptl grammy
```

## Quick Start

```ts
import { Bot, Context } from 'grammy';
import { TopTL } from 'toptl';
import { toptl, TopTLFlavor } from 'toptl-grammy';

type MyContext = Context & TopTLFlavor;

const bot = new Bot<MyContext>('BOT_TOKEN');
const client = new TopTL('YOUR_TOPTL_API_KEY');

// Register the plugin — stats are auto-posted every 30 minutes
bot.use(toptl(client, 'mybot'));

bot.command('start', (ctx) => {
  ctx.reply('Hello!');
});

bot.start();
```

Stats (unique users, groups, channels) are tracked automatically from incoming updates and posted to TOP.TL in the background.

## Vote-Gating

Restrict commands to users who have voted for your bot:

```ts
bot.command('premium', async (ctx) => {
  const voted = await ctx.toptl.hasVoted();

  if (!voted) {
    return ctx.reply('Please vote for our bot on https://top.tl/mybot to unlock this command!');
  }

  ctx.reply('Thanks for voting! Here is your premium content.');
});
```

Check vote status with remaining time:

```ts
bot.command('votestatus', async (ctx) => {
  const { voted, timeLeft } = await ctx.toptl.isVoteActive();

  if (voted) {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    ctx.reply(`Your vote is active! Time remaining: ${hours}h ${minutes}m`);
  } else {
    ctx.reply('You have not voted yet. Vote at https://top.tl/mybot');
  }
});
```

## Options

```ts
bot.use(toptl(client, 'mybot', {
  autopost: true,        // Auto-post stats (default: true)
  interval: 1800,        // Post interval in seconds (default: 1800 = 30min)
  onlyOnChange: true,    // Skip posting if stats unchanged (default: true)
  trackGroups: true,     // Track group count (default: true)
  trackChannels: true,   // Track channel count (default: true)
}));
```

| Option | Type | Default | Description |
|---|---|---|---|
| `autopost` | `boolean` | `true` | Automatically post stats on an interval |
| `interval` | `number` | `1800` | Seconds between stat posts |
| `onlyOnChange` | `boolean` | `true` | Skip posting when stats have not changed |
| `trackGroups` | `boolean` | `true` | Count unique groups from updates |
| `trackChannels` | `boolean` | `true` | Count unique channels from updates |

## Context Flavor

Use `TopTLFlavor` to get type-safe access to `ctx.toptl`:

```ts
import { Context } from 'grammy';
import { TopTLFlavor } from 'toptl-grammy';

type MyContext = Context & TopTLFlavor;
```

### `ctx.toptl.hasVoted()`

Returns `Promise<boolean>` — whether the current user has an active vote.

### `ctx.toptl.isVoteActive()`

Returns `Promise<{ voted: boolean; timeLeft: number }>` — vote status and seconds remaining.

## Related

- [toptl](https://www.npmjs.com/package/toptl) — Core SDK for the TOP.TL API
- [TOP.TL](https://top.tl) — Telegram Bot List

## License

MIT - see [LICENSE](LICENSE)
