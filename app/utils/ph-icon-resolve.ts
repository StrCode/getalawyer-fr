import type { Component } from 'vue'
import { Apple } from 'lucide-vue-next'
import {
  PhTrayArrowDown,
  PhBookOpen,
  PhBookmarkSimple,
  PhBriefcase,
  PhBuildings,
  PhCalendarBlank,
  PhCalendarDots,
  PhCalendarX,
  PhCaretDown,
  PhCaretRight,
  PhChatCircle,
  PhChatsCircle,
  PhCheck,
  PhCheckCircle,
  PhCircleNotch,
  PhClock,
  PhCloudArrowUp,
  PhCurrencyDollar,
  PhDotsThree,
  PhEnvelope,
  PhEye,
  PhEyeSlash,
  PhFile,
  PhFileText,
  PhFileX,
  PhFolder,
  PhFolderPlus,
  PhFunnel,
  PhGraduationCap,
  PhHouse,
  PhImage,
  PhIdentificationCard,
  PhInfo,
  PhListBullets,
  PhMagnifyingGlass,
  PhMapPin,
  PhNotebook,
  PhPaperclip,
  PhPhone,
  PhPlay,
  PhRows,
  PhScales,
  PhSealCheck,
  PhShieldCheck,
  PhSquaresFour,
  PhTable,
  PhTrash,
  PhUser,
  PhUserCircle,
  PhVideoCamera,
  PhWarning,
  PhWarningCircle,
  PhX,
  PhXCircle,
} from '@phosphor-icons/vue'

export function normalizePhIconToken(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^i-(heroicons|hugeicons|lucide)-/, '')
    .replace(/^heroicons:/, '')
    .replace(/^ph:/, '')
}

export function resolvePhIcon(raw: string): Component {
  const k = normalizePhIconToken(raw)
  if (!k)
    return PhDotsThree

  if (k.includes('eye-off') || k.includes('eye_off'))
    return PhEyeSlash
  if (k.includes('eye'))
    return PhEye

  if (k.includes('loading') || k === 'arrow-path')
    return PhCircleNotch
  if (k.includes('alert-circle') || k.includes('alert_circle'))
    return PhWarningCircle
  if (k.includes('calendar-remove') || k.includes('calendar_remove'))
    return PhCalendarX

  if (k.includes('check-badge') || k.includes('check_badge'))
    return PhSealCheck
  if (k.includes('shield-check') || k.includes('shield_check'))
    return PhShieldCheck

  if (k.includes('x-circle') || k.includes('x_circle'))
    return PhXCircle
  if (k.includes('check-circle') || k.includes('check_circle'))
    return PhCheckCircle
  if (k === 'check')
    return PhCheck

  if (k.includes('information-circle') || k.includes('information_circle'))
    return PhInfo

  if (k.includes('chevron-down') || k.includes('chevron_down'))
    return PhCaretDown
  if (k.includes('chevron-right') || k.includes('chevron_right'))
    return PhCaretRight

  if (k.includes('video-camera') || k.includes('video_camera'))
    return PhVideoCamera
  if (k.includes('phone'))
    return PhPhone

  if (k.includes('clock'))
    return PhClock

  if (k.includes('notebook'))
    return PhNotebook
  if (k.includes('money'))
    return PhCurrencyDollar
  if (k.includes('cancel'))
    return PhX
  if (k.includes('file-not-found') || k.includes('file_not_found'))
    return PhFileX

  if (k.includes('apple'))
    return Apple as unknown as Component

  if (k.includes('envelope'))
    return PhEnvelope
  if (k === 'info' || k.endsWith('-info'))
    return PhInfo

  if (k.includes('user-circle') || k.includes('user_circle'))
    return PhUserCircle
  if (k.includes('user'))
    return PhUser

  if (k.includes('map-pin') || k.includes('map_pin'))
    return PhMapPin
  if (k.includes('briefcase'))
    return PhBriefcase
  if (k.includes('identification'))
    return PhIdentificationCard

  if (k.includes('document-text') || k.includes('document_text'))
    return PhFileText
  if (k.includes('document'))
    return PhFile
  if (k.includes('photo') || k.includes('image'))
    return PhImage
  if (k.includes('arrow-down-tray') || k.includes('arrow_down_tray'))
    return PhTrayArrowDown
  if (k.includes('folder-plus') || k.includes('folder_plus'))
    return PhFolderPlus
  if (k.includes('folder'))
    return PhFolder
  if (k.includes('cloud-arrow-up') || k.includes('cloud_arrow_up'))
    return PhCloudArrowUp
  if (k.includes('ellipsis-vertical'))
    return PhDotsThree

  if (k.includes('calendar-days') || k.includes('calendar_days'))
    return PhCalendarDots
  if (k.includes('calendar'))
    return PhCalendarBlank

  if (k.includes('exclamation-triangle') || k.includes('exclamation_triangle'))
    return PhWarning

  if (k.includes('chat-bubble-left-ellipsis') || k.includes('chat_bubble_left_ellipsis'))
    return PhChatsCircle
  if (k.includes('chat-bubble') || k.includes('chat_bubble'))
    return PhChatCircle

  if (k.includes('play'))
    return PhPlay
  if (k.includes('banknotes') || k.includes('banknote'))
    return PhCurrencyDollar

  if (k.includes('building-library') || k.includes('building_library'))
    return PhBookOpen
  if (k.includes('building-office') || k.includes('building_office'))
    return PhBuildings

  if (k.includes('scale'))
    return PhScales
  if (k.includes('academic-cap') || k.includes('academic_cap'))
    return PhGraduationCap
  if (k.includes('paper-clip') || k.includes('paper_clip'))
    return PhPaperclip

  if (k.includes('table-cells') || k.includes('table_cells'))
    return PhTable
  if (k.includes('trash'))
    return PhTrash
  if (k.includes('eye-slash') || k.includes('eye_slash'))
    return PhEyeSlash
  if (k.includes('x-mark') || k.includes('x_mark'))
    return PhX

  if (k.includes('squares-2x2') || k.includes('squares_2x2'))
    return PhSquaresFour
  if (k.includes('list-bullet') || k.includes('list_bullet'))
    return PhListBullets
  if (k.includes('funnel'))
    return PhFunnel
  if (k.includes('bookmark'))
    return PhBookmarkSimple
  if (k.includes('magnifying-glass') || k.includes('magnifying_glass'))
    return PhMagnifyingGlass
  if (k === 'house' || k.includes('home'))
    return PhHouse
  if (k.includes('rows'))
    return PhRows

  return PhDotsThree
}
