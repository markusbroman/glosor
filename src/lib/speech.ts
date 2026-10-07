const PREFERRED = ['Daniel', 'Kate', 'Serena', 'Arthur', 'Martha', 'Google UK English Female', 'Google UK English Male']

let voice: SpeechSynthesisVoice | null = null

function chooseVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  const gb = voices.filter((v) => v.lang.replace('_', '-').startsWith('en-GB'))
  return (
    PREFERRED.map((n) => gb.find((v) => v.name.includes(n))).find(Boolean) ??
    gb.find((v) => v.localService) ??
    gb[0] ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  )
}

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

if (canSpeak) {
  voice = chooseVoice()
  speechSynthesis.addEventListener?.('voiceschanged', () => (voice = chooseVoice()))
}

export function speak(text: string, slow = false): void {
  if (!canSpeak) return
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-GB'
    if (voice) u.voice = voice
    u.rate = slow ? 0.6 : 0.9
    speechSynthesis.cancel()
    speechSynthesis.speak(u)
  } catch {}
}

type Recognition = {
  lang: string
  maxAlternatives: number
  interimResults: boolean
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void
  onerror: (e: { error: string }) => void
  onend: () => void
  start(): void
  abort(): void
}

function recognitionClass(): (new () => Recognition) | null {
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => Recognition) | null
}

export const canRecognize = typeof window !== 'undefined' && !!recognitionClass()

/** Lyssnar efter ett svar på engelska. Ger alla tolkningar, eller kastar fel. */
export function listen(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const R = recognitionClass()
    if (!R) return reject(new Error('unsupported'))
    const r = new R()
    let heard: string[] = []
    r.lang = 'en-GB'
    r.maxAlternatives = 5
    r.interimResults = false
    r.onresult = (e) => {
      heard = Array.from(e.results[0] ?? [], (a) => a.transcript)
    }
    r.onerror = (e) => reject(new Error(e.error))
    r.onend = () => resolve(heard)
    speechSynthesis?.cancel()
    r.start()
    setTimeout(() => r.abort(), 7000)
  })
}
