import React from 'react';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="container">
        <section className="card">
          <h2>Welcome</h2>
          <p>Select an option from the top navigation to check-in/out, view history, request leave, or (if admin) open the dashboard.</p>
        </section>
      </main>
    </>
  );
}