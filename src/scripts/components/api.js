import axios from 'axios';

const config = {
  baseUrl: 'https://mesto.nomoreparties.co/v1/apf-cohort-202',
  headers: {
    authorization: '5195f162-280c-4d5c-a3f1-56b183e29950',
    'Content-Type': 'application/json'
  }
};

const api = axios.create({
  baseURL: config.baseUrl,
  headers: config.headers
});

export const getUserInfo = () => {
  return api.get('/users/me')
    .then(res => res.data)
    .catch(err => Promise.reject(`Ошибка: ${err.response?.status || err.message}`));
};

export const getCardList = () => {
  return api.get('/cards')
    .then(res => res.data)
    .catch(err => Promise.reject(`Ошибка: ${err.response?.status || err.message}`));
};

export const setUserInfo = ({ name, about }) => {
  return api.patch('/users/me', { name, about })
    .then(res => res.data)
    .catch(err => Promise.reject(`Ошибка: ${err.response?.status || err.message}`));
};

export const setUserAvatar = (avatar) => {
  return api.patch('/users/me/avatar', { avatar })
    .then(res => res.data)
    .catch(err => Promise.reject(`Ошибка: ${err.response?.status || err.message}`));
};

export const addNewCard = ({ name, link }) => {
  return api.post('/cards', { name, link })
    .then(res => res.data)
    .catch(err => Promise.reject(`Ошибка: ${err.response?.status || err.message}`));
};

export const changeLikeCardStatus = (cardId, isLiked) => {
  const method = isLiked ? 'delete' : 'put';
  return api[method](`/cards/likes/${cardId}`)
    .then(res => res.data)
    .catch(err => Promise.reject(`Ошибка: ${err.response?.status || err.message}`));
};

export const deleteCardFromServer = (cardId) => {
  return api.delete(`/cards/${cardId}`)
    .then(res => res.data)
    .catch(err => Promise.reject(`Ошибка: ${err.response?.status || err.message}`));
};