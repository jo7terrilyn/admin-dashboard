"use client"

import React from "react"

import { useEffect, useRef, useState } from "react"
import { Activity, ChevronDown, ChevronLeft, ChevronRight, Database, Download, RefreshCw, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface MonitoringRecord {
  id: string
  date_time: string
  source: string
  total_records: number
  success_status: boolean
  error_message: string
  created_at: string
}

export default function Dashboard() {
  const [selectedSource, setSelectedSource] = useState<string>("All Sources")
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [totalPages, setTotalPages] = useState(1)

  // Records data
  const [allRecords, setAllRecords] = useState<MonitoringRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MonitoringRecord[]>([])
  const [displayedRecords, setDisplayedRecords] = useState<MonitoringRecord[]>([])
  const [sources, setSources] = useState<string[]>(["All Sources"])
  const [lastRunSuccess, setLastRunSuccess] = useState<boolean>(false)
  const [lastRunDate, setLastRunDate] = useState<string>("")
  const [totalRecordsFetched, setTotalRecordsFetched] = useState<number>(0)

  // Fetch records from backend
  const fetchRecords = async () => {
    setIsLoading(true)
    try {
      // Try multiple API URLs in sequence
      const urls = [
        '/api/v1/scraping-logs', // Try the local proxy first
        'http://localhost:8000/api/v1/scraping-logs' // Try direct backend connection as fallback
      ];
      
      let data: MonitoringRecord[] = [];
      let fetchSuccess = false;
      
      // Try each URL until one works
      for (const url of urls) {
        try {
          console.log(`Attempting to fetch from: ${url}`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          
          data = await response.json();
          fetchSuccess = true;
          console.log(`Successfully fetched data from: ${url}`);
          break; // Exit the loop if successful
        } catch (error) {
          console.error(`Error fetching from ${url}:`, error);
          // Continue to next URL
        }
      }
      
      if (!fetchSuccess) {
        throw new Error('All fetch attempts failed');
      }
      
      // Sort by date (newest first)
      data.sort((a, b) => {
        const dateA = new Date(a.date_time)
        const dateB = new Date(b.date_time)
        return dateB.getTime() - dateA.getTime()
      })
      
      setAllRecords(data)
      
      // Extract unique sources
      const uniqueSources = Array.from(new Set(data.map(record => record.source)))
      setSources(["All Sources", ...uniqueSources])
      
      // Set last run info
      if (data.length > 0) {
        const latestRecord = data[0]
        setLastRunSuccess(latestRecord.success_status)
        setLastRunDate(formatDateFromISO(latestRecord.date_time))
        setTotalRecordsFetched(data.reduce((sum, record) => sum + record.total_records, 0))
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error("All API attempts failed, using mock data:", error)
      // Use mock data if API is unavailable
      generateMockData()
      setIsLoading(false)
    }
  }

  // Generate mock data when API is unavailable
  const generateMockData = () => {
    const sources = [
      "Montgomery Probate",
      "Montgomery Foreclosure", 
      "Montgomery Divorce",
      "Greene Probate",
      "Greene Foreclosure",
      "Greene Divorce",
      "Greene Tax"
    ]
    
    const mockRecords: MonitoringRecord[] = [
      {
        id: "e9916034-eae4-4785-8ae1-a6cbbe459205",
        date_time: "2025-05-12T13:36:33.464778",
        source: "Greene Tax",
        total_records: 6,
        success_status: true,
        error_message: "",
        created_at: "2025-05-12T17:36:34.157838Z"
      },
      {
        id: "c75dc165-840b-4938-b836-7d62c0629136",
        date_time: "2025-05-12T13:45:37.793851",
        source: "Greene Foreclosure",
        total_records: 42,
        success_status: true,
        error_message: "",
        created_at: "2025-05-12T17:45:38.472565Z"
      },
      {
        id: "00263ccd-9f0c-43ac-a217-d158040fdc14",
        date_time: "2025-05-12T14:00:49.418941",
        source: "Greene Divorce",
        total_records: 79,
        success_status: true,
        error_message: "",
        created_at: "2025-05-12T18:00:50.031483Z"
      },
      {
        id: "0282f400-f9c9-4296-8445-551c61a9ea7f",
        date_time: "2025-05-12T14:14:18.929696",
        source: "Greene Probate",
        total_records: 201,
        success_status: true,
        error_message: "",
        created_at: "2025-05-12T18:14:21.050049Z"
      },
      {
        id: "321d5bf1-0c69-4cbc-ab50-cefddbdb5c4e",
        date_time: "2025-05-12T15:22:00",
        source: "Montgomery Divorce",
        total_records: 0,
        success_status: false,
        error_message: "No data",
        created_at: "2025-05-12T19:22:04.260760Z"
      },
      {
        id: "da14d3ef-b0e6-443e-b904-3114f04dca54",
        date_time: "2025-05-12T15:23:37.571954",
        source: "Montgomery Foreclosure",
        total_records: 1,
        success_status: true,
        error_message: "",
        created_at: "2025-05-12T19:23:38.242827Z"
      }
    ];
    
    setAllRecords(mockRecords);
    setSources(["All Sources", ...sources]);
    
    // Set last run info
    if (mockRecords.length > 0) {
      const latestRecord = mockRecords[0];
      setLastRunSuccess(latestRecord.success_status);
      setLastRunDate(formatDateFromISO(latestRecord.date_time));
      setTotalRecordsFetched(mockRecords.reduce((sum, record) => sum + record.total_records, 0));
    }
  }

  // Initialize data
  useEffect(() => {
    fetchRecords()
  }, [])

  // Update displayed records when filtered records or pagination changes
  useEffect(() => {
    if (filteredRecords.length > 0) {
      const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
      setTotalPages(totalPages)

      // Ensure current page is valid
      const validCurrentPage = Math.min(currentPage, totalPages)
      if (validCurrentPage !== currentPage) {
        setCurrentPage(validCurrentPage)
      }

      // Slice records for current page
      const startIndex = (validCurrentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      setDisplayedRecords(filteredRecords.slice(startIndex, endIndex))
    } else {
      setDisplayedRecords([])
      setTotalPages(1)
    }
  }, [filteredRecords, currentPage, itemsPerPage])

  // Filter records when source changes
  useEffect(() => {
    if (selectedSource === "All Sources") {
      setFilteredRecords(allRecords)
    } else {
      setFilteredRecords(allRecords.filter((record) => record.source === selectedSource))
    }
    setCurrentPage(1) // Reset to first page when filter changes
  }, [selectedSource, allRecords])

  // Update time - only run on client side
  useEffect(() => {
    // Set initial time after component mounts (client-side only)
    setCurrentTime(new Date())
    
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1) // Reset to first page when items per page changes
  }

  // Format date from ISO string
  const formatDateFromISO = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
  }

  // Format time from ISO string
  const formatTimeFromISO = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // Format display date/time for table
  const formatDisplayDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  // Particle effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: Particle[] = []
    const particleCount = 100

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * (canvas?.width || 0)
        this.y = Math.random() * (canvas?.height || 0)
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.color = `rgba(${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 100) + 150}, ${Math.floor(Math.random() * 55) + 200}, ${Math.random() * 0.5 + 0.2})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (canvas) {
          if (this.x > canvas.width) this.x = 0
          if (this.x < 0) this.x = canvas.width
          if (this.y > canvas.height) this.y = 0
          if (this.y < 0) this.y = canvas.height
        }
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const particle of particles) {
        particle.update()
        particle.draw()
      }

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchRecords()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden flex flex-col justify-center">
      {/* Background particle effect */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-r-purple-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
              <div className="absolute inset-6 border-4 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-slower"></div>
              <div className="absolute inset-8 border-4 border-l-green-500 border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-cyan-500 font-mono text-sm tracking-wider">SYSTEM INITIALIZING</div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 relative z-10 py-8 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between py-4 border-b border-slate-700/50 mb-6">
          <div className="flex items-center space-x-2">
            <Database className="h-8 w-8 text-cyan-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              MONITORING DASHBOARD
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-1 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50 backdrop-blur-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search records..."
                className="bg-transparent border-none focus:outline-none text-sm w-40 placeholder:text-slate-500"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-950/30"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Link href="/sign-in">
              <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-950/30">
                Sign Out
              </Button>
            </Link>
          </div>
        </header>

        {/* Status Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-400 mb-1">Last Run Success</div>
              <div className="text-lg font-mono text-cyan-400">{lastRunSuccess ? "True" : "False"}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-400 mb-1">Last Run Date</div>
              <div className="text-lg font-mono text-cyan-400">{lastRunDate || "N/A"}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-400 mb-1">Total Records Fetched</div>
              <div className="text-lg font-mono text-cyan-400">{totalRecordsFetched}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-400 mb-1">Date/Time</div>
              <div className="text-lg font-mono text-cyan-400">
                {currentTime ? (
                  <>
                    {formatDate(currentTime)} {formatTime(currentTime)}
                  </>
                ) : (
                  "Loading..."
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-400 mb-1">Source</div>
              <div className="relative">
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-slate-100 py-2 px-3 pr-8 rounded appearance-none focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-cyan-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden flex-grow flex flex-col">
          <CardHeader className="border-b border-slate-700/50 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-100 flex items-center">
                <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                Monitoring Records
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-slate-800/50 text-cyan-400 border-cyan-500/50 text-xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 mr-1 animate-pulse"></div>
                  LIVE
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-grow flex flex-col">
            <div className="overflow-x-auto flex-grow">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-700/50 hover:bg-slate-800/50">
                    <TableHead className="text-slate-300 font-mono">Date/Time</TableHead>
                    <TableHead className="text-slate-300 font-mono">Source</TableHead>
                    <TableHead className="text-slate-300 font-mono">Total Records</TableHead>
                    <TableHead className="text-slate-300 font-mono">Success Status</TableHead>
                    <TableHead className="text-slate-300 font-mono">Error Messages</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedRecords.length > 0 ? (
                    displayedRecords.map((record) => (
                      <TableRow key={record.id} className="border-b border-slate-700/30 hover:bg-slate-800/50">
                        <TableCell className="font-mono text-slate-400">{formatDisplayDateTime(record.date_time)}</TableCell>
                        <TableCell className="font-mono text-slate-400">{record.source}</TableCell>
                        <TableCell className="font-mono text-cyan-400">{record.total_records}</TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              record.success_status
                                ? "bg-green-500/20 text-green-400 border-green-500/50"
                                : "bg-red-500/20 text-red-400 border-red-500/50"
                            }`}
                          >
                            {record.success_status ? "True" : "False"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-amber-400">{record.error_message}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                        No records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-slate-700/50 p-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="bg-slate-800 border border-slate-700 text-slate-100 py-1 px-2 rounded text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-sm text-slate-400 mr-2">
                  {filteredRecords.length > 0
                    ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredRecords.length)} of ${filteredRecords.length}`
                    : "0 of 0"}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-100 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-100 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
