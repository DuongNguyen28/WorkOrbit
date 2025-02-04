// pages/index.tsx

'use client'

import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'

import Link from 'next/link'

const Page: NextPage = () => {
  const router = useRouter()

  const moveToLogin = () => {
    router.push('/login')
  }

  const moveToSignUp = () => {
    router.push('/signup')
  }

  return (
    <div className="container">
      <h1>Welcome to the Simple Next.js App</h1>
      <p>This is your home page.</p>
      <div className="links">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={moveToLogin}>Go to Login</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={moveToSignUp}>Go to Sign Up</button>
      </div>

      {/* Add local scoped styling */}
      <style jsx>{`
        .container {
          background-color: #ffffff; /* White card background */
          max-width: 500px;
          margin: 5rem auto 0 auto;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          text-align: center;
          animation: fadeIn 1s ease-out;
        }

        h1 {
          color: #003459; /* Darker blue for headings */
          margin-bottom: 1rem;
        }

        p {
          margin-bottom: 2rem;
        }

        .links {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .links a {
          background-color: #007EA7; /* Slightly darker teal-blue */
          color: #ffffff;
          padding: 0.75rem 1.25rem;
          border-radius: 4px;
          text-decoration: none;
          transition: transform 0.2s ease, background-color 0.2s ease;
        }

        .links a:hover {
          background-color: #00A7E1; /* Bright energetic blue on hover */
          transform: scale(1.05);
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

export default Page
