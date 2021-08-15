import { Reducer } from 'redux'
import produce from 'immer'
import { sortBy } from './util'
import { CardID, ColumnID } from './api'

//コンポーネントがストアに向けてActionというメッセージを送り、
//reducerがそれに応じてStateを変化させる

//State型を定義する(アプリケーション全体の状態を規定する)
//App.tsxのState型に相当する
export type State = {
  filterValue: string
  columns?: {
    id: ColumnID
    title?: string
    text?: string
    cards?: {
      id: CardID
      text?: string
    }[]
  }[]
  cardsOrder: Record<string, CardID | ColumnID | null>
}
//initialStateにState型を定義する（アプリケーションの初期状態を定義）
const initialState: State = {
  filterValue: '',
  cardsOrder: {},
}

//Action型を定義する（状態を変更するメッセージ）
export type Action =
  | {
      type: 'Filter.Setfilter'
      payload: {
        value: string
      }
    }
  | {
      type: 'App.SetColumns'
      payload: {
        columns: {
          id: ColumnID
          title?: string
          text?: string
        }[]
      }
    }
  | {
      type: 'App.SetCards'
      payload: {
        cards: {
          id: CardID
          text?: string
        }[]
        cardsOrder: Record<string, CardID | ColumnID | null>
      }
    }

//Reducerは”前の状態から次の状態を計算する関数
//stateの変更はイミュータブル（作成後、その状態を変えることのできない状態にする）
//な操作である必要がある
export const reducer: Reducer<State, Action> = produce(
  (draft: State, action: Action) => {
    switch (action.type) {
      case 'Filter.Setfilter': {
        const { value } = action.payload

        draft.filterValue = value
        return
      }

      case 'App.SetColumns': {
        const { columns } = action.payload

        draft.columns = columns
        return
      }

      case 'App.SetCards': {
        const { cards: unorderedCards, cardsOrder } = action.payload

        draft.cardsOrder = cardsOrder
        draft.columns?.forEach(column => {
          column.cards = sortBy(unorderedCards, cardsOrder, column.id)
        })
        return
      }

      default: {
        const _: never = action
      }
    }
  },
  initialState,
)
