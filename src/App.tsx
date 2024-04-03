import './App.css';
import {
  HashRouter as Router,
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
          <Route path="mexico-city" element={<Post name="mexico-city"/>} />
          <Route path="las-vegas" element={<Post name="las-vegas"/>} />
          <Route path="zombie-companies" element={<Post name="zombie-companies"/>} />
          <Route path="dreamliner" element={<Post name="dreamliner"/>} />
          <Route path="manhattan" element={<Post name="manhattan"/>} />
          <Route path="south-korea" element={<Post name="south-korea"/>} />
          <Route path="cancun" element={<Post name="cancun"/>} />
          <Route path="bellevue" element={<Post name="bellevue"/>} />
          <Route path="london" element={<Post name="london"/>} />
          <Route path="netherlands" element={<Post name="netherlands"/>} />
          <Route path="nova" element={<Post name="nova"/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
