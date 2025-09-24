'use client';

import type { PropsWithChildren } from 'react';

type FormCardProps = PropsWithChildren<{
  isActive: boolean;
}>;

const baseStyle =
  'bg-white rounded-lg p-5 w-[90%] shadow-lg text-center transition-opacity duration-500 ease-in-out max-w-md';
const activeStyle = 'opacity-100';
const inactiveStyle = 'opacity-0 hidden';

export default function FormCard({ isActive, children }: FormCardProps) {
  return <div className={`${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}>{children}</div>;
}

