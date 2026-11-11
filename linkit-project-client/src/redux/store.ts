import { configureStore } from "@reduxjs/toolkit";
import registerLoginSlice from "./features/registerLoginSlice";
import JobCardSlice from "./features/JobCardsSlice";
import ResourcesSlice from "./features/ResourcesSlice";
import ApplicationSlice from "./features/ApplicationSlice";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import AuthSlice from "./features/AuthSlice";
import ReviewsSlice from "./features/ReviewsSlice";
import ClientsFollowUpSlice from "./features/ClientsFollowUpSlice";
import UsersSlice from "./features/UsersSlice";
import darkModeSlice from "./features/darkModeSlice";
import ourServicesSlice from "./features/OurServicesSlice";

const persistConfig = {
  key: "root",
  storage,
};

const persistedAuthReducer = persistReducer(persistConfig, AuthSlice);

const rootReducer = combineReducers({
  Authentication: persistedAuthReducer,
  registerLogin: registerLoginSlice,
  jobCard: JobCardSlice,
  resources: ResourcesSlice,
  reviews: ReviewsSlice,
  application: ApplicationSlice,
  jobData: ClientsFollowUpSlice,
  users: UsersSlice,
  darkMode: darkModeSlice,
  ourServices: ourServicesSlice,
});

const store = configureStore({
  reducer: rootReducer,
  // RTK ya incluye redux-thunk en getDefaultMiddleware(); no hace falta importarlo aparte.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
