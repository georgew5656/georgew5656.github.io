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
function App() {
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
