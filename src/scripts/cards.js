const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard }
) => {
  const cardElement = getTemplate();

  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCount = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  const myId = "3a710b1ba2be14917e6f951d";
  if (data.owner._id !== myId) {
    deleteButton.remove();
  }

  if (data.likes.some(like => like._id === myId)) {
    likeButton.classList.add("card__like-button_is-active");
  }
  if (likeCount) {
    likeCount.textContent = data.likes.length;
  }

  likeButton.addEventListener("click", () => onLikeIcon(cardElement, data));
  if (deleteButton) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data));
  }
  cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));

  return cardElement;
};