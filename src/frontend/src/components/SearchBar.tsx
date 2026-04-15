import { useState, useEffect } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  value: string
}

export default function SearchBar({ onSearch, value }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(localValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [localValue])

  // Trigger search when debounced value changes
  useEffect(() => {
    onSearch(debouncedValue)
  }, [debouncedValue, onSearch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
  }

  const handleClear = () => {
    setLocalValue('')
  }

  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder="Search bookmarks by title, description, or URL..."
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {localValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
