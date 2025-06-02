import React from "react";
import {useNavigate} from "react-router-dom"
import { Button } from "../ui/button";
import { XCircle } from "lucide-react";

export const Cancel = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '82vh' }}>
      <div className="bg-white p-8 rounded-lg shadow text-center max-w-md w-full">
        <XCircle className="text-red-700 mx-auto h-16 w-16 mb-4" />
        <h1 className="text-3xl font-bold text-red-700 mb-2">
          Transaction Incomplete
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was not completed. If this was unintentional, you can return to the payment page and try again.
        </p>
        <button className="w-full bg-red-500 px-1 py-2 rounded text-white shadow" onClick={() => navigate("/dashboard/payments")}>
          Try Again
        </button>
        <button className="w-full border mt-4 px-1 py-2 rounded shadow" onClick={() => navigate("/dashborad")}>
          Back to Home
        </button>
      </div>
    </div>
  );
};
