'use client'

import React, { useState, useEffect, useRef } from 'react'
import type { NextPage } from 'next'
import Select, { SingleValue } from 'react-select'
import languages from '@/data/languages.json'

// Import your header component
import Header from '@components/header/Header'
import Chatbot from '@/components/header/Chatbot'

interface LanguageOption {
  code: string
  label: string
}

const languageOptions: LanguageOption[] = languages

const TranslatePage: NextPage = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text')

  // --- Text Translation states ---
  const [sourceLang, setSourceLang] = useState<LanguageOption | null>(null)
  const [targetLang, setTargetLang] = useState<LanguageOption | null>(null)
  const [originalText, setOriginalText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [fileTranslationType, setFileTranslationType] = useState<
    'videoToDoc' | 'pdfToDocx' | 'pdfToPdf'
  >('pdfToDocx')
  const [fileSourceLang, setFileSourceLang] = useState<LanguageOption | null>(null)
  const [fileTargetLang, setFileTargetLang] = useState<LanguageOption | null>(null)
  const [fileToTranslate, setFileToTranslate] = useState<File | null>(null)
  const [isFileLoading, setIsFileLoading] = useState(false)
  const [fileTranslationResult, setFileTranslationResult] = useState<string>('')

  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  if (!isMounted) return null

  const filterLanguageOption = (
    option: { label: string; data: LanguageOption },
    searchInput: string
  ) => {
    const label = option.label.toLowerCase()
    const code = option.data.code.toLowerCase()
    const search = searchInput.toLowerCase()
    return label.includes(search) || code.includes(search)
  }

  // --- Text Translation Handlers ---
  const handleTranslate = async () => {
    if (!sourceLang || !targetLang || !originalText) {
      alert('Please select both languages and enter some text.')
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

  const handleDownload = async () => {
    if (!translatedText) {
      alert('No translated text to convert. Please translate something first.')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/save-text-to-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: translatedText }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error:', errorData)
        alert('Failed to convert text to .docx.')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'translated_document.docx'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error('Download error:', error)
      alert('Error converting the file.')
    }
  }

  // --- File Translation Handlers ---
  const handleFileTranslate = async () => {
    if (!fileToTranslate || !fileSourceLang || !fileTargetLang) {
      alert('Please select a file and both languages before translating.')
      return
    }
    setIsFileLoading(true)
    setFileTranslationResult('')

    try {
      if (fileTranslationType === 'pdfToPdf') {
        setTimeout(() => {
          setFileTranslationResult('/dummy.pdf')
          setIsFileLoading(false)
        }, 1000)
        return
      }

      const formData = new FormData()
      formData.append('file', fileToTranslate)
      formData.append('src_language', fileSourceLang.code)
      formData.append('dest_language', fileTargetLang.code)
      formData.append('mode', fileTranslationType)

      const response = await fetch('http://localhost:8000/translate/file', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.error('File translation error:', errorData)
        alert('File translation failed.')
        return
      }
      const data = await response.json()
      setFileTranslationResult(data.file_translation_text)
    } catch (error) {
      console.error('File translation error:', error)
      alert('There was a problem with file translation.')
    } finally {
      setIsFileLoading(false)
    }
  }

  const handleFileDownload = async () => {
    if (!fileTranslationResult) {
      alert('No file translation to download.')
      return
    }
    if (fileTranslationType === 'pdfToPdf') {
      const a = document.createElement('a')
      a.href = fileTranslationResult
      a.download = 'translated_document.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } else {
      alert('File download not implemented for this file type.')
    }
  }

  const getAcceptedFileTypes = () => {
    if (fileTranslationType === 'videoToDoc') return 'video/mp4'
    return 'application/pdf'
  }

  // Handlers for the custom dropzone (native drag and drop)
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFileToTranslate(e.dataTransfer.files[0])
    }
  }

  const handleClickDropzone = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full h-full">
      <Header />
      <Chatbot/>
      <div className="w-full bg-white mt-4">
        <div className="flex gap-8">
          <div
            className={`w-1/2 py-4 px-6 text-center font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === 'text' ? 'bg-[#003459] text-white' : 'bg-white'
            }`}
            onClick={() => setActiveTab('text')}
          >
            Text Translation
          </div>
          <div
            className={`w-1/2 py-3 px-6 text-center font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === 'file' ? 'bg-[#003459] text-white' : 'bg-white'
            }`}
            onClick={() => setActiveTab('file')}
          >
            File Translation
          </div>
        </div>
      </div>

      {/* TEXT TRANSLATION TAB */}
      {activeTab === 'text' && (
        <div className="w-full bg-white rounded-lg shadow p-8 h-[600px] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm h-full">
              <h2 className="text-center text-lg font-semibold text-[#003459] mb-4">
                Text translation
              </h2>

              <div className="mb-4">
                <label className="block mb-2 font-semibold text-[#003459]">
                  From:
                </label>
                <Select
                  instanceId="source-language-select"
                  options={languageOptions}
                  value={sourceLang}
                  onChange={(option: SingleValue<LanguageOption>) =>
                    setSourceLang(option)
                  }
                  placeholder="Input language"
                  getOptionLabel={(option) =>
                    `${option.label} (${option.code})`
                  }
                  getOptionValue={(option) => option.code}
                  filterOption={filterLanguageOption}
                  isClearable
                />
              </div>

              <div className="mb-4 flex-1">
                <label className="block mb-2 font-semibold text-[#003459]">
                  Type text here
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded resize-vertical h-full"
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                />
              </div>

              <button
                onClick={handleTranslate}
                disabled={isLoading}
                className="w-full py-3 bg-[#003459] text-white font-semibold rounded cursor-pointer transition-all duration-200 hover:bg-[#002d40] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Translating...' : 'Translate'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 shadow-sm h-full flex flex-col">
              <h2 className="text-center text-lg font-semibold text-[#003459] mb-4">
                Translation result
              </h2>

              <div className="mb-4 flex-1">
                <label className="block mb-2 font-semibold text-[#003459]">
                  To:
                </label>
                <Select
                  instanceId="target-language-select"
                  options={languageOptions}
                  value={targetLang}
                  onChange={(option: SingleValue<LanguageOption>) =>
                    setTargetLang(option)
                  }
                  placeholder="Output language"
                  getOptionLabel={(option) =>
                    `${option.label} (${option.code})`
                  }
                  getOptionValue={(option) => option.code}
                  filterOption={filterLanguageOption}
                  isClearable
                />
                <textarea
                  className="w-full p-3 border border-gray-300 rounded resize-vertical mt-4 min-h-[300px]"
                  value={translatedText}
                  readOnly
                />
              </div>

              <button
                onClick={handleDownload}
                disabled={!translatedText}
                className="w-full py-3 bg-[#003459] text-white font-semibold rounded cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Convert to File (docx)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILE TRANSLATION TAB */}
      {activeTab === 'file' && (
        <div className="w-full bg-white rounded-lg shadow p-8 h-[800px] overflow-y-auto">
          {/* Horizontal bar for file type selection */}
          <div className="flex justify-center mb-4 gap-4">
            <div
              className={`py-3 px-6 border border-[#003459] rounded font-semibold cursor-pointer ${
                fileTranslationType === 'videoToDoc'
                  ? 'bg-[#003459] text-white'
                  : 'bg-white'
              }`}
              onClick={() => setFileTranslationType('videoToDoc')}
            >
              Video to docx
            </div>
            <div
              className={`py-3 px-6 border border-[#003459] rounded font-semibold text-center cursor-pointer transition-all ${
                fileTranslationType === 'pdfToDocx'
                  ? 'bg-[#003459] text-white'
                  : 'bg-white'
              }`}
              onClick={() => setFileTranslationType('pdfToDocx')}
            >
              PDF to docx
            </div>
            <div
              className={`py-3 px-6 border border-[#003459] rounded font-semibold text-center cursor-pointer transition-all ${
                fileTranslationType === 'pdfToPdf'
                  ? 'bg-[#003459] text-white'
                  : 'bg-white'
              }`}
              onClick={() => setFileTranslationType('pdfToPdf')}
            >
              PDF to PDF
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm h-full flex flex-col">
              <h2 className="text-center text-lg font-semibold mb-4">
                File translation
              </h2>

              <div className="mb-4">
                <label className="block mb-2 font-semibold text-[#003459]">
                  From:
                </label>
                <Select
                  instanceId="file-source-language-select"
                  options={languageOptions}
                  value={fileSourceLang}
                  onChange={(option: SingleValue<LanguageOption>) =>
                    setFileSourceLang(option)
                  }
                  placeholder="Input language"
                  getOptionLabel={(option) =>
                    `${option.label} (${option.code})`
                  }
                  getOptionValue={(option) => option.code}
                  filterOption={filterLanguageOption}
                  isClearable
                />
              </div>

              {/* Custom Tailwind dropzone */}
              <div className="mb-4">
                <label className="block mb-2 font-semibold text-[#003459]">
                  {fileTranslationType === 'videoToDoc'
                    ? 'Choose .mp4 file'
                    : 'Choose .pdf file'}
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleClickDropzone}
                  className={`flex flex-col items-center justify-center border-2 border-dashed p-6 rounded cursor-pointer transition-all duration-200 ${
                    dragActive ? 'border-blue-500' : 'border-gray-300'
                  } h-64`}
                >
                  <input
                    type="file"
                    accept={getAcceptedFileTypes()}
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setFileToTranslate(e.target.files[0])
                      }
                    }}
                    className="hidden"
                  />
                  {fileToTranslate ? (
                    <p>{fileToTranslate.name}</p>
                  ) : (
                    <p>
                      {fileTranslationType === 'videoToDoc'
                        ? 'Drag and drop a .mp4 file here, or click to select one'
                        : 'Drag and drop a .pdf file here, or click to select one'}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleFileTranslate}
                disabled={isFileLoading}
                className="w-full py-3 bg-[#003459] text-white font-semibold rounded cursor-pointer transition-all duration-200 hover:bg-[#002d40] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isFileLoading ? 'Translating...' : 'Translate File'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 shadow-sm h-full flex flex-col">
              <h2 className="text-center text-lg font-semibold text-[#003459] mb-4">
                Translation result
              </h2>

              <div className="mb-4 flex-1">
                <label className="block mb-2 font-semibold text-[#003459]">
                  To:
                </label>
                <Select
                  instanceId="file-target-language-select"
                  options={languageOptions}
                  value={fileTargetLang}
                  onChange={(option: SingleValue<LanguageOption>) =>
                    setFileTargetLang(option)
                  }
                  placeholder="Output language"
                  getOptionLabel={(option) =>
                    `${option.label} (${option.code})`
                  }
                  getOptionValue={(option) => option.code}
                  filterOption={filterLanguageOption}
                  isClearable
                />
                <div className="mt-4 flex-1">
                  {fileTranslationResult ? (
                    <iframe
                      src={fileTranslationResult}
                      className="w-full h-full border-0"
                      title="PDF Preview"
                    />
                  ) : (
                    <p>No preview available.</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleFileDownload}
                disabled={!fileTranslationResult}
                className="w-full py-3 bg-gradient-to-r from-purple-700 to-pink-500 text-white font-semibold rounded cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TranslatePage
  