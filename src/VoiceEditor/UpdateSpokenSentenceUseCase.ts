import { createSpeaker } from 'domain'
import { Sentence } from 'domain/Sentence'

import { speakerRepository } from 'infra/SpeakerRepository'

export function UpdateSpokenSentenceUseCase(infra = { speakerRepository }) {
  return {
    execute(sentences: Sentence[]) {
      const domain = infra.speakerRepository.read() ?? createSpeaker()
      // Domain works
      const newDomain = domain.writeSpokenSentences(sentences)
      // Domain works
      infra.speakerRepository.write(newDomain)
    },
  }
}

export const updateSpokenSentenceUseCase = UpdateSpokenSentenceUseCase
