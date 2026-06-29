'use client';

import { useState, useEffect } from 'react';

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');

  async function loadFeedback() {
    const res = await fetch('/api/feedback');
    const data = await res.json();
    setFeedbackList(data);
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Submitting...');
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, text }),
    });
    setName('');
    setText('');
    setStatus('Submitted!');
    loadFeedback();
  }

  return (
    <div>
      <h2>Submit Feedback</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '500px' }}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <textarea
          placeholder="Your feedback"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={2000}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          Submit
        </button>
        {status && <p style={{ color: 'green' }}>{status}</p>}
      </form>

      <h2 style={{ marginTop: '2rem' }}>All Feedback</h2>
      {feedbackList.length === 0 && <p>No feedback yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {feedbackList.map((item) => (
          <li
            key={item.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <strong>{item.name}</strong>
            <span style={{ color: '#888', marginLeft: '1rem', fontSize: '0.85rem' }}>
              {item.createdAt}
            </span>
            {/* FLAW #3 FIX: Render feedback as plain text — never interpret user content as HTML. */}
            <p>{item.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
