import { enableValidation, clearValidation } from "./components/validation.js";
import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { getUserInfo, getCardList, setUserInfo, setUserAvatar, addNewCard, changeLikeCardStatus, deleteCardFromServer } from './components/api.js';

const validationSettings = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

enableValidation(validationSettings);

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const likeCard = (cardElement, cardData) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");

  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardData._id, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_is-active");
      if (likeCount) {
        likeCount.textContent = updatedCard.likes.length;
      }
    })
    .catch((err) => {
      console.error("Ошибка лайка:", err);
      alert("Не удалось изменить лайк");
    });
};

const deleteCard = (cardElement, cardData) => {
  deleteCardFromServer(cardData._id)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => {
      console.error("Ошибка удаления:", err);
      alert("Не удалось удалить карточку");
    });
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = profileForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.error('Ошибка сохранения профиля:', err);
      alert('Не удалось сохранить. Проверьте интернет.');
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = avatarForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.error('Ошибка сохранения аватара:', err);
      alert('Не удалось обновить аватар. Проверьте ссылку и интернет.');
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = cardForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Создание...';
  submitButton.disabled = true;

  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCardData) => {
      const cardElement = createCardElement(newCardData, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: likeCard,
        onDeleteCard: deleteCard,
        onInfoClick: handleInfoClick
      });
      placesWrap.prepend(cardElement);

      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => {
      console.error('Ошибка добавления карточки:', err);
      alert('Не удалось добавить карточку. Проверьте ссылку и интернет.');
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    placesWrap.innerHTML = '';

    cards.forEach(cardData => {
      const cardElement = createCardElement(cardData, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: likeCard,
        onDeleteCard: deleteCard,
        onInfoClick: handleInfoClick
      });
      placesWrap.append(cardElement);
    });

    console.log('Всё загружено с сервера!');
  })
  .catch(err => {
    console.error('Ошибка загрузки данных:', err);
  });

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalLikesTitle = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalLikesList = cardInfoModalWindow.querySelector(".popup__list");

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const createInfoString = (term, description) => {
  const template = document.getElementById("popup-info-definition-template").content.cloneNode(true);
  template.querySelector(".popup__info-term").textContent = term;
  template.querySelector(".popup__info-description").textContent = description;
  return template;
};

const createLikeUserPreview = (user) => {
  const template = document.getElementById("popup-info-user-preview-template").content.cloneNode(true);
  const item = template.querySelector(".popup__list-item");

  item.textContent = user.name || "Пользователь";
  item.style.margin = "5px 0";

  return item;
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find(card => card._id === cardId);
      if (!cardData) {
        console.error("Карточка не найдена");
        return;
      }

      cardInfoModalTitle.textContent = cardData.name;

      cardInfoModalInfoList.innerHTML = '';
      cardInfoModalLikesList.innerHTML = '';

      cardInfoModalInfoList.append(
        createInfoString("Описание:", cardData.name),
        createInfoString("Дата создания:", formatDate(cardData.createdAt)),
        createInfoString("Владелец:", cardData.owner.name),
        createInfoString("Количество лайков:", cardData.likes.length)
      );

      if (cardData.likes.length > 0) {
        cardInfoModalLikesTitle.textContent = "Лайкнули:";
        cardData.likes.forEach(user => {
          cardInfoModalLikesList.append(createLikeUserPreview(user));
        });
      } else {
        cardInfoModalLikesTitle.textContent = "Пока никто не лайкнул";
      }

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};