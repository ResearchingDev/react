import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";

function FormPage() {
    const [formData, setFormData] = useState({
        text: '',
        email: '',
        password: '',
        number: '',
        date: new Date(),
        select: '',
        checkbox: false,
        radio: '',
        textarea: '',
    });

    const [formErrors, setFormErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const validate = () => {
        let errors = {};

        if (!formData.text) errors.text = 'Text field is required';
        if (!formData.email) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email';
        if (!formData.password) errors.password = 'Password is required';
        if (!formData.select) errors.select = 'Please select an option';

        return errors;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validate();
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            setIsSubmitted(true);
            console.log('Form Data Submitted:', formData);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">React Form with All Elements</h1>

            {isSubmitted && <div className="alert alert-success">Form Submitted Successfully!</div>}

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="row mb-3">
                            {/* Text */}
                            <div className="col-md-6">
                                <label htmlFor="text" className="form-label">Text</label>
                                <input
                                    type="text"
                                    id="text"
                                    name="text"
                                    className={`form-control ${formErrors.text ? 'is-invalid' : ''}`}
                                    value={formData.text}
                                    onChange={handleChange}
                                />
                                {formErrors.text && <div className="invalid-feedback">{formErrors.text}</div>}
                            </div>

                            {/* Email */}
                            <div className="col-md-6">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                            </div>
                        </div>

                        <div className="row mb-3">
                            {/* Password */}
                            <div className="col-md-6">
                                <label htmlFor="password" className="form-label">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
                            </div>

                            {/* Number */}
                            <div className="col-md-6">
                                <label htmlFor="number" className="form-label">Number</label>
                                <input
                                    type="number"
                                    id="number"
                                    name="number"
                                    className="form-control"
                                    value={formData.number}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="row mb-3">
                            {/* Date Picker */}
                            <div className="col-md-6">
                                <label className="form-label">Date</label>
                                <DatePicker
                                    selected={formData.date}
                                    onChange={(date) => setFormData({ ...formData, date })}
                                    className="form-control"
                                />
                            </div>

                            {/* Select */}
                            <div className="col-md-6">
                                <label htmlFor="select" className="form-label">Select</label>
                                <select
                                    id="select"
                                    name="select"
                                    className={`form-control ${formErrors.select ? 'is-invalid' : ''}`}
                                    value={formData.select}
                                    onChange={handleChange}
                                >
                                    <option value="">Select an option</option>
                                    <option value="option1">Option 1</option>
                                    <option value="option2">Option 2</option>
                                </select>
                                {formErrors.select && <div className="invalid-feedback">{formErrors.select}</div>}
                            </div>
                        </div>

                        <div className="row mb-3">
                            {/* Checkbox */}
                            <div className="col-md-6">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        id="checkbox"
                                        name="checkbox"
                                        className="form-check-input"
                                        checked={formData.checkbox}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="checkbox" className="form-check-label">Check Me</label>
                                </div>
                            </div>

                            {/* Radio Buttons */}
                            <div className="col-md-6">
                                <label className="form-label">Radio</label>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        id="radio1"
                                        name="radio"
                                        value="radio1"
                                        className="form-check-input"
                                        checked={formData.radio === 'radio1'}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="radio1" className="form-check-label">Radio 1</label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        id="radio2"
                                        name="radio"
                                        value="radio2"
                                        className="form-check-input"
                                        checked={formData.radio === 'radio2'}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="radio2" className="form-check-label">Radio 2</label>
                                </div>
                            </div>
                        </div>

                        <div className="row mb-3">
                            {/* Textarea */}
                            <div className="col-md-12">
                                <label htmlFor="textarea" className="form-label">Textarea</label>
                                <textarea
                                    id="textarea"
                                    name="textarea"
                                    className="form-control"
                                    value={formData.textarea}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="text-center">
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FormPage;
