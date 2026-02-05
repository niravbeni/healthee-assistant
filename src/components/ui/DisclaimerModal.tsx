'use client';

import { useEffect, useState } from 'react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export default function DisclaimerModal({ isOpen, onAccept }: DisclaimerModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#D4D5E9] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-[#7D7FA3]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <h2 className="text-2xl font-light text-center text-gray-800 mb-4">
          Welcome to Healthee
        </h2>
        
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          I&apos;m here to be a supportive companion on your health journey. 
          I can help with reminders and emotional support, but please remember:
        </p>

        <div className="bg-[#D4D5E9]/50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-[#5A5C7A] text-center font-medium">
            This is not medical advice.
          </p>
          <p className="text-sm text-[#7D7FA3] text-center mt-2">
            For health concerns, please consult a qualified healthcare professional.
          </p>
        </div>

        <p className="text-gray-500 text-sm text-center mb-6">
          All your conversations stay on this device. Nothing is sent to external servers 
          except for processing your voice and generating responses.
        </p>

        {/* Accept button */}
        <button
          onClick={onAccept}
          className="w-full py-3 px-6 bg-[#9496B8] hover:bg-[#7D7FA3] text-white 
                     rounded-full font-medium transition-colors duration-200
                     shadow-lg shadow-[#D2D3E8] cursor-pointer"
        >
          I understand, let&apos;s begin
        </button>
      </div>
    </div>
  );
}
