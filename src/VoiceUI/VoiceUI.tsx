import { h } from 'preact'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import type { JSXInternal } from 'preact/src/jsx'
// import SiriWave from 'siriwave'

// import { useTabFocus } from '../hooks/use-tab-focus'
// import { useTabVisibility } from '../hooks/use-tab-visibility'
import { speakerSpeakSentenceUseCase } from './SpeakerSpeakSentenceUseCase'
import type { SpeechRecognition } from './SpeechRecognition'
import './VoiceUI.css'

export type VoiceUIStatus = 'pause' | 'processing' | 'error'

const _SpeechRecognition = (window as any).SpeechRecognition ?? ((window as any).webkitSpeechRecognition as SpeechRecognition)

export type VoiceUIProps = {
  forever: boolean
} & JSXInternal.HTMLAttributes<HTMLDivElement>

export const VoiceUI = (props: VoiceUIProps) => {
  const { forever, ...divProps } = props
  const [status, setStatus] = useState<VoiceUIStatus>('pause')
  const [userWantToStop, setUserWantToStop] = useState<boolean>(false)
  const recognitionRef = useRef<SpeechRecognition>()
  const [text, setText] = useState('')
  const visible = useTabVisibility()
  const tabFocus = useTabFocus()
  // const isSupportedSpeechRecognition = useMemo(() => typeof _SpeechRecognition !== 'undefined', [])

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
      if (visible) {
        // restart();
      }
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
  }, [visible])

  useEffect(() => {
    const shouldPlay = visible || tabFocus
    if (shouldPlay && status === 'pause' && !userWantToStop) {
      console.log('reactive')
      try {
        recognitionRef.current?.start()
        setStatus('processing')
      } catch {
        /* nope */
      }
    }
  }, [status, tabFocus, userWantToStop, visible])

  const onClickToggleButton = useCallback(() => {
    if (status === 'processing') {
      setUserWantToStop(true)
      setStatus('pause')
      recognitionRef.current?.stop()
    } else {
      setUserWantToStop(false)
      setStatus('processing')
      recognitionRef.current?.start()
    }
  }, [status])

  // const siriRef = useRef<HTMLDivElement>(null)
  // const [siriWave, setSiriWave] = useState<SiriWave>()

  // useEffect(() => {
  //   if (!siriRef.current || siriWave)
  //     return
  //   setSiriWave(new SiriWave({ container: siriRef.current, style: 'ios9', width: 320, height: 30, }),)
  // }, [siriRef, siriWave])

  // useEffect(() => {
  //   if (status === 'processing') {
  //     siriWave?.start()
  //   } else {
  //     siriWave?.stop()
  //   }
  // }, [siriWave, status])

  return (
    <div class={'VoiceUI'} {...divProps}>
      <div style={{ display: 'flex', height: '1em', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <button class={'VoiceUI-toggleButton'} onClick={onClickToggleButton}>
            {status === 'processing' ? 'Stop' : 'Start'}
          </button>
          <p class={'VoiceUI-status'}>Status: {status}</p>
        </div>
      </div>
      <p class={'VoiceUI-status'}>Text: {text}</p>
      {/* {isSupportedSpeechRecognition ? <p className={'VoiceUI-text'}>{text}</p> : <p className={'VoiceUI-text'}>Your browser does not support SpeechRecognition API. Please use a browser like Chrome/Safari.</p>}
      <div ref={siriRef} class={'VoiceUI-bar'} /> */}
    </div>
  )
}

const useTabFocus = () => {
  const [hasFocus, setHasFocus] = useState(true)
  const onFocus = useCallback(() => setHasFocus(true), [setHasFocus])
  const onBlur = useCallback(() => setHasFocus(false), [setHasFocus])
  useEffect(() => {
    window.addEventListener('focus', onFocus, false)
    window.addEventListener('blur', onBlur, false)
    return () => {
      document.removeEventListener('blur', onBlur)
      document.removeEventListener('focus', onFocus)
    }
  }, [onBlur, onFocus])

  return hasFocus
}

let hidden: string
let visibilityChange: string

if (typeof document.hidden !== 'undefined') {
  hidden = 'hidden'
  visibilityChange = 'visibilitychange'
  // @ts-ignore
} else if (typeof document.msHidden !== 'undefined') {
  hidden = 'msHidden'
  visibilityChange = 'msvisibilitychange'
  // @ts-ignore
} else if (typeof document.webkitHidden !== 'undefined') {
  hidden = 'webkitHidden'
  visibilityChange = 'webkitvisibilitychange'
}

export const useTabVisibility = () => {
  const getVisibility = useCallback(() => {
    // @ts-ignore
    return !document[hidden]
  }, [])
  const [visible, setVisible] = useState(getVisibility())
  const handleVisibility = useCallback(() => setVisible(getVisibility()), [setVisible])
  useEffect(() => {
    document.addEventListener(visibilityChange, handleVisibility, false)
    return () => {
      document.removeEventListener(visibilityChange, handleVisibility)
    }
  }, [handleVisibility])

  return visible
}
