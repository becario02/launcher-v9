export function getFirstNameFromCookie() {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/(?:^|;\s*)fullname=([^;]+)/);
    if (!match) return '';
    const decoded = decodeURIComponent(match[1]);
    return decoded.split(' ')[0]; // Solo el primer nombre
  }
  