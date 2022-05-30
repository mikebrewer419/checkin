import moment from 'moment-timezone'

export const browserTimeZone = moment.tz.guess()

export const formatTime = (time, format = 'M/D/YYYY h:mm: a', timezone = browserTimeZone) => {
  const date = moment.tz(new Date(time), timezone)
  if (date.isValid())
    return date.format(format)
  return ''
}

export const formatHour = (time, format = 'H:mm: a', timezone = browserTimeZone) => {
  const date = moment.tz(new Date(time), timezone)
  if (date.isValid())
    return date.format(format)
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

export const humanFileSize = (bytes, si=false, dp=1) => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si 
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}

export const mobileSafariCheck = () => {
  const ua = window.navigator.userAgent
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)
  const webkit = !!ua.match(/WebKit/i)
  const iOSSafari = iOS && webkit
  return iOSSafari
}

export const mobileChromeCheck = () => {
  const ua = window.navigator.userAgent
  const isAndroid = ua.toLowerCase().indexOf("android") > -1
  return isAndroid
}

export const copyUrl = (data) => {
  const copyText = document.querySelector('#urlInput')
  copyText.value = data || window.location.href
  copyText.select()
  copyText.setSelectionRange(0, 99999)
  navigator.clipboard.writeText(copyText.value)
}

export const obj2Query = (obj) => {
  const str = [];
  for (let p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

export const toggleLoadingState = (state) => {
  if (state) {
    document.querySelector('.loading').classList.add('show')
  } else {
    document.querySelector('.loading').classList.remove('show')
  }
}

export const injectIntercom = (user, hideLauncher = true) => {
  let params = {}
  if (user) {
    params = {
      name: user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.email,
      email: user.email,
    }
  }
  window.intercomSettings = {
    api_base: "https://api-iam.intercom.io",
    app_id: "i0bdpyuo",
    hide_default_launcher: hideLauncher,
    ...params
  };
  window.Intercom('update')
  if (window.Intercom && hideLauncher) {
    window.Intercom('show')
  }
}

export const getUserText = (user) => {
  if (!user) return ''
  if (user.first_name) {
    return `${user.first_name} ${user.last_name} (${user.email}) ${user.user_type}`
  }
  return `${user.email} ${user.user_type}`
}
