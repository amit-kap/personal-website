/* Icons from lucide.dev (lucide-static 0.468), inlined so the kit has no
   dependency. Stroke is set so the line draws ~1.4px on stage at any size. */
import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 12, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={(1.4 * 24) / size}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const ChevronDown = (p: P) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6"/>
  </Icon>
)

export const ChevronLeft = (p: P) => (
  <Icon {...p}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
)

export const ChevronRight = (p: P) => (
  <Icon {...p}>
    <path d="m9 18 6-6-6-6"/>
  </Icon>
)

export const ArrowUp = (p: P) => (
  <Icon {...p}>
    <path d="m5 12 7-7 7 7"/>
        <path d="M12 19V5"/>
  </Icon>
)

export const ArrowDown = (p: P) => (
  <Icon {...p}>
    <path d="M12 5v14"/>
        <path d="m19 12-7 7-7-7"/>
  </Icon>
)

export const Bell = (p: P) => (
  <Icon {...p}>
    <path d="M10.268 21a2 2 0 0 0 3.464 0"/>
        <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>
  </Icon>
)

export const Gear = (p: P) => (
  <Icon {...p}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
  </Icon>
)

export const Refresh = (p: P) => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M8 16H3v5"/>
  </Icon>
)

export const Kebab = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="1"/>
        <circle cx="12" cy="5" r="1"/>
        <circle cx="12" cy="19" r="1"/>
  </Icon>
)

export const AgentGlyph = (p: P) => (
  <Icon {...p}>
    <path d="M12 8V4H8"/>
        <rect width="16" height="12" x="4" y="8" rx="2"/>
        <path d="M2 14h2"/>
        <path d="M20 14h2"/>
        <path d="M15 13v2"/>
        <path d="M9 13v2"/>
  </Icon>
)

export const OpenDot = (p: P) => (
  <Icon {...p}>
    <path d="M10.1 2.182a10 10 0 0 1 3.8 0"/>
        <path d="M13.9 21.818a10 10 0 0 1-3.8 0"/>
        <path d="M17.609 3.721a10 10 0 0 1 2.69 2.7"/>
        <path d="M2.182 13.9a10 10 0 0 1 0-3.8"/>
        <path d="M20.279 17.609a10 10 0 0 1-2.7 2.69"/>
        <path d="M21.818 10.1a10 10 0 0 1 0 3.8"/>
        <path d="M3.721 6.391a10 10 0 0 1 2.7-2.69"/>
        <path d="M6.391 20.279a10 10 0 0 1-2.69-2.7"/>
  </Icon>
)

export const Building = (p: P) => (
  <Icon {...p}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
      <path d="M10 6h4"/>
      <path d="M10 10h4"/>
      <path d="M10 14h4"/>
      <path d="M10 18h4"/>
  </Icon>
)

export const ShieldAlert = (p: P) => (
  <Icon {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
      <path d="M12 8v4"/>
      <path d="M12 16h.01"/>
  </Icon>
)

export const Radar = (p: P) => (
  <Icon {...p}>
    <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/>
      <path d="M4 6h.01"/>
      <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/>
      <path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/>
      <path d="M12 18h.01"/>
      <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/>
      <circle cx="12" cy="12" r="2"/>
      <path d="m13.41 10.59 5.66-5.66"/>
  </Icon>
)

export const ClipboardCheck = (p: P) => (
  <Icon {...p}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="m9 14 2 2 4-4"/>
  </Icon>
)

export const Send = (p: P) => (
  <Icon {...p}>
    <path d="m5 12 7-7 7 7"/>
      <path d="M12 19V5"/>
  </Icon>
)

export const Close = (p: P) => (
  <Icon {...p}>
    <path d="M18 6 6 18"/>
      <path d="m6 6 12 12"/>
  </Icon>
)

export const Plus = (p: P) => (
  <Icon {...p}>
    <path d="M5 12h14"/>
      <path d="M12 5v14"/>
  </Icon>
)

export const Check = (p: P) => (
  <Icon {...p}>
    <path d="M20 6 9 17l-5-5"/>
  </Icon>
)

export const Menu = (p: P) => (
  <Icon {...p}>
    <line x1="4" x2="20" y1="12" y2="12"/>
      <line x1="4" x2="20" y1="6" y2="6"/>
      <line x1="4" x2="20" y1="18" y2="18"/>
  </Icon>
)

/* The Shift mark (src/content/experience/shift/icon.svg). The file is
   off-white for dark surfaces, so it takes the surrounding text colour here. */
export function ShiftMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.6474 0.0655084C10.805 -0.0218415 10.9994 -0.0218358 11.157 0.0655233L17.5492 3.60817C17.7924 3.74293 17.8754 4.0409 17.7347 4.27372C17.5939 4.50653 17.2827 4.58603 17.0396 4.45127L10.9021 1.04984L5.01771 4.31059V10.8333L11.157 14.2352C11.4001 14.37 11.4832 14.6679 11.3424 14.9008C11.2017 15.1336 10.8905 15.2131 10.6474 15.0784L4.2542 11.5357C4.09707 11.4486 4.00031 11.288 4.00031 11.1142V4.02972C4.00031 3.85589 4.09707 3.69523 4.2542 3.60816L10.6474 0.0655084Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M4.06847 3.78527C4.20917 3.55243 4.52037 3.47289 4.76354 3.60761L11.1567 7.1494C11.3999 7.28412 11.4829 7.58208 11.3422 7.81492C11.2015 8.04775 10.8903 8.1273 10.6472 7.99258L4.25402 4.45079C4.01085 4.31607 3.92777 4.01811 4.06847 3.78527Z" />
      <path d="M10.9019 7.57167V14.6561L17.2942 4.02989L10.9019 7.57167Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M17.6535 3.68513C17.8165 3.84085 17.8496 4.08269 17.7347 4.27372L11.3427 14.8992C11.2278 15.0903 10.993 15.1836 10.7705 15.1266C10.548 15.0697 10.3932 14.8766 10.3932 14.6561V7.57167C10.3932 7.39783 10.49 7.23717 10.6471 7.1501L17.0394 3.60831C17.2387 3.4979 17.4905 3.5294 17.6535 3.68513ZM11.4106 7.85256V12.8346L15.9059 5.36185L11.4106 7.85256Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M10.902 14.1692C11.1829 14.1692 11.4107 14.3873 11.4107 14.6563C11.4107 14.7548 11.3801 14.8474 11.3275 14.9241L8.14574 20.2133C8.00552 20.4464 7.69449 20.5266 7.45104 20.3923C7.20759 20.258 7.1239 19.9602 7.26413 19.7271L10.4603 14.414C10.4836 14.3752 10.5121 14.3402 10.5446 14.3096C10.6365 14.2228 10.7627 14.1692 10.902 14.1692Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M13.6578 9.09925C13.7985 8.86643 14.1097 8.78692 14.3529 8.92166L20.746 12.4643C20.9892 12.5991 21.0722 12.897 20.9315 13.1298C20.7908 13.3627 20.4796 13.4422 20.2364 13.3074L13.8433 9.76479C13.6001 9.63005 13.5171 9.33208 13.6578 9.09925Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M7.26413 19.7271C7.40485 19.4943 7.71657 19.4139 7.95974 19.5486L14.3529 23.0913C14.596 23.226 14.6791 23.524 14.5384 23.7568C14.3976 23.9896 14.0864 24.0692 13.8433 23.9344L7.45104 20.3923C7.20759 20.258 7.1239 19.9602 7.26413 19.7271Z" />
      <path d="M14.0981 23.5124L20.4912 19.9697V12.8853L14.0981 23.5124Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M20.6226 12.4148C20.8452 12.4717 20.9999 12.6648 20.9999 12.8853V19.9697C20.9999 20.1436 20.9032 20.3042 20.746 20.3913L14.3529 23.9339C14.1536 24.0444 13.9017 24.0129 13.7387 23.8571C13.5758 23.7014 13.5424 23.4603 13.6573 23.2693L20.0504 12.6422C20.1654 12.4511 20.4001 12.3578 20.6226 12.4148ZM15.4866 22.1802L19.9825 19.6889V14.7067L15.4866 22.1802Z" />
    </svg>
  )
}

export const Search = (p: P) => (
  <Icon {...p}>
    <path d="m21 21-4.34-4.34" />
    <circle cx="11" cy="11" r="8" />
  </Icon>
)

export const ChevronsUpDown = (p: P) => (
  <Icon {...p}>
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </Icon>
)

export const Columns = (p: P) => (
  <Icon {...p}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
    <path d="M15 3v18" />
  </Icon>
)

export const ChevronUp = (p: P) => (
  <Icon {...p}>
    <path d="m18 15-6-6-6 6" />
  </Icon>
)

export const ExternalLink = (p: P) => (
  <Icon {...p}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </Icon>
)

export const Info = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </Icon>
)

export const User = (p: P) => (
  <Icon {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
)

export const Mail = (p: P) => (
  <Icon {...p}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Icon>
)

export const Phone = (p: P) => (
  <Icon {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Icon>
)

export const PanelRight = (p: P) => (
  <Icon {...p}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M15 3v18" />
  </Icon>
)

export const PaperPlane = (p: P) => (
  <Icon {...p}>
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
    <path d="m21.854 2.147-10.94 10.939" />
  </Icon>
)

export const Inbox = (p: P) => (
  <Icon {...p}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </Icon>
)

export const Eye = (p: P) => (
  <Icon {...p}>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const Paperclip = (p: P) => (
  <Icon {...p}>
    <path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551" />
  </Icon>
)

export const MessageSquare = (p: P) => (
  <Icon {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Icon>
)

export const Gavel = (p: P) => (
  <Icon {...p}>
    <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
    <path d="m16 16 6-6" />
    <path d="m8 8 6-6" />
    <path d="m9 7 8 8" />
    <path d="m21 11-8-8" />
  </Icon>
)
