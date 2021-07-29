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

export const dataURLtoFile = (dataurl, filename) => {
 
  var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), 
      n = bstr.length, 
      u8arr = new Uint8Array(n)
      
  while(n--){
      u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new File([u8arr], filename, {type:mime})
}
