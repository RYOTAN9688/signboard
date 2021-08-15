import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import produce from 'immer'
import { randomID, reorderPatch } from './util'
import { api, ColumnID, CardID } from './api'
import { Header as _Header } from './Header'
import { Column } from './Column'
import { DeleteDiaLog } from './DeleteDialog'
import { Overlay as _Overlay } from './Overlay'

export function App() {
  const dispatch = useDispatch()
  //stateが変化するたびに呼び出され、選択した値(filterValue)が変化すれば、コンポーネントが再レンダリングする
  const filterValue = useSelector(state => state.filterValue)
  const setFilterValue = (value: string) =>
    dispatch({ type: 'Filter.Setfilter', payload: { value } })

  const columns = useSelector(state => state.columns)
  const cardsOrder = useSelector(state => state.cardsOrder)

  const cardIsBeingDeleted = useSelector(state => Boolean(state.deletingCardID))
  const setDeletingCardID = (cardID: CardID) =>
    dispatch({ type: 'Card.SetDeletingCard', payload: { cardID } })
  const cancelDelete = () => dispatch({ type: 'Dialog.CancelDelete' })

  useEffect(() => {
    ;(async () => {
      const columns = await api('GET /v1/columns', null)
      dispatch({
        type: 'App.SetColumns',
        payload: {
          columns,
        },
      })
      const [unorderedCards, cardsOrder] = await Promise.all([
        api('GET /v1/cards', null),
        api('GET /v1/cardsOrder', null),
      ])
      console.log(unorderedCards)
      console.log(cardsOrder)

      dispatch({
        type: 'App.SetCards',
        payload: {
          cards: unorderedCards,
          cardsOrder,
        },
      })
    })()
  }, [dispatch])

  const draggingCardID = useSelector(state => state.draggingCardID)
  const setDraggingCardID = (cardID: CardID) =>
    dispatch({
      type: 'Card.StartDragging',
      payload: {
        cardID,
      },
    })
  const dropCardTo = (toID: CardID | ColumnID) => {
    const fromID = draggingCardID
    if (!fromID) return

    if (fromID === toID) return

    const patch = reorderPatch(cardsOrder, fromID, toID)

    dispatch({
      type: 'Card.Drop',
      payload: {
        toID,
      },
    })

    api('PATCH /v1/cardsOrder', patch)
  }

  const setText = (columnID: ColumnID, value: string) => {
    dispatch({
      type: 'InputForm.SetText',
      payload: {
        columnID,
        value,
      },
    })
  }

  const addCard = (columnID: ColumnID) => {
    const column = columns?.find(c => c.id === columnID)
    if (!column) return

    const text = column.text
    const cardID = randomID() as CardID

    dispatch({
      type: 'InputForm.ConfirmInput',
      payload: {
        columnID,
        cardID,
      },
    })

    api('POST /v1/cards', {
      id: cardID,
      text,
    })
  }

  return (
    <Container>
      <Header filterValue={filterValue} onFilterChange={setFilterValue} />
      <MainArea>
        <HorizontalScroll>
          {!columns ? (
            <Loading />
          ) : (
            columns.map(({ id: columnID, title, cards, text }) => (
              <Column
                key={columnID}
                title={title}
                filterValue={filterValue}
                cards={cards}
                onCardDragStart={cardID => setDraggingCardID(cardID)}
                onCardDrop={entered => dropCardTo(entered ?? columnID)}
                onCardDeleteClick={cardID => setDeletingCardID(cardID)}
                text={text}
                onTextChange={value => setText(columnID, value)}
                onTextConfirm={() => addCard(columnID)}
              />
            ))
          )}
        </HorizontalScroll>
      </MainArea>
      {cardIsBeingDeleted && (
        <Overlay onClick={cancelDelete}>
          <DeleteDiaLog />
        </Overlay>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
`
//styled(_Header)と書くことでHTML要素に対応したコンポーネント(styled.div)以外も
//スタイリングできる。スタイルの情報はclassName属性として渡される
const Header = styled(_Header)`
  flex-shrink: 0;
`

const MainArea = styled.div`
  height: 100%;
  padding: 16px 0;
  overflow-y: auto;
`
const HorizontalScroll = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;

  > * {
    margin-left: 16px;
    flex-shrink: 0;
  }

  ::after {
    display: block;
    flex: 0 0 16px;
    content: '';
  }
`
const Loading = styled.div.attrs({
  children: 'Loading...',
})`
  font-size: 14px;
`

const Overlay = styled(_Overlay)`
  display: flex;
  justify-content: center;
  align-items: center;
`
