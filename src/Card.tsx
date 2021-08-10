import React from 'react'
import styled from 'styled-components'
import * as color from './color'
import { CheckIcon as _checkIcon, TrashIcon } from './icon'

//Cardコンポーネントは中身のテキストをtext属性として受けとれるようにしている
//textにURLが含まれた場合はその部分をリンクに変えている
export const Card = ({ text }: { text?: string }) => (
  <Container>
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
    <DeleteButton />
  </Container>
)

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
