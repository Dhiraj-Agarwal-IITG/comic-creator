import './App.css';
import query from './Query'
import React, { useState, useRef,useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Draggable from 'react-draggable';

function ComicCreator() {
  const [panelInputs, setPanelInputs] = useState(Array(10).fill(''));
  const[speechInput,setSpeechInput] = useState(Array(10).fill(''));
  const [comicImageUrls, setComicImageUrls] = useState([]);
  const[oldInput,setOldInput] = useState([]);
  const [error, setError] = useState(null);
  const[loading,setLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const pdfContainerRef = useRef(null);
  const[downloaded,setDownloaded] = useState();
  const [speechBubblePositions, setSpeechBubblePositions] = useState(Array(10).fill({ top: 0, left: 0 }));

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


  const handleSpeechBubbleDragStop = (e, data, index) => {
    // Update the state with the new position after drag stops
    setSpeechBubblePositions((prevPositions) => {
      const newPositions = [...prevPositions];
      newPositions[index] = { top: data.y, left: data.x };
      return newPositions;
    });
  };

  const generateComic = async () => {
    toast.success("Creation started");
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
          if(loading==true) return;
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
    <div className=' bg-gray-300 flex flex-col'>
      <div className='flex justify-center text-5xl pt-10 pb-10 font-bold' style={{ backgroundImage: 'url("https://i.pinimg.com/736x/00/cd/45/00cd458d4645f79da86b64a8990dee27.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <span className='bg-blue-100 p-5'>10-Panel Comic Generator</span>
      </div>
      <div className="flex justify-between columns-2... pt-5 pl-14 min-h-screen">
      <div className="max-w-md w-full p-8 bg-red border-4 border-gray-500/100 ... shadow-md mb-8">
        {panelInputs.map((input, index) => (
          <div key={index} className="mb-4 ">
            <label htmlFor={`panel${index + 1}`} className="block text-lg font-medium text-gray-900">
              {`Panel ${index + 1}`}
            </label>
            <textarea
              id={`panel${index + 1}`}
              name={`panel${index + 1}`}
              value={input}
              placeholder='Enter description for the comic creation'
              onChange={(e) => {
                const newInputs = [...panelInputs];
                newInputs[index] = e.target.value;
                setPanelInputs(newInputs);
              }}
              className="mt-1 p-2 border-2 border-yellow-600 ... border border-gray-300 rounded-md w-full focus:outline-none focus:border-green-500"
            />
            <textarea
              id={`speechPanel${index + 1}`}
              name={`speechPanel${index + 1}`}
              value={speechInput[index]}
              placeholder='Enter text for speech bubble'
              onChange={(e) => {
                const newSpeechInputs = [...speechInput];
                newSpeechInputs[index] = e.target.value;
                setSpeechInput(newSpeechInputs);
              }}
              className="mt-1 p-2 border-2 border-yellow-600 ... border border-gray-300 rounded-md w-full focus:outline-none focus:border-green-500"
              rows={1}
              contentEditable
            />
          </div>
        ))}
        
        <button onClick={generateComic} className="bg-green-500 hover:bg-green-700 text-white ml-10 p-2 rounded-md cursor-pointer">
          Generate Comic
        </button>
        <button onClick={handleShareClick} className="bg-blue-500 hover:bg-blue-700 text-white ml-7 p-2 rounded-md cursor-pointer mt-4">
          Share Comic Strip
        </button>
        
      </div>
    <div className="max-w-md w-full ">
      <div id='pdf-container' ref={pdfContainerRef}>
        {comicImageUrls.length > 0 && (
          <div className="flex flex-col gap-4 space-x-2">
            {comicImageUrls.map((imageUrl, index) =>(
             <div key={index} className="relative">
             {/* Speech bubble */}
             {speechInput[index]!=='' && (<Draggable
               defaultPosition={{ x: speechBubblePositions[index].left, y: speechBubblePositions[index].top }}
               onStop={(e, data) => handleSpeechBubbleDragStop(e, data, index)}
             >
               <div className="absolute p-2 bg-white border border-gray-300 rounded-md cloud-style" style={{ cursor: 'move' }}>
                 <span>{speechInput[index]}</span>
               </div>
             </Draggable> )}
             {/* End Speech bubble */}
             <img src={imageUrl} className="w-1/2 h-auto"/>
           </div>
          ))}
        </div>
        )}
      </div>

      {loading && (
        <div>
        
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50"> 
          <div className="border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin my-8 mx-auto"></div>
        </div>

        <div className='fixed top-0 right-10 '>
        <button onClick={() => setLoading(false)} className="bg-gray-500 hover:bg-gray-700 text-white p-3 rounded-md cursor-pointer mt-6" style={{zIndex:1}}>
                  Close
          </button>
        </div>

        </div>
        )}

    </div>
      
      {error && <p className="text-red-500">{error}</p>}

      {showShareModal && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-indigo-100 p-10 rounded-md h-80 w-100 border border-red-900">
              <div className='flex gap-10 justify-center'>
                  <button onClick={handleGmailShare} className="bg-red-500 hover:bg-red-700 w-1/3 text-white p-5 rounded-md cursor-pointer mt-4">
                    Share via Gmail
                  </button>

                  <button onClick={handleWhatsAppShare} className="bg-green-500 hover:bg-green-700 w-1/3 text-white p-2 rounded-md cursor-pointer mt-4">
                      Share via WhatsApp
                  </button>
              </div>
              <div className='flex justify-center p-4 '>
                <button onClick={() => setShowShareModal(false)} className="bg-gray-500 hover:bg-gray-700 text-white p-3 rounded-md cursor-pointer mt-6">
                  Close
                </button>
              </div>
            </div>
        </div>
      )}

    </div>
    </div>
    
  );
}

export default ComicCreator;
