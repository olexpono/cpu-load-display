import * as os from 'os'

export default defineEventHandler((event) => {
    const cpus = os.cpus().length;
    return {
        timestamp: Date.now(),
        load: os.loadavg()[0] / cpus,
        cpus: cpus,
    }
})
  