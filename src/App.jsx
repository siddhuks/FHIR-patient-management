import React, { useState } from 'react'
import PatientList from './components/PatientList'
import PatientForm from './components/PatientForm'
import './App.css'

function App () {
  const [editingPatient, setEditingPatient] = useState(null)
  const [creatingPatient, setCreatingPatient] = useState(false)

  return (
    <div className='container'>
      <h1>FHIR Patient Management</h1>

      {editingPatient ? (
        <PatientForm
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
        />
      ) : creatingPatient ? (
        <PatientForm onClose={() => setCreatingPatient(false)} />
      ) : (
        <>
          <button
            className='create-btn'
            onClick={() => setCreatingPatient(true)}
          >
            Create Patient
          </button>
          <PatientList onEdit={setEditingPatient} />
        </>
      )}
    </div>
  )
}

export default App
