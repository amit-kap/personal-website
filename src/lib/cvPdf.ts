/* The downloadable CV lives in public/, built from cv.md by `npm run cv:pdf`
   (scripts/build-cv-pdf.mjs, which reads the name below). For a new file
   name, change it here and in the /cv redirect in public/_redirects. */
export const CV_PDF_NAME = 'Amit Kaplinsky CV 10-2026.pdf'
export const CV_PDF_URL = `${import.meta.env.BASE_URL}${encodeURIComponent(CV_PDF_NAME)}`
