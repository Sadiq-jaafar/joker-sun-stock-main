import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartModal } from "@/components/inventory/CartModal";
import { ReceiptModal } from "@/components/inventory/ReceiptModal";
import { InventoryItem, CartItem, Sale } from "@/types/inventory";
import { mockInventoryItems } from "@/data/mockData";
import { Plus, Search, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InventoryPageProps {
  currentUser?: { name: string; role: string };
}

export function InventoryPage({ currentUser = { name: "Default User", role: "user" } }: InventoryPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const { toast } = useToast();

  const categories = ["all", ...new Set(mockInventoryItems.map(item => item.category))];

  const filteredItems = mockInventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: InventoryItem) => {
    const existingItem = cartItems.find(cartItem => cartItem.item.id === item.id);
    
    if (existingItem) {
      if (existingItem.quantity >= item.quantity) {
        toast({
          title: "Insufficient stock",
          description: `Only ${item.quantity} units available`,
          variant: "destructive"
        });
        return;
      }
      updateCartQuantity(item.id, existingItem.quantity + 1);
    } else {
      setCartItems([...cartItems, { item, quantity: 1 }]);
      toast({
        title: "Added to cart",
        description: `${item.name} added to cart`
      });
    }
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    const item = mockInventoryItems.find(i => i.id === itemId);
    if (item && quantity > item.quantity) {
      toast({
        title: "Insufficient stock",
        description: `Only ${item.quantity} units available`,
        variant: "destructive"
      });
      return;
    }

    setCartItems(cartItems.map(cartItem =>
      cartItem.item.id === itemId
        ? { ...cartItem, quantity }
        : cartItem
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(cartItem => cartItem.item.id !== itemId));
    toast({
      title: "Removed from cart",
      description: "Item removed from cart"
    });
  };

  const handleCheckout = (customerName: string) => {
    const total = cartItems.reduce((sum, cartItem) => sum + (cartItem.item.price * cartItem.quantity), 0);
    const receiptNumber = `JSS-${Date.now().toString().slice(-6)}`;
    
    const sale: Sale = {
      id: Date.now().toString(),
      items: [...cartItems],
      total,
      soldBy: currentUser.name,
      soldAt: new Date().toISOString(),
      receiptNumber
    };

    setCurrentSale(sale);
    setCartItems([]);
    setIsCartOpen(false);
    setIsReceiptOpen(true);

    toast({
      title: "Sale completed!",
      description: `Receipt #${receiptNumber} generated successfully`
    });
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, cartItem) => count + cartItem.quantity, 0);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Browse and purchase solar equipment</p>
        </div>
        <Button 
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Cart ({getCartItemCount()})
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="secondary">{item.category}</Badge>
                <Badge variant={item.quantity > 10 ? "default" : item.quantity > 0 ? "secondary" : "destructive"}>
                  {item.quantity} in stock
                </Badge>
              </div>
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <CardDescription>
                {item.brand} {item.model}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <p className="text-2xl font-bold text-primary mb-4">${item.price.toFixed(2)}</p>
              </div>
              <Button 
                onClick={() => addToCart(item)}
                disabled={item.quantity === 0}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {item.quantity === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        currentUser={currentUser}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={currentSale}
      />
    </div>
  );
}