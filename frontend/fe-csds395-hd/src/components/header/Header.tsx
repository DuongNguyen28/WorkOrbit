import React from 'react'
import Image from 'next/image'

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header__left">
        <Image src="/images/WorkOrbitLogo.png" alt="alt" width={98} height={100} /> 
        <span className="header__title font-bold text-5xl">Work Orbit</span>
      </div>

      <div className="header__right">
        <button>
          <Image src="/images/User.png" alt="alt" width={41} height={50} />
        </button>
        <button className="header__icon-button">
          <Image src="/images/Vector.png" alt="alt" width={41} height={50} />
        </button>
        <button className="header__icon-button">
          <Image src="/images/More.png" alt="alt" width={41} height={50} />
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
          font-family: 'Montserrat';
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

export default Header
