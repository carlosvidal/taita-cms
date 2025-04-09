// Notion-inspired design system

export const typography = {
  h1: 'text-3xl font-bold tracking-tight text-gray-900',
  h2: 'text-2xl font-semibold text-gray-800',
  h3: 'text-xl font-medium text-gray-800',
  h4: 'text-lg font-medium text-gray-700',
  body: 'text-base text-gray-600 leading-relaxed',
  small: 'text-sm text-gray-500'
}

export const colors = {
  light: {
    bg: 'bg-gray-50',
    surface: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    card: 'bg-white',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-100',
    focus: 'focus:ring-2 focus:ring-gray-200 focus:border-gray-300'
  },
  dark: {
    bg: 'bg-gray-900',
    surface: 'bg-gray-800',
    text: 'text-gray-100',
    textSecondary: 'text-gray-300',
    card: 'bg-gray-800',
    border: 'border-gray-700',
    hover: 'hover:bg-gray-700',
    focus: 'focus:ring-2 focus:ring-gray-600 focus:border-gray-500'
  },
  primary: {
    bg: 'bg-gray-800',
    text: 'text-white',
    hover: 'hover:bg-gray-900',
    focus: 'focus:ring-2 focus:ring-gray-700 focus:ring-offset-2'
  },
  secondary: {
    bg: 'bg-gray-200',
    text: 'text-gray-800',
    hover: 'hover:bg-gray-300',
    focus: 'focus:ring-2 focus:ring-gray-300 focus:ring-offset-2'
  },
  danger: {
    bg: 'bg-red-600',
    text: 'text-white',
    hover: 'hover:bg-red-700',
    focus: 'focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
  }
}

export const spacing = {
  section: 'py-8 px-6',
  card: 'p-6',
  button: 'px-4 py-2'
}

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-md',
  xl: 'shadow-lg',
  none: 'shadow-none'
}

export const rounded = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded',
  lg: 'rounded',
  xl: 'rounded-lg',
  full: 'rounded-full'
}

export const transitions = {
  default: 'transition-all duration-200 ease-in-out'
}