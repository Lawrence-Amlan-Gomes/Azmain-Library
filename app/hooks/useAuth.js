import { AuthContext } from "../contexts";
import { useContext } from "react";

export const useAuth = () => {
    const {auth, setAuth, book, setBook, allBooks, setAllBooks} = useContext(AuthContext);
    return {auth, setAuth, book, setBook, allBooks, setAllBooks};
}