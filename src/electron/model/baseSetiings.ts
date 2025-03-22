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
  seedings: {
    seedingVideos: {
      numberOfStreams: number
      viewVideoTime: Array<number>
      idLists: string
    }

    buffFollow: {
      numberOfStreams: number
      viewVideoTime: Array<number>
      followAfterWatch: Array<number>
      idLists: string
    }
  }
}
