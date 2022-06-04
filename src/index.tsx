import * as React from 'react'
import { createRoot } from 'react-dom/client'

import { StyledEngineProvider } from '@mui/material/styles'

import { Text } from '@codemirror/state'

import Codemirror from './Codemirror'

function App() {
  const [doc, setDoc] = React.useState<Text | string>(`abc
123
xyz
789
`)
  const [mic, setMic] = React.useState(false)

  React.useEffect(() => {
    if (typeof doc == 'string') {
      console.log('Doc change: ' + doc)
    } else {
      console.log('Doc change: ' + doc.toJSON().join('\n'))
    }
  }, [doc])

  React.useEffect(() => {
    console.log('Mic change: ' + mic)
  }, [mic])

  return (
    <div style={{ width: '100%' }}>
      <Codemirror doc={doc} setDoc={setDoc} mic={mic} setMic={setMic} editorFixHeight={320} />
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
