import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [topic, setTopic] = useState('');
  const [agenda, setAgenda] = useState('');
  const [duration, setDuration] = useState('');
  const [meetings, setMeetings] = useState([]);


  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get('https://api.creative.thoughts.ashishphotography.co.in/meetings');
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const start_time = `${date}T${time}:00`;
    const formData = { start_time, topic, agenda, duration };

    
    try {
      const response = await axios.post('https://api.creative.thoughts.ashishphotography.co.in/createMeeting', formData);
      console.log('Meeting created:', response.data);

      setDate('');
      setTime('');
      setTopic('');
      setAgenda('');
      setDuration('');
      fetchMeetings();
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  return (
    <div className='flexxxxx w-100'>
      <div className="login-box mt-2 meetinglists w-100">
        <h2>Zoom Booking</h2>
        <form onSubmit={handleSubmit}>
        <label>Date</label>
          <div className="user-box">
            <input type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <label htmlFor="timeSelect">Time</label>
          <div className="user-box mb-4">
            <select id="timeSelect" name="timeSelect" value={time} onChange={(e) => setTime(e.target.value)} required>
              <option value="" selected disabled>Select</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="15:00">3:00 PM</option>
            </select>
          </div>

          <div className="user-box">
            <input type="text" name="topic" value={topic} onChange={(e) => setTopic(e.target.value)} required />
            <label>Topic</label>
          </div>

          <div className="user-box">
            <input type="text" name="agenda" value={agenda} onChange={(e) => setAgenda(e.target.value)} required />
            <label>Agenda</label>
          </div>

          <label htmlFor="durationSelect">Duration</label>
          <div className="user-box mb-3">
            <select id="durationSelect" name="durationSelect" value={duration} onChange={(e) => setDuration(e.target.value)} required>
              <option value="" selected disabled>Select</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>

          <a href="#">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <button type="submit">Submit</button>
          </a>
        </form>
      </div>

      <div className='text-white meetinglists w-100' >
        <h4>Meeting List</h4>
        <p>Number of bookings: {meetings.length}</p>
        {meetings.length === 0 ? (
          <p>No meetings found</p>
        ) : (
          <ul>
            {meetings.map((meeting, index) => (
              <li key={index} className='listitemss'>
                <strong>Topic:</strong> {meeting.topic}<br />
                <strong>Start Time:</strong> {meeting.start_time}<br />
                <strong>Duration:</strong> {meeting.duration} minutes<br />
                <strong>Agenda:</strong> {meeting.agenda}<br />
                <strong>Join URL:</strong> <a href={meeting.join_url} target="_blank" rel="noopener noreferrer">Join Meeting</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
