export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 
                 bg-brand-600 text-white px-4 py-2 rounded-md font-medium 
                 hover:bg-brand-700 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}