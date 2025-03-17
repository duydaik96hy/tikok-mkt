export interface IAccount {
  id: string
  name: string
  username: string
  password: string
  email: string
  passEmail: string
  emailRecover: string
  pwdEmailRecover: string
  proxy?: string
  folder: string
  isSelected?: boolean
}

export interface IRightClickOption {
  value: string
  name: string
  icon: string
  showChild: boolean
  childs?: Array<{ name: string; value: string }>
}

export interface IUser {
  id?: string
  name: string
  email: string
  password: string
  avatar: string
  username: string
  phone: string
}
