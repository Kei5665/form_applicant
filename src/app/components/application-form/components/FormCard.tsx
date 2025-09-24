'use client';

import type { PropsWithChildren } from 'react';

type FormCardProps = PropsWithChildren<{
  isActive: boolean;
}>;

const baseStyle =
  'bg-white rounded-2xl px-6 py-7 w-full shadow-2xl transition-all duration-500 ease-in-out absolute left-1/2 -translate-x-1/2 top-0';
const activeStyle = 'opacity-100 translate-y-0';
const inactiveStyle = 'opacity-0 translate-y-10 pointer-events-none';

export default function FormCard({ isActive, children }: FormCardProps) {
  return <div className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}>{children}</div>;
}

