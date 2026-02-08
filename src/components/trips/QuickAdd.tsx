'use client';

export function QuickAdd() {
  return (
    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-lg p-6">
      <h3 className="font-bold text-lg mb-4 gradient-text-135">✨ Quick Add</h3>
      <input
        type="text"
        placeholder="Search for a place..."
        className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
      />
      <button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
        Add to Trip
      </button>
    </div>
  );
}
