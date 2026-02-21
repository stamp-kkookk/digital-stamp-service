/**
 * KKOOKK 포맷팅 유틸리티
 */

/**
 * 날짜를 한국 시간 형식으로 포맷 (HH:MM)
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 날짜를 한국 날짜 형식으로 포맷 (M월 D일)
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 날짜를 한국 날짜시간 형식으로 포맷 (YYYY년 M월 D일 HH:MM)
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 날짜를 한국 전체 날짜시간 형식으로 포맷 (M월 D일 HH:MM)
 */
export function formatFullDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 날짜를 짧은 날짜 형식으로 포맷 (YYYY.MM.DD)
 */
export function formatShortDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '.').replace(/\.$/, '');
}

/**
 * 전화번호 마스킹 (010-1234-5678 -> 010-****-5678, 01012345678 -> 010-****-5678)
 */
export function maskPhone(phone: string): string {
  if (!phone) return '010-****-0000';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
  }
  return phone.replace(/(\d{3})-\d{4}-(\d{4})/, '$1-****-$2');
}

/**
 * 전화번호에서 숫자만 추출
 */
export function stripPhoneToDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * 전화번호 자동 포맷 (3-4-4: 010-1234-5678)
 * 입력값에서 숫자만 추출하여 하이픈 포맷으로 변환
 */
export function formatPhoneNumber(value: string): string {
  const digits = stripPhoneToDigits(value);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

/**
 * 전화번호 입력에 숫자/하이픈/공백 외 문자가 포함되어 있는지 검사
 */
export function hasInvalidPhoneChars(value: string): boolean {
  return /[^\d\s-]/.test(value);
}

/**
 * 초를 MM:SS 카운트다운 형식으로 포맷
 */
export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 현재 시점 기준 상대 시간 계산 (예: "2시간 전")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
}

/**
 * 숫자를 로케일별 천 단위 구분자로 포맷
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

/**
 * 백분율 포맷
 */
export function formatPercent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
