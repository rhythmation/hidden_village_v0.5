import React, { useEffect, useRef, useState } from "react";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { firebaseDB } from "../../services/Firebase/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth to get the current user

function UserManage() {
  const [myStudents, setMyStudents] = useState(null);
  const formsRef = useRef();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the user from the auth context

  useEffect(() => {
    // Fetch students only if user exists and students haven't been loaded
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
  }, [user, myStudents]);

  function handleSubmit(e) {
    e.preventDefault();

    const updatedStudents = Array.from(
      formsRef.current.querySelectorAll("form")
    ).map((form) => {
      const formData = new FormData(form);
      return {
        id: formData.get("id"),
        username: formData.get("username"),
        password: formData.get("password"),
      };
    });

    // Update students in Firestore
    const userRef = doc(firebaseDB, "users", user.email);
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
              <input type="hidden" name="id" defaultValue={studentObj.id} />
              <label> Student Name: </label>
              <input name="username" defaultValue={studentObj.username} />
              <label> Password: </label>
              <input name="password" defaultValue={studentObj.password} />
              <button
                type="button"
                onClick={() => removeStudent(studentObj.id)}
              >
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
      <button onClick={() => navigate("/")}> Go Back </button>
    </div>
  );
}

export default UserManage;
