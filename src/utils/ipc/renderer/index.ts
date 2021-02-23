import { IpcRenderer } from 'electron'
import { IpcRendererEvent } from 'electron/renderer'
import { IpcRequest } from '../main'
import { v4 } from 'uuid'

class IpcRendererHolder {
  ipcRenderer: IpcRenderer

  constructor(renderer: IpcRenderer) {
    this.ipcRenderer = renderer
  }

  public send<T>(channel: string, request: IpcRequest): Promise<T> {
    if (!request.responseChannel) {
      request.responseChannel = v4()
    }
    this.ipcRenderer.send(channel, request)

    return new Promise((resolve) => {
      this.ipcRenderer.once(request.responseChannel!, (event, response) => resolve(response))
    })
  }

  public listen<T>(channel: string, callback: (event: IpcRendererEvent, ...args: T[]) => void) {
    this.ipcRenderer.on(channel, (event, ...args: any[]) => callback(event, ...args))
  }
}

export const ipcRendererHolder = new IpcRendererHolder(window.ipcRenderer)
