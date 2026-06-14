declare module 'html2pdf.js' {
  interface Html2Pdf {
    set(options: unknown): Html2Pdf;
    from(element: HTMLElement | Element | null): Html2Pdf;
    save(): Promise<void>;
  }
  const html2pdf: () => Html2Pdf;
  export default html2pdf;
}
