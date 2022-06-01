import * as React from 'react'
import { createRoot } from 'react-dom/client'

import { StyledEngineProvider } from '@mui/material/styles'

import { Text } from '@codemirror/state'

import Codemirror from './Codemirror'

function App() {
  const [doc, setDoc] = React.useState<Text>()
  return (
    <div style={{ width: '100%' }}>
      <Codemirror doc={doc} setDoc={setDoc} editorFixHeight={320} />
      {JSON.stringify(doc)}
    </div>
  )
}

const container = document.querySelector('#root')
container &&
  createRoot(container).render(
    <React.StrictMode>
      <StyledEngineProvider injectFirst>
        <App />
      </StyledEngineProvider>
    </React.StrictMode>,
  )
