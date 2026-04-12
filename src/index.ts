import { TopTL } from '@toptl/sdk';

interface TopTLFlavor {
  toptl: {
    hasVoted: () => Promise<boolean>;
    isVoteActive: () => Promise<{ voted: boolean; timeLeft: number }>;
  };
}

interface TopTLPluginOptions {
  autopost?: boolean;       // default true
  interval?: number;        // default 1800 (30min)
  onlyOnChange?: boolean;   // default true
  trackGroups?: boolean;    // default true
  trackChannels?: boolean;  // default true
}

function toptl(client: TopTL, username: string, options?: TopTLPluginOptions) {
  const opts = { autopost: true, interval: 1800, onlyOnChange: true, trackGroups: true, trackChannels: true, ...options };

  const userIds = new Set<string>();
  const groupIds = new Set<string>();
  const channelIds = new Set<string>();
  let lastPosted = { users: 0, groups: 0, channels: 0 };
  let timer: ReturnType<typeof setInterval> | null = null;

  const postStats = async () => {
    const stats = {
      memberCount: userIds.size,
      groupCount: groupIds.size,
      channelCount: channelIds.size,
    };
    if (opts.onlyOnChange && stats.memberCount === lastPosted.users && stats.groupCount === lastPosted.groups && stats.channelCount === lastPosted.channels) return;
    try {
      const res = await client.postStats(username, stats);
      lastPosted = { users: stats.memberCount, groups: stats.groupCount, channels: stats.channelCount };
      if (res.retryAfter && timer) {
        clearInterval(timer);
        timer = setInterval(postStats, res.retryAfter * 1000);
      }
    } catch {}
  };

  if (opts.autopost) {
    timer = setInterval(postStats, opts.interval * 1000);
    setTimeout(postStats, 5000); // first post after 5s
  }

  // Return Grammy middleware
  return async (ctx: any, next: () => Promise<void>) => {
    // Track unique entities
    const chatId = ctx.chat?.id?.toString();
    const chatType = ctx.chat?.type;
    const userId = ctx.from?.id?.toString();

    if (userId) userIds.add(userId);
    if (chatId && (chatType === 'group' || chatType === 'supergroup')) groupIds.add(chatId);
    if (chatId && chatType === 'channel') channelIds.add(chatId);

    // Add toptl to context flavor
    ctx.toptl = {
      hasVoted: async () => {
        if (!userId) return false;
        const res = await client.hasVoted(username, userId);
        return (res as any).voted ?? (res as any).hasVoted ?? false;
      },
      isVoteActive: async () => {
        if (!userId) return { voted: false, timeLeft: 0 };
        return client.hasVoted(username, userId);
      },
    };

    await next();
  };
}

export { toptl, TopTLFlavor, TopTLPluginOptions };
export { TopTL } from '@toptl/sdk';
