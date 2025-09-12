import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM dd, yyyy')
}

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM dd, yyyy • h:mm a')
}

export const formatRelativeDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (isToday(d)) {
    return 'Today'
  }
  
  if (isYesterday(d)) {
    return 'Yesterday'
  }
  
  return formatDistanceToNow(d, { addSuffix: true })
}

export const formatShortDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM dd')
} 