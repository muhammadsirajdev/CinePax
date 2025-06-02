"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Star, Clock, Calendar, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { movies } from "../services/api"

interface Movie {
  _id: string
  title: string
  image: string
  description: string
  genre: string
  year: number
  rating: number
  duration: string
  releaseDate: string
}

const Movies = () => {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [moviesList, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("title")
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  // Get unique genres and years for filters
  const genres = Array.from(new Set(moviesList.map((movie) => movie.genre))).sort()
  const years = Array.from(new Set(moviesList.map((movie) => movie.year))).sort((a, b) => b - a)

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)
      try {
        const response = await movies.getAll()
        const moviesData = response.data || []
        setMovies(moviesData)
        setFilteredMovies(moviesData)
      } catch (error) {
        console.error("Error fetching movies:", error)
        setMovies([])
        setFilteredMovies([])
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  useEffect(() => {
    const filtered = moviesList.filter((movie) => {
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesGenre = selectedGenre === "all" || movie.genre === selectedGenre
      const matchesYear = selectedYear === "all" || movie.year.toString() === selectedYear

      return matchesSearch && matchesGenre && matchesYear
    })

    // Sort movies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "year":
          return b.year - a.year
        case "rating":
          return b.rating - a.rating
        default:
          return 0
      }
    })

    setFilteredMovies(filtered)
  }, [moviesList, searchQuery, selectedGenre, selectedYear, sortBy])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedGenre("all")
    setSelectedYear("all")
    setSortBy("title")
  }

  const hasActiveFilters = searchQuery || selectedGenre !== "all" || selectedYear !== "all" || sortBy !== "title"

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder.svg"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Movies</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover and book tickets for the latest movies showing in our theaters
          </p>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Genre</label>
                    <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genres</SelectItem>
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Year</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters} className="w-full">
                        <X className="mr-2 h-4 w-4" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary">
                    Search: {searchQuery}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                  </Badge>
                )}
                {selectedGenre !== "all" && (
                  <Badge variant="secondary">
                    Genre: {selectedGenre}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSelectedGenre("all")} />
                  </Badge>
                )}
                {selectedYear !== "all" && (
                  <Badge variant="secondary">
                    Year: {selectedYear}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSelectedYear("all")} />
                  </Badge>
                )}
                {sortBy !== "title" && (
                  <Badge variant="secondary">
                    Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSortBy("title")} />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredMovies.length} of {moviesList.length} movies
          </p>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <Card key={movie._id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                  onError={handleImageError}
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {movie.rating}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {movie.year}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {movie.duration}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{movie.description}</p>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button className="w-full" onClick={() => navigate(`/movies/${movie._id}`)}>
                  Book Tickets
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No movies found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Movies
