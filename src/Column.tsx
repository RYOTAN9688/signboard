import React, { useState } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import * as color from './color'
import { Card } from './Card'
import { PlusIcon } from './icon'
import { InputForm as _InputForm } from './InputForm'
import { CardID } from './api'

export function Column({
  title,
  cards: rawCards,
  onCardDrop,
  text,
  onTextChange,
  onTextConfirm,
  onTextCancel,
}: {
  title?: string
  cards?: {
    id: CardID
    text?: string
  }[]
  onCardDrop?(entered: CardID | null): void
  text?: string
  onTextChange?(value: string): void
  onTextConfirm?(): void
  onTextCancel?(): void
}) {
  const filterValue = useSelector(state => state.filterValue.trim())
  const keywords = filterValue.toLowerCase().split(/\s+/g) ?? []
  //配列内の要素が合格するかテスト。プール値を返す
  const cards = rawCards?.filter(({ text }) =>
    keywords?.every(w => text?.toLowerCase().includes(w)),
  )
  //カードの個数をカウントし、表示する
  const totalCount = rawCards?.length ?? -1

  //inputFormの表示・非表示を管理
  const [inputMode, setInputMode] = useState(false)
  const toggleInput = () => setInputMode(v => !v)
  const confirmInput = () => {
    onTextConfirm?.()
  }
  const cancelInput = () => {
    setInputMode(false)
    onTextCancel?.()
  }
  const draggingCardID = useSelector(state => state.draggingCardID)
  return (
    <Container>
      <Header>
        {totalCount >= 0 && <CountBadge>{totalCount}</CountBadge>}
        <ColumnName>{title}</ColumnName>

        <AddButton onClick={toggleInput} />
      </Header>

      {inputMode && (
        //textはColumnコンポーネントのstate
        //inputFormは入力があるたびonChangeに渡したsetTextを呼ぶ。
        //setTextを呼ぶとcolumnが再レンダリングしColumn関数が再び呼び出される
        //その時textの値はsetTextに渡した値で新しくなるので、inputFormは新しい値を表示する
        <InputForm
          value={text}
          onChange={onTextChange}
          onConfirm={confirmInput}
          onCancel={cancelInput}
        />
      )}
      {!cards ? (
        <Loading />
      ) : (
        <>
          {filterValue && <ResultCount>{cards.length} results</ResultCount>}
          <VerticalScroll>
            {cards.map(({ id }, i) => (
              <Card.DropArea
                key={id}
                disabled={
                  draggingCardID !== undefined &&
                  (id === draggingCardID || cards[i - 1]?.id === draggingCardID)
                }
                onDrop={() => onCardDrop?.(id)}
              >
                <Card id={id} />
              </Card.DropArea>
            ))}
            <Card.DropArea
              style={{ height: '100%' }}
              disabled={
                draggingCardID !== undefined &&
                cards[cards.length - 1]?.id === draggingCardID
              }
              onDrop={() => onCardDrop?.(null)}
            />
          </VerticalScroll>
        </>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-flow: column;
  width: 355px;
  height: 100%;
  border: solid 1px ${color.Silver};
  border-radius: 6px;
  background-color: ${color.LightSilver};

  > :not(:last-child) {
    flex-shrink: 0;
  }
`
const Header = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 8px;
`
const CountBadge = styled.div`
  margin-right: 8px;
  border-radius: 20px;
  padding: 2px 6px;
  color: ${color.Black};
  background-color: ${color.Silver};
  font-size: 14px;
  line-height: 1;
`
const ColumnName = styled.div`
  color: ${color.Black};
  font-size: 14px;
  font-weight: bold;
`
const AddButton = styled.button.attrs({
  type: 'button',
  children: <PlusIcon />,
})`
  margin-left: auto;
  color: ${color.Black};

  :hover {
    color: ${color.Blue};
  }
`
const InputForm = styled(_InputForm)`
  padding: 8px;
`

const Loading = styled.div.attrs({
  children: 'Loading...',
})`
  padding: 8px;
  font-size: 14px;
`
const ResultCount = styled.div`
  color: ${color.Black};
  font-size: 12px;
  text-align: center;
`

const VerticalScroll = styled.div`
  height: 100%;
  padding: 8px;
  overflow-y: auto;
  flex: 1 1 auto;

  > :not(:first-child) {
    margin-top: 8px;
  }
`
