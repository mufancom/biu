import Color from 'color';
import {ClassAttributes, DetailedHTMLProps, HTMLAttributes} from 'react';
import _styled, {
  InterpolationFunction,
  ThemedBaseStyledInterface,
  ThemedCssFunction,
  ThemedStyledFunction as _ThemedStyledFunction,
  ThemedStyledProps,
  css as _css,
} from 'styled-components';

const light = new Color('#fff');
const dark = new Color('#000');

const accent = new Color('#409eff');
const darkerAccent = new Color('#298df4');
const alertAccent = new Color('#e6a23c');
const dangerAccent = new Color('#f56c6c');
const greenAccent = new Color('#67c23a');
const safeAccent = new Color('#5fc300');

const gray = new Color('#909399');

type LightnessModifier = (lightness?: number) => string;

function createLightnessModifier(color: Color): LightnessModifier {
  return (lightness = 0): string => {
    let modified =
      lightness >= 0
        ? color.mix(light, lightness)
        : color.mix(dark, -lightness);

    return modified.hex();
  };
}

const accentLightnessModifier = createLightnessModifier(accent);
const darkerAccentLightnessModifier = createLightnessModifier(darkerAccent);
const alertAccentLightnessModifier = createLightnessModifier(alertAccent);
const dangerAccentLightnessModifier = createLightnessModifier(dangerAccent);
const greenAccentLightnessModifier = createLightnessModifier(greenAccent);
const safeAccentLightnessModifier = createLightnessModifier(safeAccent);
const grayLightnessModifier = createLightnessModifier(gray);

export const theme = {
  accent: accentLightnessModifier,
  darkerAccent: darkerAccentLightnessModifier,
  alertAccent: alertAccentLightnessModifier,
  dangerAccent: dangerAccentLightnessModifier,
  greenAccent: greenAccentLightnessModifier,
  safeAccent: safeAccentLightnessModifier,
  gray: grayLightnessModifier,
  light: light.hex(),
  washedOutBlack: '#31363D',
  text: {
    navPrimary: '#333',
    navRegular: '#444',
    navSecondary: '#999',
    navPlaceholder: '#888',
    primary: '#303133',
    regular: '#5e6d82',
    secondary: '#909399',
    placeholder: '#C0C4CC',
    hint: '#c8c8c8',
  },
  border: {
    base: '#dcdfe6',
    light: '#e4e7ed',
    lighter: '#ebfef5',
    extraLight: '#f2f6fc',
  },
  bar: {
    green: '#B8EB9F',
    yellow: '#FCEAAF',
    gray: '#E5E5E5',
  },
};

export type StyledWrapperProps<T = HTMLDivElement> = DetailedHTMLProps<
  HTMLAttributes<T>,
  T
>;

export type Theme = typeof theme;

export type ThemedStyledFunction<P, T = HTMLElement> = _ThemedStyledFunction<
  ClassAttributes<T> & HTMLAttributes<T> & P,
  Theme,
  ClassAttributes<T> & HTMLAttributes<T> & P
>;

export type ThemedInterpolationFunction<P> = InterpolationFunction<
  ThemedStyledProps<P, Theme>
>;

export const styled = _styled as ThemedBaseStyledInterface<Theme>;
export const css = _css as ThemedCssFunction<Theme>;

export const lightLinkStyle = css`
  color: ${props => props.theme.light} !important;
  text-decoration: none !important;
  opacity: 0.9;

  &:hover {
    opacity: 1;
  }
`;
