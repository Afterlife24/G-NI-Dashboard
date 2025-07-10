import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const ContactSubmissions = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get('https://0emu7rxwk2.execute-api.eu-west-3.amazonaws.com/contact');
        setContacts(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchContacts();
    const intervalId = setInterval(fetchContacts, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const filteredContacts = contacts.filter(contact => 
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(contacts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contact Submissions");
    XLSX.writeFile(workbook, "contact_submissions.xlsx");
  };

  return (
    <div className="contact-submissions">
      <div className="section-header">
        <h2>Contact Form Submissions</h2>
        <div className="controls">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="export-button" onClick={exportToExcel}>
            Export Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <p className="error-state">Error: {error}</p>
      ) : filteredContacts.length === 0 ? (
        <p className="empty-state">No contact submissions found</p>
      ) : (
        <table className="submissions-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact, index) => (
              <tr key={index}>
                <td>{contact.name}</td>
                <td>{contact.email}</td>
                <td className="message-cell">{contact.message}</td>
                <td>{new Date(contact.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ContactSubmissions;