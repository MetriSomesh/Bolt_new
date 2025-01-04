import React from "react";
import { CheckCircle, Circle, Loader, XCircle } from "lucide-react";

const StepIcon = ({ status }) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="text-green-400" size={20} />;
    case "running":
      return <Loader className="text-blue-400 animate-spin" size={20} />;
    case "error":
      return <XCircle className="text-red-400" size={20} />;
    default:
      return <Circle className="text-gray-400" size={20} />;
  }
};

export function StepsList({ steps }) {
  return (
    <div className="h-full overflow-y-auto bg-gray-800 rounded-lg">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">Steps</h2>
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-700"
            >
              <StepIcon status={step.status} />
              <div>
                <h3 className="font-medium text-gray-200">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.description}</p>
                {/* {step.code && (
                  <pre className="mt-2 p-2 bg-gray-900 rounded text-sm overflow-x-auto text-gray-300">
                    <code>{step.code}</code>
                  </pre>
                )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
