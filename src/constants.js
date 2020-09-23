import { getUser } from './services'

const user = getUser()

const USER_TYPES = {
  SUPER_ADMIN: 'super_admin',
  CASTING_DIRECTOR: 'casting_director',
  SESSION_MANAGER: 'session_manager',
  CLIENT: 'client'
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
  }
}

export {
  USER_TYPES,
  VIDEO_REVIEW_PERMISSIONS,
  STUDIO_LIST_PERMISSIONS
}
