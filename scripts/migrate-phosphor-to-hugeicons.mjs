#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const APP_DIR = path.join(ROOT, 'app')

const PH_TO_HUGE = {
  PhArrowClockwise: 'ArrowReloadHorizontalIcon',
  PhArrowLeft: 'ArrowLeft01Icon',
  PhArrowRight: 'ArrowRight01Icon',
  PhArrowSquareOut: 'LinkSquare01Icon',
  PhArrowsClockwise: 'ArrowReloadHorizontalIcon',
  PhArticle: 'News01Icon',
  PhBell: 'Notification01Icon',
  PhBookOpen: 'BookOpen01Icon',
  PhBookmarkSimple: 'Bookmark01Icon',
  PhBriefcase: 'Briefcase01Icon',
  PhBuildings: 'Building01Icon',
  PhCalendar: 'Calendar01Icon',
  PhCalendarBlank: 'Calendar01Icon',
  PhCalendarCheck: 'CalendarCheckIn01Icon',
  PhCalendarDots: 'Calendar03Icon',
  PhCalendarX: 'CalendarRemove01Icon',
  PhCamera: 'Camera01Icon',
  PhCaretDown: 'ArrowDown01Icon',
  PhCaretLeft: 'ArrowLeft01Icon',
  PhCaretRight: 'ArrowRight01Icon',
  PhCaretUp: 'ArrowUp01Icon',
  PhCaretUpDown: 'ArrowUpDownIcon',
  PhChatCircle: 'Message01Icon',
  PhChatCircleDots: 'Message02Icon',
  PhChatsCircle: 'MessageMultiple01Icon',
  PhCheck: 'Tick01Icon',
  PhCheckCircle: 'CheckmarkCircle01Icon',
  PhChecks: 'TickDouble01Icon',
  PhCircle: 'CircleIcon',
  PhCircleNotch: 'Loading03Icon',
  PhClipboard: 'ClipboardIcon',
  PhClipboardText: 'ClipboardIcon',
  PhClock: 'Clock01Icon',
  PhCloudArrowUp: 'CloudUploadIcon',
  PhCreditCard: 'CreditCardIcon',
  PhCurrencyDollar: 'Dollar01Icon',
  PhCurrencyEur: 'EuroIcon',
  PhCurrencyNgn: 'CurrencyIcon',
  PhDotsThree: 'MoreHorizontalIcon',
  PhDotsThreeVertical: 'MoreVerticalIcon',
  PhDownloadSimple: 'Download01Icon',
  PhEnvelope: 'Mail01Icon',
  PhEnvelopeSimple: 'Mail01Icon',
  PhEye: 'ViewIcon',
  PhEyeSlash: 'ViewOffIcon',
  PhFaders: 'Settings01Icon',
  PhFile: 'File01Icon',
  PhFilePlus: 'FileAddIcon',
  PhFileSearch: 'FileSearchIcon',
  PhFileText: 'File01Icon',
  PhFileX: 'FileRemoveIcon',
  PhFolder: 'Folder01Icon',
  PhFolderOpen: 'FolderOpenIcon',
  PhFolderPlus: 'FolderAddIcon',
  PhFunnel: 'FilterIcon',
  PhGearSix: 'Settings01Icon',
  PhGlobeHemisphereWest: 'GlobeIcon',
  PhGraduationCap: 'GraduationScrollIcon',
  PhHeadset: 'HeadsetIcon',
  PhHourglass: 'HourglassIcon',
  PhHouse: 'Home01Icon',
  PhIdentificationCard: 'IdentityCardIcon',
  PhImage: 'Image01Icon',
  PhInfo: 'InformationCircleIcon',
  PhListBullets: 'LeftToRightListBulletIcon',
  PhLock: 'SquareLock01Icon',
  PhLockSimple: 'SquareLock01Icon',
  PhLockSimpleOpen: 'SquareUnlock01Icon',
  PhMagnifyingGlass: 'Search01Icon',
  PhMapPin: 'Location01Icon',
  PhMegaphoneSimple: 'Megaphone01Icon',
  PhMinus: 'MinusSignIcon',
  PhNotebook: 'Notebook01Icon',
  PhPaperPlaneRight: 'SentIcon',
  PhPaperclip: 'Attachment01Icon',
  PhPencilSimple: 'PencilEdit01Icon',
  PhPencilSimpleLine: 'PencilEdit01Icon',
  PhPhone: 'CallIcon',
  PhPlay: 'PlayIcon',
  PhPlus: 'Add01Icon',
  PhPlusCircle: 'AddCircleIcon',
  PhRows: 'LayoutTwoRowIcon',
  PhScales: 'JusticeScale01Icon',
  PhSealCheck: 'CheckmarkBadge01Icon',
  PhShieldCheck: 'SecurityCheckIcon',
  PhSidebarSimple: 'SidebarLeftIcon',
  PhSignOut: 'Logout01Icon',
  PhSparkle: 'SparklesIcon',
  PhSpinnerGap: 'Loading03Icon',
  PhSquaresFour: 'LayoutGridIcon',
  PhStar: 'StarIcon',
  PhTable: 'TableIcon',
  PhTimer: 'Timer01Icon',
  PhTrash: 'Delete01Icon',
  PhTrayArrowDown: 'Download01Icon',
  PhTrendDown: 'ArrowDownRight01Icon',
  PhTrendUp: 'ArrowUpRight01Icon',
  PhUploadSimple: 'Upload01Icon',
  PhUser: 'UserIcon',
  PhUserCircle: 'UserCircleIcon',
  PhVideoCamera: 'Video01Icon',
  PhWarning: 'Alert01Icon',
  PhWarningCircle: 'AlertCircleIcon',
  PhX: 'Cancel01Icon',
  PhXCircle: 'CancelCircleIcon',
}

const LUCIDE_TO_KEY = {
  Check: 'check',
  CheckIcon: 'check',
  ChevronDown: 'caretDown',
  ChevronDownIcon: 'caretDown',
  ChevronUp: 'caretUp',
  ChevronUpIcon: 'caretUp',
  ChevronLeft: 'caretLeft',
  ChevronLeftIcon: 'caretLeft',
  ChevronRight: 'caretRight',
  ChevronRightIcon: 'caretRight',
  X: 'x',
  XIcon: 'x',
  Circle: 'circle',
  CircleIcon: 'circle',
  Dot: 'circle',
  MoreHorizontal: 'dotsThree',
  Search: 'magnifyingGlass',
  SearchIcon: 'magnifyingGlass',
  GripVertical: 'rows',
  Minus: 'minus',
  ArrowLeft: 'arrowLeft',
  ArrowRight: 'arrowRight',
  Apple: 'apple',
}

function phToKey(phName) {
  return phName.replace(/^Ph/, '').replace(/^[A-Z]/, c => c.toLowerCase())
}

function collectFiles(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', '.nuxt', '.output'].includes(entry.name))
        continue
      out.push(...collectFiles(full))
      continue
    }
    if (/\.(vue|ts)$/.test(entry.name))
      out.push(full)
  }
  return out
}

function generateAppIconsFile() {
  const hugeNames = [...new Set([...Object.values(PH_TO_HUGE), 'AppleIcon'])].sort()
  const keyEntries = [
    ...Object.entries(PH_TO_HUGE).map(([ph, huge]) => `  ${phToKey(ph)}: ${huge},`),
    '  apple: AppleIcon,',
  ]

  return `import {
  ${hugeNames.join(',\n  ')},
} from '@hugeicons/core-free-icons'

export type AppIconData = typeof ${hugeNames[0]}

export const appIcons = {
${keyEntries.join('\n')}
} as const satisfies Record<string, AppIconData>

export type AppIconName = keyof typeof appIcons

export function appIcon(name: AppIconName): AppIconData {
  return appIcons[name]
}

const TOKEN_ICON_MAP: Array<[string, AppIconName]> = [
  ['eye-off', 'eyeSlash'],
  ['eye_off', 'eyeSlash'],
  ['eye', 'eye'],
  ['loading', 'circleNotch'],
  ['arrow-path', 'circleNotch'],
  ['alert-circle', 'warningCircle'],
  ['alert_circle', 'warningCircle'],
  ['calendar-remove', 'calendarX'],
  ['calendar_remove', 'calendarX'],
  ['check-badge', 'sealCheck'],
  ['check_badge', 'sealCheck'],
  ['shield-check', 'shieldCheck'],
  ['shield_check', 'shieldCheck'],
  ['x-circle', 'xCircle'],
  ['x_circle', 'xCircle'],
  ['check-circle', 'checkCircle'],
  ['check_circle', 'checkCircle'],
  ['check', 'check'],
  ['information-circle', 'info'],
  ['information_circle', 'info'],
  ['chevron-down', 'caretDown'],
  ['chevron_down', 'caretDown'],
  ['chevron-right', 'caretRight'],
  ['chevron_right', 'caretRight'],
  ['video-camera', 'videoCamera'],
  ['video_camera', 'videoCamera'],
  ['phone', 'phone'],
  ['clock', 'clock'],
  ['notebook', 'notebook'],
  ['money', 'currencyDollar'],
  ['cancel', 'x'],
  ['file-not-found', 'fileX'],
  ['file_not_found', 'fileX'],
  ['apple', 'apple'],
  ['envelope', 'envelope'],
  ['info', 'info'],
  ['user-circle', 'userCircle'],
  ['user_circle', 'userCircle'],
  ['user', 'user'],
  ['map-pin', 'mapPin'],
  ['map_pin', 'mapPin'],
  ['briefcase', 'briefcase'],
  ['identification', 'identificationCard'],
  ['document-text', 'fileText'],
  ['document_text', 'fileText'],
  ['document', 'file'],
  ['photo', 'image'],
  ['image', 'image'],
  ['arrow-down-tray', 'trayArrowDown'],
  ['arrow_down_tray', 'trayArrowDown'],
  ['folder-plus', 'folderPlus'],
  ['folder_plus', 'folderPlus'],
  ['folder', 'folder'],
  ['cloud-arrow-up', 'cloudArrowUp'],
  ['cloud_arrow_up', 'cloudArrowUp'],
  ['ellipsis-vertical', 'dotsThreeVertical'],
  ['calendar-days', 'calendarDots'],
  ['calendar_days', 'calendarDots'],
  ['calendar', 'calendarBlank'],
  ['exclamation-triangle', 'warning'],
  ['exclamation_triangle', 'warning'],
  ['chat-bubble-left-ellipsis', 'chatsCircle'],
  ['chat_bubble_left_ellipsis', 'chatsCircle'],
  ['chat-bubble', 'chatCircle'],
  ['chat_bubble', 'chatCircle'],
  ['play', 'play'],
  ['banknotes', 'currencyDollar'],
  ['banknote', 'currencyDollar'],
  ['building-library', 'bookOpen'],
  ['building_library', 'bookOpen'],
  ['building-office', 'buildings'],
  ['building_office', 'buildings'],
  ['scale', 'scales'],
  ['academic-cap', 'graduationCap'],
  ['academic_cap', 'graduationCap'],
  ['paper-clip', 'paperclip'],
  ['paper_clip', 'paperclip'],
  ['table-cells', 'table'],
  ['table_cells', 'table'],
  ['trash', 'trash'],
  ['eye-slash', 'eyeSlash'],
  ['eye_slash', 'eyeSlash'],
  ['x-mark', 'x'],
  ['x_mark', 'x'],
  ['squares-2x2', 'squaresFour'],
  ['squares_2x2', 'squaresFour'],
  ['list-bullet', 'listBullets'],
  ['list_bullet', 'listBullets'],
  ['funnel', 'funnel'],
  ['bookmark', 'bookmarkSimple'],
  ['magnifying-glass', 'magnifyingGlass'],
  ['magnifying_glass', 'magnifyingGlass'],
  ['house', 'house'],
  ['home', 'house'],
  ['rows', 'rows'],
]

export function normalizeIconToken(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^i-(heroicons|hugeicons|lucide)-/, '')
    .replace(/^heroicons:/, '')
    .replace(/^ph:/, '')
}

export function resolveAppIconName(raw: string): AppIconName {
  const token = normalizeIconToken(raw)
  if (!token)
    return 'dotsThree'

  for (const [needle, iconName] of TOKEN_ICON_MAP) {
    if (token.includes(needle))
      return iconName
  }

  return 'dotsThree'
}

export function resolveAppIcon(raw: string): AppIconData {
  return appIcons[resolveAppIconName(raw)]
}
`
}

function ensureImports(source) {
  let next = source
  const needsAppIcons = /\bappIcons\.|\bAppIconData\b/.test(next)
  const needsAppIconComponent = /<AppIcon\b/.test(next) || /<PhIcon\b/.test(next)

  if (!needsAppIcons && !needsAppIconComponent)
    return next

  next = next.replace(/^import AppIcon from '@\/components\/AppIcon\.vue'\n/gm, '')
  next = next.replace(/^import \{ appIcons(?:, type AppIconData)? \} from '@\/lib\/app-icons'\n/gm, '')
  next = next.replace(/^import type \{ AppIconData \} from '@\/lib\/app-icons'\n/gm, '')

  const imports = []
  if (needsAppIconComponent)
    imports.push(`import AppIcon from '@/components/AppIcon.vue'`)
  if (needsAppIcons)
    imports.push(`import { appIcons${next.includes('AppIconData') ? ', type AppIconData' : ''} } from '@/lib/app-icons'`)

  if (imports.length === 0)
    return next

  const scriptMatch = next.match(/<script setup lang="ts">\n/)
  if (scriptMatch) {
    return next.replace('<script setup lang="ts">\n', `<script setup lang="ts">\n${imports.join('\n')}\n`)
  }

  return `${imports.join('\n')}\n${next}`
}

function migrateFile(filePath, content) {
  if (filePath.endsWith('app/lib/app-icons.ts'))
    return null

  let next = content
  const original = content

  next = next.replace(/import\s+(?:type\s+)?{[^}]*}\s+from\s+['"]@phosphor-icons\/vue['"]\s*\n/g, '')
  next = next.replace(/import\s+{[^}]*}\s+from\s+['"]lucide-vue-next['"]\s*\n/g, '')

  for (const [ph, key] of Object.entries(PH_TO_HUGE).map(([ph]) => [ph, phToKey(ph)])) {
    next = next.replace(new RegExp(`<${ph}(\\s|/>|>)`, 'g'), `<AppIcon :icon="appIcons.${key}"$1`)
    next = next.replace(new RegExp(`</${ph}>`, 'g'), '</AppIcon>')
    next = next.replace(new RegExp(`(?<![A-Za-z0-9_])${ph}(?![A-Za-z0-9_])`, 'g'), `appIcons.${key}`)
  }

  for (const [lucide, key] of Object.entries(LUCIDE_TO_KEY)) {
    next = next.replace(new RegExp(`<${lucide}(\\s|/>|>)`, 'g'), `<AppIcon :icon="appIcons.${key}"$1`)
    next = next.replace(new RegExp(`</${lucide}>`, 'g'), '</AppIcon>')
    next = next.replace(new RegExp(`(?<![A-Za-z0-9_])${lucide}(?![A-Za-z0-9_])`, 'g'), `appIcons.${key}`)
  }

  next = next.replace(/\s+weight="(?:duotone|bold|regular|fill|thin|light)"/g, '')
  next = next.replace(/\s+:weight="'(?:duotone|bold|regular|fill|thin|light)'"/g, '')

  next = next.replace(/import type \{ Component \} from ['"]vue['"]\n/g, '')
  next = next.replace(/\bComponent\b/g, (match, offset, str) => {
    const slice = str.slice(Math.max(0, offset - 30), offset + 20)
    if (/AppIconData|VueApp|defineComponent/.test(slice))
      return match
    return 'AppIconData'
  })

  next = ensureImports(next)

  return next === original ? null : next
}

function main() {
  fs.writeFileSync(path.join(APP_DIR, 'lib/app-icons.ts'), generateAppIconsFile())

  const files = collectFiles(APP_DIR)
  let migrated = 0
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    if (!content.includes('@phosphor-icons/vue') && !content.includes('lucide-vue-next') && !/\bPh[A-Z]/.test(content))
      continue
    const updated = migrateFile(file, content)
    if (updated) {
      fs.writeFileSync(file, updated)
      migrated++
      console.log('migrated', path.relative(ROOT, file))
    }
  }
  console.log(`Done. Migrated ${migrated} files.`)
}

main()
