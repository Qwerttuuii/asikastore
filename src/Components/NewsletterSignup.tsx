import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './NewsletterSignup.css';

// Initialize Supabase client 
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: email.trim().toLowerCase() }]);

      if (error) {
        if (error.code === '23505') { // unique_violation
          setStatus('error');
          setMessage('This email is already subscribed. Thank you!');
        } else {
          throw error;
        }
      } else {
        setStatus('success');
        setMessage('Thank you! You’re now part of the Asika community.');
        setEmail('');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    } finally {
      // Reset loading after a short delay for better UX
      setTimeout(() => {
        if (status === 'success') setStatus('idle');
      }, 3000);
    }
  };

  return (
    <section className="newsletter">
      <div className="newsletter__content">
        <div className="newsletter__decoration">
          STAY IN THE KNOW
        </div>

        <h2 className="newsletter__title">
          Join the Asika Edit
        </h2>

        <p className="newsletter__subtitle">
          Be the first to know about new drops, exclusive offers, 
          and stories behind the collection.
        </p>

        <form onSubmit={handleSubmit} className="newsletter__form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="newsletter__input"
            required
            disabled={status === 'loading'}
          />

          <button
            type="submit"
            className="newsletter__button"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <p className={`newsletter__message ${status === 'success' ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
      </div>
    </section>
  );
};

export default NewsletterSignup;