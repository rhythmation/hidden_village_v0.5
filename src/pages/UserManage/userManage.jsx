import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { firebaseInstance } from "../../services/Firebase/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function UserManage() {
    const [myStudents, setMyStudents] = useState();
    const auth = getAuth(firebaseInstance);

    useEffect(() => {
        
    })


  return <div> My Students </div>;
}
export default UserManage;
