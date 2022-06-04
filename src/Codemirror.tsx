import * as React from 'react'

import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import { basicSetup } from '@codemirror/basic-setup'
import { cursorDocEnd, cursorLineDown, defaultKeymap } from '@codemirror/commands'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { placeholder } from '@codemirror/view'

import SpeechToText from './Speech-to-Text'

export default function Codemirror(props: any) {
  const { mic, setMic, doc, setDoc, editorFixHeight } = props

  const editorViewRef = React.useRef<EditorView>()
  const updateListenerExtension = React.useCallback(() => {
    return EditorView.updateListener.of((update) => {
      if (editorViewRef.current) {
        setDoc(editorViewRef.current.state.doc)
      }
    })
  }, [])

  const editorState = EditorState.create({
    doc: doc,
    extensions: [
      basicSetup,
      // keymap.of(defaultKeymap),
      updateListenerExtension(),
      EditorView.theme({
        '&': { maxHeight: editorFixHeight + 'px', textAlign: 'left!important' },
        '.cm-gutter,.cm-content': { minHeight: editorFixHeight + 'px' },
        '.cm-scroller': { overflow: 'auto' },
      }),
      placeholder(`こちらに入力してください。`),
    ],
  })

  const divRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (divRef.current) {
      const editorView = new EditorView({
        state: editorState,
        parent: divRef.current,
      })
      cursorDocEnd(editorView)
      editorView.focus()
      editorViewRef.current = editorView
      return () => {
        editorView.destroy()
      }
    }
  }, [])

  const [recognitionText, setRecognitionText] = React.useState('')
  React.useEffect(() => {
    if (recognitionText != '') {
      if (editorViewRef.current) {
        const transaction = editorViewRef.current.state.update({
          changes: {
            from: editorViewRef.current.state.selection.ranges[0].to,
            insert: recognitionText + '。' + '\n',
          },
        })
        editorViewRef.current.dispatch(transaction)
        cursorLineDown(editorViewRef.current)
      }
      setRecognitionText('')
    }
  }, [recognitionText])

  const handleMic = () => {
    setMic(!mic)
  }

  return (
    <Stack spacing={1} direction='column'>
      <Box sx={{ height: editorFixHeight + 2, transform: 'translateZ(0px)', flexGrow: 1 }}>
        <div ref={divRef} />
        <Avatar sx={{ position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, bgcolor: mic ? 'violet' : 'dodgerblue' }} onClick={handleMic}>
          {mic ? <MicOffIcon /> : <MicIcon />}
        </Avatar>
      </Box>
      <SpeechToText mic={mic} setRecognitionText={setRecognitionText} />
    </Stack>
  )
}
