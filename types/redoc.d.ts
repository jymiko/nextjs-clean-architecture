import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      redoc: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'spec-url'?: string;
          'expand-responses'?: string;
          'hide-download-button'?: string;
          'show-extensions'?: string;
          theme?: string;
        },
        HTMLElement
      >;
    }
  }
}
