import React, { useState } from 'react'
import './styles.css'

const FHIR_SERVER_URL = 'https://fhir-bootcamp.medblocks.com/fhir'

const PatientForm = ({ patient, onClose, onPatientAdded }) => {
  const [givenName, setGivenName] = useState(
    patient?.name?.[0]?.given?.[0] || ''
  )
  const [familyName, setFamilyName] = useState(patient?.name?.[0]?.family || '')
  const [gender, setGender] = useState(
    patient?.gender?.toLowerCase() || 'unknown'
  )
  const [dob, setDob] = useState(patient?.birthDate || '')
  const [phone, setPhone] = useState(patient?.telecom?.[0]?.value || '')

  const isEditing = !!patient?.id

  console.log('patient: ', patient)

  console.log(givenName, familyName, dob, phone, gender)

  const handleSubmit = async e => {
    e.preventDefault()

    // const namePattern = /^[A-Za-z]+$/

    // if (!givenName.match(namePattern)) {
    //   alert('Given Name must contain only letters.')
    //   return
    // }

    // if (!familyName.match(namePattern)) {
    //   alert('Family Name must contain only letters.')
    //   return
    // }

    const phonePattern = /^[0-9]{8,13}$/
    if (phone !== 'N/A' && phone.trim() !== '' && !phone.match(phonePattern)) {
      alert('Please enter a valid phone number (8-13 digits)')
      return
    }

    const patientData = {
      resourceType: 'Patient',
      name: [{ given: [givenName], family: familyName }],
      gender: gender.toLowerCase(),
      birthDate: dob,
      telecom: [{ system: 'phone', value: phone, use: 'mobile' }]
    }

    if (isEditing) {
      patientData.id = patient.id
    }

    console.log('patientdata: ', patientData)

    try {
      let response
      if (isEditing) {
        response = await fetch(`${FHIR_SERVER_URL}/Patient/${patient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patientData)
        })
      } else {
        response = await fetch(`${FHIR_SERVER_URL}/Patient`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patientData)
        })
      }

      if (response.ok) {
        alert('Patient saved successfully!')
        onClose()
        if (onPatientAdded) {
          setTimeout(() => {
            onPatientAdded()
          }, 1000)
        }
      } else {
        alert('Failed to save patient')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Given Name:</label>
      <input
        type='text'
        value={givenName}
        onChange={e => setGivenName(e.target.value)}
        required
      />

      <label>Family Name:</label>
      <input
        type='text'
        value={familyName}
        onChange={e => setFamilyName(e.target.value)}
      />

      <label>Gender:</label>
      <select value={gender} onChange={e => setGender(e.target.value)}>
        <option value='male'>Male</option>
        <option value='female'>Female</option>
        <option value='other'>Other</option>
        <option value='unknown'>Unknown</option>
      </select>

      <label>Date of Birth:</label>
      <input
        type='date'
        value={dob}
        onChange={e => setDob(e.target.value)}
        required
      />

      <label>Phone Number:</label>
      <input
        type='tel'
        value={phone}
        onChange={e => setPhone(e.target.value)}
        required
      />

      <button type='submit'>{isEditing ? 'Update' : 'Add'} Patient</button>
      <button type='button' onClick={onClose} className='cancel-btn'>
        Cancel
      </button>
    </form>
  )
}

export default PatientForm
