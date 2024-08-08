import i18n from '@app/configs/i18n'
import { LANGUAGES } from '@app/constants/i18n'
import type { RootState } from '@app/store'
import type { Language } from '@app/types'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export interface LocaleState {
  language: string
  languages: Language[]
}

const initialState: LocaleState = {
  language: i18n.options.lng || 'en',
  languages: LANGUAGES
}

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      const lng = action.payload
      const newDirection = lng === 'ar' ? 'rtl' : 'ltr'
      const currentDirection = document.documentElement.getAttribute('dir')

      if (newDirection !== currentDirection) {
        document.documentElement.setAttribute('dir', newDirection)
      }

      i18n.changeLanguage(lng)
      localStorage.setItem('lng', lng)
      document.documentElement.setAttribute('lang', lng)
      state.language = lng
    }
  }
})

// Selectors
export const selectLocale = (state: RootState) => state.locale

export const { setLanguage } = localeSlice.actions

export default localeSlice.reducer
