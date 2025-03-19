export enum IMethodType {
  Post = 'Post',
  Get = 'Get',
  Patch = 'Patch',
}

export enum IApiUrl {
  login = '/authentications/login',
  editUserInfo = '/users/',
}

export interface IBaseSettings {
  loginInfo: {
    username: string
    password: string
    rememberPwd: boolean
  }
}
