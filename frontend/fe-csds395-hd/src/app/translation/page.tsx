'use client'

import React, { useState } from 'react'
import type { NextPage } from 'next'
import Select, { SingleValue } from 'react-select'
import languages from '@/data/languages.json'

interface LanguageOption {
  code: string
  label: string
}

const languageOptions: LanguageOption[] = languages

const TranslatePage: NextPage = () => {
  const [sourceLang, setSourceLang] = useState<LanguageOption | null>(null)
  const [targetLang, setTargetLang] = useState<LanguageOption | null>(null)
  const [originalText, setOriginalText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [processedText, setProcessedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTranslate = async () => {
    if (!sourceLang || !targetLang || !originalText) {
      alert('Please select your languages and type the original text.')
      return
    }

    setIsLoading(true)
    setTranslatedText('')
    setProcessedText('') // clear old processed result

    console.log(`${sourceLang.code} ${targetLang.code} ${originalText}`)
    try {
      const response = await fetch('http://localhost:8000/translate/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalText,
          source_lang: sourceLang.code,
          dest_lang: targetLang.code,
        }),
      })

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status} - ${response.statusText}`
        )
      }

      const data = await response.json()
      setTranslatedText(data.translated_text)
    } catch (error) {
      console.error('Translation error:', error)
      alert('There was a problem translating your text. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcess = async () => {
    if (!translatedText) {
      alert('No translated text found. Please translate something first.')
      return
    }

    try {
      const res = await fetch('http://localhost:8000/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: translatedText }),
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status} - ${res.statusText}`)
      }

      const data = await res.json()
      setProcessedText(data.processed_text)
    } catch (err) {
      console.error('Process endpoint error:', err)
      alert('There was a problem processing your text. Please try again.')
    }
  }

  const filterLanguageOption = (
    option: { label: string; data: LanguageOption },
    searchInput: string
  ) => {
    const label = option.label.toLowerCase()
    const code = option.data.code.toLowerCase()
    const search = searchInput.toLowerCase()
    return label.includes(search) || code.includes(search)
  }

  return (
    <div className="container">
      <h1 className="title">Text Translation</h1>

      <div className="language-fields">
        <div className="input-group">
          <label className="label">From Language</label>
          <Select
            instanceId="source-language-select"
            options={languageOptions}
            value={sourceLang}
            onChange={(option: SingleValue<LanguageOption>) => setSourceLang(option)}
            placeholder="Type or pick a language..."
            getOptionLabel={(option) => `${option.label} (${option.code})`}
            getOptionValue={(option) => option.code}
            filterOption={filterLanguageOption}
            isClearable
          />
        </div>

        <div className="input-group">
          <label className="label">To Language</label>
          <Select
            instanceId="target-language-select"
            options={languageOptions}
            value={targetLang}
            onChange={(option: SingleValue<LanguageOption>) => setTargetLang(option)}
            placeholder="Type or pick a language..."
            getOptionLabel={(option) => `${option.label} (${option.code})`}
            getOptionValue={(option) => option.code}
            filterOption={filterLanguageOption}
            isClearable
          />
        </div>
      </div>

      <div className="textarea-fields">
        <div className="input-group">
          <label className="label">Original Text</label>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            className="textarea"
            placeholder="Type text here..."
            rows={5}
          />
        </div>

        <div className="input-group">
          <label className="label">Translated Text</label>
          <textarea
            value={translatedText}
            className="textarea"
            placeholder="Translation appears here..."
            rows={5}
            readOnly
          />
        </div>
      </div>

      <div className="button-container">
        <button
          onClick={handleTranslate}
          disabled={isLoading}
          className="translate-button"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"
                ></path>
              </svg>
              Translating...
            </div>
          ) : (
            'Translate'
          )}
        </button>

        {/** 
         * NEW: A large, standout button using a 
         * Microsoft Word–style doc icon + gradient background
         */}
        <button
          onClick={handleProcess}
          disabled={!translatedText}
          className="doc-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            className="icon"
            viewBox="0 0 16 16"
          >
            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 
                     0 0 1-2-2V2a2 2 0 0 1 2-2h4.5L14 4.5z" />
            <path d="M9.5 1v3h3L9.5 1z" fill="#FFF" fillOpacity="0.5" />
            <path
              fillRule="evenodd"
              d="M5.657 7.828l.829-3.314h1.146l.829 3.314h-.637l-.196-.836H6.49l-.196.836h-.637zm1.252-1.57l-.4-1.63h-.033l-.4 
               1.63h.833z"
              fill="#FFF"
            />
            <path d="M8 13.5a.5.5 0 0 1-.5-.5v-2h-1v2a1.5 
                     1.5 0 0 0 3 0v-2h-1v2a.5.5 0 0 1-.5.5z" 
                  fill="#FFF" fillOpacity="0.8" />
          </svg>
          Process as Doc
        </button>
      </div>

      {processedText && (
        <div className="result-container">
          <h2>Processed Result</h2>
          <p>{processedText}</p>
        </div>
      )}

      <style jsx>{`
        .container {
          background-color: #ffffff;
          max-width: 650px;
          margin: 5rem auto;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          color: #003459;
          animation: fadeIn 1s ease-out;
        }

        .title {
          text-align: center;
          margin-bottom: 1.5rem;
          font-size: 1.75rem;
        }

        .language-fields {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .textarea-fields {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        @media (min-width: 640px) {
          .input-group {
            width: 48%;
          }
        }

        .label {
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .textarea {
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
          resize: vertical;
        }

        .button-container {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .translate-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: #007EA7;
          color: #ffffff;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .translate-button:hover:not(:disabled) {
          background-color: #00A7E1;
          transform: scale(1.03);
        }

        .translate-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* --- NEW STYLES for the "Doc" button --- */
        .doc-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 1rem;
          color: #ffffff;
          /* A bold gradient to stand out */
          background: linear-gradient(135deg, #7F00FF 0%, #E100FF 100%);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .doc-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(127, 0, 255, 0.4);
        }

        .doc-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Make the icon a bit bigger and spaced */
        .doc-button .icon {
          width: 24px;
          height: 24px;
        }

        .result-container {
          text-align: center;
          margin-top: 2rem;
        }

        .result-container h2 {
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default TranslatePage
