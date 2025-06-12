export default function EstimatesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Estimates List</h1>
      <p>This will show all your estimates.</p>

      <div className="mt-6">
        <a
          href="/estimates/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New Estimate
        </a>
      </div>
    </div>
  );
}
