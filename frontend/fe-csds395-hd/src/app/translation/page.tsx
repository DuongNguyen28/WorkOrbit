'use client'

import React, { useState, useEffect, useRef } from 'react'
import type { NextPage } from 'next'
import Select, { SingleValue } from 'react-select'
import languages from '@/data/languages.json'

interface LanguageOption {
  code: string
  label: string
}

const languageOptions: LanguageOption[] = languages

const TranslatePage: NextPage = () => {
  // Toggle between "text" and "pdf" features.
  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text')

  // --- Text Translation states ---
  const [sourceLang, setSourceLang] = useState<LanguageOption | null>(null)
  const [targetLang, setTargetLang] = useState<LanguageOption | null>(null)
  const [originalText, setOriginalText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // --- PDF Conversion states ---
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  // Independent language selectors for PDF conversion.
  const [pdfSourceLang, setPdfSourceLang] = useState<LanguageOption | null>(null)
  const [pdfTargetLang, setPdfTargetLang] = useState<LanguageOption | null>(null)
  // New state for PDF conversion loading
  const [isPdfLoading, setIsPdfLoading] = useState(false)

  // Ref for our hidden file input within the dropzone.
  const dropzoneRef = useRef<HTMLInputElement>(null)

  // Use this state to ensure client-side-only rendering (for hydration consistency)
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  if (!isMounted) return null

  // --- Text Translation Handlers ---
  const handleTranslate = async () => {
    if (!sourceLang || !targetLang || !originalText) {
      alert('Please select your languages and type the original text.')
      return
    }

    setIsLoading(true)
    setTranslatedText('')

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

  // This handler retains your "Convert to Document" (Doc) button functionality.
  const handleDownload = async () => {
    if (!translatedText) {
      alert('No translated text found. Please translate something first.')
      return
    }
    const response = await fetch('http://localhost:8000/save-text-to-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: translatedText }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error:', errorData)
      return
    }

    // Download the generated document
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'translated_document.docx'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  // --- PDF Conversion Handlers ---
  const handlePDFToPDF = () => {
    if (!pdfFile) {
      alert('Please select a PDF file first.')
      return
    }
    alert('PDF to PDF conversion not implemented yet.')
  }

  // New implementation for PDF to DOCX using your backend API and independent PDF language selectors.
  const handlePDFToDocx = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file first.')
      return
    }
    if (!pdfSourceLang || !pdfTargetLang) {
      alert('Please select the source and target languages for PDF conversion.')
      return
    }

    setIsPdfLoading(true)
    const formData = new FormData()
    formData.append('file', pdfFile)
    formData.append('src_language', pdfSourceLang.code)
    formData.append('dest_language', pdfTargetLang.code)

    try {
      const response = await fetch('http://localhost:8000/translate/pdf', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error:', errorData)
        alert('Error: ' + (errorData.error || 'Translation failed.'))
        return
      }
      // Assume the backend returns the translated DOCX file as a blob.
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'translated_document.docx'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error('PDF to DOCX conversion error:', error)
      alert('There was a problem translating the PDF to DOCX.')
    } finally {
      setIsPdfLoading(false)
    }
  }

  // Dropzone event handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.')
      } else {
        setPdfFile(file)
      }
      e.dataTransfer.clearData()
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Clicking the dropzone will trigger the hidden file input.
  const handleClickDropzone = () => {
    if (dropzoneRef.current) {
      dropzoneRef.current.click()
    }
  }

  // Custom filter for react-select options.
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
      <h1 className="title">Translation Portal</h1>
      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          Text Translation
        </button>
        <button
          className={`tab-button ${activeTab === 'pdf' ? 'active' : ''}`}
          onClick={() => setActiveTab('pdf')}
        >
          PDF Conversion
        </button>
      </div>

      {activeTab === 'text' && (
        <div className="text-translation-section">
          <div className="language-fields">
            <div className="input-group">
              <label className="label">From Language</label>
              <Select
                instanceId="source-language-select"
                options={languageOptions}
                value={sourceLang}
                onChange={(option: SingleValue<LanguageOption>) =>
                  setSourceLang(option)
                }
                placeholder="Type or pick a language..."
                getOptionLabel={(option) =>
                  `${option.label} (${option.code})`
                }
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
                onChange={(option: SingleValue<LanguageOption>) =>
                  setTargetLang(option)
                }
                placeholder="Type or pick a language..."
                getOptionLabel={(option) =>
                  `${option.label} (${option.code})`
                }
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
                rows={8}
              />
            </div>
            <div className="input-group">
              <label className="label">Translated Text</label>
              <textarea
                value={translatedText}
                className="textarea"
                placeholder="Translation appears here..."
                rows={8}
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
            <button
              onClick={handleDownload}
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
              Convert to Document
            </button>
          </div>
        </div>
      )}

      {activeTab === 'pdf' && (
        <div className="pdf-conversion-section">
          <h2 className="section-title">PDF Conversion</h2>
          {/* New language selectors for PDF conversion */}
          <div className="pdf-language-fields language-fields">
            <div className="input-group">
              <label className="label">From Language</label>
              <Select
                instanceId="pdf-source-language-select"
                options={languageOptions}
                value={pdfSourceLang}
                onChange={(option: SingleValue<LanguageOption>) =>
                  setPdfSourceLang(option)
                }
                placeholder="Type or pick a language..."
                getOptionLabel={(option) =>
                  `${option.label} (${option.code})`
                }
                getOptionValue={(option) => option.code}
                filterOption={filterLanguageOption}
                isClearable
              />
            </div>
            <div className="input-group">
              <label className="label">To Language</label>
              <Select
                instanceId="pdf-target-language-select"
                options={languageOptions}
                value={pdfTargetLang}
                onChange={(option: SingleValue<LanguageOption>) =>
                  setPdfTargetLang(option)
                }
                placeholder="Type or pick a language..."
                getOptionLabel={(option) =>
                  `${option.label} (${option.code})`
                }
                getOptionValue={(option) => option.code}
                filterOption={filterLanguageOption}
                isClearable
              />
            </div>
          </div>

          <div className="pdf-upload">
            <div
              className="dropzone border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer"
              onClick={handleClickDropzone}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </div>

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0]
                    if (file.type !== 'application/pdf') {
                      alert('Please select a PDF file.')
                      return
                    }
                    setPdfFile(file)
                  }
                }}
                className="hidden"
                ref={dropzoneRef}
              />
            </div>
            {pdfFile && (
              <p className="file-name">Selected file: {pdfFile.name}</p>
            )}
          </div>
          <div className="pdf-buttons">
            <button
              onClick={handlePDFToPDF}
              disabled={!pdfFile}
              className="pdf-button"
            >
              PDF to PDF
            </button>
            <button
              onClick={handlePDFToDocx}
              disabled={!pdfFile || isPdfLoading}
              className="pdf-button"
            >
              {isPdfLoading ? (
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
                  Processing...
                </div>
              ) : (
                'PDF to DOCX'
              )}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .container {
          background-color: #ffffff;
          max-width: 900px;
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
          font-size: 2rem;
        }

        .tab-container {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .tab-button {
          padding: 0.75rem 1.5rem;
          border: 2px solid #007ea7;
          background: transparent;
          color: #007ea7;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-button.active {
          background: #007ea7;
          color: #ffffff;
        }

        .language-fields,
        .pdf-language-fields,
        .textarea-fields {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          justify-content: center;
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
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1.1rem;
          resize: vertical;
          min-height: 150px;
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
          background-color: #007ea7;
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
          background-color: #00a7e1;
          transform: scale(1.03);
        }

        .translate-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Styles for the Convert to Document (Doc) button */
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
          background: linear-gradient(135deg, #7f00ff 0%, #e100ff 100%);
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

        .doc-button .icon {
          width: 24px;
          height: 24px;
        }

        /* PDF conversion section styles */
        .pdf-conversion-section {
          text-align: center;
          border-top: 2px solid #ccc;
          padding-top: 2rem;
          margin-top: 2rem;
        }

        .pdf-upload {
          margin-bottom: 1rem;
        }

        .file-name {
          font-size: 1rem;
          font-style: italic;
          margin-top: 0.5rem;
        }

        .pdf-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .pdf-button {
          background: linear-gradient(135deg, #ff7e5f, #feb47b);
          color: #ffffff;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .pdf-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(255, 126, 95, 0.4);
        }

        .pdf-button:disabled {
          opacity: 0.6;
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
