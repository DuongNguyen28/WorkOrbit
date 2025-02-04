'use client'

import React, { useState } from 'react'
import type { NextPage } from 'next'
import Select, { SingleValue } from 'react-select'
import languages from '@/data/languages.json'

// Example language options: You can add more or fetch them dynamically
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
  const [isLoading, setIsLoading] = useState(false)

  const handleTranslate = async () => {
    if (!sourceLang || !targetLang || !originalText) {
      alert('Please select your languages and type the original text.')
      return
    }

    setIsLoading(true)
    setTranslatedText('')

    // Simulate a translation API call
    setTimeout(() => {
      const mockResult = `${originalText} [translated from ${sourceLang.label} to ${targetLang.label}]`
      setTranslatedText(mockResult)
      setIsLoading(false)
    }, 2000)
  }

  /**
   * Custom filter for react-select options:
   * - Matches if the user-typed input is found in either the language label or the language code.
   */
  const filterLanguageOption = (option: { label: string; data: LanguageOption }, searchInput: string) => {
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
            options={languageOptions}
            value={sourceLang}
            onChange={(option: SingleValue<LanguageOption>) => setSourceLang(option)}
            placeholder="Type or pick a language..."
            // Show "English (en)" in the dropdown, for example
            getOptionLabel={(option) => `${option.label} (${option.code})`}
            getOptionValue={(option) => option.code}
            // Enable partial matching on code or label
            filterOption={filterLanguageOption}
            isClearable
          />
        </div>

        <div className="input-group">
          <label className="label">To Language</label>
          <Select
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
          margin: 0 auto;
          display: block;
        }

        .translate-button:hover:not(:disabled) {
          background-color: #00A7E1;
          transform: scale(1.03);
        }

        .translate-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
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
