'use client'
import { useState } from 'react'

export default function Home() {
  const [response, setResponse] = useState('')

  const handleSend = async () => {
    const res = await fetch('http://localhost:8080/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'Hello' })
    })
    const data = await res.json()
    setResponse(data.output)
  }

  return (
    <main>
      <button onClick={handleSend}>送信</button>
      <p>AIからの返答: {response}</p>
    </main>
  )
}
