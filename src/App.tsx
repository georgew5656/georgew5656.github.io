import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import {
  About
} from "./About"

import {
  Blog
} from "./Blog"

import {
  Post
} from "./Post"

function App() {
  return (
    <Router>
      <div className="contents">
          <span className="tab"><Link to="/">Home</Link></span>
          <span className="tab"><Link to="/about">About</Link></span>
        <hr />
        <Routes>
          <Route path="/" element={Blog()} />
          <Route path="about" element={About()} />
          <Route path="portugal" element={<Post name="portugal"/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
