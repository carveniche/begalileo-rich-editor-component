
import React, { createContext, useContext, useEffect, useState } from 'react'

const AppContext = createContext();

export default function AppProvider({ children }) {
    const [isUploadFile, setIsUploadFile] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(true);   
    const [userType, setUserType] = useState("");

    useEffect(() => {
        const rootEl = document.getElementById("root");
        const userTypeFromDom = rootEl?.getAttribute("data-user-type") || "";
        if(userTypeFromDom){
        setUserType(userTypeFromDom);
        }

        function updateUserType(type) {
            setUserType(type);
        }

        window.setSetUserType = updateUserType;

        return () => {
            delete window.setSetUserType;
        };
    }, []);

    
    return (
        <AppContext.Provider
        value={{
            isUploadFile,
            setIsUploadFile,
            isModalOpen,
            setIsModalOpen,
            userType
        }}>
            {children}
        </AppContext.Provider>
    )
}

export function useAppStore() {
    return useContext(AppContext);
}