const paths: Record<string, string> = {
mark:'<circle cx="9" cy="10" r="6"/><circle cx="15" cy="14" r="6"/>',
leaf:'<path d="M19 4C9 2 3 8 7 15s14 0 12-11Z"/><path d="m4 21 10-12"/>',
shuffle:'<path d="m17 3 4 4-4 4M3 17h3c5 0 7-10 12-10h3M17 13l4 4-4 4M3 7h3c2 0 4 2 5 4m3 3c1 2 3 3 5 3h2"/>',
hint:'<path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z"/>',
plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',fit:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
check:'<path d="m5 12 4 4L19 6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',hand:'<path d="M8 13V6a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v8c0 5-3 7-7 7-3 0-5-2-7-5l-3-5a2 2 0 0 1 3-2l2 3Z"/>',
close:'<path d="m6 6 12 12M6 18 18 6"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3c-1 1-1 2-1 2m0 3h.01"/>',
};
export const icon = (name: string) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;
