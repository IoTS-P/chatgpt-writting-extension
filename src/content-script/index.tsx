import { render } from 'preact'
import '../base.css'
import { getUserConfig, Theme } from '../config'
import { detectSystemColorScheme } from '../utils'
import ChatGPTContainer from './ChatGPTContainer'
import { config, SearchEngine } from './search-engine-configs'
import './styles.scss'
import { getPossibleElementByQuerySelector } from './utils'

async function mount(question: string, siteConfig: SearchEngine) {
  const container = document.createElement('div')
  container.className = 'chat-gpt-container'

  const userConfig = await getUserConfig()
  let theme: Theme
  if (userConfig.theme === Theme.Auto) {
    theme = detectSystemColorScheme()
  } else {
    theme = userConfig.theme
  }

  container.classList.add('gpt-dark')

  const siderbarContainer = getPossibleElementByQuerySelector(siteConfig.sidebarContainerQuery)
  if (siderbarContainer) {
    siderbarContainer.prepend(container)
  } else {
    container.classList.add('sidebar-free')
    const appendContainer = getPossibleElementByQuerySelector(siteConfig.appendContainerQuery)
    if (appendContainer) {
      appendContainer.appendChild(container)
    }
  }
  containerQueue.push(container)
  if (containerQueue.length > 2) {
    const containtToRemove = containerQueue.shift()
    containtToRemove.remove()
  }

  render(
    <ChatGPTContainer question={question} triggerMode={userConfig.triggerMode || 'always'} />,
    container,
  )
}

const siteRegex = new RegExp(Object.keys(config).join('|'))
const siteName = location.hostname.match(siteRegex)![0]
const siteConfig = config[siteName]
const containerQueue = []

const explainBtn = document.createElement('button')
explainBtn.textContent = 'Concise'
explainBtn.addEventListener('click', () => {
  const selectedText = window.getSelection().toString().trim()
  if (selectedText !== '') {
    const question =
      'Please review the following paragraph(s) and revise them to be more concise while retaining the essential meaning and important concepts. Please ensure that the revised content is clear, accurate ---------WRITTING-GPT----------' +
      selectedText
    mount(question, siteConfig)
  }
})

const rewriteBtn = document.createElement('button')
rewriteBtn.textContent = 'Rewrite'
rewriteBtn.addEventListener('click', () => {
  const selectedText = window.getSelection().toString().trim()
  if (selectedText !== '') {
    const question =
      'Please review the following paragraph(s) and revise them to enhance clarity while retaining the terms and concepts defined by the author. Please ensure that the revised content accurately conveys the intended meaning. ---------WRITTING-GPT----------' +
      selectedText
    mount(question, siteConfig)
  }
})

// Position the buttons
const buttonStyle = `
  position: fixed;
  bottom: 20px;
  z-index: 9999;
`

explainBtn.style.cssText = `
  ${buttonStyle}
  left: 80px;
`

rewriteBtn.style.cssText = `
  ${buttonStyle}
  left: 10px;
`

// Add the buttons to the page
document.body.appendChild(explainBtn)
document.body.appendChild(rewriteBtn)
