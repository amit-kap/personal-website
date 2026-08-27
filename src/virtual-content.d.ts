/* Supplied by the `virtual:content` plugin in vite.config.ts, which parses
   every markdown source under src/content at build time. */
declare module 'virtual:content' {
  import type { ParsedCV, ParsedWork, ParsedCaseStudy } from '@/lib/parseContent'
  const content: {
    cv: ParsedCV
    works: ParsedWork[]
    caseStudies: ParsedCaseStudy[]
  }
  export default content
}
