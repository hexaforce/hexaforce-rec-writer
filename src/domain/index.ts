import { ulid } from 'ulid'

import { Speaker, SpeakerId } from 'domain/Speaker'
import { SpeakerMemory, SpeakerMemoryId } from './SpeakerMemory'

export const createSpeaker = () => {
  return new Speaker({
    id: new SpeakerId(ulid()),
    memory: new SpeakerMemory({
      id: new SpeakerMemoryId(ulid()),
      sentences: [],
    }),
  })
}
