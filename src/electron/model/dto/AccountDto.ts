import { v4 as idv4 } from 'uuid'
export class AcountDto {
  id = idv4()
  name = ''
  proxy = ''
  username = ''
  password = ''
  email = ''
  passEmail = ''
  emailRecover = ''
  pwdEmailRecover = ''
  folder = ''
  isSelected = false

  static init = (src?: Partial<AcountDto>): AcountDto => {
    const obj = new AcountDto()
    return {
      ...obj,
      ...src,
    }
  }
}
