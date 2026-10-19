import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import content from './content.json'

export function render() {
  return renderToString(<App content={content} />)
}
