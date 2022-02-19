import { getUser } from './services'

const user = getUser()

export const VERSION = 'v1.03'

const USER_TYPES = {
  SUPER_ADMIN: 'super_admin',
  CASTING_DIRECTOR: 'casting_director',
  SESSION_MANAGER: 'session_manager',
  CLIENT: 'client',
  TALENT: 'talent'
}

const USER_TYPE_TEXT = {
  [USER_TYPES.SUPER_ADMIN]: 'Super Admin',
  [USER_TYPES.CASTING_DIRECTOR]: 'Casting Director',
  [USER_TYPES.SESSION_MANAGER]: 'Session Manager',
  [USER_TYPES.CLIENT]: 'Client',
  [USER_TYPES.TALENT]: 'Talent',
}

const PROJECT_TYPES = {
  DEFAULT: 'default',
  CREATOR: 'creator'
}

const USER_TYPE = {
  IS_CLIENT: () => user.user_type === USER_TYPES.CLIENT,
  IS_SUPER_ADMIN: () => user.user_type === USER_TYPES.SUPER_ADMIN,
  CASTING_DIRECTOR: () => user.user_type === USER_TYPES.CASTING_DIRECTOR,
  SESSION_MANAGER: () => user.user_type === USER_TYPES.SESSION_MANAGER,
}

const VIDEO_REVIEW_PERMISSIONS = {
  CAN_ARCHIVE: () => {
    return [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR, USER_TYPES.SESSION_MANAGER].includes(user.user_type)
  },
  CAN_ADD_VIDEO: () => {
    return [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR, USER_TYPES.SESSION_MANAGER].includes(user.user_type)
  },
  CAN_VIEW_ARCHIVE: () => {
    return [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR, USER_TYPES.SESSION_MANAGER].includes(user.user_type)
  },
  CAN_UPDATE_GROUP: () => {
    return [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR, USER_TYPES.SESSION_MANAGER].includes(user.user_type)
  },
  CAN_LEAVE_FEEDBACK: () => {
    return [USER_TYPES.CLIENT].includes(user.user_type)
  }
}

const STUDIO_LIST_PERMISSIONS = {
  CAN_VIEW_ONBOARD: () => {
    return [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR, USER_TYPES.SESSION_MANAGER].includes(user.user_type)
  },
  CAN_VIEW_CLIENTPAGE: () => {
    return [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR, USER_TYPES.SESSION_MANAGER].includes(user.user_type)
  },
  CAN_VIEW_VIDEO_REVIEW: () => {
    return [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR, USER_TYPES.SESSION_MANAGER, USER_TYPES.CLIENT].includes(user.user_type)
  },
  CAN_CREATE_STUDIO: () => {
    return [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR].includes(user.user_type)
  },
  CAN_ARCHIVE_STUDIO: () => {
    return [USER_TYPES.SUPER_ADMIN].includes(user.user_type)
  }
}

const POSTINGPAGE_PERMISSIONS = {
  CAN_SORT_GROUPS: () => {
    return [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR, USER_TYPES.SESSION_MANAGER].includes(user.user_type)
  },
  CAN_ARCHIVE: () => {
    return [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR, USER_TYPES.SESSION_MANAGER].includes(user.user_type)
  },
  CAN_ADD_VIDEO: () => {
    return [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR, USER_TYPES.SESSION_MANAGER].includes(user.user_type)
  },
  CAN_VIEW_ARCHIVE: () => {
    return [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR, USER_TYPES.SESSION_MANAGER].includes(user.user_type)
  },
  CAN_VIEW_CONTACT: () => {
    return [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR, USER_TYPES.SESSION_MANAGER].includes(user.user_type)
  },
  CAN_UPDATE_GROUP: () => {
    return [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR, USER_TYPES.SESSION_MANAGER].includes(user.user_type)
  },
  CAN_LEAVE_FEEDBACK: () => {
    return [USER_TYPES.CLIENT, USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR, USER_TYPES.SESSION_MANAGER].includes(user.user_type)
  }
}

const SESSION_TIME_TYPE = [
  '1st call',
  'Callback'
]

const MEETING_HOST = process.env.REACT_APP_MEETING_HOST

const TINYMCE_KEY = process.env.REACT_APP_TINYMCE_KEY

const WS_HOST = process.env.REACT_APP_WS_HOST

export {
  USER_TYPES,
  USER_TYPE,
  USER_TYPE_TEXT,
  VIDEO_REVIEW_PERMISSIONS,
  STUDIO_LIST_PERMISSIONS,
  POSTINGPAGE_PERMISSIONS,
  MEETING_HOST,
  TINYMCE_KEY,
  WS_HOST,
  PROJECT_TYPES,
  SESSION_TIME_TYPE
}
