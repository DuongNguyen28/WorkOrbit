import os
from dotenv import load_dotenv

# Load environment variables from a .env file
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)
# load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GCP_API_KEY = os.getenv("GCP_API_KEY")