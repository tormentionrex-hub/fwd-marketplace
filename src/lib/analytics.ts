interface GTagWindow extends Window {
  gtag?: (command: string, action: string, params?: Record<string, unknown> | { page_path: string }) => void;
}

export const logPageView = (url: string) => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    const customWindow = window as unknown as GTagWindow;
    if (typeof customWindow.gtag === 'function') {
      customWindow.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
        page_path: url,
      });
    }
  }
};

