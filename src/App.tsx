import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { api } from './api'
import { Header as _Header } from './Header'
import { Column } from './Column'
import { DeleteDiaLog } from './DeleteDialog'
import { Overlay as _Overlay } from './Overlay'

export function App() {
  const dispatch = useDispatch()

  const columns = useSelector(state => state.columns)

  const cardIsBeingDeleted = useSelector(state => Boolean(state.deletingCardID))

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

  return (
    <Container>
      <Header />
      <MainArea>
        <HorizontalScroll>
          {!columns ? (
            <Loading />
          ) : (
            columns.map(({ id: columnID, title, cards }) => (
              <Column
                id={columnID}
                key={columnID}
                title={title}
                cards={cards}
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
