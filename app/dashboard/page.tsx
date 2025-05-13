"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Activity, ChevronDown, ChevronLeft, ChevronRight, Database, Download, RefreshCw, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"

interface MonitoringRecord {
  date_time: string
  source: string
  total_records: number | string
  success_status: string
  error_message: string
}

export default function Dashboard() {
  const { logout } = useAuth()
  const [selectedSource, setSelectedSource] = useState<string>("All Sources")
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [totalPages, setTotalPages] = useState(1)

  // Generate more sample data for pagination demo
  const generateSampleData = async (): Promise<MonitoringRecord[]> => {
    const response = await fetch('/api/scraping-logs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })
    
    const data = await response.json()

    // Sort by date (newest first)
    data.sort((a: MonitoringRecord, b: MonitoringRecord) => {
      const dateA = new Date(a.date_time)
      const dateB = new Date(b.date_time)
      return dateB.getTime() - dateA.getTime()
    })

    return data
  }

  // Sample data
  const [allRecords, setAllRecords] = useState<MonitoringRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MonitoringRecord[]>([])
  const [displayedRecords, setDisplayedRecords] = useState<MonitoringRecord[]>([])
  const [sources, setSources] = useState<string[]>(["All Sources"])

  // Get the most recent run date from records
  const getLastRunDate = () => {
    if (allRecords.length === 0) return "--/--/----"
    const lastRecord = allRecords[0] // Records are already sorted by date in descending order
    return formatDateTime(lastRecord.date_time)
  }

  // Get the success status of the most recent run
  const getLastRunSuccess = () => {
    if (allRecords.length === 0) return "--"
    const lastRecord = allRecords[0]
    return lastRecord.success_status === "true" ? "True" : "False"
  }

  // Initialize data
  useEffect(() => {
    const fetchData = async () => {
      const records = await generateSampleData()
      setAllRecords(records)

      // Set sources in the specified order
      setSources([
        "All Sources",
        "Montgomery Probate",
        "Montgomery Foreclosure",
        "Montgomery Divorce",
        "Greene Probate",
        "Greene Foreclosure",
        "Greene Divorce",
        "Greene Tax",
      ])

      // Set filtered records
      setFilteredRecords(records)
    }

    fetchData()
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

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Update time with client-only rendering
  useEffect(() => {
    // Set initial time only on client
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
      canvasWidth: number
      canvasHeight: number

      constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight
        this.x = Math.random() * canvasWidth
        this.y = Math.random() * canvasHeight
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.color = `rgba(${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 100) + 150}, ${Math.floor(Math.random() * 55) + 200}, ${Math.random() * 0.5 + 0.2})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > this.canvasWidth) this.x = 0
        if (this.x < 0) this.x = this.canvasWidth
        if (this.y > this.canvasHeight) this.y = 0
        if (this.y < 0) this.y = this.canvasHeight
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Create particles with canvas dimensions passed to constructor
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas.width, canvas.height))
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const particle of particles) {
        particle.update()
        particle.draw(ctx)
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

  // Format time - only run on client when currentTime exists
  const formatTime = (date: Date | null) => {
    if (!date) return "--:--:--"
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Format date - only run on client when currentTime exists
  const formatDate = (date: Date | null) => {
    if (!date) return "--/--/----"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format date time string to desired format
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
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
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-500/50 text-red-400 bg-red-950/30 hover:text-neutral-200 hover:bg-red-800"
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
        </header>

        {/* Status Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-400 mb-1">Last Run Success</div>
              <div className="text-lg font-mono text-cyan-400">{getLastRunSuccess()}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-400 mb-1">Last Run Date</div>
              <div className="text-lg font-mono text-cyan-400">{getLastRunDate()}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-400 mb-1">Total Records Fetched</div>
              <div className="text-lg font-mono text-cyan-400">{allRecords.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="text-sm text-slate-400 mb-1">Date/Time</div>
              <div className="text-lg font-mono text-cyan-400">
                {formatDate(currentTime)} {formatTime(currentTime)}
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
                    <>
                      {displayedRecords.map((record, index) => (
                        <TableRow key={index} className="border-b border-slate-700/30 hover:bg-slate-800/50">
                          <TableCell className="font-mono text-slate-400">{formatDateTime(record.date_time)}</TableCell>
                          <TableCell className="font-mono text-slate-400">{record.source}</TableCell>
                          <TableCell className="font-mono text-cyan-400">{record.total_records}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${record.success_status === "true"
                                ? "bg-green-500/20 text-green-400 border-green-500/50"
                                : "bg-red-500/20 text-red-400 border-red-500/50"
                                }`}
                            >
                              {record.success_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-amber-400">{record.error_message}</TableCell>
                        </TableRow>
                      ))}
                      {/* Add empty rows to maintain consistent height */}
                      {Array.from({ length: itemsPerPage - displayedRecords.length }).map((_, index) => (
                        <TableRow key={`empty-${index}`} className="border-b border-slate-700/30">
                          <TableCell className="font-mono text-slate-400/30">--</TableCell>
                          <TableCell className="font-mono text-slate-400/30">--</TableCell>
                          <TableCell className="font-mono text-slate-400/30">--</TableCell>
                          <TableCell>
                            <Badge className="bg-slate-800/30 text-slate-400/30 border-slate-700/30">
                              --
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-slate-400/30">--</TableCell>
                        </TableRow>
                      ))}
                    </>
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
              <div className="flex items-center space-x-2"></div>
              
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
