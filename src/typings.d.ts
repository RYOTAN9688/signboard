// https://parceljs.org/env.html
declare const process: Process

//インターフェイス　オブジェクトの型に名前をつけることができる

interface Process {
  env: {
    NODE_ENV: 'development' | 'production'
    API_ENDPOINT?: string
  }
}
