// 帶 HTTP 狀態碼的錯誤：service 拋出後，由 errorHandler 統一翻成回應。
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
