import React, { useState } from 'react'
import styled from 'styled-components'
import produce from 'immer'
import { randomID } from './util'
import { Header as _Header } from './Header'
import { Column } from './Column'
import { DeleteDiaLog } from './DeleteDialog'
import { Overlay as _Overlay } from './Overlay'

export const App = () => {
  const [filterValue, setFilterValue] = useState('')
  //2つのidをculumnsの持ち主であるAppが管理する
  const [columns, setColumns] = useState([
    {
      id: 'A',
      title: 'TODO',
      text: '',
      cards: [
        { id: 'a', text: '朝食をとる🍞' },
        { id: 'b', text: 'SNSをチェックする🐦' },
        { id: 'c', text: '布団に入る(:3[___]' },
      ],
    },
    {
      id: 'B',
      title: 'DOing',
      text: '',
      cards: [
        { id: 'd', text: '顔を洗う👐' },
        { id: 'e', text: '歯を磨く🦷' },
      ],
    },
    {
      id: 'C',
      title: 'Waiting',
      text: '',
      cards: [],
    },
    {
      id: 'D',
      title: 'Done',
      text: '',
      cards: [{ id: 'f', text: '布団から出る(:3[___]' }],
    },
  ])

  const setText = (columnID: string, value: string) => {
    type Columns = typeof columns
    setColumns(
      produce((columns: Columns) => {
        const column = columns.find(c => c.id === columnID)
        if (!column) return

        column.text = value
      }),
    )
  }

  const addCard = (columnID: string) => {
    const cardID = randomID()

    type Columns = typeof columns
    setColumns(
      produce((columns: Columns) => {
        const column = columns.find(c => c.id === columnID)
        if (!column) return

        column.cards.unshift({
          id: cardID,
          text: column.text,
        })
        column.text = ''
      }),
    )
  }

  const [deletingCardID, setDeletingCardID] = useState<String | undefined>(
    undefined,
  )
  const deleteCard = () => {
    const cardID = deletingCardID
    if (!cardID) return

    setDeletingCardID(undefined)

    type Columns = typeof columns
    setColumns(
      produce((columns: Columns) => {
        const column = columns.find(col => col.cards.some(c => c.id === cardID))
        if (!column) return

        column.cards = column.cards.filter(c => c.id !== cardID)
      }),
    )
  }
  const [draggingCardID, setDraggingCardID] = useState<string | undefined>(
    undefined,
  )

  const dropCardTo = (toID: string) => {
    const fromID = draggingCardID
    if (!fromID) return
    setDraggingCardID(undefined)
    if (fromID === toID) return

    type Columns = typeof columns
    setColumns(
      produce((columns: Columns) => {
        const card = columns
          .flatMap(col => col.cards)
          .find(c => c.id === fromID)
        if (!card) return

        const fromColumn = columns.find(col =>
          col.cards.some(c => c.id === fromID),
        )
        if (!fromColumn) return

        fromColumn.cards = fromColumn.cards.filter(c => c.id !== fromID)

        const toColumn = columns.find(
          col => col.id === toID || col.cards.some(c => c.id === toID),
        )
        if (!toColumn) return
        let index = toColumn.cards.findIndex(c => c.id === toID)
        if (index < 0) {
          index = toColumn.cards.length
        }
        toColumn.cards.splice(index, 0, card)
      }),
    )
  }
  return (
    <Container>
      <Header filterValue={filterValue} onFilterChange={setFilterValue} />
      <MainArea>
        <HorizontalScroll>
          {columns.map(({ id: columnID, title, cards, text }) => (
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
          ))}
        </HorizontalScroll>
      </MainArea>
      {deletingCardID && (
        <Overlay onClick={() => setDeletingCardID(undefined)}>
          <DeleteDiaLog
            onConfirm={deleteCard}
            onCancel={() => setDeletingCardID(undefined)}
          />
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
const Overlay = styled(_Overlay)`
  display: flex;
  justify-content: center;
  align-items: center;
`
