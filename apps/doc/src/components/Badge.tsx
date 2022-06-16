import React, { memo } from 'react';
import { FCC } from '../types';
import style from './Badge.module.css';

export const Badge: FCC<{ src: string; alt: string }> = memo(({ src, alt }) => {
  return <img className={style.space} src={src} alt={alt} />;
});
