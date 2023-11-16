import query from './Query'
import React, { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ComicCreator() {
  const [panelInputs, setPanelInputs] = useState(Array(10).fill(''));
  const [comicImageUrls, setComicImageUrls] = useState([]);
  const[oldInput,setOldInput] = useState([]);
  const [error, setError] = useState(null);
  const[loading,setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const pdfContainerRef = useRef(null);
  const[downloaded,setDownloaded] = useState();

  const handleShareClick = async () => {
    if(downloaded)
    {
      toast.success("File is already downloaded");
      toast.error("Error");
      setShowShareModal(true);
      return;
    }
    try {
      const pdfContainer = document.getElementById('pdf-container');
  
      if (!pdfContainer) {
        throw new Error("PDF container not found");
      }
  
      // Use html2pdf to convert the content of the container to a PDF
      const pdf = await html2pdf(pdfContainer, {
        margin: 10,
        filename: 'comic-strip.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      });
  
      setShowShareModal(true);
      setDownloaded(true);
    } catch (error) {
      console.error("Error handling share click:", error);
      setError("Error handling share click. Please try again.");
    }
  };

  const generateComic = async () => {
    try {
      setLoading(true);
      const imageUrls = [...comicImageUrls]; // Copy the existing image URLs

      // Iterate through each panel input
      for (let i = 0; i < panelInputs.length; i++) {
        const data = { "inputs": panelInputs[i] };

        // Check if the text for the panel has changed
        if (panelInputs[i] !== '' && (comicImageUrls[i] === undefined || panelInputs[i] !== oldInput[i])) {
          // If changed, make an API call and update the corresponding image URL
          setDownloaded(false);
          const imageUrl = await query(data);
          imageUrls[i] = imageUrl;
        }
      }

      setComicImageUrls(imageUrls);
      setOldInput(panelInputs);
      setError(null);
    } catch (error) {
      console.error("Error generating comic:", error);
      setError("Error generating comic. Please try again.");
    }
    setLoading(false);
  };

  const handleGmailShare = () => {
    const subject = encodeURIComponent("Comic Strip");
    const body = encodeURIComponent("Attach the downloaded comic pdf here.");
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

const handleWhatsAppShare = () => {
    const text = encodeURIComponent("Attach the downloaded comic pdf here.");
    window.location.href = `https://wa.me/?text=${text}`;
  };

  return (
    <div className="flex justify-between min-h-screen">
      <div className="max-w-md w-full p-8 bg-white shadow-md mb-8">
        {panelInputs.map((input, index) => (
          <div key={index} className="mb-4">
            <label htmlFor={`panel${index + 1}`} className="block text-sm font-medium text-gray-600">
              {`Panel ${index + 1}:`}
            </label>
            <textarea
              id={`panel${index + 1}`}
              name={`panel${index + 1}`}
              value={input}
              onChange={(e) => {
                const newInputs = [...panelInputs];
                newInputs[index] = e.target.value;
                setPanelInputs(newInputs);
              }}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:border-green-500"
            />
          </div>
        ))}
        <button onClick={generateComic} className="bg-green-500 text-white p-2 rounded-md cursor-pointer">
          Generate Comic
        </button>
        <button onClick={handleShareClick} className="bg-blue-500 text-white p-2 rounded-md cursor-pointer mt-4">
          Share Comic Strip
        </button>
      </div>
      <div className="max-w-md w-full">
      {loading && (
          <div className="border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin my-8 mx-auto"></div>
        )}
      <div id='pdf-container'>
        {comicImageUrls.length > 0 && (
          <div className="flex flex-col gap-4 space-x-2">
            {comicImageUrls.map((imageUrl, index) =>(
              <img key={index} src={imageUrl} className="w-1/4 h-auto" />
            ))}
          </div>
        )}
      </div>
      </div>
      
      {error && <p className="text-red-500">{error}</p>}

      {showShareModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md">
            <div id="pdf-viewer" className="hidden"></div>
            <div className='flex gap-10 justify-center'>
          <button onClick={handleGmailShare} className="bg-red-500 w-1/3 text-white p-2 rounded-md cursor-pointer mt-4">
          Share via Gmail
        </button>
        <button onClick={handleWhatsAppShare} className="bg-green-500 w-1/3 text-white p-2 rounded-md cursor-pointer mt-4">
        Share via WhatsApp
        </button>
        </div>
        <div className='flex justify-center'>
        <button onClick={() => setShowShareModal(false)} className="bg-gray-500 text-white p-2 rounded-md cursor-pointer mt-4">
          Close
        </button>
        </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ComicCreator;
