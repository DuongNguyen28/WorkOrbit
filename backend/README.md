# 📜 FastAPI Backend for WorkOrbit

This is the **backend service** for WorkOrbit, built with **FastAPI**. It provides various **translation services** for **text, PDFs, and videos** using `googletrans` and `pymupdf`.

## 🚀 Features
- **Text Translation** (via `googletrans`)
- **PDF to PDF Translation** (overlays translated text on original PDFs)
- **Video Subtitle Translation**
- **Save Text to Document**
- **CORS Enabled** (for frontend communication)

---

## 📦 Tech Stack
- **FastAPI** 🚀 (Lightweight web framework)
- **Uvicorn** ⚡ (ASGI server)
- **Googletrans** 🌎 (Translation API)
- **PyMuPDF** 📄 (PDF handling)
- **Python 3.9+** 🐍 (Backend language)

---

## 🛠 Installation

### **1️⃣ Clone the Repository**

### **2️⃣  Install Dependencies**
```bash
pip install -r requirements.txt
```

---

## 🔥 Running the Server
Start the backend server using **Uvicorn**:
```bash
uvicorn backend.app:app --reload
```

The server will run on:  
📌 **http://127.0.0.1:8000/docs**

---

## 📡 API Endpoints

### **1️⃣ Translate PDF**
```
POST /translate/pdf
```
- **Params:**
  - `src_language` (str) → Source language (e.g., `en`)
  - `dest_language` (str) → Target language (e.g., `vi`)
  - `dest_file` (str) → Output file format (`pdf` or `docx`)

---

### **2️⃣ Translate Text**
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

---

### **3️⃣ Translate Video**
```
POST /translate/video
```
- **Params:**
  - `video_url` (str) → URL of the video
  - `src_language` (str) → Source language
  - `dest_language` (str) → Target language

---

🚀 Happy coding!
