import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation';


export default function Header(){
  const router = useRouter();
  
  const handleHeaderClick = (action: string) => {
    switch (action) {
      case 'signout':
        router.push('/home');
        // Add signout logic here if needed
        break;
      case 'user':
        router.push('/user');
        break;
      default:
        router.push('/landing');
    }
  };

  return (
    <header className="header">
      <div className="header__left" onClick={() => handleHeaderClick('landing')}>
        <Image src="/images/WorkOrbitLogo.png" alt="alt" width={98} height={100} /> 
        <h1 className="header__title">WorkOrbit</h1>
      </div>

      <div className="header__right">
        <button>
          <Image src="/images/User.png" alt="alt" width={41} height={50} />
        </button>
        <button className="header__icon-button">
          <Image src="/images/Vector.png" alt="alt" width={41} height={50} />
        </button>
      </div>

      <style jsx>{`
        .header {
          width: 100%;
          height: 100px;
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          background-color: #003459;
        }

        .header__left {
          display: flex;
          align-items: center;
        }

        .header__logo {
          height: 50px; /* Adjust as needed */
          width: auto;
        }

        .header__title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #FFFFFF;
          font-family: 'Montserrat', sans-serif;
        }

        .header__right {
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }

        .header__icon-button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: #333;
        }
      `}</style>
    </header>
  )
}

