import { API } from './api';

export const ROUTES = {
  Home: '/',
  Login: '/login',
  Dashboard: '/dashboard',
  License: '/license',
  Users: '/users',
  Clients: '/clients',
  Billing: '/billing',
  Projects: '/projects',
  CreateProject: '/new-project',
  CreateUser: '/new-user',
}

const GET_PREFIX = `/api/get?q=`;
const POST_PREFIX = `/api/post?q=`;

export const APIROUTES = {
  USER:     '/api/user',
  TOKEN:    '/api/token',
  LOGIN:    '/api/login',
  LOGOUT:   '/api/logout',

  GET: {
    LICENSE:              GET_PREFIX + API.GET.LICENSE,
    USERS:                GET_PREFIX + API.GET_USERS,
    PROJECT:              GET_PREFIX + API.GET.PROJECT,
    PROJECTS:             GET_PREFIX + API.GET.PROJECTS,
    BATCH:                GET_PREFIX + API.GET.BATCH,
    BATCHES:              GET_PREFIX + API.GET.BATCHES,
    BATCH_GROUPS:         GET_PREFIX + API.GET.BATCH_GROUPS,
    BATCH_PERSONAE:       GET_PREFIX + API.GET.BATCH_PERSONAE,
    PROJECT_PERSONAE:     GET_PREFIX + API.GET.PROJECT_PERSONAE,
    MODULES:              GET_PREFIX + API.GET.MODULES,
    PERSONAE:             GET_PREFIX + API.GET.PERSONAE,
  },

  POST: {
    // user
    NEW_USER:             POST_PREFIX + API.POST.NEW_USER,
    DELETE_USER:          POST_PREFIX + API.POST.DELETE_USER,
    DISABLE_USER:         POST_PREFIX + API.POST.DISABLE_USER,
    ACTIVATE_USER:        POST_PREFIX + API.POST.ACTIVATE_USER,
    RESET_USER:           POST_PREFIX + API.POST.RESET_USER,
    CHANGE_PASSWORD:      POST_PREFIX + API.POST.CHANGE_PASSWORD,
    // project
    SAVE_PROJECT:         POST_PREFIX + API.POST.SAVE_PROJECT,
    SAVE_CLIENT_PROJECT:  POST_PREFIX + API.POST.SAVE_CLIENT_PROJECT,
    CHANGE_PROJECT_ADMIN: POST_PREFIX + API.POST.CHANGE_PROJECT_ADMIN,
    UPDATE_PROJECT:       POST_PREFIX + API.POST.UPDATE_PROJECT,
    SAVE_NEW_BATCH:       POST_PREFIX + API.POST.SAVE_NEW_BATCH,
    UPDATE_BATCH:         POST_PREFIX + API.POST.UPDATE_BATCH,
    DELETE_BATCH:         POST_PREFIX + API.POST.DELETE_BATCH,
    SAVE_MODULES:         POST_PREFIX + API.POST.SAVE_MODULES,
    SAVE_CSV_DATA:        POST_PREFIX + API.POST.SAVE_CSV_DATA,
    SAVE_DEPLOYMENT:      POST_PREFIX + API.POST.SAVE_DEPLOYMENT,
  }
}