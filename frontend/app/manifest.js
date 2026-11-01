// Makes the collector screen installable on a phone ("Add to home screen").
// There is no service worker yet, so the app is not usable offline (see docs/10-testing.md, limits).
export default function manifest() {
  return {
    name: 'Loop Eco',
    short_name: 'Loop Eco',
    description: 'منصة إدارة المخلفات وإعادة التدوير للشركات',
    start_url: '/',
    display: 'standalone',
    dir: 'rtl',
    lang: 'ar',
    background_color: '#f8fafc',
    theme_color: '#047857',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
