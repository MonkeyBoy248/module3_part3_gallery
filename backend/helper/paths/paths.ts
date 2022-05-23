import path from "path";

export const paths = {
  ERROR_PAGE_PATH: path.join(__dirname, 'views', 'pages', '404.html'),
  API_IMAGES_PATH: path.join(__dirname, '..', '..', '..', '..', 'resources'),
  LOGS_PATH: path.join(__dirname, 'logs'),
  STATIC_PAGES_PATH: path.join(__dirname, 'views', 'pages'),
  STATIC_VIEWS_PATH: path.join(__dirname, 'views'),
  STATIC_PUBLIC_PATH: path.join(__dirname, 'public'),
  PICTURES_STORAGE_PATH: path.join(__dirname, '..', '..', 'storage')
}