import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'

export enum TriggerMode {
  Always = 'always',
  QuestionMark = 'questionMark',
  Manually = 'manually',
}

export const TRIGGER_MODE_TEXT = {
  [TriggerMode.Always]: { title: 'Always', desc: 'ChatGPT is queried on every search' },
  [TriggerMode.QuestionMark]: {
    title: 'Question Mark',
    desc: 'When your query ends with a question mark (?)',
  },
  [TriggerMode.Manually]: {
    title: 'Manually',
    desc: 'ChatGPT is queried when you manually click a button',
  },
}

export enum Theme {
  Auto = 'auto',
  Light = 'light',
  Dark = 'dark',
}

export enum Language {
  Auto = 'auto',
  English = 'english',
  Chinese = 'chinese',
  Spanish = 'spanish',
  French = 'french',
  Korean = 'korean',
  Japanese = 'japanese',
  German = 'german',
  Portuguese = 'portuguese',
}

interface UserConfig {
  triggerMode: TriggerMode
  theme: Theme
  language: Language
  prompts: {
    [key: string]: string
  }
}

const userConfigWithDefaultValue = {
  triggerMode: TriggerMode.Always,
  theme: Theme.Auto,
  language: Language.Auto,
  prompts: {
    Rewrite:
      'Please rewrite the following paragraph(s) and revise them to enhance clarity while retaining the terms and concepts defined by the author. Please ensure that the revised content accurately converys the intended meaning. ',
    Concise:
      'Please review the following paragraph(s) and revise them to be more concise while retaining the essential meaning and important concepts. Please ensure that the revised content is clear, accurate ',
  },
}

export async function getUserConfig(): Promise<UserConfig> {
  const result = await Browser.storage.local.get(Object.keys(userConfigWithDefaultValue))
  return defaults(result, userConfigWithDefaultValue)
}

export async function updateUserConfig(updates: Partial<UserConfig>) {
  console.debug('update configs', updates)
  return Browser.storage.local.set(updates)
}

export async function resetUserConfig(configKey: keyof UserConfig) {
  console.debug('reset configs', configKey)
  return updateUserConfig({ [configKey]: userConfigWithDefaultValue[configKey] })
}

export enum ProviderType {
  ChatGPT = 'chatgpt',
  GPT3 = 'gpt3',
}

interface GPTProviderConfig {
  model: string
  apiKey: string
}

interface ChatGPTProviderConfig {
  chatgpt_model: string
}

export interface ProviderConfigs {
  provider: ProviderType
  configs: {
    [ProviderType.GPT3]: GPTProviderConfig | undefined
    [ProviderType.ChatGPT]: ChatGPTProviderConfig | undefined
  }
}

// api key is in the local storage
export async function getProviderConfigs(): Promise<ProviderConfigs> {
  const { provider = ProviderType.ChatGPT } = await Browser.storage.local.get('provider')
  const configKey = `provider:${provider}`
  const result = await Browser.storage.local.get(configKey)
  return {
    provider,
    configs: {
      [ProviderType.GPT3]: result[configKey],
      [ProviderType.ChatGPT]: result[configKey],
    },
  }
}

export async function saveProviderConfigs(
  provider: ProviderType,
  configs: GPTProviderConfig | ChatGPTProviderConfig,
) {
  return Browser.storage.local.set({
    provider,
    [`provider:${provider}`]: configs,
  })
}
