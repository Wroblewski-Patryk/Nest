import {
  resolveAuraPalette,
  resolveAuraVariant,
  uiTokens,
  type AuraVariant,
  type ModuleKey,
} from '@nest/shared-types';

export const mobileUiTokens = {
  surface: uiTokens.palette.surface,
  surfaceLow: uiTokens.palette.surfaceLow,
  surfaceHigh: uiTokens.palette.surfaceHigh,
  card: '#FFFEFB',
  ink: uiTokens.palette.ink,
  muted: uiTokens.palette.muted,
  accent: uiTokens.palette.accent,
  accentSoft: uiTokens.palette.accentSoft,
  outlineGhost: uiTokens.palette.outlineGhost,
  danger: uiTokens.palette.error,
};

export function getAuraVariant(moduleKey?: ModuleKey | string | null): AuraVariant {
  return resolveAuraVariant(moduleKey);
}

export function getAuraPalette(moduleKey?: ModuleKey | string | null): [string, string, string] {
  return resolveAuraPalette(getAuraVariant(moduleKey));
}
