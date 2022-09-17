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
function App() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
        <hr />
        <Routes>
          <Route path="/" element={Blog()} />
          <Route path="/about" element={About()} />
        </Routes>
      </div>
    </Router>
  );
}

function Blog() {
  return <p>blog</p>
}
export default App;
