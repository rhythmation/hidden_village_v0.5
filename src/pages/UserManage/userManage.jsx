import React, { useEffect, useRef, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { firebaseDB, firebaseInstance } from "../../services/Firebase/firebase";

function UserManage() {
  const [myStudents, setMyStudents] = useState(null);
  const auth = getAuth(firebaseInstance);
  const formsRef = useRef();

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !myStudents) {
        const userRef = doc(firebaseDB, "users", user.email);

        getDoc(userRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              setMyStudents(docSnap.data().students || []);
            }
          })
          .catch((error) => {
            console.error("Error getting document:", error);
          });
      } 
    });

    return () => unsubscribe();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    const updatedStudents = Array.from(formsRef.current.querySelectorAll("form")).map(
      (form) => {
        const formData = new FormData(form);
        return {
          id: formData.get("id"),
          username: formData.get("username"),
          password: formData.get("password"),
        };
      }
    );

    // Update in Firestore
    const userRef = doc(firebaseDB, "users", auth.currentUser.email);
    updateDoc(userRef, { students: updatedStudents })
      .then(() => {
        console.log("Students updated successfully");
        setMyStudents(updatedStudents); // Update local state
      })
      .catch((error) => {
        console.error("Error updating students:", error);
      });
  }

  function removeStudent(id) {
    setMyStudents((prev) => prev.filter((obj) => id !== obj.id));
  }

  function addStudent() {
    const autoId = doc(collection(firebaseDB, "temp")).id;
    setMyStudents((prev) => [
      ...prev,
      { id: autoId, username: "username", password: "password" },
    ]);
  }

  if (!myStudents) {
    return <div> Loading ... </div>;
  }

  return (
    <div>
      <h2> My Students </h2>
      <div ref={formsRef}>
        {myStudents.map((studentObj) => (
          <form key={studentObj.id}>
            <div>
              <input
                type="hidden"
                name="id"
                defaultValue={studentObj.id}
              />
              <label> Student Name: </label>
              <input name="username" defaultValue={studentObj.username} />
              <label> Password: </label>
              <input name="password" defaultValue={studentObj.password} />
              <button type="button" onClick={() => removeStudent(studentObj.id)}>
                Remove Student
              </button>
            </div>
          </form>
        ))}
      </div>
      <button onClick={handleSubmit} type="button">
        Update Student Info
      </button>
      <button onClick={addStudent} type="button">
        Add Student
      </button>
    </div>
  );
}

export default UserManage;
