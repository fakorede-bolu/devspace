import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";

// Constants for auth
import { GET_ERRORS, SET_CURRENT_USER } from "./types";

// Register user
export const registerUser = (userData, history) => dispatch => {
  axios
    .post("api/users/register", userData)
    .then(user => history.push("/login"))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

// Login - Get user token
export const loginUser = userData => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(res => {
      // get the token from the response
      const { token } = res.data;
      // Set token to localStorage
      localStorage.setItem("Token", token);
      // Set token to the Auth header
      setAuthToken(token);
      //   decode token to get user data
      const decodedUser = jwt_decode(token);
      // set current user
      dispatch(setCurrentUser(decodedUser));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

// set  logged in user
export const setCurrentUser = decodedUser => {
  return {
    type: SET_CURRENT_USER,
    payload: decodedUser
  };
};

// log user out
export const logoutUser = () => dispatch => {
  localStorage.removeItem("Token");
  // Remove auth header for future request
  setAuthToken(false);
  // set current user to {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));

  // redirect to landing page
  window.location.href = "/";
};
