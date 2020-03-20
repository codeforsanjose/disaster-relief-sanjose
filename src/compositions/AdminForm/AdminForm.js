import React, { useContext, useState, useReducer } from 'react'
import Select from 'react-select'
import _ from 'lodash'
import moment from 'moment'
import PostContext from '../../context/PostContext'
import FormContext from '../../context/FormContext'
import { AddressMarkup, ContactMarkup, InformationMarkup } from '../PostMarkup/PostMarkup'
import { validateEmail } from '../../Utilities/validationUtilities'
import { getLatLng } from '../../services/locationiq/api.js'
import { summaryOptions } from '../../Utilities/translations'

import './AdminForm.css'

/**
 *  Form used in admin view to update or add new post information
 *
 *  @param {string}     submitName          form button label
 *  @param {function}   submitHandler       form submit action
 */
export default function AdminForm({ submitName, submitHandler = () => {}, languageOption = 'en' }) {

    // state hooks + reducers

    const postContext = useContext(PostContext)
    const postForEdit = postContext.Provider.post.post

    const state = {
        fields: postForEdit ? postForEdit : {
            title: '',
            description: '',
            updates: [],
            updateItem: '',
            contactName: '',
            contactEmail: '',
            contactPhone: '',
            addressLine1: '',
            addressLine2: '',
            city: 'San Jose',
            state: 'CA',
            zipcode:'',
            longitude: '',
            latitude: '',
            radius: '',
            selectedSummaryForTranslation: {},
            selectedIconsForTranslation: [],
        },
        errors: {},
        apiLoading: false
    }

    const errorReducer = (state, {type, name, message}) => {
        switch (type)
        {
            // Add error name and message to state
            // {} => {foo: An error occurred with foo}
            case 'add':     return _.assign(state, { [name] : message })

            // Remove error with name from state
            // {foo : ... } => {}
            case 'remove':  return _.omit(state, name)

            // Do nothing if type not specified
            default:        return state
        }
    }

    const [fields, setFields] = useState(state.fields)
    const [errors, setErrors] = useReducer(errorReducer, state.errors)
    const [apiLoading, setApiLoading] = useState(state.apiLoading)

    // context handling

    const formContext = useContext(FormContext)

    formContext.Provider = {
        errors: errors,
        inputHandler: (event) => {
            handleInput(event)
        },
        errorHandler: (event) => {
            handleError(event)
        },
        focusHandler: (event) => {
            setErrors({ type: 'remove', name: event.target.name, message: null })
        }
    }

    // form handlers

    const validateField = (fieldName, input) => {

        const sanJoseRegionalPoints = {
            maxLong: -118,
            minLong: -124,
            maxLat: 41,
            minLat: 34,
            maxRadius: 10,
        }

        let message = ""

        // Check for empty entries first
        if (input.length === 0 && (fieldName !== 'updateItem' || fieldName !== 'addressLine2'))
        {
            message = 'Required'
        }
        else
        {
            // Other errors
            if (fieldName === 'contactEmail' && validateEmail(input))
            {
                message = 'Invalid email, please re-enter valid email'
            }
            else if (fieldName === 'longitude' && (sanJoseRegionalPoints.minLong > input || input > sanJoseRegionalPoints.maxLong))
            {
                message = `Invalid ${ fieldName }, please re-enter valid ${ fieldName } between ${ sanJoseRegionalPoints.minLong } and ${ sanJoseRegionalPoints.maxLong }`
            }
            else if (fieldName === 'latitude' && (sanJoseRegionalPoints.maxLat < input || input < sanJoseRegionalPoints.minLat))
            {
                message = `Invalid ${ fieldName }, please re-enter valid ${ fieldName } between ${ sanJoseRegionalPoints.minLat } and ${ sanJoseRegionalPoints.maxLat }`
            }
            else if (fieldName === 'radius' && (0 > input || input > sanJoseRegionalPoints.maxRadius))
            {
                message = `Invalid ${ fieldName }, please re-enter valid ${ fieldName } between 0 and ${ sanJoseRegionalPoints.maxRadius }`
            }
        }

        return message
    }

    const handleInput = (event) => {
        event.preventDefault()

        const value = event.target.value
        const name = event.target.name

        setFields({
            ...fields,
            [name]: value,
        })
    }

    const handleError = (event) => {
        event.preventDefault()

        const value = event.target.value
        const name = event.target.name
        const errorMessage = validateField(name, value)

        if (errorMessage !== '')
        {
            setErrors({ type: 'add', name: name, message: errorMessage })
        }
        else if (name in errors)
        {
            setErrors({ type: 'remove', name: name, message: null })
        }
    }

    const handleAddUpdateItem = (event) => {
        event.preventDefault()

        if (fields.updateItem !== '')
        {
            // Build update item format
            const timestamp = moment().format('MMM D, YYYY : HH:mm:ss')

            const updatedItem = `${timestamp} - ${fields.updateItem}`
            const updateItems = [...fields.updates, updatedItem]

            setFields({
                ...fields,
                updateItem: '',
                updates: updateItems,
            })
        }
    }

    const handleGeocode = async () => {

        if (!fields.addressLine1) {
          return;
        }
        // prevent clicks while loading
        setApiLoading(true);
        try {
          const {addressLine1: address, city, state, zipcode:zip} = fields;
          const coordinates = await getLatLng({
            address,
            city,
            state,
            zip
          })
          const {lat, lon} = coordinates[0];

          setFields({
            ...fields,
            longitude: lon,
            latitude: lat
          });
        }
        catch(error) {
          // process api errors
          window.alert('Sorry, could not get the coordinates for that address. Please check your connection and inputted address, then try again.');
          console.log(error);
        }
        finally {
          // allow interactions with api interface again
          setApiLoading(false);
        }
    }
    const updatedOptions = summaryOptions.map((option, index) => {
        const value = option[languageOption]
        return {
            label: value,
            value: value,
            index: index,
        }
    })
    const handleSummarySelection = (e) => {
        setFields({
            ...fields,
            selectedSummaryForTranslation: {
                translationsValue: e.vaule,
                index: e.index,
            }
        })
    }
    const summaryOptionsMarkup = (
        <Select
            options={ updatedOptions }
            onChange={ handleSummarySelection }
        />
    )
    return (
        <section id = 'adminForm' className = 'AdminForm'>
            <div className = 'form-group'>
                <h3>Disaster Information</h3>
                <InformationMarkup
                    details = { fields }
                    updateHandler = { handleAddUpdateItem }
                    editMode = { true }
                />
            </div>
            <div className='form-group'>
                <h3>Multiligual Option Selection</h3>
                { summaryOptionsMarkup }
            </div>
            <div className = 'form-group'>
                <h3>Disaster Location Details</h3>
                <AddressMarkup
                    details = { fields }
                    geocodeHandler = { handleGeocode }
                    editMode = { true }
                    loading = { apiLoading }
                />
            </div>
            <div className = 'form-group'>
                <h3>Emergency Contact Information</h3>
                <ContactMarkup
                    details = { fields }
                    editMode = { true }
                />
            </div>
            <button className = 'form-submit-btn' disabled = { errors.length > 0 } onClick = { (event) => submitHandler(fields, event) }>
                { submitName }
            </button>
        </section>
    )
}
