"use client"

import React, { useState, useEffect, useMemo } from 'react'
import XLSX from 'xlsx-js-style'
import {
    Radio,
    Plus,
    Search,
    Trash2,
    Edit,
    SlidersHorizontal,
    Download,
    AlertTriangle,
    CheckCircle2,
    MapPin,
    Activity,
    X,
    ChevronsUpDown,
    Building2,
    Info,
    Layers
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8015";

const formatCurrency = (val: any) => {
    if (val === undefined || val === null || val === '') return '—';
    const num = Number(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

// Define Tower Type matching the database structure
interface Tower {
    id: number | string
    owner: string
    typeUnit: string
    serialNumber: string
    snDea: string
    unitFrom: string
    regional: string
    site: string
    position: string
    customer: string
    status: string
    rentSell: 'RENT' | 'SELL'
    hargaJual?: number | string
    hargaBeli?: number | string
    hargaSewa?: number | string
    hargaCorrective?: number | string
    tanggal?: string | null
    createdAt?: string
    updatedAt?: string
    history?: string
}

interface HistoryEntry {
    event: string
    date: string
    details: string
}

// Columns definition with custom width percentages
const ALL_COLUMNS = [
    { key: 'tanggal', label: 'TANGGAL', width: '8%' },
    { key: 'owner', label: 'OWNER', width: '5%' },
    { key: 'typeUnit', label: 'TYPE UNIT', width: '8%' },
    { key: 'serialNumber', label: 'SERIAL NUMBER', width: '8%' },
    { key: 'snDea', label: 'SN DEA', width: '8%' },
    { key: 'unitFrom', label: 'UNIT FROM SITE/WH', width: '8%' },
    { key: 'regional', label: 'REGIONAL', width: '6%' },
    { key: 'site', label: 'SITE', width: '10%' },
    { key: 'position', label: 'POSITION', width: '6%' },
    { key: 'customer', label: 'CUSTOMER', width: '6%' },
    { key: 'status', label: 'STATUS', width: '6%' },
    { key: 'rentSell', label: 'RENT / SELL', width: '6%' },
    { key: 'hargaBeli', label: 'HARGA BELI', width: '8%' },
    { key: 'hargaJual', label: 'HARGA JUAL', width: '8%' },
    { key: 'hargaSewa', label: 'HARGA SEWA', width: '8%' },
    { key: 'hargaCorrective', label: 'HARGA CORRECTIVE', width: '8%' },
]
export default function RemovableTowerPage() {
    const [towers, setTowers] = useState<Tower[]>([])
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
        tanggal: true,
        owner: true,
        typeUnit: true,
        serialNumber: true,
        snDea: true,
        unitFrom: true,
        regional: true,
        site: true,
        position: true,
        customer: true,
        status: true,
        rentSell: true,
        hargaBeli: true,
        hargaJual: true,
        hargaSewa: true,
        hargaCorrective: true,
    })

    const [searchQuery, setSearchQuery] = useState('')
    const [positionFilter, setPositionFilter] = useState('All')
    const [rentSellFilter, setRentSellFilter] = useState('All')
    const [activeTab, setActiveTab] = useState<'ALL' | 'CORRECTIVE'>('ALL')
    const [sortConfig, setSortConfig] = useState<{ key: keyof Tower; direction: 'asc' | 'desc' } | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Reset to page 1 on filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, positionFilter, rentSellFilter, activeTab])

    // Dialog States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedTower, setSelectedTower] = useState<Tower | null>(null)
    const [showManageCols, setShowManageCols] = useState(false)

    // Newly Added Tower Info Modal States
    const [isNewTowerInfoModalOpen, setIsNewTowerInfoModalOpen] = useState(false)
    const [newlyAddedTower, setNewlyAddedTower] = useState<Tower | null>(null)
    const [isNewTowerCorrective, setIsNewTowerCorrective] = useState(false)
    const [newTowerCorrectivePrice, setNewTowerCorrectivePrice] = useState('')
    const [isSavingCorrective, setIsSavingCorrective] = useState(false)

    // Toast Alert State
    const [toastMessage, setToastMessage] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState<Omit<Tower, 'id'> | Tower>({
        tanggal: new Date().toISOString().split('T')[0],
        owner: 'DEA',
        typeUnit: 'COMBAT MEDIUM 42',
        serialNumber: '',
        snDea: '',
        unitFrom: 'BUYBACK / WH SAYAP',
        regional: 'JAWA BARAT',
        site: '',
        position: 'ON SITE',
        customer: 'DEA',
        status: 'ON SITE',
        rentSell: 'RENT',
        hargaJual: '',
        hargaBeli: '',
        hargaSewa: '',
        hargaCorrective: ''
    })

    // Fetch from backend
    const fetchTowers = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/reto`)
            if (res.ok) {
                const data = await res.json()
                setTowers(data)
            }
        } catch (error) {
            console.error("Gagal mengambil data tower:", error)
            triggerToast("Gagal memuat data dari database.")
        }
    }

    // Load from local storage for columns only
    useEffect(() => {
        fetchTowers()
        if (typeof window !== 'undefined') {
            const storedCols = localStorage.getItem('dea_tower_columns_v2')
            if (storedCols) {
                try {
                    const parsed = JSON.parse(storedCols)
                    setColumnVisibility(prev => ({ ...prev, ...parsed }))
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }, [])

    const saveColumns = (newCols: Record<string, boolean>) => {
        setColumnVisibility(newCols)
        localStorage.setItem('dea_tower_columns_v2', JSON.stringify(newCols))
    }

    const triggerToast = (msg: string) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(null), 4000)
    }

    // Hide column handler
    const removeColumn = (columnKey: string) => {
        const updated = { ...columnVisibility, [columnKey]: false }
        saveColumns(updated)
        const colName = ALL_COLUMNS.find(c => c.key === columnKey)?.label || columnKey
        triggerToast(`Kolom "${colName}" disembunyikan. Anda dapat menampilkannya lagi dari menu "Kelola Kolom".`)
    }

    const toggleColumn = (columnKey: string) => {
        const updated = { ...columnVisibility, [columnKey]: !columnVisibility[columnKey] }
        saveColumns(updated)
    }

    const restoreAllColumns = () => {
        const updated = {
            owner: true,
            typeUnit: true,
            serialNumber: true,
            snDea: true,
            unitFrom: true,
            regional: true,
            site: true,
            position: true,
            customer: true,
            status: true,
            rentSell: true,
        }
        saveColumns(updated)
        triggerToast("Semua kolom berhasil ditampilkan kembali.")
    }

    const handleSort = (key: keyof Tower) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    // Filtering and Sorting
    const processedTowers = useMemo(() => {
        let result = [...towers]

        // Tab filter
        if (activeTab === 'CORRECTIVE') {
            result = result.filter(t => t.status === 'CORRECTIVE')
        }

        // Search query filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            result = result.filter(t =>
                t.owner.toLowerCase().includes(q) ||
                t.typeUnit.toLowerCase().includes(q) ||
                t.serialNumber.toLowerCase().includes(q) ||
                t.snDea.toLowerCase().includes(q) ||
                t.unitFrom.toLowerCase().includes(q) ||
                t.regional.toLowerCase().includes(q) ||
                t.site.toLowerCase().includes(q) ||
                t.position.toLowerCase().includes(q) ||
                t.customer.toLowerCase().includes(q) ||
                t.status.toLowerCase().includes(q)
            )
        }

        // Position filter
        if (positionFilter !== 'All') {
            result = result.filter(t => t.position === positionFilter)
        }

        // Rent/Sell filter
        if (rentSellFilter !== 'All') {
            result = result.filter(t => t.rentSell === rentSellFilter)
        }

        // Sorting
        if (sortConfig) {
            const { key, direction } = sortConfig
            result.sort((a, b) => {
                const aValue = a[key]
                const bValue = b[key]
                const aStr = String(aValue).toLowerCase()
                const bStr = String(bValue).toLowerCase()
                if (aStr < bStr) return direction === 'asc' ? -1 : 1
                if (aStr > bStr) return direction === 'asc' ? 1 : -1
                return 0
            })
        }

        return result
    }, [towers, searchQuery, positionFilter, rentSellFilter, sortConfig, activeTab])

    // Statistics calculation
    const stats = useMemo(() => {
        const total = towers.length
        const onSite = towers.filter(t => t.position === 'ON SITE').length
        const whDea = towers.filter(t => t.position === 'WH DEA').length
        const corrective = towers.filter(t => t.status === 'CORRECTIVE').length

        return { total, onSite, whDea, corrective }
    }, [towers])

    // Pagination calculations
    const totalData = processedTowers.length
    const totalPages = Math.ceil(totalData / pageSize)
    const paginatedTowers = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        const end = start + pageSize
        return processedTowers.slice(start, end)
    }, [processedTowers, currentPage, pageSize])

    // CRUD actions
    const openAddModal = () => {
        setFormData({
            tanggal: new Date().toISOString().split('T')[0],
            owner: '',
            typeUnit: '',
            serialNumber: '',
            snDea: '',
            unitFrom: '',
            regional: '',
            site: '',
            position: 'ON SITE',
            customer: '',
            status: '',
            rentSell: 'RENT',
            hargaJual: '',
            hargaBeli: '',
            hargaSewa: '',
            hargaCorrective: ''
        })
        setIsAddModalOpen(true)
    }

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const isRent = formData.rentSell === 'RENT'
            const payload = {
                ...formData,
                hargaBeli: formData.hargaBeli ? parseFloat(formData.hargaBeli.toString()) : null,
                hargaJual: !isRent && formData.hargaJual ? parseFloat(formData.hargaJual.toString()) : null,
                hargaSewa: isRent && formData.hargaSewa ? parseFloat(formData.hargaSewa.toString()) : null,
                hargaCorrective: null, // Always null initially
            }
            const res = await fetch(`${apiUrl}/api/reto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                setIsAddModalOpen(false)
                triggerToast(`Unit baru "${formData.serialNumber}" berhasil didaftarkan.`)
                fetchTowers()
            } else {
                const err = await res.json()
                triggerToast(`Gagal menambahkan unit: ${err.error || 'Terjadi kesalahan'}`)
            }
        } catch (error) {
            console.error(error)
            triggerToast("Gagal menyambung ke server.")
        }
    }

    const openInfoModal = (tower: Tower) => {
        setNewlyAddedTower(tower)
        setIsNewTowerCorrective(tower.status === 'CORRECTIVE')
        setNewTowerCorrectivePrice(tower.hargaCorrective !== null && tower.hargaCorrective !== undefined ? tower.hargaCorrective.toString() : '')
        setIsNewTowerInfoModalOpen(true)
    }

    const handleSaveCorrective = async () => {
        if (!newlyAddedTower) return
        setIsSavingCorrective(true)
        try {
            const isCorrective = isNewTowerCorrective
            const payload = {
                ...newlyAddedTower,
                status: isCorrective ? 'CORRECTIVE' : (newlyAddedTower.status === 'CORRECTIVE' ? 'ON SITE' : newlyAddedTower.status),
                hargaCorrective: isCorrective && newTowerCorrectivePrice ? parseFloat(newTowerCorrectivePrice) : null,
                hargaBeli: newlyAddedTower.hargaBeli ? parseFloat(newlyAddedTower.hargaBeli.toString()) : null,
                hargaJual: newlyAddedTower.hargaJual ? parseFloat(newlyAddedTower.hargaJual.toString()) : null,
                hargaSewa: newlyAddedTower.hargaSewa ? parseFloat(newlyAddedTower.hargaSewa.toString()) : null,
            }
            const res = await fetch(`${apiUrl}/api/reto/${newlyAddedTower.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                const updatedTower = await res.json()
                setNewlyAddedTower(updatedTower)
                triggerToast(`Status corrective untuk unit "${newlyAddedTower.serialNumber}" berhasil disimpan.`)
                fetchTowers()
                setIsNewTowerInfoModalOpen(false)
            } else {
                const err = await res.json()
                triggerToast(`Gagal menyimpan status corrective: ${err.error || 'Terjadi kesalahan'}`)
            }
        } catch (error) {
            console.error(error)
            triggerToast("Gagal menyambung ke server.")
        } finally {
            setIsSavingCorrective(false)
        }
    }

    const openEditModal = (tower: Tower) => {
        setSelectedTower(tower)
        setFormData({
            ...tower,
            tanggal: tower.tanggal || (tower.createdAt ? tower.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
            hargaJual: tower.hargaJual !== null && tower.hargaJual !== undefined ? tower.hargaJual.toString() : '',
            hargaBeli: tower.hargaBeli !== null && tower.hargaBeli !== undefined ? tower.hargaBeli.toString() : '',
            hargaSewa: tower.hargaSewa !== null && tower.hargaSewa !== undefined ? tower.hargaSewa.toString() : '',
            hargaCorrective: tower.hargaCorrective !== null && tower.hargaCorrective !== undefined ? tower.hargaCorrective.toString() : ''
        })
        setIsEditModalOpen(true)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedTower) return

        try {
            const isRent = formData.rentSell === 'RENT'
            const payload = {
                ...formData,
                hargaBeli: formData.hargaBeli ? parseFloat(formData.hargaBeli.toString()) : null,
                hargaJual: !isRent && formData.hargaJual ? parseFloat(formData.hargaJual.toString()) : null,
                hargaSewa: isRent && formData.hargaSewa ? parseFloat(formData.hargaSewa.toString()) : null,
                hargaCorrective: formData.hargaCorrective ? parseFloat(formData.hargaCorrective.toString()) : null,
            }
            const res = await fetch(`${apiUrl}/api/reto/${selectedTower.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                setIsEditModalOpen(false)
                triggerToast(`Data unit "${formData.serialNumber}" berhasil diperbarui.`)
                fetchTowers()
            } else {
                const err = await res.json()
                triggerToast(`Gagal memperbarui data: ${err.error || 'Terjadi kesalahan'}`)
            }
        } catch (error) {
            console.error(error)
            triggerToast("Gagal menyambung ke server.")
        }
    }

    const openDeleteModal = (tower: Tower) => {
        setSelectedTower(tower)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedTower) return
        try {
            const res = await fetch(`${apiUrl}/api/reto/${selectedTower.id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                setIsDeleteModalOpen(false)
                triggerToast(`Unit "${selectedTower.serialNumber}" berhasil dihapus dari sistem.`)
                fetchTowers()
            } else {
                triggerToast("Gagal menghapus unit dari sistem.")
            }
        } catch (error) {
            console.error(error)
            triggerToast("Gagal menyambung ke server.")
        }
    }

    const handleExportXLSX = () => {
        const visibleCols = ALL_COLUMNS.filter(c => columnVisibility[c.key])
        const rows = processedTowers.map(t => {
            const rowData: Record<string, any> = {}
            visibleCols.forEach(c => {
                const val = t[c.key as keyof Tower]
                if (c.key.startsWith('harga') && val !== null && val !== undefined && val !== '') {
                    const numVal = Number(val)
                    rowData[c.label] = isNaN(numVal) ? val : numVal
                } else {
                    rowData[c.label] = val
                }
            })
            return rowData
        })

        const worksheet = XLSX.utils.json_to_sheet(rows)

        // 1. Calculate dynamic column widths to prevent truncation
        const max_widths = visibleCols.map(c => {
            let maxLen = c.label.length
            processedTowers.forEach(t => {
                const val = t[c.key as keyof Tower]
                if (val !== null && val !== undefined && val !== '') {
                    let strVal = String(val)
                    if (c.key.startsWith('harga')) {
                        // Format preview estimation for width: Rp 150.000.000 (14 chars)
                        const numVal = Number(val)
                        if (!isNaN(numVal)) {
                            strVal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numVal)
                        }
                    }
                    if (strVal.length > maxLen) {
                        maxLen = strVal.length
                    }
                }
            })
            return { wch: maxLen + 6 }
        })
        worksheet['!cols'] = max_widths

        // 2. Format pricing columns as numeric with Indonesian Rupiah formatting
        const pricingColIndices: number[] = []
        visibleCols.forEach((c, idx) => {
            if (c.key.startsWith('harga')) {
                pricingColIndices.push(idx)
            }
        })

        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1')
        for (let r = range.s.r + 1; r <= range.e.r; ++r) {
            pricingColIndices.forEach(colIdx => {
                const cellRef = XLSX.utils.encode_cell({ r, c: colIdx })
                const cell = worksheet[cellRef]
                if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
                    cell.t = 'n' // numeric type
                    cell.z = '"Rp"#,##0' // Currency formatting
                }
            })
        }

        // 3. Add autofilter to the table headers
        if (worksheet['!ref']) {
            worksheet['!autofilter'] = { ref: worksheet['!ref'] }
        }

        // 4. Style table headers with DEA Royal Blue background (#0052CC) and white bold text
        const totalCols = visibleCols.length
        for (let colIdx = 0; colIdx < totalCols; ++colIdx) {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx })
            const cell = worksheet[cellRef]
            if (cell) {
                cell.s = {
                    fill: {
                        patternType: 'solid',
                        fgColor: { rgb: '0052CC' } // DEA Blue Logo Color
                    },
                    font: {
                        name: 'Segoe UI',
                        sz: 10,
                        bold: true,
                        color: { rgb: 'FFFFFF' } // White Text
                    },
                    alignment: {
                        vertical: 'center',
                        horizontal: 'center',
                        wrapText: true
                    },
                    border: {
                        bottom: { style: 'medium', color: { rgb: '003399' } },
                        top: { style: 'thin', color: { rgb: 'CCCCCC' } },
                        left: { style: 'thin', color: { rgb: 'CCCCCC' } },
                        right: { style: 'thin', color: { rgb: 'CCCCCC' } }
                    }
                }
            }
        }

        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory")

        XLSX.writeFile(workbook, `DEA_Tower_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`)
        triggerToast("Data tabel berhasil diekspor ke file Excel (XLSX).")
    }

    const hiddenColumnsCount = Object.values(columnVisibility).filter(v => !v).length

    return (
        <div className="flex flex-col flex-1 w-full min-w-0 max-w-full overflow-x-hidden space-y-6 p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Toast Alert */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-900/95 dark:bg-neutral-950/95 text-white py-3 px-5 rounded-xl border border-neutral-800 dark:border-neutral-900 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-md">
                    <Info className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-semibold">{toastMessage}</span>
                    <button onClick={() => setToastMessage(null)} className="ml-auto hover:text-red-400 p-0.5 rounded-lg">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                        Removable Tower
                        <span className="text-xs font-semibold bg-primary/15 text-primary px-2.5 py-0.5 rounded-full">Inventory</span>
                    </h1>
                </div>

                <div className="flex gap-2 shrink-0">
                    <Button
                        onClick={openAddModal}
                        className="bg-primary hover:bg-primary/95 text-white h-10 px-4 rounded-xl shadow-xs transition-all text-xs font-bold flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Aset
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExportXLSX}
                        className="h-10 px-4 rounded-xl text-xs font-bold border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Ekspor XLSX
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">

                <Card className="border border-neutral-200/60 dark:border-neutral-800/60 bg-gradient-to-br from-violet-50/50 to-white dark:from-violet-950/10 dark:to-neutral-900 shadow-sm transition-all hover:scale-[1.01]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Total Unit</p>
                        <div className="p-1.5 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-lg">
                            <Radio className="h-4.5 w-4.5 animate-pulse" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">{stats.total}</div>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Aset unit terdaftar di database</p>
                    </CardContent>
                </Card>

                <Card className="border border-neutral-200/60 dark:border-neutral-800/60 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/10 dark:to-neutral-900 shadow-sm transition-all hover:scale-[1.01]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Unit On Site</p>
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <CheckCircle2 className="h-4.5 w-4.5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.onSite}</div>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                            {stats.total > 0 ? Math.round((stats.onSite / stats.total) * 100) : 0}% terpasang di lapangan
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-neutral-200/60 dark:border-neutral-800/60 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/10 dark:to-neutral-900 shadow-sm transition-all hover:scale-[1.01]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">WH DEA</p>
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Building2 className="h-4.5 w-4.5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{stats.whDea}</div>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Stok unit tersedia di gudang</p>
                    </CardContent>
                </Card>

                <Card className="border border-neutral-200/60 dark:border-neutral-800/60 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/10 dark:to-neutral-900 shadow-sm transition-all hover:scale-[1.01]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Corrective</p>
                        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg">
                            <Activity className="h-4.5 w-4.5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{stats.corrective}</div>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Unit dalam perawatan/perbaikan</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-2">
                <button
                    onClick={() => setActiveTab('ALL')}
                    className={`pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${activeTab === 'ALL'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                        }`}
                >
                    Semua Tower
                </button>
                <button
                    onClick={() => setActiveTab('CORRECTIVE')}
                    className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${activeTab === 'CORRECTIVE'
                        ? 'text-amber-600 border-b-2 border-amber-600 dark:text-amber-500 dark:border-amber-500'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                        }`}
                >
                    <Activity className="w-3.5 h-3.5 text-amber-500" />
                    Corrective Tower
                    {stats.corrective > 0 && (
                        <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ml-1">
                            {stats.corrective}
                        </span>
                    )}
                </button>
            </div>

            {/* Toolbar & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-neutral-900/40 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                    {/* Search bar */}
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            type="text"
                            placeholder="Cari serial, site, regional..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 text-xs rounded-xl bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Position Filter */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 px-3 h-10 text-xs">
                        <span className="text-neutral-400 font-medium">Position:</span>
                        <select
                            value={positionFilter}
                            onChange={(e) => setPositionFilter(e.target.value)}
                            className="font-semibold bg-transparent border-0 focus:ring-0 outline-hidden cursor-pointer text-neutral-700 dark:text-neutral-300 pr-1 py-0"
                        >
                            <option value="All" className="bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200">Semua</option>
                            <option value="ON SITE" className="bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200">ON SITE</option>
                            <option value="WH DEA" className="bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200">WH DEA</option>
                        </select>
                    </div>

                    {/* Rent/Sell Filter */}
                    <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 px-3 h-10 text-xs">
                        <span className="text-neutral-400 font-medium">Rent/Sell:</span>
                        <select
                            value={rentSellFilter}
                            onChange={(e) => setRentSellFilter(e.target.value)}
                            className="font-semibold bg-transparent border-0 focus:ring-0 outline-hidden cursor-pointer text-neutral-700 dark:text-neutral-300 pr-1 py-0"
                        >
                            <option value="All" className="bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200">Semua</option>
                            <option value="RENT" className="bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200">RENT</option>
                            <option value="SELL" className="bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200">SELL</option>
                        </select>
                    </div>
                </div>

                {/* Column Manager */}
                <div className="relative flex items-center gap-2 self-end md:self-auto">
                    {hiddenColumnsCount > 0 && (
                        <Button
                            variant="link"
                            onClick={restoreAllColumns}
                            className="text-xs font-bold text-primary hover:text-primary/80 h-9 p-0"
                        >
                            Tampilkan Semua ({hiddenColumnsCount})
                        </Button>
                    )}

                    <div className="relative">
                        <Button
                            variant="outline"
                            onClick={() => setShowManageCols(!showManageCols)}
                            className={`h-10 px-4 rounded-xl text-xs font-bold border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5 transition-all ${showManageCols ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-white dark:bg-neutral-950'
                                }`}
                        >
                            <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
                            Kelola Kolom
                        </Button>

                        {showManageCols && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowManageCols(false)} />
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-950 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-3.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800">
                                        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Tampilkan Kolom</span>
                                        <button onClick={restoreAllColumns} className="text-[10px] font-bold text-primary hover:underline">Reset</button>
                                    </div>
                                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                        {ALL_COLUMNS.map(col => (
                                            <label
                                                key={col.key}
                                                className="flex items-center gap-2.5 px-1.5 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-md cursor-pointer text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={columnVisibility[col.key]}
                                                    onChange={() => toggleColumn(col.key)}
                                                    className="w-4 h-4 accent-primary rounded-sm border-neutral-300 dark:border-neutral-700"
                                                />
                                                {col.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Simplified Custom Table - Styling Matches Other App Pages (Mitra Page) */}
            <div className="w-full min-w-0 overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950">
                <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-[1400px] border-collapse table-auto text-xs text-left">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/10">

                                {/* Clean, standard table headers */}
                                {ALL_COLUMNS.map(col => columnVisibility[col.key] && (
                                    <th
                                        key={col.key}
                                        style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? col.width : undefined }}
                                        className="p-3 text-neutral-500 dark:text-neutral-400 align-middle uppercase text-[10px] tracking-wider relative group select-none font-bold whitespace-nowrap"
                                    >
                                        <div className="flex items-center justify-between gap-1">

                                            {/* Column Sorting */}
                                            <button
                                                onClick={() => handleSort(col.key as keyof Tower)}
                                                className="flex items-center gap-1 hover:text-neutral-800 dark:hover:text-white transition-colors font-bold text-left shrink-0 max-w-[85%]"
                                            >
                                                <span className="truncate">{col.label}</span>
                                                <ChevronsUpDown className={`w-3.5 h-3.5 transition-opacity shrink-0 ${sortConfig?.key === col.key ? 'opacity-100 text-primary' : 'opacity-40 group-hover:opacity-100'
                                                    }`} />
                                            </button>

                                            {/* Header close X button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeColumn(col.key)
                                                }}
                                                title="Sembunyikan Kolom"
                                                className="opacity-0 group-hover:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500 p-0.5 rounded transition-all"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>

                                        </div>
                                    </th>
                                ))}

                                {/* Actions Header */}
                                <th
                                    style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? '6%' : undefined }}
                                    className="p-3 align-middle text-center uppercase text-[10px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 whitespace-nowrap"
                                >
                                    Aksi
                                </th>

                            </tr>
                        </thead>

                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {paginatedTowers.length > 0 ? (
                                paginatedTowers.map((tower) => (
                                    <tr
                                        key={tower.id}
                                        className="bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/40 transition-colors border-b"
                                    >
                                        {columnVisibility.tanggal && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                                {tower.tanggal ? new Date(tower.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </td>
                                        )}
                                        {columnVisibility.owner && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal font-semibold">
                                                {tower.owner}
                                            </td>
                                        )}
                                        {columnVisibility.typeUnit && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal font-medium text-neutral-700 dark:text-neutral-300">
                                                {tower.typeUnit}
                                            </td>
                                        )}
                                        {columnVisibility.serialNumber && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal font-mono font-semibold text-neutral-900 dark:text-white">
                                                {tower.serialNumber}
                                            </td>
                                        )}
                                        {columnVisibility.snDea && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal font-mono text-neutral-600 dark:text-neutral-400">
                                                {tower.snDea}
                                            </td>
                                        )}
                                        {columnVisibility.unitFrom && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal text-neutral-600 dark:text-neutral-400">
                                                {tower.unitFrom}
                                            </td>
                                        )}
                                        {columnVisibility.regional && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal uppercase font-semibold text-neutral-700 dark:text-neutral-300">
                                                {tower.regional}
                                            </td>
                                        )}
                                        {columnVisibility.site && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal text-neutral-600 dark:text-neutral-400">
                                                {tower.site}
                                            </td>
                                        )}
                                        {columnVisibility.position && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal uppercase font-bold text-neutral-950 dark:text-white">
                                                {tower.position}
                                            </td>
                                        )}
                                        {columnVisibility.customer && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal uppercase text-neutral-700 dark:text-neutral-300">
                                                {tower.customer}
                                            </td>
                                        )}
                                        {columnVisibility.status && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal uppercase font-semibold">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${tower.status === 'ON SITE'
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300'
                                                    : tower.status === 'CORRECTIVE'
                                                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300'
                                                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300'
                                                    }`}>
                                                    {tower.status}
                                                </span>
                                            </td>
                                        )}
                                        {columnVisibility.rentSell && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal uppercase font-bold text-center">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${tower.rentSell === 'RENT'
                                                    ? 'bg-blue-100/60 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                                    : 'bg-indigo-100/60 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300'
                                                    }`}>
                                                    {tower.rentSell}
                                                </span>
                                            </td>
                                        )}
                                        {columnVisibility.hargaBeli && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal text-neutral-600 dark:text-neutral-400">
                                                {formatCurrency(tower.hargaBeli)}
                                            </td>
                                        )}
                                        {columnVisibility.hargaJual && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal text-neutral-600 dark:text-neutral-400">
                                                {formatCurrency(tower.hargaJual)}
                                            </td>
                                        )}
                                        {columnVisibility.hargaSewa && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal text-neutral-600 dark:text-neutral-400">
                                                {formatCurrency(tower.hargaSewa)}
                                            </td>
                                        )}
                                        {columnVisibility.hargaCorrective && (
                                            <td className="p-3 align-middle text-[11px] leading-tight break-words whitespace-normal text-neutral-600 dark:text-neutral-400">
                                                {formatCurrency(tower.hargaCorrective)}
                                            </td>
                                        )}

                                        {/* Actions cell */}
                                        <td className="p-3 align-middle text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openInfoModal(tower)}
                                                    title="Lihat Informasi Lengkap"
                                                    className="h-7 w-7 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                >
                                                    <Info className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditModal(tower)}
                                                    title="Ubah Aset"
                                                    className="h-7 w-7 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openDeleteModal(tower)}
                                                    title="Hapus Aset"
                                                    className="h-7 w-7 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={Object.values(columnVisibility).filter(Boolean).length + 1} className="h-28 text-center text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-950">
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <AlertTriangle className="w-5 h-5 text-neutral-300 dark:text-neutral-700" />
                                            <span className="text-xs">Tidak ada data unit yang sesuai filter pencarian Anda.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>

                {/* Table Footer with Pagination */}
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Page Size Selector */}
                        <div className="flex items-center gap-1.5">
                            <span>Baris per halaman:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value))
                                    setCurrentPage(1)
                                }}
                                className="h-8 px-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-primary text-neutral-700 dark:text-neutral-300 cursor-pointer"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                            </select>
                        </div>

                        <div>
                            Menampilkan <span className="font-semibold text-neutral-800 dark:text-neutral-200">{totalData > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> sampai <span className="font-semibold text-neutral-800 dark:text-neutral-200">{Math.min(currentPage * pageSize, totalData)}</span> dari <span className="font-semibold text-neutral-800 dark:text-neutral-200">{totalData}</span> unit ({hiddenColumnsCount > 0 ? `${hiddenColumnsCount} kolom disembunyikan` : 'Semua kolom ditampilkan'})
                        </div>
                    </div>

                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || totalPages === 0}
                            className="h-8 rounded-lg text-xs font-bold border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                        >
                            Sebelumnya
                        </Button>
                        <span className="px-2 font-medium text-neutral-700 dark:text-neutral-300">
                            Halaman {currentPage} dari {totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="h-8 rounded-lg text-xs font-bold border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            </div>

            {/* ========================================================
          CRUD MODALS
          ======================================================== */}

            {/* 1. ADD TOWER MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-neutral-950/65 backdrop-blur-xs animate-in fade-in duration-200" onClick={() => setIsAddModalOpen(false)} />

                    <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-250">
                        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Tambah Unit Tower</h3>
                                <p className="text-xs text-neutral-500">Penambahan data tower.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">TANGGAL</label>
                                        <Input
                                            type="date"
                                            disabled
                                            className="bg-neutral-50 dark:bg-neutral-900 cursor-not-allowed"
                                            value={formData.tanggal || ''}
                                            onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">OWNER</label>
                                        <Input
                                            type="text"
                                            required
                                            placeholder=""
                                            value={formData.owner}
                                            onChange={e => setFormData({ ...formData, owner: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">TYPE UNIT</label>
                                    <Input
                                        type="text"
                                        required
                                        placeholder=""
                                        value={formData.typeUnit}
                                        onChange={e => setFormData({ ...formData, typeUnit: e.target.value })}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">SERIAL NUMBER</label>
                                        <Input
                                            type="text"
                                            required
                                            placeholder=""
                                            value={formData.serialNumber}
                                            onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">SN DEA</label>
                                        <Input
                                            type="text"
                                            required
                                            placeholder=""
                                            value={formData.snDea}
                                            onChange={e => setFormData({ ...formData, snDea: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">UNIT FROM SITE/WH</label>
                                        <Input
                                            type="text"
                                            required
                                            placeholder=""
                                            value={formData.unitFrom}
                                            onChange={e => setFormData({ ...formData, unitFrom: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">REGIONAL</label>
                                        <Input
                                            type="text"
                                            required
                                            placeholder=""
                                            value={formData.regional}
                                            onChange={e => setFormData({ ...formData, regional: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">SITE</label>
                                    <Input
                                        type="text"
                                        required
                                        placeholder=""
                                        value={formData.site}
                                        onChange={e => setFormData({ ...formData, site: e.target.value })}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">POSITION</label>
                                        <select
                                            value={formData.position}
                                            onChange={e => setFormData({ ...formData, position: e.target.value })}
                                            className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer text-neutral-800 dark:text-neutral-200"
                                        >
                                            <option value="ON SITE">ON SITE</option>
                                            <option value="WH DEA">WH DEA</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">CUSTOMER</label>
                                        <Input
                                            type="text"
                                            required
                                            placeholder=""
                                            value={formData.customer}
                                            onChange={e => setFormData({ ...formData, customer: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">STATUS</label>
                                        <Input
                                            type="text"
                                            required
                                            placeholder=""
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">RENT / SELL</label>
                                        <select
                                            value={formData.rentSell}
                                            onChange={e => setFormData({ ...formData, rentSell: e.target.value as any })}
                                            className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer text-neutral-800 dark:text-neutral-200"
                                        >
                                            <option value="RENT">RENT</option>
                                            <option value="SELL">SELL</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">HARGA BELI</label>
                                        <div className='flex items-center gap-2'>
                                            <p className="text-neutral-500">Rp</p>
                                            <Input
                                                type="number"
                                                placeholder=""
                                                value={formData.hargaBeli}
                                                onChange={e => setFormData({ ...formData, hargaBeli: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    {formData.rentSell === 'SELL' && (
                                        <div className="space-y-1.5 animate-in fade-in duration-200">
                                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">HARGA JUAL</label>
                                            <div className='flex items-center gap-2'>
                                                <p className="text-neutral-500">Rp</p>
                                                <Input
                                                    type="number"
                                                    placeholder=""
                                                    value={formData.hargaJual}
                                                    onChange={e => setFormData({ ...formData, hargaJual: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {formData.rentSell === 'RENT' && (
                                        <div className="space-y-1.5 animate-in fade-in duration-200">
                                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">HARGA SEWA</label>
                                            <div className='flex items-center gap-2'>
                                                <p className="text-neutral-500">Rp</p>
                                                <Input
                                                    type="number"
                                                    placeholder=""
                                                    value={formData.hargaSewa}
                                                    onChange={e => setFormData({ ...formData, hargaSewa: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 shrink-0">
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl h-9 text-xs">
                                    Batal
                                </Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/95 text-white rounded-xl h-9 px-5 font-semibold text-xs">
                                    Simpan Unit
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. EDIT TOWER MODAL */}
            {isEditModalOpen && selectedTower && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-neutral-950/65 backdrop-blur-xs animate-in fade-in duration-200" onClick={() => setIsEditModalOpen(false)} />

                    <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-250">
                        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Ubah Data Unit</h3>
                                <p className="text-xs text-neutral-500 font-mono text-primary font-semibold">ID: {typeof selectedTower.id === 'number' ? `TOW-${String(selectedTower.id).padStart(3, '0')}` : selectedTower.id}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">TANGGAL</label>
                                        <Input
                                            type="date"
                                            disabled
                                            className="bg-neutral-50 dark:bg-neutral-900 cursor-not-allowed"
                                            value={formData.tanggal || ''}
                                            onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">OWNER</label>
                                        <Input
                                            type="text"
                                            required
                                            value={formData.owner}
                                            onChange={e => setFormData({ ...formData, owner: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">TYPE UNIT</label>
                                    <Input
                                        type="text"
                                        required
                                        value={formData.typeUnit}
                                        onChange={e => setFormData({ ...formData, typeUnit: e.target.value })}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">SERIAL NUMBER</label>
                                        <Input
                                            type="text"
                                            required
                                            value={formData.serialNumber}
                                            onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">SN DEA</label>
                                        <Input
                                            type="text"
                                            required
                                            value={formData.snDea}
                                            onChange={e => setFormData({ ...formData, snDea: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">UNIT FROM SITE/WH</label>
                                        <Input
                                            type="text"
                                            required
                                            value={formData.unitFrom}
                                            onChange={e => setFormData({ ...formData, unitFrom: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">REGIONAL</label>
                                        <Input
                                            type="text"
                                            required
                                            value={formData.regional}
                                            onChange={e => setFormData({ ...formData, regional: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">SITE</label>
                                    <Input
                                        type="text"
                                        required
                                        value={formData.site}
                                        onChange={e => setFormData({ ...formData, site: e.target.value })}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">POSITION</label>
                                        <select
                                            value={formData.position}
                                            onChange={e => setFormData({ ...formData, position: e.target.value })}
                                            className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer text-neutral-800 dark:text-neutral-200"
                                        >
                                            <option value="ON SITE">ON SITE</option>
                                            <option value="WH DEA">WH DEA</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">CUSTOMER</label>
                                        <Input
                                            type="text"
                                            required
                                            value={formData.customer}
                                            onChange={e => setFormData({ ...formData, customer: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">STATUS</label>
                                        <Input
                                            type="text"
                                            required
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">RENT / SELL</label>
                                        <select
                                            value={formData.rentSell}
                                            onChange={e => setFormData({ ...formData, rentSell: e.target.value as any })}
                                            className="w-full h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer text-neutral-800 dark:text-neutral-200"
                                        >
                                            <option value="RENT">RENT</option>
                                            <option value="SELL">SELL</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">HARGA BELI</label>
                                        <Input
                                            type="number"
                                            placeholder="Contoh: 120000000"
                                            value={formData.hargaBeli}
                                            onChange={e => setFormData({ ...formData, hargaBeli: e.target.value })}
                                        />
                                    </div>
                                    {formData.rentSell === 'SELL' && (
                                        <div className="space-y-1.5 animate-in fade-in duration-200">
                                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">HARGA JUAL</label>
                                            <Input
                                                type="number"
                                                placeholder="Contoh: 150000000"
                                                value={formData.hargaJual}
                                                onChange={e => setFormData({ ...formData, hargaJual: e.target.value })}
                                            />
                                        </div>
                                    )}
                                    {formData.rentSell === 'RENT' && (
                                        <div className="space-y-1.5 animate-in fade-in duration-200">
                                            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">HARGA SEWA</label>
                                            <Input
                                                type="number"
                                                placeholder="Contoh: 1000000"
                                                value={formData.hargaSewa}
                                                onChange={e => setFormData({ ...formData, hargaSewa: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">HARGA CORRECTIVE</label>
                                    <Input
                                        type="number"
                                        placeholder="Contoh: 500000"
                                        value={formData.hargaCorrective}
                                        onChange={e => setFormData({ ...formData, hargaCorrective: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 shrink-0">
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-xl h-9 text-xs">
                                    Batal
                                </Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/95 text-white rounded-xl h-9 px-5 font-semibold text-xs">
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. DELETE CONFIRMATION MODAL */}
            {isDeleteModalOpen && selectedTower && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-neutral-950/65 backdrop-blur-xs animate-in fade-in duration-200" onClick={() => setIsDeleteModalOpen(false)} />

                    <div className="relative w-full max-w-md bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-250">
                        <div className="p-6">
                            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
                                <div className="bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-150">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-bold">Hapus Unit Tower?</h3>
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-5">
                                Apakah Anda yakin ingin menghapus data unit serial number <span className="font-semibold text-neutral-800 dark:text-neutral-200">{selectedTower.serialNumber}</span>? Tindakan ini tidak dapat dibatalkan.
                            </p>

                            <div className="flex justify-end gap-2.5">
                                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl h-9 text-xs font-semibold border-neutral-200 dark:border-neutral-800">
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleDeleteConfirm}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-9 px-4 font-semibold text-xs"
                                >
                                    Hapus Unit
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. NEW TOWER INFO & CORRECTIVE MODAL */}
            {isNewTowerInfoModalOpen && newlyAddedTower && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-neutral-950/65 backdrop-blur-xs animate-in fade-in duration-200" onClick={() => setIsNewTowerInfoModalOpen(false)} />

                    <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-250">
                        {/* Header with clean Neutral/Blue info banner */}
                        <div className="flex items-center gap-4 p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 shrink-0">
                            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                <Info className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Detail Informasi Unit Tower</h3>
                                <p className="text-xs text-neutral-500">Berikut adalah rincian informasi lengkap unit tower.</p>
                            </div>
                            <button onClick={() => setIsNewTowerInfoModalOpen(false)} className="ml-auto text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {/* Tower details grid */}
                            <div className="bg-neutral-50/50 dark:bg-neutral-900/10 rounded-xl p-4 border border-neutral-150 dark:border-neutral-900 space-y-3">
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Serial Number</p>
                                        <p className="font-mono font-bold text-neutral-900 dark:text-white mt-0.5">{newlyAddedTower.serialNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">SN DEA</p>
                                        <p className="font-mono text-neutral-700 dark:text-neutral-300 mt-0.5">{newlyAddedTower.snDea || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Owner / Type Unit</p>
                                        <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">{newlyAddedTower.owner} - {newlyAddedTower.typeUnit}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Unit From Site/WH</p>
                                        <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">{newlyAddedTower.unitFrom || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Regional / Site</p>
                                        <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">{newlyAddedTower.regional} / {newlyAddedTower.site || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Rent / Sell Status</p>
                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 ${newlyAddedTower.rentSell === 'RENT'
                                            ? 'bg-blue-100/60 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                            : 'bg-indigo-100/60 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300'
                                            }`}>
                                            {newlyAddedTower.rentSell}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Harga Beli</p>
                                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">{formatCurrency(newlyAddedTower.hargaBeli)}</p>
                                    </div>
                                    <div>
                                        {newlyAddedTower.rentSell === 'SELL' ? (
                                            <>
                                                <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Harga Jual</p>
                                                <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">{formatCurrency(newlyAddedTower.hargaJual)}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Harga Sewa</p>
                                                <p className="font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">{formatCurrency(newlyAddedTower.hargaSewa)}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Corrective toggle option */}
                            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-neutral-900/40 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5 pr-2">
                                        <label className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 cursor-pointer select-none">
                                            <Activity className="w-4 h-4 text-amber-500" />
                                            Apakah tower ini corrective?
                                        </label>
                                        <p className="text-[10px] text-neutral-500 font-medium">Aktifkan jika unit memerlukan tindakan perbaikan segera.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isNewTowerCorrective}
                                            onChange={e => setIsNewTowerCorrective(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                                    </label>
                                </div>

                                {isNewTowerCorrective && (
                                    <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800 animate-in slide-in-from-top-2 duration-200">
                                        <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Harga Corrective</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-neutral-400">Rp</span>
                                            <Input
                                                type="number"
                                                required
                                                placeholder="Contoh: 1500000"
                                                value={newTowerCorrectivePrice}
                                                onChange={e => setNewTowerCorrectivePrice(e.target.value)}
                                                className="h-10 text-xs rounded-xl bg-white dark:bg-neutral-950 border-amber-200 dark:border-amber-900 focus-visible:ring-amber-500 focus-visible:border-amber-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* History logs section */}
                            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-neutral-900/40 space-y-3">
                                <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                                    <Activity className="w-4 h-4 text-primary" />
                                    Riwayat Aktivitas & Corrective
                                </h4>
                                <div className="overflow-x-auto max-h-56">
                                    <table className="w-full text-left text-[11px] border-collapse table-auto">
                                        <thead>
                                            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase font-bold text-neutral-400">
                                                <th className="pb-2 w-1/3">Tanggal</th>
                                                <th className="pb-2 w-2/3">Aktivitas</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                                            {(() => {
                                                let historyList: HistoryEntry[] = []
                                                if (newlyAddedTower.history) {
                                                    try {
                                                        historyList = JSON.parse(newlyAddedTower.history)
                                                    } catch (e) {
                                                        historyList = []
                                                    }
                                                }
                                                // If no history exists, we can show the createdAt date as created log
                                                if (historyList.length === 0) {
                                                    historyList = [
                                                        {
                                                            event: 'CREATED',
                                                            date: newlyAddedTower.createdAt || new Date().toISOString(),
                                                            details: 'Tower ditambahkan ke sistem'
                                                        }
                                                    ]
                                                }
                                                return historyList.map((h, i) => (
                                                    <tr key={i} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20">
                                                        <td className="py-2.5 font-medium text-neutral-500 whitespace-nowrap">
                                                            {new Date(h.date).toLocaleString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="py-2.5 text-neutral-700 dark:text-neutral-300 leading-normal">
                                                            {h.details}
                                                        </td>
                                                    </tr>
                                                ))
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsNewTowerInfoModalOpen(false)}
                                className="rounded-xl h-9 text-xs font-semibold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                disabled={isSavingCorrective || (isNewTowerCorrective && !newTowerCorrectivePrice)}
                                onClick={handleSaveCorrective}
                                className="bg-primary hover:bg-primary/95 text-white rounded-xl h-9 px-5 font-semibold text-xs transition-colors"
                            >
                                {isSavingCorrective ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}