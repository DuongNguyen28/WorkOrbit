// pages/signup.tsx

'use client'

import type { NextPage } from 'next'
import Link from 'next/link'
import { useState, FormEvent } from 'react'

const Signup: NextPage = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const handleSignup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Mock signup logic
    console.log({ email, password })
    alert('Signed up (mock)!')
  }

  return (
    <div className="container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSignup}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <Link href="/login">Login here</Link>.
      </p>

      <style jsx>{`
        .container {
          background-color: #ffffff;
          max-width: 400px;
          margin: 5rem auto;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          color: #003459;
          animation: fadeIn 1s ease-out;
        }

        h1 {
          margin-bottom: 1rem;
          text-align: center;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        label {
          font-weight: 600;
        }

        input {
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        button {
          background-color: #007EA7;
          color: #ffffff;
          padding: 0.75rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        button:hover {
          background-color: #00A7E1;
          transform: scale(1.03);
        }

        p {
          text-align: center;
        }

        a {
          color: #00A7E1;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
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

export default Signup
