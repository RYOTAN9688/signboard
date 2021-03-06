import React from 'react'
import styled from 'styled-components'
import * as color from './color'
import { CardFilter } from './CardFilter'

export const Header = ({ className }: { className?: string }) => (
  <Container className={className}>
    <Logo>kanban board</Logo>
    <CardFilter />
  </Container>
)

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: ${color.Navy};
`
const Logo = styled.div`
  color: ${color.Silver};
  font-size: 16px;
  font-weight: bold;
`
