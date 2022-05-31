import { render } from 'preact'

import './index.css'

import { VoiceEditor } from './VoiceEditor/VoiceEditor'
import { VoiceUI } from './VoiceUI/VoiceUI'
export function App() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column' }} className={'main'}>
      <VoiceEditor style={{ flex: 1, overflow: 'auto' }} />
      <VoiceUI forever={true} style={{ height: '100px', paddingLeft: '20px', paddingTop: '20px' }} />
    </main>
  )
}

render(<App />, document.getElementById('app')!)
