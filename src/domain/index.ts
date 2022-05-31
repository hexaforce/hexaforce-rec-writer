import { ulid } from 'ulid'

export const createSpeaker = () => {
  return new Speaker({
    id: new SpeakerId(ulid()),
    memory: new SpeakerMemory({
      id: new SpeakerMemoryId(ulid()),
      sentences: [],
    }),
  })
}

const LINE_END_PATTERN = /[!?。,、]$/

const vcommand = (value: string) => {
  if (/(改行|開業|かいぎょう)$/.test(value)) {
    return value.replace(/(改行|開業|かいぎょう)$/, '\n')
  }
  return value + '\n'
}

export class Sentence {
  constructor(public value: string) { }

  toSentence() {
    return LINE_END_PATTERN.test(this.value) ? vcommand(this.value) : vcommand(this.value)
  }
}

export class SpeakerId {
  type = 'SpeakerId' as const

  constructor(public readonly value: string) { }
}

export type SpeakerProps = {
  id: SpeakerId
  memory: SpeakerMemory
}

export class Speaker implements SpeakerProps {
  id: SpeakerId
  memory: SpeakerMemory

  constructor(props: SpeakerProps) {
    this.id = props.id
    this.memory = props.memory
  }

  speak(sentence: Sentence) {
    return new Speaker({
      ...this,
      memory: this.memory.addSpokenSentence(sentence),
    })
  }

  writeSpokenSentences(sentences: Sentence[]) {
    return new Speaker({
      ...this,
      memory: this.memory.removeSentences(sentences),
    })
  }
}


export class SpeakerMemoryId {
  type = 'SpeakerMemoryId' as const

  constructor(public value: string) { }
}

export type SpeakerMemoryProps = {
  id: SpeakerMemoryId
  sentences: Sentence[]
}

export class SpeakerMemory implements SpeakerMemoryProps {
  id!: SpeakerMemoryId
  sentences!: Sentence[]

  constructor(props: SpeakerMemoryProps) {
    Object.assign(this, props)
  }

  get hasMemory() {
    return this.sentences.length > 0
  }

  addSpokenSentence(sentence: Sentence) {
    return new SpeakerMemory({
      ...this,
      sentences: this.sentences.concat(sentence),
    })
  }

  removeSentences(removeSentences: Sentence[]) {
    return new SpeakerMemory({
      ...this,
      sentences: this.sentences.filter((sentence) => {
        return !removeSentences.includes(sentence)
      }),
    })
  }

  format() {
    return this.sentences.map((sentence) => sentence.value).join('\n')
  }
}
