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
  btInfo: {
    link: string
    userName: string
    password: string
    ipList: Array<Array<string>>
  }
  themeList: Array<string>
  loginInfo: {
    username: string
    password: string
    rememberPwd: boolean
  }
}
