import React, { useState, useEffect } from 'react'
import './styles.css'

const FHIR_SERVER_URL = 'https://fhir-bootcamp.medblocks.com/fhir'

const PatientList = ({ onEdit }) => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const patientsPerPage = 5

  const isPhoneNumber = input => /^[0-9]+$/.test(input)

  const fetchPatientsFromServer = async (query, isPhone) => {
    setLoading(true)
    setIsSearching(true)

    let apiUrl = `${FHIR_SERVER_URL}/Patient?${
      isPhone ? 'telecom' : 'name'
    }=${query}&_count=25&_sort=-_lastUpdated`

    try {
      const response = await fetch(apiUrl)
      const data = await response.json()

      const patientList =
        data.entry?.map(entry => {
          const patient = entry.resource
          return {
            id: patient.id,
            givenName: patient.name?.[0]?.given?.join(' ') || 'Unknown',
            familyName: patient.name?.[0]?.family || 'Unknown',
            gender: patient.gender || 'Unknown',
            dob: patient.birthDate || 'N/A',
            phone:
              patient.telecom?.find(tel => tel.system === 'phone')?.value ||
              'N/A'
          }
        }) || []

      setPatients(patientList)
      setCurrentPage(1)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }

    setLoading(false)
  }

  const fetchRandomPatients = async () => {
    setLoading(true)
    setIsSearching(false)

    try {
      const response = await fetch(
        `${FHIR_SERVER_URL}/Patient?_count=25&_sort=-_lastUpdated`
      )
      const data = await response.json()

      const patientList =
        data.entry?.map(entry => {
          const patient = entry.resource
          return {
            id: patient.id,
            // name: `${patient.name?.[0]?.given?.join(' ') || 'Unknown'} ${
            //   patient.name?.[0]?.family || ''
            // }`,
            givenName: patient.name?.[0]?.given?.join(' ') || 'Unknown',
            familyName: patient.name?.[0]?.family || 'Unknown',
            gender: patient.gender || 'Unknown',
            dob: patient.birthDate || 'N/A',
            phone:
              patient.telecom?.find(tel => tel.system === 'phone')?.value ||
              'N/A'
          }
        }) || []

      setPatients(patientList)
      setCurrentPage(1)
    } catch (error) {
      console.error('Error fetching patients:', error)
      alert('Error fetching data from the server.')
    }

    setLoading(false)
  }

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const delaySearch = setTimeout(() => {
        fetchPatientsFromServer(searchTerm, isPhoneNumber(searchTerm))
      }, 500)

      return () => clearTimeout(delaySearch)
    }
  }, [searchTerm])

  const indexOfLastPatient = currentPage * patientsPerPage
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage
  const currentPatients = patients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  )

  const nextPage = () => {
    if (currentPage < Math.ceil(patients.length / patientsPerPage)) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleDelete = async patientId => {
    if (!window.confirm('Are you sure you want to delete this patient?')) {
      return
    }

    try {
      const response = await fetch(`${FHIR_SERVER_URL}/Patient/${patientId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Patient deleted successfully!')
        setPatients(patients.filter(patient => patient.id !== patientId))
      } else {
        alert('Failed to delete patient.')
      }
    } catch (error) {
      console.error('Error deleting patient:', error)
      alert('An error occurred while deleting the patient.')
    }
  }

  return (
    <div>
      <div className='search-container'>
        <input
          type='text'
          placeholder='Search by name or phone number...'
          className='search-bar'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <button
        className='fetch-btn'
        onClick={fetchRandomPatients}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Show Patients'}
      </button>

      {loading && <p>Loading...</p>}

      {currentPatients.length > 0 && !loading && (
        <>
          <table className='patient-table'>
            <thead>
              <tr>
                <th>Given Name</th>
                <th>Family Name</th>
                <th>Gender</th>
                <th>Date of Birth</th>
                <th>Phone Number</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {currentPatients.map(patient => (
                <tr key={patient.id}>
                  <td>{patient.givenName}</td>
                  <td>{patient.familyName}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.dob}</td>
                  <td>{patient.phone}</td>
                  <td>
                    <button
                      className='edit-btn'
                      onClick={() =>
                        onEdit({
                          id: patient.id,
                          name: [
                            {
                              given: [patient.givenName],
                              family: patient.familyName
                            }
                          ],
                          gender: patient.gender,
                          birthDate: patient.dob,
                          telecom: [
                            {
                              system: 'phone',
                              value: patient.phone,
                              use: 'mobile'
                            }
                          ]
                        })
                      }
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button
                      className='delete-btn'
                      onClick={() => handleDelete(patient.id)}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className='pagination'>
            <button onClick={prevPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of{' '}
              {Math.ceil(patients.length / patientsPerPage)}
            </span>
            <button
              onClick={nextPage}
              disabled={
                currentPage >= Math.ceil(patients.length / patientsPerPage)
              }
            >
              Next
            </button>
          </div>
        </>
      )}

      {patients.length === 0 && !loading && searchTerm && isSearching && (
        <p>No patients found with "{searchTerm}".</p>
      )}
    </div>
  )
}

export default PatientList
