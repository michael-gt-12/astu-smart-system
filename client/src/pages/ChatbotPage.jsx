import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import api from '../api/axios'
import { PageHeader } from '../components/UI'
import { HiOutlinePaperAirplane, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2'

export default function ChatbotPage() {
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: '👋 **Hello!** I\'m the ASTU Smart Assistant, now powered by **RAG (Retrieval-Augmented Generation)**!\n\nI can provide specific answers based on campus regulations and guides. I can help you with:\n• 🏠 **Dormitory issues** (plumbing, pests, noise)\n• 🔬 **Laboratory equipment** procedures\n• 🌐 **Internet access** & network settings\n• 🏫 **Classroom facility** guidelines\n\nAsk me anything!',
        },
    ])
    const [input, setInput] = useState('')
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const chatMutation = useMutation({
        mutationFn: (message) => api.post('/chatbot', { message }).then(r => r.data.data),
        onSuccess: (data) => {
            setMessages(prev => [...prev, {
                type: 'bot',
                text: data.reply,
                suggestedCategory: data.suggestedCategory,
            }])
        },
        onError: () => {
            setMessages(prev => [...prev, {
                type: 'bot',
                text: '❌ Sorry, something went wrong. Please try again.',
            }])
        },
    })

    const handleSend = (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMessage = input.trim()
        setMessages(prev => [...prev, { type: 'user', text: userMessage }])
        setInput('')
        chatMutation.mutate(userMessage)
    }



    return (
        <>
            <PageHeader title="RAG AI Assistant" subtitle="Get intelligent help based on official campus documents" />

            <div className="card max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.type === 'user'
                                ? 'bg-primary-600 text-white rounded-br-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                                }`}>
                                <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                    {msg.type === 'bot' ? (
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                                {msg.suggestedCategory && (
                                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <span className="text-xs opacity-75">💡 Suggested category: </span>
                                        <span className="text-xs font-semibold">{msg.suggestedCategory}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {chatMutation.isPending && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 dark:border-dark-border p-4">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about campus issues..."
                            className="input-field flex-1"
                            maxLength={1000}
                        />
                        <button
                            type="submit"
                            disabled={chatMutation.isPending || !input.trim()}
                            className="btn-primary px-4"
                        >
                            <HiOutlinePaperAirplane className="w-5 h-5" />
                        </button>
                    </form>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        Ask about dormitory, laboratory, internet, or classroom issues
                    </p>
                </div>
            </div>
        </>
    )
}
