import path from 'path'
import { promises as fsP } from 'fs'

type Cache = { [key: string]: { expiry: number; data: string } }

export class CacheHandler {
  protected cache: Cache = {}
  private cacheFile: string
  private cacheDir: string

  constructor(cacheFile: string) {
    this.cacheFile = cacheFile
    this.cacheDir = path.dirname(cacheFile)
    this.readCache()
  }

  protected async dumpCache() {
    this.makeCacheDir()

    try {
      await fsP.writeFile(this.cacheFile, JSON.stringify(this.cache), { encoding: 'utf-8' })
    } catch (e) {
      console.error('Failed to write to LastFM cache at', this.cacheFile, e)
    }
  }

  protected async readCache() {
    this.makeCacheDir()

    try {
      const data = await fsP.readFile(this.cacheFile, { encoding: 'utf-8' })
      this.cache = JSON.parse(data)
    } catch (e) {
      console.warn(
        'Cache file',
        this.cacheFile,
        'does not exists (This may happen if the app is run for the first time).'
      )
    }
  }

  protected async addToCache(url: string, data: string) {
    try {
      if (JSON.parse(data)) {
        const expiry = Date.now() + 2 * 60 * 60 * 1000
        this.cache[url] = { expiry, data }
        await this.dumpCache()
      }
    } catch (e) {
      console.warn('Recommendation data is invalid')
    }
  }

  protected getCache(url: string): string | undefined {
    const data = this.cache[url]
    if (data && data.expiry > Date.now()) {
      return data.data
    }
  }

  private async makeCacheDir() {
    try {
      await fsP.access(this.cacheDir)
    } catch (_) {
      await fsP.mkdir(this.cacheDir, { recursive: true })
    }
  }
}
