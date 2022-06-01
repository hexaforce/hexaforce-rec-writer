import { useEffect, useRef } from 'preact/hooks'
import type { JSXInternal } from 'preact/src/jsx'

import { EditorState, basicSetup } from '@codemirror/basic-setup'
import { EditorView, keymap } from "@codemirror/view"
import { defaultKeymap, cursorDocEnd, cursorLineDown } from '@codemirror/commands'
import { placeholder } from '@codemirror/view'

import { createSpeaker, Sentence } from '../domain'
import { speakerRepository } from '../infra/SpeakerRepository'
import * as VoiceEditorState from './VoiceEditorState'
import { useStore } from './useStore'

export type VoiceEditorProps = JSXInternal.HTMLAttributes<HTMLDivElement>
export const VoiceEditor = (props: VoiceEditorProps) => {
  const { ...divProps } = props

  const divRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<EditorView>()

  useEffect(() => {
    const editorState = EditorState.create({
      extensions: [
        basicSetup,
        keymap.of(defaultKeymap),
        EditorView.theme({
          '&': { maxHeight: '320px' },
          '.cm-gutter,.cm-content': { minHeight: '320px' },
          '.cm-scroller': { overflow: 'auto' },
        }),
        placeholder(`こちらに入力してください。`),
      ]
    })

    const editorView = new EditorView({
      state: editorState,
    })

    const refCurrent = divRef.current
    refCurrent?.appendChild(editorView.dom)
    cursorDocEnd(editorView) // move to end of doc
    editorView.focus()
    editorViewRef.current = editorView
    return () => {
      editorView.destroy()
      refCurrent?.remove()
    }
  }, []) // eslint-disable-line -- storage at first

  const voiceEditorState = useStore(VoiceEditorState)

  useEffect(() => {

    const editorView = editorViewRef.current
    if (!voiceEditorState.hasAddingSentences || !editorView) return

    const transaction = editorView.state.update({
      changes: voiceEditorState.addingSentences.map((sentence) => {
        return {
          from: editorView.state.selection.ranges[0].to,
          insert: sentence.toSentence(),
        }
      }),
    })

    editorView.dispatch(transaction)
    cursorLineDown(editorView)
    updateSpokenSentenceUseCase().execute(voiceEditorState.addingSentences)
  }, [voiceEditorState])

  return <div className={'VoiceEditor'} ref={divRef} {...divProps} />

}

const updateSpokenSentenceUseCase = (infra = { speakerRepository }) => {
  return {
    execute(sentences: Sentence[]) {
      const domain = infra.speakerRepository.read() ?? createSpeaker()
      const newDomain = domain.writeSpokenSentences(sentences)
      infra.speakerRepository.write(newDomain)
    },
  }
}
