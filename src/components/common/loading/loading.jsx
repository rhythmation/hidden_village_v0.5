import "./loading.css";

const Loader = () => {
  return (
    <div className="model-loader">
      <h2 className="message">
        Loading...
        <br />
        {/* WE CAN REMOVE THIS FROM HERE AND SHOW IT AS A POPUP ON PAGES ACTUALLY REQUIRING CAMERA TO BE ON */}
        Allow the browser to <br />
        use your webcam...
      </h2>
      <div className="mosaic-loader">
        <div className="cell d-0"></div>
        <div className="cell d-1"></div>
        <div className="cell d-2"></div>
        <div className="cell d-3"></div>
        <div className="cell d-1"></div>
        <div className="cell d-2"></div>
        <div className="cell d-3"></div>
        <div className="cell d-4"></div>
        <div className="cell d-2"></div>
        <div className="cell d-3"></div>
        <div className="cell d-4"></div>
        <div className="cell d-5"></div>
        <div className="cell d-3"></div>
        <div className="cell d-4"></div>
        <div className="cell d-5"></div>
        <div className="cell d-6"></div>
      </div>
    </div>
  );
};

export default Loader;
