import { fetchDirect } from '../fetch-sse'
import { GenerateAnswerParams, Provider } from '../types'

export class OpenAIProvider implements Provider {
  constructor(private token: string, private model: string) {
    this.token = token
    this.model = model
  }

  async generateAnswer(params: GenerateAnswerParams) {
    let result = ''
    await fetchDirect('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: params.prompt }],
        temperature: 0.7,
      }),
      onMessage(message) {
        console.debug('sse message', message)
        let data
        try {
          data = JSON.parse(message)
          const text = data.choices[0].message.content
          result += text
          params.onEvent({
            type: 'answer',
            data: {
              text: result,
              messageId: data.id,
              conversationId: data.id,
            },
          })
        } catch (err) {
          console.error(err)
          return
        }

        params.onEvent({ type: 'done' })
        return
      },
    })
    return {}
  }
}
