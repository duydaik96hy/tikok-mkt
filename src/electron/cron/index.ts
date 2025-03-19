// eslint-disable-next-line @typescript-eslint/no-require-imports
// const cron = require("node-cron");
import { launchTikTok } from './tiktok.cron'

export function registerCronJob() {
  launchTikTok('thangthuy723').then()
}
