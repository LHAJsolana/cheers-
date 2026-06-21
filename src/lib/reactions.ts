import { ReactionType } from "@prisma/client";

export const reactionOptions: { type: ReactionType; label: string }[] = [
  { type: ReactionType.CHEERS, label: "🍻 Cheers" },
  { type: ReactionType.LEGENDARY, label: "🔥 Legendary" },
  { type: ReactionType.CHAOS, label: "😂 Chaos" },
  { type: ReactionType.RIP_TOMORROW, label: "💀 RIP Tomorrow" },
  { type: ReactionType.RESPECT, label: "🫡 Respect" },
];
