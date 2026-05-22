// Icon set — minimal stroke icons (lucide-style). Single export: <Icon name size />.

const ICON_PATHS = {
  // nav
  dashboard:   'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  assets:      'M3 7l9-4 9 4-9 4-9-4zM3 12l9 4 9-4M3 17l9 4 9-4',
  planner:     'M3 4h18v4H3zM3 10h18v4H3zM3 16h18v4H3z',
  captions:    'M4 5h16v11H8l-4 4z',
  exporticon:  'M12 3v12M7 10l5 5 5-5M4 19h16',
  settings:    'M12 8a4 4 0 110 8 4 4 0 010-8zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.7 1.7 0 009 19.4a1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z',
  // ui
  search:      'M11 4a7 7 0 100 14 7 7 0 000-14zM16 16l4.5 4.5',
  plus:        'M12 5v14M5 12h14',
  close:       'M5 5l14 14M19 5L5 19',
  check:       'M5 12l5 5L20 6',
  chevdown:    'M6 9l6 6 6-6',
  chevright:   'M9 6l6 6-6 6',
  chevleft:    'M15 6l-6 6 6 6',
  upload:      'M12 16V4M7 9l5-5 5 5M5 20h14',
  download:    'M12 4v12M7 11l5 5 5-5M5 20h14',
  filter:      'M3 5h18l-7 9v6l-4-2v-4z',
  sparkles:    'M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z',
  refresh:     'M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5',
  video:       'M3 6h11v12H3zM14 9l6-3v12l-6-3',
  image:       'M3 4h18v16H3zM3 16l5-5 5 5 3-3 5 5M14 9a2 2 0 110-4 2 2 0 010 4z',
  calendar:    'M3 6h18v14H3zM7 3v6M17 3v6M3 11h18',
  clock:       'M12 7v5l3 3M12 3a9 9 0 100 18 9 9 0 000-18z',
  drive:       'M8 3l8 14M3 17h18M8 3h8l5 9h-8z',
  bell:        'M6 16V11a6 6 0 0112 0v5l2 2H4zM10 20a2 2 0 004 0',
  flame:       'M12 3c1 4 5 5 5 10a5 5 0 11-10 0c0-3 2-4 3-7 1 2 2 2 2-3z',
  link:        'M9 15l6-6M10 6l1-1a4 4 0 116 6l-1 1M14 18l-1 1a4 4 0 11-6-6l1-1',
  dot:         'M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0',
  edit:        'M4 20h4l11-11-4-4L4 16zM13 5l4 4',
  trash:       'M4 7h16M9 7V4h6v3M6 7v13h12V7M10 11v6M14 11v6',
  more:        'M5 12m-1 0a1 1 0 102 0 1 1 0 10-2 0M12 12m-1 0a1 1 0 102 0 1 1 0 10-2 0M19 12m-1 0a1 1 0 102 0 1 1 0 10-2 0',
  warning:     'M12 3l10 18H2zM12 10v5M12 18v.5',
  info:        'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v.5M11 12h1v5h1',
  drag:        'M9 6h.5M14.5 6h.5M9 12h.5M14.5 12h.5M9 18h.5M14.5 18h.5',
  copy:        'M8 8h11v13H8zM5 4h11v3M5 4v13h3',
  external:    'M14 4h6v6M20 4L10 14M19 13v7H4V5h7',
  arrowright:  'M5 12h14M13 5l7 7-7 7',
  arrowleft:   'M19 12H5M11 19l-7-7 7-7',
};

function Icon({ name, size = 16, color = 'currentColor', stroke = 1.6, style, fill = 'none' }) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'inline-block', verticalAlign: '-2px', ...style }}>
      <path d={d} />
    </svg>
  );
}

window.Icon = Icon;
