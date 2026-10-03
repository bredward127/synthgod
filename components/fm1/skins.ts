import type { ColorId } from '@/data/store';

/** Panel finishes matching the five store colorways. */
export type Skin = {
  body: [string, string];
  label: string;
  keybed: string;
  key: string;
  keyLine: string;
  keyText: string;
  btnBlock: string;
  btn: string;
  btnText: string;
  lit: string;
  shadow: string;
};

export const SKINS: Record<ColorId, Skin> = {
  dark: { body: ['#404043', '#2e2e31'], label: '#d6d6d6', keybed: '#28282a', key: '#1d1d1f', keyLine: '#f4f4f4', keyText: '#e8e8e8', btnBlock: '#28282a', btn: '#1c1c1e', btnText: '#f4f4f4', lit: '#ff7a3d', shadow: 'rgb(0 0 0 / 0.55)' },
  orange: { body: ['#f66425', '#e9541a'], label: '#fff4ec', keybed: '#bb472d', key: '#c74b30', keyLine: '#3a1810', keyText: '#5a2214', btnBlock: '#bb472d', btn: '#c74a2f', btnText: '#6b2516', lit: '#ffffff', shadow: 'rgb(90 20 5 / 0.45)' },
  green: { body: ['#333336', '#252528'], label: '#d6d6d6', keybed: '#6acbb7', key: '#7ad6c3', keyLine: '#1b3d36', keyText: '#1b3d36', btnBlock: '#6acbb7', btn: '#7cd8c5', btnText: '#14352e', lit: '#ff5e1f', shadow: 'rgb(0 0 0 / 0.5)' },
  blue: { body: ['#f4f1ea', '#e8e4db'], label: '#3c4148', keybed: '#4a6a92', key: '#56789f', keyLine: '#1d3350', keyText: '#1b2f48', btnBlock: '#4a6a92', btn: '#587aa1', btnText: '#182b42', lit: '#ffffff', shadow: 'rgb(20 30 50 / 0.35)' },
  gray: { body: ['#ece6dc', '#ded7cc'], label: '#3a3a3a', keybed: '#3c3f43', key: '#46494d', keyLine: '#26282b', keyText: '#9a9da2', btnBlock: '#3c3f43', btn: '#45484c', btnText: '#a5a8ac', lit: '#ff7a3d', shadow: 'rgb(0 0 0 / 0.35)' },
};
