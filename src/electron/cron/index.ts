import { tikokCron } from './tiktok.cron'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cron = require("node-cron");
export function registerCronJob(){
  cron.schedule("* * * * *", tikokCron)
}
