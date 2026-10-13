/* The downloadable CV lives in public/. Rename the file there and update the
   name below, and the /cv redirect in public/_redirects, when a new version
   is exported. */
export const CV_PDF_NAME = 'Amit Kaplinsky CV 10-2026.pdf'
export const CV_PDF_URL = `${import.meta.env.BASE_URL}${encodeURIComponent(CV_PDF_NAME)}`
