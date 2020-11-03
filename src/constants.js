import { getUser } from './services'

const user = getUser()

const USER_TYPES = {
  SUPER_ADMIN: 'super_admin',
  CASTING_DIRECTOR: 'casting_director',
  SESSION_MANAGER: 'session_manager',
  CLIENT: 'client'
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
  }
}

export {
  USER_TYPES,
  USER_TYPE,
  VIDEO_REVIEW_PERMISSIONS,
  STUDIO_LIST_PERMISSIONS
}
