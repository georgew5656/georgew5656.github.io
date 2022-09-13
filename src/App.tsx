import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/">About</Link>
          </li>
        </ul>
        <hr />
        <Routes>
          <Route path="/" element={About()} />
        </Routes>
      </div>
    </Router>
  );
}


function About() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Hi! I'm a software engineer currently based out of Washington DC. <br/>
          I work on streaming data infrastructure at <a href="https://imply.io/">Imply</a> <br/>
          <br/>
          I'm best contacted via email at george.wu.1923@gmail.com.
        </p>
      </header>
    </div>
  );
}

function Blog() {
  return <p>blog</p>
}
export default App;
