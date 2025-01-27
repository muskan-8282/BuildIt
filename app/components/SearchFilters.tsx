"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SearchFiltersProps {
  onFilterChange: (filters: { keyword: string; minPrice: number; maxPrice: number }) => void
}

export default function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [keyword, setKeyword] = useState("")
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(Number.MAX_SAFE_INTEGER)

  const updateFilters = () => {
    onFilterChange({
      keyword,
      minPrice,
      maxPrice
    })
  }

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
    onFilterChange({
      keyword: e.target.value,
      minPrice,
      maxPrice
    })
  }

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value) || 0
    setMinPrice(value)
    onFilterChange({
      keyword,
      minPrice: value,
      maxPrice
    })
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : Number.MAX_SAFE_INTEGER
    setMaxPrice(value)
    onFilterChange({
      keyword,
      minPrice,
      maxPrice: value
    })
  }

  const handleClearKeyword = () => {
    setKeyword("")
    onFilterChange({
      keyword: "",
      minPrice,
      maxPrice
    })
  }

  return (
    <div className="mb-8 p-4 bg-gray-100 rounded-lg">
      <div className="mb-4">
        <Label htmlFor="keyword">Search by keyword</Label>
        <div className="relative">
          <Input
            id="keyword"
            value={keyword}
            onChange={handleKeywordChange}
            placeholder="Enter keywords..."
            className="pr-8"
          />
          {keyword && (
            <button
              type="button"
              onClick={handleClearKeyword}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="minPrice">Minimum Price</Label>
        <Input
          id="minPrice"
          type="text"
          pattern="[0-9]*"
          value={minPrice.toString()}
          onChange={(e) => handleMinPriceChange({ target: { value: e.target.value } })}
          placeholder="Minimum Price"
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="maxPrice">Maximum Price</Label>
        <Input
          id="maxPrice"
          type="number"
          min="0"
          value={maxPrice === Number.MAX_SAFE_INTEGER ? "" : maxPrice}
          onChange={handleMaxPriceChange}
          placeholder="Maximum Price"
        />
      </div>
    </div>
  )
}

