import { DashboardTheme, ThemeColors } from '../types';

export const THEMES: Record<DashboardTheme, ThemeColors> = {
  'neon-blue': {
    name: 'Electric Neon Blue',
    id: 'neon-blue',
    primary: '#00e5ff',
    glow: 'rgba(0, 229, 255, 0.45)',
    glowRgba: '0, 229, 255',
    needle: '#ff3344',
    accent: '#00b0ff',
  },
  'amber': {
    name: 'Classic Amber',
    id: 'amber',
    primary: '#ff9900',
    glow: 'rgba(255, 153, 0, 0.5)',
    glowRgba: '255, 153, 0',
    needle: '#ff2200',
    accent: '#ffb300',
  },
  'cyber-red': {
    name: 'Sport Track Red',
    id: 'cyber-red',
    primary: '#ff1744',
    glow: 'rgba(255, 23, 68, 0.5)',
    glowRgba: '255, 23, 68',
    needle: '#ffffff',
    accent: '#d50000',
  },
  'ice-white': {
    name: 'Polar Ice White',
    id: 'ice-white',
    primary: '#e0f7fa',
    glow: 'rgba(224, 247, 250, 0.4)',
    glowRgba: '224, 247, 250',
    needle: '#00e5ff',
    accent: '#ffffff',
  },
};
