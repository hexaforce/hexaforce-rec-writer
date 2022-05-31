import { h } from 'preact'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import type { JSXInternal } from 'preact/src/jsx'

// import './VoiceUI.css'
import { Sentence, createSpeaker } from '../domain'
import { speakerRepository } from '../infra/SpeakerRepository'
import type { SpeechRecognition } from './SpeechRecognition'

export type VoiceUIStatus = 'pause' | 'processing' | 'error'

const _SpeechRecognition = (window as any).SpeechRecognition ?? ((window as any).webkitSpeechRecognition as SpeechRecognition)

export type VoiceUIProps = {
  forever: boolean
} & JSXInternal.HTMLAttributes<HTMLDivElement>

export const VoiceUI = (props: VoiceUIProps) => {
  const { forever, ...divProps } = props
  const [status, setStatus] = useState<VoiceUIStatus>('pause')
  const recognitionRef = useRef<SpeechRecognition>()
  const [text, setText] = useState('')

  useEffect(() => {
    const lang = 'ja-JP'
    const _recognition: SpeechRecognition = new _SpeechRecognition()
    console.log('_recognition', _recognition)
    // @ts-ignore
    const restart = async () => {
      if (_recognition) {
        await _recognition.stop()
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await _recognition.start()
        setStatus('processing')
      }
    }
    _recognition.lang = lang
    _recognition.interimResults = true
    _recognition.continuous = true
    _recognition.onsoundstart = function () {
      console.info('[speech] onsoundstart')
      setStatus('processing')
    }
    _recognition.onnomatch = function () {
      console.info('[speech] onnomatch')
      setStatus('error')
    }
    _recognition.onerror = function () {
      console.info('[speech] onerror')
      setStatus('error')
    }
    _recognition.onsoundend = function () {
      console.info('[speech] onsoundend')
      setStatus('pause')
    }
    _recognition.onend = function () {
      console.info('[speech] onend')
      setStatus('pause')
    }
    _recognition.onspeechstart = function () {
      console.info('[speech] onspeechstart')
      setStatus('processing')
    }
    _recognition.onspeechend = function () {
      console.info('[speech] onspeechend')
      setStatus('pause')
    }
    _recognition.onresult = function (event) {
      const results = Array.from(event.results)
      const lastResult = results[results.length - 1]
      const isCurrentProcessFinish = lastResult.isFinal
      if (isCurrentProcessFinish) {
        setText(lastResult[0].transcript)
        speakerSpeakSentenceUseCase().execute(lastResult[0].transcript)
      } else {
        const restResults = results.slice(event.resultIndex)
        const processingResults = restResults.filter((result) => !result.isFinal)
        const processingText = processingResults.map((result) => result[0].transcript).join('')
        setText(processingText)
      }
    }
    recognitionRef.current = _recognition
    setStatus('processing')
    _recognition.start()
    return () => {
      _recognition?.stop()
    }
  }, [])

  const onClickToggleButton = useCallback(() => {
    if (status === 'processing') {
      setStatus('pause')
      recognitionRef.current?.stop()
    } else {
      setStatus('processing')
      recognitionRef.current?.start()
    }
  }, [status])

  return (
    <div class={'VoiceUI'} {...divProps}>
      <div style={{ display: 'flex', height: '1em', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <button onClick={onClickToggleButton}>
            {status === 'processing' ? 'Stop' : 'Start'}
          </button>
          <p>Status: {status}</p>
        </div>
      </div>
      <p>Text: {text}</p>
    </div>
  )
}

const speakerSpeakSentenceUseCase = (infra = { speakerRepository }) => {
  return {
    execute(str: string) {
      const domain = infra.speakerRepository.read() ?? createSpeaker()
      // Domain works
      const sentence = new Sentence(str)
      const newDomain = domain.speak(sentence)
      // Domain works
      infra.speakerRepository.write(newDomain)
    },
  }
}
