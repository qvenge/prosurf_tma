import { forwardRef } from 'react';
import styles from './Text.module.css';

import clsx from 'clsx';

import { Typography, type TypographyProps } from '../Typography';

export type TextProps = Omit<TypographyProps, 'plain'>

/**
 * Text component is designed for general-purpose text rendering,
 * offering a wide range of typographic options. It extends the Typography
 * component, inheriting its flexibility and styling capabilities.
 * This component is ideal for paragraphs, labels, or any textual content, providing
 * consistent styling across the application.
 */
export const Text = forwardRef(({
  weight,
  className,
  Component,
  ...restProps
}: TextProps, ref) => (
  <Typography
    ref={ref}
    {...restProps}
    weight={weight}
    className={clsx(styles.wrapper, className)}
    Component={Component || 'span'}
  />
));

