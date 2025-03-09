import { randomUUID } from 'crypto'

export class AcountDto {
  id = randomUUID()
  name = ''
  proxy = ''
  username = ''
  password = ''
  gmail = ''
  outlook = ''
  passGmail = ''
  passOutlook = ''
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
