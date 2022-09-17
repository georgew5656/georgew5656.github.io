import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate
} from "react-router-dom";

import {
  About
} from "./About"

import {
  Blog,
  Post
} from "./Blog"

import raw from "./portugal.md"

function App() {
  fetch(raw)
  .then(r => r.text())
  .then(text => {
    console.log('text decoded:', text);
  });
  return (
    <Router>
      <div>
          <span><Link to="/">Home</Link></span>
          <span><Link to="/about">About</Link></span>
        <hr />
        <Routes>
          <Route path="/" element={Blog()} />
          <Route path="/about" element={About()} />
          <Route path="/portugal" element={new Post({})} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
