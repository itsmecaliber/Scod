import { useState } from 'react';
import { FaCommentDots, FaTimes, FaStar } from 'react-icons/fa';

export default function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [stars, setStars] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        try {
            const res = await fetch('https://scod.onrender.com/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message, stars }),
            });

            if (res.ok) {
                setSubmitted(true);
                setMessage('');
                setStars(0);
                setTimeout(() => {
                    setSubmitted(false);
                    setFadeOut(true);
                    setTimeout(() => {
                        setIsOpen(false);
                        setFadeOut(false);
                    }, 300);
                }, 1000);
            } else {
                alert('Failed to submit feedback');
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className="relative">
                {isOpen && (
                    <div
                        className={`absolute bottom-14 right-0 w-72 bg-zinc-900 text-white rounded-2xl shadow-lg p-4 border border-gray-700 
                            ${fadeOut ? 'animate-fade-out-up' : 'animate-fade-up'}`}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">Your Feedback</h3>
                            <button onClick={() => setIsOpen(false)}>
                                <FaTimes className="text-gray-300 hover:text-red-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Stars above textarea */}
                            <div className="flex items-center space-x-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        className={`cursor-pointer ${star <= stars ? 'text-yellow-400' : 'text-gray-500'
                                            }`}
                                        onClick={() => setStars(star)}
                                    />
                                ))}
                            </div>

                            <textarea
                                className="w-full h-24 p-2 border border-gray-700 rounded-lg resize-none bg-black text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Write your thoughts..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />

                            <button
                                type="submit"
                                className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                            >
                                Submit
                            </button>
                        </form>

                        {submitted && (
                            <p className="text-green-400 text-sm mt-2">Feedback sent successfully!</p>
                        )}
                    </div>
                )}

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition duration-300"
                    aria-label="Feedback"
                >
                    <FaCommentDots size={24} />
                </button>
            </div>
        </div>
    );
}
