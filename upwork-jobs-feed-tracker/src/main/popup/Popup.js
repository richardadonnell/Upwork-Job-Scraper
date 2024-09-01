import logo from '../statics/images/logo.png';
import './Popup.css';

function Popup() {
  return (
    <div className="App">
        <div className={"height-screen-100 d-flex justify-content-center p-4 bg-dark"}>
            <img src={logo} className={"rounded-circle shadow"} alt={"logo"}/>
        </div>
    </div>
  );
}

export default Popup;
