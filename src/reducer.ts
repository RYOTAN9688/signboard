import { Reducer } from 'redux'
import produce from 'immer'
import { sortBy, reorderPatch } from './util'
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
  draggingCardID?: CardID
  deletingCardID?: CardID
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
  | {
      type: 'Card.SetDeletingCard'
      payload: {
        cardID: CardID
      }
    }
  | {
      type: 'Dialog.ConfirmDelete'
    }
  | {
      type: 'Dialog.CancelDelete'
    }
  | {
      type: 'Card.StartDragging'
      payload: {
        cardID: CardID
      }
    }
  | {
      type: 'Card.Drop'
      payload: {
        toID: CardID | ColumnID
      }
    }
  | {
      type: 'InputForm.SetText'
      payload: {
        columnID: ColumnID
        value: string
      }
    }
  | {
      type: 'InputForm.ConfirmInput'
      payload: {
        columnID: ColumnID
        cardID: CardID
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
      case 'Card.SetDeletingCard': {
        const { cardID } = action.payload

        draft.deletingCardID = cardID
        return
      }

      case 'Dialog.ConfirmDelete': {
        const cardID = draft.deletingCardID
        if (!cardID) return
        draft.deletingCardID = undefined
        //削除対象のcardを含むcolumnを見つける
        const column = draft.columns?.find(col =>
          col.cards?.some(c => c.id === cardID),
        )
        if (!column?.cards) return
        //削除対象のcardを含まないcard配列を作り、columns.cardに代入
        //card配列からcardを削除している
        column.cards = column.cards.filter(c => c.id !== cardID)
        //reorderPatch関数を使いcardsOrderの整合性を保つ
        const patch = reorderPatch(draft.cardsOrder, cardID)
        draft.cardsOrder = {
          ...draft.cardsOrder,
          ...patch,
        }
        return
      }

      case 'Dialog.CancelDelete': {
        draft.deletingCardID = undefined
        return
      }

      case 'Card.StartDragging': {
        const { cardID } = action.payload

        draft.draggingCardID = cardID
        return
      }

      case 'Card.Drop': {
        const fromID = draft.draggingCardID
        if (!fromID) return

        draft.draggingCardID = undefined

        const { toID } = action.payload
        if (fromID === toID) return
        //cardsOrderを更新
        const patch = reorderPatch(draft.cardsOrder, fromID, toID)
        draft.cardsOrder = {
          ...draft.cardsOrder,
          ...patch,
        }
        //未ソートのcard一覧を取得
        const unorderedCards = draft.columns?.flatMap(c => c.cards ?? []) ?? []
        draft.columns?.forEach(column => {
          //columnごとにcardを順序通り並べつつ、適切なcolumnに割り当てる
          column.cards = sortBy(unorderedCards, draft.cardsOrder, column.id)
        })
        return
      }
      case 'InputForm.SetText': {
        const { columnID, value } = action.payload

        const column = draft.columns?.find(c => c.id === columnID)
        if (!column) return

        column.text = value
        return
      }

      case 'InputForm.ConfirmInput': {
        const { columnID, cardID } = action.payload

        const column = draft.columns?.find(c => c.id === columnID)
        if (!column?.cards) return

        column.cards.unshift({
          id: cardID,
          text: column.text,
        })
        column.text = ''

        const patch = reorderPatch(
          draft.cardsOrder,
          cardID,
          draft.cardsOrder[columnID],
        )
        draft.cardsOrder = {
          ...draft.cardsOrder,
          ...patch,
        }
        return
      }

      default: {
        const _: never = action
      }
    }
  },
  initialState,
)
