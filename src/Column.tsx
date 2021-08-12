import React, { useState } from 'react'
import styled from 'styled-components'
import * as color from './color'
import { Card } from './Card'
import { PlusIcon } from './icon'
import { InputForm as _InputForm } from './InputForm'

export const Column = ({
  title,
  filterValue: rawFilterValue,
  cards: rawCards,
}: {
  title?: string
  filterValue?: string
  cards: {
    id: string
    text?: string
  }[]
}) => {
  //filtervalueの文字列の両端の空白を削除
  const filterValue = rawFilterValue?.trim()
  //呼び出す文字列を小文字にして変換し、文字列の配列に分割
  const keywords = filterValue?.toLowerCase().split(/\s+/g) ?? []
  //配列内の要素が合格するかテスト。プール値を返す
  const cards = rawCards.filter(({ text }) =>
    keywords?.every(w => text?.toLowerCase().includes(w)),
  )
  //カードの個数をカウントし、表示する
  const totalCount = rawCards.length
  //テキストに入力された値を管理
  const [text, setText] = useState('')
  //inputFormの表示・非表示を管理
  const [inputMode, setInputMode] = useState(false)
  const toggleInput = () => setInputMode(v => !v)
  const confirmInput = () => setText('')
  const cancelInput = () => setInputMode(false)
  //<String | undefined>はユニオン型　成功したときはstringを返し、失敗したときはundefinedを返す
  //stateの型を指定する書き方。
  const [draggingCardID, setDraggingCardID] = useState<string | undefined>(
    undefined,
  )
  return (
    <Container>
      <Header>
        <CountBadge>{totalCount}</CountBadge>
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
          onChange={setText}
          onConfirm={confirmInput}
          onCancel={cancelInput}
        />
      )}
      {filterValue && <ResultCount>{cards.length} results</ResultCount>}

      <VerticalScroll>
        {cards.map(({ id, text }, i) => (
          <Card.DropArea
            key={id}
            disabled={
              draggingCardID !== undefined &&
              (id === draggingCardID || cards[i - 1]?.id === draggingCardID)
            }
          >
            <Card
              text={text}
              onDragStart={() => setDraggingCardID(id)}
              onDragEnd={() => setDraggingCardID(undefined)}
            />
          </Card.DropArea>
        ))}
        <Card.DropArea
          style={{ height: '100%' }}
          disabled={
            draggingCardID !== undefined &&
            cards[cards.length - 1]?.id === draggingCardID
          }
        />
      </VerticalScroll>
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
