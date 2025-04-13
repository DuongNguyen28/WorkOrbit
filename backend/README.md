# 📜 WorkOrbit Backend API

This is the **backend service** for WorkOrbit — a document, video, and language processing pipeline built using **FastAPI**. It powers the core logic behind file translation, embedding, indexing, and intelligent search across your workspace documents.

---

## 🚀 Features

- **PDF Translation (PDF ➜ PDF / PDF ➜ DOCX)**
- **Text Translation** (supports any language pair)
- **Save-to-Document** utility
- **Language Detection** (text and file-based)
- **Semantic Search & Embedding** using `SentenceTransformer` + `Elasticsearch`
- **Elasticsearch Indexing** with pipeline and base64 ingestion
- **Google Cloud Storage Uploads** (original & translated files)
- **User Authentication** (register/login)
- **CORS Enabled** for frontend interaction

---

## 🧰 Tech Stack

- **FastAPI** ⚡ – REST framework
- **Uvicorn** 🚀 – ASGI server
- **Google Translate API** – Translation
- **OpenAI** - Chatbot
- **PyMuPDF** 📄 – PDF reading + annotation
- **Elasticsearch** 🔍 – Document indexing and semantic search
- **Sentence Transformers** 🤖 – Embedding model: `all-MiniLM-L6-v2`
- **GCS (Google Cloud Storage)** ☁️ – File upload for access and retrieval
- **Pydantic V2** 🧪 – Schema validation
- **Python 3.9+** 🐍 – Language runtime

---

## ⚙️ Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/workorbit-backend.git
cd workorbit-backend
```

### 2️⃣ Set Up the Virtual Environment
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```
---

## 🚦 Running the Server
```bash
uvicorn backend.app:app --reload
```

📍 Visit interactive API docs at:  
**http://127.0.0.1:8000/docs**

---

## 🔌 API Endpoints

### 🔁 Translate PDF (PDF ➜ PDF or DOCX)
```
POST /translate/pdf
```
- **Form Data:**
  - `file`: PDF file upload
  - `src_language` (str)
  - `dest_language` (str)
  - `dest_file` (str) – Choose: `pdf` or `docx`

### 📄 Save Text to Document
```
POST /save-text-to-doc
```
- **Form Data:**
  - `text`: plain text
  - `filename`: name of the output file

### 🔤 Translate Text
```
POST /translate/text
```
- **Body (JSON):**
```json
{
  "text": "Hello, world!",
  "src_language": "en",
  "dest_language": "vi"
}
```

### 🎬 Translate Video Subtitles
```
POST /translate/video
```
- **Query Params:**
  - `video_url`: YouTube link
  - `src_language`
  - `dest_language`

### 🧬 Detect Language (Text)
```
POST /detect-language/text
```
- **Form Data:** `text`

### 🧬 Detect Language (File)
```
POST /detect-language/file
```
- **Form Data:** `file`

### 📥 Upload File for Search Indexing
```
POST /search/upload
```
- Uploads a file to both Elasticsearch and GCS
- Handles original + translated versions

### 🔍 Perform Search
```
POST /search/
```
- **Body:**
```json
{
  "query": "Find document"
}
```

### 🆔 Get My ID (test endpoint)
```
POST /search/getdoc
```

### 💬 Chat API
```
POST /api/chat
```
- Chatbot interface using OpenAI

### 🔐 Register / Login
```
POST /register
POST /login
```


---

## 📝 Notes
- All translated files are uploaded to GCS under structured paths.
- Elasticsearch is used to index both text content and embeddings for full-text and semantic search.
- Async + multiprocessing is leveraged for I/O intensive workloads.

---

🚀 Happy coding!