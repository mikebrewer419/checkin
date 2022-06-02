import React, {
  createContext
} from 'react'

export const TitleContext = createContext({
  title: '',
  setTitle: title => {}
})

export const ShowLoadingContext = createContext(null)