import moment from 'moment'

export const formatTime = (time) => {
  const date = moment(new Date(time).toLocaleString("en-US", {timeZone: "America/Los_Angeles"}))
  if (date.isValid())
    return date.format('M/D/YYYY H:mm: a')
  return ''
}

export const formatHour = (time) => {
  const date = moment(new Date(time).toLocaleString("en-US", {timeZone: "America/Los_Angeles"}))
  if (date.isValid())
    return date.format('H:mm: a')
  return ''
}
