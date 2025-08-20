'use client'

import {useState} from 'react';

import { AuthContext } from '../contexts';

export default function AuthProvider({children}) {
    const [auth, setAuth] = useState(null);
    const [book, setBook] = useState(null);
    const [allBooks, setAllBooks] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    return(
        <AuthContext.Provider value={{auth, setAuth, book, setBook, allBooks, setAllBooks, allUsers, setAllUsers}}>
            {children}
        </AuthContext.Provider>
    )
}