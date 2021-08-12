import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import * as color from './color'
import { CheckIcon as _checkIcon, TrashIcon } from './icon'

//Cardコンポーネントは中身のテキストをtext属性として受けとれるようにしている
//textにURLが含まれた場合はその部分をリンクに変えている
export const Card = ({
  text,
  onDragStart,
  onDragEnd,
  onDeleteClick,
}: {
  text?: string
  onDragStart?(): void
  onDragEnd?(): void
  onDeleteClick?(): void
}) => {
  const [drag, setDrag] = useState(false)
  return (
    <Container
      style={{ opacity: drag ? 0.5 : undefined }}
      onDragStart={() => {
        onDragStart?.()
        setDrag(true)
      }}
      onDragEnd={() => {
        onDragEnd?.()
        setDrag(false)
      }}
    >
      <CheckIcon />

      {text?.split(/(https?:\/\/\S+)/g).map((fragment, i) =>
        i % 2 === 0 ? (
          <Text key={i}>{fragment}</Text>
        ) : (
          <Link key={i} href={fragment}>
            {fragment}
          </Link>
        ),
      )}
      <DeleteButton onClick={onDeleteClick} />
    </Container>
  )
}
const DropArea = ({
  disabled, //無効
  onDrop, //ドロップ
  children,
  className,
  style,
}: {
  disabled?: boolean
  onDrop?(): void
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) => {
  //targetの状態を管理
  const [isTarget, setIsTarget] = useState(false)

  const visible = !disabled && isTarget

  //dragOverの状態はカスタムフックで管理
  const [dragOver, onDragOver] = useDragAutoLeave()

  return (
    <DropAreaContainer
      style={style}
      className={className}
      //onDragOverのときにイベントが無効ならそのまま返す
      onDragOver={ev => {
        if (disabled) return
        //イベントの動作をキャンセルする
        ev.preventDefault()
        //元に戻す
        onDragOver(() => setIsTarget(false))
      }}
      onDragEnter={() => {
        if (disabled || dragOver.current) return
        setIsTarget(true)
      }}
      onDrop={() => {
        if (disabled) return
        setIsTarget(false)
        onDrop?.()
      }}
    >
      <DropAreaIndicator
        style={{
          height: !visible ? 0 : undefined,
          borderWidth: !visible ? 0 : undefined,
        }}
      />
      {children}
    </DropAreaContainer>
  )
}

//dragOver　イベントが継続中かどうかをrefとして返す
//timeOut　　経過後に自動でフラグがfalseになる
//＠param timeout　自動でフラグをfalseにするまでの時間(ms)

const useDragAutoLeave = (timeout: number = 100) => {
  const dragOver = useRef(false)
  const timer = useRef(0)

  return [
    dragOver,
    (onDragLeave?: () => void) => {
      clearTimeout(timer.current) //現在のタイム
      dragOver.current = true
      timer.current = setTimeout(() => {
        dragOver.current = false
        onDragLeave?.()
      }, timeout)
    },
  ] as const //これらを定数とする
}

const DropAreaContainer = styled.div`
  > :not(:first-child) {
    margin-top: 8px;
  }
`

const DropAreaIndicator = styled.div`
  height: 40px;
  border: dashed 3px ${color.Gray};
  border-radius: 6px;
  transition: all 50ms ease-out;
`

Card.DropArea = DropArea

const Container = styled.div.attrs({
  draggable: true,
})`
  position: relative;
  border: solid 1px ${color.Silver};
  border-radius: 6px;
  box-shadow: 0 1px 3px hsla(0, 0%, 7%, 0.1);
  padding: 8px 32px;
  background-color: ${color.White};
  cursor: move;
`
const CheckIcon = styled(_checkIcon)`
  position: absolute;
  top: 12px;
  left: 8px;
  color: ${color.Green};
`
//DeleteButtonコンポーネントはattrsメソッドでデフォルトの属性を設定している
//DeleteButtonが <button type="button" ><TrashIcon/></button>と同じ意味になる
const DeleteButton = styled.button.attrs({
  type: 'button',
  children: <TrashIcon />,
})`
  position: absolute;
  top: 12px;
  right: 8px;
  font-size: 14px;
  color: ${color.Gray};

  :hover {
    color: ${color.Red};
  }
`
const Text = styled.span`
  color: ${color.Black};
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
`
const Link = styled.a.attrs({
  target: '_black',
  rel: 'noopener noreferrer',
})`
  color: ${color.Blue};
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
`
