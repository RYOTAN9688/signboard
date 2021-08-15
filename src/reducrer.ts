import { Reducer } from 'redux'
import produce from 'immer'

//コンポーネントがストアに向けてActionというメッセージを送り、
//reducerがそれに応じてStateを変化させる

//State型を定義する(アプリケーション全体の状態を規定する)
//App.tsxのState型に相当する
export type State = {}
//initialStateにState型を定義する（アプリケーションの初期状態を定義）
const initialState: State = {}

//Action型を定義する（状態を変更するメッセージ）
export type Action = {
  type: ''
}

//Reducerは”前の状態から次の状態を計算する関数
//stateの変更はイミュータブル（作成後、その状態を変えることのできない状態にする）
//な操作である必要がある
export const reducer: Reducer<State, Action> = produce(
  (draft: State, action: Action) => {},
  initialState,
)
