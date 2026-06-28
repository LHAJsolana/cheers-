export const presetComments = [
  "Elite order",
  "Hydrate, legend",
  "Wallet took damage",
  "Main character behavior",
  "That spot looks dangerous",
  "Respectfully chaotic",
] as const;

export type PresetComment = (typeof presetComments)[number];

export function isPresetComment(value: string): value is PresetComment {
  return presetComments.includes(value as PresetComment);
}
