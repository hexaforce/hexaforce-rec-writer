import { createSpeaker } from 'domain'
import { Sentence } from 'domain/Sentence'
import { speakerRepository } from 'infra/SpeakerRepository'

export function SpeakerSpeakSentenceUseCase(infra = { speakerRepository }) {
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

export const speakerSpeakSentenceUseCase = SpeakerSpeakSentenceUseCase
