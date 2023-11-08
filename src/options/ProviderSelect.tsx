import { Button, Input, Select, Spinner, Tabs, useInput, useToasts } from '@geist-ui/core'
import { FC, useCallback, useState } from 'react'
import useSWR from 'swr'
import { fetchExtensionConfigs } from '../api'
import { getProviderConfigs, ProviderConfigs, ProviderType, saveProviderConfigs } from '../config'

interface ConfigProps {
  config: ProviderConfigs
  models: {
    [key: string]: string[]
  }
}

async function loadModels(): Promise<{ [key: string]: string[] }> {
  const configs = await fetchExtensionConfigs()
  return {
    [ProviderType.ChatGPT]: configs.chatgpt_webapp_model_name,
    [ProviderType.GPT3]: configs.openai_model_names,
  }
}

const ConfigPanel: FC<ConfigProps> = ({ config, models }) => {
  const [tab, setTab] = useState<ProviderType>(config.provider)
  const { bindings: apiKeyBindings } = useInput(config.configs[ProviderType.GPT3]?.apiKey ?? '')
  const [model, setModel] = useState(
    config.configs[ProviderType.GPT3]?.model ?? models[ProviderType.GPT3][0],
  )
  const [chatgpt_model, setChatGPTModel] = useState(
    config.configs[ProviderType.ChatGPT]?.chatgpt_model ?? models[ProviderType.ChatGPT][0],
  )
  const { setToast } = useToasts()

  const save = useCallback(async () => {
    if (tab === ProviderType.GPT3) {
      if (!apiKeyBindings.value) {
        alert('Please enter your OpenAI API key')
        return
      }
      if (!model || !models[ProviderType.GPT3].includes(model)) {
        alert('Please select a valid model')
        return
      }
      await saveProviderConfigs(tab, {
        model,
        apiKey: apiKeyBindings.value,
      })
      setToast({ text: 'Changes saved', type: 'success' })
    } else if (tab === ProviderType.ChatGPT) {
      if (!chatgpt_model || !models[ProviderType.ChatGPT].includes(chatgpt_model)) {
        alert('Please select a valid model')
        return
      }
      await saveProviderConfigs(tab, {
        chatgpt_model,
      })
      setToast({ text: 'Changes saved', type: 'success' })
    }
  }, [apiKeyBindings.value, model, chatgpt_model, tab, models, setToast])

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={tab} onChange={(v) => setTab(v as ProviderType)}>
        <Tabs.Item label="ChatGPT webapp" value={ProviderType.ChatGPT}>
          <div className="flex flex-col gap-2">
            <span>The API that powers ChatGPT webapp, free, but sometimes unstable</span>
            <div className="flex flex-row gap-2">
              <Select
                scale={2 / 3}
                value={chatgpt_model}
                onChange={(v) => setChatGPTModel(v as string)}
                placeholder="chatgpt_model"
              >
                {models[ProviderType.ChatGPT].map((m) => (
                  <Select.Option key={m} value={m}>
                    {m}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <span className="italic text-xs">
              We always say text-davinci-002-render as GPT-3, text-davinci-002-render-sha as
              GPT-3.5, gpt-4 as GPT-4. If your gpt-4 cannot return any response, please try other
              models or choose Auto.
              <br></br>
              If Auto is selected, the model will be chosen based on the webapp you are using.
            </span>
          </div>
        </Tabs.Item>
        <Tabs.Item label="OpenAI API" value={ProviderType.GPT3}>
          <div className="flex flex-col gap-2">
            <span>
              OpenAI official API, more stable,{' '}
              <span className="font-semibold">charge by usage</span>
            </span>
            <div className="flex flex-row gap-2">
              <Select
                scale={2 / 3}
                value={model}
                onChange={(v) => setModel(v as string)}
                placeholder="model"
              >
                {models[ProviderType.GPT3].map((m) => (
                  <Select.Option key={m} value={m}>
                    {m}
                  </Select.Option>
                ))}
              </Select>
              <Input htmlType="password" label="API key" scale={2 / 3} {...apiKeyBindings} />
            </div>
            <span className="italic text-xs">
              You can find or create your API key{' '}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
            </span>
          </div>
        </Tabs.Item>
      </Tabs>
      <Button scale={2 / 3} ghost style={{ width: 20 }} type="success" onClick={save}>
        Save
      </Button>
    </div>
  )
}

function ProviderSelect() {
  const query = useSWR('provider-configs', async () => {
    const [config, models] = await Promise.all([getProviderConfigs(), loadModels()])
    return { config, models }
  })
  if (query.isLoading) {
    return <Spinner />
  }
  return <ConfigPanel config={query.data!.config} models={query.data!.models} />
}

export default ProviderSelect
