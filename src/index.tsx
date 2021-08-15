import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { reducer } from './reducrer'
import { GlobalStyle } from './GlobalStyle'
import { App } from './App'

//createstoreによってstoreを生成し、子コンポーネントにstoreを渡している
//このストアがstateを保持し、各コンポーネントはその値を受けとり、UI表示を行う
//stateを変化させたいときは、storeに向けてactionを送る。
const store = createStore(reducer)

ReactDOM.render(
  <Provider store={store}>
    <GlobalStyle />
    <App />
  </Provider>,
  document.getElementById('app'),
)
