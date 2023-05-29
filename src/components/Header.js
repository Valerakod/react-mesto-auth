import logo from "../images/logo.png";
import React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function Header({ email, onSignOut, currentRoute }) {
  const [headerInfo, setHeaderInfo] = useState({});
  //const location = useLocation();

  const handleLinkClick = () => {
    if (currentRoute === "/") {
      onSignOut();
    }
  };

  useEffect(() => {
    let headerInfo = {};
    if (currentRoute === "/") {
      headerInfo = {
        email: email,
        link: "/signin",
        linkText: "Выйти",
      };
    } else if (currentRoute === "/signup") {
      headerInfo = {
        email: "",
        link: "/signin",
        linkText: "Войти",
      };
    } else if (currentRoute === "/signin") {
      headerInfo = {
        email: "",
        link: "/signup",
        linkText: "Регистрация",
      };
    }
    setHeaderInfo(headerInfo);
  }, [currentRoute]);

  return (
    <header className="header">
      <img className="header__logo" src={logo} alt="Логотип" />
      <div className="header__container">
        <p className="header__email">{headerInfo.email}</p>
        <Link
          className="header__link"
          to={headerInfo.link}
          onClick={handleLinkClick}
        >
          {headerInfo.linkText}
        </Link>
      </div>
    </header>
  );
}

export default Header;
