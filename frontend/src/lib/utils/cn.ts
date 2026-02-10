/**
 * Tailwind CSS 클래스 병합 유틸리티
 * clsx와 tailwind-merge를 조합하여 최적의 클래스 처리
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS 클래스를 지능적으로 병합
 * - clsx로 조건부 클래스 처리
 * - tailwind-merge로 충돌하는 Tailwind 클래스 해결
 *
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 * cn('text-red-500', { 'text-blue-500': isBlue })
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export default cn;
