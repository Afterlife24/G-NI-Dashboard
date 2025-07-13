import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import SubmissionsChart from './SubmissionsChart';
import * as XLSX from 'xlsx';

const Dashboard = () => {
  const [details, setDetails] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState({
    details: true,
    contacts: true
  });
  const [error, setError] = useState({
    details: null,
    contacts: null
  });
  const [activeChart, setActiveChart] = useState('bar');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch package submissions
// Fetch package submissions
useEffect(() => {
  let isMounted = true;
  const fetchDetails = async () => {
    try {
      const response = await axios.get('https://0emu7rxwk2.execute-api.eu-west-3.amazonaws.com/details');
      if (isMounted) {
        setDetails(response.data);
        setLoading(prev => ({ ...prev, details: false }));
        setError(prev => ({ ...prev, details: null }));
      }
    } catch (err) {
      if (isMounted) {
        setError(prev => ({ ...prev, details: err.message }));
        setLoading(prev => ({ ...prev, details: false }));
      }
      console.error('Error fetching package details:', err);
    }
  };

  fetchDetails();
  const detailsInterval = setInterval(fetchDetails, 5000);
  
  return () => {
    isMounted = false;
    clearInterval(detailsInterval);
  };
}, []);

// Fetch contact submissions
useEffect(() => {
  let isMounted = true;
  const fetchContacts = async () => {
    try {
      const response = await axios.get('https://0emu7rxwk2.execute-api.eu-west-3.amazonaws.com/contact');
      if (isMounted) {
        setContacts(response.data);
        setLoading(prev => ({ ...prev, contacts: false }));
        setError(prev => ({ ...prev, contacts: null }));
      }
    } catch (err) {
      if (isMounted) {
        setError(prev => ({ ...prev, contacts: err.message }));
        setLoading(prev => ({ ...prev, contacts: false }));
      }
      console.error('Error fetching contacts:', err);
    }
  };

  fetchContacts();
  const contactsInterval = setInterval(fetchContacts, 5000);
  
  return () => {
    isMounted = false;
    clearInterval(contactsInterval);
  };
}, []);
  
  const filteredDetails = details.filter(entry => 
    entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.packageType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(contact => 
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.message && contact.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const chartData = details.reduce((acc, entry) => {
    const date = new Date(entry.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  // Calculate stats
  const totalSubmissions = details.length;
  const totalContacts = contacts.length;

  // Today's date calculations
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Package submissions stats
  const todaysSubmissions = details.filter(d => 
    new Date(d.createdAt).toDateString() === today.toDateString()
  ).length;

  const yesterdaysSubmissions = details.filter(d => 
    new Date(d.createdAt).toDateString() === yesterday.toDateString()
  ).length;

  const dailyChange = yesterdaysSubmissions > 0 
    ? Math.round(((todaysSubmissions - yesterdaysSubmissions) / yesterdaysSubmissions) * 100)
    : todaysSubmissions > 0 ? 100 : 0;

  // Contact form stats
  const todaysContacts = contacts.filter(c => 
    new Date(c.createdAt).toDateString() === today.toDateString()
  ).length;

  const yesterdaysContacts = contacts.filter(c => 
    new Date(c.createdAt).toDateString() === yesterday.toDateString()
  ).length;

  const contactsDailyChange = yesterdaysContacts > 0 
    ? Math.round(((todaysContacts - yesterdaysContacts) / yesterdaysContacts) * 100)
    : todaysContacts > 0 ? 100 : 0;

  // Student package stats
  const todayStudentCount = details.filter(d => 
    d.packageType === 'Student' && 
    new Date(d.createdAt).toDateString() === today.toDateString()
  ).length;

  const studentRateToday = todaysSubmissions > 0 
    ? Math.round((todayStudentCount / todaysSubmissions) * 100) 
    : 0;

  const renderDashboardView = () => (
    <>
      <header className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <div className="header-actions">
          <button 
            className="export-button" 
            onClick={() => exportToExcel(details, 'package_submissions')}
          >
            Export Package Data
          </button>
          <button 
            className="export-button" 
            onClick={() => exportToExcel(contacts, 'contact_submissions')}
          >
            Export Contact Data
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Packages</h3>
          <p className="stat-value">{totalSubmissions}</p>
          <p className="stat-meta">All time package submissions</p>
        </div>
        
        <div className="stat-card">
          <h3>Today's Packages</h3>
          <p className="stat-value">{todaysSubmissions}</p>
          <p className={`stat-change ${dailyChange >= 0 ? 'positive' : 'negative'}`}>
            {dailyChange >= 0 ? '↑' : '↓'} {Math.abs(dailyChange)}% from yesterday
          </p>
        </div>

        <div className="stat-card">
          <h3>Total Contacts</h3>
          <p className="stat-value">{totalContacts}</p>
          <p className="stat-meta">All time contact submissions</p>
        </div>

        <div className="stat-card">
          <h3>Today's Contacts</h3>
          <p className="stat-value">{todaysContacts}</p>
          <p className={`stat-change ${contactsDailyChange >= 0 ? 'positive' : 'negative'}`}>
            {contactsDailyChange >= 0 ? '↑' : '↓'} {Math.abs(contactsDailyChange)}% from yesterday
          </p>
        </div>

        <div className="stat-card">
          <h3>Student Rate</h3>
          <p className="stat-value">{studentRateToday}%</p>
          <p className="stat-meta">Of today's packages</p>
        </div>
      </div>

      <div className="chart-section">
        <div className="section-header">
          <h2>Package Submissions Trend</h2>
          <div className="chart-toggle">
            <button 
              className={`toggle-option ${activeChart === 'bar' ? 'active' : ''}`}
              onClick={() => setActiveChart('bar')}
            >
              Bar
            </button>
            <button 
              className={`toggle-option ${activeChart === 'line' ? 'active' : ''}`}
              onClick={() => setActiveChart('line')}
            >
              Line
            </button>
          </div>
        </div>
        <div className="chart-container">
          <SubmissionsChart data={chartData} type={activeChart} />
        </div>
      </div>

      <div className="recent-data-grid">
        <div className="recent-submissions">
          <div className="section-header">
            <h2>Recent Packages</h2>
            <button 
              className="view-all-button"
              onClick={() => setActiveView('packages')}
            >
              View All
            </button>
          </div>
          {loading.details ? (
            <div className="loading-state">
              <div className="spinner"></div>
            </div>
          ) : error.details ? (
            <p className="error-state">Error: {error.details}</p>
          ) : details.length === 0 ? (
            <p className="empty-state">No package submissions found</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Package</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {details.slice(0, 5).map((entry, index) => (
                  <tr key={`package-${index}`}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {entry.email.charAt(0).toUpperCase()}
                        </div>
                        {entry.email}
                      </div>
                    </td>
                    <td>
                      <span className={`package-tag ${entry.packageType.toLowerCase()}`}>
                        {entry.packageType}
                      </span>
                    </td>
                    <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="recent-contacts">
          <div className="section-header">
            <h2>Recent Contacts</h2>
            <button 
              className="view-all-button"
              onClick={() => setActiveView('contacts')}
            >
              View All
            </button>
          </div>
          {loading.contacts ? (
            <div className="loading-state">
              <div className="spinner"></div>
            </div>
          ) : error.contacts ? (
            <p className="error-state">Error: {error.contacts}</p>
          ) : contacts.length === 0 ? (
            <p className="empty-state">No contact submissions found</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {contacts.slice(0, 5).map((contact, index) => (
                  <tr key={`contact-${index}`}>
                    <td>{contact.name}</td>
                    <td>{contact.email}</td>
                    <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );

  const renderPackagesView = () => (
    <div className="full-data-view">
      <div className="section-header">
        <button
          className="back-button"
          onClick={() => setActiveView('dashboard')}
        >
          ← Back to Dashboard
        </button>
        <h2>All Package Submissions</h2>
        <div className="controls">
          <input
            type="text"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className="export-button" 
            onClick={() => exportToExcel(details, 'package_submissions')}
          >
            Export Data
          </button>
        </div>
      </div>

      {loading.details ? (
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      ) : error.details ? (
        <p className="error-state">Error: {error.details}</p>
      ) : filteredDetails.length === 0 ? (
        <p className="empty-state">No package submissions match your search</p>
      ) : (
        <table className="data-table full-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Package</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredDetails.map((entry, index) => (
              <tr key={index}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {entry.email.charAt(0).toUpperCase()}
                    </div>
                    {entry.email}
                  </div>
                </td>
                <td>
                  <span className={`package-tag ${entry.packageType.toLowerCase()}`}>
                    {entry.packageType}
                  </span>
                </td>
                <td>{new Date(entry.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderContactsView = () => (
    <div className="full-data-view">
      <div className="section-header">
        <button
          className="back-button"
          onClick={() => setActiveView('dashboard')}
        >
          ← Back to Dashboard
        </button>
        <h2>All Contact Submissions</h2>
        <div className="controls">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className="export-button" 
            onClick={() => exportToExcel(contacts, 'contact_submissions')}
          >
            Export Data
          </button>
        </div>
      </div>

      {loading.contacts ? (
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      ) : error.contacts ? (
        <p className="error-state">Error: {error.contacts}</p>
      ) : filteredContacts.length === 0 ? (
        <p className="empty-state">No contact submissions match your search</p>
      ) : (
        <table className="data-table full-table">
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

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>g-ni</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li
              className={activeView === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveView('dashboard')}
            >
              <span>📊</span>
              {sidebarOpen && <span>Dashboard</span>}
            </li>
            <li
              className={activeView === 'packages' ? 'active' : ''}
              onClick={() => setActiveView('packages')}
            >
              <span>📦</span>
              {sidebarOpen && <span>Packages</span>}
            </li>
            <li
              className={activeView === 'contacts' ? 'active' : ''}
              onClick={() => setActiveView('contacts')}
            >
              <span>✉️</span>
              {sidebarOpen && <span>Contacts</span>}
            </li>
          </ul>
        </nav>
        {sidebarOpen && (
          <div className="sidebar-footer">
            <p>Total Packages: {totalSubmissions}</p>
            <p>Total Contacts: {totalContacts}</p>
          </div>
        )}
      </div>

      <div className="main-content">
        {activeView === 'dashboard' && renderDashboardView()}
        {activeView === 'packages' && renderPackagesView()}
        {activeView === 'contacts' && renderContactsView()}
      </div>
    </div>
  );
};

export default Dashboard;