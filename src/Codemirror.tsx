import * as React from 'react'

import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import { basicSetup } from '@codemirror/basic-setup'
import { cursorDocEnd, cursorLineDown, defaultKeymap } from '@codemirror/commands'
import { EditorState, Text } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { placeholder } from '@codemirror/view'

import SpeechToText from './Speech-to-Text'

export default function Codemirror(props: any) {
  const divRef = React.useRef<HTMLDivElement>(null)
  const editorViewRef = React.useRef<EditorView>()

  const [mic, setMic] = React.useState(false)
  const [recognitionText, setRecognitionText] = React.useState('')

  const handleMic = () => {
    setMic(!mic)
  }

  const editorState = EditorState.create({
    doc: props.doc,
    extensions: [
      basicSetup,
      keymap.of(defaultKeymap),
      EditorView.theme({
        '&': { maxHeight: props.editorFixHeight + 'px' },
        '.cm-gutter,.cm-content': { minHeight: props.editorFixHeight + 'px' },
        '.cm-scroller': { overflow: 'auto' },
      }),
      placeholder(`こちらに入力してください。`),
    ],
  })

  React.useEffect(() => {
    if (editorViewRef.current) {
      props.setDoc(editorViewRef.current.state.doc)
    }
  }, [editorViewRef.current?.state.doc])

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

  return (
    <Stack spacing={1} direction='column'>
      <Box sx={{ height: props.editorFixHeight + 2, transform: 'translateZ(0px)', flexGrow: 1 }}>
        <div ref={divRef} />
        <Avatar sx={{ position: 'absolute', bottom: 20, right: 20, width: 56, height: 56 }} onClick={handleMic}>
          {mic ? <MicOffIcon /> : <MicIcon />}
        </Avatar>
      </Box>
      <SpeechToText mic={mic} setRecognitionText={setRecognitionText} />
    </Stack>
  )
}
