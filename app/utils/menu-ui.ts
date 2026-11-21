/**
 * The menu type, in one place: the website's menu, the dashboard's menu, the
 * Practice drop-down and the account menu all take their text from here, so a
 * change here changes every menu. (Full class strings, so Tailwind sees them.)
 *
 * The pairing follows Vercel's: 14px regular text in the secondary grey, black
 * on hover; the current page and menu items are black.
 */

/** A link in a bar: small, regular, grey; black on hover and when current. */
export const menuText = 'text-sm font-normal text-muted-foreground transition-colors duration-200 hover:text-foreground'

/** The panel a drop-down menu opens. */
export const menuPanel = 'rounded-xl border-border bg-card p-1.5 font-sans text-foreground shadow-widget'

/** One item in a drop-down menu. */
export const menuItem = 'min-h-10 cursor-pointer gap-3 rounded-md px-3 text-sm font-normal text-foreground focus:bg-muted focus:text-foreground [&_svg]:size-4 [&_svg]:text-muted-foreground focus:[&_svg]:text-foreground'

/** Text inside a trigger, such as the name on the account button. */
export const menuTriggerText = 'text-sm font-normal text-foreground'
