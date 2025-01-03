const Loader: React.FC = () => {
    return (
      <div className="loader-overlay">
        <div className="loader"></div>
        <style jsx>{`
          .loader-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.3); /* Semi-transparent background */
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999; /* Ensure it stays on top of other elements */
          }
  
          .loader {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: radial-gradient(circle, #3498db 20%, #ffffff 50%);
            animation: pulse 1.5s infinite ease-in-out;
            box-shadow: 0 0 15px rgba(52, 152, 219, 0.8);
          }
  
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.3);
              opacity: 1;
            }
            100% {
              transform: scale(1);
              opacity: 0.8;
            }
          }
        `}</style>
      </div>
    );
  };
  
  export default Loader;
  