import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Calendar, DollarSign, Package, Search, FileText, Download } from "lucide-react";
import { Sale } from "@/types/inventory";

// Mock sales data - in a real app this would come from your backend
const mockSales: Sale[] = [
  {
    id: "1",
    items: [
      { item: { id: "1", name: "Solar Panel 300W", category: "Solar Panels", brand: "SunPower", model: "SP-300M", minPrice: 250.00, maxPrice: 300.00, cost: 180.00, quantity: 50, measureType: "standard" as const, description: "High-efficiency monocrystalline solar panel", createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z" }, quantity: 2, selectedPrice: 250.00 }
    ],
    total: 500.00,
    customerName: "John Smith",
    soldBy: "Sarah Sales",
    soldAt: "2024-01-20T14:30:00Z",
    receiptNumber: "RCP-001"
  },
  {
    id: "2",
    items: [
      { item: { id: "2", name: "Battery Storage 100Ah", category: "Batteries", brand: "Tesla", model: "LFP-100", minPrice: 800.00, maxPrice: 900.00, cost: 600.00, quantity: 25, measureType: "standard" as const, description: "Lithium iron phosphate battery for solar storage", createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z" }, quantity: 1, selectedPrice: 800.00 },
      { item: { id: "3", name: "Inverter 5kW", category: "Inverters", brand: "Fronius", model: "Primo-5K", minPrice: 1200.00, maxPrice: 1400.00, cost: 900.00, quantity: 15, measureType: "standard" as const, description: "String inverter for residential solar systems", createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z" }, quantity: 1, selectedPrice: 1200.00 }
    ],
    total: 2000.00,
    customerName: "Emma Davis",
    soldBy: "Mike Merchant",
    soldAt: "2024-01-19T11:15:00Z",
    receiptNumber: "RCP-002"
  },
  {
    id: "3",
    items: [
      { item: { id: "5", name: "LED Floodlight 50W", category: "Lighting", brand: "Philips", model: "LED-50W-Solar", minPrice: 80.00, maxPrice: 95.00, cost: 55.00, quantity: 100, measureType: "standard" as const, description: "Solar-powered LED floodlight for outdoor use", createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-15T10:00:00Z" }, quantity: 5, selectedPrice: 80.00 }
    ],
    total: 400.00,
    customerName: "Carlos Rodriguez",
    soldBy: "Sarah Sales",
    soldAt: "2024-01-18T16:45:00Z",
    receiptNumber: "RCP-003"
  }
];

export function AdminSales() {
  const [sales] = useState<Sale[]>(mockSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.soldBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.items.some(item => item.item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterBy === "all") return matchesSearch;
    return matchesSearch && sale.soldBy === filterBy;
  }).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime();
    if (sortBy === "oldest") return new Date(a.soldAt).getTime() - new Date(b.soldAt).getTime();
    if (sortBy === "highest") return b.total - a.total;
    if (sortBy === "lowest") return a.total - b.total;
    return 0;
  });

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = sales.length;
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;
  const uniqueSellers = [...new Set(sales.map(sale => sale.soldBy))];

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Sales Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Add summary statistics
    doc.text('Summary', 14, 40);
    doc.text(`Total Revenue: $${totalRevenue.toLocaleString()}`, 14, 50);
    doc.text(`Total Sales: ${totalSales}`, 14, 60);
    doc.text(`Average Sale: $${averageSale.toFixed(2)}`, 14, 70);

    // Prepare table data
    const tableData = filteredSales.map(sale => [
      sale.receiptNumber,
      sale.items.map(item => `${item.quantity}x ${item.item.name} ($${item.selectedPrice.toFixed(2)} each)`).join('\n'),
      `$${sale.total.toFixed(2)}`,
      sale.customerName,
      sale.soldBy,
      new Date(sale.soldAt).toLocaleDateString(),
      'Completed'
    ]);

    // Add sales table
    autoTable(doc, {
      startY: 80,
      head: [['Receipt #', 'Items', 'Total', 'Customer', 'Sold By', 'Date', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [63, 63, 70] },
      styles: { fontSize: 10 },
      margin: { top: 80 }
    });

    // Save the PDF
    doc.save('sales-report.pdf');
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const saleDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return saleDate.toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Sales Reports
          </h1>
          <p className="text-muted-foreground mt-1">Track sales performance and revenue</p>
        </div>
        <Button className="gap-2" onClick={generatePDF}>
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              ${totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Sales</span>
            </div>
            <div className="text-2xl font-bold text-primary">{totalSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Average Sale</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              ${averageSale.toFixed(0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Items Sold</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
          <CardDescription>View and filter all sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by receipt, seller, or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by seller" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sellers</SelectItem>
                {uniqueSellers.map((seller) => (
                  <SelectItem key={seller} value={seller}>{seller}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Amount</SelectItem>
                <SelectItem value="lowest">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Sold By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.receiptNumber}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {sale.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            {item.quantity}x {item.item.name} (${item.selectedPrice.toFixed(2)} each)
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      ${sale.total.toFixed(2)}
                    </TableCell>
                    <TableCell>{sale.customerName}</TableCell>
                    <TableCell>{sale.soldBy}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{new Date(sale.soldAt).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(sale.soldAt)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No sales found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}