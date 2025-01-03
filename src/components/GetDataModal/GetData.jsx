import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import './GetData.css';

const GetData = ({ isOpen, onClose, userId }) => {

  const [formData, setFormData] = useState({
    userId: userId || '',
    gameName: '',
    startDate: '',
    endDate: '',
    allData: false,
    csv: false,
    json: false
  });

  // Handle input changes
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    // Add submission logic here
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>DOWNLOAD DATA</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="userId">USER ID</label>
            <input
              type="email"
              id="userId"
              value={formData.userId}
              onChange={handleChange}
              disabled // Make it read-only since it's auto-populated
            />
          </div>

          <div className="form-group">
            <label htmlFor="gameName">GAME NAME</label>
            <input
              type="text"
              id="gameName"
              value={formData.gameName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">START DATE</label>
            <div className="date-input-container">
              <input
                type="text"
                id="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
              <Calendar className="calendar-icon" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="endDate">END DATE</label>
            <div className="date-input-container">
              <input
                type="text"
                id="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
              <Calendar className="calendar-icon" />
            </div>
          </div>

          <div className="checkbox-group">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="allData"
                checked={formData.allData}
                onChange={handleChange}
              />
              <label htmlFor="allData">Download all Data Files for this User</label>
            </div>

            <div className="format-options">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="csv"
                  checked={formData.csv}
                  onChange={handleChange}
                />
                <label htmlFor="csv">CSV</label>
              </div>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="json"
                  checked={formData.json}
                  onChange={handleChange}
                />
                <label htmlFor="json">JSON</label>
              </div>
            </div>
          </div>

          <button type="submit" className="save-button">SAVE</button>
        </form>
      </div>
    </div>
  );
};

export default GetData;