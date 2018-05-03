const {
  deleteImg,
  upload,
  imageUpload,
  getImage
} = require('../controllers/images');

const {
  checkSystem,
  verifyAccessToken
} = require('../controllers/users');
module.exports = (route) => {
  route.delete('/delete/:name', checkSystem, verifyAccessToken, deleteImg);
  route.post('/profile', checkSystem, verifyAccessToken, upload.single('image'), imageUpload);
  route.get('/images/get', checkSystem, verifyAccessToken, getImage);
}