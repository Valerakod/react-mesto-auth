import React, { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Header from "./Header.js";
import Footer from "./Footer.js";
import Main from "./Main.js";
import api from "../utils/Api.js";
import PopupWithForm from "./PopupWithForm.js";
import EditProfilePopup from "./EditProfilePopup.js";
import EditAvatarPopup from "./EditAvatarPopup.js";
import AddPlacePopup from "./AddPlacePopup.js";
import ImagePopup from "./ImagePopup";
import { CurrentUserContext } from "../contexts/CurrentUserContext.js";
import Login from "./Login.js";
import Register from "./Register.js";
import InfoTooltip from "./InfoTooltip.js";
import ProtectedRoute from "./ProtectedRoute.js";
import auth from "./Auth.js";
import Page404 from "./Page404";

function App() {
  const navigate = useNavigate();
  //стейты попапов
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);

  const [selectedCard, setSelectedCard] = useState({ name: "", link: "" });

  const [currentUser, setCurrentUser] = useState({});

  const [cards, setCards] = useState([]);
  const [isInfoTooltip, setIsInfoTooltip] = useState(false);

  //стейт регистрации пользователя
  const [currentEmail, setCurrentEmail] = useState("");
  const [successRegister, setSuccessRegister] = useState(false);

  // стейт маршрутов
  const [currentRoute, setCurrentRoute] = useState("");

  //стейт логина
  const [loggedIn, setLoggedIn] = useState(false);

  //открытие попапов
  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }
  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }
  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }
  //закрытие попапов
  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard({ name: "", link: "" });
  }
  function handleCardClick(card) {
    setSelectedCard(card);
  }
  function handleRegisterClick() {
    setIsInfoTooltip(true);
  }

  // получаем массив карточек
  useEffect(() => {
    api
      .getInitialCards()
      .then((res) => setCards(res))
      .catch((err) => console.log(err));
  }, []);

  // получаем информацию о пользователе
  useEffect(() => {
    api
      .getUserInfo()
      .then((userInfo) => {
        setCurrentUser(userInfo);
      })
      .catch((err) => {
        console.log(`Ошибка! ${err}`);
      });
  }, []);

  //смена информации о пользователе
  function handleUpdateUser(data) {
    api
      .setUserInfo(data)
      .then((userInfo) => {
        setCurrentUser(userInfo);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Ошибка! ${err}`);
      });
  }

  //смена аватара
  function handleUpdateAvatar(avatar) {
    api
      .setAvatar(avatar)
      .then((userAvatar) => {
        setCurrentUser(userAvatar);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Ошибка! ${err}`);
      });
  }

  //управление лайками
  function handleCardLike(card) {
    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some((i) => i._id === currentUser._id);

    // Отправляем запрос в API и получаем обновлённые данные карточки
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((err) => {
        console.log(`Ошибка! ${err}`);
      });
  }
  //добавление карточек
  function handleAddCard({ name, link }) {
    api
      .addCard({ name, link })
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(`Ошибка! ${err}`);
      });
  }
  //удаление карточек
  function handleCardDelete(card) {
    api
      .deleteCard(card._id)
      .then(() => {
        setCards((state) => state.filter((c) => c._id !== card._id));
      })
      .catch((err) => {
        console.log(`Ошибка! ${err}`);
      });
  }

  // регистрация
  function handleRegister({ registerData, setRegisterData }) {
    auth
      .register(registerData)
      .then(() => {
        setSuccessRegister(true);
        setIsInfoTooltip(true);
        navigate("/signin");

        setRegisterData({
          email: "",
          password: "",
        });

        setTimeout(() => {
          setIsInfoTooltip(false);
        }, 1000);
      })
      .catch((err) => {
        setSuccessRegister(false);
        setIsInfoTooltip(true);
        setTimeout(() => {
          setIsInfoTooltip(false);
        }, 1000);

        console.log(`Внимание! ${err}`);
      });
  }

  // авторизация
  function handleAuthorize({ loginData, setLoginData }) {
    auth
      .authorize(loginData)
      .then((data) => {
        if (data.token) {
          setLoggedIn(true);
          navigate("/");
          localStorage.setItem("token", data.token);

          setLoginData({
            email: "",
            password: "",
          });
        }
      })

      .catch((err) => {
        console.log(`Внимание! ${err}`);
      });
  }

  useEffect(() => {
    function handleTokenCheck() {
      if (localStorage.getItem("token")) {
        const token = localStorage.getItem("token");
        auth
          .checkToken(token)
          .then((data) => {
            if (data) {
              setCurrentEmail(data.data.email);
              setLoggedIn(true);
              navigate("/");
            }
          })
          .catch((err) => {
            console.log(`Внимание! ${err}`);
          });
      }
    }

    handleTokenCheck();
  }, []);

  //выход, удаление токена из локального хранилища
  function handleOutput() {
    if (localStorage.getItem("token")) {
      localStorage.removeItem("token");
      navigate("/signin");
      setLoggedIn(false);
    }
  }

  return (
    <div className="App">
      <div className="page">
        <CurrentUserContext.Provider value={currentUser}>
          <Header
            currentRoute={currentRoute}
            loggedIn={loggedIn}
            email={currentEmail}
            onOut={handleOutput}
          />
          <Routes>
            <Route
              exact
              path="/"
              element={
                <ProtectedRoute loggedIn={loggedIn}>
                  <Main
                    onEditProfile={handleEditProfileClick}
                    onAddPlace={handleAddPlaceClick}
                    onEditAvatar={handleEditAvatarClick}
                    onCardClick={handleCardClick}
                    cards={cards}
                    onCardLike={handleCardLike}
                    onCardDelete={handleCardDelete}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              exact
              path="/signup"
              element={
                <Register
                  setCurrentRoute={setCurrentRoute}
                  onRegister={handleRegister}
                  onInfoTooltip={handleRegisterClick}
                  successRegister={successRegister}
                />
              }
            />
            <Route
              exact
              path="/signin"
              element={
                <Login
                  setCurrentRoute={setCurrentRoute}
                  onLogin={handleAuthorize}
                  navigate={navigate}
                  loggedIn={loggedIn}
                />
              }
            />
            <Route path="/*" element={<Page404 />}></Route>
          </Routes>

          {loggedIn && <Footer />}

          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
          />

          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onAddCard={handleAddCard}
          />

          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
          />

          <PopupWithForm
            className="popup__form popup__form_delete-card"
            name="popup"
          >
            <h2 className="popup__title">Вы уверены?</h2>
            <button
              className="popup__save-button  popup__delete-card"
              type="submit"
            >
              Да
            </button>
            <button
              className="popup__close-button popup__close-button_edit"
              type="button"
              aria-label="Закрыть"
            ></button>
          </PopupWithForm>

          <ImagePopup onClose={closeAllPopups} card={selectedCard} />
          <InfoTooltip
            name="registration"
            isOpen={isInfoTooltip}
            onClose={closeAllPopups}
            registrationСompleted={successRegister}
          />
        </CurrentUserContext.Provider>
      </div>
    </div>
  );
}

export default App;
