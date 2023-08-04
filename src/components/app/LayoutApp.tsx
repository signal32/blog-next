import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';


export type PageWithLayout<P = {}> = NextPage<P> & {
  /** Define layout generator for this page */
  layout?: (page: ReactElement<P>, props: P) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: PageWithLayout;
};

export default function LayoutApp({ Component, pageProps }: AppPropsWithLayout) {
  const layout = Component.layout ?? ((page) => page)

  return (
    <div>
      { layout(<Component { ...pageProps } />, pageProps) }
    </div>
  );
}
