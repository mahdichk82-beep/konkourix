export type NavIconName = 'dashboard' | 'students' | 'planning' | 'reports' | 'settings'

const paths: Record<NavIconName, string> = {
  dashboard: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z',
  students: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21v-3a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v3H2Zm14-8a5 5 0 0 1 5 5v3h-3v-3a7 7 0 0 0-2-5Z',
  planning: 'M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm3 8h3v3H8v-3Z',
  reports: 'M5 20V10h3v10H5Zm6 0V4h3v16h-3Zm6 0v-7h3v7h-3Z',
  settings: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8 3.5 2-1.2-2-3.4-2.1.8a8 8 0 0 0-1.6-.9L16 5h-4l-.3 2.3c-.6.2-1.1.5-1.6.9L8 7.4l-2 3.4L8 12c0 .6.1 1.2.2 1.8L6 15l2 3.4 2.1-.8c.5.4 1 .7 1.6.9L12 21h4l.3-2.5c.6-.2 1.1-.5 1.6-.9l2.1.8 2-3.4-2.2-1.2c.1-.6.2-1.2.2-1.8Z',
}

export function NavIcon({ name }: { name: NavIconName }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={paths[name]} /></svg>
}
