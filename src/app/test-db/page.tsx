'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface CaseType {
  case_type_id: number
  case_type_name: string
  case_type_code: string
  description: string
}

export default function TestDatabase() {
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCaseTypes() {
      try {
        const { data, error } = await supabase
          .from('case_types')
          .select('*')
          .limit(5)

        if (error) {
          throw error
        }

        setCaseTypes(data || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchCaseTypes()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Testing database connection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h1 className="text-red-800 text-xl font-semibold mb-2">Database Connection Error</h1>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-red-500 mt-4">
            Check your .env.local file and Supabase settings.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-green-800 mb-4">
            🎉 Database Connection Successful!
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Successfully connected to Supabase and retrieved case types:
            </p>
            <p className="text-sm text-gray-500">
              Found {caseTypes.length} case types in the database
            </p>
          </div>

          <div className="space-y-3">
            {caseTypes.map((caseType) => (
              <div key={caseType.case_type_id} className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-800">{caseType.case_type_name}</h3>
                <p className="text-sm text-gray-600">{caseType.case_type_code}</p>
                <p className="text-sm text-gray-500 mt-1">{caseType.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800 mb-2">✅ What&apos;s Working:</h2>
            <ul className="list-disc list-inside text-green-700 space-y-1">
              <li>Next.js 14 application</li>
              <li>Supabase database connection</li>
              <li>Environment variables</li>
              <li>TypeScript configuration</li>
              <li>Tailwind CSS styling</li>
              <li>Database queries</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}