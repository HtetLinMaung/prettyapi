import { createContext, useReducer } from "react";

export const appContext = createContext(null);

const initialState = {
  api_name: "",
  token: "",
  username: "",
  profile: "",
};

export default function AppProvider({ children }) {
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_STATE":
        return {
          ...state,
          ...action.payload,
        };
      default:
        return state;
    }
  };
  const value = useReducer(reducer, initialState);
  return <appContext.Provider value={value}>{children}</appContext.Provider>;
}
