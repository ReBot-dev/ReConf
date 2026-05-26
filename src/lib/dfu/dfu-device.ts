/*
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <https://www.gnu.org/licenses/>.
 */

import {
  DFU_Request,
  DFU_State,
  DFU_Status,
  type DFU_StatusResponse,
} from "./dfu"

export class DFUDeviceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DFUDeviceError"
  }
}

export type DFUFlashOptions = {
  transferSize?: number
  onProgress?: (bytesSent: number, totalBytes: number) => void
}

export class DFUDevice {
  #device: USBDevice
  #interfaceNumber: number

  constructor(device: USBDevice, interfaceNumber: number) {
    this.#device = device
    this.#interfaceNumber = interfaceNumber
  }

  async open() {
    await this.#device.open()
    await this.#device.claimInterface(this.#interfaceNumber)
  }

  async close() {
    try {
      await this.#device.releaseInterface(this.#interfaceNumber)
      await this.#device.close()
    } catch {
      // Device may already be disconnected after manifest
    }
  }

  async getStatus(): Promise<DFU_StatusResponse> {
    const result = await this.#device.controlTransferIn(
      {
        requestType: "class",
        recipient: "interface",
        request: DFU_Request.GETSTATUS,
        value: 0,
        index: this.#interfaceNumber,
      },
      6,
    )
    if (!result.data || result.data.byteLength < 6) {
      throw new DFUDeviceError("Failed to get DFU status")
    }
    const data = result.data
    return {
      status: data.getUint8(0) as DFU_Status,
      pollTimeout:
        data.getUint8(1) | (data.getUint8(2) << 8) | (data.getUint8(3) << 16),
      state: data.getUint8(4) as DFU_State,
    }
  }

  async clearStatus() {
    await this.#device.controlTransferOut({
      requestType: "class",
      recipient: "interface",
      request: DFU_Request.CLRSTATUS,
      value: 0,
      index: this.#interfaceNumber,
    })
  }

  async download(blockNum: number, data: ArrayBuffer) {
    await this.#device.controlTransferOut(
      {
        requestType: "class",
        recipient: "interface",
        request: DFU_Request.DNLOAD,
        value: blockNum,
        index: this.#interfaceNumber,
      },
      data,
    )
  }

  async abort() {
    await this.#device.controlTransferOut({
      requestType: "class",
      recipient: "interface",
      request: DFU_Request.ABORT,
      value: 0,
      index: this.#interfaceNumber,
    })
  }

  async #pollUntilIdle() {
    let status = await this.getStatus()
    while (status.state === DFU_State.dfuDNBUSY) {
      if (status.pollTimeout > 0) {
        await new Promise((r) => setTimeout(r, status.pollTimeout))
      }
      status = await this.getStatus()
    }
    return status
  }

  async #ensureIdle() {
    let status = await this.getStatus()
    if (status.state === DFU_State.dfuERROR) {
      await this.clearStatus()
      status = await this.getStatus()
    }
    if (status.state !== DFU_State.dfuIDLE) {
      await this.abort()
      status = await this.getStatus()
    }
    if (status.state !== DFU_State.dfuIDLE) {
      throw new DFUDeviceError(
        `Cannot enter dfuIDLE state (current: ${DFU_State[status.state]})`,
      )
    }
  }

  async flash(firmware: ArrayBuffer, options: DFUFlashOptions = {}) {
    const { transferSize = 2048, onProgress } = options
    const totalBytes = firmware.byteLength

    await this.#ensureIdle()

    let bytesSent = 0
    let blockNum = 0

    while (bytesSent < totalBytes) {
      const chunkSize = Math.min(transferSize, totalBytes - bytesSent)
      const chunk = firmware.slice(bytesSent, bytesSent + chunkSize)

      await this.download(blockNum, chunk)
      const status = await this.#pollUntilIdle()

      if (
        status.state !== DFU_State.dfuDNLOAD_IDLE &&
        status.state !== DFU_State.dfuIDLE
      ) {
        throw new DFUDeviceError(
          `Unexpected state after download: ${DFU_State[status.state]} (status: ${DFU_Status[status.status]})`,
        )
      }

      bytesSent += chunkSize
      blockNum++
      onProgress?.(bytesSent, totalBytes)
    }

    // Send zero-length download to signal end
    await this.download(blockNum, new ArrayBuffer(0))

    try {
      const status = await this.#pollUntilIdle()
      if (
        status.state !== DFU_State.dfuMANIFEST_WAIT_RESET &&
        status.state !== DFU_State.dfuIDLE &&
        status.state !== DFU_State.dfuMANIFEST
      ) {
        throw new DFUDeviceError(
          `Unexpected final state: ${DFU_State[status.state]}`,
        )
      }
    } catch {
      // Some devices disconnect immediately after manifest — this is expected
    }
  }
}
