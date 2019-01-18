import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

// store persist dependencies
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";

// redux dependecies
import { Provider } from "react-redux";

import store from "./store";
// Layout components
import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Footer from "./components/layout/Footer";

// auth components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import "./App.css";

// check for token
if (localStorage.Token) {
  // Set auth token header auth
  setAuthToken(localStorage.Token);
  // decode token and get user info and experation
  const decoded = jwt_decode(localStorage.Token);
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));

  // check for expired token
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());
    // @TODO: clear current user

    // redirect to login
    window.location.href = "/login";
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Navbar />
            <Route exact path="/" component={Landing} />
            <div className="container">
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
            </div>
            <Footer />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
