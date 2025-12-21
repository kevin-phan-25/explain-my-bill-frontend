import { createContext, useState } from "react";

export const BillContext = createContext();

export const BillProvider = ({ children }) => {
  const [file, setFile] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <BillContext.Provider
      value={{ file, setFile, explanation, setExplanation, loading, setLoading, error, setError }}
    >
      {children}
    </BillContext.Provider>
  );
};
