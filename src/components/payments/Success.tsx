import { CheckCircle } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

export const Success = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '82vh' }}>
      <div className="bg-white p-8 rounded-lg shadow text-center max-w-md w-full">
        <CheckCircle className="text-green-700 mx-auto h-16 w-16 mb-4" />
        <h1 className="text-3xl font-bold text-green-700 mb-2">
          Transaction Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Your transaction has been completed. Thank you for your payment!
        </p>
        <button onClick={() => navigate("/dashboard")} className="w-full bg-green-700 text-white shadow rounded px-1 py-2">Go to Dashboard</button>
      </div>
    </div>
  );
};
